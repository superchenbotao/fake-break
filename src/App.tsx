import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Pack = {
  id: string;
  name: string;
  mood: string;
  flavor: string;
  line: string;
  price: string;
  unlock: number;
  color: string;
  glow: string;
};

type SmokeRing = {
  id: number;
  kind: "single" | "double" | "halo";
};

type View = "home" | "packs" | "unbox" | "ritual";
type LightMode = "match" | "lighter";

const PACKS: Pack[] = [
  {
    id: "blue-hour",
    name: "Blue Hour",
    mood: "COOL AIR · CLEAN EXIT",
    flavor: "Icy finish · tastes like nothing, elegantly",
    line: "For cravings that think they’re cinematic.",
    price: "$4",
    unlock: 0,
    color: "#33507e",
    glow: "#8ab8ff",
  },
  {
    id: "golden-alibi",
    name: "Golden Alibi",
    mood: "WARM LIGHT · NO EVIDENCE",
    flavor: "Toasted honey · completely imaginary",
    line: "Looks expensive. Costs you zero lungs.",
    price: "$6",
    unlock: 2,
    color: "#a5741a",
    glow: "#ffd95e",
  },
  {
    id: "soft-reset",
    name: "Soft Reset",
    mood: "QUIET MIND · FRESH START",
    flavor: "Rain on concrete · suspiciously calming",
    line: "The craving was a notification. Dismissed.",
    price: "$5",
    unlock: 4,
    color: "#4e5b51",
    glow: "#b7d2bd",
  },
  {
    id: "main-character",
    name: "Main Character",
    mood: "FULL DRAMA · ZERO SMOKE",
    flavor: "Velvet and thunder · none of it real",
    line: "All the entrance. None of the ashtray.",
    price: "$12",
    unlock: 7,
    color: "#5e2a68",
    glow: "#db81ee",
  },
  {
    id: "paper-trail",
    name: "Paper Trail",
    mood: "BUREAUCRATIC · ODDLY SATISFYING",
    flavor: "Fresh printer toner · faint triumph",
    line: "Filed under: things you didn’t smoke.",
    price: "$7",
    unlock: 10,
    color: "#43506b",
    glow: "#a9c1e8",
  },
  {
    id: "gaslight",
    name: "Gaslight",
    mood: "WARM · QUESTIONABLE",
    flavor: "Toasted marshmallow · trust issues",
    line: "Tastes like you imagined the craving. You did.",
    price: "$9",
    unlock: 14,
    color: "#7e3b1f",
    glow: "#ffab7a",
  },
  {
    id: "midnight-snack",
    name: "Midnight Snack",
    mood: "SWEET · 2AM ENERGY",
    flavor: "Vanilla static · zero calories",
    line: "The fridge was never the answer either.",
    price: "$8",
    unlock: 20,
    color: "#3a3f7a",
    glow: "#9aa4ff",
  },
  {
    id: "old-money",
    name: "Old Money",
    mood: "LEATHER · QUIET ARROGANCE",
    flavor: "Mahogany library · inherited confidence",
    line: "Smells like a yacht you’ve never been on.",
    price: "$25",
    unlock: 30,
    color: "#274435",
    glow: "#8fd4a8",
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

  const [view, setView] = useState<View>("home");
  const [unboxOpen, setUnboxOpen] = useState(false);
  const [lit, setLit] = useState(false);
  const [justLit, setJustLit] = useState(false);
  const [inhaling, setInhaling] = useState(false);
  const [inhaleProgress, setInhaleProgress] = useState(0);
  const [burn, setBurn] = useState(0);
  const [ash, setAsh] = useState(0);
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
  const [now, setNow] = useState(() => new Date());

  const inhaleFrame = useRef<number | null>(null);
  const inhaleStartedAt = useRef(0);
  const inhaleProgressRef = useRef(0);
  const inhaleActiveRef = useRef(false);
  const litRef = useRef(false);
  const burnRef = useRef(0);
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
        }),
      );
    } catch {
      // The ritual still works when storage is unavailable.
    }
  }, [sessions, streak, lastDate, todayCount, totalPuffs, totalFlicks, totalRings, shares, selectedPackId, packCounts, today]);

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

  const tickInhale = (time: number) => {
    if (!inhaleActiveRef.current) return;
    const next = Math.min(100, ((time - inhaleStartedAt.current) / MAX_INHALE_MS) * 100);
    inhaleProgressRef.current = next;
    setInhaleProgress(next);
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
    setFlicking(true);
    setAsh(0);
    setTotalFlicks((current) => current + 1);
    playNoise(0.11, 0.085, 5200);
    playTone(150, 0.1, 0.04, 90);
    if (navigator.vibrate) navigator.vibrate([18, 25, 18]);
    const timeout = window.setTimeout(() => setFlicking(false), 620);
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
    if (strength < 10) return;

    const burnAdded = Math.max(6, Math.round(strength * 0.13));
    const ashAdded = Math.max(12, Math.round(strength * 0.46));
    setBurn((current) => {
      const next = Math.min(96, current + burnAdded);
      burnRef.current = next;
      if (next >= 95) {
        litRef.current = false;
        setLit(false);
        micActiveRef.current = false;
        if (micFrame.current) cancelAnimationFrame(micFrame.current);
        micStream.current?.getTracks().forEach((track) => track.stop());
        micSource.current?.disconnect();
        setMicOn(false);
        setMicLevel(0);
      }
      return next;
    });
    setAsh((current) => Math.min(ASH_OVERFLOW, current + ashAdded));
    setPuffs((current) => current + 1);
    setTotalPuffs((current) => current + 1);
    playTone(210, 0.12, 0.025, 130);
    if (navigator.vibrate) navigator.vibrate(22);

    // Ash that gets too long drops on its own — like the real thing.
    if (ash + ashAdded >= ASH_OVERFLOW) {
      const dropTimeout = window.setTimeout(() => {
        setAshDropped(true);
        performFlick();
        const clearTimeoutId = window.setTimeout(() => setAshDropped(false), 2400);
        ringTimeouts.current.push(clearTimeoutId);
      }, 620);
      ringTimeouts.current.push(dropTimeout);
    }
  }

  function monitorMicrophone() {
    if (!micActiveRef.current || !micAnalyser.current) return;
    const samples = new Uint8Array(micAnalyser.current.fftSize);
    micAnalyser.current.getByteTimeDomainData(samples);
    let total = 0;
    for (const sample of samples) {
      const normalized = (sample - 128) / 128;
      total += normalized * normalized;
    }
    const level = Math.sqrt(total / samples.length);
    const visualLevel = Math.min(100, Math.round(level * 900));
    setMicLevel(visualLevel);
    if (level > 0.055 && litRef.current && burnRef.current < 95) {
      if (!inhaleActiveRef.current) beginInhale();
    } else if (inhaleActiveRef.current) {
      endInhale();
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
      analyser.smoothingTimeConstant = 0.35;
      source.connect(analyser);
      micStream.current = stream;
      micSource.current = source;
      micAnalyser.current = analyser;
      micActiveRef.current = true;
      setMicOn(true);
      monitorMicrophone();
    } catch {
      setMicError("Mic blocked — hold the button instead.");
    }
  };

  const flickAsh = () => {
    if (ash < 5 || flicking) return;
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
    setAshDropped(false);
    setPuffs(0);
    setRingCount(0);
    setSmokeRings([]);
    setFlicking(false);
    setExhaling(false);
    stopMicrophone();
    setShared(false);
    completedRef.current = false;
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
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Fake Break receipt", text, url: location.href });
      } else {
        await navigator.clipboard.writeText(`${text} ${location.href}`);
      }
      setShared(true);
      setShares((current) => current + 1);
    } catch {
      // A cancelled share leaves the result intact.
    }
  };

  const startUnbox = (packId: string) => {
    setSelectedPackId(packId);
    setUnboxOpen(false);
    setView("unbox");
  };

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

  const nextUnlocks = PACKS.filter((pack) => sessions < pack.unlock)
    .sort((a, b) => a.unlock - b.unlock)
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
      {view === "home" && (
        <div className="homeView">
          <header className="homeHeader">
            <p className="homeDay">Day {Math.max(streak, 1)} smoke-free</p>
            <h1>
              Craving one? Have one. <em>(A fake one.)</em>
            </h1>
          </header>

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
                    <strong>{pack.unlock - sessions}</strong> more fake {pack.unlock - sessions === 1 ? "break" : "breaks"} to unlock “{pack.name}”
                  </span>
                  <span className="unlockBar">
                    <i style={{ width: `${Math.min(100, (sessions / pack.unlock) * 100)}%` }} />
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

          <button type="button" className="bigCta" onClick={() => setView("packs")}>
            <span className="ctaIcon" aria-hidden="true">🚬</span>
            <span>
              <strong>Take one</strong>
              <small>Fake a smoke · free and lung-friendly</small>
            </span>
          </button>

          <p className="homeFoot">
            For fun and craving relief only · not medical advice ·{" "}
            <a href="https://smokefree.gov/" target="_blank" rel="noreferrer">
              Real quit support ↗
            </a>
          </p>
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
              const unlocked = sessions >= pack.unlock;
              const selected = selectedPackId === pack.id;
              const remaining = packCounts[pack.id] ?? PACK_SIZE;
              return (
                <button
                  type="button"
                  key={pack.id}
                  className={`packCard ${selected ? "selected" : ""} ${unlocked ? "" : "locked"}`}
                  style={{ "--card": pack.color, "--card-glow": pack.glow } as CSSProperties}
                  onClick={() => unlocked && startUnbox(pack.id)}
                  aria-pressed={selected}
                  aria-label={
                    unlocked
                      ? `Open ${pack.name}, ${remaining} left`
                      : `${pack.name}, unlock after ${pack.unlock - sessions} more fake breaks`
                  }
                >
                  <span className="packPrice">
                    {unlocked || pack.unlock === 0 ? pack.price : `🔒 ${pack.unlock - sessions} to go`}
                  </span>
                  {pack.unlock === 0 && <span className="packFree">First pack free</span>}
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
            style={{ "--card": activePack.color, "--card-glow": activePack.glow } as CSSProperties}
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
                    onClick={takeOne}
                    aria-label={available ? "Take this one" : "Already taken"}
                    tabIndex={unboxOpen ? 0 : -1}
                  >
                    <i />
                  </button>
                );
              })}
            </div>
            <div className="packBody">
              <div className="packFace">
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
              className={micOn ? "railOn" : ""}
              onClick={toggleMicrophone}
              disabled={!lit || burn >= 95}
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
              onPointerDown={beginRing}
              onPointerUp={endRing}
              onPointerCancel={endRing}
              onPointerLeave={endRing}
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

          <div className="cigaretteStage" aria-hidden="true">
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
            {flicking && (
              <div className="ashBurst">
                {Array.from({ length: 7 }, (_, index) => (
                  <i key={index} />
                ))}
              </div>
            )}
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
                  "--burn-offset": `${burn * 1.6}px`,
                  "--ash-height": `${Math.min(58, 8 + ash * 0.48)}px`,
                  "--ash-opacity": ash >= 5 ? 1 : 0,
                  "--ash-tilt": ash >= 70 ? "4.5deg" : "0deg",
                } as CSSProperties
              }
            >
              <span className="flame" />
              <span className="ashCap"><i /></span>
              <span className="ember" />
              <span className="paper"><b>FAKE</b></span>
              <span className="filter" />
            </button>
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
              onPointerDown={() => {
                if (!litRef.current && burnRef.current < 95) {
                  lightCigarette();
                  return;
                }
                beginInhale();
              }}
              onPointerUp={() => endInhale()}
              onPointerCancel={() => endInhale()}
              onPointerLeave={() => endInhale()}
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
    </main>
  );
}
