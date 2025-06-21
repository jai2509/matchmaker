import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { LogOut, Settings, Edit, Heart, Users, Award } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing coming soon!');
  };

  const getPersonalityColor = (type: string) => {
    const colors: Record<string, string> = {
      'INTJ': '#6B73FF',
      'ENFP': '#10B981',
      'ISFJ': '#9B59B6',
      'ESTP': '#F59E0B',
      // Add more personality types as needed
    };
    return colors[type] || '#6B7280';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleEditProfile}>
          <Edit size={24} color="#6B73FF" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <Image
          source={{ 
            uri: user.photos?.[0] || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' 
          }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileAge}>{user.age} years old</Text>
        <Text style={styles.profileLocation}>{user.location}</Text>
        
        <View style={styles.personalityBadge}>
          <Text style={[
            styles.personalityText,
            { color: getPersonalityColor(user.personality_type) }
          ]}>
            {user.personality_type}
          </Text>
        </View>
      </View>

      <View style={styles.bioCard}>
        <Text style={styles.cardTitle}>About Me</Text>
        <Text style={styles.bioText}>{user.bio}</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Compatibility Profile</Text>
        
        <View style={styles.statRow}>
          <Heart size={20} color="#E74C3C" />
          <Text style={styles.statLabel}>Emotional Intelligence</Text>
          <Text style={styles.statValue}>{user.emotional_intelligence_score}/100</Text>
        </View>
        
        <View style={styles.statRow}>
          <Users size={20} color="#6B73FF" />
          <Text style={styles.statLabel}>Social Energy</Text>
          <Text style={styles.statValue}>{user.social_energy_level}/10</Text>
        </View>
        
        <View style={styles.statRow}>
          <Award size={20} color="#10B981" />
          <Text style={styles.statLabel}>Attachment Style</Text>
          <Text style={styles.statValue}>{user.attachment_style}</Text>
        </View>
      </View>

      <View style={styles.traitsCard}>
        <Text style={styles.cardTitle}>Personality Traits</Text>
        
        {[
          { label: 'Openness', value: user.openness_score },
          { label: 'Conscientiousness', value: user.conscientiousness_score },
          { label: 'Extraversion', value: user.extraversion_score },
          { label: 'Agreeableness', value: user.agreeableness_score },
          { label: 'Emotional Stability', value: 100 - user.neuroticism_score },
        ].map((trait, index) => (
          <View key={index} style={styles.traitRow}>
            <Text style={styles.traitLabel}>{trait.label}</Text>
            <View style={styles.traitBarContainer}>
              <View 
                style={[
                  styles.traitBar,
                  { width: `${trait.value}%` }
                ]} 
              />
            </View>
            <Text style={styles.traitValue}>{trait.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.valuesCard}>
        <Text style={styles.cardTitle}>Core Values</Text>
        <View style={styles.tagContainer}>
          {user.values?.map((value, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.goalsCard}>
        <Text style={styles.cardTitle}>Life Goals</Text>
        <View style={styles.tagContainer}>
          {user.life_goals?.map((goal, index) => (
            <View key={index} style={[styles.tag, styles.goalTag]}>
              <Text style={[styles.tagText, styles.goalTagText]}>{goal}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.interestsCard}>
        <Text style={styles.cardTitle}>Interests</Text>
        <View style={styles.tagContainer}>
          {user.interests?.map((interest, index) => (
            <View key={index} style={[styles.tag, styles.interestTag]}>
              <Text style={[styles.tagText, styles.interestTagText]}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <LogOut size={20} color="#E74C3C" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

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
  profileCard: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1B23',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  personalityBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  personalityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bioCard: {
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
    marginBottom: 12,
  },
  bioText: {
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
  traitsCard: {
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
    width: 100,
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
    backgroundColor: '#6B73FF',
    borderRadius: 4,
  },
  traitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1B23',
    width: 30,
    textAlign: 'right',
  },
  valuesCard: {
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
  goalsCard: {
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
  interestsCard: {
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#6B73FF',
    fontWeight: '500',
  },
  goalTag: {
    backgroundColor: '#F0F9F0',
  },
  goalTagText: {
    color: '#047857',
  },
  interestTag: {
    backgroundColor: '#FEF3F2',
  },
  interestTagText: {
    color: '#B91C1C',
  },
  signOutButton: {
    margin: 24,
    marginTop: 0,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});