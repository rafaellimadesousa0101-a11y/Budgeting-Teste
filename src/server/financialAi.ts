/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

// Rate limiting in-memory storage per user UID
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const userRateLimits = new Map<string, RateLimitRecord>();
const MAX_REQUESTS_PER_WINDOW = 25; // 25 queries per hour per user
const WINDOW_DURATION_MS = 60 * 60 * 1000; // 1 hour

function checkAndConsumeRateLimit(userId: string): { allowed: boolean; remaining: number; resetInMinutes: number } {
  const now = Date.now();
  const record = userRateLimits.get(userId);

  if (!record || now >= record.resetTime) {
    userRateLimits.set(userId, {
      count: 1,
      resetTime: now + WINDOW_DURATION_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInMinutes: 60 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetInMinutes = Math.max(1, Math.ceil((record.resetTime - now) / 60000));
    return { allowed: false, remaining: 0, resetInMinutes };
  }

  record.count += 1;
  const resetInMinutes = Math.max(1, Math.ceil((record.resetTime - now) / 60000));
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetInMinutes };
}

function rollbackRateLimit(userId: string) {
  const record = userRateLimits.get(userId);
  if (record && record.count > 0) {
    record.count -= 1;
  }
}

export async function processFinancialAiQuestion(body: any, headers: Record<string, string | string[] | undefined>): Promise<{
  success: boolean;
  status: number;
  answer?: string;
  remaining?: number;
  error?: string;
}> {
  const { userId, prompt, financialContext } = body || {};

  try {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return {
        success: false,
        status: 401,
        error: 'Acesso negado: Usuário não autenticado no Firebase.',
      };
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return {
        success: false,
        status: 400,
        error: 'Pergunta vazia ou inválida.',
      };
    }

    // App Check validation (Firebase App Check token from client)
    const appCheckToken = headers['x-firebase-appcheck'];
    if (process.env.REQUIRE_APP_CHECK === 'true' && !appCheckToken) {
      return {
        success: false,
        status: 403,
        error: 'Acesso não autorizado pelo Firebase App Check.',
      };
    }

    // Rate Limiting per user UID
    const rateCheck = checkAndConsumeRateLimit(userId);
    if (!rateCheck.allowed) {
      return {
        success: false,
        status: 429,
        remaining: 0,
        error: `Limite de uso atingido (${MAX_REQUESTS_PER_WINDOW} consultas/hora). Tente novamente em aproximadamente ${rateCheck.resetInMinutes} minuto(s).`,
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      rollbackRateLimit(userId);
      return {
        success: false,
        status: 500,
        error: 'Chave GEMINI_API_KEY não configurada no servidor.',
      };
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `
Você é o Assistente Financeiro Inteligente do aplicativo de finanças Budgeting.
Sua missão é ajudar o usuário a entender, controlar e otimizar suas finanças pessoais com clareza, empatia e precisão matemática.

REGRA FUNDAMENTAL DOS PAGAMENTOS PREVISTOS (RESERVA FINANCEIRA):
- REGRA CRÍTICA DO SALDO RESTANTE: No aplicativo Budgeting, os "Pagamentos Previstos" (despesas pendentes/agendadas) JÁ SÃO AUTOMATICAMENTE DESCONTADOS do "Saldo Restante" do mês corrente.
- CONCEITO DA RESERVA FINANCEIRA: O pagamento previsto funciona como uma RESERVA FINANCEIRA garantida antecipadamente. Isso assegura que o "Saldo Restante" reflita com máxima fidelidade e segurança apenas o montante que o usuário ainda tem efetivamente disponível e livre para gastar no mês, sem perigo de gastar o dinheiro já comprometido com contas futuras.
- FÓRMULA DO SALDO RESTANTE:
  Saldo Restante = (Renda/Saldo Inicial + Receitas do Mês) - (Despesas Efetivadas/Pagas + Pagamentos Previstos/Reservas).
- AO RESPONDER SOBRE SALDO OU CONTAS PENDENTES:
  * Deixe sempre claro ao usuário que suas contas previstas já estão reservadas e deduzidas do saldo restante.
  * Quando ele efetivar/pagar uma conta prevista, o saldo restante não diminuirá novamente, pois o valor já estava provisionado na reserva financeira.
  * Quando questionado sobre "quanto ainda posso gastar?", a resposta é exatamente o Saldo Restante calculado (currentBalance).

DIRETRIZES DE SEGURANÇA E ISOLAMENTO:
- Você tem acesso EXCLUSIVO aos dados financeiros deste usuário específico (${userId}).
- Jamais faça referência ou suponha dados de outros usuários.
- Baseie todas as suas respostas estritamente no contexto financeiro fornecido nesta mensagem. Se algo não estiver no contexto, explique com transparência que não há registros correspondentes.

REGRAS DE FORMATAÇÃO E ESTILO:
- Responda sempre em português do Brasil (pt-BR).
- Formate todos os valores monetários no padrão brasileiro com símbolo de Real (exemplo: R$ 1.250,00 ou R$ 42,90).
- Seja conciso, direto e amigável. Use tópicos e listas com marcadores para facilitar a leitura.
- Ao detalhar gastos por categoria, mostre os valores e porcentagens se relevante.
- Destaque os pagamentos previstos como reservas asseguradas e mostre as datas de vencimento/descrições caso o usuário pergunte sobre contas pendentes.
- Destaque o progresso de Caixinhas e Metas quando o usuário perguntar sobre economia ou poupança.
- Se o usuário pedir dicas de economia, analise as categorias com maiores gastos no contexto e sugira ações práticas realistas.
`;

    const userPromptContent = `
[DADOS FINANCEIROS DO USUÁRIO]
${JSON.stringify(financialContext || {}, null, 2)}

[PERGUNTA DO USUÁRIO]
${prompt.trim()}
`;

    // Cascade models: primary flagship, fallback lightweight, fallback stable
    const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;
    let answer = '';

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userPromptContent,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        if (response && response.text) {
          answer = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isHighDemandOrUnavailable =
          errMsg.includes('503') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('overloaded');

        if (isHighDemandOrUnavailable) {
          console.warn(`Modelo ${model} indisponível por alta demanda (503). Tentando modelo alternativo...`);
          // Short pause before falling back to next model
          await new Promise((res) => setTimeout(res, 600));
          continue;
        } else {
          // If other fatal error (e.g. auth), break immediately
          break;
        }
      }
    }

    if (!answer) {
      if (userId) rollbackRateLimit(userId);
      const isHighDemand =
        lastError?.message?.includes('503') ||
        lastError?.message?.includes('high demand') ||
        lastError?.message?.includes('UNAVAILABLE') ||
        lastError?.status === 503;

      return {
        success: false,
        status: isHighDemand ? 503 : 500,
        error: isHighDemand
          ? 'Os servidores de IA estão temporariamente com alta demanda. Por favor, aguarde alguns instantes e tente novamente.'
          : (lastError?.message || 'Erro ao processar consulta com o assistente.'),
      };
    }

    return {
      success: true,
      status: 200,
      answer,
      remaining: rateCheck.remaining,
    };
  } catch (err: any) {
    if (userId) rollbackRateLimit(userId);
    console.error('Erro no assistente financeiro Gemini:', err);
    const isHighDemand =
      err?.message?.includes('503') ||
      err?.message?.includes('high demand') ||
      err?.message?.includes('UNAVAILABLE') ||
      err?.status === 503;

    return {
      success: false,
      status: isHighDemand ? 503 : 500,
      error: isHighDemand
        ? 'Os servidores de IA estão temporariamente com alta demanda. Por favor, aguarde alguns instantes e tente novamente.'
        : (err?.message || 'Erro ao processar consulta com o assistente de IA.'),
    };
  }
}
