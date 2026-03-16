import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult } from '../types';
import { FileText, ExternalLink, Target, CheckCircle2 } from 'lucide-react';

interface CompanyReportProps {
  data: AnalysisResult;
  onUpdate: (newInfo: string) => Promise<void>;
  isUpdating: boolean;
}

export const CompanyReport: React.FC<CompanyReportProps> = ({ data, onUpdate, isUpdating }) => {
  const [fieldInfo, setFieldInfo] = useState('');

  const handleUpdateClick = async () => {
    if (!fieldInfo.trim() || isUpdating) return;
    await onUpdate(fieldInfo);
    setFieldInfo('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      
      {/* Left Column: Summary Card */}
      <div className="lg:col-span-3 space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
          <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="text-blue-400 h-5 w-5" />
              <h3 className="font-semibold text-white">Relatório Técnico</h3>
            </div>

            {/* Field Update Input Group */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={fieldInfo}
                onChange={(e) => setFieldInfo(e.target.value)}
                placeholder="Descobriu algo novo? (Ex: Não fazem mais painéis)"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isUpdating}
              />
              <button
                onClick={handleUpdateClick}
                disabled={!fieldInfo.trim() || isUpdating}
                className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
              >
                {isUpdating ? 'Atualizando...' : 'Atualizar Dados'}
              </button>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none p-6 sm:p-8">
            <ReactMarkdown
              components={{
                h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2 mt-6 first:mt-0" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-blue-300 mt-6 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed mb-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-none space-y-2 my-4 pl-0" {...props} />,
                li: ({node, ...props}) => (
                  <li className="flex gap-2 text-slate-300" {...props}>
                    <span className="text-blue-500 mt-1.5">•</span>
                    <span>{props.children}</span>
                  </li>
                ),
                strong: ({node, ...props}) => <strong className="font-semibold text-white bg-blue-500/10 px-1 rounded" {...props} />,
                code: ({node, ...props}) => (
                  <code className="block w-full overflow-x-auto rounded-lg bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-green-400 my-4" {...props} />
                ),
              }}
            >
              {data.markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Right Column: Actions & Sources */}
      <div className="space-y-6 lg:col-span-1">
        
        {/* Quick Actions Card */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <h4 className="flex items-center gap-2 font-semibold text-white mb-4">
            <Target className="h-5 w-5 text-green-400" />
            Checklist Técnico
          </h4>
          <div className="space-y-3">
             <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">Validar "Hipóteses de Uso" com engenharia do cliente.</p>
             </div>
             <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">Solicitar amostra técnica baseada no "Potencial de Compra".</p>
             </div>
          </div>
        </div>

        {/* Sources Card */}
        {data.sources.length > 0 && (
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <h4 className="flex items-center gap-2 font-semibold text-white mb-4">
              <ExternalLink className="h-5 w-5 text-purple-400" />
              Fontes Técnicas
            </h4>
            <ul className="space-y-3">
              {data.sources.slice(0, 5).map((source, idx) => (
                <li key={idx}>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group block rounded-lg border border-slate-800 bg-slate-950 p-3 transition hover:border-blue-500/50 hover:bg-slate-800"
                  >
                    <p className="line-clamp-2 text-xs font-medium text-slate-300 group-hover:text-white">
                      {source.title || source.url}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-slate-500">
                      {new URL(source.url).hostname}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};