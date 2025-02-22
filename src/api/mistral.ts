const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

export const askQuestion = async (
  question: string,
  transcript: string
): Promise<string> => {
  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-medium',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions about a podcast transcript. Use the provided transcript as context for your answers. Give the answers as short as possible, and keep them concise as hell.',
          },
          {
            role: 'user',
            content: `Context: ${transcript}\n\nQuestion: ${question}`,
          },
        ],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content || 'No response received';
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
