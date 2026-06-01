import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

// ── 示範資料（佔位用，無真實客戶資料）─────────────────────────────
export const rhodesIntroSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  completion: z.number().min(0).max(100),
  briefing: z.string(),
  projects: z.array(z.object({ name: z.string(), pct: z.number() })),
});

export type RhodesIntroProps = z.infer<typeof rhodesIntroSchema>;

// ── 設計 token（對齊總控暗色「先鋒」主題）──────────────────────────
const C = {
  bg: "#0c0e11",
  panel: "#14171c",
  line: "#2a2f37",
  cyan: "#19d1de",
  cyanDim: "rgba(25, 209, 222, 0.35)",
  text: "#e8eaed",
  textDim: "#8a919c",
  amber: "#f5a623",
};

const FONT =
  '"Noto Sans TC", "PingFang TC", "WenQuanYi Zen Hei", "Microsoft JhengHei", sans-serif';
const MONO = '"JetBrains Mono", "Courier New", monospace';

// ── 背景：暗色 + 網格 + 暈影 ─────────────────────────────────────
const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const gridOpacity = interpolate(frame, [0, 30], [0, 0.5], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          opacity: gridOpacity,
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// ── HUD 角框 ────────────────────────────────────────────────────
const HudCorners: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 25 });
  const size = 120 * len;
  const inset = 60;
  const stroke = `3px solid ${C.cyan}`;

  const corner = (style: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    width: size,
    height: size,
    opacity: 0.8,
    ...style,
  });

  return (
    <AbsoluteFill>
      <div style={corner({ top: inset, left: inset, borderTop: stroke, borderLeft: stroke })} />
      <div style={corner({ top: inset, right: inset, borderTop: stroke, borderRight: stroke })} />
      <div style={corner({ bottom: inset, left: inset, borderBottom: stroke, borderLeft: stroke })} />
      <div style={corner({ bottom: inset, right: inset, borderBottom: stroke, borderRight: stroke })} />
    </AbsoluteFill>
  );
};

// ── 標題 ─────────────────────────────────────────────────────────
const Title: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slide = spring({ frame, fps, config: { damping: 16, mass: 0.8 }, durationInFrames: 35 });
  const y = interpolate(slide, [0, 1], [60, 0]);
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  const subOpacity = interpolate(frame, [15, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // 掃描線從左到右掠過標題（掃完淡出，避免殘留）
  const sweep = interpolate(frame, [10, 50], [-10, 110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sweepOpacity = interpolate(frame, [45, 55], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `translateY(${y - 120}px)`, opacity, position: "relative" }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 130,
            fontWeight: 900,
            color: C.text,
            letterSpacing: "0.08em",
            textShadow: `0 0 40px ${C.cyanDim}`,
          }}
        >
          {title}
        </div>
        {/* 掃描光帶 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${sweep}%`,
            width: 80,
            opacity: sweepOpacity,
            background: `linear-gradient(90deg, transparent, ${C.cyanDim}, transparent)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontFamily: MONO,
            fontSize: 28,
            color: C.cyan,
            letterSpacing: "0.5em",
            marginTop: 18,
            opacity: subOpacity,
            textAlign: "center",
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── 完成度環 ─────────────────────────────────────────────────────
const CompletionRing: React.FC<{ completion: number }> = ({ completion }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 100, mass: 2 },
    durationInFrames: 70,
  });
  const pct = progress * completion;

  const R = 130;
  const CIRC = 2 * Math.PI * R;
  const appear = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: 280,
        top: 560,
        opacity: appear,
        display: "flex",
        alignItems: "center",
        gap: 50,
      }}
    >
      <svg width={320} height={320} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={160} cy={160} r={R} fill="none" stroke={C.line} strokeWidth={14} />
        <circle
          cx={160}
          cy={160}
          r={R}
          fill="none"
          stroke={C.cyan}
          strokeWidth={14}
          strokeLinecap="butt"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - pct / 100)}
          style={{ filter: `drop-shadow(0 0 12px ${C.cyanDim})` }}
        />
      </svg>
      <div style={{ position: "absolute", width: 320, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 64, fontWeight: 700, color: C.text }}>
          {Math.round(pct)}
          <span style={{ fontSize: 32, color: C.textDim }}>%</span>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 22, color: C.textDim, letterSpacing: "0.3em" }}>
          總體完成度
        </div>
      </div>
    </div>
  );
};

// ── 專案進度條 ───────────────────────────────────────────────────
const ProjectBars: React.FC<{ projects: RhodesIntroProps["projects"] }> = ({ projects }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        right: 280,
        top: 580,
        width: 560,
        display: "flex",
        flexDirection: "column",
        gap: 36,
      }}
    >
      {projects.map((p, i) => {
        const delay = i * 12;
        const grow = spring({
          frame: frame - delay,
          fps,
          config: { damping: 40 },
          durationInFrames: 50,
        });
        const opacity = interpolate(frame - delay, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div key={p.name} style={{ opacity }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: FONT,
                fontSize: 26,
                color: C.text,
                marginBottom: 10,
              }}
            >
              <span>{p.name}</span>
              <span style={{ fontFamily: MONO, color: C.cyan }}>
                {Math.round(grow * p.pct)}%
              </span>
            </div>
            <div style={{ height: 10, background: C.line, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${grow * p.pct}%`,
                  background: `linear-gradient(90deg, ${C.cyan}, ${C.cyanDim})`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── 凱爾希簡報（打字機）──────────────────────────────────────────
const Briefing: React.FC<{ briefing: string }> = ({ briefing }) => {
  const frame = useCurrentFrame();
  const chars = Math.round(
    interpolate(frame, [0, briefing.length * 1.5], [0, briefing.length], {
      extrapolateRight: "clamp",
    }),
  );
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 110,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: 30,
        color: C.amber,
        letterSpacing: "0.1em",
      }}
    >
      <span style={{ color: C.textDim, fontFamily: MONO }}>[KAL'TSIT] </span>
      {briefing.slice(0, chars)}
      <span style={{ opacity: cursorVisible ? 1 : 0, color: C.cyan }}>▌</span>
    </div>
  );
};

// ── 主合成 ───────────────────────────────────────────────────────
export const RhodesIntro: React.FC<RhodesIntroProps> = ({
  title,
  subtitle,
  completion,
  briefing,
  projects,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Sequence premountFor={fps}>
        <Background />
      </Sequence>
      <Sequence premountFor={fps}>
        <HudCorners />
      </Sequence>
      <Sequence from={Math.round(0.5 * fps)} premountFor={fps}>
        <Title title={title} subtitle={subtitle} />
      </Sequence>
      <Sequence from={2 * fps} premountFor={fps}>
        <CompletionRing completion={completion} />
      </Sequence>
      <Sequence from={Math.round(2.5 * fps)} premountFor={fps}>
        <ProjectBars projects={projects} />
      </Sequence>
      <Sequence from={4 * fps} premountFor={fps}>
        <Briefing briefing={briefing} />
      </Sequence>
    </AbsoluteFill>
  );
};
