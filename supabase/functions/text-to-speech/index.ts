// @deno-types="https://deno.land/x/types/index.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech'
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'

serve(async (req) => {
  try {
    const { text } = await req.json()
    
    const response = await fetch(`${ELEVENLABS_API_URL}/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY') || '',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    return new Response(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}) 