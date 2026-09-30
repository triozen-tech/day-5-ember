import { Fragment } from "react";

/** Renders "*word*" as the italic copper highlight. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, i) =>
        part.startsWith("*") ? (
          <em key={i} className="highlight">
            {part.slice(1, -1)}
          </em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** A heading made of lines, each in its own mask (so lines can slide up later). */
export default function Lines({ lines, className = "", as: Tag = "h2" }: { lines: string[]; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <Tag className={`font-display ${className}`}>
      {lines.map((l, i) => (
        <span key={i} className="line-mask block overflow-hidden pb-[0.1em] -mb-[0.1em]">
          <span className="line-inner block">
            <Rich text={l} />
          </span>
        </span>
      ))}
    </Tag>
  );
}
