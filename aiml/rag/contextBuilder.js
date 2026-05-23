import { semanticSearch } from './semanticSearch.js';

/**
 * Builds structured markdown context strings from relevant user documents matched by the query
 * @param {string} userId - User ID
 * @param {string} userQuery - Natural language query
 * @returns {Promise<string>}
 */
export async function buildContext(userId, userQuery) {
  try {
    const hits = await semanticSearch(userId, userQuery);
    if (hits.length === 0) return "No explicitly matching financial records found in user knowledge base.";

    let context = "### SEMANTICALLY RETRIEVED HIGH-RELEVANCE LEDGER RECORDS\n";
    
    hits.forEach((hit, idx) => {
      const data = hit.data;
      if (hit.type === 'transaction') {
        context += `- [Transaction] Merchant: ${data.merchant}, Amount: ₹${data.amount}, Category: ${data.category}, Date: ${new Date(data.date).toLocaleDateString()}, Description: ${data.description || 'N/A'} (Relevance: ${Math.round(hit.score * 100)}%)\n`;
      } else if (hit.type === 'invoice') {
        context += `- [Invoice] Merchant: ${data.merchantName}, Total: ₹${data.totalAmount}, Issued: ${data.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString() : 'N/A'}, OCR Summary: ${hit.text.substring(0, 150)}... (Relevance: ${Math.round(hit.score * 100)}%)\n`;
      } else if (hit.type === 'budget') {
        context += `- [Budget Ring] Category: ${data.category}, Max Limit: ₹${data.limit}, Target Month: ${data.month}/${data.year} (Relevance: ${Math.round(hit.score * 100)}%)\n`;
      }
    });

    return context;
  } catch (error) {
    console.error("Error building context in contextBuilder:", error);
    return "Failed to build RAG semantic context.";
  }
}
