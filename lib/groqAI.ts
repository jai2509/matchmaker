import { User, Match } from '@/types';

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GroqAI {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY || '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';
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>, model = 'llama3-8b-8192'): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq AI request failed:', error);
      throw error;
    }
  }

  async generateMatchFeedback(currentUser: User, matchedUser: User, messageCount: number, matchDuration: number): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are a relationship expert providing thoughtful feedback on dating matches. Be empathetic, constructive, and focus on personal growth. Keep responses under 150 words.`
      },
      {
        role: 'user',
        content: `A dating match ended between two users. Here's the context:

User 1: ${currentUser.name}, age ${currentUser.age}
- Personality: ${currentUser.personality_type}
- Communication style: ${currentUser.communication_style}
- Values: ${currentUser.values?.join(', ')}
- Interests: ${currentUser.interests?.join(', ')}

User 2: ${matchedUser.name}, age ${matchedUser.age}
- Personality: ${matchedUser.personality_type}
- Communication style: ${matchedUser.communication_style}
- Values: ${matchedUser.values?.join(', ')}
- Interests: ${matchedUser.interests?.join(', ')}

Match details:
- Messages exchanged: ${messageCount}
- Match duration: ${Math.round(matchDuration / (1000 * 60 * 60))} hours

Provide personalized feedback on why this match might not have worked and insights for future connections.`
      }
    ];

    return await this.makeRequest(messages);
  }

  async generateConversationStarter(currentUser: User, matchedUser: User): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are a dating coach helping users start meaningful conversations. Create thoughtful, personalized conversation starters based on shared interests and compatibility. Keep it natural and engaging, under 100 words.`
      },
      {
        role: 'user',
        content: `Generate a conversation starter for these two matched users:

User 1: ${currentUser.name}
- Interests: ${currentUser.interests?.join(', ')}
- Values: ${currentUser.values?.join(', ')}
- Bio: ${currentUser.bio}

User 2: ${matchedUser.name}
- Interests: ${matchedUser.interests?.join(', ')}
- Values: ${matchedUser.values?.join(', ')}
- Bio: ${matchedUser.bio}

Create a personalized conversation starter that references their shared interests or values.`
      }
    ];

    return await this.makeRequest(messages);
  }

  async generatePersonalityInsights(user: User): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are a psychology expert providing insights about personality and relationship compatibility. Be encouraging and focus on strengths while offering growth opportunities.`
      },
      {
        role: 'user',
        content: `Provide personality insights for this user:

Name: ${user.name}
Personality Type: ${user.personality_type}
Emotional Intelligence: ${user.emotional_intelligence_score}/100
Attachment Style: ${user.attachment_style}
Communication Style: ${user.communication_style}

Big Five Scores:
- Openness: ${user.openness_score}/100
- Conscientiousness: ${user.conscientiousness_score}/100
- Extraversion: ${user.extraversion_score}/100
- Agreeableness: ${user.agreeableness_score}/100
- Emotional Stability: ${100 - user.neuroticism_score}/100

Values: ${user.values?.join(', ')}
Life Goals: ${user.life_goals?.join(', ')}

Provide insights about their relationship strengths and areas for growth.`
      }
    ];

    return await this.makeRequest(messages);
  }

  async generateDatingTips(user: User): Promise<string> {
    const messages = [
      {
        role: 'system',
        content: `You are a mindful dating coach providing personalized advice for meaningful connections. Focus on authenticity, emotional intelligence, and building genuine relationships.`
      },
      {
        role: 'user',
        content: `Provide personalized dating tips for this user:

Personality: ${user.personality_type}
Communication Style: ${user.communication_style}
Attachment Style: ${user.attachment_style}
Social Energy Level: ${user.social_energy_level}/10
Response Time Preference: ${user.response_time_preference}

Give 3-4 specific, actionable tips for building meaningful connections based on their personality profile.`
      }
    ];

    return await this.makeRequest(messages);
  }

  async analyzeMessageSentiment(message: string): Promise<{ sentiment: 'positive' | 'neutral' | 'negative'; score: number; insights: string }> {
    const messages = [
      {
        role: 'system',
        content: `You are an expert in analyzing message sentiment and communication patterns. Analyze the emotional tone and provide insights. Respond in JSON format: {"sentiment": "positive|neutral|negative", "score": 0-100, "insights": "brief analysis"}`
      },
      {
        role: 'user',
        content: `Analyze the sentiment of this message: "${message}"`
      }
    ];

    try {
      const response = await this.makeRequest(messages);
      const analysis = JSON.parse(response);
      return analysis;
    } catch (error) {
      console.error('Failed to analyze message sentiment:', error);
      return {
        sentiment: 'neutral',
        score: 50,
        insights: 'Unable to analyze message sentiment'
      };
    }
  }
}

export const groqAI = new GroqAI();