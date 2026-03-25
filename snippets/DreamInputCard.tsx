import { useState, type ReactNode } from "react";

type InputMode = "text" | "voice";

type ChipOption = {
  key: string;
  label: string;
};

const EXAMPLE_DREAM =
  "我梦见自己走进一片发光的森林，树叶像玻璃一样轻轻作响。远处有一扇半开的门，门后不断传来海浪声。我想靠近，却总感觉脚下的地面在缓慢下沉。醒来时我没有特别害怕，反而有一种奇怪的平静和迟疑。";

const VOICE_PREVIEW =
  "我先记得的是一层很薄的雾，像月光落在湖面上。有人从远处叫了我一声，但我回头时只看见一扇半开的门，门后一直传来很轻的水声。";

const LENS_OPTIONS: ChipOption[] = [
  { key: "jung", label: "荣格心理学" },
  { key: "eastern", label: "东方象征" },
  { key: "emotion", label: "情绪分析" },
  { key: "archetype", label: "原型理论" },
];

const EMOTION_OPTIONS: ChipOption[] = [
  { key: "calm", label: "安宁" },
  { key: "anxious", label: "焦虑" },
  { key: "excited", label: "兴奋" },
  { key: "sad", label: "悲伤" },
  { key: "confused", label: "困惑" },
  { key: "fear", label: "恐惧" },
  { key: "relief", label: "释然" },
  { key: "tired", label: "疲惫" },
];

const TYPE = {
  h1: "font-['Noto_Serif_SC'] text-[clamp(1.9rem,3vw,2.3rem)] font-semibold tracking-[-0.02em] text-[rgba(246,241,255,0.97)]",
  h2: "font-['Noto_Serif_SC'] text-[1.16rem] font-semibold tracking-[0.01em] text-[rgba(242,236,255,0.92)] md:text-[1.22rem]",
  h3: "text-[0.82rem] font-semibold tracking-[0.08em] text-[rgba(224,218,247,0.82)]",
  bodyL: "text-[0.95rem] leading-[1.95] text-[rgba(198,191,224,0.72)] md:text-[0.98rem]",
  bodyM: "text-[0.84rem] leading-[1.82] text-[rgba(162,156,190,0.58)]",
  meta: "text-[0.77rem] leading-[1.78] text-[rgba(137,132,166,0.46)]",
  label: "text-[0.79rem] font-medium tracking-[0.02em]",
};

const SURFACE = {
  page:
    "relative overflow-hidden rounded-[36px] border border-white/[0.07] bg-[radial-gradient(78%_56%_at_50%_0%,rgba(149,116,255,0.15)_0%,transparent_54%),linear-gradient(180deg,rgba(14,12,32,0.96)_0%,rgba(8,8,22,0.94)_100%)] px-5 py-6 shadow-[0_34px_100px_rgba(4,5,18,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] md:px-10 md:py-10",
  stage:
    "rounded-[30px] border border-white/[0.045] bg-[linear-gradient(180deg,rgba(11,10,27,0.8)_0%,rgba(8,8,20,0.7)_100%)] p-3 shadow-[0_18px_48px_rgba(4,5,18,0.28),inset_0_1px_0_rgba(255,255,255,0.02)] md:p-4",
  support:
    "rounded-[28px] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(12,11,29,0.58)_0%,rgba(8,8,21,0.38)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.018)] md:px-7 md:py-6",
  field:
    "relative overflow-hidden rounded-[28px] border border-white/[0.05] bg-[radial-gradient(92%_58%_at_50%_0%,rgba(154,120,255,0.07)_0%,transparent_54%),linear-gradient(180deg,rgba(15,13,34,0.92)_0%,rgba(10,10,25,0.88)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.025),inset_0_0_30px_rgba(139,104,255,0.04)]",
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function KeyboardGlyph({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={cn(
        "h-[13px] w-[13px] fill-none stroke-current transition duration-300 [stroke-linecap:round] [stroke-linejoin:round]",
        active ? "text-white/86" : "text-white/42",
      )}
      aria-hidden="true"
    >
      <rect x="2.6" y="4.6" width="14.8" height="10.8" rx="2.2" strokeWidth="1.4" />
      <path d="M5.4 8.2h.01M8.2 8.2h.01M11 8.2h.01M13.8 8.2h.01M5.4 10.9h.01M8.2 10.9h.01M11 10.9h.01" strokeWidth="1.7" />
      <path d="M13.2 11h1.1M5.4 13.4h6.9" strokeWidth="1.4" />
    </svg>
  );
}

function MicGlyph({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={cn(
        "h-[13px] w-[13px] fill-none stroke-current transition duration-300 [stroke-linecap:round] [stroke-linejoin:round]",
        active ? "text-white/86" : "text-white/42",
      )}
      aria-hidden="true"
    >
      <rect x="7" y="3.1" width="6" height="9.5" rx="3" strokeWidth="1.45" />
      <path d="M4.8 9.9c0 3 2.2 5.1 5.2 5.1s5.2-2.1 5.2-5.1" strokeWidth="1.45" />
      <path d="M10 15v2.1M7.2 17.1h5.6" strokeWidth="1.45" />
    </svg>
  );
}

function SegmentControl({
  mode,
  onChange,
}: {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
}) {
  return (
    <div className="relative inline-grid grid-cols-2 rounded-full border border-white/[0.08] bg-white/[0.035] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full border border-white/[0.08] bg-[linear-gradient(180deg,rgba(124,96,228,0.22)_0%,rgba(90,71,182,0.16)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_18px_rgba(60,44,132,0.14)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          mode === "voice" && "translate-x-full",
        )}
      />

      {[
        { key: "text" as const, label: "文字输入", icon: (active: boolean) => <KeyboardGlyph active={active} /> },
        { key: "voice" as const, label: "语音输入", icon: (active: boolean) => <MicGlyph active={active} /> },
      ].map((item) => {
        const active = mode === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={cn(
              "relative z-10 inline-flex min-w-[108px] items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium tracking-[0.02em] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white/82 active:scale-[0.985]",
              active ? "text-white/88" : "text-white/48 hover:bg-white/[0.025]",
            )}
          >
            {item.icon(active)}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-[420px]">
      <h3 className={TYPE.h3}>{title}</h3>
      <p className={cn("mt-2.5", TYPE.bodyM)}>{description}</p>
    </div>
  );
}

function EmotionGlyph({ tone }: { tone: string }) {
  const glyphs: Record<string, ReactNode> = {
    calm: <path d="M13.8 4.8a5.8 5.8 0 1 0 0 10.4A6.7 6.7 0 0 1 13.8 4.8Z" />,
    anxious: <path d="M2.8 11.4c1.7-3.3 3.3 3.3 5 0 1.8-3.4 3.3-3.4 5 0 1.8 3.4 3.3 3.3 4.4 0" />,
    excited: <path d="M10 3.6 11.4 8.6 16.4 10 11.4 11.4 10 16.4 8.6 11.4 3.6 10 8.6 8.6Z" />,
    sad: (
      <>
        <path d="M10 4.1c1.6 2.1 3.1 4.1 3.1 6.2a3.1 3.1 0 1 1-6.2 0c0-2.1 1.5-4.1 3.1-6.2Z" />
        <path d="M13.6 14.2c-1 .8-2.2 1.2-3.6 1.2" />
      </>
    ),
    confused: (
      <>
        <path d="M10.1 4.8c2.7 0 4.5 1.5 4.5 3.8 0 2.2-1.6 3.7-3.9 3.7-1.8 0-3.1-1-3.1-2.3 0-1.1.8-1.9 2-1.9 1 0 1.8.5 2.2 1.3" />
        <path d="M10 14.6v.2" />
      </>
    ),
    fear: (
      <>
        <path d="M4.5 5.2c2.6 1.5 2.6 8.1 0 9.6" />
        <path d="M15.5 5.2c-2.6 1.5-2.6 8.1 0 9.6" />
        <path d="M8 10h4" />
      </>
    ),
    relief: (
      <>
        <path d="M4.8 11.2c1.2 2 3 3 5.2 3s4-1 5.2-3" />
        <path d="M6.2 7.2c.9 1.3 2.2 2 3.8 2s2.9-.7 3.8-2" />
      </>
    ),
    tired: (
      <>
        <path d="M5 7.2h10" />
        <path d="M5.6 12.8c1-.9 2.4-1.4 4.4-1.4s3.4.5 4.4 1.4" />
      </>
    ),
  };

  return (
    <span className="inline-flex h-[14px] w-[14px] flex-none items-center justify-center text-[#b9b2d8]/70">
      <svg
        viewBox="0 0 20 20"
        className="h-[14px] w-[14px] fill-none stroke-current stroke-[1.55] [stroke-linecap:round] [stroke-linejoin:round]"
        aria-hidden="true"
      >
        {glyphs[tone]}
      </svg>
    </span>
  );
}

function FilterChip({
  active,
  label,
  leading,
  onClick,
}: {
  active: boolean;
  label: string;
  leading: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium tracking-[0.02em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px active:translate-y-[0.5px] active:scale-[0.985]",
        active
          ? "border-violet-300/[0.16] bg-[linear-gradient(180deg,rgba(122,96,224,0.13)_0%,rgba(88,70,174,0.08)_100%)] text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_18px_rgba(64,46,146,0.1)]"
          : "border-white/[0.05] bg-white/[0.02] text-white/52 hover:border-white/[0.08] hover:bg-white/[0.03] hover:text-white/68",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 rounded-full opacity-0 transition duration-500",
          active && "opacity-100 [background:radial-gradient(circle_at_50%_0%,rgba(208,192,255,0.14)_0%,transparent_68%)]",
        )}
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {leading}
        <span>{label}</span>
      </span>
    </button>
  );
}

function LensGlyph({ active }: { active: boolean }) {
  return (
    <span className={cn("inline-flex h-[14px] w-[14px] items-center justify-center text-white/46", active && "text-white/78")}>
      <svg
        viewBox="0 0 20 20"
        className="h-[14px] w-[14px] fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
        aria-hidden="true"
      >
        <path d="M6.2 4.8c1 1.3 2.2 2 3.8 2s2.8-.7 3.8-2" />
        <path d="M4.8 10c1.4 1.7 3.2 2.6 5.2 2.6s3.8-.9 5.2-2.6" />
        <path d="M6.2 15.2c1-.8 2.3-1.2 3.8-1.2s2.8.4 3.8 1.2" />
      </svg>
    </span>
  );
}

function EmotionChip({
  active,
  tone,
  label,
  onClick,
}: {
  active: boolean;
  tone: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <FilterChip
      active={active}
      label={label}
      leading={<EmotionGlyph tone={tone} />}
      onClick={onClick}
    />
  );
}

type DreamRevealButtonProps = {
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

function DreamLoadingGlyph({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <span aria-hidden="true" className="relative h-4 w-7">
      <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/72 blur-[0.5px] [animation:dreamlens-cta-dot_1.85s_ease-in-out_infinite]" />
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-100/86 blur-[0.8px] [animation:dreamlens-cta-dot_1.85s_ease-in-out_infinite_0.18s]" />
      <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/56 blur-[0.5px] [animation:dreamlens-cta-dot_1.85s_ease-in-out_infinite_0.36s]" />
    </span>
  );
}

export function DreamRevealButton({
  isLoading = false,
  disabled = false,
  onClick,
}: DreamRevealButtonProps) {
  return (
    <button
      type="button"
      aria-busy={isLoading}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        "group relative isolate inline-flex min-w-[234px] items-center justify-center overflow-hidden rounded-full border border-white/[0.09] px-9 py-[0.95rem] text-[0.98rem] font-semibold tracking-[0.01em] text-[rgba(244,238,255,0.92)] shadow-[0_20px_48px_rgba(36,30,84,0.24)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1.5px] hover:shadow-[0_28px_62px_rgba(48,38,110,0.3)] active:translate-y-[0.5px] active:scale-[0.992]",
        disabled && "cursor-wait",
      )}
    >
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(82%_140%_at_50%_10%,rgba(232,223,255,0.16)_0%,rgba(128,109,206,0.12)_32%,rgba(53,46,100,0.18)_64%,rgba(20,17,43,0.34)_100%),linear-gradient(180deg,rgba(38,32,80,0.94)_0%,rgba(22,18,47,0.97)_100%)]" />
      <span className="absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.018)_32%,rgba(12,11,28,0.06)_100%)]" />
      <span className="absolute inset-x-[14%] -top-[62%] h-[170%] rounded-full bg-[radial-gradient(circle,rgba(230,221,255,0.18)_0%,rgba(182,162,255,0.08)_32%,transparent_70%)] blur-2xl opacity-80 transition duration-700 group-hover:opacity-100 group-hover:scale-[1.04]" />
      <span className="absolute inset-0 rounded-full opacity-70 blur-[18px] [background:radial-gradient(circle_at_24%_52%,rgba(255,255,255,0.16)_0%,transparent_20%),radial-gradient(circle_at_72%_34%,rgba(206,190,255,0.14)_0%,transparent_24%),linear-gradient(120deg,transparent_16%,rgba(255,255,255,0.18)_40%,rgba(255,255,255,0.05)_56%,transparent_78%)] [animation:dreamlens-cta-flow_9.4s_ease-in-out_infinite]" />
      <span className="absolute inset-x-[18%] bottom-[-46%] h-full rounded-full bg-violet-300/[0.12] opacity-80 blur-[30px] transition duration-700 group-hover:opacity-100 group-hover:scale-110" />
      <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.08] opacity-0 blur-2xl transition duration-200 group-active:scale-[1.34] group-active:opacity-100" />

      <span className="relative z-10 flex items-center justify-center gap-3">
        <DreamLoadingGlyph active={isLoading} />
        <span className="font-['Noto_Serif_SC'] [animation:dreamlens-cta-fade_480ms_ease]">
          {isLoading ? "梦正在回应你" : "让梦慢慢浮现"}
        </span>
      </span>
    </button>
  );
}

function TextComposer({
  dream,
  isExampleExpanded,
  onChange,
  onToggleExample,
}: {
  dream: string;
  isExampleExpanded: boolean;
  onChange: (value: string) => void;
  onToggleExample: () => void;
}) {
  return (
    <>
      <div className={cn("px-6 py-7 md:px-8 md:py-8", SURFACE.field)}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(88%_62%_at_50%_0%,rgba(173,139,255,0.05)_0%,transparent_54%)]" />

        <div className="relative">
          <textarea
            value={dream}
            onChange={(event) => onChange(event.target.value)}
            aria-label="梦境内容"
            maxLength={2000}
            className="peer min-h-[282px] w-full resize-none bg-transparent text-[0.9rem] leading-[2] text-[rgba(243,238,255,0.9)] outline-none placeholder:text-transparent md:min-h-[338px] md:text-[0.92rem]"
            placeholder="从你记得最清晰的画面开始写"
          />

          {!dream && (
            <div className="pointer-events-none absolute inset-0">
              <p className="text-[0.9rem] font-medium leading-[2] text-[rgba(214,205,242,0.42)]">
                从你记得最清晰的画面开始写
              </p>
              <p className="mt-1 text-[0.9rem] leading-[2] text-[rgba(168,161,197,0.28)]">
                那里有什么场景、人物或物体
              </p>
              <p className="text-[0.9rem] leading-[2] text-[rgba(155,149,184,0.24)]">
                有没有特别突出的颜色、动作或声音
              </p>
              <p className="text-[0.9rem] leading-[2] text-[rgba(145,139,174,0.22)]">
                醒来时最强烈的感受是什么
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-1 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[0.72rem] font-semibold tracking-[0.08em] text-[rgba(222,216,243,0.68)]">
            {dream.length} 字
          </span>
          <span className={TYPE.meta}>建议至少 60 字，解析会更准确</span>
        </div>

        <button
          type="button"
          onClick={onToggleExample}
          className="text-left text-[0.77rem] font-medium tracking-[0.02em] text-[rgba(164,157,191,0.54)] transition-colors duration-300 hover:text-[rgba(232,225,249,0.76)]"
        >
          {isExampleExpanded ? "收起示例" : "插入示例"}
        </button>
      </div>
    </>
  );
}

function VoiceComposer({
  isListening,
  transcript,
  onToggleListening,
  onReset,
}: {
  isListening: boolean;
  transcript: string;
  onToggleListening: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className={cn("px-6 py-7 md:px-8 md:py-8", SURFACE.field)}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(74%_54%_at_50%_18%,rgba(167,135,255,0.06)_0%,transparent_56%)]" />

        {!transcript ? (
          <div className="relative flex min-h-[282px] flex-col items-center justify-center text-center md:min-h-[338px]">
            <div className="relative h-[76px] w-[76px]">
              <span className="absolute inset-0 rounded-full border border-white/[0.08]" />
              <span className="absolute inset-[10px] rounded-full border border-transparent border-t-[rgba(226,216,255,0.56)] border-r-[rgba(226,216,255,0.2)] [animation:dreamlens-voice-orbit_11s_linear_infinite]" />
              <span className="absolute inset-[22px] rounded-full bg-[radial-gradient(circle,rgba(242,238,255,0.86)_0%,rgba(192,177,255,0.2)_46%,transparent_78%)] blur-[1px]" />
            </div>

            <p className={cn("mt-6 max-w-[28rem]", TYPE.h2)}>
              把还没散去的画面，慢慢说出来
            </p>
            <p className={cn("mt-3 max-w-[24rem]", TYPE.bodyM)}>
              那些醒来后仍带着形状的片段，会在这里慢慢显影。
            </p>
          </div>
        ) : (
          <div className="relative min-h-[282px] md:min-h-[338px]">
            <p className={cn("mb-4", TYPE.bodyM)}>这段梦已经被轻轻收拢下来</p>
            <div className="rounded-[22px] border border-white/[0.045] bg-white/[0.025] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] [animation:dreamlens-voice-reveal_720ms_ease]">
              <p className="whitespace-pre-wrap text-[0.9rem] leading-[2] text-[rgba(243,238,255,0.86)]">
                {transcript}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onToggleListening}
          className="group relative flex h-[116px] w-[116px] items-center justify-center rounded-full border border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,16,39,0.62)_0%,rgba(11,10,27,0.34)_100%)] shadow-[0_20px_54px_rgba(8,9,24,0.34)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:border-white/[0.12] hover:shadow-[0_28px_64px_rgba(10,11,28,0.38)] active:translate-y-[0.5px] active:scale-[0.992]"
        >
          <span className="pointer-events-none absolute inset-[-10%] rounded-full bg-[radial-gradient(circle,rgba(175,157,255,0.18)_0%,rgba(175,157,255,0.04)_44%,transparent_76%)] opacity-80 blur-2xl [animation:dreamlens-voice-breathe_6.2s_ease-in-out_infinite]" />
          <span className="pointer-events-none absolute inset-[18px] rounded-full bg-[radial-gradient(circle,rgba(245,241,255,0.18)_0%,rgba(176,153,255,0.1)_36%,transparent_72%)] blur-[6px] [animation:dreamlens-voice-core_4.4s_ease-in-out_infinite]" />
          <span className={cn("pointer-events-none absolute inset-[8px] rounded-full border border-white/[0.06] opacity-0", isListening && "[animation:dreamlens-voice-ripple_2.6s_ease-out_infinite]")} />
          <span className={cn("pointer-events-none absolute inset-[-10px] rounded-full border border-white/[0.045] opacity-0", isListening && "[animation:dreamlens-voice-ripple_2.6s_ease-out_1.2s_infinite]")} />
          <span className={cn("pointer-events-none absolute inset-[-24px] rounded-full border border-[rgba(167,150,240,0.04)] opacity-0", isListening && "[animation:dreamlens-voice-ripple_2.6s_ease-out_1.85s_infinite]")} />
          <span
            className={cn(
              "absolute inset-[34px] rounded-full bg-[radial-gradient(circle,rgba(252,249,255,0.96)_0%,rgba(223,212,255,0.42)_34%,rgba(150,132,228,0.16)_58%,transparent_78%)] shadow-[0_0_22px_rgba(226,216,255,0.18),0_0_54px_rgba(116,96,196,0.18)] transition duration-500 group-hover:scale-[1.04]",
              isListening && "[animation:dreamlens-voice-core-recording_1.9s_ease-in-out_infinite]",
            )}
          />

          <span className="relative z-10 text-[rgba(244,241,255,0.9)]">
            <svg
              viewBox="0 0 20 20"
              className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
              aria-hidden="true"
            >
              {isListening ? (
                <rect x="6.4" y="6.4" width="7.2" height="7.2" rx="1.8" />
              ) : (
                <>
                  <rect x="7" y="3.1" width="6" height="9.5" rx="3" />
                  <path d="M4.8 9.9c0 3 2.2 5.1 5.2 5.1s5.2-2.1 5.2-5.1" />
                  <path d="M10 15v2.1M7.2 17.1h5.6" />
                </>
              )}
            </svg>
          </span>
        </button>

        <div className="flex h-6 items-end gap-[3px]" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "w-[8px] rounded-full bg-[linear-gradient(180deg,rgba(210,201,247,0.78)_0%,rgba(150,139,220,0.28)_100%)] transition-opacity duration-300",
                isListening
                  ? "opacity-70 [animation:dreamlens-voice-bars_1.4s_ease-in-out_infinite]"
                  : "h-[4px] opacity-20",
              )}
              style={
                isListening
                  ? {
                      animationDelay: `${index * 0.08}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className="text-center text-[0.94rem] leading-[1.85] text-[rgba(242,236,255,0.72)]">
          轻触麦克风，让梦慢慢被听见
        </p>
        <p className="max-w-[30rem] text-center text-[0.77rem] leading-[1.78] text-[rgba(137,132,166,0.48)]">
          自动识别停顿与断句 · 语音仅在本地处理 · 说完后自动整理片段
        </p>

        {transcript ? (
          <button
            type="button"
            onClick={onReset}
            className="pt-1 text-[0.77rem] font-medium tracking-[0.02em] text-[rgba(164,157,191,0.56)] transition-colors duration-300 hover:text-[rgba(232,225,249,0.76)]"
          >
            重新口述
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function DreamInputCard() {
  const [mode, setMode] = useState<InputMode>("text");
  const [dream, setDream] = useState("");
  const [isExampleExpanded, setIsExampleExpanded] = useState(false);
  const [activeLenses, setActiveLenses] = useState<string[]>(["jung", "eastern", "emotion"]);
  const [selectedEmotion, setSelectedEmotion] = useState("calm");
  const [isListening, setIsListening] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleExample = () => {
    setMode("text");

    if (isExampleExpanded) {
      setDream("");
      setIsExampleExpanded(false);
      return;
    }

    setDream(EXAMPLE_DREAM);
    setIsExampleExpanded(true);
  };

  const handleDreamChange = (value: string) => {
    setDream(value);

    if (isExampleExpanded && value !== EXAMPLE_DREAM) {
      setIsExampleExpanded(false);
    }
  };

  const toggleLens = (key: string) => {
    setActiveLenses((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const toggleListening = () => {
    setMode("voice");

    if (isListening) {
      setIsListening(false);
      if (!voiceDraft) {
        setVoiceDraft(VOICE_PREVIEW);
      }
      return;
    }

    setVoiceDraft("");
    setIsListening(true);
  };

  const resetVoice = () => {
    setIsListening(false);
    setVoiceDraft("");
  };

  return (
    <section className={cn("mx-auto w-full max-w-[930px] text-white", SURFACE.page)}>
      <div className="pointer-events-none absolute inset-x-[14%] -top-[9%] h-40 rounded-full bg-[radial-gradient(circle,rgba(153,120,255,0.17)_0%,rgba(153,120,255,0.04)_46%,transparent_74%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-[8%] bottom-[-14%] h-48 rounded-full bg-[radial-gradient(circle,rgba(86,108,212,0.08)_0%,transparent_70%)] blur-3xl" />

      <div className="relative z-10">
        <header className="mx-auto flex max-w-[620px] flex-col items-center text-center">
          <h1 className={TYPE.h1}>描述你的梦境</h1>
          <p className={cn("mt-3 max-w-[28rem]", TYPE.bodyL)}>
            当你醒来，从梦里最清晰的那一幕，慢慢写下
          </p>
          <div className="mt-6">
            <SegmentControl mode={mode} onChange={setMode} />
          </div>
        </header>

        <div className={cn("mt-10", SURFACE.stage)}>
          {mode === "text" ? (
            <TextComposer
              dream={dream}
              isExampleExpanded={isExampleExpanded}
              onChange={handleDreamChange}
              onToggleExample={toggleExample}
            />
          ) : (
            <VoiceComposer
              isListening={isListening}
              transcript={voiceDraft}
              onToggleListening={toggleListening}
              onReset={resetVoice}
            />
          )}
        </div>

        <div className={cn("mt-7", SURFACE.support)}>
          <section className="space-y-4">
            <SectionHeader title="解析方式" description="选择你更想靠近的解读方向" />

            <div className="flex flex-wrap gap-2.5">
              {LENS_OPTIONS.map((option) => (
                <FilterChip
                  key={option.key}
                  active={activeLenses.includes(option.key)}
                  label={option.label}
                  leading={<LensGlyph active={activeLenses.includes(option.key)} />}
                  onClick={() => toggleLens(option.key)}
                />
              ))}
            </div>
          </section>

          <div className="my-7 h-px bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" />

          <section className="space-y-4">
            <SectionHeader title="醒来的感受" description="保留醒来后仍在停留的情绪" />

            <div className="flex flex-wrap gap-2.5">
              {EMOTION_OPTIONS.map((option) => (
                <EmotionChip
                  key={option.key}
                  active={selectedEmotion === option.key}
                  tone={option.key}
                  label={option.label}
                  onClick={() => setSelectedEmotion(option.key)}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-9 flex justify-center">
          <DreamRevealButton
            isLoading={isAnalyzing}
            onClick={() => setIsAnalyzing((current) => !current)}
          />
        </div>
      </div>

      <style>{`
        @keyframes dreamlens-cta-flow {
          0%, 100% {
            transform: translate3d(-10%, 0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate3d(8%, -3%, 0) scale(1.05);
            opacity: 0.88;
          }
        }

        @keyframes dreamlens-cta-dot {
          0%, 100% {
            transform: translateY(-50%) scale(0.84);
            opacity: 0.34;
          }
          45% {
            transform: translateY(-50%) scale(1.08);
            opacity: 1;
          }
        }

        @keyframes dreamlens-cta-fade {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dreamlens-voice-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes dreamlens-voice-breathe {
          0%, 100% {
            opacity: 0.54;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.92;
            transform: scale(1.05);
          }
        }

        @keyframes dreamlens-voice-core {
          0%, 100% {
            opacity: 0.62;
            transform: scale(0.94);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }

        @keyframes dreamlens-voice-core-recording {
          0%, 100% {
            opacity: 0.82;
            transform: scale(0.96);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes dreamlens-voice-ripple {
          0% {
            opacity: 0;
            transform: scale(0.82);
          }
          24% {
            opacity: 0.22;
          }
          100% {
            opacity: 0;
            transform: scale(1.18);
          }
        }

        @keyframes dreamlens-voice-bars {
          0%, 100% {
            height: 4px;
          }
          50% {
            height: 22px;
          }
        }

        @keyframes dreamlens-voice-reveal {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}
