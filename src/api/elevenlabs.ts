export const textToSpeech = async (text: string) => {
  try {
    const response = await fetch('/api/elevenlabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to convert text to speech');
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error calling ElevenLabs API:', error);
    throw error;
  }
}; 