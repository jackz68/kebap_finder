import { useState } from "react";

export default function ChatPanel({ messages, onSend, isLoading, countryOptionsText }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    await onSend(trimmed);
    setInputValue("");
  };

  return (
    <div className="h-full min-h-0 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 shadow-sm flex flex-col">
      <div className="p-4 border-b border-zinc-200/60 dark:border-zinc-700/60">
        <h2 className="text-base font-semibold">Chat</h2>
      </div>
      <div className="flex-1 min-h-0 overflow-auto overscroll-contain p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={message.role === "assistant" ? "flex justify-start" : "flex justify-end"}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${message.role === "assistant" ? "bg-zinc-100 dark:bg-zinc-700" : "bg-indigo-600 text-white"}`}>
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
        {countryOptionsText ? <p className="text-xs text-zinc-500 dark:text-zinc-400">Country options: {countryOptionsText}</p> : null}
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type a city (or country if asked)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white/70 dark:bg-zinc-900/70 px-3 py-2 text-sm opacity-80"
          />
          <button
            disabled={isLoading}
            className="rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
