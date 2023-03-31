const API_URL = 'https://api.openai.com/v1/chat/completions'

export async function chatCompletions(chatML, API_TOKEN) {
  const data = {
    model: 'gpt-3.5-turbo',
    messages: chatML,
  }

  const config = {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  }

  try {
    const response = await axios.post(API_URL, data, config)
    return response.data
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}
