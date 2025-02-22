import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

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
