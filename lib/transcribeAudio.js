import { OpenAIClient } from './openaiClient.js';

export async function transcribeAudio(mp3Blob, apiKey) {
  const client = new OpenAIClient(apiKey);
  
  try {
    return await client.transcribe(mp3Blob);
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}