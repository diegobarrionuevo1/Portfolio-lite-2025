/**
 * Live demo panel: a localhost UI that triggers the REAL pipeline.
 *
 * This exists to show the system working, not a simulation of it: the run it
 * starts is the same automation/run.ts the launchd agent executes, against the
 * real feeds and the real Ghost. The panel streams the run's own log and ends
 * with a link to the draft it just created in the Ghost editor.
 *
 * Bound to 127.0.0.1 on purpose: it can start runs that write to Ghost, so it
 * must never be reachable from outside this machine.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import path from 'node:path';

const PORT = Number(process.env.PANEL_PORT ?? 4750);
const REPO = path.resolve(__dirname, '..');
const HTML = readFileSync(path.join(__dirname, 'panel.html'), 'utf8');

interface RunSummary {
  exit: number | null;
  posts: Array<{ status: string; id: string; editor: string | null }>;
}

const state = {
  running: false,
  tema: undefined as string | undefined,
  lines: [] as string[],
  exit: null as number | null,
};
const clients = new Set<ServerResponse>();

function send(res: ServerResponse, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function broadcast(event: string, data: unknown): void {
  clients.forEach((res) => send(res, event, data));
}

function summarize(): RunSummary {
  const all = state.lines.join('\n');
  const ghost = (process.env.GHOST_URL ?? '').trim().replace(/\/+$/, '');
  const posts = Array.from(all.matchAll(/Post creado con estado "([a-z]+)" \(id ([0-9a-f]+)\)/g)).map(
    (m) => ({
      status: m[1]!,
      id: m[2]!,
      // The editor link is the proof: the draft, open in their own Ghost.
      editor: ghost === '' ? null : `${ghost}/ghost/#/editor/post/${m[2]!}`,
    }),
  );
  return { exit: state.exit, posts };
}

function startRun(tema: string | undefined): boolean {
  if (state.running) return false;
  state.running = true;
  state.tema = tema;
  state.lines = [];
  state.exit = null;

  const args = ['--env-file-if-exists=.env.local', 'automation/run.ts'];
  if (tema !== undefined) args.push('--tema', tema);

  const child = spawn(path.join(REPO, 'node_modules', '.bin', 'tsx'), args, {
    cwd: REPO,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let buffer = '';
  const onChunk = (chunk: string): void => {
    buffer += chunk;
    let cut: number;
    while ((cut = buffer.indexOf('\n')) !== -1) {
      const text = buffer.slice(0, cut);
      buffer = buffer.slice(cut + 1);
      state.lines.push(text);
      broadcast('line', text);
    }
  };
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', onChunk);
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', onChunk);

  child.on('close', (code) => {
    if (buffer !== '') {
      state.lines.push(buffer);
      broadcast('line', buffer);
    }
    state.running = false;
    state.exit = code;
    broadcast('done', summarize());
  });

  return true;
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    // Late joiners replay the run so far; a finished run replays its summary.
    send(res, 'snapshot', { running: state.running, tema: state.tema ?? null, lines: state.lines });
    if (!state.running && state.exit !== null) send(res, 'done', summarize());
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/run') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      let tema: string | undefined;
      try {
        const parsed = body === '' ? {} : (JSON.parse(body) as { tema?: string });
        tema = typeof parsed.tema === 'string' && parsed.tema.trim() !== '' ? parsed.tema.trim() : undefined;
      } catch {
        res.writeHead(400).end('cuerpo inválido');
        return;
      }
      if (!startRun(tema)) {
        res.writeHead(409).end('ya hay una corrida en curso');
        return;
      }
      broadcast('started', { tema: tema ?? null });
      res.writeHead(202, { 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: true }));
    });
    return;
  }

  res.writeHead(404).end();
});

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`Panel del pipeline: http://127.0.0.1:${PORT}\n`);
});
