import type { ReactNode } from "react";

type ReadingClue = {
  id: string;
  name: string;
  note: string;
  glyph: ReactNode;
};

const reading = {
  label: "DREAM READING",
  title: "森林里的寻找",
  core:
    "这场梦像是在告诉你：你并不是失去了方向，而是已经走到一次转变之前，只是还没有完全承认自己想靠近什么。",
  support:
    "它没有直接给出答案，而是把你带到森林、门与海浪之间，让你先看见那种“已经感觉到了，却还没有说出口”的迟疑。",
  quote:
    "我梦见自己走进一片发光的森林，树叶像玻璃一样轻轻作响。远处有一扇半开的门，门后不断传来海浪声。我想靠近，却总感觉脚下的地面在缓慢下沉。",
  clues: [
    {
      id: "forest",
      name: "森林",
      note:
        "它不是单纯的迷路场景，更像一片还没有被理性照亮的内在区域，所以 Hero 的核心判断才会落在“转变之前的停顿”。",
    },
    {
      id: "door",
      name: "半开的门",
      note:
        "它不是关闭的阻挡，而是已经出现的入口。你其实已经看见新的可能，只是还没有决定要不要真正跨过去。",
    },
    {
      id: "tide",
      name: "海浪声",
      note:
        "画面里没有真正出现海，但声音先到达了你，说明这场梦首先在回应情绪和潜意识的牵引，而不是现实事件本身。",
    },
  ] satisfies Array<Omit<ReadingClue, "glyph">>,
  emotion: {
    dominant: "神秘中的迟疑",
    intensity: 72,
    note:
      "这种情绪往往出现在现实里已经感到变化靠近、却还没有准备好立刻行动的时候。你并不真正抗拒它，只是在确认自己要放下什么，又将靠近什么。",
  },
  response: {
    actionCue: "先写下一句：如果我真的靠近它，我最担心会发生什么？",
    action:
      "今晚不用急着跨进去。给自己留十分钟安静时间，把那扇半开的门、门后的海浪声，和你停住脚步的那一刻写成一句完整的话。只写一句也够，它会让迟疑从模糊感觉变成可以被看见的线索。",
    directionCue: "接下来，继续留意那些你明明已经听见，却还停在门外的事。",
    direction:
      "这场梦更像在提醒你：变化并不是突然降临，而是早就以细小的方式靠近了。接下来不需要逼自己马上决定，只要留意现实里哪些事像门后的声音一样反复出现，哪些靠近会让你同时感到平静和迟疑。",
  },
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const TYPE = {
  eyebrow:
    "text-[0.68rem] font-medium uppercase tracking-[0.24em] text-[rgba(193,184,226,0.56)]",
  h1: "font-['Noto_Serif_SC'] text-[clamp(2.4rem,5vw,4.3rem)] font-semibold tracking-[-0.045em] text-[rgba(248,244,255,0.98)]",
  h2: "font-['Noto_Serif_SC'] text-[1.34rem] font-semibold tracking-[0.01em] text-[rgba(243,238,255,0.94)] md:text-[1.5rem]",
  h3: "font-['Noto_Serif_SC'] text-[1.02rem] font-semibold tracking-[0.015em] text-[rgba(240,235,252,0.9)]",
  heroCore:
    "font-['Noto_Serif_SC'] text-[1.22rem] leading-[1.9] text-[rgba(244,239,255,0.93)] md:text-[1.42rem]",
  bodyL: "text-[0.98rem] leading-[1.95] text-[rgba(214,208,238,0.77)] md:text-[1.02rem]",
  bodyM: "text-[0.92rem] leading-[1.9] text-[rgba(188,181,217,0.68)]",
  bodyS: "text-[0.84rem] leading-[1.78] text-[rgba(160,154,191,0.58)]",
  label: "text-[0.78rem] font-medium tracking-[0.03em]",
};

function DreamTotem() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/[0.06] bg-[radial-gradient(circle_at_50%_46%,rgba(244,239,255,0.26)_0%,rgba(183,158,255,0.1)_30%,rgba(90,70,174,0.04)_62%,transparent_82%)] shadow-[0_18px_48px_rgba(9,10,26,0.36),0_0_42px_rgba(154,128,255,0.12),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <span className="absolute inset-[10px] rounded-full border border-white/[0.05]" />
      <span className="absolute inset-[18px] rounded-full bg-[radial-gradient(circle,rgba(255,249,255,0.92)_0%,rgba(213,193,255,0.56)_38%,rgba(140,112,234,0.14)_74%,transparent_100%)] blur-[1px]" />
      <svg
        viewBox="0 0 48 48"
        className="relative z-10 h-10 w-10 fill-none stroke-[1.45]"
        aria-hidden="true"
      >
        <path
          d="M17.2 15.8c1.7 1.9 3.9 2.8 6.8 2.8 3 0 5.3-.9 7-2.8"
          className="stroke-[#efe6ff]/84"
          strokeLinecap="round"
        />
        <path
          d="M14.8 24c2 2.4 5 3.7 9 3.7 3.8 0 6.8-1.3 8.8-3.7"
          className="stroke-[#d4c8ff]/72"
          strokeLinecap="round"
        />
        <path
          d="M18 32.1c1.5-1.4 3.4-2.1 5.8-2.1s4.4.7 5.9 2.1"
          className="stroke-[#b7a9e7]/62"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function ForestGlyph() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-[16px] w-[16px] fill-none stroke-current stroke-[1.45]"
      aria-hidden="true"
    >
      <path
        d="M10 3.5 5.9 9.7h8.2L10 3.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 6.6 4.5 14.9h11L10 6.6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 14.9v1.8" strokeLinecap="round" />
    </svg>
  );
}

function DoorGlyph() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-[16px] w-[16px] fill-none stroke-current stroke-[1.45]"
      aria-hidden="true"
    >
      <path
        d="M6 4.7h7.2v10.6H6z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.5 10.2h.01" strokeLinecap="round" />
      <path d="M13.2 5.4h1.7v9.2h-1.7" strokeLinecap="round" />
    </svg>
  );
}

function TideGlyph() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-[16px] w-[16px] fill-none stroke-current stroke-[1.45]"
      aria-hidden="true"
    >
      <path
        d="M2.8 8.9c1.4-1.4 2.7-1.4 4.1 0s2.7 1.4 4.1 0 2.7-1.4 4.1 0 2.7 1.4 2.1 0"
        strokeLinecap="round"
      />
      <path
        d="M2.8 12.4c1.4-1.4 2.7-1.4 4.1 0s2.7 1.4 4.1 0 2.7-1.4 4.1 0 2.7 1.4 2.1 0"
        strokeLinecap="round"
      />
    </svg>
  );
}

function buildClues(): ReadingClue[] {
  const glyphs: Record<string, ReactNode> = {
    forest: <ForestGlyph />,
    door: <DoorGlyph />,
    tide: <TideGlyph />,
  };

  return reading.clues.map((item) => ({
    ...item,
    glyph: glyphs[item.id],
  }));
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("dl-reveal opacity-0", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function LightAction({
  children,
  primary = false,
}: {
  children: ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-[0.8rem] font-medium tracking-[0.02em] transition duration-500 hover:-translate-y-px active:translate-y-[1px]",
        primary
          ? "border-violet-300/[0.12] bg-[linear-gradient(180deg,rgba(123,98,224,0.2)_0%,rgba(91,74,176,0.14)_100%)] text-white/88 shadow-[0_12px_28px_rgba(58,44,128,0.16),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-violet-200/[0.18] hover:text-white hover:shadow-[0_18px_34px_rgba(69,52,142,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-white/[0.06] bg-white/[0.02] text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] hover:border-white/[0.1] hover:bg-white/[0.04] hover:text-white/82",
      )}
    >
      {children}
    </button>
  );
}

function SectionHead({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow?: string;
}) {
  return (
    <div className="space-y-2">
      {eyebrow ? <p className={TYPE.eyebrow}>{eyebrow}</p> : null}
      <h2 className={TYPE.h2}>{title}</h2>
    </div>
  );
}

function ClueCard({ clue }: { clue: ReadingClue }) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-white/[0.055] bg-[linear-gradient(180deg,rgba(255,255,255,0.028)_0%,rgba(255,255,255,0.012)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition duration-500 hover:-translate-y-px hover:border-white/[0.08] hover:bg-white/[0.04]">
      <div className="pointer-events-none absolute inset-x-[18%] top-0 h-14 rounded-full bg-[radial-gradient(circle,rgba(194,175,255,0.08)_0%,transparent_72%)] opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />
      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-[#dacfff]/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        {clue.glyph}
      </span>
      <h3 className={cn("mt-4", TYPE.h3)}>{clue.name}</h3>
      <p className={cn("mt-3", TYPE.bodyM)}>{clue.note}</p>
    </article>
  );
}

function EnergyLine({ value }: { value: number }) {
  return (
    <div className="relative mt-6 h-9">
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.14)_50%,rgba(255,255,255,0.05)_100%)]" />
      <div
        className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,rgba(204,176,255,0.44)_0%,rgba(171,151,233,0.56)_56%,rgba(129,154,228,0.4)_100%)] shadow-[0_0_18px_rgba(181,155,248,0.2)]"
        style={{ width: `${value}%` }}
      />
      <span
        className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-white/[0.16] bg-[radial-gradient(circle,rgba(255,250,255,0.98)_0%,rgba(207,188,255,0.62)_40%,rgba(160,130,255,0.24)_72%,transparent_100%)] shadow-[0_0_20px_rgba(194,168,255,0.34)]"
        style={{ left: `calc(${value}% - 7px)` }}
      />
    </div>
  );
}

function ArtPortalGlyph() {
  return (
    <span className="relative inline-flex h-[88px] w-[88px] items-center justify-center rounded-full border border-white/[0.075] bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.12)_0%,transparent_54%),linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.026)_100%)] text-[#e3d8ff]/82 shadow-[0_22px_48px_rgba(6,7,20,0.2),0_0_44px_rgba(126,104,214,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <span className="pointer-events-none absolute inset-[-18px] rounded-full bg-[radial-gradient(circle,rgba(193,172,255,0.16)_0%,rgba(193,172,255,0.04)_48%,transparent_74%)] blur-[16px]" />
      <svg
        viewBox="0 0 20 20"
        className="relative z-10 h-7 w-7 fill-none stroke-current stroke-[1.35]"
        aria-hidden="true"
      >
        <path
          d="M10 4.1c1.5 2 3 3.8 3 5.8a3 3 0 1 1-6 0c0-2 1.5-3.8 3-5.8Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.4 13.9c1 .9 2.5 1.4 4.6 1.4s3.6-.5 4.6-1.4"
          strokeLinecap="round"
        />
        <path d="M7.2 8.2h.01M12.8 8.2h.01" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function DreamAnalysisResultPage() {
  const clues = buildClues();

  return (
    <section className="relative isolate overflow-hidden bg-[#090714] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(56%_42%_at_50%_8%,rgba(167,136,255,0.24)_0%,rgba(123,96,212,0.12)_26%,rgba(58,46,114,0.04)_50%,transparent_72%)] blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-[-13rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full border border-white/[0.035]" />
      <div className="pointer-events-none absolute left-1/2 top-[-6rem] h-[56rem] w-[56rem] -translate-x-1/2 rounded-full border border-white/[0.02]" />
      <div className="pointer-events-none absolute left-1/2 top-[8rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(169,141,255,0.16)_0%,rgba(105,87,196,0.08)_34%,transparent_72%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent_0%,rgba(6,6,18,0.42)_100%)]" />

      <div className="relative z-10 mx-auto max-w-[920px]">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className={TYPE.eyebrow}>{reading.label}</p>

          <div className="mt-6 flex flex-col items-center gap-5">
            <DreamTotem />
            <h1 className={TYPE.h1}>{reading.title}</h1>
          </div>

          <p className={cn("mx-auto mt-8 max-w-[760px]", TYPE.heroCore)}>
            {reading.core}
          </p>

          <p className={cn("mx-auto mt-5 max-w-[690px]", TYPE.bodyL)}>
            {reading.support}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LightAction primary>保存到日记</LightAction>
            <LightAction>重新解析</LightAction>
          </div>
        </Reveal>

        <div className="mt-24 space-y-24 md:mt-28 md:space-y-28">
          <Reveal delay={120}>
            <section className="space-y-10">
              <SectionHead title="为什么会这样理解这场梦" />

              <blockquote className="relative overflow-hidden rounded-[28px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.012)_100%)] px-7 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                <div className="pointer-events-none absolute left-6 top-6 text-[2.4rem] leading-none text-white/10">
                  “
                </div>
                <p className="relative z-10 pl-5 pr-2 font-['Noto_Serif_SC'] text-[1rem] leading-[2] text-[rgba(233,227,248,0.84)] md:text-[1.06rem]">
                  {reading.quote}
                </p>
              </blockquote>

              <div className="space-y-5">
                <div className="space-y-2">
                  <h3 className={TYPE.h2}>最重要的三个线索</h3>
                  <p className={TYPE.bodyS}>
                    它们不是并列的符号词典，而是一起支撑了这场梦为什么会落到同一个判断上。
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {clues.map((clue, index) => (
                    <Reveal key={clue.id} delay={180 + index * 70}>
                      <ClueCard clue={clue} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={220}>
            <section className="space-y-7">
              <SectionHead title="这场梦映照了你怎样的状态" />

              <div className="rounded-[30px] border border-white/[0.055] bg-[linear-gradient(180deg,rgba(17,15,37,0.52)_0%,rgba(11,10,24,0.24)_100%)] px-7 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <p className={cn(TYPE.eyebrow, "text-[rgba(187,177,221,0.48)]")}>
                  Emotional Center
                </p>
                <div className="mt-3 font-['Noto_Serif_SC'] text-[1.5rem] font-semibold tracking-[0.01em] text-[rgba(245,240,255,0.94)] md:text-[1.82rem]">
                  {reading.emotion.dominant}
                </div>
                <EnergyLine value={reading.emotion.intensity} />
                <p className={cn("mt-6 max-w-[760px]", TYPE.bodyL)}>
                  {reading.emotion.note}
                </p>
              </div>
            </section>
          </Reveal>

          <Reveal delay={320}>
            <section className="space-y-7">
              <SectionHead title="行动建议" />
              <p className={cn("max-w-[560px]", TYPE.bodyS)}>
                把这场梦轻轻带回现实，不急着解释完，只先做一个可执行的靠近。
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <article className="relative overflow-hidden rounded-[30px] border border-white/[0.05] bg-[radial-gradient(circle_at_0%_0%,rgba(166,137,255,0.1)_0%,rgba(166,137,255,0.025)_40%,transparent_72%),linear-gradient(180deg,rgba(255,255,255,0.032)_0%,rgba(255,255,255,0.012)_100%)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.024),0_20px_44px_rgba(5,6,18,0.1)]">
                  <p className={cn(TYPE.eyebrow, "text-[rgba(186,177,220,0.46)]")}>现在就能做</p>
                  <h3 className={cn("mt-3", TYPE.h3)}>一个你现在可以做的小动作</h3>
                  <p className="mt-4 max-w-[24ch] font-['Noto_Serif_SC'] text-[1.02rem] leading-[1.82] text-[rgba(245,240,255,0.94)]">
                    {reading.response.actionCue}
                  </p>
                  <p className={cn("mt-4", TYPE.bodyL)}>{reading.response.action}</p>
                </article>

                <article className="relative overflow-hidden rounded-[30px] border border-white/[0.05] bg-[radial-gradient(circle_at_100%_0%,rgba(116,198,255,0.055)_0%,rgba(116,198,255,0.016)_32%,transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.024)_0%,rgba(255,255,255,0.01)_100%)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.024),0_20px_44px_rgba(5,6,18,0.1)]">
                  <p className={cn(TYPE.eyebrow, "text-[rgba(186,177,220,0.46)]")}>继续靠近</p>
                  <h3 className={cn("mt-3", TYPE.h3)}>一个继续留意的方向</h3>
                  <p className="mt-4 max-w-[24ch] font-['Noto_Serif_SC'] text-[1.02rem] leading-[1.82] text-[rgba(245,240,255,0.94)]">
                    {reading.response.directionCue}
                  </p>
                  <p className={cn("mt-4", TYPE.bodyL)}>{reading.response.direction}</p>
                </article>
              </div>
            </section>
          </Reveal>

          <Reveal delay={380}>
            <section className="space-y-6 pt-4">
              <div className="space-y-2">
                <h2 className={TYPE.h2}>AI 梦境艺术</h2>
                <p className={cn("max-w-[560px]", TYPE.bodyS)}>
                  把这场梦转化成一幅专属图像，让它以另一种方式继续显影。
                </p>
              </div>

              <div className="relative isolate overflow-hidden rounded-[34px] border border-white/[0.062] bg-[radial-gradient(52%_58%_at_50%_0%,rgba(182,156,255,0.15)_0%,rgba(182,156,255,0.04)_36%,transparent_74%),radial-gradient(32%_28%_at_90%_22%,rgba(101,190,255,0.05)_0%,transparent_72%),linear-gradient(180deg,rgba(16,14,36,0.84)_0%,rgba(9,8,22,0.76)_100%)] px-4 py-4 shadow-[0_36px_82px_rgba(4,4,15,0.2),inset_0_1px_0_rgba(255,255,255,0.034),inset_0_-36px_64px_rgba(4,5,16,0.11)] md:px-8 md:py-8">
                <div className="pointer-events-none absolute left-1/2 top-[-68px] h-[340px] w-[340px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(154,131,247,0.16)_0%,rgba(154,131,247,0.04)_44%,transparent_76%)] blur-[52px]" />
                <div className="pointer-events-none absolute inset-[1px] rounded-[33px] bg-[linear-gradient(180deg,rgba(255,255,255,0.024)_0%,rgba(255,255,255,0.01)_14%,transparent_32%),radial-gradient(circle_at_14%_82%,rgba(120,98,220,0.08)_0%,transparent_34%)] opacity-80" />
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[34px]">
                  <span className="absolute left-1/2 top-6 h-[220px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(176,151,255,0.14)_0%,rgba(176,151,255,0.045)_38%,transparent_72%)] blur-[44px]" />
                  <span className="absolute bottom-[70px] left-[-38px] h-[180px] w-[180px] rounded-full bg-[radial-gradient(circle,rgba(166,137,255,0.12)_0%,rgba(166,137,255,0.026)_38%,transparent_74%)] blur-[34px]" />
                  <span className="absolute right-[-48px] top-[94px] h-[200px] w-[200px] rounded-full bg-[radial-gradient(circle,rgba(108,196,255,0.08)_0%,rgba(108,196,255,0.018)_38%,transparent_74%)] blur-[36px]" />
                  <span className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.055] opacity-[0.14]" />
                  <span className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.055] opacity-[0.18]" />
                </div>

                <div className="relative z-10 overflow-hidden rounded-[30px] border border-white/[0.052] bg-[radial-gradient(circle_at_50%_-8%,rgba(255,255,255,0.052)_0%,transparent_46%),linear-gradient(180deg,rgba(255,255,255,0.028)_0%,rgba(255,255,255,0.01)_100%)] px-5 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.028),0_24px_54px_rgba(7,8,20,0.14)] md:min-h-[420px] md:px-[42px] md:py-[62px]">
                  <div className="pointer-events-none absolute left-1/2 top-[52px] h-[160px] w-[320px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(237,228,255,0.1)_0%,rgba(237,228,255,0.03)_44%,transparent_76%)] blur-[30px]" />
                  <div className="pointer-events-none absolute bottom-[18px] left-1/2 h-[56px] w-[296px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(122,101,213,0.11)_0%,rgba(122,101,213,0.02)_42%,transparent_76%)] opacity-[0.62] blur-[24px]" />
                  <div className="absolute left-5 top-5 z-10 flex items-start gap-[7px] max-md:left-1/2 max-md:top-4 max-md:w-[calc(100%-36px)] max-md:-translate-x-1/2 max-md:flex-wrap max-md:justify-start max-md:gap-[7px]">
                    <button
                      type="button"
                      className="relative isolate inline-flex min-h-9 items-center gap-[2px] overflow-hidden rounded-2xl border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.084)_0%,rgba(255,255,255,0.026)_100%),radial-gradient(circle_at_18%_0%,rgba(248,242,255,0.09)_0%,rgba(248,242,255,0.016)_34%,transparent_72%),linear-gradient(135deg,rgba(120,102,194,0.104)_0%,rgba(94,84,156,0.056)_100%)] px-[5px] text-white/80 shadow-[0_6px_16px_rgba(6,8,18,0.072),inset_0_1px_0_rgba(255,255,255,0.082),inset_0_-1px_0_rgba(255,255,255,0.018)] backdrop-blur-[24px] transition duration-300 before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[inherit] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.052)_18%,rgba(255,255,255,0.014)_42%,transparent_70%),radial-gradient(circle_at_18%_-10%,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.014)_34%,transparent_70%)] hover:-translate-y-px hover:border-white/[0.18] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.102)_0%,rgba(255,255,255,0.036)_100%),radial-gradient(circle_at_18%_0%,rgba(250,245,255,0.122)_0%,rgba(250,245,255,0.022)_36%,transparent_74%),linear-gradient(135deg,rgba(131,111,211,0.126)_0%,rgba(90,77,159,0.064)_100%)] hover:shadow-[0_8px_20px_rgba(7,9,20,0.092),inset_0_1px_0_rgba(255,255,255,0.11)] max-md:min-h-[34px] max-md:px-1"
                    >
                      <span className="relative z-10 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full text-[0.92rem] font-normal leading-none text-white/[0.56] transition duration-300 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.085)_0%,rgba(255,255,255,0.026)_100%)] hover:text-white/[0.84] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.064)] max-md:h-[22px] max-md:w-[22px] max-md:text-[0.9rem]">−</span>
                      <span className="relative z-10 min-w-[48px] text-center text-[0.72rem] font-semibold tracking-[0.035em] text-white/[0.8] max-md:text-[0.7rem]">1/4</span>
                      <span className="relative z-10 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full text-[0.92rem] font-normal leading-none text-white/[0.56] transition duration-300 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.085)_0%,rgba(255,255,255,0.026)_100%)] hover:text-white/[0.84] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.064)] max-md:h-[22px] max-md:w-[22px] max-md:text-[0.9rem]">+</span>
                    </button>
                    <button
                      type="button"
                      className="relative isolate inline-flex min-h-9 items-center gap-[7px] rounded-2xl border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.084)_0%,rgba(255,255,255,0.026)_100%),radial-gradient(circle_at_18%_0%,rgba(248,242,255,0.09)_0%,rgba(248,242,255,0.016)_34%,transparent_72%),linear-gradient(135deg,rgba(120,102,194,0.104)_0%,rgba(94,84,156,0.056)_100%)] px-[11px] text-[0.72rem] font-semibold tracking-[0.022em] text-white/[0.76] shadow-[0_6px_16px_rgba(6,8,18,0.072),inset_0_1px_0_rgba(255,255,255,0.082),inset_0_-1px_0_rgba(255,255,255,0.018)] backdrop-blur-[24px] transition duration-300 before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[inherit] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.052)_18%,rgba(255,255,255,0.014)_42%,transparent_70%),radial-gradient(circle_at_18%_-10%,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.014)_34%,transparent_70%)] hover:-translate-y-px hover:border-white/[0.18] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.102)_0%,rgba(255,255,255,0.036)_100%),radial-gradient(circle_at_18%_0%,rgba(250,245,255,0.122)_0%,rgba(250,245,255,0.022)_36%,transparent_74%),linear-gradient(135deg,rgba(131,111,211,0.126)_0%,rgba(90,77,159,0.064)_100%)] hover:shadow-[0_8px_20px_rgba(7,9,20,0.092),inset_0_1px_0_rgba(255,255,255,0.11)] max-md:min-h-[34px] max-md:px-[9px] max-md:text-[0.7rem]"
                    >
                      <span className="relative z-10 h-[9px] w-[13px] rounded-[2.75px] border border-white/[0.58]" />
                      <span className="relative z-10">16:9</span>
                      <i className="fas fa-chevron-down relative z-10 text-[0.58rem] text-white/[0.34]" />
                    </button>
                    <button
                      type="button"
                      className="relative isolate inline-flex min-h-9 items-center gap-[7px] rounded-2xl border border-white/[0.12] bg-[linear-gradient(180deg,rgba(255,255,255,0.084)_0%,rgba(255,255,255,0.026)_100%),radial-gradient(circle_at_18%_0%,rgba(248,242,255,0.09)_0%,rgba(248,242,255,0.016)_34%,transparent_72%),linear-gradient(135deg,rgba(120,102,194,0.104)_0%,rgba(94,84,156,0.056)_100%)] px-[11px] text-[0.72rem] font-semibold tracking-[0.022em] text-white/[0.76] shadow-[0_6px_16px_rgba(6,8,18,0.072),inset_0_1px_0_rgba(255,255,255,0.082),inset_0_-1px_0_rgba(255,255,255,0.018)] backdrop-blur-[24px] transition duration-300 before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[inherit] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.052)_18%,rgba(255,255,255,0.014)_42%,transparent_70%),radial-gradient(circle_at_18%_-10%,rgba(255,255,255,0.09)_0%,rgba(255,255,255,0.014)_34%,transparent_70%)] hover:-translate-y-px hover:border-white/[0.18] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.102)_0%,rgba(255,255,255,0.036)_100%),radial-gradient(circle_at_18%_0%,rgba(250,245,255,0.122)_0%,rgba(250,245,255,0.022)_36%,transparent_74%),linear-gradient(135deg,rgba(131,111,211,0.126)_0%,rgba(90,77,159,0.064)_100%)] hover:shadow-[0_8px_20px_rgba(7,9,20,0.092),inset_0_1px_0_rgba(255,255,255,0.11)] max-md:min-h-[34px] max-md:px-[9px] max-md:text-[0.7rem]"
                    >
                      <i className="far fa-gem relative z-10 text-[0.8rem] text-white/[0.58]" />
                      <span className="relative z-10">2K</span>
                      <i className="fas fa-chevron-down relative z-10 text-[0.58rem] text-white/[0.34]" />
                    </button>
                  </div>

                  <div className="relative z-10 mx-auto grid max-w-[580px] justify-items-center gap-6">
                    <ArtPortalGlyph />
                    <div className="grid gap-3 text-center">
                      <p className="font-['Noto_Serif_SC'] text-[clamp(1.34rem,2.25vw,1.86rem)] font-semibold leading-[1.5] tracking-[-0.018em] text-white/95">
                        让这场梦第一次被真正看见
                      </p>
                      <p className="mx-auto max-w-[34rem] text-[0.92rem] leading-[1.86] text-[rgba(200,193,229,0.7)]">
                        把刚刚浮现出的意象、情绪与氛围，转化成一幅只属于这场梦的视觉作品。
                      </p>
                    </div>

                    <div className="relative">
                      <span className="pointer-events-none absolute inset-x-[16%] -top-1.5 h-[52px] bg-[radial-gradient(circle,rgba(240,234,255,0.22)_0%,transparent_68%)] blur-[24px]" />
                      <LightAction primary>生成梦境艺术</LightAction>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          </Reveal>
        </div>
      </div>

      <style>{`
        @keyframes dl-reveal {
          0% {
            opacity: 0;
            transform: translateY(22px);
            filter: blur(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .dl-reveal {
          animation: dl-reveal 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </section>
  );
}
