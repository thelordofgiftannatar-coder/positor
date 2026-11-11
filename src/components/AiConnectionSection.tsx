import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { getApiBase, getGeminiKey, isNative, saveAiConnection } from '../api';

export const AiConnectionSection: React.FC = () => {
  const [key, setKey] = useState(getGeminiKey());
  const [base, setBase] = useState(getApiBase());
  const [saved, setSaved] = useState(false);
  if (!isNative()) return null;

  return (
    <section className="space-y-4 pt-2 border-t border-white/10">
      <div>
        <h3 className="text-lg font-bold text-amber-400 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>AI connection</span>
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          Your Gemini key stays on this phone. Get a free one at aistudio.google.com/apikey
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-[#1e1b17] border border-[#3b342e] space-y-3">
        <label className="text-xs font-semibold text-neutral-300 block">Gemini API key</label>
        <input
          type="password"
          value={key}
          onChange={(e) => { setKey(e.target.value); setSaved(false); }}
          placeholder="Paste your key"
          className="w-full bg-black/60 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none"
        />
        <label className="text-xs font-semibold text-neutral-300 block">Server URL (optional, for cloud sync)</label>
        <input
          type="url"
          value={base}
          onChange={(e) => { setBase(e.target.value); setSaved(false); }}
          placeholder="https://your-server.example.com"
          className="w-full bg-black/60 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none"
        />
        <button
          onClick={() => { saveAiConnection(key, base); setSaved(true); }}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition flex items-center justify-center gap-1.5"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </section>
  );
};
