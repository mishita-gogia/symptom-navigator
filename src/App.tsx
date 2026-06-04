import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Menu, 
  X, 
  Sparkles,
  Search,
  Bell,
  Plus,
  Home as HomeIcon,
  MessageSquare,
  Calendar as CalendarIcon,
  Pill,
  User as UserIcon,
  History as HistoryIcon,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  GitFork,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Wind
} from 'lucide-react';
import { DashboardHome } from './components/DashboardHome';
import { AiAssistant } from './components/AiAssistant';
import { HealthProfileManager } from './components/HealthProfileManager';
import { SymptomForm } from './components/SymptomForm';
import { TriageResult, Urgency } from './components/TriageResult';
import { HelpNavigator } from './components/HelpNavigator';
import { HealthIdModal } from './components/HealthIdModal';
import { SymptomCalmer } from './components/SymptomCalmer';
import { getProfile, saveProfile, HealthProfile } from './lib/db';
import { getEmergencyInfo, EMERGENCY_NUMBERS } from './utils/emergencyNumbers';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<{ urgency: Urgency; assessment: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHealthIdModalOpen, setIsHealthIdModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [savedHistory, setSavedHistory] = useState('');
  const [profileName, setProfileName] = useState('Guest Patient');

  // Theme states (forced light brown/nude theme)
  const isDark = false;

  // Google authentication states
  const [googleUser, setGoogleUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('symptomnav_google_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email === "naishamalhotra070906@gmail.com" || parsed.name === "Naisha Malhotra") {
          localStorage.removeItem('symptomnav_google_user');
          return null;
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [authConnecting, setAuthConnecting] = useState(false);
  const [authEmail, setAuthEmail] = useState('gogiamishita@gmail.com');
  const [authName, setAuthName] = useState('Mishita Gogia');

  // Search input and action panel states
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<string[]>([
    "Welcome to SymptomNav Clinical Studio",
    "Dynamic health telemetry sync is active"
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize and persist theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('symptomnav_theme', 'light');
  }, []);

  // Load history & sync Google user info on load
  useEffect(() => {
    const checkAndPurgeStaleUsers = () => {
      const savedUser = localStorage.getItem('symptomnav_google_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.email === 'naishamalhotra070906@gmail.com' || parsed.name === 'Naisha Malhotra') {
            localStorage.removeItem('symptomnav_google_user');
            setGoogleUser(null);
            setProfileName('Guest Patient');
          }
        } catch (e) {
          // ignore
        }
      }
    };
    checkAndPurgeStaleUsers();

    const loadProfileContext = async () => {
      const p = await getProfile();
      setSavedHistory(p.clinicalHistory);
      
      if (googleUser && googleUser.email !== 'naishamalhotra070906@gmail.com' && googleUser.name !== 'Naisha Malhotra') {
        setProfileName(googleUser.name);
        // Sync profile database with Google Name if they differ
        if (p.name !== googleUser.name) {
          await saveProfile({ ...p, name: googleUser.name });
        }
      } else {
        setProfileName(p.name || 'Guest Patient');
      }
    };
    loadProfileContext();
  }, [activeTab, googleUser]);

  const handleProfileSynced = (history: string) => {
    setSavedHistory(history);
  };

  const handleTriage = async (symptoms: string, clinicalHistory: string) => {
    setLoading(true);
    
    // Inline profile history synchronization
    try {
      const p = await getProfile();
      if (clinicalHistory !== p.clinicalHistory) {
        const updated: HealthProfile = { ...p, clinicalHistory };
        await saveProfile(updated);
        setSavedHistory(clinicalHistory);
      }
    } catch (e) {
      console.warn("Could not sync triage profile history:", e);
    }

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, clinicalHistory }),
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        const errMsg = data.error || '';
        let errMarkdown = `### Triage Assessment Interrupted\n\nI apologize. I was unable to complete the symptom triage assessment due to a connection error.\n\n${errMsg}`;
        
        if (errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("api_key") || errMsg.toLowerCase().includes("invalid_argument")) {
          errMarkdown = `### Gemini API Key Required\n\nTo perform AI-powered triage and personalized symptom diagnostics, a valid Gemini API Key is required.\n\n**How to configure your API key:**\n1. In **Google AI Studio**, click the **Settings** gear icon in the top right or sidebar.\n2. Open the **Secrets** or **Environment Variables** panel.\n3. Add a new secret named \`GEMINI_API_KEY\` and paste a valid API key.\n4. Save, close the panel, and refresh the applet preview. Under-the-hood, the workspace will automatically link your credentials to start SymptomNav AI!`;
        }
        
        setTriageResult({
          urgency: 'ROUTINE',
          assessment: errMarkdown
        });
        setTimeout(() => {
          document.getElementById('assessment-result')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }

      setTriageResult(data);
      setTimeout(() => {
        document.getElementById('assessment-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Triage assessment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogout = () => {
    localStorage.removeItem('symptomnav_google_user');
    setGoogleUser(null);
    setProfileName('Guest Patient'); // Fallback default
    setNotifications(prev => ["Logged out of Google account", ...prev]);
  };

  const emergency = getEmergencyInfo(selectedCountry);

  const TAB_ITEMS = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquare },
    { id: 'triage', label: 'Symptoms Triage', icon: Activity },
    { id: 'calmer', label: 'Symptom Calmer', icon: Wind },
    { id: 'profile', label: 'Health ID Profile', icon: UserIcon },
  ];

    // Quick select results filtering based on search
    const handleSearchAction = (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery) return;
      const q = searchQuery.toLowerCase();
      if (q.includes('calm') || q.includes('breath') || q.includes('tension') || q.includes('nausea') || q.includes('relax') || q.includes('inhale')) {
        setActiveTab('calmer');
      } else if (q.includes('symptom') || q.includes('fever') || q.includes('pain') || q.includes('cold') || q.includes('app') || q.includes('sched') || q.includes('doc') || q.includes('pill') || q.includes('med') || q.includes('rx')) {
      setActiveTab('triage');
    } else if (q.includes('help') || q.includes('question') || q.includes('assistant') || q.includes('chat')) {
      setActiveTab('assistant');
    } else if (q.includes('profile') || q.includes('history') || q.includes('past')) {
      setActiveTab('profile');
    }
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-nude-50 text-nude-500 font-sans flex selection:bg-nude-200 transition-colors duration-300">
      
      {/* 1. Persisting Sidebar Assembly as seen in Reference Image */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-nude-100/60 border-r border-nude-200 p-8 justify-between shrink-0 h-screen sticky top-0 transition-colors duration-300">
        <div className="space-y-10">
          
          {/* Logo Brand "SymptomNav" with icon */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-nude-500 rounded-full flex items-center justify-center border border-nude-500 shadow-md">
              <Sparkles className="text-white w-5 h-5 animate-pulse" />
            </div>
            <span className="serif-display text-2xl font-bold tracking-normal text-nude-500">
              SymptomNav <span className="text-xs font-sans text-accent-gold align-super font-bold">✦</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2.5">
            {TAB_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer",
                    isActive
                      ? "bg-nude-500 text-white shadow-lg active:scale-95 border-none"
                      : "text-nude-400 hover:text-nude-500 hover:bg-nude-200/40"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-nude-300")} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Middle Campaign Promo Banner */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-nude-100 to-nude-200/50 p-6 rounded-3xl border border-nude-200 text-left space-y-3.5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-12 h-12 bg-nude-50 rounded-bl-3xl border-l border-b border-nude-200 flex items-center justify-center text-accent-gold opacity-55">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div>
              <h5 className="font-bold text-nude-500 text-xs tracking-tight">SymptomNav AI Companion</h5>
              <p className="text-[9px] text-[#A38D6F] uppercase tracking-wider font-bold mt-0.5">Health insights compiled</p>
            </div>
            <button
              onClick={() => setActiveTab('assistant')}
              className="px-4 py-2 bg-nude-500 hover:bg-nude-400 text-white border-none rounded-xl text-[8px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Chat now <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div 
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-3.5 p-3.5 hover:bg-nude-200/30 border border-transparent hover:border-nude-200 rounded-2xl transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-nude-200 flex items-center justify-center border border-nude-350 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-[10px] font-bold text-nude-500">
                {(googleUser ? googleUser.name : profileName).split(' ').pop()?.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h5 className="font-bold text-nude-500 text-xs truncate group-hover:text-amber-700 transition-colors">
                {googleUser ? googleUser.name : profileName}
              </h5>
              <p className="text-[9px] text-[#A38D6F] uppercase tracking-wider font-medium">
                {googleUser ? "Verified via Google" : "View Patient ID"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace Assemble */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header Panel */}
        <header className="sticky top-0 z-40 bg-nude-50/90 backdrop-blur-xl border-b border-nude-200 px-6 sm:px-10 py-5 flex items-center justify-between shrink-0 transition-all">
          
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            {/* Hamburger trigger for mobile */}
            <button 
              className="lg:hidden p-2 bg-white border border-nude-200 rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="text-nude-500 w-5 h-5" /> : <Menu className="text-nude-500 w-5 h-5" />}
            </button>

            {/* Quick command search input bar matching the image header */}
            <form onSubmit={handleSearchAction} className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nude-300 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search breathing calmer, wellness tips, clinic locations, metrics..."
                className="w-full bg-white border border-nude-200 rounded-full py-2.5 pl-11 pr-16 text-xs font-light text-nude-500 placeholder:text-nude-350 focus:outline-none focus:border-nude-305"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-nude-300 bg-nude-50 px-1.5 py-0.5 rounded border border-nude-100 uppercase pointer-events-none">
                ⌘ K
              </span>
            </form>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Google Authentication pill */}
            {googleUser ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">
                  {googleUser.email.substring(0, 16)}...
                </span>
                <button
                  type="button"
                  title="Disconnect account"
                  onClick={handleGoogleLogout}
                  className="p-0.5 bg-white rounded-full border border-emerald-200 hover:text-red-500 hover:border-red-500 duration-200 cursor-pointer"
                >
                  <LogOut className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4.5 py-2.5 bg-nude-500 text-white rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-nude-400 transition-colors cursor-pointer border-none"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In with Google
              </button>
            )}



            {/* Quick Health ID shortcut */}
            <button
              onClick={() => setIsHealthIdModalOpen(true)}
              className="hidden xl:inline-flex items-center gap-1.5 px-4.5 py-2 hover:bg-nude-500 hover:text-white border border-nude-300 rounded-full text-[9px] font-bold uppercase tracking-widest text-nude-500 transition-colors cursor-pointer"
            >
              Legacy Health ID
            </button>

            {/* Notifications Alert Center */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white border border-nude-200 hover:border-nude-350 rounded-full text-nude-400 hover:text-nude-500 transition-colors relative cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-72 bg-white border border-nude-200 rounded-2xl shadow-xl p-4 z-50 text-left space-y-2.5"
                    >
                      <h4 className="text-[10px] font-bold text-[#A38D6F] uppercase tracking-widest">Notification Stream</h4>
                      <div className="space-y-2">
                        {notifications.map((n, idx) => (
                          <div key={idx} className="p-2.5 bg-nude-50 rounded-xl text-xs font-light border border-nude-100 text-nude-500">
                            {n}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Instant Action Triage shortcuts */}
            <button 
              onClick={() => setActiveTab('triage')}
              className="p-3 bg-nude-500 text-white hover:bg-nude-400 rounded-full transition-colors cursor-pointer border-none"
              title="New Symptoms Triage"
            >
              <Plus className="w-4.5 h-4.5 animate-pulse" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="absolute inset-0 bg-nude-500/10 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="absolute inset-y-0 left-0 w-64 bg-nude-50 p-6 border-r border-nude-200 flex flex-col justify-between"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-nude-100 pb-4">
                    <span className="serif-display text-xl font-bold tracking-tight uppercase text-nude-500">SymptomNav</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-1 text-nude-350">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Google Login on Mobile Menu */}
                  <div className="pb-4 border-b border-nude-100">
                    {googleUser ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 truncate">{googleUser.email}</span>
                        <button type="button" onClick={handleGoogleLogout} className="p-1 text-red-500 hover:text-red-755 cursor-pointer">
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsGoogleModalOpen(true);
                        }}
                        className="w-full py-3 bg-nude-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer border-none"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Sign In with Google
                      </button>
                    )}
                  </div>

                  <nav className="space-y-1.5 text-left">
                    {TAB_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer border-none",
                            isActive
                              ? "bg-nude-500 text-white"
                              : "text-nude-400 hover:text-nude-500 hover:bg-nude-100"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dynamic Legacy Health ID Modal fallback */}
        <HealthIdModal 
          isOpen={isHealthIdModalOpen} 
          onClose={() => setIsHealthIdModalOpen(false)} 
          savedHistory={savedHistory}
          onSave={async (h) => {
            setSavedHistory(h);
            const p = await getProfile();
            await saveProfile({ ...p, clinicalHistory: h });
          }}
        />

        {/* Google Authentication Dialog popup simulator */}
        <AnimatePresence>
          {isGoogleModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsGoogleModalOpen(false)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-[2.5rem] border border-nude-200 dark:border-slate-800 shadow-2xl text-center space-y-6 overflow-hidden"
              >
                <div className="mx-auto w-12 h-12 bg-[#FAF9F6] dark:bg-slate-800 rounded-full flex items-center justify-center border border-nude-100 dark:border-slate-700">
                  <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.14-5.136 4.14A5.64 5.64 0 0 1 8.35 12.9a5.64 5.64 0 0 1 5.64-5.64c1.554 0 2.946.563 4.02 1.488l3.195-3.193C19.23 3.633 16.8.9 13.99.9C7.865.9 2.9 5.865 2.9 12s4.965 11.1 11.09 11.1c5.152 0 9.878-3.766 9.878-11.1c0-.521-.047-1.127-.135-1.715H12.24z"
                    />
                  </svg>
                </div>

                <div className="space-y-2 text-center">
                  <h4 className="serif-display text-2xl text-slate-950 dark:text-white">Sign in with Google</h4>
                  <p className="text-xs text-nude-400 dark:text-slate-400 font-light px-4 leading-relaxed">
                    Link your clinical patient records directly with your Google Workspace Account credentials.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-nude-450 uppercase tracking-[0.2em]">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Mishita Gogia"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-[#FAF5EC] border border-nude-150 rounded-xl px-4 py-3 text-xs text-nude-500 transition-colors focus:outline-none focus:border-nude-350 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-nude-450 uppercase tracking-[0.2em]">
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="gogiamishita@gmail.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-[#FAF5EC] border border-nude-150 rounded-xl px-4 py-3 text-xs text-nude-500 transition-colors focus:outline-none focus:border-nude-350 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!authName.trim() || !authEmail.trim()) {
                        setNotifications(prev => ["Please fill in both name and email fields.", ...prev]);
                        return;
                      }
                      setAuthConnecting(true);
                      setTimeout(() => {
                        const customUser = {
                          email: authEmail.trim(),
                          name: authName.trim()
                        };
                        setGoogleUser(customUser);
                        setProfileName(authName.trim());
                        localStorage.setItem('symptomnav_google_user', JSON.stringify(customUser));
                        setNotifications(prev => [
                          `Successfully signed in as ${authName.trim()}`,
                          ...prev
                        ]);
                        setAuthConnecting(false);
                        setIsGoogleModalOpen(false);
                      }, 1200);
                    }}
                    disabled={authConnecting || !authName.trim() || !authEmail.trim()}
                    className={cn(
                      "w-full py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-slate-900/10 border-none",
                      authConnecting || !authName.trim() || !authEmail.trim()
                        ? "bg-nude-200 text-nude-350 cursor-not-allowed"
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-nude-500 hover:text-white"
                    )}
                  >
                    {authConnecting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-3.5 h-3.5 border-2 border-white/30 border-t-white dark:border-slate-950/30 dark:border-t-slate-950 rounded-full"
                      />
                    ) : (
                      "Confirm & Authorize"
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="text-[9px] text-nude-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase font-bold tracking-widest mt-1.5 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    Cancel Authentication
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 3. Core Working Workspace Layout Panel */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto pb-24 text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {activeTab === 'home' && (
                <DashboardHome onNavigate={(tab) => setActiveTab(tab)} savedHistory={savedHistory} />
              )}
              {activeTab === 'assistant' && (
                <AiAssistant />
              )}
              {activeTab === 'triage' && (
                <div className="space-y-16">
                  {/* Triage Workspace Header */}
                  <div className="text-left">
                    <h2 className="serif-display text-4xl text-nude-500 font-medium">Symptom Assessment Workspace</h2>
                    <p className="text-nude-400 text-sm font-light">Assess acute occurrences alongside chronic diagnostic summaries instantly.</p>
                  </div>

                  <div className="grid lg:grid-cols-12 gap-10 items-start text-left">
                    {/* Input Form Module - 8 cols */}
                    <div className="lg:col-span-8">
                      <SymptomForm onTriage={handleTriage} loading={loading} initialHistory={savedHistory} />
                    </div>

                    {/* Crisis Numbers & Care Routing - 4 cols */}
                    <div className="lg:col-span-4 space-y-8 bg-white p-8 rounded-[2rem] border border-nude-200 shadow-sm transition-colors duration-300">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-red-500" />
                          <h4 className="font-semibold text-nude-500 text-sm">Crisis Directory</h4>
                        </div>
                        <select 
                          value={selectedCountry}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="w-full bg-[#FAF5EC] text-nude-500 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border border-nude-200 focus:outline-none"
                        >
                          {Object.keys(EMERGENCY_NUMBERS).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-nude-50 p-3 rounded-xl border border-nude-150">
                          <span className="block text-sm font-bold text-nude-500">{emergency.police}</span>
                          <span className="text-[8px] font-bold text-nude-300 uppercase tracking-widest">Police</span>
                        </div>
                        <div className="bg-nude-50 p-3 rounded-xl border border-nude-150">
                          <span className="block text-sm font-bold text-nude-500">{emergency.ambulance}</span>
                          <span className="text-[8px] font-bold text-nude-300 uppercase tracking-widest">Ambu</span>
                        </div>
                        <div className="bg-nude-50 p-3 rounded-xl border border-nude-150">
                          <span className="block text-sm font-bold text-nude-500">{emergency.fire}</span>
                          <span className="text-[8px] font-bold text-nude-300 uppercase tracking-widest">Fire</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results Section */}
                  <AnimatePresence>
                    {triageResult && (
                      <motion.div 
                        id="assessment-result" 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="scroll-mt-24 text-left"
                      >
                         <TriageResult 
                            urgency={triageResult.urgency} 
                            assessment={triageResult.assessment} 
                            onReset={() => setTriageResult(null)}
                         />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Care map locator */}
                  <div className="space-y-6">
                    <div className="text-left pb-2">
                      <h3 className="serif-display text-4xl text-nude-500">Care Locator</h3>
                      <p className="text-nude-400 text-xs font-light">Direct mapping indicators to authorized clinical emergency care centers.</p>
                    </div>
                    <HelpNavigator />
                  </div>
                </div>
              )}
              {activeTab === 'calmer' && (
                <SymptomCalmer />
              )}
              {activeTab === 'profile' && (
                <HealthProfileManager onProfileSynced={handleProfileSynced} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-nude-200 bg-nude-100/30 py-8 text-center shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-nude-400">
            &copy; 2026 SymptomNav Clinical Studio. Built on AI Studio Sandboxing Frameworks.
          </p>
        </footer>
      </div>
    </div>
  );
}
