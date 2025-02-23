import { useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useConversation } from '@11labs/react';
import { useConversationContext } from '@/contexts/ConversationContext';

interface ConversationHandlerProps {
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
}

export const ConversationHandler = forwardRef<any, ConversationHandlerProps>(({ onMessage, onError }, ref) => {
  const { agentId, knowledgeBaseId } = useConversationContext();
  const sessionInitialized = useRef(false);
  
  const conversation = useConversation({
    onConnect: () => console.log('Connected to agent'),
    onDisconnect: () => {
      console.log('Disconnected from agent');
      sessionInitialized.current = false;
    },
    onMessage,
    onError
  });

  useImperativeHandle(ref, () => ({
    // Called when "Join in" is clicked
    startSession: async () => {
      if (!agentId) throw new Error('Agent not initialized');
      if (!knowledgeBaseId) throw new Error('Knowledge base not initialized');
      
      await conversation.startSession({
        agentId: agentId,
        url: `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}&knowledge_base_id=${knowledgeBaseId}&enable_knowledge_base=true`
      });
      sessionInitialized.current = true;
    },
    // Called when "Stop" is clicked
    endSession: async () => {
      if (sessionInitialized.current) {
        conversation.endSession();
        sessionInitialized.current = false;
      }
    }
  }));

  return null;
}); 