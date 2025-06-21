import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useAI } from '@/contexts/AIContext';
import { Brain, Heart, Lightbulb, TrendingUp, Sparkles } from 'lucide-react-native';

export default function InsightsScreen() {
  const { user } = useAuth();
  const { generatePersonalityInsights, generateDatingTips } = useAI();
  const [personalityInsights, setPersonalityInsights] = useState<string>('');
  const [datingTips, setDatingTips] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingTips, setLoadingTips] = useState(false);

  useEffect(() => {
    if (user) {
      loadPersonalityInsights();
      loadDatingTips();
    }
  }, [user]);

  const loadPersonalityInsights = async () => {
    if (!user) return;
    
    setLoadingInsights(true);
    try {
      const insights = await generatePersonalityInsights(user);
      setPersonalityInsights(insights);
    } catch (error) {
      console.error('Failed to load personality insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const loadDatingTips = async () => {
    if (!user) return;
    
    setLoadingTips(true);
    try {
      const tips = await generateDatingTips(user);
      setDatingTips(tips);
    } catch (error) {
      console.error('Failed to load dating tips:', error);
    } finally {
      setLoadingTips(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Insights</Text>
        <Text style={styles.headerSubtitle}>Personalized guidance for meaningful connections</Text>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.cardHeader}>
          <Brain size={24} color="#6B73FF" />
          <Text style={styles.cardTitle}>Personality Insights</Text>
          <TouchableOpacity onPress={loadPersonalityInsights} disabled={loadingInsights}>
            <Sparkles size={20} color="#6B73FF" />
          </TouchableOpacity>
        </View>
        
        {loadingInsights ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6B73FF" />
            <Text style={styles.loadingText}>Analyzing your personality...</Text>
          </View>
        ) : (
          <Text style={styles.insightText}>{personalityInsights}</Text>
        )}
      </View>

      <View style={styles.insightCard}>
        <View style={styles.cardHeader}>
          <Heart size={24} color="#E74C3C" />
          <Text style={styles.cardTitle}>Dating Tips</Text>
          <TouchableOpacity onPress={loadDatingTips} disabled={loadingTips}>
            <Sparkles size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
        
        {loadingTips ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#E74C3C" />
            <Text style={styles.loadingText}>Generating personalized tips...</Text>
          </View>
        ) : (
          <Text style={styles.insightText}>{datingTips}</Text>
        )}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Your Compatibility Profile</Text>
        
        <View style={styles.statRow}>
          <TrendingUp size={20} color="#10B981" />
          <Text style={styles.statLabel}>Emotional Intelligence</Text>
          <Text style={styles.statValue}>{user.emotional_intelligence_score}/100</Text>
        </View>
        
        <View style={styles.statRow}>
          <Brain size={20} color="#9B59B6" />
          <Text style={styles.statLabel}>Personality Type</Text>
          <Text style={styles.statValue}>{user.personality_type}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Heart size={20} color="#E74C3C" />
          <Text style={styles.statLabel}>Attachment Style</Text>
          <Text style={styles.statValue}>{user.attachment_style}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Lightbulb size={20} color="#F59E0B" />
          <Text style={styles.statLabel}>Communication Style</Text>
          <Text style={styles.statValue}>{user.communication_style}</Text>
        </View>
      </View>

      <View style={styles.personalityTraitsCard}>
        <Text style={styles.cardTitle}>Big Five Personality Traits</Text>
        
        {[
          { label: 'Openness', value: user.openness_score, color: '#6B73FF' },
          { label: 'Conscientiousness', value: user.conscientiousness_score, color: '#10B981' },
          { label: 'Extraversion', value: user.extraversion_score, color: '#F59E0B' },
          { label: 'Agreeableness', value: user.agreeableness_score, color: '#E74C3C' },
          { label: 'Emotional Stability', value: 100 - user.neuroticism_score, color: '#9B59B6' },
        ].map((trait, index) => (
          <View key={index} style={styles.traitRow}>
            <Text style={styles.traitLabel}>{trait.label}</Text>
            <View style={styles.traitBarContainer}>
              <View 
                style={[
                  styles.traitBar,
                  { width: `${trait.value}%`, backgroundColor: trait.color }
                ]} 
              />
            </View>
            <Text style={styles.traitValue}>{trait.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.aiNote}>
        <Sparkles size={20} color="#6B73FF" />
        <Text style={styles.aiNoteText}>
          These insights are generated by AI to help you understand your dating patterns and improve your connections. 
          Remember, every person is unique, and these are just guidelines to support your journey.
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  insightCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1B23',
    marginLeft: 12,
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
  },
  insightText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  statsCard: {
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
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  personalityTraitsCard: {
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
  traitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  traitLabel: {
    fontSize: 14,
    color: '#374151',
    width: 120,
  },
  traitBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  traitBar: {
    height: '100%',
    borderRadius: 4,
  },
  traitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1B23',
    width: 30,
    textAlign: 'right',
  },
  aiNote: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  aiNoteText: {
    fontSize: 14,
    color: '#6B73FF',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  bottomSpacer: {
    height: 32,
  },
});