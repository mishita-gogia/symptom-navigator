import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, History as HistoryIcon, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface HealthIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedHistory: string;
  onSave: (history: string) => void;
}

export const HealthIdModal: React.FC<HealthIdModalProps> = ({ 
  isOpen, 
  onClose, 
  savedHistory, 
  onSave 
}) => {
  const [history, setHistory] = useState(savedHistory);

  const handleSave = () => {
    onSave(history);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-nude-500/10 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-nude-200"
          >
            <div className="p-8 border-b border-nude-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-nude-50 rounded-full flex items-center justify-center border border-nude-100">
                  <ShieldCheck className="text-nude-500 w-5 h-5" />
                </div>
                <div>
                  <h3 className="serif-display text-2xl text-nude-500 animate-fade">Health ID Profile</h3>
                  <p className="text-nude-400 text-[10px] font-bold uppercase tracking-widest">Persistent Clinical Context</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-nude-50 rounded-full transition-colors text-nude-350"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-nude-400 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <HistoryIcon className="w-3 h-3" />
                  Clinical History
                </label>
                <textarea
                  className="w-full h-48 p-6 bg-nude-50/50 border border-nude-100 rounded-2xl focus:bg-white focus:border-nude-300 transition-all resize-none outline-none text-nude-500 placeholder:text-nude-300 font-light text-sm"
                  placeholder="Record chronic conditions, active medications, allergies, or previous surgeries..."
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                />
                <p className="text-[10px] text-nude-300 italic">
                  Information saved here will be automatically included in your future assessments to provide better triage logic.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="w-full py-4 rounded-full bg-nude-500 text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-nude-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-nude-200 border-none"
                >
                  <Save className="w-4 h-4" />
                  Synchronize History
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
