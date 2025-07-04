import { OpenAIClient } from './openaiClient.js';

export async function chatCompletions(chatML, API_TOKEN) {
  const client = new OpenAIClient(API_TOKEN);
  
  try {
    return await client.chatCompletion(chatML, 'gpt-4o');
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}