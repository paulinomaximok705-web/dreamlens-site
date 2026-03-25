import { useEffect, useState } from "react";

export const DREAM_REVEAL_STEPS = [
  { short: "收拢片段", full: "收拢梦里的片段" },
  { short: "辨认意象", full: "辨认反复出现的意象" },
  { short: "靠近情绪", full: "靠近醒来后的情绪" },
  { short: "生成回应", full: "生成属于这场梦的回应" },
];

type DreamRevealLoadingProps = {
  active?: boolean;
  phaseDuration?: number;
  onComplete?: () => void;
  className?: string;
};

export default function DreamRevealLoading({
  active = true,
  phaseDuration = 1650,
  onComplete,
  className = "",
}: DreamRevealLoadingProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (!active) {
      setPhaseIndex(0);
      setPulseKey(0);
      return;
    }

    let current = 0;
    setPhaseIndex(0);
    setPulseKey(1);

    const intervalId = window.setInterval(() => {
      current += 1;

      if (current < DREAM_REVEAL_STEPS.length) {
        setPhaseIndex(current);
        setPulseKey((value) => value + 1);
        return;
      }

      window.clearInterval(intervalId);
    }, phaseDuration);

    const completionId = window.setTimeout(() => {
      onComplete?.();
    }, phaseDuration * DREAM_REVEAL_STEPS.length + 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(completionId);
    };
  }, [active, onComplete, phaseDuration]);

  return (
    <>
      <section
        className={[
          "relative min-h-[72vh] overflow-hidden px-6 py-12 text-white md:px-8 md:py-16",
          className,
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_32%_at_50%_20%,rgba(152,126,255,0.22)_0%,rgba(152,126,255,0.06)_34%,transparent_74%),radial-gradient(34%_24%_at_50%_58%,rgba(132,116,218,0.1)_0%,rgba(132,116,218,0.03)_38%,transparent_72%),radial-gradient(42%_28%_at_50%_84%,rgba(100,126,208,0.08)_0%,rgba(100,126,208,0.02)_44%,transparent_74%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[7%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full border border-white/[0.04] opacity-40" />
        <div className="pointer-events-none absolute left-1/2 top-[1%] h-[52rem] w-[52rem] -translate-x-1/2 rounded-full border border-white/[0.024] opacity-20" />
        <div className="pointer-events-none absolute left-1/2 top-[-4%] h-[68rem] w-[68rem] -translate-x-1/2 rounded-full border border-white/[0.015] opacity-10" />
        <div className="pointer-events-none absolute left-1/2 top-[16%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(132,105,228,0.16)_0%,rgba(132,105,228,0.05)_42%,transparent_74%)] blur-[46px]" />
        <div className="pointer-events-none absolute left-1/2 top-[40%] h-[520px] w-[620px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(102,118,208,0.08)_0%,rgba(102,118,208,0.02)_46%,transparent_78%)] blur-[56px]" />

        <div className="relative mx-auto flex w-full max-w-[680px] flex-col items-center text-center">
          <div className="relative h-[176px] w-[176px] md:h-[204px] md:w-[204px]">
            <span className="dreamlens-loading-halo absolute inset-[12px] rounded-full bg-[radial-gradient(circle,rgba(187,170,255,0.14)_0%,rgba(187,170,255,0.04)_42%,transparent_74%)] blur-[26px] motion-reduce:animate-none [animation:dreamlens-loading-breathe_7.2s_ease-in-out_infinite]" />
            <span className="dreamlens-loading-halo absolute inset-[36px] rounded-full bg-[radial-gradient(circle,rgba(175,161,255,0.24)_0%,rgba(175,161,255,0.08)_36%,transparent_72%)] blur-[20px] motion-reduce:animate-none [animation:dreamlens-loading-inner-breathe_5.6s_ease-in-out_infinite]" />
            <span key={`pulse-${pulseKey}`} className="dreamlens-loading-pulse absolute inset-[34px] rounded-full border border-white/[0.08] opacity-0 motion-reduce:hidden [animation:dreamlens-loading-pulse_1.4s_ease-out]" />
            <span className="dreamlens-loading-pulse absolute inset-[42px] rounded-full border border-white/[0.07] opacity-0 motion-reduce:hidden [animation:dreamlens-loading-ripple_6.8s_ease-out_infinite]" />
            <span className="dreamlens-loading-pulse absolute inset-[42px] rounded-full border border-white/[0.06] opacity-0 motion-reduce:hidden [animation:dreamlens-loading-ripple_6.8s_ease-out_3.1s_infinite]" />

            <span className="absolute inset-0 rounded-full border border-white/[0.1]" />
            <span className="absolute inset-[16px] rounded-full border border-white/[0.07]" />
            <span className="absolute inset-[34px] rounded-full border border-white/[0.05]" />

            <span className="dreamlens-loading-ring absolute inset-[8px] rounded-full border-[1.5px] border-transparent border-r-[rgba(223,214,255,0.42)] border-t-[rgba(223,214,255,0.84)] motion-reduce:animate-none [animation:dreamlens-loading-orbit_20s_linear_infinite]" />
            <span className="dreamlens-loading-ring absolute inset-[26px] rounded-full border-[1.5px] border-transparent border-b-[rgba(150,174,234,0.36)] border-l-[rgba(191,177,244,0.28)] motion-reduce:animate-none [animation:dreamlens-loading-orbit-reverse_27s_linear_infinite]" />
            <span className="dreamlens-loading-ring absolute inset-[46px] rounded-full border-[1.5px] border-transparent border-l-[rgba(219,211,255,0.16)] border-t-[rgba(219,211,255,0.08)] opacity-70 motion-reduce:animate-none [animation:dreamlens-loading-orbit-phase_12.5s_ease-in-out_infinite]" />

            <span className="dreamlens-loading-core absolute inset-[58px] rounded-full bg-[radial-gradient(circle,rgba(246,242,255,0.18)_0%,rgba(214,200,255,0.12)_28%,rgba(122,102,205,0.08)_52%,transparent_74%)] blur-[12px] motion-reduce:animate-none [animation:dreamlens-loading-core-breathe_4.8s_ease-in-out_infinite]" />
            <span className="dreamlens-loading-core absolute inset-[78px] rounded-full bg-[radial-gradient(circle,rgba(250,247,255,0.96)_0%,rgba(233,224,255,0.58)_24%,rgba(166,145,242,0.18)_52%,transparent_74%)] shadow-[0_0_18px_rgba(242,236,255,0.28),0_0_44px_rgba(142,121,228,0.22),0_0_82px_rgba(96,78,178,0.18)] motion-reduce:animate-none [animation:dreamlens-loading-core-breathe_4.8s_ease-in-out_infinite]" />
            <span className="dreamlens-loading-core absolute inset-[94px] rounded-full bg-[#fbf9ff] shadow-[0_0_12px_rgba(255,251,255,0.8),0_0_34px_rgba(216,202,255,0.44)] motion-reduce:animate-none [animation:dreamlens-loading-core-dot_3.6s_ease-in-out_infinite]" />
          </div>

          <h1 className="mt-7 font-['Noto_Serif_SC'] text-[1.72rem] font-semibold leading-[1.22] tracking-[0.02em] text-white/95 md:mt-8 md:text-[2.54rem]">
            梦正在回应你
          </h1>
          <p className="mt-4 max-w-[31rem] text-[0.9rem] leading-[1.9] text-white/68 md:text-[0.96rem] md:leading-[1.96]">
            那些还未说出的部分，正慢慢浮现
          </p>

          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.72rem] tracking-[0.05em] md:mt-9 md:gap-x-6"
            aria-label="解析进度"
          >
            {DREAM_REVEAL_STEPS.map((step, index) => {
              const status =
                index < phaseIndex ? "done" : index === phaseIndex ? "current" : "pending";

              return (
                <div
                  key={step.short}
                  className={[
                    "inline-flex items-center gap-2.5 transition duration-700",
                    status === "done"
                      ? "text-white/76"
                      : status === "current"
                        ? "text-white/88"
                        : "text-white/26",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "dreamlens-loading-node h-1.5 w-1.5 rounded-full transition duration-700",
                      status === "done"
                        ? "bg-[#ece4ff] shadow-[0_0_10px_rgba(236,228,255,0.2)]"
                        : status === "current"
                          ? "bg-[#f7f4ff] shadow-[0_0_14px_rgba(236,228,255,0.34)] [animation:dreamlens-loading-node_1.2s_ease-out]"
                          : "bg-white/18",
                    ].join(" ")}
                  />
                  <span>{step.short}</span>
                </div>
              );
            })}
          </div>

          <div
            className="relative mt-8 h-12 w-full max-w-[420px] md:mt-10 md:h-10"
            aria-live="polite"
          >
            <span
              key={`phase-${phaseIndex}`}
              className="absolute inset-0 flex items-center justify-center text-center text-[0.86rem] leading-7 tracking-[0.03em] text-white/80 [animation:dreamlens-loading-phase_780ms_ease] md:text-[0.94rem]"
            >
              {DREAM_REVEAL_STEPS[phaseIndex].full}
            </span>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes dreamlens-loading-breathe {
          0%, 100% {
            opacity: 0.42;
            transform: scale(0.94);
          }
          50% {
            opacity: 0.88;
            transform: scale(1.06);
          }
        }

        @keyframes dreamlens-loading-inner-breathe {
          0%, 100% {
            opacity: 0.48;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.92;
            transform: scale(1.05);
          }
        }

        @keyframes dreamlens-loading-core-breathe {
          0%, 100% {
            opacity: 0.76;
            transform: scale(0.92);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes dreamlens-loading-core-dot {
          0%, 100% {
            opacity: 0.76;
            transform: scale(0.94);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes dreamlens-loading-ripple {
          0% {
            opacity: 0;
            transform: scale(0.76);
          }
          22% {
            opacity: 0.14;
          }
          100% {
            opacity: 0;
            transform: scale(1.28);
          }
        }

        @keyframes dreamlens-loading-pulse {
          0% {
            opacity: 0.02;
            transform: scale(0.82);
          }
          20% {
            opacity: 0.24;
          }
          100% {
            opacity: 0;
            transform: scale(1.34);
          }
        }

        @keyframes dreamlens-loading-orbit {
          from {
            transform: rotate(-28deg);
          }
          to {
            transform: rotate(332deg);
          }
        }

        @keyframes dreamlens-loading-orbit-reverse {
          from {
            transform: rotate(38deg);
          }
          to {
            transform: rotate(-322deg);
          }
        }

        @keyframes dreamlens-loading-orbit-phase {
          0%, 100% {
            opacity: 0.18;
            transform: rotate(24deg);
          }
          50% {
            opacity: 0.72;
            transform: rotate(68deg);
          }
        }

        @keyframes dreamlens-loading-node {
          0% {
            transform: scale(0.72);
            opacity: 0.4;
          }
          45% {
            transform: scale(1.35);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes dreamlens-loading-phase {
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
          .dreamlens-loading-ring,
          .dreamlens-loading-halo,
          .dreamlens-loading-core,
          .dreamlens-loading-pulse,
          .dreamlens-loading-node {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
