import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "motion/react";

type Expression =
  | "soft"
  | "thinking"
  | "listening"
  | "sleeping"
  | "waking"
  | "speaking";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult:
    | ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void)
    | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

const emotionTiming = {
  wakingHold: 900,
  listeningHold: 1400,
  thinkingAfterIdle: 4500,
  sleepingAfterIdle: 11000,
};

const voiceCommandAliases: Record<Expression, string[]> = {
  soft: ["soft", "calm", "normal", "relax", "reset", "smile", "default"],
  thinking: ["think", "thinking", "thought", "idea", "ideas", "brainstorm"],
  listening: ["listen", "listening", "listing", "hear me", "look at me"],
  sleeping: ["sleep", "sleeping", "go sleep", "go to sleep", "sleepy", "nap"],
  speaking: ["speak", "speaking", "talk", "talking", "say", "say hello"],
  waking: [
    "wake",
    "wake up",
    "wakeup",
    "wake app",
    "week up",
    "awake",
    "get up",
  ],
};

const voiceResponses: Record<Expression, string> = {
  soft: "Back to soft mode.",
  thinking: "Thinking with you.",
  listening: "Listening.",
  sleeping: "Going to sleep.",
  speaking: "Hello, I can speak and listen.",
  waking: "Waking up.",
};

const normalizeVoiceText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const findVoiceCommand = (text: string): Expression | null => {
  const normalizedText = normalizeVoiceText(text);

  for (const [expression, aliases] of Object.entries(voiceCommandAliases)) {
    if (
      aliases.some((alias) =>
        normalizedText.includes(normalizeVoiceText(alias)),
      )
    ) {
      return expression as Expression;
    }
  }

  return null;
};

export const InteractiveCharacter: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expression, setExpression] = useState<Expression>("soft");
  const expressionRef = useRef<Expression>("soft");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceControlEnabledRef = useRef(false);
  const wakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listeningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saccadeControls = useAnimation();

  const clearEmotionTimers = useCallback(() => {
    if (wakingTimeoutRef.current) clearTimeout(wakingTimeoutRef.current);
    if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
    if (sleepingTimeoutRef.current) clearTimeout(sleepingTimeoutRef.current);
  }, []);

  const scheduleIdleEmotions = useCallback(
    (delay = 0, clearExisting = true) => {
      if (clearExisting) clearEmotionTimers();

      listeningTimeoutRef.current = setTimeout(() => {
        setExpression("soft");
      }, delay + emotionTiming.listeningHold);

      thinkingTimeoutRef.current = setTimeout(() => {
        setExpression("thinking");
      }, delay + emotionTiming.thinkingAfterIdle);

      sleepingTimeoutRef.current = setTimeout(() => {
        setExpression("sleeping");
      }, delay + emotionTiming.sleepingAfterIdle);
    },
    [clearEmotionTimers],
  );

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const applyVoiceCommand = useCallback(
    (nextExpression: Expression) => {
      clearEmotionTimers();

      if (nextExpression === "waking") {
        setExpression("waking");
        speak(voiceResponses.waking);

        wakingTimeoutRef.current = setTimeout(() => {
          setExpression("listening");
          scheduleIdleEmotions();
        }, emotionTiming.wakingHold);
        return;
      }

      setExpression(nextExpression);
      speak(voiceResponses[nextExpression]);

      if (
        nextExpression === "listening" ||
        nextExpression === "soft" ||
        nextExpression === "speaking"
      ) {
        scheduleIdleEmotions();
      }

      if (nextExpression === "thinking") {
        sleepingTimeoutRef.current = setTimeout(() => {
          setExpression("sleeping");
        }, emotionTiming.sleepingAfterIdle);
      }
    },
    [clearEmotionTimers, scheduleIdleEmotions, speak],
  );

  const startVoiceControl = useCallback(() => {
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speak("Voice commands are not supported in this browser.");
      return;
    }

    if (voiceControlEnabledRef.current) {
      voiceControlEnabledRef.current = false;
      recognitionRef.current?.stop();
      speak("Voice control paused.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      const transcripts = Array.from(event.results).flatMap((result) =>
        Array.from(result).map((alternative) => alternative.transcript),
      );
      const command = findVoiceCommand(transcripts.join(" "));

      if (command) {
        applyVoiceCommand(command);
      } else {
        setExpression("thinking");
        speak("I did not catch that.");
      }
    };

    recognition.onerror = () => {
      setExpression("thinking");
    };

    recognition.onend = () => {
      if (!voiceControlEnabledRef.current) return;

      setTimeout(() => {
        try {
          recognition.start();
        } catch (error) {
          // Browser speech recognition can reject fast restarts.
        }
      }, 350);
    };

    recognitionRef.current = recognition;
    voiceControlEnabledRef.current = true;
    setExpression("listening");

    try {
      recognition.start();
    } catch (error) {
      voiceControlEnabledRef.current = false;
      setExpression("thinking");
    }
  }, [applyVoiceCommand, speak]);

  useEffect(() => {
    expressionRef.current = expression;
  }, [expression]);

  useEffect(() => {
    return () => {
      voiceControlEnabledRef.current = false;
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });

      if (expressionRef.current === "sleeping") {
        clearEmotionTimers();
        setExpression("waking");

        wakingTimeoutRef.current = setTimeout(() => {
          setExpression("listening");
        }, emotionTiming.wakingHold);

        scheduleIdleEmotions(emotionTiming.wakingHold, false);
        return;
      }

      if (expressionRef.current === "waking") return;

      setExpression("listening");
      scheduleIdleEmotions();
    };

    thinkingTimeoutRef.current = setTimeout(() => {
      setExpression("thinking");
    }, emotionTiming.thinkingAfterIdle);

    sleepingTimeoutRef.current = setTimeout(() => {
      setExpression("sleeping");
    }, emotionTiming.sleepingAfterIdle);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearEmotionTimers();
    };
  }, [clearEmotionTimers, scheduleIdleEmotions]);

  useEffect(() => {
    let isMounted = true;
    let blinkTimeout: ReturnType<typeof setTimeout>;
    let saccadeTimeout: ReturnType<typeof setTimeout>;

    const blink = () => {
      if (!isMounted) return;
      if (expression !== "sleeping") {
        setIsBlinking(true);

        setTimeout(() => {
          if (isMounted) setIsBlinking(false);
        }, 120);
      }

      blinkTimeout = setTimeout(blink, Math.random() * 3500 + 2200);
    };

    const saccade = async () => {
      if (!isMounted) return;
      if (expression !== "sleeping") {
        try {
          await saccadeControls.start({
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 4,
            transition: { duration: 0.12 },
          });

          if (isMounted) {
            await saccadeControls.start({
              x: 0,
              y: 0,
              transition: { duration: 0.7, ease: "easeOut" },
            });
          }
        } catch (error) {
          // Ignore animation errors when unmounting
        }
      }

      if (isMounted) {
        saccadeTimeout = setTimeout(saccade, Math.random() * 2200 + 800);
      }
    };

    blinkTimeout = setTimeout(blink, 1600);
    saccadeTimeout = setTimeout(saccade, 900);

    return () => {
      isMounted = false;
      clearTimeout(blinkTimeout);
      clearTimeout(saccadeTimeout);
    };
  }, [expression, saccadeControls]);

  const isSleeping = expression === "sleeping";
  const isWaking = expression === "waking";

  const pupilOffset =
    expression === "thinking"
      ? { x: 0, y: -7 }
      : expression === "speaking"
      ? { x: mousePosition.x * 2.5, y: mousePosition.y * 2 - 1 }
      : expression === "waking"
      ? { x: mousePosition.x * 2, y: mousePosition.y * 1.5 + 2 }
      : expression === "listening"
      ? { x: mousePosition.x * 3 + 3, y: mousePosition.y * 2 }
      : { x: mousePosition.x * 4, y: mousePosition.y * 3 };

  const mouthPath =
    expression === "thinking"
      ? "M 18 20 Q 29 16 40 20"
      : expression === "speaking"
      ? "M 16 17 Q 29 31 42 17"
      : expression === "listening"
      ? "M 14 18 Q 29 28 44 18"
      : expression === "waking"
      ? "M 18 21 Q 29 25 40 21"
      : expression === "sleeping"
      ? "M 16 22 Q 29 26 42 22"
      : "M 18 16 Q 29 28 40 16";

  const mouthScaleY = isSpeaking
    ? [0.85, 1.35, 0.8, 1.18, 0.95]
    : expression === "listening"
    ? 1.22
    : expression === "waking"
    ? 0.82
    : expression === "sleeping"
    ? 0.72
    : 1;

  return (
    <div
      className="relative w-full aspect-square max-w-[540px] mx-auto flex items-center justify-center [perspective:1200px] overflow-visible pointer-events-auto"
      role="button"
      tabIndex={0}
      aria-label="Interactive speaking character. Click to start or pause voice commands."
      onClick={startVoiceControl}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;

        event.preventDefault();
        startVoiceControl();
      }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-[-10%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 55% 45%, rgba(160,145,255,0.45), rgba(255,255,255,0.14) 42%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.55, 0.9, 0.55],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rim light */}
      <motion.div
        className="absolute w-[75%] h-[75%] rounded-full pointer-events-none"
        style={{
          background:
            "conic-gradient(from 40deg, transparent, rgba(180,165,255,0.65), transparent, rgba(255,255,255,0.28), transparent)",
          filter: "blur(30px)",
        }}
        animate={{
          rotate: [0, 360],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{
          rotate: { duration: 24, repeat: Infinity, ease: "linear" },
          opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      {/* White living orb */}
      <motion.div
        className="relative z-10 w-[68%] h-[68%] rounded-full flex items-center justify-center overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
          background:
            "radial-gradient(circle at 32% 22%, #ffffff 0%, #f7f7fb 34%, #e3e4ee 68%, #c7cad8 100%)",
          boxShadow: `
            0 55px 120px rgba(0,0,0,0.35),
            0 0 90px rgba(145,120,255,0.35),
            inset 30px 24px 45px rgba(255,255,255,0.95),
            inset -30px -35px 60px rgba(120,125,150,0.36),
            inset -8px -4px 24px rgba(135,105,255,0.25),
            inset 8px 5px 18px rgba(255,255,255,0.9)
          `,
          border: "1px solid rgba(255,255,255,0.75)",
        }}
        animate={{
          y: [0, -13, 0],
          scale: [1, 1.018, 1],
          rotateX: mousePosition.y * 8,
          rotateY: mousePosition.x * 10,
        }}
        transition={{
          y: { duration: 6.2, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          rotateX: { type: "spring", stiffness: 85, damping: 22 },
          rotateY: { type: "spring", stiffness: 85, damping: 22 },
        }}
      >
        {/* Big glossy reflection */}
        <motion.div
          className="absolute top-[7%] left-[17%] w-[46%] h-[28%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0.32) 45%, transparent 72%)",
            filter: "blur(15px)",
          }}
          animate={{
            opacity: [0.4, 0.75, 0.4],
            x: mousePosition.x * -8,
            y: mousePosition.y * -5,
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Purple side reflection */}
        <div
          className="absolute right-[-8%] top-[20%] w-[30%] h-[54%] rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(130,100,255,0.32))",
            filter: "blur(18px)",
          }}
        />

        {/* Face */}
        <motion.div
          className="absolute top-[31%] w-[82%] flex flex-col items-center gap-5 z-20"
          animate={{
            x: mousePosition.x * 15,
            y: mousePosition.y * 8,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
        >
          {/* Eyebrows */}
          {!isSleeping && (
            <div className="absolute top-[-18px] flex gap-12">
              <motion.div
                className="w-9 h-[5px] rounded-full bg-slate-600/70"
                animate={{
                  rotate:
                    expression === "thinking"
                      ? -18
                      : expression === "speaking"
                      ? -8
                      : expression === "waking"
                      ? -2
                      : expression === "listening"
                      ? 12
                      : -6,
                  y:
                    expression === "thinking"
                      ? -5
                      : expression === "waking"
                      ? 3
                      : 0,
                }}
              />
              <motion.div
                className="w-9 h-[5px] rounded-full bg-slate-600/70"
                animate={{
                  rotate:
                    expression === "thinking"
                      ? 14
                      : expression === "speaking"
                      ? 8
                      : expression === "waking"
                      ? 2
                      : expression === "listening"
                      ? -12
                      : 6,
                  y:
                    expression === "thinking"
                      ? 2
                      : expression === "waking"
                      ? 3
                      : 0,
                }}
              />
            </div>
          )}

          {/* Eyes */}
          <motion.div
            className="flex items-center justify-center gap-8 sm:gap-10"
            animate={saccadeControls}
          >
            {[0, 1].map((eye) => (
              <motion.div
                key={eye}
                className="relative w-[42px] h-[52px] sm:w-[48px] sm:h-[60px] rounded-full overflow-hidden"
                style={{
                  transformOrigin: "center",
                  background:
                    "radial-gradient(circle at 38% 28%, #ffffff 0%, #f5f7ff 42%, #cfd4e8 100%)",
                  boxShadow: `
                    inset 0 4px 10px rgba(0,0,0,0.25),
                    inset -4px -6px 12px rgba(0,0,0,0.2),
                    0 0 22px rgba(255,255,255,0.75),
                    0 0 38px rgba(130,110,255,0.26)
                  `,
                }}
                animate={{
                  scaleY: isSleeping || isBlinking ? 0.13 : isWaking ? 0.55 : 1,
                  y: isSleeping ? 8 : isWaking ? 5 : 0,
                }}
                transition={{ duration: 0.12, ease: "easeInOut" }}
              >
                {/* Pupil */}
                <motion.div
                  className="absolute top-[28%] left-[30%] w-[42%] h-[48%] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 40% 35%, #2d3342 0%, #08090d 62%, #000 100%)",
                    boxShadow:
                      "inset 0 2px 5px rgba(255,255,255,0.2), 0 0 10px rgba(0,0,0,0.45)",
                  }}
                  animate={{
                    x: pupilOffset.x,
                    y: pupilOffset.y,
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                >
                  {/* Sharp white dot reflection in pupil */}
                  <div className="absolute top-[18%] right-[22%] w-[28%] h-[28%] rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
                </motion.div>

                {/* Main eye reflection */}
                <motion.div
                  className="absolute top-[17%] left-[21%] w-[30%] h-[25%] rounded-full bg-white"
                  style={{
                    opacity: 0.96,
                    filter: "blur(0.2px)",
                  }}
                  animate={{
                    x: mousePosition.x * -2,
                    y: mousePosition.y * -1,
                    scale: [1, 1.14, 1],
                  }}
                  transition={{
                    scale: { duration: 3.5, repeat: Infinity },
                    x: { type: "spring", stiffness: 160, damping: 18 },
                    y: { type: "spring", stiffness: 160, damping: 18 },
                  }}
                />

                {/* Second reflection */}
                <div className="absolute top-[50%] right-[24%] w-[8px] h-[8px] rounded-full bg-white opacity-70 blur-[0.4px]" />

                {/* Glass shine */}
                <div
                  className="absolute top-[5%] left-[8%] w-[82%] h-[34%] rounded-full pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.55), transparent)",
                    filter: "blur(2px)",
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Sleeping Zzz */}
          {isSleeping && (
            <motion.div
              className="absolute -right-2 -top-10 text-slate-400 text-lg font-semibold"
              animate={{ y: [-2, -10, -2], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              zZ
            </motion.div>
          )}

          {/* Cheeks */}
          <div className="absolute top-[62px] left-[21%] w-10 h-5 rounded-full bg-purple-300/20 blur-md" />
          <div className="absolute top-[62px] right-[21%] w-10 h-5 rounded-full bg-purple-300/20 blur-md" />

          {/* Big expressive mouth */}
          <motion.div
            className="relative mt-1"
            animate={{
              scaleY: mouthScaleY,
              y: expression === "thinking" ? 2 : expression === "waking" ? 1 : 0,
            }}
            transition={
              isSpeaking
                ? { duration: 0.65, repeat: Infinity, ease: "easeInOut" }
                : { type: "spring", stiffness: 220, damping: 18 }
            }
          >
            <svg
              width="58"
              height="38"
              viewBox="0 0 58 38"
              className="overflow-visible"
            >
              <motion.path
                d={mouthPath}
                stroke="rgba(65,70,85,0.9)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                style={{
                  filter:
                    "drop-shadow(0px 0px 5px rgba(255,255,255,0.55)) drop-shadow(0px 2px 2px rgba(0,0,0,0.16))",
                }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
              />

              {expression === "listening" && (
                <motion.path
                  d="M 18 16 Q 29 24 40 16"
                  stroke="rgba(120,95,255,0.35)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating glass orb */}
      <motion.div
        className="absolute top-[12%] right-[8%] w-16 h-16 rounded-full z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,240,255,0.4))",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow:
            "0 18px 45px rgba(0,0,0,0.1), inset 4px 4px 10px rgba(255,255,255,0.8)",
        }}
        animate={{
          y: [0, 10, 0],
          x: mousePosition.x * -8,
        }}
        transition={{
          y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          x: { type: "spring", stiffness: 55, damping: 16 },
        }}
      />

      {/* Floating glass square (the cube!) */}
      <motion.div
        className="absolute bottom-[20%] left-[5%] w-20 h-20 rounded-[1.25rem] z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(160,130,255,0.85), rgba(120,90,255,0.45))",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow:
            "0 20px 40px rgba(120,90,255,0.25), inset 2px 2px 8px rgba(255,255,255,0.5), inset -3px -3px 12px rgba(0,0,0,0.15)",
        }}
        animate={{
          y: [0, -12, 0],
          x: mousePosition.x * 12,
          rotate: [-5, 5, -5],
        }}
        transition={{
          y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
          x: { type: "spring", stiffness: 50, damping: 15 },
          rotate: { duration: 12, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </div>
  );
};
