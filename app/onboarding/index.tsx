import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Brain, Target, Sparkles } from 'lucide-react-native';

export default function OnboardingStart() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Heart size={64} color="#6B73FF" />
        <Text style={styles.title}>Welcome to Lone Town</Text>
        <Text style={styles.subtitle}>
          Let's create your compatibility profile for meaningful connections
        </Text>
      </View>

      <View style={styles.stepsContainer}>
        <View style={styles.step}>
          <View style={styles.stepIcon}>
            <Heart size={24} color="#6B73FF" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <Text style={styles.stepDescription}>
              Share basic details and photos to help others connect with you
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepIcon}>
            <Brain size={24} color="#9B59B6" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Personality Assessment</Text>
            <Text style={styles.stepDescription}>
              Deep psychological profiling for better compatibility matching
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepIcon}>
            <Target size={24} color="#10B981" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Values & Goals</Text>
            <Text style={styles.stepDescription}>
              Define what matters most to you in life and relationships
            </Text>
          </View>
        </View>

        <View style={styles.step}>
          <View style={styles.stepIcon}>
            <Sparkles size={24} color="#F59E0B" />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Find Your Match</Text>
            <Text style={styles.stepDescription}>
              Get your first carefully selected match based on deep compatibility
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.mindfulnessNote}>
        <Text style={styles.mindfulnessTitle}>Our Mindful Approach</Text>
        <Text style={styles.mindfulnessText}>
          We believe in quality over quantity. Instead of endless swiping, you'll receive 
          one thoughtfully selected match per day, encouraging deeper connections and 
          intentional dating.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => router.push('/onboarding/personal-info')}
      >
        <Text style={styles.startButtonText}>Begin Your Journey</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  content: {
    padding: 24,
    paddingTop: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1B23',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepsContainer: {
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1B23',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  mindfulnessNote: {
    backgroundColor: '#F0F9F0',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
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
  startButton: {
    backgroundColor: '#6B73FF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});