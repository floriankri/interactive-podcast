import { useEffect } from 'react';
import { useConversationContext } from '@/contexts/ConversationContext';

// Store both IDs as constants
const KNOWLEDGE_BASE_ID = 'rjz49GhpLJMdN17SM35D';
const AGENT_ID = 'SSJ9QaIrGwtGHMgl324w'; // Use one of your previously created agent IDs

export const ConversationInitializer = () => {
  const { setAgentId, setKnowledgeBaseId } = useConversationContext();

  useEffect(() => {
    // Simply set the IDs without creating new resources
    setKnowledgeBaseId(KNOWLEDGE_BASE_ID);
    setAgentId(AGENT_ID);
  }, [setAgentId, setKnowledgeBaseId]);

  return null;
}; 