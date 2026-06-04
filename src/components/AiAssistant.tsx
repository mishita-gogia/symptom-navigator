import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, RefreshCw, SendHorizontal, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { getProfile, getMetrics, HealthProfile, HealthMetrics } from '../lib/db';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hello! I am SymptomNav AI, your clinical information compiler and healthcare companion. How can I assist you with your health query today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Load patient context
  useEffect(() => {
    const fetchContext = async () => {
      const p = await getProfile();
      setProfile(p);
      const m = await getMetrics();
      setMetrics(m);
    };
    fetchContext();
  }, []);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          clinicalHistory: profile?.clinicalHistory || '',
          metrics: metrics
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const errMsg = data.error || '';
        let guideMessage = "My apologies. I encountered a pipeline connection error. Please try again.";
        
        if (errMsg.toLowerCase().includes("api key") || errMsg.toLowerCase().includes("api_key") || errMsg.toLowerCase().includes("invalid_argument")) {
          guideMessage = `### Gemini API Key Required
          
To connect the clinical chat companion to SymptomNav's diagnostics core, a valid Gemini API Key is required.

**How to configure your API key:**
1. Click on the **Settings** gear icon in the top right or sidebar of the **Google AI Studio** workspace.
2. In the modal, locate the **Secrets** or **Environment Variables** panel.
3. Save a new secret named \`GEMINI_API_KEY\` set to a valid workspace API key from Google AI Studio.
4. Refresh the applet preview. This sandboxed project will automatically bind your credentials and resume calculations!`;
        } else {
          guideMessage = `**Connection Error**: ${errMsg}`;
        }

        setMessages([...newMessages, { role: 'model', text: guideMessage }]);
        return;
      }

      setMessages([...newMessages, { role: 'model', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: 'model',
          text: "My apologies. I encountered a pipeline connection error. Please ensure your backend environment and Gemini API token variables are loaded. You can submit another query."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    { title: "Analyze metrics", text: "Evaluate my current clinical logs and sleep durancy indicators." },
    { title: "Pollen allergies help", text: "What are natural and medical stabilizers for seasonal pollen exposure?" },
    { title: "Cardio heart rates", text: "What constitutes a normal resting heart rate threshold for a 28yo female?" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto flex flex-col h-[70vh] bg-white rounded-[2.5rem] border border-nude-200 overflow-hidden shadow-sm"
    >
      {/* Assistant Header */}
      <div className="p-6 border-b border-nude-100 bg-nude-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-nude-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent-gold" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-nude-500 text-sm">SymptomNav AI Companion</h3>
            <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Online Assistant
            </p>
          </div>
        </div>
        
        <div className="text-[10px] text-nude-350 font-medium font-sans">
          Context loaded: {profile?.name || "Patient"}
        </div>
      </div>

      {/* Message Output Workspace */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={cn(
              "flex gap-4 max-w-[85%] text-sm leading-relaxed",
              m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {/* Avatar block */}
            <div className={cn(
              "w-8 h-8 rounded-full shrink-0 flex items-center justify-center border text-xs",
              m.role === 'user' 
                ? "bg-nude-100 text-nude-500 border-nude-200" 
                : "bg-nude-500 text-white border-nude-500"
            )}>
              {m.role === 'user' ? <User className="w-4.5 h-4.5" /> : <Sparkles className="w-3.5 h-3.5 text-accent-gold" />}
            </div>

            {/* Bubble details */}
            <div className={cn(
              "p-4 rounded-3xl",
              m.role === 'user'
                ? "bg-nude-100/75 border border-nude-200 text-nude-500 rounded-tr-none text-right font-light"
                : "bg-neutral-50/90 border border-nude-150 text-nude-500 rounded-tl-none text-left italic font-serif"
            )}>
              <div className="markdown-body prose prose-slate max-w-none prose-p:text-nude-500 prose-headings:text-nude-550">
                <Markdown>{m.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-4 max-w-[85%] text-sm mr-auto items-center">
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-nude-500 border border-nude-500 text-white animate-spin">
              <RefreshCw className="w-4 h-4 text-accent-gold" />
            </div>
            <p className="text-xs text-nude-300 font-light italic">SymptomNav clinical backend formulating diagnosis...</p>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Quick Suggestion Prompts */}
      {messages.length === 1 && (
        <div className="px-6 py-3 border-t border-nude-100 flex flex-wrap gap-2 justify-center">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.text)}
              className="px-4 py-2 bg-nude-50/70 hover:bg-nude-100/50 border border-nude-100/80 rounded-full text-[10px] font-bold text-nude-500 hover:text-nude-500 uppercase tracking-wider transition-all cursor-pointer"
            >
              {q.title}
            </button>
          ))}
        </div>
      )}

      {/* Input Workspace Panel */}
      <div className="p-4 border-t border-nude-100 bg-nude-50/20">
        <div className="relative flex items-center max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search healthy tips, understand parameters, or explore clinical indicators..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="w-full bg-white border border-nude-200 rounded-full py-4 pl-6 pr-14 text-xs font-light text-nude-500 focus:outline-none focus:border-nude-350 focus:ring-1 focus:ring-nude-350 resize-none placeholder:text-nude-250"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2.5 bg-nude-500 text-white rounded-full transition-all hover:bg-nude-400 border-none cursor-pointer disabled:bg-nude-100 disabled:text-nude-200"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-nude-300 mt-2 text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> Healthcare models may suffer margin limits. Verify high acute context.
        </p>
      </div>
    </motion.div>
  );
};
