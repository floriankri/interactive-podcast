
import { supabase } from '../lib/supabase'

export const askQuestion = async (
  question: string,
  transcript: string
): Promise<string> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const { data, error } = await supabase.functions.invoke('ask-question', {
      body: { question, transcript },
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    })

    if (error) throw error

    return data.choices[0].message.content || 'No response received'
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}
