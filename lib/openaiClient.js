export class OpenAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async makeRequest(endpoint, method, data, customHeaders = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...customHeaders
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error calling OpenAI API (${endpoint}):`, error);
      throw error;
    }
  }

  async chatCompletion(messages, model = 'gpt-4') {
    return this.makeRequest('/chat/completions', 'POST', {
      model,
      messages,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });
  }

  async transcribe(audioBlob, model = 'whisper-1', language = 'ja') {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model', model);
    formData.append('language', language);

    const response = await fetch(`${this.baseURL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async textToSpeech(input, voice = 'alloy', model = 'tts-1') {
    const response = await fetch(`${this.baseURL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        input,
        voice
      })
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}