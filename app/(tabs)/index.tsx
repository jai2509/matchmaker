import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useMatch } from '@/contexts/MatchContext';
import { UserState } from '@/types';
import { Heart, Clock, MessageCircle, Pin, PinOff } from 'lucide-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function TodayScreen() {
  const { user } = useAuth();
  const { currentMatch, matchedUser, loading, unpinMatch, matchProgress } = useMatch();

  if (!user) {
    router.replace('/(auth)/login');
    return null;
  }

  if (user.current_state === UserState.ONBOARDING) {
    router.replace('/onboarding');
    return null;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Heart size={48} color="#6B73FF" />
          <Text style={styles.loadingText}>Finding your perfect match...</Text>
        </View>
      </View>
    );
  }

  if (user.current_state === UserState.FROZEN) {
    return <FrozenStateView user={user} />;
  }

  if (!currentMatch || !matchedUser) {
    return (
      <View style={styles.container}>
        <View style={styles.noMatchContainer}>
          <Heart size={64} color="#D1D5DB" />
          <Text style={styles.noMatchTitle}>No Match Today</Text>
          <Text style={styles.noMatchSubtitle}>
            We're carefully selecting your perfect match. Check back soon!
          </Text>
        </View>
      </View>
    );
  }

  const handleUnpin = () => {
    Alert.alert(
      'Unpin Match',
      'Are you sure you want to end this match? This will put you in a 24-hour reflection period, and you won\'t be able to receive new matches during this time.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Unpin', 
          style: 'destructive',
          onPress: unpinMatch
        },
      ]
    );
  };

  const handleStartChat = () => {
    router.push('/(tabs)/chat');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today's Match</Text>
        <View style={styles.pinIndicator}>
          <Pin size={16} color="#6B73FF" />
          <Text style={styles.pinText}>Pinned</Text>
        </View>
      </View>

      <View style={styles.matchCard}>
        <Image
          source={{ uri: matchedUser.photos[0] || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' }}
          style={styles.profileImage}
        />
        
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{matchedUser.name}</Text>
          <Text style={styles.matchAge}>{matchedUser.age} years old</Text>
          <Text style={styles.matchBio}>{matchedUser.bio}</Text>
        </View>

        <View style={styles.compatibilityBadge}>
          <Text style={styles.compatibilityText}>
            {Math.round(currentMatch.compatibility_score * 100)}% Compatible
          </Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Conversation Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${matchProgress.progressPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {matchProgress.messageCount}/100 messages • {matchProgress.timeRemaining} remaining
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={handleStartChat}
        >
          <MessageCircle size={20} color="#FFFFFF" />
          <Text style={styles.chatButtonText}>Start Conversation</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.unpinButton}
          onPress={handleUnpin}
        >
          <PinOff size={20} color="#E74C3C" />
          <Text style={styles.unpinButtonText}>Unpin Match</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mindfulnessNote}>
        <Text style={styles.mindfulnessTitle}>Mindful Reminder</Text>
        <Text style={styles.mindfulnessText}>
          Take your time to truly get to know {matchedUser.name}. Quality connections 
          are built through meaningful conversations, not rushed interactions.
        </Text>
      </View>
    </ScrollView>
  );
}

function FrozenStateView({ user }: { user: any }) {
  const timeRemaining = user.freeze_until ? 
    Math.max(0, new Date(user.freeze_until).getTime() - new Date().getTime()) : 0;
  
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <View style={styles.container}>
      <View style={styles.frozenContainer}>
        <Clock size={64} color="#9B59B6" />
        <Text style={styles.frozenTitle}>Reflection Period</Text>
        <Text style={styles.frozenSubtitle}>
          You're in a 24-hour reflection period after unpinning your last match.
        </Text>
        <Text style={styles.frozenTime}>
          {hours}h {minutes}m remaining
        </Text>
        <Text style={styles.frozenMessage}>
          Use this time to reflect on what you're looking for in a meaningful connection.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1B23',
  },
  pinIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pinText: {
    fontSize: 12,
    color: '#6B73FF',
    marginLeft: 4,
    fontWeight: '500',
  },
  matchCard: {
    margin: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: width - 96,
    height: width - 96,
    borderRadius: 16,
    marginBottom: 16,
  },
  matchInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  matchName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1B23',
    marginBottom: 4,
  },
  matchAge: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  matchBio: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  compatibilityBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  compatibilityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressSection: {
    margin: 24,
    marginTop: 0,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1B23',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B73FF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    margin: 24,
    gap: 12,
  },
  chatButton: {
    backgroundColor: '#6B73FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  unpinButton: {
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  unpinButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
  mindfulnessNote: {
    margin: 24,
    backgroundColor: '#F0F9F0',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  mindfulnessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  mindfulnessText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  noMatchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noMatchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1B23',
    marginTop: 16,
    marginBottom: 8,
  },
  noMatchSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  frozenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  frozenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1B23',
    marginTop: 16,
    marginBottom: 8,
  },
  frozenSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  frozenTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9B59B6',
    marginBottom: 16,
  },
  frozenMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});