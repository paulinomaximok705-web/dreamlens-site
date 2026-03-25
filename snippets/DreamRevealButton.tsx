type DreamRevealButtonProps = {
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

function DreamLoadingGlyph() {
  return (
    <span aria-hidden="true" className="relative h-4 w-7">
      <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/70 blur-[0.4px] [animation:dreamlens-cta-dot_1.8s_ease-in-out_infinite]" />
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-100/85 blur-[0.8px] [animation:dreamlens-cta-dot_1.8s_ease-in-out_infinite_0.18s]" />
      <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/58 blur-[0.4px] [animation:dreamlens-cta-dot_1.8s_ease-in-out_infinite_0.36s]" />
    </span>
  );
}

export function DreamRevealButton({
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
}: DreamRevealButtonProps) {
  return (
    <>
      <button
        type="button"
        aria-busy={isLoading}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={[
          "group relative isolate inline-flex min-w-[220px] items-center justify-center overflow-hidden rounded-full border border-white/[0.08] px-8 py-4 text-[15px] font-medium tracking-[0.02em] text-white/92 shadow-[0_18px_42px_rgba(62,48,126,0.22)] transition duration-500 ease-out",
          "hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(70,54,138,0.28)] active:translate-y-[1px] active:scale-[0.992]",
          "disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-[0_18px_42px_rgba(62,48,126,0.22)]",
          className,
        ].join(" ")}
      >
        <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(108,92,176,0.88)_0%,rgba(90,77,154,0.94)_42%,rgba(62,58,114,0.96)_100%)]" />
        <span className="absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.018)_34%,rgba(10,9,24,0.08)_100%)]" />
        <span className="absolute inset-x-[10%] -top-[58%] h-[160%] rounded-full bg-[radial-gradient(circle,rgba(185,168,255,0.22)_0%,rgba(185,168,255,0.09)_30%,transparent_68%)] opacity-80 blur-2xl transition duration-700 group-hover:opacity-100 group-hover:scale-[1.04]" />
        <span className="absolute inset-0 rounded-full opacity-70 blur-[18px] [background:radial-gradient(circle_at_20%_48%,rgba(255,255,255,0.18)_0%,transparent_22%),radial-gradient(circle_at_72%_34%,rgba(198,181,255,0.16)_0%,transparent_26%),linear-gradient(120deg,transparent_18%,rgba(255,255,255,0.2)_42%,rgba(255,255,255,0.05)_57%,transparent_80%)] [animation:dreamlens-cta-flow_8.8s_ease-in-out_infinite]" />
        <span className="absolute inset-x-[18%] bottom-[-42%] h-full rounded-full bg-violet-300/[0.14] opacity-75 blur-[30px] transition duration-700 group-hover:opacity-100 group-hover:scale-110" />
        <span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.08] opacity-0 blur-2xl transition duration-200 group-active:scale-[1.35] group-active:opacity-100" />

        <span className="relative z-10 flex items-center justify-center gap-3">
          {isLoading ? <DreamLoadingGlyph /> : null}
          <span
            key={isLoading ? "loading" : "idle"}
            className="[animation:dreamlens-cta-fade_480ms_ease]"
          >
            {isLoading ? "梦正在回应你" : "让梦慢慢浮现"}
          </span>
        </span>
      </button>

      <style>{`
        @keyframes dreamlens-cta-flow {
          0%, 100% {
            transform: translate3d(-10%, 0, 0) scale(1);
            opacity: 0.62;
          }
          50% {
            transform: translate3d(8%, -3%, 0) scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes dreamlens-cta-dot {
          0%, 100% {
            transform: translateY(-50%) scale(0.86);
            opacity: 0.36;
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
      `}</style>
    </>
  );
}

export default DreamRevealButton;
