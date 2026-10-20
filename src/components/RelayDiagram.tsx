import { MotionConfig, useReducedMotion } from "motion/react";
import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatedBeam } from "./magicui/animated-beam";
import "./relay-diagram.css";

const HEX = "0123456789abcdef";
const BYTES = 18;

function sealedBytes(): string {
  let out = "";
  for (let i = 0; i < BYTES; i++) {
    out +=
      HEX.charAt((Math.random() * 16) | 0) +
      HEX.charAt((Math.random() * 16) | 0) +
      (i % 6 === 5 ? "\n" : " ");
  }
  return out.trimEnd();
}

/** The same small drawing on both screens: it is one drawing. */
function Sketch(): ReactNode {
  return (
    <svg className="rd-sketch" viewBox="0 0 120 70" aria-hidden="true">
      <path
        className="rd-ink"
        d="M10 14C30 12.5 42 13 50 14.5C50.8 25 50.5 33 49.6 40C36 41.2 22 41 10.4 39.6C9.6 31 9.5 22 10 14Z"
      />
      <path className="rd-ink" d="M52 27C64 26 74 26.5 82 27.5M76 22.5L82.4 27.6L76.2 32.4" />
      <ellipse className="rd-violet" cx="99" cy="28" rx="13" ry="11" />
      <path className="rd-violet" d="M14 56C26 51 38 61 50 55S74 52 84 57" />
    </svg>
  );
}

function KeyIcon(): ReactNode {
  return (
    <svg className="rd-key-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="12" r="4.2" />
      <path d="M12.2 12H21M17.5 12V15.5M20.5 12V14.5" />
    </svg>
  );
}

interface DeviceProps {
  name: string;
  peer?: string;
}

const Device = forwardRef<HTMLDivElement, DeviceProps>(function Device({ name, peer }, ref) {
  return (
    <div ref={ref} className="rd-device">
      <span className="rd-name">{name}</span>
      <Sketch />
      {peer ? <span className="rd-peer">{peer}</span> : null}
      <span className="rd-keychip">
        <KeyIcon />
        <span>has the key</span>
      </span>
    </div>
  );
});

export default function RelayDiagram(): ReactNode {
  const box = useRef<HTMLDivElement>(null);
  const you = useRef<HTMLDivElement>(null);
  const relay = useRef<HTMLDivElement>(null);
  const ada = useRef<HTMLDivElement>(null);
  const still = useReducedMotion() ?? false;
  const [bytes, setBytes] = useState("9f 2c 71 e4 0b a8\n3d 5e c1 77 02 bb\n6a f0 18 9c 4d e2");

  useEffect(() => {
    if (still) return;
    const id = window.setInterval(() => setBytes(sealedBytes()), 650);
    return () => window.clearInterval(id);
  }, [still]);

  const beam = {
    containerRef: box,
    pathColor: "#ecebf8",
    pathOpacity: 0.16,
    pathWidth: 2.5,
    gradientStartColor: "#8f95f0",
    gradientStopColor: "#ffec99",
    duration: still ? 0 : 2.6,
    repeat: still ? 0 : Infinity,
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="rd" ref={box}>
        <Device ref={you} name="Your browser" />
        <div ref={relay} className="rd-relay">
          <span className="rd-name">The relay</span>
          <pre className="rd-bytes" aria-label="Sealed bytes the relay cannot read">
            {bytes}
          </pre>
          <span className="rd-note">sees only sealed bytes</span>
        </div>
        <Device ref={ada} name="Ada's browser" peer="Ada" />
        <AnimatedBeam
          {...beam}
          fromRef={you}
          toRef={relay}
          curvature={-34}
          endYOffset={-10}
          startYOffset={-10}
        />
        <AnimatedBeam
          {...beam}
          fromRef={relay}
          toRef={ada}
          curvature={-34}
          startYOffset={-10}
          endYOffset={-10}
          delay={1.3}
        />
        <AnimatedBeam
          {...beam}
          fromRef={ada}
          toRef={relay}
          curvature={34}
          startYOffset={10}
          endYOffset={10}
          reverse
          delay={0.6}
        />
        <AnimatedBeam
          {...beam}
          fromRef={relay}
          toRef={you}
          curvature={34}
          startYOffset={10}
          endYOffset={10}
          reverse
          delay={1.9}
        />
      </div>
    </MotionConfig>
  );
}
