export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface StructuredData {
  company_name: string;
  fit_score: number; // 0-10
  size_category: string; // 'Grande', 'Media', 'Pequena'
  icp_type: string; // 'A', 'B', 'C'
  tier: number | string; // 1, 2, 3
  application_hypothesis: string; // Short text about usage
  suggested_portfolio: string; // 'Ecommerce', 'Nível 1-3', 'Nível 4-5'
  purchase_frequency: string; // 'Mensal', 'Semestral', 'Pontual'
  id_ref: string; // e.g., '#01'
}

export interface AnalysisResult {
  id: string; // Internal ID for state management
  companyName: string;
  markdownContent: string;
  sources: { title: string; url: string }[];
  structuredData?: StructuredData;
}

export enum SalesStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

// Custom error for API key issues
export class ApiKeyError extends Error {
  constructor(message: string = "API Key inválida ou excedeu a cota.") {
    super(message);
    this.name = "ApiKeyError";
  }
}

// Global declaration for window.aistudio
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    }; 
  }
}