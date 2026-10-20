/**
 * The Hydrawn mark, as SVG markup built at build time: a round little hydra whose three
 * heads are fountain-pen nibs, standing on the line it drew.
 *
 * One source for every size: `full` for 48 px and up, `small` for 32 px and below (no
 * line, no arms, no feet, one horn per head, thicker necks). Colours come from CSS custom
 * properties on the element the SVG sits in (`--mk-*`), so the same markup works on white
 * and on dark.
 */

interface HeadOptions {
  r: number;
  eye: number;
  pupil: number;
  nib: number;
  /** Two swept-back horns at full size; one at small sizes, where two blur into a lump. */
  horns: 1 | 2;
  /** The nib's slit and breather hole, the cheek and the eye's shine: too fine below 48 px. */
  detail: boolean;
}

/** The horns, drawn for a skull of radius 5.6 facing +x, roots hidden inside it. */
const HORN_FRONT = "M-0.9 -5.1C-0.9 -7.6 -2.3 -9.2 -4.5 -9.6C-3.7 -8.1 -3.9 -6 -3.4 -4Z";
const HORN_BACK = "M-4.6 -3.2C-5.9 -4.4 -7.6 -4.9 -9 -4.6C-7.7 -3.9 -6.7 -2.5 -5.5 -0.6Z";

/** One head facing +x, centred on the origin: horns, nib snout, skull, cheek, eye. */
function head({ r, eye, pupil, nib, horns, detail }: HeadOptions): string {
  const k = (r / 5.6).toFixed(3);
  let s = `<g transform="scale(${k})">${horns === 2 ? `<path class="fd" d="${HORN_BACK}"/>` : ""}<path class="fd" d="${HORN_FRONT}"/></g>`;
  const base = r - 3;
  s += `<path class="fi" d="M${nib} 0C${nib - 2.6} 0.9 ${nib - 5.6} 3 ${r - 0.2} 3.5L${base} 3.5L${base} -3.5L${r - 0.2} -3.5C${nib - 5.6} -3 ${nib - 2.6} -0.9 ${nib} 0Z"/>`;
  if (detail) {
    s += `<path class="sb" stroke-width="0.85" d="M${nib - 1.3} 0H${r + 2.2}"/><circle class="fb" cx="${r + 1.7}" cy="0" r="0.95"/>`;
  }
  s += `<circle class="fv" r="${r}"/>`;
  if (detail)
    s += `<ellipse class="fw" cx="${(r * 0.2).toFixed(2)}" cy="${(r * 0.42).toFixed(2)}" rx="${(r * 0.26).toFixed(2)}" ry="${(r * 0.17).toFixed(2)}"/>`;
  const ex = r * 0.3;
  const ey = -r * 0.22;
  const px = ex + eye * 0.34;
  const py = ey - eye * 0.06;
  s += `<circle class="fe" cx="${ex.toFixed(2)}" cy="${ey.toFixed(2)}" r="${eye}"/><circle class="fp" cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${pupil}"/>`;
  if (detail)
    s += `<circle class="fe" cx="${(px + pupil * 0.36).toFixed(2)}" cy="${(py - pupil * 0.4).toFixed(2)}" r="${(pupil * 0.36).toFixed(2)}"/>`;
  return s;
}

function place(
  x: number,
  y: number,
  rot: number,
  scale: number,
  mirror: boolean,
  delay: number,
  o: HeadOptions,
): string {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${mirror ? -scale : scale} ${scale})"><g class="df" style="--d:${delay}s">${head(o)}</g></g>`;
}

const NECKS = [
  "M27 44C25 37.5 19.5 33 16.5 28",
  "M32 42C32 35 32 28 32 20",
  "M37 44C39 37.5 44.5 33 47.5 28",
];
const BODY =
  '<path class="fv" d="M20.5 55C19 46 24.5 41 32 41C39.5 41 45 46 43.5 55C42.6 58.6 38 60 32 60C26 60 21.4 58.6 20.5 55Z"/>';
const HEADS: [number, number, number, boolean][] = [
  [16.5, 27.5, 20, true],
  [32, 19.5, -46, false],
  [47.5, 27.5, -14, false],
];

const necks = (width: number, start: number): string =>
  NECKS.map(
    (d, i) =>
      `<path class="sv ds" pathLength="1" style="--d:${(start + i * 0.1).toFixed(2)}s" stroke-width="${width}" d="${d}"/>`,
  ).join("");

const heads = (scale: number, start: number, o: HeadOptions): string =>
  HEADS.map(([x, y, rot, mirror], i) => place(x, y, rot, scale, mirror, start + i * 0.1, o)).join(
    "",
  );

export function markFull(): string {
  const o: HeadOptions = { r: 5.6, eye: 2.35, pupil: 1.3, nib: 12.8, horns: 2, detail: true };
  return (
    '<g transform="translate(0 -2.5)">' +
    '<path class="sv ds" pathLength="1" style="--d:.1s;--dur:.35s" stroke-width="3" d="M43.6 54C48.6 54.6 52 52 51.5 48C51.2 46 49.1 45.6 48.3 47.2"/>' +
    `<g class="df" style="--d:0s">${BODY}<ellipse class="fw" cx="32" cy="52.6" rx="7.2" ry="6"/>` +
    '<ellipse class="fv" cx="26" cy="59.8" rx="3.3" ry="1.7"/><ellipse class="fv" cx="38" cy="59.8" rx="3.3" ry="1.7"/></g>' +
    '<path class="sv ds" pathLength="1" style="--d:.15s;--dur:.3s" stroke-width="3" d="M21.6 49.5C19 50.6 17.6 52.6 18.2 55"/>' +
    '<path class="sv ds" pathLength="1" style="--d:.15s;--dur:.3s" stroke-width="3" d="M42.4 49.5C45 50.6 46.4 52.6 45.8 55"/>' +
    necks(5.2, 0.25) +
    heads(0.95, 0.6, o) +
    '<path class="si ds" pathLength="1" style="--d:1.1s;--dur:.8s" stroke-width="2.2" d="M8 62.2C12 60.8 16 60.8 20 62.2S28 63.6 32 62.2S40 60.8 44 62.2S52 63.6 56 62.2"/>' +
    "</g>"
  );
}

export function markSmall(): string {
  const o: HeadOptions = { r: 7, eye: 3, pupil: 1.7, nib: 14, horns: 1, detail: false };
  return (
    '<g transform="translate(32 33) scale(1.08) translate(-32 -33)">' +
    BODY +
    necks(7.5, 0) +
    heads(1, 0, o) +
    "</g>"
  );
}

/** A standalone SVG document with fixed colours, for the favicon. */
export function faviconSvg(): string {
  const style =
    "<style>.sv{fill:none;stroke:#6965db;stroke-linecap:round}.fv{fill:#6965db}.fi{fill:#1e1c3a}.fe{fill:#fff}.fp{fill:#1e1c3a}</style>";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${style}${markSmall()}</svg>`;
}
