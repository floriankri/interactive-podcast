
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('transcribe', {
      body: audioBlob
    })

    if (error) throw error

    if (Array.isArray(data)) {
      return data[0]?.text || ''
    } else if (typeof data === 'object' && data.text) {
      return data.text
    }
    
    return ''
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw error
  }
} 
