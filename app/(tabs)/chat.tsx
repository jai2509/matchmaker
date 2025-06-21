import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useMatch } from '@/contexts/MatchContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/contexts/AIContext';
import { Message } from '@/types';
import { Send, Video, VideoOff, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ChatScreen() {
  const { user } = useAuth();
  const { currentMatch, matchedUser, messages, sendMessage, canVideoCall, matchProgress } = useMatch();
  const { generateConversationStarter } = useAI();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingStarter, setLoadingStarter] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  if (!currentMatch || !matchedUser || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.noMatchContainer}>
          <Text style={styles.noMatchText}>No active match</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.backButtonText}>Go to Today's Match</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(messageText.trim());
      setMessageText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleVideoCall = () => {
    if (canVideoCall) {
      Alert.alert('Video Call', 'Video calling feature coming soon!');
    } else {
      Alert.alert(
        'Video Call Locked',
        `You need to exchange ${100 - matchProgress.messageCount} more messages within ${matchProgress.timeRemaining} to unlock video calling.`
      );
    }
  };

  const handleGenerateStarter = async () => {
    if (!user || !matchedUser) return;
    
    setLoadingStarter(true);
    try {
      const starter = await generateConversationStarter(user, matchedUser);
      setMessageText(starter);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate conversation starter');
    } finally {
      setLoadingStarter(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user.id;
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.theirMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.theirMessageTime
          ]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{matchedUser.name}</Text>
          <Text style={styles.headerSubtitle}>
            {matchProgress.messageCount}/100 messages • {matchProgress.timeRemaining}
          </Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.videoButton,
            canVideoCall ? styles.videoButtonEnabled : styles.videoButtonDisabled
          ]}
          onPress={handleVideoCall}
        >
          {canVideoCall ? (
            <Video size={24} color="#FFFFFF" />
          ) : (
            <VideoOff size={24} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${matchProgress.progressPercentage}%` }
            ]} 
          />
        </View>
      </View>

      {messages.length === 0 && (
        <View style={styles.starterContainer}>
          <Text style={styles.starterTitle}>Start a meaningful conversation</Text>
          <TouchableOpacity 
            style={styles.starterButton}
            onPress={handleGenerateStarter}
            disabled={loadingStarter}
          >
            <Sparkles size={16} color="#6B73FF" />
            <Text style={styles.starterButtonText}>
              {loadingStarter ? 'Generating...' : 'Get AI Conversation Starter'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a thoughtful message..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!messageText.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sending}
        >
          <Send size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {matchProgress.messageCount < 100 && (
        <View style={styles.encouragementBanner}>
          <Text style={styles.encouragementText}>
            Share meaningful thoughts to unlock video calling 💬
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1B23',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  videoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoButtonEnabled: {
    backgroundColor: '#10B981',
  },
  videoButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B73FF',
    borderRadius: 2,
  },
  starterContainer: {
    padding: 24,
    alignItems: 'center',
  },
  starterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1B23',
    marginBottom: 12,
  },
  starterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  starterButtonText: {
    fontSize: 14,
    color: '#6B73FF',
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  theirMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#6B73FF',
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#1A1B23',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#E0E7FF',
  },
  theirMessageTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#6B73FF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  encouragementBanner: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 14,
    color: '#6B73FF',
    fontWeight: '500',
  },
  noMatchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noMatchText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#6B73FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});