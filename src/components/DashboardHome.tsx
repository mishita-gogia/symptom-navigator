import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight,
  BookOpen,
  Compass,
  Heart,
  Droplet,
  Eye,
  Activity,
  Wind,
  Moon,
  Accessibility,
  Flame,
  Search,
  Shuffle,
  Bookmark,
  CheckCircle
} from 'lucide-react';
import { 
  HealthProfile,
  getProfile
} from '../lib/db';
import { cn } from '../lib/utils';

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
  savedHistory: string;
}

interface WellnessTip {
  id: string;
  category: string;
  title: string;
  description: string;
  tip: string;
  icon: any;
  color: string;
}

const HEALTH_TIPS: WellnessTip[] = [
  {
    id: "1",
    category: "Hydration",
    title: "Morning Rehydration Protocol",
    description: "Drink 300ml to 500ml of water immediately upon waking. This stimulates intestinal motility, supports lymphatic drainage, and counters overnight respiratory moisture loss.",
    tip: "Keep a sealed jar of water on your nightstand to make hydration a frictionless habit.",
    icon: Droplet,
    color: "text-[#A38D6F] bg-nude-50/80 border-nude-100"
  },
  {
    id: "2",
    category: "Ocular Care",
    title: "The 20-20-20 Optic Rule",
    description: "To minimize digital eye strain from looking at screens, pause every 20 minutes to gaze at an object roughly 20 feet away for 20 continuous seconds. This relaxes ciliary muscles in the eyes.",
    tip: "Place a sticky note on the top bezel of your monitor as a visual reminder.",
    icon: Eye,
    color: "text-[#A38D6F] bg-nude-50/80 border-nude-100"
  },
  {
    id: "3",
    category: "Circulation",
    title: "Micro-Activity Posture Breaks",
    description: "Prolonged seating decreases metabolic enzyme activity. Set an alarm to stand for 2 minutes every hour and initiate deep lunges or light movements to reactivate major lower-limb muscle groups.",
    tip: "Stand up or walk during phone calls to naturally build healthy circulation.",
    icon: Activity,
    color: "text-rose-700 bg-rose-50 border-rose-100"
  },
  {
    id: "4",
    category: "Respiration",
    title: "Nervous Calming via Box Breathing",
    description: "When feeling sensory overload or elevated stress thresholds, try deep box breathing: Inhale for 4s, hold for 4s, exhale for 4s, and hold empty for 4s.",
    tip: "Repeat this cycle 4 times to stimulate the vagus nerve and lower systemic stress.",
    icon: Wind,
    color: "text-[#A38D6F] bg-nude-50/80 border-nude-100"
  },
  {
    id: "5",
    category: "Sleep Hygiene",
    title: "Chrono-Lighting Screen Dimming",
    description: "Exposure to blue spectrum lighting from screens late in the evening delays melatonin synthesis. Dim smart screens and switch background lights to amber tones 45 minutes before sleep.",
    tip: "Enable Night Shift or amber screen filters on all household computing device screens.",
    icon: Moon,
    color: "text-[#A38D6F] bg-nude-50/80 border-nude-100"
  },
  {
    id: "6",
    category: "Posture",
    title: "Scapular Re-alignment Stretch",
    description: "Modern device usage induces forward-head and tight interior shoulder frames. Practice simple chest openers or pinch your shoulder blades together to restore structural muscle alignment.",
    tip: "Execute this for 30 seconds after eating lunch or wrapping up long reading intervals.",
    icon: Accessibility,
    color: "text-[#A38D6F] bg-[#FAF5EE] border-nude-200"
  },
  {
    id: "7",
    category: "Nutrition",
    title: "Sustained Glycemic Balance",
    description: "Avoid high-glucose breakfast dishes to stay clear of mid-afternoon energy dips. Integrate stable fiber, healthy fats, and lean proteins to flatten your insulin curves.",
    tip: "A small handful of raw pumpkin seeds or almonds provides immediate low-glycemic nutrition.",
    icon: Flame,
    color: "text-emerald-700 bg-emerald-50 border-emerald-100"
  }
];

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate, savedHistory }) => {
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [shuffleEffect, setShuffleEffect] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const p = await getProfile();
      setProfile(p);
    };
    loadProfile();
    
    // Load bookmarks from localStorage
    const saved = localStorage.getItem('symptomnav_bookmarked_tips');
    if (saved) {
      try {
        setBookmarkedIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [savedHistory]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(x => x !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);
    localStorage.setItem('symptomnav_bookmarked_tips', JSON.stringify(updated));
  };

  const handleShuffleIndex = () => {
    setShuffleEffect(true);
    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * HEALTH_TIPS.length);
      while (nextIndex === featuredIndex && HEALTH_TIPS.length > 1) {
        nextIndex = Math.floor(Math.random() * HEALTH_TIPS.length);
      }
      setFeaturedIndex(nextIndex);
      setShuffleEffect(false);
    }, 400);
  };

  const featuredTip = HEALTH_TIPS[featuredIndex];

  // Derive all unique categories
  const categories = Array.from(new Set(HEALTH_TIPS.map(t => t.category)));

  // Filter tips
  const filteredTips = HEALTH_TIPS.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tip.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tip.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12 text-left">
      {/* Overview Grid Header + Wellness Corner Tip Focus */}
      <div className="grid lg:grid-cols-3 gap-8 items-stretch">
        
        {/* Healthcare Redefined Main Header banner */}
        <div className="lg:col-span-2 bg-gradient-to-br from-nude-100 to-nude-50/20 p-8 sm:p-12 rounded-[2.5rem] border border-nude-200/60 h-full flex flex-col justify-between space-y-8 min-h-[360px] transition-colors duration-300">
          <div className="space-y-4 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/75 backdrop-blur-md text-[#A38D6F] rounded-full text-[9px] font-bold uppercase tracking-widest border border-nude-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-gold animate-pulse" />
              SymptomNav Clinical Workspace
            </motion.div>
            
            <h1 className="serif-display text-5xl sm:text-7xl text-nude-500 leading-[0.9] tracking-tight">
              Healthcare <br />
              <span className="text-nude-400">Redefined</span> <span className="text-xs align-super font-sans text-accent-gold inline-block">✦</span>
            </h1>
            
            <p className="text-nude-400 text-sm max-w-xl font-light leading-relaxed">
              Experience clinical-grade assessment of symptoms, interactive AI health counseling, and personalized everyday wellness insights — whenever and wherever you need them.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => onNavigate('triage')}
              className="px-6 py-3.5 bg-nude-500 border-none text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-nude-400 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Start Symptoms Triage
            </button>
            <button
              onClick={() => onNavigate('assistant')}
              className="px-6 py-3.5 bg-white text-nude-500 border border-nude-200 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:border-nude-400 hover:bg-nude-50/50 transition-all active:scale-95 cursor-pointer"
            >
              Consult AI Companion
            </button>
          </div>
        </div>

        {/* Beautiful Wellness Corner Spotlight Box */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-nude-200 shadow-sm flex flex-col justify-between space-y-6 h-full min-h-[360px] text-left transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-nude-500 text-base flex items-center gap-1.5">
                <Compass className="w-4.5 h-4.5 text-accent-gold shrink-0" />
                Wellness Corner
              </h3>
              <p className="text-[10px] text-nude-400 uppercase tracking-wider font-bold">Day-To-Day Healthcare Tips</p>
            </div>
            <button
              onClick={handleShuffleIndex}
              title="Next Wellness Tip"
              className="w-8 h-8 rounded-full border border-nude-200 text-nude-400 hover:text-nude-500 hover:border-nude-350 flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
            >
              <Shuffle className={cn("w-3.5 h-3.5", shuffleEffect && "animate-spin")} />
            </button>
          </div>

          <div className="flex-1 py-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={featuredTip.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 text-left"
              >
                <div className="flex items-center justify-between">
                  {/* Category icon + tag */}
                  <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[9px] font-bold uppercase tracking-widest", featuredTip.color)}>
                    {React.createElement(featuredTip.icon, { className: "w-3 h-3" })}
                    {featuredTip.category}
                  </div>
                  
                  {/* Bookmark Button */}
                  <button 
                    onClick={(e) => toggleBookmark(featuredTip.id, e)}
                    className="p-1 px-2.5 rounded-full border border-nude-100 hover:border-nude-300 text-nude-300 hover:text-amber-600 bg-nude-50/45 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Bookmark className={cn("w-2.5 h-2.5", bookmarkedIds.includes(featuredTip.id) && "fill-amber-500 text-amber-500")} />
                    {bookmarkedIds.includes(featuredTip.id) ? "Saved" : "Save"}
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="serif-display text-xl sm:text-2xl text-nude-500 font-medium leading-snug tracking-tight">
                    {featuredTip.title}
                  </h4>
                  <p className="text-nude-400 text-xs font-light leading-relaxed">
                    "{featuredTip.description}"
                  </p>
                </div>

                <div className="p-3 bg-nude-50/50 border border-nude-100 rounded-2xl flex items-start gap-2.5">
                  <div className="min-w-4 h-4 rounded-full bg-accent-gold/15 flex items-center justify-center font-bold text-[8px] text-accent-gold mt-0.5">✦</div>
                  <p className="text-[10px] text-[#A38D6F] font-bold uppercase tracking-wide leading-normal text-left">
                    {featuredTip.tip}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="text-[9px] text-nude-300 border-t border-nude-100 pt-3 text-center">
            Promoting natural clinical resilience and preventative routines daily.
          </div>
        </div>
      </div>

      {/* Wellness Corner Interactive Directory Grid */}
      <div className="space-y-6 text-left">
        <div className="border-b border-nude-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="serif-display text-3xl font-medium text-nude-500">Wellness Resource Directory</h2>
            <p className="text-[10px] text-nude-400 uppercase tracking-widest font-bold mt-1">Explore all day-to-day healthcare categories</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-nude-300 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search healthy habits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#FFFDF9] border border-nude-200 rounded-full py-2.5 pl-9 pr-4 text-[11px] font-light text-nude-500 placeholder:text-nude-300 focus:outline-none focus:border-nude-350 w-full sm:w-56"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer",
                  !selectedCategory 
                    ? "bg-nude-500 text-white border-nude-500"
                    : "bg-white text-nude-400 border-nude-200 hover:border-nude-300"
                )}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer",
                    selectedCategory === cat
                      ? "bg-nude-500 text-white border-nude-500"
                      : "bg-white text-nude-400 border-nude-200 hover:border-nude-300"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tip Cards Grid Layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTips.map((tip) => {
            const isBookmarked = bookmarkedIds.includes(tip.id);
            return (
              <motion.div
                key={tip.id}
                layout
                className="bg-white border border-nude-200 hover:border-nude-350 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all group text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 border rounded-full text-[8px] font-bold uppercase tracking-widest", tip.color)}>
                      {React.createElement(tip.icon, { className: "w-3 h-3" })}
                      {tip.category}
                    </div>

                    <button 
                      onClick={(e) => toggleBookmark(tip.id, e)}
                      className="p-1 px-2.5 rounded-full border border-nude-100 hover:border-nude-200 text-nude-300 hover:text-amber-600 bg-nude-50/20 text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Bookmark className={cn("w-2.5 h-2.5", isBookmarked && "fill-amber-500 text-amber-500")} />
                      {isBookmarked ? "Saved" : "Save"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="serif-display text-lg text-nude-500 leading-tight group-hover:text-amber-700 transition-colors">
                      {tip.title}
                    </h3>
                    <p className="text-nude-400 text-[11px] leading-relaxed text-left font-light">
                      "{tip.description}"
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-nude-100 flex items-start gap-2 text-left">
                  <CheckCircle className="w-3.5 h-3.5 text-[#A38D6F] shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#A38D6F] leading-snug font-bold uppercase tracking-wide">
                    {tip.tip}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {filteredTips.length === 0 && (
            <div className="col-span-full py-16 text-center text-nude-400 text-sm border-2 border-dashed border-nude-200 rounded-[2rem]">
              No day-to-day healthcare wellness tips match your lookup parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
