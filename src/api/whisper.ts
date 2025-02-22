
import { supabase } from '../lib/supabase'

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Convert Blob to base64
    const base64Audio = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        const base64 = base64String.split(',')[1]
        resolve(base64)
      }
      reader.readAsDataURL(audioBlob)
    })

    const { data, error } = await supabase.functions.invoke('transcribe', {
      body: { audio: base64Audio }
    })

    if (error) {
      console.error('Supabase function error:', error)
      throw error
    }

    if (!data) {
      throw new Error('No transcription data received')
    }

    if (Array.isArray(data)) {
      return data[0]?.text || ''
    } else if (typeof data === 'object' && 'text' in data) {
      return data.text
    }
    
    throw new Error('Invalid transcription response format')
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw error
  }
} 
