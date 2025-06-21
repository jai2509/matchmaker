import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useMatch } from '@/contexts/MatchContext';
import { UserState } from '@/types';
import { Clock, Heart, MessageCircle, Video, TrendingUp, Calendar } from 'lucide-react-native';

export default function StatusScreen() {
  const { user } = useAuth();
  const { currentMatch, matchProgress, canVideoCall } = useMatch();

  if (!user) return null;

  const getStatusColor = () => {
    switch (user.current_state) {
      case UserState.MATCHED:
        return '#10B981';
      case UserState.FROZEN:
        return '#9B59B6';
      case UserState.AVAILABLE:
        return '#6B73FF';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (user.current_state) {
      case UserState.MATCHED:
        return 'Actively Matched';
      case UserState.FROZEN:
        return 'Reflection Period';
      case UserState.AVAILABLE:
        return 'Available for Matching';
      default:
        return 'Unknown Status';
    }
  };

  const renderTimeRemaining = () => {
    if (user.current_state === UserState.FROZEN && user.freeze_until) {
      const timeRemaining = Math.max(0, new Date(user.freeze_until).getTime() - new Date().getTime());
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      
      return (
        <View style={styles.timeCard}>
          <Clock size={24} color="#9B59B6" />
          <View style={styles.timeInfo}>
            <Text style={styles.timeTitle}>Reflection Period Ends</Text>
            <Text style={styles.timeValue}>{hours}h {minutes}m remaining</Text>
          </View>
        </View>
      );
    }
    
    if (currentMatch && matchProgress.timeRemaining !== 'Expired') {
      return (
        <View style={styles.timeCard}>
          <MessageCircle size={24} color="#6B73FF" />
          <View style={styles.timeInfo}>
            <Text style={styles.timeTitle}>Video Call Unlock Period</Text>
            <Text style={styles.timeValue}>{matchProgress.timeRemaining} remaining</Text>
          </View>
        </View>
      );
    }
    
    return null;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Status</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        
        {user.current_state === UserState.MATCHED && (
          <Text style={styles.statusDescription}>
            You're connected with someone special. Focus on building a meaningful connection.
          </Text>
        )}
        
        {user.current_state === UserState.FROZEN && (
          <Text style={styles.statusDescription}>
            Take time to reflect on what you're looking for. You'll be available for new matches soon.
          </Text>
        )}
        
        {user.current_state === UserState.AVAILABLE && (
          <Text style={styles.statusDescription}>
            We're working on finding your perfect match based on deep compatibility.
          </Text>
        )}
      </View>

      {renderTimeRemaining()}

      {currentMatch && (
        <View style={styles.matchStatsCard}>
          <Text style={styles.cardTitle}>Current Match Progress</Text>
          
          <View style={styles.statRow}>
            <MessageCircle size={20} color="#6B73FF" />
            <Text style={styles.statLabel}>Messages Exchanged</Text>
            <Text style={styles.statValue}>{matchProgress.messageCount}/100</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${matchProgress.progressPercentage}%` }
              ]} 
            />
          </View>
          
          <View style={styles.statRow}>
            <Video size={20} color={canVideoCall ? '#10B981' : '#9CA3AF'} />
            <Text style={styles.statLabel}>Video Calling</Text>
            <Text style={[
              styles.statValue,
              { color: canVideoCall ? '#10B981' : '#9CA3AF' }
            ]}>
              {canVideoCall ? 'Unlocked' : 'Locked'}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Heart size={20} color="#E74C3C" />
            <Text style={styles.statLabel}>Compatibility Score</Text>
            <Text style={styles.statValue}>
              {Math.round((currentMatch.compatibility_score || 0) * 100)}%
            </Text>
          </View>
        </View>
      )}

      <View style={styles.mindfulnessCard}>
        <TrendingUp size={24} color="#10B981" />
        <View style={styles.mindfulnessContent}>
          <Text style={styles.mindfulnessTitle}>Mindful Dating Tips</Text>
          <Text style={styles.mindfulnessText}>
            Quality over quantity. Focus on building one meaningful connection rather than juggling multiple conversations.
          </Text>
        </View>
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        
        <View style={styles.activityItem}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.activityText}>
            Last active: {new Date(user.last_active).toLocaleDateString()}
          </Text>
        </View>
        
        {currentMatch && (
          <View style={styles.activityItem}>
            <Heart size={16} color="#6B7280" />
            <Text style={styles.activityText}>
              Matched: {new Date(currentMatch.created_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  header: {
    padding: 24,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1B23',
  },
  statusCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1B23',
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  timeCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeInfo: {
    marginLeft: 16,
    flex: 1,
  },
  timeTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1B23',
  },
  matchStatsCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1B23',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1B23',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B73FF',
    borderRadius: 4,
  },
  mindfulnessCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#F0F9F0',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mindfulnessContent: {
    marginLeft: 16,
    flex: 1,
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
  historyCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
});