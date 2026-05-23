import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildContext } from '../rag/contextBuilder.js';
import { financialCopilotSystemPrompt } from '../prompts/chatPrompts.js';
import { chatWithContextLocally } from '../services/gemini.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Advanced autonomous financial co-pilot coordinator.
 * Merges memory, dynamic retrieved contexts, and Gemini models.
 * @param {object} params 
 * @returns {Promise<string>}
 */
export async function chatAssistant({ userId, userMessage, chatHistory = [], transactionsContext = [], budgetsContext = [] }) {
  try {
    // 1. Build context via RAG similarity search matching the message
    const ragContext = await buildContext(userId, userMessage);
    
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `
      ${financialCopilotSystemPrompt}
      
      ### LIVE SENSITIVE CONTEXT DATA
      ${ragContext}
      
      ### ADDITIONAL STATISTICAL LEDGER DATA
      Transactions: ${JSON.stringify(transactionsContext, null, 2)}
      Budgets: ${JSON.stringify(budgetsContext, null, 2)}
      
      ### CHAT DIALOGUE HISTORY
      ${chatHistory.map(h => `${h.role === 'user' ? 'User' : 'FINCE AI'}: ${h.content}`).join('\n')}
      
      User Message: "${userMessage}"
      
      Generate a premium, data-aware, professional response:
      `;

      const response = await model.generateContent(prompt);
      const resText = response.response;
      return typeof resText.text === 'function' ? resText.text() : resText.text;
    }
  } catch (error) {
    console.warn("Autonomous financial copilot failed, running local assistant parser:", error.message);
  }

  // Fallback to high quality rule engine
  return chatWithContextLocally(userMessage, transactionsContext, budgetsContext);
}
