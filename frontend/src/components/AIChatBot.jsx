import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Clock,
  Leaf,
  Loader2,
  MapPin,
  MessageSquareText,
  Send,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';
import aiService from '../services/aiService';

const initialMessages = [
  {
    role: 'assistant',
    text: 'Hello. I am your Agro AI farm assistant. Tell me the crop, symptoms, season, and location context, and I will suggest practical next steps.',
  },
];

const CHAT_HISTORY_KEY = 'agroai_chat_history';

const promptSuggestions = [
  'My tomato leaves have dark spots after rain. What should I do?',
  'Create a 7 day irrigation plan for paddy in monsoon.',
  'Recommend organic fertilizer for chilli crop flowering stage.',
  'How do I prevent fungal spread in potato fields?',
];

const AIChatBot = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => setLocation(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!savedHistory) return;

    try {
      setHistory(JSON.parse(savedHistory));
    } catch (storageError) {
      console.warn('Unable to parse chat history', storageError);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveHistory = (nextHistory) => {
    setHistory(nextHistory);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(nextHistory));
  };

  const addHistoryEntry = (question, answer) => {
    const nextHistory = [
      { question, answer, createdAt: new Date().toISOString() },
      ...history,
    ].slice(0, 12);
    saveHistory(nextHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  const clearConversation = () => {
    setMessages(initialMessages);
    setError(null);
  };

  const sendMessage = async (messageText) => {
    const trimmed = messageText?.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.chat({ message: trimmed, location });
      const answer = response.data.answer || 'I am unable to provide a suggestion at the moment.';
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
      addHistoryEntry(trimmed, answer);
    } catch (err) {
      setError(err.response?.data?.message || 'Chatbot service is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    await sendMessage(input);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="agri-panel flex min-h-[680px] flex-col overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-green-900/10 bg-white/55 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-800 text-slate-900">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-black text-green-950">Agro AI Farm Assistant</h2>
            <p className="text-sm font-medium text-green-900/65">Disease, fertilizer, irrigation, weather, and local farm decisions.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-900/10 bg-white/70 px-3 py-1.5 text-xs font-bold text-green-900/75">
            <MapPin className="h-3.5 w-3.5" />
            {location ? 'Location enabled' : 'Location off'}
          </span>
          <button
            type="button"
            onClick={clearConversation}
            className="inline-flex items-center gap-1.5 rounded-full border border-green-900/10 bg-white/70 px-3 py-1.5 text-xs font-bold text-green-900/75 transition hover:bg-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear chat
          </button>
        </div>
      </div>

      <div className="border-b border-green-900/10 bg-lime-50/50 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-green-800">
          <Sparkles className="h-4 w-4" />
          Quick farm prompts
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {promptSuggestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="shrink-0 rounded-xl border border-green-900/10 bg-white/75 px-4 py-2 text-left text-xs font-semibold text-green-950 shadow-sm transition hover:border-green-700/30 hover:bg-white"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-white/35 to-lime-50/35 p-4 sm:p-6">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isAssistant = message.role === 'assistant';
            return (
              <div key={`${message.role}-${index}`} className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                {isAssistant && (
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-800 text-slate-900">
                    <Leaf className="h-4 w-4" />
                  </span>
                )}

                <div
                  className={`max-w-[86%] rounded-2xl px-4 py-3 shadow-sm ${
                    isAssistant
                      ? 'border border-green-900/10 bg-white/85 text-green-950'
                      : 'bg-green-800 text-slate-900'
                  }`}
                >
                  <div className={`mb-1 flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-wide ${isAssistant ? 'text-green-800/65' : 'text-lime-100/75'}`}>
                    {isAssistant ? <Bot className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
                    {isAssistant ? 'Agro AI' : 'You'}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                </div>

                {!isAssistant && (
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-green-800 shadow-sm">
                    <UserRound className="h-4 w-4" />
                  </span>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 rounded-2xl border border-green-900/10 bg-white/80 p-4 text-sm font-semibold text-green-900/70">
              <Loader2 className="h-4 w-4 animate-spin text-green-700" />
              Preparing agronomy guidance...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className="border-t border-rose-500/20 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="border-t border-green-900/10 bg-white/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Ask about crop disease, fertilizer, irrigation, weather risk, or nearby suppliers..."
            className="agri-input min-h-[58px] flex-1 resize-none px-4 py-3 text-sm outline-none placeholder:text-green-900/35"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="agri-button min-h-[58px] px-6 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
        <p className="mt-2 text-xs font-medium text-green-900/55">Press Enter to send. Use Shift + Enter for a new line.</p>
      </form>

      <div className="border-t border-green-900/10 bg-lime-50/45 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-green-800" />
            <h3 className="text-sm font-black text-green-950">Recent Questions</h3>
          </div>
          {history.length > 0 && (
            <button type="button" onClick={clearHistory} className="text-xs font-bold text-green-800 hover:text-green-950">
              Clear history
            </button>
          )}
        </div>

        {history.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {history.slice(0, 4).map((entry, index) => (
              <button
                key={`${entry.createdAt}-${index}`}
                type="button"
                onClick={() => setInput(entry.question)}
                className="rounded-xl border border-green-900/10 bg-white/65 p-3 text-left transition hover:bg-white"
              >
                <div className="mb-1 flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-wide text-green-900/55">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(entry.createdAt).toLocaleString()}
                </div>
                <p className="line-clamp-2 text-xs font-semibold text-green-950">{entry.question}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-green-900/60">No saved questions yet. Start a chat and your recent farm questions will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default AIChatBot;
