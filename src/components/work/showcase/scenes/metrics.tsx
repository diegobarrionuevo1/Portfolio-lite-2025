import type { Lang } from "@/lib/i18n";
import type { ShowcaseMetrics as ShowcaseMetricsData } from "../types";
import { countAttrs, factLabel, kicker, mono, statValue } from "./typography";

/**
 * The numbers band: kicker, one to four big stats that count up when they
 * are plain integers (see countAttrs), a closer sentence and an optional
 * mono note for the source or date of the figures.
 */
export function ShowcaseMetrics({ metrics, lang }: { metrics: ShowcaseMetricsData; lang: Lang }) {
  return (
    <section className="showcase-metrics" lang={lang} aria-label={metrics.kicker}>
      <span data-reveal style={kicker}>
        {metrics.kicker}
      </span>

      <div className="showcase-metrics__grid" data-items={metrics.stats.length}>
        {metrics.stats.map((stat, i) => (
          <div key={stat.label} data-reveal data-delay={String((i + 1) * 70)} className="showcase-metric">
            <span data-numeric style={statValue} {...countAttrs(stat.value)}>
              {stat.value}
            </span>
            <span style={{ ...factLabel, maxWidth: "26ch" }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <p
        data-reveal
        style={{
          margin: 0,
          maxWidth: "var(--measure-lede)",
          fontSize: "var(--fs-body-lg)",
          lineHeight: "var(--lh-body)",
          letterSpacing: "var(--ls-lede)",
          color: "var(--text-secondary)",
          textWrap: "pretty",
        }}
      >
        {metrics.closer}
      </p>

      {metrics.note ? (
        <span data-reveal data-delay="70" style={{ ...mono, color: "var(--text-muted)" }}>
          {metrics.note}
        </span>
      ) : null}
    </section>
  );
}
