import { Info } from 'lucide-react';
import React from 'react';

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex items-center">
      {children}
      <span className="ml-1 cursor-pointer">
        <Info className="h-4 w-4 text-slate-400 hover:text-brand-600" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max -translate-x-1/2 scale-95 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
        {text}
      </span>
    </span>
  )
}
