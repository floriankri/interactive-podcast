// deno-lint-ignore-file
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// @ts-ignore: Deno types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/openai/whisper-large-v3'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const audioBlob = await req.blob()
    
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('HUGGINGFACE_API_KEY')}`,
        'Content-Type': 'audio/webm',
      },
      body: audioBlob,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 