import React, { createContext, useContext, ReactNode } from 'react';
import { groqAI } from '@/lib/groqAI';
import { User } from '@/types';

interface AIContextType {
  generateMatchFeedback: (currentUser: User, matchedUser: User, messageCount: number, matchDuration: number) => Promise<string>;
  generateConversationStarter: (currentUser: User, matchedUser: User) => Promise<string>;
  generatePersonalityInsights: (user: User) => Promise<string>;
  generateDatingTips: (user: User) => Promise<string>;
  analyzeMessageSentiment: (message: string) => Promise<{ sentiment: 'positive' | 'neutral' | 'negative'; score: number; insights: string }>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const generateMatchFeedback = async (currentUser: User, matchedUser: User, messageCount: number, matchDuration: number): Promise<string> => {
    try {
      return await groqAI.generateMatchFeedback(currentUser, matchedUser, messageCount, matchDuration);
    } catch (error) {
      console.error('Failed to generate match feedback:', error);
      return "Every connection teaches us something valuable. Take time to reflect on what you learned from this experience and what you're looking for in your next match.";
    }
  };

  const generateConversationStarter = async (currentUser: User, matchedUser: User): Promise<string> => {
    try {
      return await groqAI.generateConversationStarter(currentUser, matchedUser);
    } catch (error) {
      console.error('Failed to generate conversation starter:', error);
      return "Hi! I'd love to get to know you better. What's something that's been bringing you joy lately?";
    }
  };

  const generatePersonalityInsights = async (user: User): Promise<string> => {
    try {
      return await groqAI.generatePersonalityInsights(user);
    } catch (error) {
      console.error('Failed to generate personality insights:', error);
      return "Your unique personality brings special qualities to relationships. Focus on being authentic and open to meaningful connections.";
    }
  };

  const generateDatingTips = async (user: User): Promise<string> => {
    try {
      return await groqAI.generateDatingTips(user);
    } catch (error) {
      console.error('Failed to generate dating tips:', error);
      return "Remember to be yourself, listen actively, ask thoughtful questions, and focus on building genuine connections rather than trying to impress.";
    }
  };

  const analyzeMessageSentiment = async (message: string) => {
    try {
      return await groqAI.analyzeMessageSentiment(message);
    } catch (error) {
      console.error('Failed to analyze message sentiment:', error);
      return {
        sentiment: 'neutral' as const,
        score: 50,
        insights: 'Unable to analyze message sentiment'
      };
    }
  };

  return (
    <AIContext.Provider
      value={{
        generateMatchFeedback,
        generateConversationStarter,
        generatePersonalityInsights,
        generateDatingTips,
        analyzeMessageSentiment,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};