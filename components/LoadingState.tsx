import React, { useEffect, useState } from 'react';
import { ScanSearch, Globe, BrainCircuit } from 'lucide-react';

const MESSAGES = [
  { icon: Globe, text: "Escaneando a web..." },
  { icon: ScanSearch, text: "Analisando modelo de negócio..." },
  { icon: BrainCircuit, text: "Calculando sinergia com Termotubos..." },
];

export const LoadingState: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const ActiveIcon = MESSAGES[msgIndex].icon;

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20 duration-1000"></div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 shadow-xl shadow-blue-500/10 border border-slate-700">
          <ActiveIcon className="h-10 w-10 animate-pulse text-blue-400" />
        </div>
      </div>
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-medium text-white animate-fade-in">
          {MESSAGES[msgIndex].text}
        </h3>
        <p className="text-sm text-slate-500">Isso pode levar alguns segundos</p>
      </div>
      
      {/* Skeleton Lines */}
      <div className="mt-12 w-full max-w-md space-y-3 opacity-30">
        <div className="h-2 w-full rounded bg-slate-600"></div>
        <div className="h-2 w-3/4 rounded bg-slate-600"></div>
        <div className="h-2 w-5/6 rounded bg-slate-600"></div>
      </div>
    </div>
  );
};