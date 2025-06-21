import { supabase } from './supabase';
import { User, CompatibilityFactors, UserState } from '@/types';

export class MatchingAlgorithm {
  private readonly COMPATIBILITY_WEIGHTS = {
    emotional_intelligence: 0.20,
    personality: 0.18,
    values: 0.16,
    communication_style: 0.14,
    life_goals: 0.12,
    interests: 0.10,
    attachment: 0.08,
    behavioral: 0.02
  };

  async findMatch(userId: string) {
    try {
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!currentUser) throw new Error('User not found');

      // Get all available users (not the current user, not matched, not frozen)
      const { data: potentialMatches } = await supabase
        .from('users')
        .select('*')
        .neq('id', userId)
        .eq('current_state', UserState.AVAILABLE);

      if (!potentialMatches || potentialMatches.length === 0) {
        return null;
      }

      // Calculate compatibility scores for all potential matches
      const compatibilityScores = potentialMatches.map(user => ({
        user,
        score: this.calculateCompatibilityScore(currentUser, user)
      }));

      // Sort by compatibility score (descending)
      compatibilityScores.sort((a, b) => b.score.total - a.score.total);

      // Get the best match
      const bestMatch = compatibilityScores[0];

      if (bestMatch.score.total < 0.6) {
        // Minimum compatibility threshold
        return null;
      }

      // Create the match
      const { data: match, error } = await supabase
        .from('matches')
        .insert({
          user1_id: userId,
          user2_id: bestMatch.user.id,
          compatibility_score: bestMatch.score.total,
          status: 'active',
          pinned_by_user1: true,
          pinned_by_user2: true,
          message_count: 0,
          video_unlocked: false,
          feedback_sent: false
        })
        .select()
        .single();

      if (error) throw error;

      // Update both users' states
      await Promise.all([
        supabase
          .from('users')
          .update({ 
            current_state: UserState.MATCHED, 
            match_id: match.id 
          })
          .eq('id', userId),
        supabase
          .from('users')
          .update({ 
            current_state: UserState.MATCHED, 
            match_id: match.id 
          })
          .eq('id', bestMatch.user.id)
      ]);

      return {
        match,
        matchedUser: bestMatch.user,
        compatibilityFactors: bestMatch.score.factors
      };

    } catch (error) {
      console.error('Error finding match:', error);
      return null;
    }
  }

  private calculateCompatibilityScore(user1: User, user2: User): {
    total: number;
    factors: CompatibilityFactors;
  } {
    const factors: CompatibilityFactors = {
      emotional_intelligence_compatibility: this.calculateEmotionalIntelligenceCompatibility(user1, user2),
      personality_compatibility: this.calculatePersonalityCompatibility(user1, user2),
      values_alignment: this.calculateValuesAlignment(user1, user2),
      communication_style_match: this.calculateCommunicationStyleMatch(user1, user2),
      life_goals_alignment: this.calculateLifeGoalsAlignment(user1, user2),
      interests_overlap: this.calculateInterestsOverlap(user1, user2),
      attachment_compatibility: this.calculateAttachmentCompatibility(user1, user2),
      behavioral_compatibility: this.calculateBehavioralCompatibility(user1, user2)
    };

    const total = 
      factors.emotional_intelligence_compatibility * this.COMPATIBILITY_WEIGHTS.emotional_intelligence +
      factors.personality_compatibility * this.COMPATIBILITY_WEIGHTS.personality +
      factors.values_alignment * this.COMPATIBILITY_WEIGHTS.values +
      factors.communication_style_match * this.COMPATIBILITY_WEIGHTS.communication_style +
      factors.life_goals_alignment * this.COMPATIBILITY_WEIGHTS.life_goals +
      factors.interests_overlap * this.COMPATIBILITY_WEIGHTS.interests +
      factors.attachment_compatibility * this.COMPATIBILITY_WEIGHTS.attachment +
      factors.behavioral_compatibility * this.COMPATIBILITY_WEIGHTS.behavioral;

    return { total, factors };
  }

  private calculateEmotionalIntelligenceCompatibility(user1: User, user2: User): number {
    const scoreDiff = Math.abs(user1.emotional_intelligence_score - user2.emotional_intelligence_score);
    // Higher scores are better, and scores closer together are more compatible
    const avgScore = (user1.emotional_intelligence_score + user2.emotional_intelligence_score) / 2;
    const proximityBonus = 1 - (scoreDiff / 100); // Assuming max score is 100
    return (avgScore / 100) * proximityBonus;
  }

  private calculatePersonalityCompatibility(user1: User, user2: User): number {
    // Big Five personality compatibility
    const opennessDiff = Math.abs(user1.openness_score - user2.openness_score);
    const conscientiousnessDiff = Math.abs(user1.conscientiousness_score - user2.conscientiousness_score);
    const extraversionDiff = Math.abs(user1.extraversion_score - user2.extraversion_score);
    const agreeablenessDiff = Math.abs(user1.agreeableness_score - user2.agreeableness_score);
    const neuroticismDiff = Math.abs(user1.neuroticism_score - user2.neuroticism_score);

    // Lower differences indicate better compatibility
    const avgDiff = (opennessDiff + conscientiousnessDiff + extraversionDiff + agreeablenessDiff + neuroticismDiff) / 5;
    return 1 - (avgDiff / 100); // Assuming max score is 100
  }

  private calculateValuesAlignment(user1: User, user2: User): number {
    const values1 = new Set(user1.values);
    const values2 = new Set(user2.values);
    const intersection = new Set([...values1].filter(x => values2.has(x)));
    const union = new Set([...values1, ...values2]);
    return intersection.size / union.size; // Jaccard similarity
  }

  private calculateCommunicationStyleMatch(user1: User, user2: User): number {
    // Simplified communication style matching
    const styleCompatibility: Record<string, string[]> = {
      'direct': ['direct', 'assertive'],
      'diplomatic': ['diplomatic', 'empathetic'],
      'analytical': ['analytical', 'logical'],
      'expressive': ['expressive', 'emotional'],
      'supportive': ['supportive', 'diplomatic']
    };

    const user1Compatible = styleCompatibility[user1.communication_style] || [];
    return user1Compatible.includes(user2.communication_style) ? 1 : 0.3;
  }

  private calculateLifeGoalsAlignment(user1: User, user2: User): number {
    const goals1 = new Set(user1.life_goals);
    const goals2 = new Set(user2.life_goals);
    const intersection = new Set([...goals1].filter(x => goals2.has(x)));
    const union = new Set([...goals1, ...goals2]);
    return intersection.size / union.size;
  }

  private calculateInterestsOverlap(user1: User, user2: User): number {
    const interests1 = new Set(user1.interests);
    const interests2 = new Set(user2.interests);
    const intersection = new Set([...interests1].filter(x => interests2.has(x)));
    const union = new Set([...interests1, ...interests2]);
    return intersection.size / union.size;
  }

  private calculateAttachmentCompatibility(user1: User, user2: User): number {
    // Attachment style compatibility matrix
    const attachmentMatrix: Record<string, Record<string, number>> = {
      'secure': { 'secure': 1.0, 'anxious': 0.7, 'avoidant': 0.6, 'disorganized': 0.4 },
      'anxious': { 'secure': 0.7, 'anxious': 0.3, 'avoidant': 0.2, 'disorganized': 0.3 },
      'avoidant': { 'secure': 0.6, 'anxious': 0.2, 'avoidant': 0.4, 'disorganized': 0.3 },
      'disorganized': { 'secure': 0.4, 'anxious': 0.3, 'avoidant': 0.3, 'disorganized': 0.2 }
    };

    return attachmentMatrix[user1.attachment_style]?.[user2.attachment_style] || 0.5;
  }

  private calculateBehavioralCompatibility(user1: User, user2: User): number {
    // Social energy level compatibility
    const energyDiff = Math.abs(user1.social_energy_level - user2.social_energy_level);
    const energyCompatibility = 1 - (energyDiff / 10); // Assuming max level is 10

    // Response time preference compatibility
    const responseCompatibility = user1.response_time_preference === user2.response_time_preference ? 1 : 0.5;

    return (energyCompatibility + responseCompatibility) / 2;
  }

  async generateMatchFeedback(matchId: string, userId: string): Promise<string> {
    try {
      const { data: match } = await supabase
        .from('matches')
        .select(`
          *,
          user1:users!matches_user1_id_fkey(*),
          user2:users!matches_user2_id_fkey(*)
        `)
        .eq('id', matchId)
        .single();

      if (!match) return "We're working on finding you better matches.";

      const currentUser = match.user1.id === userId ? match.user1 : match.user2;
      const otherUser = match.user1.id === userId ? match.user2 : match.user1;

      const compatibility = this.calculateCompatibilityScore(currentUser, otherUser);

      // Generate personalized feedback based on compatibility factors
      const feedbackPoints = [];

      if (compatibility.factors.values_alignment < 0.3) {
        feedbackPoints.push("You and your match had different core values, which is important for long-term compatibility.");
      }

      if (compatibility.factors.communication_style_match < 0.5) {
        feedbackPoints.push("Your communication styles weren't quite aligned - we're learning your preferences for future matches.");
      }

      if (compatibility.factors.life_goals_alignment < 0.4) {
        feedbackPoints.push("You had different life goals, which we'll factor into your next match.");
      }

      if (feedbackPoints.length === 0) {
        feedbackPoints.push("Sometimes timing and chemistry just don't align perfectly - we're refining your matches.");
      }

      return feedbackPoints.join(" ");

    } catch (error) {
      console.error('Error generating feedback:', error);
      return "We're continuously improving our matching algorithm based on your interactions.";
    }
  }
}