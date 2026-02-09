import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { History, LayoutList, Hash, Building2, Gauge, Eye, Search } from 'lucide-react';

interface SessionHistoryProps {
  history: AnalysisResult[];
  onRecall: (item: AnalysisResult) => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ history, onRecall }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (history.length === 0) return null;

  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase();
    const company = item.companyName.toLowerCase();
    const id = (item.structuredData?.id_ref || item.id).toLowerCase();
    const hypothesis = (item.structuredData?.application_hypothesis || '').toLowerCase();
    
    return company.includes(term) || id.includes(term) || hypothesis.includes(term);
  });

  return (
    <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">🗃️ Histórico da Sessão</h3>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-sm text-slate-300 placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Buscar empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-900/50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-center w-16">ID</th>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3 text-center">Fit Score</th>
              <th className="px-4 py-3 text-center">Tier</th>
              <th className="px-4 py-3">Hipótese de Uso</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredHistory.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Nenhum resultado encontrado para "{searchTerm}"
                    </td>
                </tr>
            ) : (
                filteredHistory.map((item, index) => {
                  const data = item.structuredData;
                  const idDisplay = data?.id_ref || item.id;
                  
                  let tierColor = 'text-slate-400 bg-slate-800/50';
                  const tierStr = String(data?.tier || '');
                  if (tierStr.includes('1')) tierColor = 'text-green-400 bg-green-500/10';
                  if (tierStr.includes('2')) tierColor = 'text-blue-400 bg-blue-500/10';
                  if (tierStr.includes('3')) tierColor = 'text-yellow-400 bg-yellow-500/10';

                  // Fit Score Coloring
                  const score = typeof data?.fit_score === 'number' ? data.fit_score : 0;
                  let scoreColor = 'text-slate-500';
                  if (score >= 8) scoreColor = 'text-green-400 font-bold';
                  else if (score >= 5) scoreColor = 'text-yellow-400 font-medium';
                  else if (score > 0) scoreColor = 'text-red-400';

                  return (
                    <tr key={index} className="group transition hover:bg-slate-800/30">
                      <td className="px-4 py-4 text-center font-mono text-xs text-slate-500">
                        {idDisplay}
                      </td>
                      <td className="px-4 py-4 font-medium text-white">
                        {data?.company_name || item.companyName}
                        {data?.size_category && (
                           <span className="ml-2 inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-normal text-slate-400">
                             {data.size_category}
                           </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {data ? (
                           <div className="flex items-center justify-center gap-1">
                             <Gauge className={`h-3 w-3 ${scoreColor}`} />
                             <span className={scoreColor}>{score}/10</span>
                           </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                       <td className="px-4 py-4 text-center">
                        {data ? (
                          <div className={`mx-auto inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${tierColor}`}>
                            {data.tier}
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-300">
                         {data?.application_hypothesis || "Sem dados"}
                      </td>
                      <td className="px-4 py-4 text-right">
                         <button
                            onClick={() => onRecall(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver
                          </button>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};