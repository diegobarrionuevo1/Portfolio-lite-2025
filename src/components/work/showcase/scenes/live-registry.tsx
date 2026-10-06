"use client";

import type { ComponentType } from "react";
import type { Lang } from "@/lib/i18n";
import type { ShowcaseLive } from "../types";
import { Day256, IncidentLedger, InscribeStates } from "./mg/ada13";
import { ContentPipeline, HexLattice, VideoWall } from "./mg/donweb-contenidos";
import { CertTilt, FourServices, LegacyUrl } from "./mg/donweb-talleres";
import { AvailableBalance, MessageToMovement, ThreeChannels } from "./mg/finanzas-ia";
import { MenuImport, OrderCapsule, ThemeMorph } from "./mg/hermes";
import { MotionStage } from "./stage";
import { mono } from "./typography";

/**
 * Motion graphics and re-rendered components, by id. Content modules
 * reference a `live` media as `{ kind: "live", component: "<id>" }`; later
 * tasks register the component here. An unregistered id renders a labelled
 * placeholder, so content never breaks the build ahead of its graphic.
 *
 * A registered component renders inside a MotionStage and animates with CSS
 * keyframes keyed on the stage's `data-playing` / `data-reduced` attributes
 * (see the contract in showcase.css). It receives the page language only.
 */
export type LiveComponent = ComponentType<{ lang: Lang }>;

export const LIVE_COMPONENTS: Record<string, LiveComponent> = {
  "content-pipeline": ContentPipeline,
  "hex-lattice": HexLattice,
  "video-wall": VideoWall,
  "cert-tilt": CertTilt,
  "legacy-url": LegacyUrl,
  "four-services": FourServices,
  "day-256": Day256,
  "inscribe-states": InscribeStates,
  "incident-ledger": IncidentLedger,
  "theme-morph": ThemeMorph,
  "order-capsule": OrderCapsule,
  "menu-import": MenuImport,
  "message-to-movement": MessageToMovement,
  "available-balance": AvailableBalance,
  "three-channels": ThreeChannels,
};

export function LiveMedia({ media, lang }: { media: ShowcaseLive; lang: Lang }) {
  const Component = LIVE_COMPONENTS[media.component];
  return (
    <MotionStage id={media.component} aspect={media.aspect}>
      {Component ? <Component lang={lang} /> : <LivePlaceholder label={media.component} />}
    </MotionStage>
  );
}

/** Hatched like the carousel's pending slots: reads as "pending", never as a fake screenshot. */
export function LivePlaceholder({ label }: { label: string }) {
  return (
    <div className="showcase-placeholder" style={mono}>
      {label}
    </div>
  );
}
