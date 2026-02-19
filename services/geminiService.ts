import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, StructuredData, ApiKeyError } from '../types';

export const generateSalesAnalysis = async (companyName: string, nextId: string): Promise<AnalysisResult> => {
  try {
    // CRITICAL: Initialize GoogleGenAI right before the call to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using flash-preview for speed and search capability
    const modelId = 'gemini-3-flash-preview'; 

    const prompt = `
      Você é o "Termotubos Sales Intel", uma IA Especialista em Inteligência Comercial e Engenharia de Aplicação.
      Sua missão é investigar empresas, identificar fit técnico real e classificar o potencial de compra segundo a metodologia Termotubos.

      **CONTEXTO DO PRODUTO:**
      Vendemos Termotubos (espaguetes termoencolhíveis), isolantes elétricos, vedação e proteção para fios/cabos.
      * **Foco Técnico:** Chicotes elétricos, Painéis de Comando, Automação, Energia Solar, Manutenção Industrial (MRO), Telecom.

      ---

      **🕵️‍♂️ PROTOCOLO DE INVESTIGAÇÃO & REGRAS DE NEGÓCIO:**

      **PASSO 1: GOOGLE SEARCH PROFUNDO (Técnico + Negócio)**
      Ao receber o nome de uma empresa: "${companyName}", você deve investigar:
      1.  **O que eles fabricam/fazem?** Busque produtos, catálogo e "quem somos".
      2.  **Sinais de Consumo (Fit Técnico):** Procure palavras-chave como: "Fabricação de máquinas", "Montagem de painéis", "Instalação elétrica", "Manutenção de frota", "Chicotes".
      3.  **Dados de Porte (Firmographics):** Busque número de funcionários, unidades fabris e presença no mercado.

      **PASSO 2: CLASSIFICAÇÃO PELA METODOLOGIA (Cruzamento de Dados)**

      * **MATRIZ DE ICP (Tipo de Uso):**
          * **ICP A - Reposição (Ouro):** Produção contínua ou Manutenção frequente. (Ex: Montadoras, Linha Branca).
          * **ICP B - Projeto:** Engenharia, Integradores. Compra grandes lotes, mas esporadicamente.
          * **ICP C - Revenda/Pontual:** Comércio ou uso irrelevante.

      * **MATRIZ DE TIER (Prioridade = Fit + Porte):**
          * **TIER 1 (Alta Prioridade):** Alta capacidade de contratos recorrentes e previsibilidade de demanda.
          * **TIER 2 (Média):** Médio Porte ou Pequena com ICP A (Recorrente).
          * **TIER 3 (Baixa):** Pequenas empresas sem recorrência ou Baixo Fit.

      * **DIRECIONAMENTO DE CARTEIRA (Roteamento Interno):**
          * **Ecommerce:** Clientes menores, revendas, compras pontuais ou baixo potencial de recorrência (Geralmente Tier 3 ou ICP C).
          * **Carteira Nível 4 e 5 (Inside Sales):** Clientes médios, manutenção de rotina, compras recorrentes de menor ticket ou Tier 2.
          * **Carteira Nível 1, 2 e 3 (Key Accounts):** Grandes contas, alto potencial de volume, contratos globais, Tier 1.

      ---

      **FORMATO DE RESPOSTA (ONE PAGER COMPLETO):**

      ## 🎯 [#${nextId}] Dossiê de Inteligência: ${companyName}

      **1. 🏭 Raio-X da Empresa & Porte**
      * **O que fazem:** (Resumo focado na operação industrial/técnica).
      * **Porte Estimado:** [Grande (+500 func) / Médio / Pequeno]
      * **Estrutura:** (Ex: Matriz + 2 fábricas).

      **2. 🔌 Análise de Fit & Sinergia (O "Porquê")**
      * **Nível de Fit:** [0 a 10]
      * **Aplicação Técnica Detectada:** (Onde EXATAMENTE o termotubo entra? Ex: "Isolamento de barramentos nos quadros elétricos que eles vendem").
      * **Produtos Potenciais:** (Liste: Termotubo, Malha, Fita, Identificação).

      **3. 🧠 Classificação Estratégica (Metodologia)**
      * **ICP:** [ICP A / B / C]
      * **Persona Provável:** [Baleia Técnica (Engenharia) / Comprador Operacional / Price-Driven]
      * **TIER FINAL:** [1 / 2 / 3]

      **4. ⚔️ Plano de Abordagem (SDR)**
      * **Dor Latente:** (Ex: "Parada de linha" ou "Risco de reprovação técnica em obra").
      * **Gancho de Venda:** (Uma notícia recente ou projeto citado no site para quebrar o gelo).
      * **Pergunta de Validação:** (Uma pergunta técnica para qualificar o lead).

      **5. 🧭 Direcionamento & Previsibilidade (Sales Ops)**
      * **Roteamento Sugerido:** [Ecommerce / Carteira Nível 4-5 / Carteira Nível 1-3]
          * *Justificativa:* (Ex: "Redirecionar para Carteira Nível 2 pois possui 3 fábricas e demanda constante de manutenção").
      * **Perfil de Consumo:** (Recorrente / Sazonal / Pontual).
      * **Tempo Médio de Compra (Estimado):** (Ex: "Mensal (Produção Contínua)" ou "Trimestral (Por Lote)").
      * **Média de Consumo:** (Baixa / Média / Alta).

      **6. 💾 Dados Técnicos (JSON Oculto)**
      Gere um bloco JSON estrito. NÃO use markdown dentro do JSON.
      \`\`\`json
      {
        "company_name": "${companyName}",
        "fit_score": 0,
        "size_category": "Grande/Media/Pequena",
        "icp_type": "A/B/C",
        "tier": 1,
        "application_hypothesis": "Texto curto sobre uso",
        "suggested_portfolio": "Ecommerce, Nível 1-3 ou Nível 4-5",
        "purchase_frequency": "Mensal/Trimestral/Pontual",
        "id_ref": "#${nextId}"
      }
      \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "text/plain",
      },
    });

    const text = response.text || "Não foi possível gerar a análise. Tente novamente.";
    
    // Extract JSON block
    let structuredData: StructuredData | undefined;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        structuredData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.warn("Failed to parse JSON from response", e);
      }
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => {
        if (chunk.web) {
          return { title: chunk.web.title, url: chunk.web.uri };
        }
        return null;
      })
      .filter((s: any) => s !== null) as { title: string; url: string }[];

    return {
      id: `#${nextId}`,
      companyName,
      markdownContent: text,
      sources,
      structuredData
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.error?.code === 429 && error.error?.status === "RESOURCE_EXHAUSTED") {
      throw new ApiKeyError("Você excedeu sua cota atual. Por favor, selecione uma chave API paga.");
    }
    throw new Error("Falha ao processar análise. Verifique a API Key.");
  }
};