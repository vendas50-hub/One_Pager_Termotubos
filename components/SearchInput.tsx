import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface SearchInputProps {
  onSearch: (term: string) => void;
  isLoading: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      onSearch(term);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative flex items-center bg-slate-900 rounded-2xl border border-slate-700 p-2 shadow-2xl transition-all focus-within:border-blue-500 focus-within:shadow-blue-500/20">
        <Search className="ml-4 h-6 w-6 text-slate-500" />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Nome da empresa (ex: WEG, Intelbras, Estaleiro X...)"
          className="w-full bg-transparent px-4 py-4 text-lg text-white placeholder-slate-500 outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !term.trim()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:translate-y-[-1px] hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[1px]"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              Investigar
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};