import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, HeartPulse, History as HistoryIcon, Thermometer, Sparkles, Mic, MicOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface SymptomFormProps {
  onTriage: (symptoms: string, clinicalHistory: string) => void;
  loading: boolean;
  initialHistory?: string;
}

const QUICK_SYMPTOMS = [
  'Fever', 'Cold', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Sore Throat', 'Muscle Pain'
];

export const SymptomForm: React.FC<SymptomFormProps> = ({ onTriage, loading, initialHistory = '' }) => {
  const [symptoms, setSymptoms] = useState('');
  const [clinicalHistory, setClinicalHistory] = useState(initialHistory);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [micStateMsg, setMicStateMsg] = useState('Voice Triage Offline');

  useEffect(() => {
    setClinicalHistory(initialHistory);
  }, [initialHistory]);

  // Set up Speech Recognition on component mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setSymptoms(prev => {
            const trimmedPrev = prev.trim();
            const space = trimmedPrev ? ' ' : '';
            return `${trimmedPrev}${space}${finalTranscript.trim()}`;
          });
        }
      };

      rec.onstart = () => {
        setIsRecording(true);
        setMicStateMsg('Listening to symptoms...');
      };

      rec.onend = () => {
        setIsRecording(false);
        setMicStateMsg('Voice Triage Ready');
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setMicStateMsg('Mic access denied');
        } else {
          setMicStateMsg('Recording error occurred');
        }
      };

      setRecognition(rec);
      setMicStateMsg('Voice Triage Ready');
    } else {
      setMicStateMsg('Speech API unsupported');
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser window, or permissions are restricted in iframe views.");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      try {
        setMicStateMsg('Activating mic...');
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording && recognition) {
      recognition.stop();
    }
    if (symptoms.trim()) {
      onTriage(symptoms, clinicalHistory);
    }
  };

  const toggleSymptom = (symptom: string) => {
    if (symptoms.toLowerCase().includes(symptom.toLowerCase())) {
      setSymptoms(prev => prev.split(', ').filter(s => s.toLowerCase() !== symptom.toLowerCase()).join(', '));
    } else {
      setSymptoms(prev => prev ? `${prev}, ${symptom}` : symptom);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-10 bg-white rounded-[2rem] shadow-sm border border-nude-200 transition-colors"
    >
      <div className="flex items-center gap-5 mb-10">
        <div className="p-3 bg-nude-50 rounded-full border border-nude-100 text-nude-400">
          <HeartPulse className="w-8 h-8" />
        </div>
        <div>
          <h2 className="serif-display text-4xl text-nude-500">Assessment</h2>
          <p className="text-nude-400 text-[10px] font-bold uppercase tracking-widest">Confidential Symptom Analysis</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="symptoms" className="text-[10px] font-bold text-nude-400 flex items-center gap-2 uppercase tracking-[0.2em]">
              Current Experience
            </label>
            
            {/* Voice Triage Micro Indicator */}
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                isRecording ? "bg-red-500 animate-ping" : "bg-nude-300"
              )} />
              <span className="text-[9px] font-bold uppercase tracking-wider text-nude-400">
                {micStateMsg}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {QUICK_SYMPTOMS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSymptom(s)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                  symptoms.toLowerCase().includes(s.toLowerCase())
                    ? "bg-nude-500 text-white border-nude-500"
                    : "bg-nude-50 text-nude-400 border-nude-100 hover:border-nude-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              id="symptoms"
              className="w-full h-40 p-6 pr-14 bg-nude-50/50 border border-nude-150 rounded-2xl focus:bg-white focus:border-nude-350 transition-all resize-none outline-none text-nude-500 placeholder:text-nude-300 font-light"
              placeholder="Describe your symptoms with as much detail as possible, or click the mic to speak..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              disabled={loading}
            />
            
            {/* Pulsing Mic Button */}
            {recognition && (
              <button
                type="button"
                onClick={toggleRecording}
                className={cn(
                   "absolute right-4 bottom-4 p-3.5 rounded-full transition-all duration-300 flex items-center justify-center shadow-md cursor-pointer",
                  isRecording 
                    ? "bg-red-500 text-white animate-pulse hover:bg-red-600 shadow-red-200" 
                    : "bg-nude-500 hover:bg-nude-400 text-white shadow-nude-200"
                )}
                title={isRecording ? "Stop Voice Triage recording" : "Activate Voice Triage Speech-To-Text"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="history" className="text-[10px] font-bold text-nude-400 flex items-center gap-2 uppercase tracking-[0.2em]">
            Clinical Background (Optional)
          </label>
          <textarea
            id="history"
            className="w-full h-32 p-6 bg-nude-50/50 border border-nude-150 rounded-2xl focus:bg-white focus:border-nude-350 transition-all resize-none outline-none text-nude-500 placeholder:text-nude-300 font-light"
            placeholder="Relevant medical history, allergies, or medications..."
            value={clinicalHistory}
            onChange={(e) => setClinicalHistory(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !symptoms.trim()}
          className={cn(
            "w-full py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] text-white transition-all flex items-center justify-center gap-3 cursor-pointer",
            loading ? "bg-nude-200 cursor-not-allowed" : "bg-nude-500 hover:bg-nude-400 shadow-xl shadow-nude-200"
          )}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              Initialize Analysis
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
      
      <div className="mt-10 flex items-start gap-3 p-5 bg-nude-50 rounded-2xl border border-nude-150">
        <AlertCircle className="w-4 h-4 text-nude-405 shrink-0 select-none" />
        <p className="text-[10px] text-nude-405 leading-relaxed font-semibold uppercase tracking-wider">
          <strong>Mandatory Disclosure:</strong> This interface provides automated analysis and is not a substitute for clinical diagnostics. In life-threatening scenarios, engage emergency protocols immediately.
        </p>
      </div>
    </motion.div>
  );
};
