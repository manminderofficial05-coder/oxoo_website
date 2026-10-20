//@ts-nocheck
'use client';
import { useState, useEffect, useRef } from "react";
import {
  PhoneIncoming, PhoneOutgoing, PhoneMissed, CalendarCheck, Clock,
  Phone, XCircle, Activity, Volume2, VolumeX, Bell, Edit, ArrowUpRight, PhoneForwarded,
  CheckCircle2, Sparkles, User, Bot, RotateCcw
} from "lucide-react";

const C = {
  bg: "#050d1a",
  surface: "#0a1628",
  card: "#0f1f38",
  border: "#1a3050",
  borderLight: "#1e3a5f",
  accent: "#00c4ff",
  accentGlow: "rgba(0,196,255,0.15)",
  green: "#00e5a0",
  greenGlow: "rgba(0,229,160,0.15)",
  amber: "#ffb347",
  red: "#ff4d6d",
  purple: "#a78bfa",
  text: "#e2eaf4",
  textMuted: "#5a7a9a",
  textDim: "#8aa8c8",
};

const Pulse = ({ color = "green", size = 8 }) => (
  <span style={{ position: "relative", display: "inline-flex", width: size, height: size }}>
    <span style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: color === "green" ? C.green : color === "accent" ? C.accent : color === "amber" ? C.amber : C.red,
      opacity: 0.4, animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite"
    }} />
    <span style={{
      position: "relative", width: size, height: size, borderRadius: "50%",
      background: color === "green" ? C.green : color === "accent" ? C.accent : color === "amber" ? C.amber : C.red,
    }} />
  </span>
);

const Card = ({ children, onClick, style }) => (
  <div onClick={onClick} style={{
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 16, padding: 20, ...style,
    cursor: onClick ? "pointer" : "default",
    transition: "border-color 0.2s",
  }}
    onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = C.accentGlow)}
    onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = C.border)}
  >
    {children}
  </div>
);

const StatCard = ({ icon: Icon, label, value, sub, subColor = C.green, color = C.accent, trend }) => {
  const [count, setCount] = useState(0);
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ""));
  const prefix = String(value).match(/^[^0-9]*/)?.[0] || "";
  const suffix = String(value).match(/[^0-9.]*$/)?.[0] || "";
  useEffect(() => {
    let s = 0, t = setInterval(() => {
      s += num / 40;
      if (s >= num) { setCount(num); clearInterval(t); } else setCount(s);
    }, 20);
    return () => clearInterval(t);
  }, [num]);
  return (
    <Card style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${color}08` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ background: `${color}20`, borderRadius: 10, padding: 8 }}>
          <Icon size={18} color={color} />
        </div>
        {trend && (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: C.green, fontWeight: 600 }}>
            <ArrowUpRight size={12} />{trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: -1, marginBottom: 2 }}>
        {prefix}{num % 1 !== 0 ? num.toFixed(1) : Math.floor(count).toLocaleString("en-IN")}{suffix}
      </div>
      <div style={{ fontSize: 12, color: C.textMuted }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: subColor, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </Card>
  );
};

const SectionTitle = ({ icon: Icon, title, subtitle, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ background: C.accentGlow, borderRadius: 10, padding: 8 }}>
        <Icon size={18} color={C.accent} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: C.textMuted }}>{subtitle}</div>}
      </div>
    </div>
    {action && <button style={{ fontSize: 11, color: C.accent, background: "none", border: "none", cursor: "pointer" }}>{action}</button>}
  </div>
);

const Badge = ({ children, color = "gray", size = "md" }) => {
  const colors = { green: [C.green, C.greenGlow], accent: [C.accent, C.accentGlow], amber: [C.amber, `${C.amber}20`], red: [C.red, `${C.red}20`], purple: [C.purple, `${C.purple}20`], gray: [C.textMuted, `${C.textMuted}10`] };
  const [textColor, bgColor] = colors[color] || colors.gray;
  return <span style={{ display: "inline-block", fontSize: size === "md" ? 10 : 8, padding: size === "md" ? "3px 8px" : "2px 6px", borderRadius: 6, background: bgColor, color: textColor, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
};

// ── Two Detailed Demo Calls with Realistic Turn-by-Turn Dialogue ──
const DEMO_SCENARIOS = {
  inbound: {
    id: "inbound",
    type: "INBOUND",
    badgeColor: "green",
    title: "Appointment Booking",
    subtitle: "Inbound call from patient looking to book a doctor",
    callerName: "Rajesh Kumar",
    callerPhone: "+91 87654 32109",
    outcome: "Appointment Booked · Cardiology (Dr. Anitha Rao) · Tomorrow 10:30 AM",
    bookedData: {
      patientName: "Rajesh Kumar",
      phone: "+91 87654 32109",
      doctorName: "Dr. Anitha Rao",
      department: "Cardiology",
      type: "OPD",
      time: "Tomorrow at 10:30 AM",
    },
    turns: [
      { speaker: "ai", text: "Good morning! Thank you for calling City Hospital. I am your AI receptionist. How can I help you today?" },
      { speaker: "patient", text: "Hello! I would like to book an appointment with a cardiologist, Dr. Anitha Rao, for tomorrow morning." },
      { speaker: "ai", text: "Certainly, Mr. Kumar! Dr. Anitha Rao has an opening tomorrow, Thursday, at 10:30 AM. Would you like me to reserve this slot for you?" },
      { speaker: "patient", text: "Yes please, 10:30 AM works perfectly for me." },
      { speaker: "ai", text: "Great! Your appointment with Dr. Anitha Rao is confirmed for tomorrow at 10:30 AM. A confirmation SMS with room details has been sent to your number. Is there anything else I can help you with?" },
      { speaker: "patient", text: "No, that was very smooth and fast. Thank you so much!" },
      { speaker: "ai", text: "You are very welcome! Have a healthy and wonderful day. Goodbye!" },
    ],
  },
  outbound: {
    id: "outbound",
    type: "OUTBOUND",
    badgeColor: "accent",
    title: "Appointment Rescheduling",
    subtitle: "Patient calling regarding rescheduling an existing visit",
    callerName: "Pooja Sharma",
    callerPhone: "+91 98765 43210",
    outcome: "Appointment Rescheduled · Dermatology (Dr. Sanjay Pillai) · Friday 3:00 PM",
    bookedData: {
      patientName: "Pooja Sharma",
      phone: "+91 98765 43210",
      doctorName: "Dr. Sanjay Pillai",
      department: "Dermatology",
      type: "FOLLOW_UP",
      time: "This Friday at 3:00 PM",
    },
    turns: [
      { speaker: "ai", text: "Hello, am I speaking with Ms. Pooja Sharma? This is City Hospital's AI assistant calling regarding your upcoming appointment." },
      { speaker: "patient", text: "Yes, this is Pooja. I was actually hoping to reschedule my appointment with Dr. Sanjay Pillai because I have an urgent meeting." },
      { speaker: "ai", text: "No problem at all, Ms. Sharma! Dr. Pillai has openings this Friday at 3:00 PM or Saturday at 11:30 AM. Which one suits your schedule better?" },
      { speaker: "patient", text: "Friday at 3:00 PM would be much better for me." },
      { speaker: "ai", text: "I have successfully rescheduled your appointment with Dr. Sanjay Pillai to Friday at 3:00 PM. We have updated your calendar and sent you a revised confirmation." },
      { speaker: "patient", text: "That was so easy and helpful. Thank you!" },
      { speaker: "ai", text: "It was my pleasure! Take care and see you on Friday. Goodbye!" },
    ],
  },
};

const demoCalls = [
  {
    type: "INBOUND",
    color: "green",
    title: "Book an appointment",
    patient: "I'd like to see a cardiologist this week.",
    ai: "I have Thursday at 10:30 AM or Friday at 2 PM. Which works better?",
    followUp: "Thursday morning, please.",
    result: "Appointment booked · Cardiology · Thu, 10:30 AM",
    scenarioKey: "inbound",
  },
  {
    type: "OUTBOUND",
    color: "accent",
    title: "Reschedule an appointment",
    patient: "I need to reschedule my Friday appointment with Dr. Pillai.",
    ai: "Dr. Pillai has availability Friday at 3 PM or Saturday at 11 AM.",
    followUp: "Friday at 3 PM would be great.",
    result: "Appointment rescheduled · Dermatology · Fri, 3:00 PM",
    scenarioKey: "outbound",
  },
  {
    type: "MISSED-CALL CALLBACK",
    color: "amber",
    title: "Recover a missed call",
    patient: "I called earlier to ask about my test results.",
    ai: "I can arrange a nurse callback, or connect you with the lab desk now.",
    followUp: "Please have the nurse call me back.",
    result: "Callback request sent to the care team",
    scenarioKey: "inbound",
  },
];

// Helper: Play authentic telephone ring tone using Web Audio API
function playRingtoneSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return () => { };
    const ctx = new AudioCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.value = 440;
    osc2.frequency.value = 480;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.08, ctx.currentTime + 1.2);
    gain.gain.setValueAtTime(0, ctx.currentTime + 2.0);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    return () => {
      try {
        osc1.stop();
        osc2.stop();
        ctx.close();
      } catch { }
    };
  } catch {
    return () => { };
  }
}

export function VoiceTab({ liveQueue = [], voice = {}, voiceScenarioStats = {} }) {
  const [callSim, setCallSim] = useState(null); // null | 'ringing' | 'active' | 'completed'
  const [simScenario, setSimScenario] = useState("inbound"); // 'inbound' | 'outbound'
  const [simTimer, setSimTimer] = useState(0);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [displayedTurns, setDisplayedTurns] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callEndedNotice, setCallEndedNotice] = useState(null);

  const turnsEndRef = useRef(null);
  const activeUtteranceRef = useRef(null);
  const stopRingRef = useRef(null);

  // Call timer
  useEffect(() => {
    let interval;
    if (callSim === "active") {
      interval = setInterval(() => setSimTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callSim]);

  // Autoscroll chat transcript
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedTurns, isSpeaking]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (stopRingRef.current) stopRingRef.current();
    };
  }, []);

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const inboundScenarios = voiceScenarioStats?.inbound || [];
  const outboundScenarios = voiceScenarioStats?.outbound || [];
  const inboundTotal = inboundScenarios.reduce((sum, x) => sum + (x.count || 0), 0);
  const outboundTotal = outboundScenarios.reduce((sum, x) => sum + (x.count || 0), 0);

  const scenario = DEMO_SCENARIOS[simScenario] || DEMO_SCENARIOS.inbound;

  // Start call simulation with audio
  const startSimulation = (scenarioKey = "inbound") => {
    // Cancel any previous speech/ring
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (stopRingRef.current) stopRingRef.current();

    setSimScenario(scenarioKey);
    setCallSim("ringing");
    setSimTimer(0);
    setCurrentTurnIndex(0);
    setDisplayedTurns([]);
    setIsSpeaking(false);
    setCallEndedNotice(null);

    // Play ringing tone
    stopRingRef.current = playRingtoneSound();

    // Connect after ringing
    setTimeout(() => {
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
      setCallSim("active");
    }, 2200);
  };

  // Run dialogue turn-by-turn with audible speech
  useEffect(() => {
    if (callSim !== "active") return;

    const turns = scenario.turns;
    if (currentTurnIndex >= turns.length) {
      // Call finished naturally
      const timer = setTimeout(() => {
        handleCallCompletion();
      }, 1200);
      return () => clearTimeout(timer);
    }

    const currentTurn = turns[currentTurnIndex];

    // Add to displayed transcript
    setDisplayedTurns((prev) => {
      if (!prev.some((t, i) => i === currentTurnIndex)) {
        return [...prev, currentTurn];
      }
      return prev;
    });

    setIsSpeaking(true);

    // Speak aloud using Web Speech API
    if (typeof window !== "undefined" && window.speechSynthesis && !isMuted) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(currentTurn.text);
      activeUtteranceRef.current = utter;

      const voices = window.speechSynthesis.getVoices();
      if (currentTurn.speaker === "ai") {
        // AI receptionist: female, warm, clear
        const femaleVoice = voices.find(
          (v) => (v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Samantha") || v.name.includes("Victoria") || v.name.includes("Google") || v.name.includes("Natural")) && v.lang.startsWith("en")
        ) || voices.find((v) => v.lang.startsWith("en"));
        if (femaleVoice) utter.voice = femaleVoice;
        utter.pitch = 1.15;
        utter.rate = 0.96;
      } else {
        // Customer: distinct tone
        const maleVoice = voices.find(
          (v) => (v.name.includes("Male") || v.name.includes("David") || v.name.includes("George") || v.name.includes("Alex") || v.name.includes("Mark")) && v.lang.startsWith("en")
        ) || voices.find((v) => v.lang.startsWith("en"));
        if (maleVoice) utter.voice = maleVoice;
        utter.pitch = 0.88;
        utter.rate = 1.0;
      }

      let done = false;
      const advance = () => {
        if (!done) {
          done = true;
          setIsSpeaking(false);
          setTimeout(() => {
            setCurrentTurnIndex((idx) => idx + 1);
          }, 500); // realistic pause between speakers
        }
      };

      utter.onend = advance;
      utter.onerror = advance;

      // Fallback timer if browser voice engine hangs
      const wordCount = currentTurn.text.split(" ").length;
      const fallbackMs = Math.max(3000, wordCount * 450);
      const fallbackTimer = setTimeout(advance, fallbackMs);

      window.speechSynthesis.speak(utter);

      return () => {
        done = true;
        clearTimeout(fallbackTimer);
        try { window.speechSynthesis.cancel(); } catch { }
      };
    } else {
      // Muted or speech unavailable: simulate duration by word count
      const wordCount = currentTurn.text.split(" ").length;
      const timer = setTimeout(() => {
        setIsSpeaking(false);
        setTimeout(() => {
          setCurrentTurnIndex((idx) => idx + 1);
        }, 500);
      }, Math.max(2200, wordCount * 280));

      return () => clearTimeout(timer);
    }
  }, [callSim, currentTurnIndex, simScenario, isMuted]);

  // When call completes naturally or is ended
  const handleCallCompletion = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (stopRingRef.current) {
      stopRingRef.current();
      stopRingRef.current = null;
    }

    setCallSim("completed");
    setIsSpeaking(false);
    setCallEndedNotice({
      title: scenario.title,
      outcome: scenario.outcome,
      duration: fmtTime(simTimer),
    });

    // Automatically record booking/reschedule to demo storage
    try {
      fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: "pat_1",
          doctorId: "doc_1",
          departmentId: "dept_1",
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          notes: `Booked via Voice AI demo call (${scenario.title})`,
        }),
      }).catch(() => { });
    } catch { }
  };

  const endCall = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (stopRingRef.current) {
      stopRingRef.current();
      stopRingRef.current = null;
    }
    setCallSim(null);
    setSimTimer(0);
    setIsSpeaking(false);
    setDisplayedTurns([]);
    setCurrentTurnIndex(0);
    setCallEndedNotice(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        <StatCard icon={PhoneIncoming} label="Inbound Today" value={voice?.inbound ?? 0} color={C.green} sub="Live call logs" />
        <StatCard icon={PhoneOutgoing} label="Outbound Today" value={voice?.outbound ?? 0} trend="+0%" color={C.accent} sub="Follow-up calls" />
        <StatCard icon={PhoneMissed} label="Missed Calls" value={voice?.missed ?? 0} color={C.red} sub={`${voice?.callbacks?.done ?? 0} auto-callback`} />
        <StatCard icon={CalendarCheck} label="Booked via Voice" value={voice?.booked ?? 0} color={C.purple} sub="AI assisted" />
        <StatCard icon={Clock} label="Avg Call Duration" value={`${Math.floor((voice?.avgDurationSec ?? 0) / 60)}m ${(voice?.avgDurationSec ?? 0) % 60}s`} color={C.amber} sub="AI handled" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: 20 }}>
        {/* Left Column: Interactive Call Simulator with Audible Voice */}
        <Card style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: C.accentGlow, borderRadius: 10, padding: 8 }}>
                <Phone size={18} color={C.accent} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>AI Receptionist</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>Voice call handler — spoken audio demo</div>
              </div>
            </div>

            {/* Audio Mute/Unmute Toggle */}
            <button
              onClick={() => {
                if (!isMuted && typeof window !== "undefined" && window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                setIsMuted(!isMuted);
              }}
              title={isMuted ? "Audio muted — click to unmute" : "Audio active — speaking out loud"}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: isMuted ? "rgba(255,77,109,0.12)" : "rgba(0,229,160,0.12)",
                border: `1px solid ${isMuted ? C.red + "40" : C.green + "40"}`,
                borderRadius: 20, padding: "4px 10px",
                color: isMuted ? C.red : C.green,
                fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              {isMuted ? "Muted" : "Voice Sound On"}
            </button>
          </div>

          <div style={{ background: C.surface, borderRadius: 14, padding: 20, border: `1px solid ${C.border}`, textAlign: "center" }}>
            {/* Phone Pulse Icon */}
            <div style={{
              width: 76, height: 76, borderRadius: "50%", margin: "0 auto 14px",
              background: callSim === "active"
                ? `linear-gradient(135deg, ${C.green}, ${C.accent})`
                : callSim === "ringing"
                  ? `linear-gradient(135deg, ${C.amber}, ${C.green})`
                  : C.card,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: callSim === "active"
                ? `0 0 35px ${C.green}70`
                : callSim === "ringing"
                  ? `0 0 25px ${C.amber}60`
                  : "none",
              transition: "all 0.4s", position: "relative", border: `2px solid ${callSim ? "#fff" : C.border}`
            }}>
              <Phone size={30} color={callSim ? "#fff" : C.textMuted} />
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>
              {callSim === "active"
                ? `Call in Progress · ${scenario.title}`
                : callSim === "ringing"
                  ? (simScenario === "inbound" ? "Incoming Call Ringing..." : "Dialing Outbound...")
                  : callSim === "completed"
                    ? "Call Completed"
                    : "AI Receptionist Ready"}
            </div>

            {/* Ringing State */}
            {callSim === "ringing" && (
              <div style={{ margin: "14px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>{scenario.callerName} · {scenario.callerPhone}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.amber }}>
                  <Pulse color="amber" size={8} /> 🔔 Playing telephone ring tone...
                </div>
              </div>
            )}

            {/* Active Call State */}
            {callSim === "active" && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 700, color: C.green }}>{fmtTime(simTimer)}</div>
                  <Badge color={scenario.badgeColor}>{scenario.type}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>{scenario.callerName} · {scenario.callerPhone}</div>

                {/* Audible Speaking Indicator */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "4px 12px", borderRadius: 20,
                  background: isSpeaking ? "rgba(0,196,255,0.15)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isSpeaking ? C.accent : "rgba(255,255,255,0.1)"}`,
                  marginBottom: 12,
                }}>
                  <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
                    <span style={{ width: 3, height: isSpeaking ? 12 : 4, background: C.accent, borderRadius: 2, animation: isSpeaking ? "pulse 0.8s infinite" : "none" }} />
                    <span style={{ width: 3, height: isSpeaking ? 16 : 6, background: C.accent, borderRadius: 2, animation: isSpeaking ? "pulse 0.6s infinite 0.2s" : "none" }} />
                    <span style={{ width: 3, height: isSpeaking ? 10 : 4, background: C.accent, borderRadius: 2, animation: isSpeaking ? "pulse 0.7s infinite 0.4s" : "none" }} />
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: isSpeaking ? C.accent : C.textMuted }}>
                    {isSpeaking
                      ? (scenario.turns[currentTurnIndex]?.speaker === "ai" ? "AI speaking aloud..." : `${scenario.callerName} speaking...`)
                      : "Transcribing live"}
                  </span>
                </div>

                {/* Live Transcript Stream */}
                <div style={{
                  maxHeight: "180px", overflowY: "auto",
                  padding: "12px 14px", background: C.card, borderRadius: 12,
                  textAlign: "left", fontSize: 12, lineHeight: 1.7, color: C.textDim,
                  border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 8,
                }}>
                  {displayedTurns.map((turn, i) => {
                    const isAi = turn.speaker === "ai";
                    const isCurrent = i === currentTurnIndex && isSpeaking;
                    return (
                      <div
                        key={i}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          background: isCurrent ? (isAi ? "rgba(0,196,255,0.12)" : "rgba(167,139,250,0.12)") : "transparent",
                          borderLeft: isCurrent ? `3px solid ${isAi ? C.accent : C.purple}` : "3px solid transparent",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          {isAi ? <Bot size={13} color={C.accent} /> : <User size={13} color={C.purple} />}
                          <span style={{ color: isAi ? C.accent : C.purple, fontWeight: 700, fontSize: 11 }}>
                            {isAi ? "AI Receptionist" : scenario.callerName}:
                          </span>
                        </div>
                        <div style={{ color: isCurrent ? C.text : C.textDim, fontSize: 12 }}>"{turn.text}"</div>
                      </div>
                    );
                  })}
                  <div ref={turnsEndRef} />
                </div>
              </>
            )}

            {/* Completed State */}
            {callSim === "completed" && callEndedNotice && (
              <div style={{ margin: "14px 0", padding: 14, background: `${C.green}12`, borderRadius: 12, border: `1px solid ${C.green}40`, textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.green, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                  <CheckCircle2 size={16} /> Call Completed · {callEndedNotice.duration}
                </div>
                <div style={{ fontSize: 12, color: C.text, marginBottom: 8, lineHeight: 1.5 }}>
                  {callEndedNotice.outcome}
                </div>
                <div style={{ fontSize: 11, color: C.textDim }}>
                  ✓ Logged in Appointments and Call Records automatically.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
              {!callSim && (
                <>
                  <button
                    onClick={() => startSimulation("inbound")}
                    style={{
                      background: `linear-gradient(135deg, ${C.green}, ${C.accent})`,
                      border: "none", borderRadius: 10, padding: "10px 18px",
                      color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      boxShadow: "0 4px 14px rgba(0,229,160,0.25)",
                    }}
                  >
                    <PhoneIncoming size={15} /> Simulate Inbound (Booking)
                  </button>
                  <button
                    onClick={() => startSimulation("outbound")}
                    style={{
                      background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
                      border: "none", borderRadius: 10, padding: "10px 18px",
                      color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 8,
                      boxShadow: "0 4px 14px rgba(0,196,255,0.25)",
                    }}
                  >
                    <PhoneOutgoing size={15} /> Simulate Outbound (Reschedule)
                  </button>
                </>
              )}

              {callSim === "ringing" && (
                <button
                  onClick={endCall}
                  style={{
                    background: "rgba(255,77,109,0.2)", border: `1px solid ${C.red}`,
                    borderRadius: 10, padding: "8px 16px", color: C.red,
                    fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <XCircle size={15} /> Cancel Call
                </button>
              )}

              {callSim === "active" && (
                <button
                  onClick={endCall}
                  style={{
                    background: "rgba(255,77,109,0.2)", border: `1px solid ${C.red}`,
                    borderRadius: 10, padding: "8px 18px", color: C.red,
                    fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <XCircle size={15} /> End Call
                </button>
              )}

              {callSim === "completed" && (
                <button
                  onClick={() => startSimulation(simScenario)}
                  style={{
                    background: `linear-gradient(135deg, ${C.green}, ${C.accent})`,
                    border: "none", borderRadius: 10, padding: "8px 16px",
                    color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <RotateCcw size={14} /> Replay Call
                </button>
              )}
            </div>
          </div>

          {/* Auto Missed-Call Callback box */}
          <div style={{ marginTop: 16, padding: 14, background: `${C.amber}10`, borderRadius: 12, border: `1px solid ${C.amber}30` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <PhoneForwarded size={16} color={C.amber} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.amber }}>Auto Missed-Call Callback</span>
              <Badge color="green">Active</Badge>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
              {(voice?.callbacks?.missed ?? 0)} missed calls detected today → AI called back within 60 seconds → {(voice?.callbacks?.done ?? 0)} connected → {(voice?.callbacks?.booked ?? 0)} booked
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {[
                { label: "Missed", val: voice?.callbacks?.missed ?? 0, color: C.text },
                { label: "Called Back", val: voice?.callbacks?.done ?? 0, color: C.green },
                { label: "Booked", val: voice?.callbacks?.booked ?? 0, color: C.accent },
              ].map((m) => (
                <div key={m.label} style={{ flex: 1, textAlign: "center", background: C.surface, borderRadius: 8, padding: "8px 4px" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.val}</div>
                  <div style={{ fontSize: 9, color: C.textMuted }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Column: Live Queue & Scenarios */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle icon={Activity} title="Live Call Queue" subtitle="Real-time status" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {liveQueue.length === 0 ? (
                <div style={{ color: C.textMuted, fontSize: 12, textAlign: "center", padding: "16px 0" }}>
                  No calls currently in queue
                </div>
              ) : (
                liveQueue.map((call) => (
                  <div key={call.id} style={{
                    padding: "10px 14px", borderRadius: 12,
                    background: call.status === "in-progress" ? `${C.green}10` : call.status === "ringing" ? `${C.amber}10` : C.surface,
                    border: `1px solid ${call.status === "in-progress" ? C.green + "40" : call.status === "ringing" ? C.amber + "40" : C.border}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Pulse color={call.status === "in-progress" ? "green" : call.status === "ringing" ? "amber" : "accent"} size={7} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{call.name}</span>
                        <span style={{ fontSize: 11, color: C.textMuted }}>{call.phone}</span>
                      </div>
                      <Badge color={call.status === "in-progress" ? "green" : call.status === "ringing" ? "amber" : "gray"}>
                        {call.status}
                      </Badge>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textDim }}>
                      <span>Dept: {call.dept}</span>
                      <span>Assigned: {call.agent}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card>
              <SectionTitle icon={Volume2} title="Inbound Scenarios" subtitle={`${inboundScenarios.length} active`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {inboundScenarios.map((s) => {
                  const pct = inboundTotal > 0 ? Math.max(4, Math.round((s.count / inboundTotal) * 100)) : 0;
                  return (
                    <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                          <span style={{ color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
                          <span style={{ color: C.textMuted }}>{s.count}</span>
                        </div>
                        <div style={{ height: 5, background: C.surface, borderRadius: 4, marginTop: 5, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: s.color, borderRadius: 4 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <SectionTitle icon={Bell} title="Outbound Scenarios" subtitle={`${outboundScenarios.length} active`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {outboundScenarios.map((s) => {
                  const pct = outboundTotal > 0 ? Math.max(4, Math.round((s.count / outboundTotal) * 100)) : 0;
                  return (
                    <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                          <span style={{ color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
                          <span style={{ color: C.textMuted }}>{s.count}</span>
                        </div>
                        <div style={{ height: 5, background: C.surface, borderRadius: 4, marginTop: 5, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: s.color, borderRadius: 4 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Section: Clickable Demo Call Library */}
      <section>
        <SectionTitle icon={Phone} title="See how calls work" subtitle="Listen to example conversations handled by your AI receptionist" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
          {demoCalls.map((demoCall) => (
            <Card
              key={demoCall.title}
              onClick={() => startSimulation(demoCall.scenarioKey)}
              style={{ padding: 16, cursor: "pointer", transition: "transform 0.15s, border-color 0.15s" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 }}>
                <span style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{demoCall.title}</span>
                <Badge color={demoCall.color}>{demoCall.type}</Badge>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 11, lineHeight: 1.6 }}>
                <div><span style={{ color: C.purple, fontWeight: 700 }}>Patient:</span> <span style={{ color: C.textDim }}>{demoCall.patient}</span></div>
                <div><span style={{ color: C.accent, fontWeight: 700 }}>AI:</span> <span style={{ color: C.textDim }}>{demoCall.ai}</span></div>
                <div><span style={{ color: C.purple, fontWeight: 700 }}>Patient:</span> <span style={{ color: C.textDim }}>{demoCall.followUp}</span></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 10 }}>
                <span style={{ color: C.green, fontSize: 10, fontWeight: 600 }}>
                  <CalendarCheck size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />{demoCall.result}
                </span>
                <span style={{ color: C.accent, fontSize: 25, fontWeight: 600 }}>
                  ▶
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
