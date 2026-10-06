import { useEffect, type RefObject } from "react";

export type StagePlayback = {
  onPlay: () => void;
  onStop: () => void;
  onReduced: () => void;
};

/**
 * Follows the closest `.mg-stage` attributes so a motion-graphic component
 * can start and stop its own ticks in step with the CSS keyframes (the
 * contract in showcase.css): `onPlay` when data-playing appears, `onStop`
 * when it goes (and once on mount, so the idle frame is the start frame),
 * `onReduced` under reduced motion. Shared by every scenes/mg component.
 */
export function useStagePlayback(ref: RefObject<HTMLElement>, { onPlay, onStop, onReduced }: StagePlayback) {
  useEffect(() => {
    const stage = ref.current?.closest<HTMLElement>(".mg-stage");
    if (!stage) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let playing = false;

    const sync = () => {
      if (stage.dataset.reduced || reducedQuery.matches) {
        playing = false;
        onReduced();
        return;
      }
      const now = Boolean(stage.dataset.playing);
      if (now === playing) return;
      playing = now;
      if (now) onPlay();
      else onStop();
    };

    onStop();
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(stage, { attributes: true, attributeFilter: ["data-playing", "data-reduced"] });
    return () => {
      observer.disconnect();
      if (playing) onStop();
    };
  }, [ref, onPlay, onStop, onReduced]);
}
