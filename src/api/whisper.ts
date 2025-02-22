const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/openai/whisper-large-v3';

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Send the raw audio blob directly
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
        'Content-Type': 'audio/webm',  // Match the audio format we're recording
      },
      body: audioBlob, // Send the raw audio blob
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network response was not ok' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Transcription result:', result); // For debugging
    
    if (Array.isArray(result)) {
      return result[0]?.text || '';
    } else if (typeof result === 'object' && result.text) {
      return result.text;
    }
    
    return '';
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}; 