import React from 'react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { AlertTriangle, CheckCircle2, ShieldAlert, Stethoscope, X } from 'lucide-react';
import { cn } from '../lib/utils';

export type Urgency = 'EMERGENCY' | 'URGENT' | 'SELF-CARE' | 'ROUTINE';

interface TriageResultProps {
  urgency: Urgency;
  assessment: string;
  onReset: () => void;
}

export const TriageResult: React.FC<TriageResultProps> = ({ urgency, assessment, onReset }) => {
  const getUrgencyConfig = (level: Urgency) => {
    switch (level) {
      case 'EMERGENCY':
        return {
          icon: <ShieldAlert className="w-8 h-8 text-rose-800" />,
          color: 'bg-rose-100 text-rose-950 border-rose-200',
          bgColor: 'bg-rose-50',
          textColor: 'text-rose-950',
          label: 'Emergency Care Needed'
        };
      case 'URGENT':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-800" />,
          color: 'bg-amber-100 text-amber-850 border-amber-200',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-950',
          label: 'Urgent Care Recommended'
        };
      case 'SELF-CARE':
        return {
          icon: <Stethoscope className="w-8 h-8 text-nude-400" />,
          color: 'bg-nude-200/60 text-nude-500 border-nude-300',
          bgColor: 'bg-nude-50',
          textColor: 'text-nude-500',
          label: 'Self-Care Possible'
        };
      default:
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-800" />,
          color: 'bg-emerald-100 text-emerald-950 border-emerald-200',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-950',
          label: 'Routine Care'
        };
    }
  };

  const config = getUrgencyConfig(urgency);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-[2rem] shadow-sm overflow-hidden border border-nude-200"
    >
      <div className={cn("p-10 flex items-center justify-between border-b", config.color)}>
        <div className="flex items-center gap-5">
          <div className="p-3 bg-white/40 rounded-full backdrop-blur-md border border-white/40">
            {config.icon}
          </div>
          <div>
            <h2 className="serif-display text-4xl leading-none text-nude-500">{config.label}</h2>
            <p className="text-nude-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Protocol Recommendation</p>
          </div>
        </div>
        <button 
          onClick={onReset}
          className="p-3 hover:bg-white/40 rounded-full transition-colors text-nude-400"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-12">
        <div className="markdown-body prose prose-slate max-w-none prose-headings:serif-display prose-headings:text-3xl prose-headings:text-nude-500 prose-p:text-nude-500 prose-p:font-normal prose-strong:text-nude-500 prose-li:text-nude-500 leading-relaxed font-sans">
          <Markdown>{assessment}</Markdown>
        </div>

        <div className="mt-12 pt-10 border-t border-nude-100 flex flex-col sm:flex-row gap-6">
          <button
            onClick={onReset}
            className="flex-1 py-4 px-8 rounded-full border border-nude-200 text-nude-400 text-[10px] font-bold uppercase tracking-widest hover:bg-nude-50 transition-all font-sans"
          >
            New Session
          </button>
          <button
            onClick={() => {
                document.getElementById('help-navigator')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={cn(
              "flex-1 py-4 px-8 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md transition-all hover:scale-105 active:scale-95 font-sans border-none",
              config.color
            )}
          >
            Location Routing
          </button>
        </div>

        {/* Feedback Section */}
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-[10px] font-bold text-nude-300 uppercase tracking-widest">Was this helpful?</p>
          <div className="flex gap-4">
            <button className="p-3 bg-nude-50 rounded-full border border-nude-100 text-nude-400 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" /></svg>
            </button>
            <button className="p-3 bg-nude-50 rounded-full border border-nude-100 text-nude-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 0-3-3.88Z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
