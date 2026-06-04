import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Play, Square, RefreshCw, Activity, Sparkles, Smile, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

interface BreathingPattern {
  name: string;
  description: string;
  inhale: number;
  holdLength1: number;
  exhale: number;
  holdLength2: number;
  benefits: string;
}

const PATTERNS: Record<string, BreathingPattern> = {
  nausea: {
    name: "Stomach Bug & Nausea Comfort",
    description: "An even-ratio calming rhythm designed to rest the digestive system and settle stomach cramps.",
    inhale: 4,
    holdLength1: 4,
    exhale: 4,
    holdLength2: 4,
    benefits: "Combats nausea reflex, decreases abdominal cramping, and regulates gut-brain stress signals."
  },
  headache: {
    name: "Headache Tension Relaxer",
    description: "A restorative cycle with a short inhale and extremely slow exhale to release blood pressure in cranial blood vessels.",
    inhale: 3,
    holdLength1: 0,
    exhale: 7,
    holdLength2: 2,
    benefits: "Relaxes ciliary muscular frameworks, reduces temporal pressure, and dilates narrowed blood vessels."
  },
  panic: {
    name: "Airway & Anxiety Regulator",
    description: "The classic medical 4-7-8 breathing sequence to trigger immediate calming hormones and override panic states.",
    inhale: 4,
    holdLength1: 7,
    exhale: 8,
    holdLength2: 0,
    benefits: "Stimulates the vagus nerve, rapidly lowers acute heart rates, and counters chest-tightness/hyperventilation."
  },
  general: {
    name: "Coherent Refresh",
    description: "A balanced, simple, easy-to-follow breathing rhythm to restore natural body balance.",
    inhale: 5,
    holdLength1: 0,
    exhale: 5,
    holdLength2: 0,
    benefits: "Optimizes oxygen flow, improves focus, and aligns heart rate variability."
  }
};

export const SymptomCalmer: React.FC = () => {
  const [activePattern, setActivePattern] = useState<keyof typeof PATTERNS>('general');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [timeLeft, setTimeLeft] = useState(5);
  const [cycleCount, setCycleCount] = useState(0);

  const pattern = PATTERNS[activePattern];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restart clean state on pattern change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentPhase('inhale');
    setTimeLeft(PATTERNS[activePattern].inhale);
    setCycleCount(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activePattern]);

  // Breathing simulation engine ticker
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Determine next phase transitions
          let nextPhase: typeof currentPhase = 'inhale';
          let nextDuration = 0;

          if (currentPhase === 'inhale') {
            if (pattern.holdLength1 > 0) {
              nextPhase = 'hold1';
              nextDuration = pattern.holdLength1;
            } else {
              nextPhase = 'exhale';
              nextDuration = pattern.exhale;
            }
          } else if (currentPhase === 'hold1') {
            nextPhase = 'exhale';
            nextDuration = pattern.exhale;
          } else if (currentPhase === 'exhale') {
            if (pattern.holdLength2 > 0) {
              nextPhase = 'hold2';
              nextDuration = pattern.holdLength2;
            } else {
              nextPhase = 'inhale';
              nextDuration = pattern.inhale;
              setCycleCount(c => c + 1);
            }
          } else if (currentPhase === 'hold2') {
            nextPhase = 'inhale';
            nextDuration = pattern.inhale;
            setCycleCount(c => c + 1);
          }

          setCurrentPhase(nextPhase);
          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentPhase, pattern]);

  // Generate dynamic text prompting based on active breathing phase
  const getPhaseInstructions = () => {
    if (!isPlaying) return "Ready to begin? Get comfortable and click Start.";
    switch (currentPhase) {
      case 'inhale':
        return "Breathe in deeply through your nose...";
      case 'hold1':
        return "Hold your breath calmly...";
      case 'exhale':
        return "Exhale slowly and fully through your mouth...";
      case 'hold2':
        return "Hold empty and rest...";
    }
  };

  const getPhaseProgress = () => {
    let total = 1;
    switch (currentPhase) {
      case 'inhale': total = pattern.inhale; break;
      case 'hold1': total = pattern.holdLength1; break;
      case 'exhale': total = pattern.exhale; break;
      case 'hold2': total = pattern.holdLength2; break;
    }
    return ((total - timeLeft) / total) * 100;
  };

  // Pulse circle expansion scale values
  const getBubbleScale = () => {
    if (!isPlaying) return 1.0;
    switch (currentPhase) {
      case 'inhale':
        const inhaleTotal = pattern.inhale;
        const inhalePct = (inhaleTotal - timeLeft) / inhaleTotal;
        return 1.0 + (inhalePct * 0.7); // Grow from 1.0 to 1.7
      case 'hold1':
        return 1.7; // Remain full
      case 'exhale':
        const exhaleTotal = pattern.exhale;
        const exhalePct = timeLeft / exhaleTotal; // shrink back
        return 1.0 + (exhalePct * 0.7); // Shrink back to 1.0
      case 'hold2':
        return 1.0; // Remain empty
    }
  };

  return (
    <div className="space-y-12 text-left">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F3F1ED] text-accent-gold rounded-full text-[9px] font-bold uppercase tracking-widest border border-nude-200">
          <Wind className="w-3.5 h-3.5" />
          Symptom Calmer & Calibrator
        </div>
        <h2 className="serif-display text-4xl text-nude-500 mt-3 font-semibold">Clinical Breathing Regulator</h2>
        <p className="text-nude-400 text-sm font-light mt-1">
          A physical relaxer customized to counter active cramps, dizziness, nausea, headaches, and panic states instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Navigation Sidebar Selector of modes: 4cols */}
        <div className="lg:col-span-4 bg-white border border-nude-200 rounded-[2.5rem] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-nude-500 text-xs uppercase tracking-wider">Select Relief Mode</h3>
              <p className="text-[10px] text-nude-400 mt-0.5">Choose the pattern that matches your active discomfort:</p>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(PATTERNS) as Array<keyof typeof PATTERNS>).map((key) => {
                const item = PATTERNS[key];
                 const isActive = activePattern === key;
                 return (
                  <button
                    key={key}
                    onClick={() => setActivePattern(key)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border transition-all cursor-pointer group",
                      isActive
                        ? "bg-nude-500 text-white border-nude-500 shadow-md"
                        : "bg-nude-50/50 border-nude-100/80 hover:border-nude-350 text-nude-500"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs tracking-tight">{item.name}</span>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold",
                        isActive 
                          ? "bg-accent-gold/20 text-accent-gold" 
                          : "bg-nude-100 text-nude-400 group-hover:text-nude-500"
                      )}>
                        {item.inhale + (item.holdLength1 ? `-${item.holdLength1}` : '-0') + `-${item.exhale}` + (item.holdLength2 ? `-${item.holdLength2}` : '')}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[10px] mt-1 line-clamp-2 leading-relaxed font-light",
                      isActive ? "text-nude-200" : "text-nude-400"
                    )}>
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-nude-50 p-4 rounded-2xl border border-nude-100 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#A38D6F] shrink-0 mt-0.5" />
            <p className="text-[9px] text-[#A38D6F] uppercase tracking-wide leading-relaxed font-bold">
              ✦ CLINICAL FACT: Slow breathing resets your autonomic balance, lowering adrenaline and resting vascular tissue pressure.
            </p>
          </div>
        </div>

        {/* Breathing Sandbox Interactive Graphic Canvas: 8cols */}
        <div className="lg:col-span-8 bg-gradient-to-br from-nude-100 to-nude-50/30 border border-nude-200 rounded-[2.5rem] p-8 sm:p-12 flex flex-col items-center justify-between min-h-[500px]">
          
          {/* Active pattern labels & properties */}
          <div className="text-center space-y-2">
            <span className="text-[9px] text-[#A38D6F] font-bold uppercase tracking-[0.25em]">Discomfort Relief Exercise</span>
            <h3 className="serif-display text-2xl text-nude-500">{pattern.name}</h3>
            <p className="text-nude-400 text-xs max-w-md font-light leading-relaxed mx-auto">
              "{pattern.description}"
            </p>
          </div>

          {/* Interactive expanding pulsing bubble */}
          <div className="relative w-72 h-72 flex items-center justify-center my-6">
            
            {/* Multi-layered halo outer rings */}
            <AnimatePresence>
              {isPlaying && (
                <>
                  <motion.div
                    key="outer"
                    animate={{ scale: getBubbleScale(), opacity: currentPhase === 'inhale' ? 0.35 : 0.15 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute w-60 h-60 rounded-full bg-accent-gold/10 border border-accent-gold/25"
                  />
                  <motion.div
                    key="middle"
                    animate={{ scale: 1.0 + (getBubbleScale() - 1.0) * 0.5 }}
                    className="absolute w-44 rounded-full bg-nude-300/10 border border-nude-300/30"
                  />
                </>
              )}
            </AnimatePresence>

            {/* Micro expanding core bubble */}
            <motion.div
              animate={{ scale: getBubbleScale() }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className={cn(
                "w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 relative shadow-lg transition-colors duration-1000",
                isPlaying
                  ? currentPhase === 'inhale'
                    ? "bg-amber-50/90 border-accent-gold text-amber-900"
                    : currentPhase === 'hold1'
                    ? "bg-amber-100 border-[#C5A059] text-amber-950"
                    : currentPhase === 'exhale'
                    ? "bg-nude-50/90 border-nude-500 text-nude-500"
                    : "bg-white border-[#BCAB94] text-[#A38D6F]"
                  : "bg-white border-nude-200 text-nude-300"
              )}
            >
              {/* Pulsing state visual status text */}
              <div className="text-center select-none">
                <span className="text-[10px] font-bold uppercase tracking-widest block opacity-70">
                  {isPlaying ? currentPhase.replace('1','').replace('2','').toUpperCase() : "HEAL"}
                </span>
                <span className="serif-display text-5xl font-semibold leading-tight block select-none">
                  {isPlaying ? timeLeft : "✦"}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider block opacity-70">
                  {isPlaying ? `${cycleCount} cycles` : "WAIT"}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Calming text output prompt direction */}
          <div className="w-full text-center space-y-6">
            <div className="h-12 flex items-center justify-center">
              <motion.p
                 key={getPhaseInstructions()}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-base text-nude-500 font-normal leading-relaxed max-w-sm"
              >
                {getPhaseInstructions()}
              </motion.p>
            </div>

            {/* Inline instructions bar tracker */}
            {isPlaying && (
              <div className="w-64 mx-auto h-1.5 bg-nude-200 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${getPhaseProgress()}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                  className="h-full bg-accent-gold"
                />
              </div>
            )}

            {/* Controller keys */}
            <div className="flex items-center justify-center gap-4">
              {!isPlaying ? (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="px-8 py-3.5 bg-nude-500 hover:bg-nude-400 text-white flex items-center gap-2 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer border-none"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Begin Session
                </button>
              ) : (
                <button
                  onClick={() => setIsPlaying(false)}
                   className="px-8 py-3.5 bg-white text-nude-500 border border-nude-500 flex items-center gap-2 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-nude-500 text-nude-500" />
                  Pause Guide
                </button>
              )}

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentPhase('inhale');
                  setTimeLeft(pattern.inhale);
                  setCycleCount(0);
                }}
                className="p-3 bg-white hover:bg-nude-50 border border-nude-200 text-nude-400 hover:text-nude-500 rounded-full transition-colors cursor-pointer"
                title="Reset Regulator timer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Highlight therapeutic feedback benefit summary info */}
            <div className="border-t border-nude-200 pt-5">
              <p className="text-[10px] text-nude-400 uppercase tracking-widest font-bold">Exercise Physiological Benefit</p>
              <p className="text-[11px] text-[#A38D6F] max-w-lg mx-auto leading-relaxed mt-1 font-normal">
                {pattern.benefits}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
