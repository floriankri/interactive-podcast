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
    const apiKey = Deno.env.get('HUGGINGFACE_API_KEY')
    
    if (!apiKey) {
      throw new Error('HUGGINGFACE_API_KEY not found')
    }

    console.log('Making request to Hugging Face API...')
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'audio/webm',
      },
      body: audioBlob,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 