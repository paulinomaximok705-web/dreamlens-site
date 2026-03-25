import type { ReactNode } from "react";

type DreamEntry = {
  id: string;
  title: string;
  date: string;
  isoDate: string;
  emotion: string;
  summary: string;
  theme: string;
  totem: TotemKey;
};

type TotemKey =
  | "forest"
  | "door"
  | "wave"
  | "moon"
  | "mirror"
  | "stairs"
  | "bird"
  | "fire"
  | "room"
  | "glass"
  | "train"
  | "mist";

type EmotionTrackKey =
  | "安宁"
  | "焦虑"
  | "兴奋"
  | "悲伤"
  | "困惑"
  | "恐惧"
  | "释然"
  | "疲惫";

const totems: Record<
  TotemKey,
  { label: string; hint: string; icon: ReactNode }
> = {
  forest: {
    label: "森林",
    hint: "在未知里寻找方向",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M7 19v-4" />
        <path d="M5 15l2-4 2 4" />
        <path d="M16 19v-6" />
        <path d="M13 13l3-6 3 6" />
        <path d="M4 19h16" />
      </svg>
    ),
  },
  door: {
    label: "门",
    hint: "靠近一个尚未进入的入口",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M7 19V6.5A1.5 1.5 0 0 1 8.5 5H16v14" />
        <path d="M7 19h10" />
        <path d="M12.5 12h.01" />
      </svg>
    ),
  },
  wave: {
    label: "海浪",
    hint: "情绪正在反复起伏",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M3 10c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
        <path d="M3 15c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" />
      </svg>
    ),
  },
  moon: {
    label: "月亮",
    hint: "直觉在夜里发光",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M15.5 4.5a7.5 7.5 0 1 0 4 13.9A8.4 8.4 0 0 1 15.5 4.5Z" />
      </svg>
    ),
  },
  mirror: {
    label: "镜子",
    hint: "梦在映照另一个自己",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <ellipse cx="12" cy="10" rx="5.5" ry="7" />
        <path d="M12 17v2.5" />
        <path d="M9.5 21h5" />
      </svg>
    ),
  },
  stairs: {
    label: "楼梯",
    hint: "正停在过渡与转折之间",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M5 18h4v-3h3v-3h3V9h4" />
        <path d="M5 18v-4" />
        <path d="M9 15v-3" />
        <path d="M12 12V9" />
        <path d="M15 9V6" />
      </svg>
    ),
  },
  bird: {
    label: "鸟",
    hint: "自由与离开的冲动",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M4 13c2-3 4.5-4.5 8-4.5" />
        <path d="M20 13c-2-3-4.5-4.5-8-4.5" />
        <path d="M7 15c1.7-1.4 3.4-2 5-2s3.3.6 5 2" />
      </svg>
    ),
  },
  fire: {
    label: "火",
    hint: "能量、危险或重新点燃",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M12 4.5c1.8 2.3 3.5 4.2 3.5 6.7A3.5 3.5 0 0 1 12 14.7a3.5 3.5 0 0 1-3.5-3.5C8.5 8.7 10.2 6.8 12 4.5Z" />
        <path d="M10.2 14.3c0 1.8 1 3.2 1.8 4.2.8-1 1.8-2.4 1.8-4.2" />
      </svg>
    ),
  },
  room: {
    label: "房间",
    hint: "某个内在空间正在被重新看见",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M5 18V7l7-3 7 3v11" />
        <path d="M5 18h14" />
        <path d="M9 11h6" />
        <path d="M12 8v6" />
      </svg>
    ),
  },
  glass: {
    label: "玻璃",
    hint: "脆弱、透明与边界感",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M12 4l6 8-6 8-6-8 6-8Z" />
        <path d="M12 7l2.4 3H9.6L12 7Z" />
      </svg>
    ),
  },
  train: {
    label: "列车",
    hint: "梦在提醒一条正在运行的轨迹",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M7 6h10a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a2 2 0 0 1 2-2Z" />
        <path d="M8.5 10h7" />
        <path d="M9 20l1.5-3" />
        <path d="M15 20l-1.5-3" />
      </svg>
    ),
  },
  mist: {
    label: "雾",
    hint: "有些部分仍在慢慢显影",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.55]">
        <path d="M5 10c1.2-1.2 2.3-1.8 3.5-1.8S10.8 8.8 12 10s2.3 1.8 3.5 1.8S17.8 11.2 19 10" />
        <path d="M4 14c1.3 1 2.6 1.5 4 1.5s2.7-.5 4-1.5 2.6-1.5 4-1.5 2.7.5 4 1.5" />
      </svg>
    ),
  },
};

const TRACK_TODAY_ISO = "2026-03-22";

const trackEntries: DreamEntry[] = [
  {
    id: "track-2026-03-02",
    title: "门后传来的海浪",
    date: "03.02",
    isoDate: "2026-03-02",
    emotion: "被吸引",
    summary: "我站在一条很长的走廊里，门后一直传来海浪声，像有什么在轻轻召唤我靠近。",
    theme: "水域梦境",
    totem: "wave",
  },
  {
    id: "track-2026-03-04",
    title: "半开的门",
    date: "03.04",
    isoDate: "2026-03-04",
    emotion: "迟疑",
    summary: "梦里有一扇半开的门，门缝里透出很淡的光，我知道里面有什么，却迟迟没有推开。",
    theme: "追逐梦境",
    totem: "door",
  },
  {
    id: "track-2026-03-07",
    title: "森林边缘的入口",
    date: "03.07",
    isoDate: "2026-03-07",
    emotion: "困惑",
    summary: "我走到一片发光的森林边缘，树影很安静，像在等我继续往里走。",
    theme: "森林迷途",
    totem: "forest",
  },
  {
    id: "track-2026-03-10",
    title: "潮声绕着房间",
    date: "03.10",
    isoDate: "2026-03-10",
    emotion: "焦虑",
    summary: "我坐在空房间里，窗外的潮声一阵阵靠近，像情绪在反复拍岸。",
    theme: "水域梦境",
    totem: "wave",
  },
  {
    id: "track-2026-03-13",
    title: "镜面里更平静的人",
    date: "03.13",
    isoDate: "2026-03-13",
    emotion: "怀旧与不安",
    summary: "镜子里的我没有说话，只是很安静地看着我，像已经知道我还没说出口的部分。",
    theme: "家与空间",
    totem: "mirror",
  },
  {
    id: "track-2026-03-16",
    title: "森林里的寻找",
    date: "03.16",
    isoDate: "2026-03-16",
    emotion: "困惑",
    summary: "我沿着林间一条很窄的路往前走，明明很安静，却一直像在寻找某个方向。",
    theme: "森林迷途",
    totem: "forest",
  },
  {
    id: "track-2026-03-19",
    title: "月亮离我很近",
    date: "03.19",
    isoDate: "2026-03-19",
    emotion: "安宁",
    summary: "梦里的月亮低得像要落下来，光很柔，我站在下面反而慢慢安静了。",
    theme: "光与洞见",
    totem: "moon",
  },
  {
    id: "track-2026-03-22",
    title: "森林深处的停顿",
    date: "03.22",
    isoDate: "2026-03-22",
    emotion: "困惑",
    summary: "我在森林深处停下来，四周没有风，只有一种很轻的迟疑和被看见的感觉。",
    theme: "森林迷途",
    totem: "forest",
  },
  {
    id: "track-2026-03-24",
    title: "一直往下的楼梯",
    date: "03.24",
    isoDate: "2026-03-24",
    emotion: "疲惫",
    summary: "楼梯没有尽头，我每往下走一层，周围就更安静一点，像正在接近什么。",
    theme: "坠落蜕变",
    totem: "stairs",
  },
  {
    id: "track-2026-03-27",
    title: "门后的第二个房间",
    date: "03.27",
    isoDate: "2026-03-27",
    emotion: "迟疑",
    summary: "我推开一扇门，里面还有另一扇门，像一层一层靠近还没准备好的答案。",
    theme: "家与空间",
    totem: "door",
  },
  {
    id: "track-2026-03-29",
    title: "森林又一次出现",
    date: "03.29",
    isoDate: "2026-03-29",
    emotion: "释然",
    summary: "同一片森林再次出现，这次我没有迷路，只是知道自己还要继续往前。",
    theme: "森林迷途",
    totem: "forest",
  },
].filter((entry) => entry.isoDate <= TRACK_TODAY_ISO);

const emotionTrackLibrary: Record<
  EmotionTrackKey,
  { level: number; accent: string; icon: ReactNode }
> = {
  安宁: {
    level: 104,
    accent: "rgba(174,191,255,0.78)",
    icon: (
      <svg viewBox="0 0 20 20" className="h-[15px] w-[15px] fill-none stroke-current stroke-[1.38]">
        <path d="M13.8 4.8a5.8 5.8 0 1 0 0 10.4A6.7 6.7 0 0 1 13.8 4.8Z" />
      </svg>
    ),
  },
  焦虑: {
    level: 126,
    accent: "rgba(173,165,229,0.76)",
    icon: (
      <svg viewBox="0 0 20 20" className="h-[15px] w-[15px] fill-none stroke-current stroke-[1.38]">
        <path d="M2.8 11.4c1.7-3.3 3.3 3.3 5 0 1.8-3.4 3.3-3.4 5 0 1.8 3.4 3.3 3.3 4.4 0" />
      </svg>
    ),
  },
  兴奋: {
    level: 94,
    accent: "rgba(214,191,255,0.8)",
    icon: (
      <svg viewBox="0 0 20 20" className="h-[15px] w-[15px] fill-none stroke-current stroke-[1.38]">
        <path d="M10 3.6 11.4 8.6 16.4 10 11.4 11.4 10 16.4 8.6 11.4 3.6 10 8.6 8.6Z" />
      </svg>
    ),
  },
  悲伤: {
    level: 138,
    accent: "rgba(158,177,228,0.76)",
    icon: (
      <svg viewBox="0 0 20 20" className="h-[15px] w-[15px] fill-none stroke-current stroke-[1.38]">
        <path d="M10 4.1c1.6 2.1 3.1 4.1 3.1 6.2a3.1 3.1 0 1 1-6.2 0c0-2.1 1.5-4.1 3.1-6.2Z" />
        <path d="M13.6 14.2c-1 .8-2.2 1.2-3.6 1.2" />
      </svg>
    ),
  },
  困惑: {
    level: 118,
    accent: "rgba(166,158,224,0.76)",
    icon: (
      <svg viewBox="0 0 20 20" className="h-[15px] w-[15px] fill-none stroke-current stroke-[1.38]">
        <path d="M10.1 4.8c2.7 0 4.5 1.5 4.5 3.8 0 2.2-1.6 3.7-3.9 3.7-1.8 0-3.1-1-3.1-2.3 0-1.1.8-1.9 2-1.9 1 0 1.8.5 2.2 1.3" />
        <path d="M10 14.6v.2" />
      </svg>
    ),
  },
  恐惧: {
    level: 132,
    accent: "rgba(180,171,220,0.74)",
    icon: (
      <svg viewBox="0 0 20 20" className="h-[15px] w-[15px] fill-none stroke-current stroke-[1.38]">
        <path d="M4.5 5.2c2.6 1.5 2.6 8.1 0 9.6" />
        <path d="M15.5 5.2c-2.6 1.5-2.6 8.1 0 9.6" />
        <path d="M8 10h4" />
      </svg>
    ),
  },
  释然: {
    level: 98,
    accent: "rgba(187,198,255,0.8)",
    icon: (
      <svg viewBox="0 0 20 20" className="h-[15px] w-[15px] fill-none stroke-current stroke-[1.38]">
        <path d="M4.8 11.2c1.2 2 3 3 5.2 3s4-1 5.2-3" />
        <path d="M6.2 7.2c.9 1.3 2.2 2 3.8 2s2.9-.7 3.8-2" />
      </svg>
    ),
  },
  疲惫: {
    level: 144,
    accent: "rgba(150,162,214,0.72)",
    icon: (
      <svg viewBox="0 0 20 20" className="h-[15px] w-[15px] fill-none stroke-current stroke-[1.38]">
        <path d="M5 7.2h10" />
        <path d="M5.6 12.8c1-.9 2.4-1.4 4.4-1.4s3.4.5 4.4 1.4" />
      </svg>
    ),
  },
};

function buildMonthCalendar(year: number, month: number) {
  const map = new Map(trackEntries.map((entry) => [entry.isoDate, entry]));
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingSlots = (firstDay.getDay() + 6) % 7;
  const totalSlots = Math.ceil((leadingSlots + daysInMonth) / 7) * 7;

  return Array.from({ length: totalSlots }, (_, index) => {
    const dayNumber = index - leadingSlots + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return { kind: "placeholder" as const, key: `placeholder-${index}` };
    }

    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    return {
      kind: "day" as const,
      key: iso,
      dayNumber,
      entry: map.get(iso) || null,
    };
  });
}

function buildRecentMoodDays(totalDays = 12) {
  const map = new Map(trackEntries.map((entry) => [entry.isoDate, entry]));
  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date("2026-03-22");
    date.setDate(date.getDate() - (totalDays - 1 - index));
    const iso = date.toISOString().slice(0, 10);
    return {
      iso,
      label: `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}`,
      entry: map.get(iso) || null,
    };
  });
}

function resolveEmotionTrackKey(value: string): EmotionTrackKey {
  const text = String(value || "").trim();
  if (!text) return "困惑";
  if (text in emotionTrackLibrary) return text as EmotionTrackKey;

  const rules: Array<[EmotionTrackKey, string[]]> = [
    ["恐惧", ["恐惧", "害怕", "惊慌", "可怕", "压迫"]],
    ["焦虑", ["焦虑", "紧张", "不安", "迟疑", "担心", "徘徊"]],
    ["困惑", ["困惑", "迷惘", "迷茫", "疑惑", "看不清", "不知道"]],
    ["悲伤", ["悲伤", "失落", "怀旧", "难过", "想念"]],
    ["疲惫", ["疲惫", "失重", "沉重", "困倦", "下沉"]],
    ["释然", ["释然", "放下", "松开", "轻松"]],
    ["兴奋", ["兴奋", "激动", "雀跃", "被吸引", "期待"]],
    ["安宁", ["安宁", "平静", "安静", "宁静", "平和"]],
  ];

  return rules.find(([, kws]) => kws.some((kw) => text.includes(kw)))?.[0] || "困惑";
}

function buildSmoothMoodPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function HeroMoodTrack() {
  const days = buildRecentMoodDays();
  const step = 52;
  const startX = 30;
  const trackWidth = startX * 2 + step * (days.length - 1);

  const slots = days.map((day, index) => {
    const entry = day.entry;
    const key = entry ? resolveEmotionTrackKey(entry.emotion) : null;
    return {
      x: startX + index * step,
      day,
      entry,
      mood: key ? { key, raw: entry?.emotion || key, ...emotionTrackLibrary[key] } : null,
    };
  });

  const segments: Array<Array<{ x: number; y: number }>> = [];
  let current: Array<{ x: number; y: number }> = [];
  slots.forEach((slot) => {
    if (slot.mood) current.push({ x: slot.x, y: slot.mood.level });
    else if (current.length) {
      segments.push(current);
      current = [];
    }
  });
  if (current.length) segments.push(current);

  return (
    <div className="relative w-full">
      <div className="relative h-[188px] max-md:h-[176px]" style={{ width: trackWidth }}>
        <svg
          viewBox={`0 0 ${trackWidth} 160`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-0 top-[38px] h-[104px] w-full overflow-visible"
          fill="none"
          aria-hidden="true"
        >
          {segments.map((segment, index) =>
            segment.length > 1 ? (
              <path
                key={index}
                d={buildSmoothMoodPath(segment)}
                stroke="rgba(217,208,246,0.34)"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="[filter:drop-shadow(0_0_8px_rgba(167,144,245,0.1))]"
              />
            ) : null
          )}
        </svg>

        {slots.map((slot) => {
          if (!slot.entry || !slot.mood) {
            return (
              <div
                key={slot.day.iso}
                className="pointer-events-none absolute top-0 h-[188px] w-14 -translate-x-1/2 max-md:h-[176px]"
                style={{ left: slot.x }}
              >
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.68rem] font-medium tracking-[0.05em] text-[rgba(145,139,174,0.32)]">
                  {slot.day.label}
                </span>
              </div>
            );
          }

          const summary = `${slot.entry.summary.slice(0, 26)}${slot.entry.summary.length > 26 ? "…" : ""}`;
          return (
            <button
              key={slot.day.iso}
              type="button"
              className="group absolute top-0 h-[188px] w-14 -translate-x-1/2 bg-transparent p-0 max-md:h-[176px]"
              style={{ left: slot.x }}
            >
              <span
                className="absolute left-1/2 inline-flex h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[12px] border border-white/[0.07] bg-[radial-gradient(circle_at_50%_26%,rgba(234,229,255,0.08)_0%,rgba(255,255,255,0.01)_66%),linear-gradient(180deg,rgba(255,255,255,0.028)_0%,rgba(255,255,255,0.01)_100%)] shadow-[0_0_14px_rgba(131,110,223,0.05),inset_0_1px_0_rgba(255,255,255,0.035)] transition duration-500 group-hover:border-white/[0.1] group-hover:shadow-[0_0_18px_rgba(131,110,223,0.08),inset_0_1px_0_rgba(255,255,255,0.04)]"
                style={{ top: slot.mood.level - 18, color: slot.mood.accent }}
              >
                {emotionTrackLibrary[slot.mood.key].icon}
              </span>
              <span
                className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ top: slot.mood.level, background: slot.mood.accent, boxShadow: `0 0 10px ${slot.mood.accent}` }}
              />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.68rem] font-medium tracking-[0.05em] text-[rgba(164,157,194,0.54)]">
                {slot.day.label}
              </span>
              <span
                className="pointer-events-none absolute left-1/2 flex min-w-[136px] max-w-[168px] -translate-x-1/2 translate-y-1.5 scale-[0.98] flex-col gap-1 rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(20,18,42,0.94)_0%,rgba(13,12,30,0.92)_100%)] px-[11px] py-[10px] opacity-0 shadow-[0_18px_36px_rgba(5,6,18,0.28),inset_0_1px_0_rgba(255,255,255,0.035)] transition duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-focus:translate-y-0 group-focus:scale-100 group-focus:opacity-100"
                style={{ top: slot.mood.level - 84 }}
              >
                <span className="text-[0.65rem] tracking-[0.05em] text-[rgba(182,174,214,0.56)]">{slot.day.label}</span>
                <strong className="text-[0.84rem] font-semibold text-[rgba(244,240,255,0.9)]">{slot.entry.emotion}</strong>
                <span className="text-[0.76rem] text-[rgba(205,197,234,0.72)]">{slot.entry.title}</span>
                <em className="text-[0.74rem] not-italic leading-[1.6] text-[rgba(184,177,213,0.58)]">
                  {summary}
                </em>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DreamTotemJournalPage() {
  const monthYear = 2026;
  const monthIndex = 2;
  const days = buildMonthCalendar(monthYear, monthIndex);
  const monthEntries = trackEntries.filter((entry) => entry.isoDate.startsWith("2026-03"));
  const activeDays = new Set(trackEntries.map((entry) => entry.isoDate)).size;
  const totemCounts = monthEntries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.totem] = (acc[entry.totem] || 0) + 1;
    return acc;
  }, {});
  const emotionCounts = monthEntries.reduce<Record<string, number>>((acc, entry) => {
    const key = resolveEmotionTrackKey(entry.emotion);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topTotemEntry = Object.entries(totemCounts).sort((a, b) => b[1] - a[1])[0];
  const topEmotionEntry = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
  const topTotemKey = (topTotemEntry?.[0] || "forest") as TotemKey;
  const topEmotionKey = (topEmotionEntry?.[0] || "困惑") as EmotionTrackKey;
  const topTotemCount = topTotemEntry?.[1] || 0;
  const topEmotionCount = topEmotionEntry?.[1] || 0;
  const weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  return (
    <main className="min-h-screen bg-[#090814] px-5 pb-24 pt-28 text-white md:px-8">
      <div className="mx-auto max-w-[1080px]">
        <header className="relative mx-auto mb-[42px] block max-w-[1080px] overflow-hidden rounded-[36px] border border-white/[0.05] bg-[radial-gradient(78%_66%_at_50%_0%,rgba(139,115,230,0.18)_0%,rgba(139,115,230,0.06)_24%,transparent_60%),linear-gradient(180deg,rgba(14,12,31,0.94)_0%,rgba(9,8,22,0.9)_100%)] px-[34px] pb-8 pt-[calc(var(--ds-nav-h,72px)+34px)] shadow-[0_32px_92px_rgba(5,6,18,0.34),inset_0_1px_0_rgba(255,255,255,0.035)] max-lg:pt-[calc(var(--ds-nav-h,72px)+28px)] max-md:rounded-[28px] max-md:px-5 max-md:pb-7">
          <div className="pointer-events-none absolute left-1/2 top-0 h-60 w-[min(760px,86vw)] -translate-x-1/2 bg-[radial-gradient(circle_at_50%_10%,rgba(160,136,246,0.18)_0%,rgba(160,136,246,0.06)_24%,transparent_66%)] opacity-[0.92] blur-[12px]" />
          <div className="pointer-events-none absolute right-[-8%] top-[18%] h-[58%] w-[34%] bg-[radial-gradient(circle_at_50%_50%,rgba(158,141,230,0.1)_0%,transparent_74%)] opacity-[0.46] blur-[20px]" />

          <div className="relative z-10 grid items-center gap-[clamp(28px,4vw,72px)] lg:grid-cols-[minmax(0,1.02fr)_minmax(340px,0.98fr)]">
            <div className="max-w-[536px] pl-6 pt-7 max-lg:max-w-[640px] max-md:pl-0 max-md:pt-0">
              <div className="inline-flex items-center whitespace-nowrap text-[0.7rem] tracking-[0.16em] text-[rgba(188,181,219,0.48)] max-sm:text-[0.66rem]">
                我的梦境日记
              </div>
              <h1 className="mt-[14px] max-w-[8ch] font-['Noto_Serif_SC'] text-[clamp(1.72rem,3.1vw,2.5rem)] font-semibold leading-[1.18] tracking-[0.01em] text-[rgba(244,239,255,0.92)] [text-shadow:0_0_16px_rgba(154,126,250,0.04)] max-sm:mt-4 max-sm:text-[clamp(1.7rem,8.2vw,2.18rem)]">
                记录每一个梦
              </h1>
              <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-[1.9] text-[rgba(205,198,232,0.8)] max-sm:text-[0.98rem]">
                那些被记住的梦，会在这里慢慢留下形状。
              </p>
            </div>

            <div className="justify-self-end pr-2 pt-2 max-lg:justify-self-stretch max-lg:pr-0">
              <div className="relative min-h-[214px] w-full max-w-[520px]">
                <span className="pointer-events-none absolute inset-[18px_6%_30px_10%] bg-[radial-gradient(circle_at_56%_28%,rgba(178,161,245,0.1)_0%,rgba(178,161,245,0.04)_28%,transparent_66%),radial-gradient(circle_at_72%_74%,rgba(123,101,214,0.08)_0%,transparent_46%)] opacity-[0.62] blur-[18px]" />
                <span className="pointer-events-none absolute inset-[24px_4%_20px_12%] bg-[radial-gradient(72%_82%_at_38%_58%,transparent_71.4%,rgba(194,182,246,0.05)_72.1%,transparent_73.4%),radial-gradient(58%_68%_at_84%_42%,transparent_76.4%,rgba(194,182,246,0.042)_77.1%,transparent_78.1%)] opacity-50" />
                <div className="relative z-10">
                  <HeroMoodTrack />
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-[18px] grid items-end gap-[clamp(16px,3vw,34px)] px-6 pt-2 lg:grid-cols-[minmax(260px,392px)_auto] max-md:px-0">
            <div className="inline-flex w-full max-w-[392px] items-center rounded-[23px] border border-white/[0.03] bg-[radial-gradient(circle_at_18%_0%,rgba(196,183,246,0.055)_0%,transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.012)_0%,rgba(255,255,255,0.004)_100%)] p-[6px] shadow-[0_14px_34px_rgba(5,6,18,0.1),inset_0_1px_0_rgba(255,255,255,0.024)] max-md:max-w-full">
              <div className="relative min-h-[37px] w-full bg-transparent pr-0">
                <i className="fas fa-search pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[0.74rem] text-[rgba(168,160,199,0.26)]" />
                <input
                  disabled
                  placeholder="搜索梦题、内容或图腾"
                  className="h-full w-full rounded-full border border-white/[0.028] bg-[linear-gradient(180deg,rgba(255,255,255,0.018)_0%,rgba(255,255,255,0.007)_100%)] pl-[34px] pr-[33px] text-[0.79rem] text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none placeholder:text-[rgba(166,159,198,0.3)]"
                />
              </div>
            </div>

            <div className="relative z-10 inline-flex flex-wrap items-center justify-end gap-[11px] pr-0.5 pb-0.5 max-lg:justify-start">
              <span className="inline-flex items-center whitespace-nowrap text-[0.75rem] tracking-[0.02em] text-[rgba(188,181,219,0.54)] max-md:text-[0.76rem]">
                已收留 {trackEntries.length} 个梦
              </span>
              <button className="min-h-[34px] rounded-full bg-[linear-gradient(180deg,rgba(152,125,242,0.7)_0%,rgba(122,102,214,0.64)_100%)] px-[15px] text-[0.82rem] font-medium text-white shadow-[0_8px_18px_rgba(97,79,191,0.1),inset_0_1px_0_rgba(255,255,255,0.07)] transition hover:-translate-y-px hover:shadow-[0_10px_20px_rgba(97,79,191,0.12),inset_0_1px_0_rgba(255,255,255,0.085)] max-md:min-h-[38px]">
                手动记录
              </button>
            </div>
          </div>
        </header>

        <section className="relative mx-auto mt-10 w-full max-w-[880px]">
          <span className="pointer-events-none absolute inset-x-[14%] top-[-14px] h-24 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(183,165,246,0.12)_0%,transparent_72%)] opacity-55 blur-3xl [animation:dy-month-mist_22s_ease-in-out_infinite]" />

          <div className="relative overflow-hidden rounded-[30px] border border-white/[0.05] bg-[radial-gradient(78%_68%_at_50%_-8%,rgba(160,124,255,0.09)_0%,transparent_58%),linear-gradient(180deg,rgba(11,10,27,0.8)_0%,rgba(8,8,20,0.72)_100%)] p-[18px] shadow-[0_24px_68px_rgba(2,4,14,0.32),0_0_56px_rgba(103,82,183,0.08),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <span className="pointer-events-none absolute inset-x-[12%] bottom-[-10%] h-[180px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(149,122,246,0.14)_0%,rgba(149,122,246,0.06)_26%,transparent_72%)] opacity-45 blur-[28px] [animation:dy-month-mist_20s_ease-in-out_infinite]" />

            <div className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.05] bg-[radial-gradient(110%_88%_at_50%_0%,rgba(160,124,255,0.08)_0%,transparent_54%),radial-gradient(48%_34%_at_50%_40%,rgba(122,102,214,0.06)_0%,transparent_74%),linear-gradient(180deg,rgba(15,13,34,0.92)_0%,rgba(11,10,26,0.88)_100%)] px-7 py-[30px] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_0_54px_rgba(141,104,255,0.08),0_18px_38px_rgba(3,4,14,0.2)] max-md:rounded-[22px] max-md:px-[18px] max-md:py-[22px]">
              <span className="pointer-events-none absolute inset-x-[12%] top-0 h-[132px] rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(211,199,255,0.12)_0%,rgba(211,199,255,0.04)_36%,transparent_72%)] opacity-50 blur-[24px] [animation:dy-month-mist_22s_ease-in-out_infinite]" />
              <span className="pointer-events-none absolute inset-[96px_34px_118px] rounded-[999px] bg-[radial-gradient(72%_94%_at_50%_18%,transparent_66.4%,rgba(194,182,246,0.05)_67.2%,transparent_68.2%),radial-gradient(56%_70%_at_76%_68%,transparent_72.4%,rgba(181,169,236,0.038)_73%,transparent_74%),radial-gradient(48%_64%_at_24%_74%,transparent_74.6%,rgba(181,169,236,0.03)_75.2%,transparent_76.2%)] opacity-60" />
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="w-full max-w-[560px]">
                  <h2 className="font-['Noto_Serif_SC'] text-[clamp(1.3rem,1.55vw,1.56rem)] font-semibold leading-[1.08] tracking-[0.01em] text-[rgba(246,242,255,0.98)] [text-shadow:0_0_28px_rgba(162,127,255,0.12)] max-md:text-[1.18rem]">
                    梦境图腾
                  </h2>
                  <p className="mt-3 w-full max-w-[540px] text-[0.88rem] leading-[1.82] tracking-[0.01em] text-[rgba(200,194,226,0.66)] max-md:mt-2.5 max-md:text-[0.82rem] max-md:leading-[1.78]">
                    每一次记录都会留下一个主意向符号，它们会在时间里慢慢组成你的梦境轨迹。
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-[30px] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative inline-block font-['Noto_Serif_SC'] text-[clamp(1.02rem,1.34vw,1.14rem)] font-semibold tracking-[0.08em] text-[rgba(237,232,250,0.86)] [text-shadow:0_0_12px_rgba(160,133,246,0.05)] before:absolute before:left-[-18px] before:right-[-18px] before:top-1/2 before:h-[34px] before:-translate-y-1/2 before:rounded-full before:bg-[radial-gradient(circle_at_50%_50%,rgba(192,176,246,0.08)_0%,rgba(192,176,246,0.03)_34%,transparent_72%)] before:opacity-50 before:blur-[10px] before:content-[''] max-md:text-[0.9rem]">
                  2026 年 3 月
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" disabled className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.028)_0%,rgba(255,255,255,0.014)_100%)] text-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] max-md:h-7 max-md:w-7">
                    <i className="fas fa-chevron-left text-[0.72rem]" />
                  </button>
                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex min-h-8 items-center rounded-full border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.028)_0%,rgba(255,255,255,0.014)_100%)] pr-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                      <select disabled className="min-w-[88px] appearance-none bg-transparent px-3.5 text-[0.74rem] tracking-[0.05em] text-white/70 outline-none max-md:h-[30px] max-md:text-[0.72rem]">
                        <option>2026 年</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.72rem] text-white/45">▾</span>
                    </label>
                    <label className="relative inline-flex min-h-8 items-center rounded-full border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.028)_0%,rgba(255,255,255,0.014)_100%)] pr-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                      <select disabled className="min-w-[76px] appearance-none bg-transparent px-3.5 text-[0.74rem] tracking-[0.05em] text-white/70 outline-none max-md:h-[30px] max-md:text-[0.72rem]">
                        <option>3 月</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.72rem] text-white/45">▾</span>
                    </label>
                  </div>
                  <button type="button" disabled className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.028)_0%,rgba(255,255,255,0.014)_100%)] text-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] max-md:h-7 max-md:w-7">
                    <i className="fas fa-chevron-right text-[0.72rem]" />
                  </button>
                </div>
              </div>

              <div className="relative z-10 mt-6 rounded-[26px] py-2">
                <span className="pointer-events-none absolute inset-[7%_8%_16%] rounded-[999px] bg-[radial-gradient(circle_at_50%_44%,rgba(155,129,246,0.12)_0%,rgba(155,129,246,0.04)_28%,transparent_70%)] opacity-50 blur-[24px] [animation:dy-month-mist_24s_ease-in-out_infinite]" />
                <span className="pointer-events-none absolute left-[13%] top-[17%] h-[38%] w-[66%] rounded-[50%] border-t border-white/[0.07] opacity-[0.18] [transform:rotate(-7deg)] [animation:dy-month-arc_18s_ease-in-out_infinite]" />
                <span className="pointer-events-none absolute right-[6%] top-[42%] h-[24%] w-[44%] rounded-[50%] border-t border-white/[0.05] opacity-[0.14] [transform:rotate(9deg)] [animation:dy-month-arc_22s_ease-in-out_infinite_reverse]" />
                <div className="min-w-0 max-lg:overflow-x-auto max-lg:pb-0.5">
                  <div className="mb-[18px] grid grid-cols-7 gap-[18px] px-0.5 max-lg:min-w-[560px] max-md:mb-2 max-md:gap-2.5 max-sm:min-w-[520px]">
                    {weekdays.map((label) => (
                      <span
                        key={label}
                        className="inline-flex min-h-4 items-center justify-center text-[0.54rem] font-normal tracking-[0.16em] text-[rgba(154,147,186,0.3)]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-[18px] max-lg:min-w-[560px] max-md:gap-2.5 max-sm:min-w-[520px]">
                    {days.map((day) => {
                      if (day.kind === "placeholder") {
                        return (
                          <span
                            key={day.key}
                            className="min-h-[70px] bg-transparent max-md:min-h-[58px]"
                          />
                        );
                      }

                      if (!day.entry) {
                        return (
                          <span
                            key={day.key}
                            className="flex min-h-[78px] flex-col items-center justify-start gap-[10px] bg-transparent max-md:min-h-[64px] max-md:gap-[8px]"
                          >
                            <span className="inline-flex min-h-[14px] items-center justify-center text-center text-[0.61rem] font-normal tracking-[0.08em] text-[rgba(167,160,199,0.52)]">
                              {day.dayNumber}
                            </span>
                            <span className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.016)_0%,rgba(255,255,255,0.008)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] max-md:h-[34px] max-md:w-[34px]">
                              <span className="h-[4.5px] w-[4.5px] rounded-full bg-[rgba(170,163,203,0.3)] shadow-[0_0_10px_rgba(171,163,212,0.1)]" />
                            </span>
                          </span>
                        );
                      }

                      return (
                        <button
                          key={day.key}
                          type="button"
                          title={day.entry.title}
                          className="flex min-h-[78px] flex-col items-center justify-start gap-[10px] bg-transparent text-white/88 transition duration-500 max-md:min-h-[64px] max-md:gap-[8px]"
                        >
                          <span className="inline-flex min-h-[14px] items-center justify-center text-center text-[0.61rem] font-normal tracking-[0.08em] text-[rgba(198,191,228,0.74)]">
                            {day.dayNumber}
                          </span>
                          <span className="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-white/[0.065] bg-[radial-gradient(circle_at_50%_32%,rgba(208,193,255,0.08)_0%,rgba(255,255,255,0.012)_64%)] text-white/[0.8] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_20px_rgba(132,111,220,0.04)] transition duration-500 hover:-translate-y-px hover:border-white/[0.14] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_22px_rgba(132,111,220,0.1)] max-md:h-[34px] max-md:w-[34px]">
                            <span
                              className="pointer-events-none absolute inset-[-8px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(183,165,246,0.14)_0%,rgba(183,165,246,0.05)_36%,transparent_72%)] opacity-[0.34] [animation:dy-month-node_10.5s_ease-in-out_infinite]"
                              style={{ animationDelay: `${(Number(day.dayNumber) % 5) * -1.8}s` }}
                            />
                            <span className="inline-flex h-[17px] w-[17px] items-center justify-center text-[rgba(236,230,255,0.9)] leading-none translate-y-[-0.5px] [filter:drop-shadow(0_0_10px_rgba(181,160,245,0.18))] [&>svg]:block [&>svg]:h-full [&>svg]:w-full max-md:h-[14px] max-md:w-[14px]">
                              {totems[day.entry.totem].icon}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-7 grid gap-[14px] md:grid-cols-[minmax(0,1.22fr)_minmax(0,1fr)]">
                <span className="pointer-events-none absolute inset-x-[12%] top-[-18px] h-[72px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(185,169,245,0.1)_0%,transparent_74%)] opacity-45 blur-[24px]" />
                <div className="relative overflow-hidden rounded-[20px] border border-white/[0.045] bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.012)_100%)] px-[17px] py-4 shadow-[0_18px_34px_rgba(3,4,14,0.12),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[10px]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(210,197,255,0.08)_0%,transparent_58%)] opacity-80" />
                  <div className="relative text-[0.7rem] tracking-[0.14em] text-[rgba(174,167,205,0.46)]">
                    本月反复出现
                  </div>
                  <div className="relative mt-2 grid grid-cols-[38px_minmax(0,1fr)] gap-3">
                    <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[13px] border border-white/[0.05] bg-[radial-gradient(circle_at_50%_30%,rgba(215,202,255,0.12)_0%,rgba(255,255,255,0.02)_62%)] text-white/[0.84]">
                      {totems[topTotemKey].icon}
                    </span>
                    <div>
                      <strong className="block text-[0.96rem] font-semibold text-white/92">
                        {totems[topTotemKey].label}（{topTotemCount} 次）
                      </strong>
                      <p className="mt-1 text-[0.81rem] leading-[1.8] text-white/[0.66]">
                        {totems[topTotemKey].hint}，它最近像一种仍未说完的方向感。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[20px] border border-white/[0.045] bg-[linear-gradient(180deg,rgba(255,255,255,0.024)_0%,rgba(255,255,255,0.01)_100%)] px-[17px] py-4 shadow-[0_18px_34px_rgba(3,4,14,0.12),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-[10px]">
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(210,197,255,0.08)_0%,transparent_58%)] opacity-80" />
                  <div className="relative text-[0.7rem] tracking-[0.14em] text-[rgba(174,167,205,0.46)]">
                    本月主要情绪
                  </div>
                  <div className="relative mt-2 grid grid-cols-[38px_minmax(0,1fr)] gap-3">
                    <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[13px] border border-white/[0.05] bg-[radial-gradient(circle_at_50%_30%,rgba(215,202,255,0.12)_0%,rgba(255,255,255,0.02)_62%)] text-white/[0.8]">
                      {emotionTrackLibrary[topEmotionKey].icon}
                    </span>
                    <div>
                      <strong className="block text-[0.96rem] font-semibold text-white/92">
                        {topEmotionKey}（{topEmotionCount} 次）
                      </strong>
                      <p className="mt-1 text-[0.81rem] leading-[1.8] text-white/[0.66]">
                        这种情绪在这个月里反复停留，像一段仍在缓慢显影中的内在状态。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <style>{`
        @keyframes dy-month-mist {
          0%, 100% {
            transform: translate3d(-3%, 0, 0) scale(0.98);
            opacity: 0.34;
          }
          50% {
            transform: translate3d(3%, -2%, 0) scale(1.04);
            opacity: 0.58;
          }
        }

        @keyframes dy-month-arc {
          0%, 100% {
            opacity: 0.12;
          }
          50% {
            opacity: 0.24;
          }
        }

        @keyframes dy-month-node {
          0%, 100% {
            opacity: 0.22;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.46;
            transform: scale(1.08);
          }
        }
      `}</style>
    </main>
  );
}
