import { useState, useRef, useEffect } from "react";
import API from "../services/api";
import { MessageSquare, Send, Bot, User, AlertTriangle, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function ChatAssistant() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your LungGuard AI Health Copilot. I can answer questions about smoking cessation, alcohol health effects, lung capacity, and liver protection. If you are experiencing symptoms, please tell me about them so I can guide you on what levels of urgency they may represent.",
      classification: null,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const parseBotReply = (reply) => {
    // Standard matches for classification line
    const classificationRegex = /^(?:SYMPTOM CLASSIFICATION:\s*|[*]*SYMPTOM CLASSIFICATION:[*]*\s*)(emergency|urgent|routine)/i;
    const match = reply.match(classificationRegex);
    
    if (match) {
      const classification = match[1].toLowerCase();
      const cleanText = reply.replace(classificationRegex, "").trim();
      return { classification, text: cleanText };
    }
    
    // Fallback search in body
    const bodyRegex = /SYMPTOM CLASSIFICATION:\s*(emergency|urgent|routine)/i;
    const bodyMatch = reply.match(bodyRegex);
    if (bodyMatch) {
      const classification = bodyMatch[1].toLowerCase();
      const cleanText = reply.replace(bodyMatch[0], "").trim();
      return { classification, text: cleanText };
    }

    return { classification: null, text: reply };
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    setInput("");
    
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: userMessageText,
      classification: null,
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await API.post("/chat/ask", { message: userMessageText });
      const { classification, text } = parseBotReply(res.data.reply);
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text,
          classification,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "I am having trouble connecting to the AI services right now. Please verify your connection or try again later.",
          classification: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBanner = (classification) => {
    if (!classification) return null;
    
    if (classification === "emergency") {
      return (
        <div className="flex items-center gap-2 bg-red-950/45 border border-red-500/20 text-red-400 p-2.5 rounded-xl text-xs font-bold mb-3">
          <ShieldAlert size={14} className="shrink-0 animate-bounce" />
          <span>🚨 Emergency Indicator: Urgent professional care is recommended immediately.</span>
        </div>
      );
    }
    if (classification === "urgent") {
      return (
        <div className="flex items-center gap-2 bg-amber-950/45 border border-amber-500/20 text-amber-400 p-2.5 rounded-xl text-xs font-bold mb-3">
          <AlertTriangle size={14} className="shrink-0" />
          <span>⚠️ Urgent Indicator: Please schedule a doctor visit promptly.</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 bg-emerald-950/45 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-xl text-xs font-bold mb-3">
        <CheckCircle size={14} className="shrink-0" />
        <span>ℹ️ Routine health question: No high-risk indicators detected.</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-6 h-[calc(100vh-10rem)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">AI Health Copilot</h1>
            <p className="text-slate-450 text-xs mt-0.5">Your helper for quit-smoking, alcohol cessation, and symptom checks.</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-grow overflow-y-auto bg-slate-950/30 border border-slate-900 rounded-2xl p-4 sm:p-6 mb-4 flex flex-col gap-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"}`}
          >
            {/* Avatar icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-slate-300 ${
              msg.sender === "user" ? "bg-sky-500/10 border-sky-500/20" : "bg-slate-900 border-slate-800"
            }`}>
              {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>

            {/* Bubble content */}
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.sender === "user" 
                ? "bg-gradient-to-r from-sky-550 to-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-md" 
                : "bg-slate-900/60 border border-slate-850 text-slate-200 rounded-tl-none shadow-sm"
            }`}>
              {/* Show urgency classification bar on bot messages */}
              {msg.sender === "bot" && getUrgencyBanner(msg.classification)}
              
              {/* Raw message block (preserving newline outputs) */}
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[80%] self-start">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 size={14} className="animate-spin text-sky-400" />
              <span>Analyzing medical query...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Box */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about coughing, chest pain, or tips to stop smoking..."
          className="flex-grow bg-slate-900/50 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-gradient-to-r from-sky-500 to-cyan-400 hover:opacity-95 disabled:opacity-50 text-slate-955 p-3 rounded-xl shadow-lg transition-all shrink-0 cursor-pointer flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

export default ChatAssistant;