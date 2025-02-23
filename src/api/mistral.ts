export const askQuestion = async (question: string, context: string) => {
  try {
    const response = await fetch('/api/mistral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, context }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get response from Mistral');
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    throw error;
  }
}; 