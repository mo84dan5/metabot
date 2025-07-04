import { OpenAIClient } from './openaiClient.js';

export async function textToSpeech(apiKey, text, voice = 'alloy') {
  const client = new OpenAIClient(apiKey);
  
  try {
    return await client.textToSpeech(text, voice);
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}