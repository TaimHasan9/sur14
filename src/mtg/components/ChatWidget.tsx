"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
const mrTom = "/mr-tom-256.jpg";
import {
  PROVIDERS,
  STORE,
  getReply,
  isAIConfigured,
  loadHistory,
  loadSettings,
  saveHistory,
  saveSettings,
  uid,
  type ChatMsg,
  type ChatSettings,
  type ProviderId,
} from "@/mtg/utils/chatApi";

const OPEN_KEY = "mrtom_chat_open";
const QUICK = ["iPhone 17 Pro Max দাম কত?", "EMI কিভাবে করব?", "Delivery charge?", "Warranty policy", "Exchange offer", "Outlet address"];

/* Floating "Tom" support bubble → full live-chat panel */
export default function ChatWidget() {
  const [open, setOpen] = useState(() => sessionStorage.getItem(OPEN_KEY) === "1");
  const [hint, setHint] = useState(() => sessionStorage.getItem(OPEN_KEY) === null);
  const [msgs, setMsgs] = useState<ChatMsg[]>(() => loadHistory());
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>(() => loadSettings());
  const [unread, setUnread] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const aiOn = useMemo(() => isAIConfigured(settings), [settings]);

  /* persist */
  useEffect(() => saveHistory(msgs), [msgs]);
  useEffect(() => {
    sessionStorage.setItem(OPEN_KEY, open ? "1" : "0");
    if (open) {
      setHint(false);
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* auto-scroll */
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs, typing, open, showSettings]);

  /* first-time welcome */
  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([
        {
          id: uid(),
          role: "assistant",
          ts: Date.now(),
          content:
            "আসসালামু আলাইকুম! 👋 আমি **টম**, Mr Tom Gadgets-এর সাপোর্ট অ্যাসিস্ট্যান্ট।\n\nপ্রোডাক্টের দাম, EMI, ডেলিভারি, ওয়ারেন্টি — যেকোনো প্রশ্ন করুন। আমি বাংলা, Banglish ও English সবই বুঝি। 😊",
        },
      ]);
    }
  }, [open, msgs.length]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setInput("");
    const userMsg: ChatMsg = { id: uid(), role: "user", content: text, ts: Date.now() };
    const history = [...msgs, userMsg];
    setMsgs(history);
    setTyping(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const started = Date.now();
    const reply = await getReply(msgs, text, settings, ctrl.signal);
    // built-in assistant answers instantly — add a small natural delay
    const wait = Math.max(0, 650 - (Date.now() - started));
    await new Promise((r) => setTimeout(r, wait));
    if (ctrl.signal.aborted) return;
    setTyping(false);
    const bot: ChatMsg = { id: uid(), role: "assistant", content: reply.text, ts: Date.now(), ai: reply.ai };
    setMsgs((m) => [...m, bot]);
    if (reply.error) {
      setMsgs((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          ts: Date.now(),
          content: `⚠️ AI API error: _${reply.error}_ — উপরের উত্তরটি built-in assistant দিয়েছে। ⚙️ Settings-এ API key/model চেক করুন।`,
        },
      ]);
    }
    if (!open) setUnread((u) => u + 1);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send();
  };

  const clear = () => {
    abortRef.current?.abort();
    setTyping(false);
    setMsgs([]);
  };

  return (
    <>
      {/* ---------------- floating bubble ---------------- */}
      <div className={`fixed bottom-[76px] lg:bottom-5 right-4 sm:right-5 z-50 flex items-end gap-2 ${open ? "hidden" : ""}`}>
        {hint && (
          <div className="relative bg-white rounded-md shadow-[0_6px_24px_rgba(0,0,0,0.18)] px-4 py-3 max-w-[210px] border border-gray-100 animate-fade-up">
            <button
              onClick={() => setHint(false)}
              aria-label="Close hint"
              className="absolute -top-2 -left-2 w-5 h-5 bg-white border border-gray-200 rounded-full text-gray-500 text-[10px] flex items-center justify-center hover:text-[#FD5B67] transition"
            >
              ✕
            </button>
            <p className="text-[12.5px] leading-snug text-[#1d1d1f]">স্যার, কিভাবে সহযোগিতা করতে পারি?</p>
            <p className="text-[10.5px] text-gray-400 mt-1">Tom · Live chat · সাধারণত সাথে সাথে উত্তর</p>
          </div>
        )}

        <button
          onClick={() => setOpen(true)}
          aria-label="Open live chat"
          className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:scale-105 transition bg-[#0b0b0c]"
        >
          <img src={mrTom} alt="Tom" className="w-full h-full object-cover" />
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#25D366] rounded-full border-2 border-white animate-pulse" />
          {unread > 0 && (
            <span className="absolute -top-0 -left-0 min-w-[18px] h-[18px] px-1 bg-[#FD5B67] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* ---------------- chat panel ---------------- */}
      {open && (
        <div
          role="dialog"
          aria-label="Live chat with Mr Tom Gadgets"
          className="fixed z-[60] bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[380px] h-[100dvh] sm:h-[600px] sm:max-h-[calc(100vh-40px)] bg-white sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-fade-up"
        >
          {/* header */}
          <div className="bg-[#0b0b0c] text-white px-4 py-3 flex items-center gap-3 shrink-0">
            <span className="relative shrink-0">
              <img src={mrTom} alt="Tom" className="w-11 h-11 rounded-full object-cover ring-2 ring-[#F27F20]/70" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-[#0b0b0c]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[15px] leading-tight">
                Tom <span className="font-normal text-gray-400">· Mr Tom Gadgets</span>
              </p>
              <p className="text-[11px] text-gray-300 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                Online
                <span className="text-gray-500">•</span>
                {aiOn ? (
                  <span className="text-[#F27F20] font-semibold">AI: {PROVIDERS[settings.provider].label.split(" ")[0]}</span>
                ) : (
                  <span className="text-gray-400">Smart assistant</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowSettings((v) => !v)}
              aria-label="AI settings"
              title="AI API settings"
              className={`p-1.5 rounded-full hover:bg-white/10 transition ${showSettings ? "bg-white/10 text-[#F27F20]" : "text-gray-300"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button onClick={clear} aria-label="Clear chat" title="Clear conversation" className="p-1.5 rounded-full text-gray-300 hover:bg-white/10 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1.5 rounded-full text-gray-300 hover:bg-white/10 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* settings drawer */}
          {showSettings && (
            <SettingsPanel
              settings={settings}
              onSave={(s) => {
                setSettings(s);
                saveSettings(s);
                setShowSettings(false);
              }}
              onClose={() => setShowSettings(false)}
            />
          )}

          {/* messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[#f4f5f7]">
            {msgs.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <img src={mrTom} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* quick replies */}
          <div className="shrink-0 bg-[#f4f5f7] px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => void send(q)}
                disabled={typing}
                className="shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[#F27F20] hover:text-[#F27F20] transition disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* composer */}
          <form onSubmit={onSubmit} className="shrink-0 border-t border-gray-200 bg-white p-2.5 flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="আপনার প্রশ্ন লিখুন… (বাংলা / English)"
              className="flex-1 h-11 px-4 rounded-full bg-[#f4f5f7] text-[14px] outline-none focus:ring-2 focus:ring-[#F27F20]/40 placeholder:text-gray-400"
              maxLength={600}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              aria-label="Send"
              className="w-11 h-11 rounded-full bg-[#F27F20] text-white flex items-center justify-center hover:bg-[#d96d15] transition disabled:opacity-40 disabled:hover:bg-[#F27F20]"
            >
              <svg className="w-5 h-5 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
              </svg>
            </button>
          </form>
          <p className="shrink-0 text-center text-[10px] text-gray-400 bg-white pb-2 -mt-0.5">
            {aiOn ? "Powered by AI · answers use live catalog prices" : `Built-in assistant · Hotline ${STORE.hotline}`}
          </p>
        </div>
      )}
    </>
  );
}

/* ---------------- message bubble ---------------- */
function Bubble({ msg }: { msg: ChatMsg }) {
  const me = msg.role === "user";
  const time = new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={`flex items-end gap-2 ${me ? "flex-row-reverse" : ""}`}>
      {!me && <img src={mrTom} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />}
      <div className={`max-w-[82%] ${me ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
            me ? "bg-[#F27F20] text-white rounded-2xl rounded-br-sm" : "bg-white text-[#1d1d1f] rounded-2xl rounded-bl-sm"
          }`}
        >
          {renderMarkdown(msg.content, me)}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">
          {time}
          {msg.ai && <span className="ml-1 text-[#F27F20] font-semibold">· AI</span>}
        </span>
      </div>
    </div>
  );
}

/* tiny markdown: **bold**, _italic_, ~~strike~~, [text](url), line breaks, bullets */
function renderMarkdown(src: string, onOrange: boolean): ReactNode {
  const linkCls = onOrange ? "underline font-semibold" : "text-[#F27F20] font-semibold underline underline-offset-2 hover:opacity-80";
  const parts: ReactNode[] = [];
  const rx = /\*\*(.+?)\*\*|~~(.+?)~~|_(.+?)_|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = rx.exec(src))) {
    if (m.index > last) parts.push(src.slice(last, m.index));
    if (m[1] !== undefined) parts.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2] !== undefined) parts.push(<s key={k++} className="opacity-70">{m[2]}</s>);
    else if (m[3] !== undefined) parts.push(<em key={k++}>{m[3]}</em>);
    else if (m[4] !== undefined) {
      const href = m[5];
      const external = /^https?:/i.test(href);
      parts.push(
        <a key={k++} href={href} className={linkCls} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
          {m[4]}
        </a>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < src.length) parts.push(src.slice(last));
  return parts;
}

/* ---------------- AI settings ---------------- */
function SettingsPanel({ settings, onSave, onClose }: { settings: ChatSettings; onSave: (s: ChatSettings) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<ChatSettings>(settings);
  const preset = PROVIDERS[draft.provider];
  const set = (patch: Partial<ChatSettings>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 text-[12.5px] max-h-[62%] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-[13px] text-[#1d1d1f]">⚙️ Live-chat AI settings</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
          ✕
        </button>
      </div>
      <p className="text-gray-500 mb-3 leading-snug">
        একটি API key দিলে চ্যাট AI দিয়ে উত্তর দিবে (প্রোডাক্ট দাম/তথ্য অটো যুক্ত হয়)। Key না দিলে built-in assistant কাজ করবে। Key শুধু এই ব্রাউজারে save হয়।
      </p>

      <label className="block font-semibold text-gray-700 mb-1">Provider</label>
      <select
        value={draft.provider}
        onChange={(e) => {
          const p = e.target.value as ProviderId;
          set({ provider: p, model: "", baseUrl: p === "custom" ? draft.baseUrl : "" });
        }}
        className="w-full h-9 px-2 rounded-md border border-gray-300 bg-white mb-2.5 outline-none focus:border-[#F27F20]"
      >
        {(Object.keys(PROVIDERS) as ProviderId[]).map((id) => (
          <option key={id} value={id}>
            {PROVIDERS[id].label}
          </option>
        ))}
      </select>

      {draft.provider === "custom" && (
        <>
          <label className="block font-semibold text-gray-700 mb-1">Chat completions URL</label>
          <input
            value={draft.baseUrl}
            onChange={(e) => set({ baseUrl: e.target.value })}
            placeholder="https://your-server/v1/chat/completions"
            className="w-full h-9 px-3 rounded-md border border-gray-300 mb-2.5 outline-none focus:border-[#F27F20]"
          />
        </>
      )}

      <label className="block font-semibold text-gray-700 mb-1">
        API key{" "}
        {preset.keyUrl && (
          <a href={preset.keyUrl} target="_blank" rel="noreferrer" className="text-[#F27F20] font-normal underline ml-1">
            free key নিন ↗
          </a>
        )}
      </label>
      <input
        type="password"
        value={draft.apiKey}
        onChange={(e) => set({ apiKey: e.target.value })}
        placeholder={preset.keyHint}
        autoComplete="off"
        className="w-full h-9 px-3 rounded-md border border-gray-300 mb-2.5 outline-none focus:border-[#F27F20] font-mono"
      />

      <label className="block font-semibold text-gray-700 mb-1">Model</label>
      <input
        value={draft.model}
        onChange={(e) => set({ model: e.target.value })}
        placeholder={preset.model || "model name"}
        className="w-full h-9 px-3 rounded-md border border-gray-300 mb-3 outline-none focus:border-[#F27F20] font-mono"
      />

      <div className="flex gap-2">
        <button onClick={() => onSave(draft)} className="flex-1 h-9 rounded-md bg-[#F27F20] text-white font-semibold hover:bg-[#d96d15] transition">
          Save
        </button>
        <button
          onClick={() => onSave({ ...draft, apiKey: "" })}
          className="h-9 px-3 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
          title="Remove key and use the built-in assistant"
        >
          Use built-in
        </button>
      </div>
    </div>
  );
}
