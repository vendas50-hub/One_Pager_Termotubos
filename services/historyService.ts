import { supabase } from '../lib/supabaseClient';
import { AnalysisResult } from '../types';

export const fetchHistory = async (): Promise<AnalysisResult[]> => {
  const { data, error } = await supabase
    .from('one_pagers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: `#${String(item.id).padStart(2, '0')}`,
    companyName: item.company_name,
    markdownContent: item.markdown_content,
    sources: item.sources || [],
    structuredData: item.structured_data
  }));
};

export const saveReport = async (result: AnalysisResult) => {
  // We remove the ID from the object we send, letting the DB auto-increment it
  const { data, error } = await supabase
    .from('one_pagers')
    .insert([
      {
        company_name: result.companyName,
        markdown_content: result.markdownContent,
        sources: result.sources,
        structured_data: result.structuredData
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error saving report:', error);
    throw error;
  }
  
  return data;
};