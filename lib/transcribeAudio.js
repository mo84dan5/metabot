const API_URL = 'https://api.openai.com/v1/audio/transcriptions'

export async function transcribeAudio(mp3Blob, API_TOKEN) {
  const formData = new FormData()
  formData.append('file', mp3Blob, 'openai.mp3')
  formData.append('model', 'whisper-1')

  const config = {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'multipart/form-data',
    },
  }

  try {
    const response = await axios.post(API_URL, formData, config)
    return response.data
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}
