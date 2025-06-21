import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Match, Message, User, UserState } from '@/types';
import { useAuth } from './AuthContext';
import { useAI } from './AIContext';
import { MatchingAlgorithm } from '@/lib/matchingAlgorithm';

interface MatchContextType {
  currentMatch: Match | null;
  matchedUser: User | null;
  messages: Message[];
  loading: boolean;
  sendMessage: (content: string) => Promise<void>;
  unpinMatch: () => Promise<void>;
  canVideoCall: boolean;
  matchProgress: {
    messageCount: number;
    timeRemaining: string;
    progressPercentage: number;
  };
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within MatchProvider');
  }
  return context;
};

interface MatchProviderProps {
  children: ReactNode;
}

export const MatchProvider: React.FC<MatchProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { generateMatchFeedback } = useAI();
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const matchingAlgorithm = new MatchingAlgorithm();

  useEffect(() => {
    if (user) {
      fetchCurrentMatch();
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const fetchCurrentMatch = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (match) {
        setCurrentMatch(match);
        
        // Fetch matched user
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const { data: matchedUserData } = await supabase
          .from('users')
          .select('*')
          .eq('id', otherUserId)
          .single();
        
        setMatchedUser(matchedUserData);
        
        // Fetch messages
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('match_id', match.id)
          .order('created_at', { ascending: true });
        
        setMessages(messagesData || []);
      } else {
        // No active match, check if user should get a new match
        await checkForNewMatch();
      }
    } catch (error) {
      console.error('Error fetching current match:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewMatch = async () => {
    if (!user) return;
    
    // Check if user is in frozen state
    if (user.current_state === UserState.FROZEN) {
      const freezeEnd = new Date(user.freeze_until || '');
      if (new Date() < freezeEnd) {
        return; // Still frozen
      } else {
        // Unfreeze user
        await supabase
          .from('users')
          .update({ 
            current_state: UserState.AVAILABLE, 
            freeze_until: null 
          })
          .eq('id', user.id);
      }
    }

    // Find a new match
    const newMatch = await matchingAlgorithm.findMatch(user.id);
    if (newMatch) {
      setCurrentMatch(newMatch.match);
      setMatchedUser(newMatch.matchedUser);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user) return;

    // Subscribe to messages
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${currentMatch?.id}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  };

  const sendMessage = async (content: string) => {
    if (!user || !currentMatch) return;

    const message = {
      match_id: currentMatch.id,
      sender_id: user.id,
      content,
      message_type: 'text',
    };

    const { error } = await supabase
      .from('messages')
      .insert(message);

    if (error) throw error;

    // Update match message count
    const newMessageCount = currentMatch.message_count + 1;
    await supabase
      .from('matches')
      .update({ 
        message_count: newMessageCount,
        first_message_at: currentMatch.first_message_at || new Date().toISOString()
      })
      .eq('id', currentMatch.id);

    setCurrentMatch(prev => prev ? { ...prev, message_count: newMessageCount } : null);
  };

  const unpinMatch = async () => {
    if (!user || !currentMatch || !matchedUser) return;

    try {
      // Generate AI feedback before ending the match
      const matchDuration = new Date().getTime() - new Date(currentMatch.created_at).getTime();
      const feedback = await generateMatchFeedback(user, matchedUser, currentMatch.message_count, matchDuration);
      
      // Store feedback for the user
      console.log('Match feedback:', feedback);
      
      // End the match
      await supabase
        .from('matches')
        .update({
          status: 'ended',
          unpinned_by: user.id,
          unpinned_at: new Date().toISOString()
        })
        .eq('id', currentMatch.id);

      // Set user to frozen state for 24 hours
      const freezeUntil = new Date();
      freezeUntil.setHours(freezeUntil.getHours() + 24);

      await supabase
        .from('users')
        .update({
          current_state: UserState.FROZEN,
          freeze_until: freezeUntil.toISOString(),
          match_id: null
        })
        .eq('id', user.id);

      // Give the other user a new match in 2 hours
      const otherUserId = currentMatch.user1_id === user.id ? currentMatch.user2_id : currentMatch.user1_id;
      const newMatchTime = new Date();
      newMatchTime.setHours(newMatchTime.getHours() + 2);

      // This would be handled by a background job in a real app
      setTimeout(() => {
        matchingAlgorithm.findMatch(otherUserId);
      }, 2 * 60 * 60 * 1000);

      setCurrentMatch(null);
      setMatchedUser(null);
      setMessages([]);
    } catch (error) {
      console.error('Error unpinning match:', error);
      throw error;
    }
  };

  const canVideoCall = currentMatch?.video_unlocked || false;

  const matchProgress = {
    messageCount: currentMatch?.message_count || 0,
    timeRemaining: calculateTimeRemaining(),
    progressPercentage: Math.min((currentMatch?.message_count || 0) / 100 * 100, 100)
  };

  function calculateTimeRemaining(): string {
    if (!currentMatch?.first_message_at) return '48 hours';
    
    const firstMessage = new Date(currentMatch.first_message_at);
    const deadline = new Date(firstMessage.getTime() + 48 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = deadline.getTime() - now.getTime();
    
    if (remaining <= 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }

  return (
    <MatchContext.Provider
      value={{
        currentMatch,
        matchedUser,
        messages,
        loading,
        sendMessage,
        unpinMatch,
        canVideoCall,
        matchProgress,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};