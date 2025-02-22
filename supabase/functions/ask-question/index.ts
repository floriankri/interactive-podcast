import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

serve(async (req) => {
  try {
    const { question, transcript } = await req.json()
    
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'mistral-medium',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions about a podcast transcript. Use the provided transcript as context for your answers. Give the answers as short as possible, not more than 100 words.',
          },
          {
            role: 'user',
            content: `Context: ${transcript}\n\nQuestion: ${question}`,
          },
        ],
      }),
    })

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}) 