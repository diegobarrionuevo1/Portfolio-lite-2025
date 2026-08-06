/**
 * Contraste design-system primitives.
 * Faithful React ports of the components in _ds_bundle.js. Styling lives in
 * globals.css under @layer components (the `ct-*` classes).
 */
import * as React from "react";

type Tone =
  | "neutral"
  | "accent"
  | "flare"
  | "positive"
  | "caution"
  | "critical";

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  live = false,
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  dot?: boolean;
  live?: boolean;
}) {
  return (
    <span className={cx(`ct-badge ct-badge--${tone}`, className)} {...rest}>
      {dot || live ? (
        <span
          className={`ct-badge__dot${live ? " ct-badge__dot--live" : ""}`}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}

type ButtonVariant = "primary" | "accent" | "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  arrow?: boolean;
  fullWidth?: boolean;
  className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  arrow = false,
  fullWidth = false,
  className,
  ...rest
}: ButtonProps) {
  const cls = cx(
    "ct-btn",
    `ct-btn--${variant}`,
    size !== "md" && `ct-btn--${size}`,
    fullWidth && "ct-btn--full",
    className
  );
  const content = (
    <>
      {children}
      {arrow ? (
        <span className="ct-btn__arrow" aria-hidden="true">
          ↗
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a className={cls} href={href} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {content}
    </button>
  );
}

export function SectionLabel({
  children,
  index,
  aside,
  rule = true,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  index?: string;
  aside?: string;
  rule?: boolean;
}) {
  return (
    <div
      className={cx("ct-seclabel", !rule && "ct-seclabel--plain", className)}
      {...rest}
    >
      {index ? <span className="ct-seclabel__index">{index}</span> : null}
      <span>{children}</span>
      <span className="ct-seclabel__rule" />
      {aside ? <span className="ct-seclabel__aside">{aside}</span> : null}
    </div>
  );
}

export function Tag({
  children,
  variant = "outline",
  icon,
  href,
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  variant?: "outline" | "filled" | "accent";
  icon?: React.ReactNode;
  href?: string;
}) {
  const cls = cx("ct-tag", variant !== "outline" && `ct-tag--${variant}`, className);
  if (href) {
    return (
      <a className={cls} href={href} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {icon}
        {children}
      </a>
    );
  }
  return (
    <span className={cls} {...rest}>
      {icon}
      {children}
    </span>
  );
}

export function ScrollCue({
  children = "Scroll",
  href = "#work",
  direction = "down",
  className,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  direction?: "down" | "right";
}) {
  return (
    <a
      className={cx("ct-cue", direction === "right" && "ct-cue--horizontal", className)}
      href={href}
      {...rest}
    >
      <span>{children}</span>
      <span className="ct-cue__arrow" aria-hidden="true">
        {direction === "right" ? "→" : "↓"}
      </span>
    </a>
  );
}

export function Marquee({
  items = [],
  speed = 28,
  gap,
  separator = "—",
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  items?: string[];
  speed?: number;
  gap?: string;
  separator?: string;
}) {
  const style = {
    "--dur-marquee": `${speed}s`,
    ...(gap ? { "--gap": gap } : {}),
  } as React.CSSProperties;

  const content = items.map((it, i) => (
    <span className="ct-marquee__item" key={i}>
      <span>{it}</span>
      {separator ? (
        <span className="ct-marquee__sep" aria-hidden="true">
          {separator}
        </span>
      ) : null}
    </span>
  ));

  return (
    <div className={cx("ct-marquee", className)} style={style} {...rest}>
      <div className="ct-marquee__track">{content}</div>
      <div className="ct-marquee__track" aria-hidden="true">
        {content}
      </div>
    </div>
  );
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
