import React from 'react';
import { Bell, Search, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search agents, attack suites, documents..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-teal-400 absolute top-2 right-2 ring-2 ring-slate-900" />
        </button>

        <div className="h-5 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 text-xs font-bold">
            AY
          </div>
          <div className="text-left text-xs">
            <span className="block font-medium text-slate-200">Aditya Yadav</span>
            <span className="block text-slate-500">Security Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
