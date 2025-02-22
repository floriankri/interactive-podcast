
import { supabase } from "@/integrations/supabase/client";

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Using "Adam" voice

export const textToSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    const { data: { value: apiKey }, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'VITE_ELEVENLABS_API_KEY')
      .single();

    if (error || !apiKey) {
      throw new Error('Could not retrieve ElevenLabs API key');
    }

    const response = await fetch(`${ELEVENLABS_API_URL}/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
};
