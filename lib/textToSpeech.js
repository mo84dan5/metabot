/**
 * OpenAIのText-to-Speech APIを使ってテキストを音声に変換します。
 * @param apiKey - OpenAIのAPIキー。
 * @param text - 音声に変換するテキスト。
 * @param voice - 使用する音声モデルの名前。
 * @returns 音声データのURLをPromiseで返します。
 */

async function textToSpeech(apiKey, text, voice) {
  const url = 'https://api.openai.com/v1/audio/speech'
  const data = {
    model: 'tts-1',
    input: text,
    voice: voice,
  }

  try {
    // fetch APIを使用してリクエストを送信します
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // レスポンスの内容（バイナリデータ）をBlobとして取得します
    const blob = await response.blob()

    // Blobを利用してMP3ファイルを作成します
    const url2 = URL.createObjectURL(blob)
    console.log(`MP3 file created: ${url2}`)
    return url2
  } catch (error) {
    console.error('Error in textToSpeech:', error)
  }
}

export { textToSpeech }
