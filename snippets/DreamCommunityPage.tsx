type HeroMetric = {
  label: string;
  value: string;
  note: string;
};

type DreamCardData = {
  totem: string;
  time: string;
  resonance: string;
  title: string;
  excerpt: string;
  emotions: string[];
  symbols: string[];
};

type ExploreEntryData = {
  title: string;
  description: string;
  keywords: string[];
};

type ResonanceTrendData = {
  title: string;
  description: string;
};

const heroMetrics: HeroMetric[] = [
  {
    label: "今夜高频意象",
    value: "门 · 海浪 · 旧房间",
    note: "它们在不同人的梦里，反复以入口、退路与回返的方式浮现。",
  },
  {
    label: "最多人共鸣的情绪",
    value: "迟疑",
    note: "许多人在醒来后，都留下了一种想靠近却没有真正走进去的感觉。",
  },
  {
    label: "正在浮现的梦境类型",
    value: "反复回到旧地",
    note: "旧房间、旧学校、童年的楼梯，这些空间正在重新被许多人梦见。",
  },
];

const dreamCards: DreamCardData[] = [
  {
    totem: "门",
    time: "02:14 记录",
    resonance: "34 人正在共鸣",
    title: "门总是半开着",
    excerpt:
      "我站在走廊尽头，那扇门后一直传来海浪声。每次我想再靠近一点，门缝里的光就退后一点。",
    emotions: ["迟疑", "被吸引"],
    symbols: ["门", "海浪", "长廊"],
  },
  {
    totem: "屋",
    time: "昨夜整理",
    resonance: "27 个相似的梦",
    title: "又回到那间旧房间",
    excerpt:
      "房间里摆设和以前一样，只是窗外变成了完全陌生的天色。我知道这里属于过去，却还是停了很久。",
    emotions: ["怀旧", "不安"],
    symbols: ["旧房间", "黄昏", "窗"],
  },
  {
    totem: "镜",
    time: "醒后 10 分钟",
    resonance: "19 人停留在这里",
    title: "镜子里的人比我更平静",
    excerpt:
      "我看见镜子里的自己在对我说话，但她没有开口。她只是安静地看着我，像是已经知道我还没准备好面对什么。",
    emotions: ["被看见", "轻微失重"],
    symbols: ["镜子", "静默", "另一个自己"],
  },
  {
    totem: "森",
    time: "凌晨 04:07",
    resonance: "41 条回声正在扩散",
    title: "发光的森林把路藏起来了",
    excerpt:
      "林间有很轻的蓝白色光，每一棵树都像在呼吸。我想沿着光走出去，却发现脚下的路一直在慢慢变软。",
    emotions: ["安静", "迟疑"],
    symbols: ["森林", "光", "柔软地面"],
  },
];

const exploreEntries: ExploreEntryData[] = [
  {
    title: "按意象寻找",
    description: "从反复出现的画面出发，找到那些和你梦里共享同一符号的人。",
    keywords: ["门", "水", "楼梯", "镜子", "月亮"],
  },
  {
    title: "按情绪靠近",
    description: "有些人梦见的是不同画面，却在醒来时留下了几乎一样的情绪。",
    keywords: ["迟疑", "安宁", "怀念", "被追赶"],
  },
  {
    title: "按梦境类型进入",
    description: "从反复梦、追逐梦、回到旧地的梦里，寻找一条更接近自己的入口。",
    keywords: ["反复梦", "追逐梦", "发光梦", "旧地重返"],
  },
  {
    title: "按关系线索延伸",
    description: "梦里再次遇见的人，常常也是另一段现实关系正在被重新照亮的地方。",
    keywords: ["旧友", "家人", "陌生人", "失而复得"],
  },
];

const resonanceTrends: ResonanceTrendData[] = [
  {
    title: "最近 128 人梦见了“门”",
    description: "它常常不是被打开，而是停留在半开的状态，像某种尚未走进去的选择。",
  },
  {
    title: "本周最常出现的情绪是“迟疑”",
    description: "它不是强烈恐惧，而是一种在靠近与停下之间来回轻轻摆动的情绪。",
  },
  {
    title: "许多人在梦里重新遇见过去的人",
    description: "他们未必说话，只是出现在某个场景里，让情绪先一步被重新唤起。",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 grid gap-2 md:mb-7 md:grid-cols-[180px_minmax(0,1fr)] md:gap-6">
      <span className="inline-flex min-h-0 items-center text-[0.74rem] uppercase tracking-[0.14em] text-white/45">
        {eyebrow}
      </span>
      <div>
        <h2 className="font-['Noto_Serif_SC'] text-[1.38rem] font-semibold leading-[1.5] text-white/92 md:text-[1.52rem]">
          {title}
        </h2>
        <p className="mt-2 max-w-[46rem] text-[0.92rem] leading-8 text-white/62">
          {description}
        </p>
      </div>
    </div>
  );
}

export function DreamCard({
  card,
  elevated = false,
}: {
  card: DreamCardData;
  elevated?: boolean;
}) {
  return (
    <article
      className={[
        "group relative overflow-hidden rounded-[28px] border border-white/[0.05] bg-[radial-gradient(52%_46%_at_100%_0%,rgba(132,113,255,0.12)_0%,transparent_60%),linear-gradient(180deg,rgba(15,13,34,0.92)_0%,rgba(10,9,25,0.86)_100%)] p-6 shadow-[0_22px_56px_rgba(3,4,14,0.36),inset_0_1px_0_rgba(255,255,255,0.03)] transition duration-500 hover:-translate-y-1 hover:border-white/[0.09] hover:shadow-[0_30px_72px_rgba(4,5,16,0.42),inset_0_1px_0_rgba(255,255,255,0.04),0_0_28px_rgba(109,84,216,0.08)]",
        elevated ? "md:translate-y-6" : "",
      ].join(" ")}
    >
      <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-200/[0.16] to-transparent" />

      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid h-[54px] w-[54px] place-items-center rounded-[18px] border border-violet-200/[0.14] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18)_0%,transparent_24%),linear-gradient(180deg,rgba(73,65,110,0.94)_0%,rgba(42,39,78,0.92)_100%)] font-['Noto_Serif_SC'] text-[1.08rem] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_26px_rgba(15,12,33,0.28)]">
          {card.totem}
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          {[card.time, card.resonance].map((meta) => (
            <span
              key={meta}
              className="rounded-full border border-white/[0.04] bg-white/[0.03] px-2.5 py-1.5 text-[0.72rem] text-white/55"
            >
              {meta}
            </span>
          ))}
        </div>
      </div>

      <h3 className="font-['Noto_Serif_SC'] text-[1.2rem] font-semibold leading-[1.5] text-white/92 md:text-[1.28rem]">
        {card.title}
      </h3>
      <p className="mt-3 text-[0.94rem] leading-8 text-white/72">{card.excerpt}</p>

      <div className="mt-5 grid gap-3">
        <div className="grid gap-2 md:grid-cols-[42px_minmax(0,1fr)] md:items-start">
          <span className="text-[0.74rem] uppercase tracking-[0.08em] text-white/42">情绪</span>
          <div className="flex flex-wrap gap-2">
            {card.emotions.map((emotion) => (
              <span
                key={emotion}
                className="rounded-full border border-white/[0.045] bg-white/[0.028] px-3 py-1.5 text-[0.75rem] text-white/70"
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[42px_minmax(0,1fr)] md:items-start">
          <span className="text-[0.74rem] uppercase tracking-[0.08em] text-white/42">意象</span>
          <div className="flex flex-wrap gap-2">
            {card.symbols.map((symbol) => (
              <span
                key={symbol}
                className="rounded-full border border-white/[0.045] bg-white/[0.028] px-3 py-1.5 text-[0.75rem] text-white/70"
              >
                {symbol}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        {["我也梦见过", "留下回声", "查看相似梦境"].map((action) => (
          <button
            key={action}
            type="button"
            className="text-[0.82rem] text-white/58 transition hover:-translate-y-0.5 hover:text-white/88"
          >
            {action}
          </button>
        ))}
      </div>
    </article>
  );
}

export function ExploreEntry({ entry }: { entry: ExploreEntryData }) {
  return (
    <article className="rounded-[24px] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(14,13,31,0.74)_0%,rgba(10,9,24,0.6)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.08]">
      <span className="block text-[0.95rem] font-semibold leading-6 text-white/90">
        {entry.title}
      </span>
      <p className="mt-2 text-[0.85rem] leading-7 text-white/60">{entry.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {entry.keywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-full border border-white/[0.04] bg-white/[0.02] px-2.5 py-1.5 text-[0.74rem] text-white/62"
          >
            {keyword}
          </span>
        ))}
      </div>
    </article>
  );
}

export function ResonanceTrend({ trend }: { trend: ResonanceTrendData }) {
  return (
    <article className="rounded-[28px] border border-white/[0.045] bg-[radial-gradient(48%_42%_at_100%_0%,rgba(112,98,214,0.12)_0%,transparent_58%),linear-gradient(180deg,rgba(14,12,31,0.9)_0%,rgba(10,9,24,0.76)_100%)] px-6 py-5 shadow-[0_22px_58px_rgba(3,4,14,0.34),inset_0_1px_0_rgba(255,255,255,0.025)]">
      <strong className="block text-[1rem] font-semibold leading-7 text-white/88">
        {trend.title}
      </strong>
      <p className="mt-2 text-[0.86rem] leading-8 text-white/62">{trend.description}</p>
    </article>
  );
}

export function CommunityClosingCTA() {
  return (
    <section className="relative mt-10 overflow-hidden rounded-[34px] border border-white/[0.05] bg-[radial-gradient(64%_46%_at_50%_0%,rgba(145,114,255,0.2)_0%,transparent_60%),linear-gradient(180deg,rgba(14,12,32,0.86)_0%,rgba(10,10,25,0.82)_100%)] px-7 py-14 text-center shadow-[0_30px_82px_rgba(4,5,16,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] md:px-10">
      <div className="pointer-events-none absolute left-1/2 top-[-34px] h-[200px] w-[340px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(182,164,255,0.2)_0%,rgba(182,164,255,0.05)_40%,transparent_72%)] blur-[26px]" />

      <span className="relative inline-flex text-[0.74rem] uppercase tracking-[0.14em] text-white/50">
        留下你的梦
      </span>
      <h2 className="relative mt-3 font-['Noto_Serif_SC'] text-[2rem] font-semibold leading-[1.25] text-white/94 md:text-[2.5rem]">
        把你的梦也留在这里
      </h2>
      <p className="relative mx-auto mt-4 max-w-[620px] text-[0.96rem] leading-8 text-white/68">
        也许你写下的那一幕，正在另一个人心里发生。
      </p>

      <a
        href="/analyze"
        className="relative mt-7 inline-flex min-w-[214px] items-center justify-center rounded-full border border-white/[0.08] bg-[linear-gradient(180deg,rgba(27,23,50,0.82)_0%,rgba(14,12,31,0.94)_100%)] px-7 py-4 text-[0.92rem] font-medium tracking-[0.03em] text-white/92 shadow-[0_20px_52px_rgba(17,12,39,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition duration-500 hover:-translate-y-0.5 hover:border-white/[0.13] hover:shadow-[0_28px_62px_rgba(22,16,48,0.38),inset_0_1px_0_rgba(255,255,255,0.12)]"
      >
        写下今夜的梦
      </a>
    </section>
  );
}

export default function DreamCommunityPage() {
  return (
    <main className="relative mx-auto max-w-[1180px] px-6 pb-28 text-white md:px-8">
      <div className="pointer-events-none absolute left-1/2 top-[220px] -z-10 h-[420px] w-[min(860px,90vw)] -translate-x-1/2 bg-[radial-gradient(circle,rgba(140,111,255,0.12)_0%,rgba(140,111,255,0.04)_34%,transparent_72%)] blur-[36px]" />

      <section className="relative overflow-hidden rounded-[36px] border border-violet-200/[0.16] bg-[radial-gradient(88%_70%_at_50%_-10%,rgba(151,114,255,0.24)_0%,transparent_58%),radial-gradient(46%_38%_at_86%_8%,rgba(105,214,255,0.12)_0%,transparent_58%),linear-gradient(180deg,rgba(13,11,32,0.95)_0%,rgba(9,8,24,0.9)_100%)] px-6 py-14 shadow-[0_34px_94px_rgba(3,4,14,0.52),inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-18px_42px_rgba(6,6,18,0.22)] md:px-14">
        <div className="ds-eyebrow justify-center">Dream Plaza</div>
        <h1 className="mx-auto max-w-[760px] text-center font-['Noto_Serif_SC'] text-[2.2rem] font-semibold leading-[1.14] text-white md:text-[3.4rem]">
          从一场梦开始，与相似的人相遇
        </h1>
        <p className="mx-auto mt-5 max-w-[730px] text-center text-[1rem] leading-[1.96] text-white/72">
          这里没有标准答案，只有被记录下来的梦、意象、情绪，与那些意外相似的回声。
        </p>

        <div className="mt-9 grid gap-3 md:grid-cols-3 md:gap-4">
          {heroMetrics.map((item) => (
            <article
              key={item.label}
              className="relative rounded-[22px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.042)_0%,rgba(255,255,255,0.015)_100%)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
            >
              <div className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-200/[0.18] to-transparent" />
              <span className="block text-[0.74rem] uppercase tracking-[0.12em] text-white/52">
                {item.label}
              </span>
              <strong className="mt-2 block font-['Noto_Serif_SC'] text-[1.04rem] font-semibold leading-7 text-white/94">
                {item.value}
              </strong>
              <p className="mt-2 text-[0.84rem] leading-7 text-white/62">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-9">
        <SectionHeading
          eyebrow="今夜回声"
          title="梦不是帖子，而是一张会被看见的回声卡片"
          description="在这里，人与人之间的连接从一幕画面、一种情绪、一个反复出现的意象开始。"
        />

        <div className="grid gap-4 md:grid-cols-2 md:gap-[18px]">
          {dreamCards.map((card, index) => (
            <DreamCard key={card.title} card={card} elevated={index % 2 === 1} />
          ))}
        </div>
      </section>

      <section className="mt-9">
        <SectionHeading
          eyebrow="从不同入口探索"
          title="顺着你最熟悉的那条线索，走进别人的梦"
          description="不是进入看板，而是从意象、情绪、梦境类型和关系线索里，慢慢靠近相似的经验。"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {exploreEntries.map((entry) => (
            <ExploreEntry key={entry.title} entry={entry} />
          ))}
        </div>
      </section>

      <section className="mt-9">
        <SectionHeading
          eyebrow="正在发生的共鸣"
          title="群体梦境观察，正在把分散的夜晚慢慢连起来"
          description="这里不是讨论热度，而是那些同时在很多人身上浮现的梦境线索。"
        />

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <article className="rounded-[28px] border border-white/[0.045] bg-[radial-gradient(48%_42%_at_100%_0%,rgba(112,98,214,0.12)_0%,transparent_58%),linear-gradient(180deg,rgba(14,12,31,0.9)_0%,rgba(10,9,24,0.76)_100%)] px-7 py-7 shadow-[0_22px_58px_rgba(3,4,14,0.34),inset_0_1px_0_rgba(255,255,255,0.025)]">
            <span className="inline-flex text-[0.74rem] uppercase tracking-[0.12em] text-white/50">
              今夜正在增强的回声
            </span>
            <strong className="mt-3 block max-w-[40rem] font-['Noto_Serif_SC'] text-[1.5rem] font-semibold leading-[1.5] text-white/94">
              “反复回到旧房间”的梦，正在明显增加
            </strong>
            <p className="mt-4 max-w-[40rem] text-[0.94rem] leading-8 text-white/70">
              过去三晚里，关于旧房间、旧学校与熟悉走廊的记录比上周增长了 37%。很多人都提到：梦里一切看似熟悉，却多了一处无法解释的偏差。
            </p>
          </article>

          <div className="grid gap-4">
            {resonanceTrends.map((trend) => (
              <ResonanceTrend key={trend.title} trend={trend} />
            ))}
          </div>
        </div>
      </section>

      <CommunityClosingCTA />
    </main>
  );
}
