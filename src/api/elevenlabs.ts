import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const textToSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text }
    })

    if (error) throw error

    // Convert the base64 string back to ArrayBuffer
    const binaryString = atob(data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  } catch (error) {
    console.error('Error converting text to speech:', error)
    throw error
  }
} 