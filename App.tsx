import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Search, Sparkles } from 'lucide-react';
import { CompanyReport } from './components/CompanyReport';
import { SearchInput } from './components/SearchInput';
import { LoadingState } from './components/LoadingState';
import { SessionHistory } from './components/SessionHistory';
import { generateSalesAnalysis, updateSalesAnalysis } from './services/geminiService';
import { fetchHistory, saveReport } from './services/historyService';
import { AnalysisResult, ApiKeyError } from './types';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState(true); // Assume true initially
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false); // Only show if needed

  // Load history from Supabase on mount and check API Key status
  useEffect(() => {
    const loadInitialData = async () => {
      const historyData = await fetchHistory();
      setHistory(historyData);

      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
        setShowApiKeyPrompt(!hasKey);
      } else {
        // If aistudio is not available, assume API_KEY env var is the only mechanism
        setApiKeySelected(true);
        setShowApiKeyPrompt(false);
      }
    };
    loadInitialData();
  }, []);

  const handleSearch = async (term: string) => {
    if (!term.trim()) return;

    setError(null);
    setShowApiKeyPrompt(false); // Hide prompt on new search attempt

    // FEATURE: "Ver #ID" Recall System
    // Checks if the user is trying to recall a previous report
    const recallMatch = term.match(/^ver\s*#?(\d+)$/i);
    if (recallMatch) {
      const idToFind = `#${recallMatch[1]}`; // e.g., #01
      const found = history.find(h => h.id === idToFind || h.structuredData?.id_ref === idToFind);
      
      if (found) {
        setResult(found);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else {
        setError(`Relatório ${idToFind} não encontrado no histórico.`);
        return;
      }
    }

    // FEATURE: Instant Memory Recall (Name Match)
    const searchTermNormalized = term.trim().toLowerCase();
    const memoryMatch = history.find(h => 
      h.companyName.toLowerCase() === searchTermNormalized || 
      searchTermNormalized.includes(h.companyName.toLowerCase())
    );

    if (memoryMatch) {
      setLoading(true);
      setTimeout(() => {
        setResult({
          ...memoryMatch,
          markdownContent: memoryMatch.markdownContent.replace(
            "**1. Status:**", 
            "**1. Status:** [💾 Recuperado da Base de Dados]"
          )
        });
        setLoading(false);
      }, 400); 
      return;
    }

    // Normal Search Flow
    setLoading(true);
    setResult(null);

    try {
      // Generate Next ID based on history length
      const nextIdNum = history.length + 1;
      const nextId = nextIdNum.toString().padStart(2, '0');

      const data = await generateSalesAnalysis(term, nextId);
      
      // Save to Supabase
      const savedRecord = await saveReport(data);
      
      // Update data with real DB ID if needed, or just keep consistency
      const finalData = {
        ...data,
        id: `#${String(savedRecord.id).padStart(2, '0')}`
      };

      setResult(finalData);
      
      setHistory(prev => {
        return [finalData, ...prev];
      });
      setApiKeySelected(true); // If successful, API key is likely valid
    } catch (err) {
      if (err instanceof ApiKeyError) {
        setError(err.message);
        setApiKeySelected(false);
        setShowApiKeyPrompt(true); // Show API key prompt
      } else {
        setError(err instanceof Error ? err.message : "Ocorreu um erro ao analisar a empresa.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (newInfo: string) => {
    if (!result) return;
    
    setIsUpdating(true);
    setError(null);

    try {
      const updatedData = await updateSalesAnalysis(result, newInfo);
      
      // Save updated report to Supabase
      const savedRecord = await saveReport(updatedData);
      
      const finalData = {
        ...updatedData,
        id: `#${String(savedRecord.id).padStart(2, '0')}`
      };

      setResult(finalData);
      
      // Update history
      setHistory(prev => {
        const filtered = prev.filter(h => h.companyName !== finalData.companyName);
        return [finalData, ...filtered];
      });

    } catch (err) {
      if (err instanceof ApiKeyError) {
        setError(err.message);
        setApiKeySelected(false);
        setShowApiKeyPrompt(true);
      } else {
        setError(err instanceof Error ? err.message : "Ocorreu um erro ao atualizar a análise.");
      }
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecall = (item: AnalysisResult) => {
    setResult(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenApiKeyDialog = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        setApiKeySelected(true); // Assume success based on guidelines
        setShowApiKeyPrompt(false); // Hide the prompt
        setError(null); // Clear any related error messages
      } catch (e) {
        console.error("Failed to open API Key dialog:", e);
        setError("Não foi possível abrir o diálogo de seleção da Chave API. Tente novamente.");
      }
    } else {
      setError("Funcionalidade de seleção de chave API indisponível.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-green-500 shadow-lg shadow-blue-900/20">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Termotubos</h1>
              <p className="text-xs font-medium text-blue-400">Intel AI - One Pager</p>
            </div>
          </div>
          <div className="hidden text-sm text-slate-400 sm:block">
            Powered by Gemini 2.0
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero / Search Section */}
        <div className={`transition-all duration-500 ease-in-out ${result || history.length > 0 || showApiKeyPrompt ? 'mb-8' : 'flex min-h-[60vh] flex-col justify-center'}`}>
          <div className="text-center">
            {(!result && history.length === 0 && !loading && !showApiKeyPrompt) && (
              <>
                <h2 className="bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                  Geração de One Pager
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
                  Digite o nome da empresa para classificar ICP e Persona. <br/>
                  <span className="text-sm opacity-60">Comandos: "WEG", "Marcopolo", ou "Ver #01"</span>
                </p>
              </>
            )}
            
            <div className={`mx-auto mt-8 w-full max-w-2xl ${result || history.length > 0 || showApiKeyPrompt ? 'mt-0' : ''}`}>
              <SearchInput onSearch={handleSearch} isLoading={loading} />
            </div>
          </div>
        </div>

        {/* API Key Prompt */}
        {showApiKeyPrompt && (
          <ApiKeyPrompt onOpenDialog={handleOpenApiKeyDialog} />
        )}

        {/* Content Area */}
        <div className="relative min-h-[200px] space-y-12">
          {loading && <LoadingState />}
          
          {error && (
            <div className="mx-auto mt-8 w-full max-w-2xl rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center text-red-400">
              <p>{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-fade-in-up">
              <CompanyReport 
                data={result} 
                onUpdate={handleUpdate} 
                isUpdating={isUpdating} 
              />
            </div>
          )}

          {/* Session History */}
          {!loading && history.length > 0 && (
            <div className="animate-fade-in">
              <SessionHistory history={history} onRecall={handleRecall} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Termotubos Intel AI. Uso interno.</p>
      </footer>
    </div>
  );
};

export default App;