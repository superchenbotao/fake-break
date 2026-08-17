import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ASH_VISIBLE_THRESHOLD, getAttachedAshHeightPx, getBurnOffsetPx } from "./ashPhysics";
import { AD_CONFIG, HOUSE_ADS, SUPPORT_CONFIG, type UnlockRule } from "./monetization";

type Pack = {
  id: string;
  name: string;
  mood: string;
  flavor: string;
  line: string;
  price: string;
  rule: UnlockRule;
  /** Route C: this pack also accepts a direct supporter payment. */
  paid?: boolean;
  color: string;
  glow: string;
  /** Cover-art motif shared by the shelf card and the box face. */
  motif: "sunburst" | "stripes" | "dots" | "waves";
  /** Word printed down the cigarette paper. */
  stick: string;
  paperTint: string;
  filterColor: string;
  bandColor: string;
};

type SmokeRing = {
  id: number;
  kind: "single" | "double" | "halo";
};

type View = "home" | "packs" | "unbox" | "ritual" | "privacy" | "about";
type LightMode = "match" | "lighter";

const PACKS: Pack[] = [
  {
    id: "blue-hour",
    name: "Blue Hour",
    mood: "COOL AIR · CLEAN EXIT",
    flavor: "Icy finish · tastes like nothing, elegantly",
    line: "For cravings that think they’re cinematic.",
    price: "$4",
    rule: { kind: "sessions", count: 0 },
    color: "#33507e",
    glow: "#8ab8ff",
    motif: "waves",
    stick: "FAKE",
    paperTint: "#f2efe8",
    filterColor: "#b7824c",
    bandColor: "#d8b96a",
  },
  {
    id: "golden-alibi",
    name: "Golden Alibi",
    mood: "WARM LIGHT · NO EVIDENCE",
    flavor: "Toasted honey · completely imaginary",
    line: "Looks expensive. Costs you zero lungs.",
    price: "$6",
    rule: { kind: "sessions", count: 2 },
    color: "#a5741a",
    glow: "#ffd95e",
    motif: "sunburst",
    stick: "ALIBI",
    paperTint: "#f6efdd",
    filterColor: "#a06a34",
    bandColor: "#ffd95e",
  },
  {
    id: "soft-reset",
    name: "Soft Reset",
    mood: "QUIET MIND · FRESH START",
    flavor: "Rain on concrete · suspiciously calming",
    line: "The craving was a notification. Dismissed.",
    price: "$5",
    rule: { kind: "sessions", count: 4 },
    color: "#4e5b51",
    glow: "#b7d2bd",
    motif: "dots",
    stick: "RESET",
    paperTint: "#f6f4ee",
    filterColor: "#9aa88f",
    bandColor: "#c9d8c4",
  },
  {
    id: "night-shift",
    name: "Night Shift",
    mood: "3AM CLARITY · NO REGRETS",
    flavor: "Cold coffee steam · fluorescent calm",
    line: "For the craving that clocks in after dark.",
    price: "$9",
    rule: { kind: "sessions", count: 8 },
    color: "#1f2b4a",
    glow: "#6f8fff",
    motif: "stripes",
    stick: "NIGHT",
    paperTint: "#eceef4",
    filterColor: "#2e2a26",
    bandColor: "#c9ccd4",
  },
  {
    id: "first-light",
    name: "First Light",
    mood: "DAWN PATROL · FRESH PAGE",
    flavor: "Cold sunrise · faint orange peel",
    line: "The morning you didn’t smoke tastes better.",
    price: "$11",
    rule: { kind: "sessions", count: 14 },
    color: "#7a4a52",
    glow: "#ffb3c1",
    motif: "sunburst",
    stick: "DAWN",
    paperTint: "#f7efe6",
    filterColor: "#caa06a",
    bandColor: "#f4c7cf",
  },
  {
    id: "main-character",
    name: "Main Character",
    mood: "FULL DRAMA · ZERO SMOKE",
    flavor: "Velvet and thunder · none of it real",
    line: "All the entrance. None of the ashtray.",
    price: "$12",
    rule: { kind: "ad", count: 1 },
    paid: true,
    color: "#5e2a68",
    glow: "#db81ee",
    motif: "sunburst",
    stick: "DRAMA",
    paperTint: "#f4eef6",
    filterColor: "#3d1d46",
    bandColor: "#db81ee",
  },
  {
    id: "paper-trail",
    name: "Paper Trail",
    mood: "BUREAUCRATIC · ODDLY SATISFYING",
    flavor: "Fresh printer toner · faint triumph",
    line: "Filed under: things you didn’t smoke.",
    price: "$7",
    rule: { kind: "ad", count: 2 },
    paid: true,
    color: "#43506b",
    glow: "#a9c1e8",
    motif: "stripes",
    stick: "FILED",
    paperTint: "#f4f3ee",
    filterColor: "#5a6478",
    bandColor: "#a9c1e8",
  },
  {
    id: "velvet-static",
    name: "Velvet Static",
    mood: "LOW SIGNAL · HIGH DRAMA",
    flavor: "Dark cherry static · velvet reverb",
    line: "Tuned to the frequency of almost.",
    price: "$10",
    rule: { kind: "ad", count: 1 },
    paid: true,
    color: "#6e1f2e",
    glow: "#ff8fa3",
    motif: "dots",
    stick: "VELVET",
    paperTint: "#f6ecec",
    filterColor: "#4a1620",
    bandColor: "#d8a24a",
  },
  {
    id: "gaslight",
    name: "Gaslight",
    mood: "WARM · QUESTIONABLE",
    flavor: "Toasted marshmallow · trust issues",
    line: "Tastes like you imagined the craving. You did.",
    price: "$9",
    rule: { kind: "ad", count: 1 },
    paid: true,
    color: "#7e3b1f",
    glow: "#ffab7a",
    motif: "waves",
    stick: "TRUST",
    paperTint: "#f7f0e4",
    filterColor: "#8a5a30",
    bandColor: "#ffab7a",
  },
  {
    id: "midnight-snack",
    name: "Midnight Snack",
    mood: "SWEET · 2AM ENERGY",
    flavor: "Vanilla static · zero calories",
    line: "The fridge was never the answer either.",
    price: "$8",
    rule: { kind: "ad", count: 1 },
    paid: true,
    color: "#3a3f7a",
    glow: "#9aa4ff",
    motif: "dots",
    stick: "2AM",
    paperTint: "#eef0f8",
    filterColor: "#3c3660",
    bandColor: "#9aa4ff",
  },
  {
    id: "old-money",
    name: "Old Money",
    mood: "LEATHER · QUIET ARROGANCE",
    flavor: "Mahogany library · inherited confidence",
    line: "Smells like a yacht you’ve never been on.",
    price: "$25",
    rule: { kind: "ad", count: 2 },
    paid: true,
    color: "#274435",
    glow: "#8fd4a8",
    motif: "stripes",
    stick: "EST. 0mg",
    paperTint: "#f2f0e4",
    filterColor: "#22382c",
    bandColor: "#d4af37",
  },
  {
    id: "lucky-ghost",
    name: "Lucky Ghost",
    mood: "PALE LUCK · VANISHING ACT",
    flavor: "White tea mist · barely there",
    line: "The cigarette that quit before you did.",
    price: "$30",
    rule: { kind: "ad", count: 3 },
    paid: true,
    color: "#3d4f4a",
    glow: "#b8f0d4",
    motif: "waves",
    stick: "LUCKY",
    paperTint: "#fbfaf5",
    filterColor: "#8fae9e",
    bandColor: "#e8e4d8",
  },
];

const QUIPS = [
  "Nicotine called. You sent it to voicemail.",
  "A smoke break with the smoke edited out.",
  "Maximum ritual. Minimum terrible decision.",
  "You did the dramatic pause. That was enough.",
];

const SOUPS = [
  "The cigarette is fake. The craving was real. So is the win.",
  "Cravings are just notifications. Swipe left.",
  "You don’t miss smoking. Your hands miss having a job.",
  "It’s not willpower. It’s outlasting a three-minute urge.",
  "Every fake one is a real no.",
  "Ash falls. So do cravings.",
  "Somewhere, your lungs are quietly high-fiving.",
];

const AMBIENT_LINES = [
  "Picture a balcony",
  "The wind is doing you a favor",
  "Nobody needs you for three minutes",
  "Busy hands, quiet mind",
  "You never needed the real one",
  "Slow down. That’s the whole point.",
];

const SCENES = ["Balcony · night", "Corner store", "Rainy window", "Rooftop wind"];
const SCENE_ICONS = ["🏙", "🏪", "🌧", "🍃"];

const MILESTONES = [
  { days: 0, label: "20 min", desc: "Blood pressure and pulse ease off" },
  { days: 1, label: "24 hours", desc: "Carbon monoxide clears your blood" },
  { days: 2, label: "48 hours", desc: "Taste and smell clock back in" },
  { days: 7, label: "1 week", desc: "Less coughing, easier breathing" },
  { days: 14, label: "2 weeks", desc: "Lung function starts climbing" },
  { days: 30, label: "1 month", desc: "Cravings lose their grip" },
];

const MAX_INHALE_MS = 2200;
const DAILY_GOAL = 8;
const PACK_SIZE = 10;
const ASH_OVERFLOW = 100;
const CRAVING_WAVE_SECONDS = 150; // urges typically crest near 90s, gone by ~2.5 min
const CIGARETTE_PRICE = 0.5; // rough dollars saved per real cigarette skipped

type SavedState = {
  sessions: number;
  streak: number;
  lastDate: string;
  todayCount: number;
  totalPuffs: number;
  totalFlicks: number;
  totalRings: number;
  shares: number;
  selectedPackId: string;
  packCounts: Record<string, number>;
  adProgress: Record<string, number>;
  paidUnlocks: string[];
};

const FALLBACK_STATE: SavedState = {
  sessions: 0,
  streak: 0,
  lastDate: "",
  todayCount: 0,
  totalPuffs: 0,
  totalFlicks: 0,
  totalRings: 0,
  shares: 0,
  selectedPackId: PACKS[0].id,
  packCounts: {},
  adProgress: {},
  paidUnlocks: [],
};

function loadSavedState(): SavedState {
  try {
    const raw = window.localStorage.getItem("fake-break-state");
    if (!raw) return FALLBACK_STATE;
    const saved = JSON.parse(raw) as Partial<SavedState>;
    return { ...FALLBACK_STATE, ...saved };
  } catch {
    return FALLBACK_STATE;
  }
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

/** Route C: did we just land back from the supporter checkout? */
function isPaymentReturn(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(SUPPORT_CONFIG.successParam) === SUPPORT_CONFIG.successValue;
  } catch {
    return false;
  }
}

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function periodOfDay(hour: number) {
  if (hour < 5) return "Late night";
  if (hour < 9) return "Early morning";
  if (hour < 12) return "Late morning";
  if (hour < 14) return "Midday";
  if (hour < 18) return "Afternoon";
  if (hour < 23) return "Late evening";
  return "Midnight";
}

export default function Home() {
  const [savedState] = useState(loadSavedState);
  const [sessions, setSessions] = useState(savedState.sessions);
  const [streak, setStreak] = useState(savedState.streak);
  const [lastDate, setLastDate] = useState(savedState.lastDate);
  const [todayCount, setTodayCount] = useState(savedState.todayCount);
  const [totalPuffs, setTotalPuffs] = useState(savedState.totalPuffs);
  const [totalFlicks, setTotalFlicks] = useState(savedState.totalFlicks);
  const [totalRings, setTotalRings] = useState(savedState.totalRings);
  const [shares, setShares] = useState(savedState.shares);
  const [selectedPackId, setSelectedPackId] = useState(savedState.selectedPackId);
  const [packCounts, setPackCounts] = useState(savedState.packCounts);
  const [adProgress, setAdProgress] = useState(savedState.adProgress);
  const [paidUnlocks] = useState(() => {
    if (!isPaymentReturn()) return savedState.paidUnlocks;
    // Supporter pass: one checkout unlocks every pack.
    const all = PACKS.map((pack) => pack.id);
    return Array.from(new Set([...savedState.paidUnlocks, ...all]));
  });

  const [view, setView] = useState<View>(() => {
    try {
      const page = new URLSearchParams(window.location.search).get("page");
      return page === "privacy" || page === "about" ? page : "home";
    } catch {
      return "home";
    }
  });
  const [unboxOpen, setUnboxOpen] = useState(false);
  const [lit, setLit] = useState(false);
  const [justLit, setJustLit] = useState(false);
  const [inhaling, setInhaling] = useState(false);
  const [inhaleProgress, setInhaleProgress] = useState(0);
  const [burn, setBurn] = useState(0);
  const [ash, setAsh] = useState(0);
  const [ashAnchorBurn, setAshAnchorBurn] = useState(0);
  const [flickAshHeight, setFlickAshHeight] = useState(0);
  const [ashDropped, setAshDropped] = useState(false);
  const [puffs, setPuffs] = useState(0);
  const [ringCount, setRingCount] = useState(0);
  const [smokeRings, setSmokeRings] = useState<SmokeRing[]>([]);
  const [flicking, setFlicking] = useState(false);
  const [exhaling, setExhaling] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micError, setMicError] = useState("");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [lightMode, setLightMode] = useState<LightMode>("match");
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [shared, setShared] = useState(false);
  const [unlockSheetId, setUnlockSheetId] = useState<string | null>(null);
  const [adForId, setAdForId] = useState<string | null>(null);
  const [adLeft, setAdLeft] = useState(AD_CONFIG.adSeconds);
  const [toast, setToast] = useState(() =>
    isPaymentReturn() ? "Welcome, supporter — every pack unlocked ★" : "",
  );
  const [now, setNow] = useState(() => new Date());

  const inhaleFrame = useRef<number | null>(null);
  const inhaleStartedAt = useRef(0);
  const inhaleProgressRef = useRef(0);
  const inhaleActiveRef = useRef(false);
  const litRef = useRef(false);
  const burnRef = useRef(0);
  const ashRef = useRef(0);
  const ashDropPendingRef = useRef(false);
  const ashDropTimeoutRef = useRef<number | null>(null);
  const flickingRef = useRef(false);
  const noiseFloorRef = useRef(0.015);
  const ringStartedAt = useRef(0);
  const ringId = useRef(0);
  const ringTimeouts = useRef<number[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const inhaleSound = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null);
  const micActiveRef = useRef(false);
  const micFrame = useRef<number | null>(null);
  const micStream = useRef<MediaStream | null>(null);
  const micSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const micAnalyser = useRef<AnalyserNode | null>(null);
  const completedRef = useRef(false);
  const foilDragY = useRef<number | null>(null);
  const cigPointer = useRef<{ y: number; time: number } | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const activePack = PACKS.find((pack) => pack.id === selectedPackId) ?? PACKS[0];
  const packRemaining = packCounts[activePack.id] ?? PACK_SIZE;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "fake-break-state",
        JSON.stringify({
          sessions,
          streak,
          lastDate,
          todayCount: lastDate === today ? todayCount : 0,
          totalPuffs,
          totalFlicks,
          totalRings,
          shares,
          selectedPackId,
          packCounts,
          adProgress,
          paidUnlocks,
        }),
      );
    } catch {
      // The ritual still works when storage is unavailable.
    }
  }, [sessions, streak, lastDate, todayCount, totalPuffs, totalFlicks, totalRings, shares, selectedPackId, packCounts, adProgress, paidUnlocks, today]);

  useEffect(() => {
    litRef.current = lit;
    burnRef.current = burn;
  }, [lit, burn]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  // Craving-wave clock runs only inside the ritual view.
  useEffect(() => {
    if (view !== "ritual") return;
    const timer = window.setInterval(() => setSessionSeconds((value) => value + 1), 1000);
    return () => {
      window.clearInterval(timer);
      setSessionSeconds(0);
    };
  }, [view]);

  useEffect(() => {
    const activeTimeouts = ringTimeouts.current;
    return () => {
      if (inhaleFrame.current) cancelAnimationFrame(inhaleFrame.current);
      if (micFrame.current) cancelAnimationFrame(micFrame.current);
      micStream.current?.getTracks().forEach((track) => track.stop());
      micSource.current?.disconnect();
      activeTimeouts.forEach((timeout) => window.clearTimeout(timeout));
      if (audioContext.current) void audioContext.current.close();
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!soundOn) return null;
    const context = audioContext.current ?? new AudioContext();
    audioContext.current = context;
    if (context.state === "suspended") void context.resume();
    return context;
  }, [soundOn]);

  const playTone = useCallback((frequency: number, duration: number, volume = 0.045, endFrequency = frequency) => {
    const context = getAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const nowTime = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, nowTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), nowTime + duration);
    gain.gain.setValueAtTime(volume, nowTime);
    gain.gain.exponentialRampToValueAtTime(0.001, nowTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(nowTime);
    oscillator.stop(nowTime + duration);
  }, [getAudioContext]);

  const playNoise = useCallback((duration: number, volume: number, filterFrequency: number) => {
    const context = getAudioContext();
    if (!context) return;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const nowTime = context.currentTime;
    source.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = filterFrequency;
    gain.gain.setValueAtTime(0.001, nowTime);
    gain.gain.linearRampToValueAtTime(volume, nowTime + Math.min(0.08, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.001, nowTime + duration);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(nowTime);
  }, [getAudioContext]);

  const startInhaleSound = () => {
    const context = getAudioContext();
    if (!context || inhaleSound.current) return;
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) channel[index] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = "bandpass";
    filter.frequency.value = 850;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.07, context.currentTime + 0.18);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start();
    inhaleSound.current = { source, gain };
  };

  const stopInhaleSound = () => {
    const current = inhaleSound.current;
    const context = audioContext.current;
    if (!current || !context) return;
    current.gain.gain.cancelScheduledValues(context.currentTime);
    current.gain.gain.setValueAtTime(Math.max(current.gain.gain.value, 0.001), context.currentTime);
    current.gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    current.source.stop(context.currentTime + 0.14);
    inhaleSound.current = null;
  };

  const lightCigarette = () => {
    if (lit || burn >= 95) return;
    setLit(true);
    litRef.current = true;
    setShared(false);
    setJustLit(true);
    if (lightMode === "match") {
      playNoise(0.22, 0.055, 1800);
      playTone(92, 0.24, 0.06, 54);
    } else {
      playNoise(0.09, 0.075, 3400);
      window.setTimeout(() => playNoise(0.3, 0.04, 1200), 70);
      playTone(140, 0.14, 0.045, 70);
    }
    if (navigator.vibrate) navigator.vibrate(35);
    const timeout = window.setTimeout(() => setJustLit(false), 950);
    ringTimeouts.current.push(timeout);
  };

  const extinguishCigarette = () => {
    litRef.current = false;
    setLit(false);
    micActiveRef.current = false;
    if (micFrame.current) cancelAnimationFrame(micFrame.current);
    micStream.current?.getTracks().forEach((track) => track.stop());
    micSource.current?.disconnect();
    setMicOn(false);
    setMicLevel(0);
  };

  const scheduleAshDrop = () => {
    if (ashDropPendingRef.current) return;
    ashDropPendingRef.current = true;
    const dropTimeout = window.setTimeout(() => {
      ashDropTimeoutRef.current = null;
      setAshDropped(true);
      performFlick();
      const clearTimeoutId = window.setTimeout(() => setAshDropped(false), 2400);
      ringTimeouts.current.push(clearTimeoutId);
    }, 620);
    ashDropTimeoutRef.current = dropTimeout;
    ringTimeouts.current.push(dropTimeout);
  };

  const tickInhale = (time: number) => {
    if (!inhaleActiveRef.current) return;
    const next = Math.min(100, ((time - inhaleStartedAt.current) / MAX_INHALE_MS) * 100);
    const delta = next - inhaleProgressRef.current;
    inhaleProgressRef.current = next;
    setInhaleProgress(next);

    // Live burn: the ember eats the paper and grows the ash frame by frame,
    // so mic-driven pulls visibly smolder while you breathe.
    if (delta > 0) {
      const burnNow = Math.min(96, burnRef.current + delta * 0.14);
      burnRef.current = burnNow;
      setBurn(burnNow);
      const ashNow = Math.min(ASH_OVERFLOW, ashRef.current + delta * 0.48);
      ashRef.current = ashNow;
      setAsh(ashNow);
      if (ashNow >= ASH_OVERFLOW) scheduleAshDrop();
      if (burnNow >= 95) {
        extinguishCigarette();
        endInhale(next);
        return;
      }
    }

    if (next >= 100) {
      endInhale(100);
      return;
    }
    inhaleFrame.current = requestAnimationFrame(tickInhale);
  };

  const beginInhale = () => {
    if (!litRef.current || burnRef.current >= 95 || inhaleActiveRef.current) return;
    inhaleActiveRef.current = true;
    inhaleProgressRef.current = 0;
    setInhaling(true);
    setInhaleProgress(0);
    inhaleStartedAt.current = performance.now();
    if (!micActiveRef.current) startInhaleSound();
    inhaleFrame.current = requestAnimationFrame(tickInhale);
  };

  const performFlick = () => {
    if (ashRef.current < ASH_VISIBLE_THRESHOLD || flickingRef.current) return;
    if (ashDropTimeoutRef.current !== null) {
      window.clearTimeout(ashDropTimeoutRef.current);
      ashDropTimeoutRef.current = null;
    }
    flickingRef.current = true;
    setFlickAshHeight(
      getAttachedAshHeightPx(burnRef.current, ashAnchorBurn, ashRef.current),
    );
    setFlicking(true);
    setAsh(0);
    ashRef.current = 0;
    setAshAnchorBurn(burnRef.current);
    ashDropPendingRef.current = false;
    setTotalFlicks((current) => current + 1);
    playNoise(0.11, 0.085, 5200);
    playTone(150, 0.1, 0.04, 90);
    if (navigator.vibrate) navigator.vibrate([18, 25, 18]);
    const timeout = window.setTimeout(() => {
      flickingRef.current = false;
      setFlicking(false);
    }, 620);
    ringTimeouts.current.push(timeout);
  };

  function endInhale(forcedProgress?: number) {
    if (!inhaleActiveRef.current) return;
    inhaleActiveRef.current = false;
    if (inhaleFrame.current) cancelAnimationFrame(inhaleFrame.current);
    inhaleFrame.current = null;
    stopInhaleSound();
    const strength = forcedProgress ?? inhaleProgressRef.current;
    setInhaling(false);
    setInhaleProgress(0);
    inhaleProgressRef.current = 0;
    // Burn and ash were already applied live in tickInhale.
    if (strength < 10) return;
    setPuffs((current) => current + 1);
    setTotalPuffs((current) => current + 1);
    playTone(210, 0.12, 0.025, 130);
    if (navigator.vibrate) navigator.vibrate(22);
  }

  function monitorMicrophone() {
    if (!micActiveRef.current || !micAnalyser.current) return;
    // Float time-domain data keeps whisper-level resolution that byte data
    // quantizes away, so tiny sounds still register.
    const samples = new Float32Array(micAnalyser.current.fftSize);
    micAnalyser.current.getFloatTimeDomainData(samples);
    let total = 0;
    for (const sample of samples) total += sample * sample;
    const level = Math.sqrt(total / samples.length);

    // Adaptive noise floor with hysteresis: learn the room while idle, then
    // trigger just above it — a faint breath in a quiet room still counts.
    const trigger = Math.max(0.012, noiseFloorRef.current * 2.4);
    const release = Math.max(0.009, noiseFloorRef.current * 1.5);
    if (!inhaleActiveRef.current && level < trigger) {
      const drift = noiseFloorRef.current + (level - noiseFloorRef.current) * 0.04;
      noiseFloorRef.current = Math.min(0.05, Math.max(0.004, drift));
    }

    // Perceptual meter curve keeps small signals visible instead of pinned at 0.
    const visualLevel = Math.min(100, Math.round(Math.pow(Math.min(1, level * 22), 0.55) * 100));
    setMicLevel(visualLevel);

    if (inhaleActiveRef.current) {
      if (level < release) endInhale();
    } else if (level > trigger && litRef.current && burnRef.current < 95) {
      beginInhale();
    }
    micFrame.current = requestAnimationFrame(monitorMicrophone);
  }

  const stopMicrophone = () => {
    micActiveRef.current = false;
    if (micFrame.current) cancelAnimationFrame(micFrame.current);
    micFrame.current = null;
    micStream.current?.getTracks().forEach((track) => track.stop());
    micSource.current?.disconnect();
    micStream.current = null;
    micSource.current = null;
    micAnalyser.current = null;
    if (inhaleActiveRef.current) endInhale();
    setMicOn(false);
    setMicLevel(0);
  };

  const toggleMicrophone = async () => {
    if (micActiveRef.current) {
      stopMicrophone();
      return;
    }
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      });
      const context = audioContext.current ?? new AudioContext();
      audioContext.current = context;
      if (context.state === "suspended") await context.resume();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);
      micStream.current = stream;
      micSource.current = source;
      micAnalyser.current = analyser;
      micActiveRef.current = true;
      noiseFloorRef.current = 0.015;
      setMicOn(true);
      monitorMicrophone();
      if (!litRef.current) showToast("Mic live — light it and breathe 🎙");
    } catch {
      setMicError("Mic blocked — hold the button instead.");
      showToast("Mic blocked — check the browser permission 🔒");
    }
  };

  const flickAsh = () => {
    performFlick();
  };

  const handleCigDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    cigPointer.current = { y: event.clientY, time: performance.now() };
  };

  const handleCigUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const start = cigPointer.current;
    cigPointer.current = null;
    if (!start || !litRef.current) return;
    const dy = event.clientY - start.y;
    const dt = performance.now() - start.time;
    // A fast downward swipe on the cigarette flicks the ash — like the real gesture.
    if (dy > 36 && dt < 400) flickAsh();
  };

  const beginRing = () => {
    if (puffs === 0 || exhaling) return;
    ringStartedAt.current = performance.now();
    setExhaling(true);
  };

  const endRing = () => {
    if (!ringStartedAt.current) return;
    const heldFor = performance.now() - ringStartedAt.current;
    ringStartedAt.current = 0;
    setExhaling(false);
    const kind: SmokeRing["kind"] = heldFor > 1050 ? "halo" : heldFor > 540 ? "double" : "single";
    const count = kind === "single" ? 1 : kind === "double" ? 2 : 3;
    const created = Array.from({ length: count }, (_, index) => ({ id: ++ringId.current, kind, delay: index * 110 }));
    setSmokeRings((current) => [...current, ...created.map(({ id, kind: ringKind }) => ({ id, kind: ringKind }))]);
    setRingCount((current) => current + count);
    setTotalRings((current) => current + count);
    playNoise(0.48, 0.035, 760);
    playTone(kind === "halo" ? 160 : 210, 0.32, 0.035, 78);
    created.forEach(({ id, delay }) => {
      const timeout = window.setTimeout(() => {
        setSmokeRings((current) => current.filter((ring) => ring.id !== id));
      }, 2600 + delay);
      ringTimeouts.current.push(timeout);
    });
  };

  function resetRitual() {
    inhaleActiveRef.current = false;
    stopInhaleSound();
    setLit(false);
    setJustLit(false);
    setInhaling(false);
    setInhaleProgress(0);
    setBurn(0);
    setAsh(0);
    setAshAnchorBurn(0);
    setFlickAshHeight(0);
    setAshDropped(false);
    setPuffs(0);
    setRingCount(0);
    setSmokeRings([]);
    setFlicking(false);
    setExhaling(false);
    stopMicrophone();
    setShared(false);
    completedRef.current = false;
    burnRef.current = 0;
    ashRef.current = 0;
    ashDropPendingRef.current = false;
    flickingRef.current = false;
    if (ashDropTimeoutRef.current !== null) {
      window.clearTimeout(ashDropTimeoutRef.current);
      ashDropTimeoutRef.current = null;
    }
  }

  const finishSession = () => {
    if (completedRef.current || puffs === 0) return;
    completedRef.current = true;
    setSessions((value) => value + 1);
    setTodayCount((value) => (lastDate === today ? value : 0) + 1);
    setStreak((value) => {
      if (lastDate === today) return Math.max(value, 1);
      if (lastDate === yesterdayKey()) return value + 1;
      return 1;
    });
    setLastDate(today);
    setCompleted(true);
    playTone(440, 0.16, 0.045, 660);
    window.setTimeout(() => playTone(660, 0.22, 0.04, 880), 120);
    if (navigator.vibrate) navigator.vibrate([40, 30, 70]);
  };

  const shareResult = async () => {
    const text = `Passing you a smoke-free break: ${puffs} fake pulls, ${ringCount} smoke rings, 0 real cigarettes. Your turn. #FakeBreak`;
    const url = location.href;
    // Clipboard first — a tangible result even when the share sheet can't open.
    let copied = false;
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      copied = true;
    } catch {
      try {
        const area = document.createElement("textarea");
        area.value = `${text} ${url}`;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        copied = document.execCommand("copy");
        area.remove();
      } catch {
        // No clipboard on this device at all.
      }
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Fake Break receipt", text, url });
        setShared(true);
        setShares((current) => current + 1);
        showToast("Passed! ✨");
        return;
      } catch (error) {
        // The user dismissing the sheet is a deliberate choice — stay quiet.
        if (error instanceof DOMException && error.name === "AbortError") return;
        // The sheet itself failed (common on desktop) — fall through to clipboard.
      }
    }
    if (copied) {
      setShared(true);
      setShares((current) => current + 1);
      showToast("Link copied — paste it anywhere ✨");
    } else {
      showToast("Couldn't share automatically — copy the address bar link");
    }
  };

  const startUnbox = (packId: string) => {
    setSelectedPackId(packId);
    setUnboxOpen(false);
    setView("unbox");
  };

  // ---------- Legal pages (?page=privacy|about keeps real URLs for review) ----------

  const openPage = (page: "privacy" | "about") => {
    window.history.pushState(null, "", `?page=${page}`);
    setView(page);
    window.scrollTo(0, 0);
  };

  const closePage = () => {
    window.history.pushState(null, "", window.location.pathname);
    setView("home");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const onPop = () => {
      const page = new URLSearchParams(window.location.search).get("page");
      setView(page === "privacy" || page === "about" ? page : "home");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ---------- Monetized unlocks ----------

  const isPackUnlocked = (pack: Pack) => {
    if (paidUnlocks.includes(pack.id)) return true;
    if (pack.rule.kind === "sessions") return sessions >= pack.rule.count;
    return (adProgress[pack.id] ?? 0) >= pack.rule.count;
  };

  /** Progress toward a locked pack, for labels and meters. */
  const unlockProgress = (pack: Pack) => {
    if (pack.rule.kind === "sessions") return Math.min(sessions, pack.rule.count);
    return Math.min(adProgress[pack.id] ?? 0, pack.rule.count);
  };

  const lockChip = (pack: Pack) => {
    const left = pack.rule.count - unlockProgress(pack);
    if (pack.rule.kind === "sessions") return `🔒 ${left} to go`;
    if (pack.paid) return `▶ Ad ×${left} · or ${SUPPORT_CONFIG.price}`;
    return `▶ Ad ${left > 1 ? `×${left}` : "to unlock"}`;
  };

  const showToast = (message: string) => setToast(message);

  // Toasts dismiss themselves.
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const [checkoutOpened, setCheckoutOpened] = useState(false);

  const openSupporterCheckout = () => {
    if (!SUPPORT_CONFIG.paymentUrl) {
      showToast("Checkout link goes here — one line in monetization.ts");
      return;
    }
    window.open(SUPPORT_CONFIG.paymentUrl, "_blank", "noopener");
    setCheckoutOpened(true);
  };

  /** Ko-fi has no post-payment redirect — supporters claim the pass manually. */
  const claimSupporterPass = () => {
    window.location.href = `${window.location.pathname}?${SUPPORT_CONFIG.successParam}=${SUPPORT_CONFIG.successValue}`;
  };

  // Route C return fanfare: chime + scrub the query string. The unlock itself
  // happened in the paidUnlocks initializer above.
  useEffect(() => {
    if (!isPaymentReturn()) return;
    playTone(660, 0.18, 0.05, 990);
    window.setTimeout(() => playTone(880, 0.22, 0.045, 1320), 140);
    window.history.replaceState(null, "", window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdBreak = (pack: Pack) => {
    setAdForId(pack.id);
    setAdLeft(AD_CONFIG.adSeconds);
  };

  // Rewarded-ad countdown. Real networks replace this timer with their SDK
  // reward callback — see src/monetization.ts.
  useEffect(() => {
    if (!adForId || adLeft <= 0) return;
    const timer = window.setTimeout(() => {
      const nextLeft = adLeft - 1;
      setAdLeft(nextLeft);
      if (nextLeft <= 0) playTone(660, 0.18, 0.045, 990);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [adForId, adLeft, playTone]);

  const claimAdReward = () => {
    if (!adForId || adLeft > 0) return;
    const pack = PACKS.find((candidate) => candidate.id === adForId);
    setAdForId(null);
    if (!pack || pack.rule.kind !== "ad") return;
    const watched = (adProgress[pack.id] ?? 0) + 1;
    setAdProgress((current) => ({ ...current, [pack.id]: watched }));
    if (watched >= pack.rule.count) {
      setUnlockSheetId(null);
      showToast(`“${pack.name}” unlocked!`);
      startUnbox(pack.id);
    } else {
      showToast(`${pack.rule.count - watched} more ad to unlock “${pack.name}”`);
    }
  };

  // Escape dismisses the unlock sheet.
  useEffect(() => {
    if (!unlockSheetId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUnlockSheetId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlockSheetId]);

  const tearFoil = () => {
    if (unboxOpen) return;
    setUnboxOpen(true);
    playNoise(0.38, 0.06, 2600);
    playTone(190, 0.2, 0.04, 80);
    if (navigator.vibrate) navigator.vibrate([25, 40, 25]);
  };

  const handleFoilDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    foilDragY.current = event.clientY;
  };

  const handleFoilMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (foilDragY.current === null) return;
    if (event.clientY - foilDragY.current > 60) {
      foilDragY.current = null;
      tearFoil();
    }
  };

  const handleFoilUp = () => {
    foilDragY.current = null;
  };

  const takeOne = () => {
    if (!unboxOpen || packRemaining <= 0) return;
    setPackCounts((current) => ({
      ...current,
      [activePack.id]: Math.max(0, (current[activePack.id] ?? PACK_SIZE) - 1),
    }));
    resetRitual();
    setMicError("");
    setView("ritual");
  };

  const refillPack = () => {
    if (packRemaining > 0) return;
    setPackCounts((current) => ({ ...current, [activePack.id]: PACK_SIZE }));
    playTone(520, 0.14, 0.04, 760);
  };

  const quitRitual = () => {
    resetRitual();
    setCompleted(false);
    setView("home");
  };

  // ---------- Derived data ----------

  const moneySaved = sessions * CIGARETTE_PRICE;
  const coffeeCount = Math.floor(moneySaved / 4);
  const pizzaCount = Math.floor(moneySaved / 3);
  const quip = useMemo(() => QUIPS[sessions % QUIPS.length], [sessions]);
  const soup = SOUPS[dayOfYear(now) % SOUPS.length];
  const wind = ["calm", "a light breeze", "gusty"][dayOfYear(now) % 3];
  const temperatureF = 58 + ((dayOfYear(now) * 7) % 28);
  const timeLabel = `${periodOfDay(now.getHours())} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} · ${wind} · ${temperatureF}°F`;

  const nextUnlocks = PACKS.filter((pack) => pack.rule.kind === "sessions" && sessions < pack.rule.count)
    .sort((a, b) => (a.rule.kind === "sessions" ? a.rule.count : 0) - (b.rule.kind === "sessions" ? b.rule.count : 0))
    .slice(0, 2);

  const badges = [
    { name: "Icebreaker", desc: "Finish 1 fake break", got: sessions >= 1 },
    { name: "Three-Day Clean", desc: "3-day streak", got: streak >= 3 },
    { name: "Lucky Seven", desc: "7-day streak", got: streak >= 7 },
    { name: "Double Digits", desc: "10 fake breaks", got: sessions >= 10 },
    { name: "Half Century", desc: "50 fake breaks", got: sessions >= 50 },
    { name: "Ash Ninja", desc: "Flick ash 20 times", got: totalFlicks >= 20 },
    { name: "Ring Lord", desc: "Blow 10 smoke rings", got: totalRings >= 10 },
    { name: "Dealer", desc: "Pass one to a friend", got: shares >= 1 },
  ];
  const badgesGot = badges.filter((badge) => badge.got).length;

  const effectiveTodayCount = lastDate === today ? todayCount : 0;
  const ashRounded = Math.round(ash);
  const burnOffsetPx = getBurnOffsetPx(burn);
  const attachedAshHeightPx = getAttachedAshHeightPx(burn, ashAnchorBurn, ash);

  const sessionClock = `${String(Math.floor(sessionSeconds / 60)).padStart(1, "0")}:${String(sessionSeconds % 60).padStart(2, "0")}`;
  const cravingPhase =
    sessionSeconds < 30
      ? "The urge is climbing"
      : sessionSeconds < 90
        ? "Peak of the wave — hold on"
        : "Past the peak · it only fades now";

  const ritualTitle = !lit
    ? burn >= 95
      ? "This one’s done"
      : "Light one"
    : inhaling
      ? "Pulling in"
      : exhaling
        ? "Blow it out"
        : flicking
          ? "Ash, handled"
          : puffs === 0
            ? "It’s lit"
            : "Take your time";

  const ritualHint = micError
    ? micError
    : ashDropped
      ? "The ash gave up and fell."
      : !lit
        ? burn >= 95
          ? "Zero real damage. Well played."
          : `Fake #${effectiveTodayCount + 1} today · tap the tip to light`
        : inhaling
          ? `Pull strength ${Math.round(inhaleProgress)}% · longer pull, more smoke`
          : exhaling
            ? "Keep holding for rings"
            : ash >= 70
              ? "That ash is getting long — swipe down on it"
              : micOn
                ? "Breathe toward the mic"
                : puffs === 0
                  ? "Hold the button below to pull air"
                  : AMBIENT_LINES[puffs % AMBIENT_LINES.length];

  // ---------- Views ----------

  return (
    <main
      className={`shell view-${view}`}
      style={{ "--pack": activePack.color, "--pack-glow": activePack.glow } as CSSProperties}
    >
      <div className="filmGrain" aria-hidden="true" />
      {view === "home" && (
        <div className="homeView">
          <header className="homeHeader">
            <p className="homeDay">Day {Math.max(streak, 1)} smoke-free</p>
            <h1>
              Craving one? Have one. <em>(A fake one.)</em>
            </h1>
          </header>

          <button type="button" className="bigCta" onClick={() => setView("packs")}>
            <span className="ctaIcon" aria-hidden="true">🚬</span>
            <span>
              <strong>Take one</strong>
              <small>Fake a smoke · free and lung-friendly</small>
            </span>
          </button>

          <button type="button" className="rescueCta" onClick={() => startUnbox(activePack.id)}>
            🆘 Craving right now? Skip the menu — straight to a break
          </button>

          <section className="savedCard">
            <p className="savedLabel">Not burned so far</p>
            <p className="savedAmount">${moneySaved.toFixed(2)}</p>
            <p className="savedEquiv">
              That’s {coffeeCount} coffees · or {pizzaCount} slices of pizza
            </p>
          </section>

          {nextUnlocks.length > 0 && (
            <section className="unlockCard">
              <p className="cardTitle">Almost yours</p>
              {nextUnlocks.map((pack) => (
                <div className="unlockRow" key={pack.id}>
                  <span className="unlockDot" style={{ background: pack.glow }} />
                  <span className="unlockText">
                    <strong>{pack.rule.count - sessions}</strong> more fake {pack.rule.count - sessions === 1 ? "break" : "breaks"} to unlock “{pack.name}”
                  </span>
                  <span className="unlockBar">
                    <i style={{ width: `${Math.min(100, (sessions / pack.rule.count) * 100)}%` }} />
                  </span>
                </div>
              ))}
            </section>
          )}

          <section className="statGrid">
            <div className="statCard">
              <p>Faked today</p>
              <strong>
                {effectiveTodayCount}
                <span> / {DAILY_GOAL}</span>
              </strong>
              <div className="statBar">
                <i style={{ width: `${Math.min(100, (effectiveTodayCount / DAILY_GOAL) * 100)}%` }} />
              </div>
            </div>
            <div className="statCard">
              <p>Streak</p>
              <strong>
                {streak}
                <span> days</span>
              </strong>
              <div className="statBar">
                <i style={{ width: `${Math.min(100, (streak / 7) * 100)}%` }} />
              </div>
            </div>
            <div className="statCard">
              <p>Total breaks</p>
              <strong>
                {sessions}
                <span> fakes</span>
              </strong>
              <div className="statBar">
                <i style={{ width: `${Math.min(100, (sessions / 50) * 100)}%` }} />
              </div>
            </div>
            <div className="statCard">
              <p>Badges</p>
              <strong>
                {badgesGot}
                <span> / {badges.length}</span>
              </strong>
              <div className="statBar">
                <i style={{ width: `${(badgesGot / badges.length) * 100}%` }} />
              </div>
            </div>
          </section>

          <section className="milestoneCard">
            <p className="cardTitle">🫁 Body recovery</p>
            {MILESTONES.map((milestone) => {
              const reached = streak >= milestone.days;
              return (
                <div className={`milestoneRow ${reached ? "reached" : ""}`} key={milestone.label}>
                  <span className="milestoneCheck">{reached ? "✓" : "·"}</span>
                  <strong>{milestone.label}</strong>
                  <span>{milestone.desc}</span>
                </div>
              );
            })}
          </section>

          <section className="badgeCard">
            <p className="cardTitle">🏆 Badges</p>
            <div className="badgeGrid">
              {badges.map((badge) => (
                <div className={`badge ${badge.got ? "got" : ""}`} key={badge.name} title={badge.desc}>
                  <i>{badge.got ? "★" : "🔒"}</i>
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="soupCard">
            <p className="cardTitle">Today’s tough love</p>
            <p className="soupText">“{soup}”</p>
          </section>

          <section className="whyCard">
            <p className="cardTitle">Why a fake cigarette works</p>
            <div className="whyRow">
              <strong>Urges are waves, not walls</strong>
              <span>
                A craving crests around 90 seconds and fades within about three minutes. One fake
                break runs exactly that long — you ride the wave out instead of fighting it.
              </span>
            </div>
            <div className="whyRow">
              <strong>Your hands need a job</strong>
              <span>
                Half of smoking is choreography: tap, draw, flick, exhale. Keep the ritual, delete
                the smoke, and the habit loop completes without nicotine.
              </span>
            </div>
            <div className="whyRow">
              <strong>The pause was the point</strong>
              <span>
                Stepping away for three quiet minutes is what your brain actually wanted. The
                cigarette was just the ticket stub.
              </span>
            </div>
          </section>

          <section className="faqCard">
            <p className="cardTitle">Questions, answered</p>
            <details>
              <summary>Is Fake Break an app?</summary>
              <p>
                No download, no account. It’s a website that works on any phone or computer, and
                your progress is saved locally in your browser.
              </p>
            </details>
            <details>
              <summary>Can a fake cigarette really help with cravings?</summary>
              <p>
                It replaces the ritual, not the chemistry. Cravings come in short waves, and this
                gives your hands and mind something to ride them out with. For proven quitting
                support, see{" "}
                <a href="https://smokefree.gov/" target="_blank" rel="noreferrer">smokefree.gov</a>.
              </p>
            </details>
            <details>
              <summary>Is it free?</summary>
              <p>
                Yes. Some packs unlock by taking breaks, others by watching a short sponsored break.
                A one-time {SUPPORT_CONFIG.price} Supporter pass unlocks everything instantly and
                keeps the site running.
              </p>
            </details>
            <details>
              <summary>Does it listen to my microphone?</summary>
              <p>
                Only if you switch mic mode on, and only on your device — audio never leaves your
                browser. It simply lets your real inhale drive the burn.
              </p>
            </details>
            <details>
              <summary>Do you collect my data?</summary>
              <p>
                No servers, no accounts. Your progress lives in your browser’s local storage. The
                full details are in the privacy policy, linked below.
              </p>
            </details>
            <details>
              <summary>Is this medical advice?</summary>
              <p>
                No. Fake Break is a playful craving interrupter, not a treatment. For medical help
                quitting, talk to a professional or visit smokefree.gov.
              </p>
            </details>
          </section>

          <p className="homeFoot">
            For fun and craving relief only · not medical advice ·{" "}
            <a href="https://smokefree.gov/" target="_blank" rel="noreferrer">
              Real quit support ↗
            </a>
          </p>
          <p className="homeFoot legalLinks">
            <button type="button" onClick={() => openPage("privacy")}>Privacy</button>
            {" · "}
            <button type="button" onClick={() => openPage("about")}>About</button>
            {" · "}
            <a href="https://github.com/superchenbotao/fake-break" target="_blank" rel="noreferrer">
              Contact
            </a>
          </p>
        </div>
      )}

      {view === "privacy" && (
        <div className="legalView">
          <header className="packsHeader">
            <button type="button" className="backButton" onClick={closePage}>
              ‹ Back
            </button>
            <h1>Privacy Policy</h1>
            <p>Last updated: August 16, 2026</p>
          </header>

          <section className="legalCard">
            <h2>The short version</h2>
            <p>
              Fake Break stores everything on your own device, never uploads it, and
              sets no tracking cookies. Your ritual is yours — we can’t see it, and
              we don’t want to.
            </p>
          </section>

          <section className="legalCard">
            <h2>What stays on your device</h2>
            <p>
              Your fake-break count, streaks, pack unlocks, and settings live in your
              browser’s localStorage. Clearing your browser data resets the app.
              This data never leaves your device.
            </p>
          </section>

          <section className="legalCard">
            <h2>Microphone</h2>
            <p>
              If you enable “Mic puff”, your microphone’s loudness level is analyzed
              locally in your browser to drive the ritual. Audio is never recorded,
              stored, or transmitted. You can revoke the permission at any time in
              your browser settings.
            </p>
          </section>

          <section className="legalCard">
            <h2>Sound and vibration</h2>
            <p>
              All audio is synthesized on-device with the Web Audio API. Haptics use
              your device’s vibration motor. No media files are downloaded.
            </p>
          </section>

          <section className="legalCard">
            <h2>Advertising</h2>
            <p>
              Some packs unlock by watching a short sponsored break. We may serve ads
              through third-party networks such as Google AdSense. These vendors may
              use cookies or similar technologies to personalize ads based on your
              visits to this and other sites. You can opt out of personalized ads at{" "}
              <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
                Google Ads Settings ↗
              </a>{" "}
              and learn how Google uses data at{" "}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer">
                Google’s partner-sites policy ↗
              </a>
              .
            </p>
          </section>

          <section className="legalCard">
            <h2>Sharing</h2>
            <p>
              The share button uses your device’s native share sheet (Web Share API)
              or copies a link to your clipboard. We never see what you share or
              with whom.
            </p>
          </section>

          <section className="legalCard">
            <h2>Contact</h2>
            <p>
              Questions about this policy? Open an issue on{" "}
              <a href="https://github.com/superchenbotao/fake-break" target="_blank" rel="noreferrer">
                our GitHub repository ↗
              </a>
              .
            </p>
          </section>
        </div>
      )}

      {view === "about" && (
        <div className="legalView">
          <header className="packsHeader">
            <button type="button" className="backButton" onClick={closePage}>
              ‹ Back
            </button>
            <h1>About</h1>
            <p>Why a fake cigarette, though?</p>
          </header>

          <section className="legalCard">
            <h2>The idea</h2>
            <p>
              A craving is mostly theater: the walk outside, the flick, the slow
              exhale, the two minutes where nobody can ask you for anything.
              Fake Break keeps the theater and deletes the tobacco. You get the
              full ritual — the pack, the foil, the ember, the smoke rings — with
              zero nicotine, zero tar, and zero regret.
            </p>
          </section>

          <section className="legalCard">
            <h2>How it works</h2>
            <p>
              Each fake break is a small ceremony: unbox a pack, light the
              (imaginary) cigarette, pull air through it, watch the ember breathe,
              flick the ash, blow a ring. By the time the ceremony ends, the urge
              has usually peaked and passed — most cravings crest within about
              ninety seconds.
            </p>
          </section>

          <section className="legalCard">
            <h2>What it is not</h2>
            <p>
              Fake Break is a playful craving interrupter, not a medical product,
              cessation program, or health advice. If you’re quitting for real,
              you deserve real support:{" "}
              <a href="https://smokefree.gov/" target="_blank" rel="noreferrer">
                smokefree.gov ↗
              </a>{" "}
              is a good first stop.
            </p>
          </section>

          <section className="legalCard">
            <h2>How it’s funded</h2>
            <p>
              The site is free. Some packs unlock by sharing Fake Break with a
              friend, some by watching a short sponsored break, and the fanciest
              pack accepts a one-time supporter payment. That’s the whole business
              model — no subscriptions, no data sales, nothing weird.
            </p>
          </section>

          <section className="legalCard">
            <h2>Made by</h2>
            <p>
              A small team that quit smoking and missed the lighter. Code, issues,
              and compliments:{" "}
              <a href="https://github.com/superchenbotao/fake-break" target="_blank" rel="noreferrer">
                github.com/superchenbotao/fake-break ↗
              </a>
              .
            </p>
          </section>
        </div>
      )}

      {view === "packs" && (
        <div className="packsView">
          <header className="packsHeader">
            <button type="button" className="backButton" onClick={() => setView("home")}>
              ‹ Back
            </button>
            <h1>Pick one.</h1>
            <p>All fake · the pricier, the classier</p>
          </header>

          <div className="packGrid">
            {PACKS.map((pack) => {
              const unlocked = isPackUnlocked(pack);
              const selected = selectedPackId === pack.id;
              const remaining = packCounts[pack.id] ?? PACK_SIZE;
              const isFree = pack.rule.kind === "sessions" && pack.rule.count === 0;
              return (
                <button
                  type="button"
                  key={pack.id}
                  className={`packCard motif-${pack.motif} ${selected ? "selected" : ""} ${unlocked ? "" : "locked"} lock-${pack.rule.kind}`}
                  style={{ "--card": pack.color, "--card-glow": pack.glow } as CSSProperties}
                  onClick={() => (unlocked ? startUnbox(pack.id) : setUnlockSheetId(pack.id))}
                  aria-pressed={selected}
                  aria-label={
                    unlocked
                      ? `Open ${pack.name}, ${remaining} left`
                      : `${pack.name}, locked — ${lockChip(pack)}`
                  }
                >
                  <span className={`packPrice ${unlocked || isFree ? "" : "lockChip"}`}>
                    {unlocked || isFree ? pack.price : lockChip(pack)}
                  </span>
                  {isFree && <span className="packFree">First pack free</span>}
                  <span className="packDisc"><i /></span>
                  <strong>{pack.name}</strong>
                  <span className="packLatin">{pack.mood}</span>
                  <span className="packFlavor">{pack.flavor}</span>
                  <small>“{pack.line}”</small>
                  {unlocked && <span className="packLeft">{remaining}/{PACK_SIZE} left</span>}
                </button>
              );
            })}
          </div>
          <p className="unlockNote">Every pack is imaginary · the smugness is real</p>
        </div>
      )}

      {view === "unbox" && (
        <div className="unboxView">
          <header className="packsHeader">
            <button type="button" className="backButton" onClick={() => setView("packs")}>
              ‹ Switch pack
            </button>
          </header>

          <div
            className={`packBox ${unboxOpen ? "open" : ""}`}
            style={{ "--card": activePack.color, "--card-glow": activePack.glow, "--cig-filter": activePack.filterColor } as CSSProperties}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!unboxOpen) tearFoil();
              else takeOne();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (!unboxOpen) tearFoil();
                else takeOne();
              }
            }}
            aria-label={unboxOpen ? "Take a cigarette" : "Open the pack"}
          >
            <div className="packSticks" aria-hidden={!unboxOpen}>
              {Array.from({ length: PACK_SIZE }, (_, index) => {
                const available = index < packRemaining;
                return (
                  <button
                    type="button"
                    key={index}
                    className={`packStick ${available ? "" : "gone"}`}
                    disabled={!unboxOpen || !available}
                    onClick={(event) => {
                      event.stopPropagation();
                      takeOne();
                    }}
                    aria-label={available ? "Take this one" : "Already taken"}
                    tabIndex={unboxOpen ? 0 : -1}
                  >
                    <i />
                  </button>
                );
              })}
            </div>
            <div className="packBody">
              <div className={`packFace motif-${activePack.motif}`}>
                <span className="packFaceTag">PRETEND · 0mg EVERYTHING</span>
                <strong>{activePack.name}</strong>
                <span className="packFaceMood">{activePack.mood}</span>
                <span className="packFaceDisc"><i /></span>
                <small>{activePack.flavor}</small>
              </div>
              <button
                type="button"
                className={`packFoil ${unboxOpen ? "torn" : ""}`}
                onClick={tearFoil}
                onPointerDown={handleFoilDown}
                onPointerMove={handleFoilMove}
                onPointerUp={handleFoilUp}
                onPointerCancel={handleFoilUp}
                disabled={unboxOpen}
                aria-label="Pull down to tear the foil"
              >
                <span>⬇ Pull down to tear</span>
              </button>
            </div>
            <div className="packLid" />
          </div>

          {unboxOpen && packRemaining === 0 ? (
            <button type="button" className="unboxHint asButton" onClick={refillPack}>
              Pack’s empty · tap to conjure a fresh one ✨
            </button>
          ) : (
            <p className="unboxHint">
              {unboxOpen
                ? `Pick one · ${packRemaining} left in this pack`
                : "Pull the foil down · or just tap it"}
            </p>
          )}
        </div>
      )}

      {view === "ritual" && (
        <div
          className={`ritualView scene-${sceneIndex} mode-${lightMode} ${inhaling ? "isHolding" : ""} ${lit ? "isLit" : ""} ${justLit ? "justLit" : ""} ${flicking ? "isFlicking" : ""}`}
        >
          <div className="sceneLayer" aria-hidden="true">
            {sceneIndex === 0 &&
              Array.from({ length: 9 }, (_, index) => <i key={index} className="bokeh" />)}
            {sceneIndex === 1 && (
              <>
                <div className="neonBar" />
                <div className="neonBar second" />
              </>
            )}
            {sceneIndex === 2 &&
              Array.from({ length: 14 }, (_, index) => <i key={index} className="rainDrop" />)}
            {sceneIndex === 3 &&
              Array.from({ length: 5 }, (_, index) => <i key={index} className="haze" />)}
          </div>

          <header className="ritualHeader">
            <span className="packBrand">{activePack.mood}</span>
            <h1>{ritualTitle}</h1>
            <p className="ritualTime">{timeLabel}</p>
            <p className="ritualNumbers">
              {Math.round(burn)}% · pull {puffs + (lit ? 1 : 0)} · ash {ashRounded}%
            </p>
            <div className="ritualTrack">
              <span style={{ width: `${burn}%` }} />
            </div>
          </header>

          <div className="ritualSide">
            <button type="button" className="sceneChip" onClick={() => setSceneIndex((sceneIndex + 1) % SCENES.length)}>
              {SCENE_ICONS[sceneIndex]} {SCENES[sceneIndex]}
            </button>
            <button
              type="button"
              className="backChip"
              onClick={() => setLightMode(lightMode === "match" ? "lighter" : "match")}
              aria-pressed={lightMode === "lighter"}
            >
              {lightMode === "match" ? "🕯 Match" : "🔥 Lighter"}
            </button>
            <button type="button" className="backChip" onClick={quitRitual}>
              ‹ Clock out
            </button>
          </div>

          <div className="stageRow">
            <div
              className="cigaretteStage"
              aria-hidden="true"
              onPointerMove={(event) => {
                // Mouse-only parallax: touch drags belong to taps and swipes.
                if (event.pointerType !== "mouse") return;
                const rect = event.currentTarget.getBoundingClientRect();
                const px = (event.clientX - rect.left) / rect.width - 0.5;
                const py = (event.clientY - rect.top) / rect.height - 0.5;
                event.currentTarget.style.setProperty("--tilt-x", `${(px * 5).toFixed(2)}deg`);
                event.currentTarget.style.setProperty("--tilt-y", `${(-py * 4).toFixed(2)}deg`);
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.setProperty("--tilt-x", "0deg");
                event.currentTarget.style.setProperty("--tilt-y", "0deg");
              }}
            >
              <div className="halo" />
              <div className="ringField">
                {smokeRings.map((ring, index) => (
                  <i
                    key={ring.id}
                    className={`smokeRing ${ring.kind}`}
                    style={{ "--ring-index": index } as CSSProperties}
                  >
                    <b />
                  </i>
                ))}
              </div>
              {exhaling && <div className="puffCloud" />}
              <div className="smokeBits">
                {Array.from({ length: 10 }, (_, index) => (
                  <i key={index} />
                ))}
              </div>
              <div className="ashtray" />
              <button
                type="button"
                className="cigarette"
                onClick={() => {
                  if (!litRef.current) {
                    lightCigarette();
                  } else {
                    flickAsh();
                  }
                }}
                onPointerDown={handleCigDown}
                onPointerUp={handleCigUp}
                onPointerCancel={() => {
                  cigPointer.current = null;
                }}
                disabled={burn >= 95}
                aria-label={
                  lit
                    ? ash >= 5
                      ? "Tap or swipe down on the cigarette to flick the ash"
                      : "Cigarette is lit"
                    : "Tap the tip to light"
                }
                style={
                  {
                    "--burn-offset": `${burnOffsetPx}px`,
                    "--ash-height": `${flicking ? flickAshHeight : attachedAshHeightPx}px`,
                    "--ash-opacity": ash >= ASH_VISIBLE_THRESHOLD ? Math.min(1, ash / 12) : 0,
                    "--ash-tilt": `${Math.min(3.4, ash * 0.034)}deg`,
                    "--ash-progress": Math.min(1, ash / 100),
                    "--ei": !lit ? 0 : inhaling ? 1 : micOn ? Math.min(1, 0.25 + micLevel / 55) : 0.32,
                    "--cig-paper": activePack.paperTint,
                    "--cig-filter": activePack.filterColor,
                    "--cig-band": activePack.bandColor,
                  } as CSSProperties
                }
              >
                <span className="flame" />
                <span className="wisps" aria-hidden="true"><i /><i /><i /></span>
                <span className="ashCap"><i /></span>
                {flicking && (
                  <span className="ashBurst" aria-hidden="true">
                    {Array.from({ length: 7 }, (_, index) => (
                      <i key={index} />
                    ))}
                  </span>
                )}
                <span className="charLine" />
                <span className="ember" />
                <span className="paper"><b>{activePack.stick}</b></span>
                <span className="filter" />
              </button>
            </div>

            <div className="ritualRail">
              <button
                type="button"
                className={soundOn ? "railOn" : ""}
                onClick={() => {
                  if (soundOn) stopInhaleSound();
                  setSoundOn((current) => !current);
                }}
                aria-pressed={soundOn}
              >
                <i>{soundOn ? "🔔" : "🔕"}</i>
                <span>{soundOn ? "Sound on" : "Muted"}</span>
              </button>
              <button
                type="button"
                className={`micLive ${micOn ? "railOn" : ""}`}
                style={{ "--ml": micLevel / 100 } as CSSProperties}
                onClick={toggleMicrophone}
                disabled={burn >= 95}
                aria-pressed={micOn}
              >
                <i>🎙</i>
                <span>{micOn ? `Mic ${micLevel}%` : "Mic puff"}</span>
              </button>
              <button
                type="button"
                className={ash >= 70 ? "ashReady" : ""}
                onClick={flickAsh}
                disabled={ash < 5}
              >
                <i
                  style={{
                    background: `conic-gradient(color-mix(in srgb, var(--pack-glow) 75%, transparent) ${ashRounded}%, rgba(0,0,0,.34) ${ashRounded}%)`,
                  }}
                >
                  ≋
                </i>
                <span>{ash >= 5 ? `Flick it ${ashRounded}%` : "Flick ash"}</span>
              </button>
              <button
                type="button"
                className={exhaling ? "railOn" : ""}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  beginRing();
                }}
                onPointerUp={endRing}
                onPointerCancel={endRing}
                disabled={puffs === 0}
              >
                <i>◎</i>
                <span>{exhaling ? "Hold it…" : ringCount > 0 ? `Rings ×${ringCount}` : "Smoke rings"}</span>
              </button>
              <button type="button" onClick={shareResult} disabled={puffs === 0}>
                <i>↗</i>
                <span>{shared ? "Passed ✓" : "Pass it on"}</span>
              </button>
            </div>
          </div>

          <div className="ritualBottom">
            <div className="cravingWave">
              <div className="cravingMeta">
                <span>{sessionClock}</span>
                <span>{cravingPhase}</span>
              </div>
              <div className="cravingTrack">
                <i style={{ width: `${Math.min(100, (sessionSeconds / CRAVING_WAVE_SECONDS) * 100)}%` }} />
              </div>
            </div>
            <p className="ambientLine">{ritualHint}</p>
            <div className="inhaleMeter">
              <span style={{ width: `${inhaleProgress}%` }} />
            </div>
            <button
              className="startButton"
              type="button"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                if (!litRef.current && burnRef.current < 95) {
                  lightCigarette();
                  return;
                }
                beginInhale();
              }}
              onPointerUp={() => endInhale()}
              onPointerCancel={() => endInhale()}
              onKeyDown={(event) => {
                if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                  if (!litRef.current && burnRef.current < 95) lightCigarette();
                  else beginInhale();
                }
              }}
              onKeyUp={(event) => {
                if (event.key === " " || event.key === "Enter") endInhale();
              }}
              onContextMenu={(event) => event.preventDefault()}
              disabled={burn >= 95}
              aria-label={lit ? "Press and hold to take a fake pull" : "Tap to light"}
            >
              {burn >= 95
                ? "All gone (fake anyway)"
                : !lit
                  ? lightMode === "match" ? "🕯 Strike a match" : "🔥 Flick the lighter"
                  : inhaling
                    ? `Pulling ${Math.round(inhaleProgress)}%`
                    : "Hold to inhale"}
            </button>
            {puffs > 0 && (
              <button type="button" className="finishButton" onClick={finishSession}>
                Done · keep the win
              </button>
            )}
            <p className="microcopy">No tobacco · no nicotine · sound &amp; mic stay on your device</p>
          </div>
        </div>
      )}

      {completed && (
        <div className="resultBackdrop">
          <button
            className="resultDismissLayer"
            type="button"
            onClick={() => setCompleted(false)}
            aria-label="Close result"
          />
          <section className="resultCard" role="dialog" aria-modal="true" aria-labelledby="result-title">
            <button
              className="closeResult"
              type="button"
              onClick={() => setCompleted(false)}
              aria-label="Close result"
            >
              ×
            </button>
            <div className="resultBurst" aria-hidden="true">
              <span>0</span>
            </div>
            <p className="eyebrow">Fake Break #{sessions} · craving dodged</p>
            <h2 id="result-title">
              You just skipped
              <br />a real one.
            </h2>
            <p>{quip}</p>
            <div className="resultStats">
              <span>
                <strong>0</strong> real
              </span>
              <span>
                <strong>{puffs}</strong> fake pulls
              </span>
              <span>
                <strong>{ringCount}</strong> rings
              </span>
              <span>
                <strong>{streak}</strong> day streak
              </span>
            </div>
            <button className="shareButton" type="button" onClick={shareResult}>
              {shared ? "Copied. Go be smug. ✓" : "Share the non-event ↗"}
            </button>
            <button
              className="textButton"
              type="button"
              onClick={() => {
                setCompleted(false);
                quitRitual();
              }}
            >
              Back to your stats
            </button>
          </section>
        </div>
      )}

      {/* ---- unlock sheet: session-earned and ad/paid-gated packs ---- */}
      {unlockSheetId && (() => {
        const pack = PACKS.find((candidate) => candidate.id === unlockSheetId);
        if (!pack) return null;
        const left = pack.rule.count - unlockProgress(pack);
        return (
          <div className="sheetOverlay" role="dialog" aria-modal="true" aria-label={`${pack.name} is locked`}>
            <div
              className="unlockSheet"
              style={{ "--card": pack.color, "--card-glow": pack.glow } as CSSProperties}
            >
              <button type="button" className="sheetClose" aria-label="Close" onClick={() => setUnlockSheetId(null)}>
                ×
              </button>
              <span className="sheetDisc" />
              <p className="sheetKicker">Locked pack</p>
              <h2>{pack.name}</h2>
              <p className="sheetLine">“{pack.line}”</p>

              {pack.rule.kind === "sessions" && (
                <>
                  <p className="sheetBody">
                    This one is earned the slow way — <strong>{left}</strong> more fake {left === 1 ? "break" : "breaks"} and it’s yours.
                  </p>
                  <button type="button" className="sheetAction" onClick={() => setUnlockSheetId(null)}>
                    Keep going
                  </button>
                </>
              )}

              {pack.rule.kind === "ad" && (
                <>
                  <p className="sheetBody">
                    Watch a short sponsored break and this pack opens — the ad keeps Fake Break free.
                  </p>
                  {pack.rule.count > 1 && (
                    <div className="pips" aria-label={`${unlockProgress(pack)} of ${pack.rule.count} ads watched`}>
                      {Array.from({ length: pack.rule.count }, (_, index) => (
                        <i key={index} className={index < unlockProgress(pack) ? "done" : ""} />
                      ))}
                    </div>
                  )}
                  <button type="button" className="sheetAction" onClick={() => openAdBreak(pack)}>
                    ▶ Watch ad · {AD_CONFIG.adSeconds}s{left > 1 ? ` (${unlockProgress(pack)}/${pack.rule.count})` : ""}
                  </button>
                </>
              )}

              {pack.paid && (
                <>
                  <div className="sheetDivider"><span>or skip the ads</span></div>
                  <button type="button" className="supporterAction" onClick={openSupporterCheckout}>
                    ★ Supporter pass · {SUPPORT_CONFIG.price}
                    <small>One-time · unlocks every pack · instant</small>
                  </button>
                  {checkoutOpened && (
                    <button type="button" className="sheetDismiss" onClick={claimSupporterPass}>
                      Already supported? Claim your pass →
                    </button>
                  )}
                </>
              )}

              <button type="button" className="sheetDismiss" onClick={() => setUnlockSheetId(null)}>
                Not now
              </button>
            </div>
          </div>
        );
      })()}

      {/* ---- rewarded ad break (simulated creative until a network is connected) ---- */}
      {adForId && (() => {
        const pack = PACKS.find((candidate) => candidate.id === adForId);
        const houseAd = HOUSE_ADS[(adProgress[adForId] ?? 0) % HOUSE_ADS.length];
        if (!pack) return null;
        const done = adLeft <= 0;
        return (
          <div className="adBreak" role="dialog" aria-modal="true" aria-label="Sponsored break">
            <div className="adTag">Ad · {done ? "reward ready" : `reward in ${adLeft}s`}</div>
            <div
              className="adCreative"
              style={{ "--ad-accent": houseAd.accent, "--ad-glow": houseAd.glow } as CSSProperties}
            >
              <span className="adBrandMark" />
              <strong>{houseAd.brand}</strong>
              <p>{houseAd.tagline}</p>
              <span className="adCta">{houseAd.cta}</span>
            </div>
            <div className="adProgress">
              <i style={{ width: `${((AD_CONFIG.adSeconds - adLeft) / AD_CONFIG.adSeconds) * 100}%` }} />
            </div>
            {done ? (
              <button type="button" className="adClaim" onClick={claimAdReward}>
                Claim “{pack.name}” ✓
              </button>
            ) : (
              <>
                <p className="adHint">Your reward unlocks when the break ends…</p>
                <button type="button" className="adCancel" onClick={() => setAdForId(null)}>
                  Cancel · no reward
                </button>
              </>
            )}
          </div>
        );
      })()}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
