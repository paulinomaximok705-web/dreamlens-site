import { useEffect, useRef, useState } from "react";

const DEMO_TRANSCRIPTS = [
  "我刚醒的时候，只记得自己站在一条很长的走廊里，四周安静得有点不真实。",
  "前面有一扇没有完全关上的门，门缝里透出很淡的白光，我一直想靠近。",
  "可每走近一点，脚下就像踩在很软的水面上，整个人有一点下沉，又没有真的害怕。",
];

type VoiceStatus = "idle" | "recording" | "captured";

export default function DreamVoiceModeCard() {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const typingTimerRef = useRef<number | null>(null);
  const pauseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (status !== "recording") return;

    const nextLine = DEMO_TRANSCRIPTS[lineIndex];
    if (!nextLine) return;

    let charIndex = 0;

    const typeLine = () => {
      charIndex += 1;
      setTranscript((current) => {
        const written = nextLine.slice(0, charIndex);
        const stableLines = DEMO_TRANSCRIPTS.slice(0, lineIndex).join("\n");

        if (!stableLines) return written;
        return `${stableLines}\n${written}`;
      });

      if (charIndex < nextLine.length) {
        typingTimerRef.current = window.setTimeout(typeLine, 58);
        return;
      }

      pauseTimerRef.current = window.setTimeout(() => {
        setLineIndex((index) => Math.min(index + 1, DEMO_TRANSCRIPTS.length));
      }, 440);
    };

    typingTimerRef.current = window.setTimeout(typeLine, 260);

    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current);
    };
  }, [lineIndex, status]);

  useEffect(() => {
    if (status !== "recording") return;
    if (lineIndex >= DEMO_TRANSCRIPTS.length) {
      setStatus("captured");
    }
  }, [lineIndex, status]);

  const toggleRecording = () => {
    if (status === "idle") {
      setTranscript("");
      setLineIndex(0);
      setStatus("recording");
      return;
    }

    if (status === "recording") {
      setStatus("captured");
      return;
    }

    setTranscript("");
    setLineIndex(0);
    setStatus("idle");
  };

  const hasTranscript = Boolean(transcript.trim());

  return (
    <>
      <section className="mx-auto w-full max-w-[720px] rounded-[32px] border border-white/[0.06] bg-[radial-gradient(78%_68%_at_50%_0%,rgba(149,114,255,0.14)_0%,transparent_56%),linear-gradient(180deg,rgba(14,12,31,0.94)_0%,rgba(8,8,21,0.92)_100%)] px-5 py-6 text-white shadow-[0_28px_72px_rgba(4,5,18,0.42),inset_0_1px_0_rgba(255,255,255,0.03)] md:rounded-[36px] md:px-8 md:py-8">
        <div className="mx-auto max-w-[540px] text-center">
          <p className="font-['Noto_Serif_SC'] text-[1.08rem] font-semibold tracking-[0.02em] text-white/92 md:text-[1.18rem]">
            把还没散去的画面，慢慢说出来
          </p>
        </div>

        <div className="relative mt-7 overflow-hidden rounded-[28px] border border-white/[0.045] bg-[radial-gradient(82%_58%_at_50%_22%,rgba(168,132,255,0.08)_0%,transparent_54%),linear-gradient(180deg,rgba(13,12,31,0.7)_0%,rgba(9,8,22,0.46)_100%)] px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] md:px-7 md:py-7">
          <div className="pointer-events-none absolute inset-x-[16%] top-0 h-28 rounded-full bg-[radial-gradient(circle,rgba(195,178,255,0.12)_0%,transparent_70%)] blur-[34px]" />

          <div className="relative flex min-h-[236px] flex-col items-center justify-center text-center md:min-h-[278px]">
            {!hasTranscript ? (
              <>
                <div className="relative h-16 w-16">
                  <span className="absolute inset-0 rounded-full border border-white/[0.08]" />
                  <span className="dreamlens-voice-motion absolute inset-[9px] rounded-full border border-transparent border-t-[rgba(224,214,255,0.56)] border-r-[rgba(224,214,255,0.2)] [animation:dreamlens-voice-moon_11s_linear_infinite]" />
                  <span className="absolute inset-[18px] rounded-full bg-[radial-gradient(circle,rgba(242,238,255,0.86)_0%,rgba(192,177,255,0.22)_42%,transparent_76%)] blur-[1px]" />
                </div>

                <div className="mt-6 flex items-center gap-2 opacity-70">
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/[0.18]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/[0.46]" />
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/[0.18]" />
                </div>

                <p className="mt-6 max-w-[26rem] text-[0.92rem] leading-8 text-white/52">
                  醒来后残留的场景、声音、颜色和感受，会在这里慢慢显影。
                </p>
              </>
            ) : (
              <div className="w-full max-w-[34rem] rounded-[22px] border border-white/[0.04] bg-white/[0.025] px-5 py-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-[12px] md:px-6">
                <p className="mb-3 text-[0.72rem] uppercase tracking-[0.14em] text-white/34">
                  梦境口述片段
                </p>
                <p className="whitespace-pre-wrap text-[0.94rem] leading-8 text-white/80 [animation:dreamlens-voice-reveal_720ms_ease]">
                  {transcript}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <button
            type="button"
            onClick={toggleRecording}
            aria-pressed={status === "recording"}
            className={[
              "group relative isolate inline-flex h-[118px] w-[118px] items-center justify-center rounded-full border border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,16,39,0.62)_0%,rgba(11,10,27,0.32)_100%)] shadow-[0_20px_54px_rgba(8,9,24,0.34)] transition duration-500 ease-out",
              "hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-[0_28px_64px_rgba(10,11,28,0.38)]",
              status === "recording" ? "border-white/[0.14]" : "",
            ].join(" ")}
          >
            <span className="dreamlens-voice-motion absolute inset-[-8%] rounded-full bg-[radial-gradient(circle,rgba(175,157,255,0.18)_0%,rgba(175,157,255,0.04)_44%,transparent_76%)] blur-[24px] opacity-80 [animation:dreamlens-voice-breathe_6.2s_ease-in-out_infinite]" />
            <span className="absolute inset-[8px] rounded-full border border-white/[0.05]" />
            <span className="dreamlens-voice-motion absolute inset-[18px] rounded-full bg-[radial-gradient(circle,rgba(245,241,255,0.18)_0%,rgba(176,153,255,0.1)_36%,transparent_72%)] blur-[6px] [animation:dreamlens-voice-core_4.4s_ease-in-out_infinite]" />
            <span
              className={[
                "dreamlens-voice-motion absolute inset-[8px] rounded-full border border-white/[0.07] opacity-0",
                status === "recording"
                  ? "[animation:dreamlens-voice-ripple_2.6s_ease-out_infinite]"
                  : "group-hover:[animation:dreamlens-voice-ripple_1.8s_ease-out]",
              ].join(" ")}
            />
            <span
              className={[
                "dreamlens-voice-motion absolute inset-[-10px] rounded-full border border-white/[0.05] opacity-0",
                status === "recording" ? "[animation:dreamlens-voice-ripple_2.6s_ease-out_1.2s_infinite]" : "",
              ].join(" ")}
            />
            <span
              className={[
                "dreamlens-voice-motion absolute inset-[34px] rounded-full bg-[radial-gradient(circle,rgba(252,249,255,0.96)_0%,rgba(223,212,255,0.42)_34%,rgba(150,132,228,0.16)_58%,transparent_78%)] shadow-[0_0_22px_rgba(226,216,255,0.18),0_0_54px_rgba(116,96,196,0.18)] transition duration-500",
                status === "recording" ? "[animation:dreamlens-voice-core-recording_1.9s_ease-in-out_infinite]" : "",
              ].join(" ")}
            />
            <span className="relative z-10 text-[1.05rem] text-white/88">
              <svg
                viewBox="0 0 24 24"
                className={[
                  "h-5 w-5 fill-none stroke-current stroke-[1.7]",
                  status === "recording" ? "scale-[0.98]" : "",
                ].join(" ")}
              >
                <path d="M12 4.8a2.8 2.8 0 0 1 2.8 2.8v4.8a2.8 2.8 0 1 1-5.6 0V7.6A2.8 2.8 0 0 1 12 4.8Z" />
                <path d="M7.5 11.8a4.5 4.5 0 0 0 9 0" />
                <path d="M12 16.6v2.8" />
                <path d="M9.4 19.4h5.2" />
              </svg>
            </span>

            {status === "recording" ? (
              <span className="pointer-events-none absolute bottom-[-24px] text-[0.72rem] tracking-[0.12em] text-white/42">
                正在倾听
              </span>
            ) : null}
          </button>

          <p className="mt-9 text-[0.95rem] leading-8 text-white/72">
            轻触麦克风，让梦慢慢被听见
          </p>

          <p className="mt-3 max-w-[36rem] text-center text-[0.78rem] leading-7 text-white/42">
            自动识别停顿与断句 · 语音仅在本地处理 · 说完后自动整理片段
          </p>
        </div>
      </section>

      <style>{`
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

        @keyframes dreamlens-voice-moon {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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
          .dreamlens-voice-motion {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
