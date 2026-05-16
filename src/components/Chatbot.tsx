import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    { role: 'model', content: 'Hi! I am your CareerPulse AI assistant. I can help with resume tips, job search, or platform guidance. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setIsTyping(true);
    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      
      const response = await geminiService.chat(userMsg, history);
      setMessages(prev => [...prev, { role: 'model', content: response || "I encountered an error." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: 'Sorry, my AI core is resting. Please try again in a moment.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="mb-4 h-[500px] w-[350px] overflow-hidden rounded-3xl border border-indigo-500/20 bg-slate-950 shadow-2xl shadow-indigo-500/20 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/20 p-1.5">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Career Coach AI</h3>
                  <p className="text-[10px] opacity-80 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[80%] gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs text-white ${m.role === 'user' ? 'bg-indigo-500' : 'bg-slate-800'}`}>
                      {m.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                    </div>
                    <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-900 border border-white/5 text-gray-300 rounded-tl-none'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white">
                      <Bot className="h-3 w-3" />
                    </div>
                    <div className="bg-slate-900 border border-white/5 rounded-2xl rounded-tl-none px-3 py-2 flex gap-1 items-center">
                      <span className="h-1 w-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1 w-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1 w-1 bg-gray-500 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="w-full rounded-2xl bg-slate-900 border border-white/10 px-4 py-2.5 pr-12 text-xs text-white focus:border-indigo-500 outline-none transition-colors"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 top-1.5 rounded-xl bg-indigo-600 p-1.5 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-90"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-500/40 transition-shadow hover:shadow-indigo-500/60"
      >
        <MessageSquare className="h-6 w-6" />
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold border-2 border-slate-950">
          <Sparkles className="h-3 w-3" />
        </div>
      </motion.button>
    </div>
  );
}
