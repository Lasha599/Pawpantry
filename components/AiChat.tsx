'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'Best food for a Golden Retriever puppy?',
  'What to avoid for a chicken-allergic dog?',
  'Senior small breed feeding tips?',
  'How long does delivery take?',
];

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { state } = useStore();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const dogContext = state.dogs.length
    ? state.dogs
        .map(
          d =>
            `${d.name}: ${d.breed}, ${d.ageYears}yr ${d.ageMonths}mo, ${d.weightKg}kg, activity: ${d.activity}${d.allergies.length ? `, allergies: ${d.allergies.join(', ')}` : ''}`,
        )
        .join('\n')
    : null;

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const history: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, dogContext }),
      });

      if (!res.ok || !res.body) throw new Error('bad response');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') break;
          try {
            const delta =
              JSON.parse(payload).choices?.[0]?.delta?.content ?? '';
            if (delta) {
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                  role: 'assistant',
                  content: copy[copy.length - 1].content + delta,
                };
                return copy;
              });
            }
          } catch {
            // partial JSON chunk — skip
          }
        }
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle AI advisor"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 ${
          open ? 'bg-ink hover:bg-ink/80' : 'bg-clay hover:bg-clayDark'
        }`}
      >
        {open ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[520px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-ink/10 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-forest text-white flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">PawPantry AI Advisor</p>
              <p className="text-xs text-white/70">Dog nutrition &amp; delivery help</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="mt-2">
                <div className="flex items-start gap-2 mb-4">
                  <div className="w-7 h-7 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-forest" />
                  </div>
                  <div className="bg-sand rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-ink leading-relaxed">
                    Hi! I&apos;m PawPantry&apos;s nutrition advisor. Ask me about the best
                    food for your dog&apos;s breed, age, or dietary needs — or about
                    delivery times.
                  </div>
                </div>

                <p className="text-xs text-muted ml-9 mb-2">Try asking:</p>
                <div className="space-y-1.5 ml-9">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-xl bg-cream hover:bg-sand border border-ink/10 text-ink transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                      msg.role === 'user' ? 'bg-clay' : 'bg-forest/10'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-forest" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-clay text-white rounded-tr-sm'
                        : 'bg-sand text-ink rounded-tl-sm'
                    }`}
                  >
                    {msg.content === '' &&
                    streaming &&
                    i === messages.length - 1 ? (
                      <Loader2 className="w-4 h-4 animate-spin text-forest" />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-ink/10 flex gap-2 items-center flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              disabled={streaming}
              placeholder="Ask about food or nutrition..."
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-ink/20 bg-cream focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay/30 placeholder:text-muted disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={streaming || !input.trim()}
              className="w-9 h-9 rounded-xl bg-clay hover:bg-clayDark disabled:opacity-40 flex items-center justify-center transition flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
