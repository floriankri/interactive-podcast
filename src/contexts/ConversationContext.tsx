import { createContext, useContext, useState, ReactNode } from 'react';

interface ConversationContextType {
  agentId: string | null;
  setAgentId: (id: string) => void;
  knowledgeBaseId: string | null;
  setKnowledgeBaseId: (id: string) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [agentId, setAgentId] = useState<string | null>(null);
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null);

  return (
    <ConversationContext.Provider value={{ 
      agentId, 
      setAgentId,
      knowledgeBaseId,
      setKnowledgeBaseId
    }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversationContext = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
}; 