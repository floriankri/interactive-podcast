import { useEffect } from 'react';
import { useConversationContext } from '@/contexts/ConversationContext';

// Store both IDs as constants
const KNOWLEDGE_BASE_ID = 'EjvuF5vO6bN2uZHHi5Ij';
const AGENT_ID = 'gYZLIR4Qap3aCzXTgQYL'; // Use one of your previously created agent IDs

export const ConversationInitializer = () => {
  const { setAgentId, setKnowledgeBaseId } = useConversationContext();

  useEffect(() => {
    // Simply set the IDs without creating new resources
    setKnowledgeBaseId(KNOWLEDGE_BASE_ID);
    setAgentId(AGENT_ID);
  }, [setAgentId, setKnowledgeBaseId]);

  return null;
}; 