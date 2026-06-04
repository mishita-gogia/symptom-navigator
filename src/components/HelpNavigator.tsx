import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  Hospital, 
  Stethoscope, 
  Pill, 
  ExternalLink,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

interface CareCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  query: string;
  color: string;
  delay: number;
}

const CareCard: React.FC<CareCardProps> = ({ title, description, icon, query, color, delay }) => {
  const handleNavigate = () => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      onClick={handleNavigate}
      className="group bg-white rounded-[2rem] p-10 border border-nude-200 shadow-sm hover:shadow-xl hover:shadow-nude-300/20 transition-all cursor-pointer flex flex-col items-center text-center"
    >
      <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-8 text-white shadow-lg transition-transform group-hover:scale-110", color)}>
        {icon}
      </div>
      <h3 className="serif-display text-3xl font-bold text-nude-500 mb-4 tracking-tight">{title}</h3>
      <p className="text-nude-400 text-sm leading-relaxed font-light mb-8">
        {description}
      </p>
      <div className="mt-auto flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors px-6 py-3 rounded-full bg-nude-50 border border-nude-100 text-nude-500 group-hover:bg-nude-500 group-hover:text-white group-hover:border-nude-500">
        Search Map <ArrowUpRight className="w-3 h-3" />
      </div>
    </motion.div>
  );
};

export const HelpNavigator: React.FC = () => {
  const careTypes = [
    {
      title: "Emergency",
      description: "Priority 24/7 care centers and trauma units for critical situations.",
      icon: <Hospital className="w-6 h-6" />,
      query: "emergency room near me",
      color: "bg-rose-450",
      delay: 0.1
    },
    {
      title: "Urgent Care",
      description: "Immediate clinical attention for non-life-threatening conditions.",
      icon: <Clock className="w-6 h-6" />,
      query: "urgent care near me",
      color: "bg-nude-400",
      delay: 0.2
    },
    {
      title: "Specialists",
      description: "Specialized offices for routine checkups and health management.",
      icon: <Stethoscope className="w-6 h-6" />,
      query: "medical clinic near me",
      color: "bg-nude-500",
      delay: 0.3
    },
    {
      title: "Pharmacies",
      description: "Local drugstores for prescriptions and medical supplies.",
      icon: <Pill className="w-6 h-6" />,
      query: "pharmacy near me",
      color: "bg-nude-300",
      delay: 0.4
    }
  ];

  return (
    <div id="help-navigator" className="space-y-16 py-12">
      <div className="relative bg-white rounded-[4rem] p-12 md:p-20 shadow-sm border border-nude-200 overflow-hidden">
        {/* Nude decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-nude-100 rounded-full blur-[120px] -mr-64 -mt-64 opacity-50" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-nude-200 rounded-full blur-[100px] -ml-64 -mb-64 opacity-30" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-nude-50 rounded-full border border-nude-200">
              <Navigation className="w-4 h-4 text-nude-400" />
              <span className="text-[10px] font-bold text-nude-400 uppercase tracking-widest">Healthcare Navigator</span>
            </div>
            <h2 className="serif-display text-6xl md:text-7xl text-nude-500 leading-tight">
              Sophisticated access <br />
              <span className="text-nude-400">to localized care.</span>
            </h2>
            <p className="text-nude-500 text-xl leading-relaxed font-light">
              We leverage high-fidelity mapping data to bridge the gap between your assessment and verified clinical assistance.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              <button 
                onClick={() => window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank')}
                className="px-12 py-5 bg-nude-500 text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-nude-400 transition-all flex items-center gap-4 group shadow-xl shadow-nude-200 border-none active:scale-95 cursor-pointer"
              >
                Launch Map Overview
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative h-full min-h-[300px] flex items-center justify-center">
             <div className="relative w-full max-w-sm aspect-square bg-nude-50 rounded-full border border-nude-200 flex items-center justify-center">
                <MapPin className="w-20 h-20 text-nude-200 animate-bounce" />
                <div className="absolute inset-0 rounded-full border-[20px] border-white/50" />
             </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {careTypes.map((type) => (
          <CareCard key={type.title} {...type} />
        ))}
      </div>
    </div>
  );
};
