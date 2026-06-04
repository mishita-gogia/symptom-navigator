import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, User, Save, HeartPulse, History as HistoryIcon } from 'lucide-react';
import { HealthProfile, getProfile, saveProfile } from '../lib/db';
import { cn } from '../lib/utils';

interface HealthProfileManagerProps {
  onProfileSynced: (history: string) => void;
}

export const HealthProfileManager: React.FC<HealthProfileManagerProps> = ({ onProfileSynced }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [clinicalHistory, setClinicalHistory] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const p = await getProfile();
      setName(p.name || '');
      setAge(p.age || '');
      setGender(p.gender || '');
      setClinicalHistory(p.clinicalHistory || '');
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const updated: HealthProfile = {
        name,
        age: Number(age),
        gender,
        clinicalHistory
      };
      await saveProfile(updated);
      onProfileSynced(clinicalHistory); // notify parent App
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto text-left"
    >
      <div className="bg-white rounded-[2.5rem] border border-nude-200 overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="p-8 border-b border-nude-100 bg-nude-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-nude-500 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5.5 h-5.5 text-accent-gold" />
            </div>
            <div>
              <h3 className="serif-display text-3xl text-nude-500 font-medium">Health ID Profile</h3>
              <p className="text-[9px] text-[#A38D6F] uppercase tracking-widest font-bold">Encrypted Persistent Diagnostic Context</p>
            </div>
          </div>
          <span className="text-[9px] text-nude-300 font-bold bg-white border border-nude-200 px-3 py-1.5 rounded-full uppercase tracking-wider">
            Patient Identity ID
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-8 sm:p-12 space-y-8">
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-nude-400 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF5EC] border border-nude-150 rounded-xl px-4 py-3 text-xs text-nude-500 transition-colors focus:outline-none focus:border-nude-350 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-nude-400 uppercase tracking-widest">Age (Years)</label>
              <input
                type="number"
                required
                min="0"
                max="135"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-[#FAF5EC] border border-nude-150 rounded-xl px-4 py-3 text-xs text-nude-500 transition-colors focus:outline-none focus:border-nude-350 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-nude-400 uppercase tracking-widest">Bio-Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#FAF5EC] border border-nude-150 rounded-xl px-4 py-3 text-xs text-nude-500 transition-colors focus:outline-none focus:border-nude-350 focus:bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Non-binary / Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#A38D6F] flex items-center gap-1.5 uppercase tracking-[0.2em]">
              <HistoryIcon className="w-3.5 h-3.5" />
              Clinical History Log
            </label>
            <textarea
              required
              rows={6}
              placeholder="Record chronic conditions, active medical factors, surgeries, or critical drug allergens..."
              value={clinicalHistory}
              onChange={(e) => setClinicalHistory(e.target.value)}
              className="w-full p-5 bg-[#FAF5EC] border border-nude-150 rounded-2xl text-xs text-nude-500 font-light focus:outline-none focus:border-nude-350 focus:bg-white resize-none"
            />
            <p className="text-[9px] text-nude-300 font-light italic">
              Saved history compiles securely alongside every symptom triage interaction automatically. This avoids redundantly repeating clinical background contexts.
            </p>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-nude-500 font-bold text-[10px] uppercase tracking-[0.25em] text-white rounded-full hover:bg-nude-400 border-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-accent-gold" />
              {saving ? "Synchronizing..." : "Synchronize Profile"}
            </button>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xs text-emerald-600 font-medium flex items-center gap-1.5"
                >
                  <HeartPulse className="w-4.5 h-4.5 animate-pulse text-emerald-500" />
                  Health ID synchronization validated!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
