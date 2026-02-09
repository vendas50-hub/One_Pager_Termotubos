import React from 'react';
import { KeyRound } from 'lucide-react';

interface ApiKeyPromptProps {
  onOpenDialog: () => void;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onOpenDialog }) => {
  return (
    <div 
      className="mx-auto my-8 max-w-2xl rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-center text-yellow-100 shadow-lg animate-fade-in-down"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-center mb-3">
        <KeyRound className="h-6 w-6 mr-2 text-yellow-400" />
        <h4 className="font-semibold text-lg">Chave API Necessária</h4>
      </div>
      <p className="text-sm mb-4">
        Parece que você precisa selecionar uma Chave API válida ou sua cota foi excedida.
        Por favor, selecione uma chave de um projeto GCP com faturamento ativado.
      </p>
      <button
        onClick={onOpenDialog}
        className="inline-flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        <KeyRound className="h-4 w-4" />
        Selecionar Chave API
      </button>
      <p className="mt-3 text-xs text-yellow-200 opacity-80">
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="underline hover:text-white"
        >
          Entenda o faturamento do Gemini API
        </a>
      </p>
    </div>
  );
};