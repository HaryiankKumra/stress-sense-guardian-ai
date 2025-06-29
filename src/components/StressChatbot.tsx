
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Heart, Brain } from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  stressLevel?: string;
}

const StressChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your AI stress management assistant. I can help you with relaxation techniques, breathing exercises, and personalized stress relief strategies. How are you feeling right now?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getStressRecommendations = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('stressed') || lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      return {
        response: "I understand you're feeling stressed. Here are some immediate techniques that can help:\n\n🫁 **4-7-8 Breathing**: Inhale for 4 counts, hold for 7, exhale for 8\n\n🧘 **Progressive Muscle Relaxation**: Tense and release each muscle group\n\n🌿 **Grounding Technique**: Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste\n\nWould you like me to guide you through any of these exercises?",
        stressLevel: 'high'
      };
    }
    
    if (lowerMessage.includes('calm') || lowerMessage.includes('relaxed') || lowerMessage.includes('good') || lowerMessage.includes('fine')) {
      return {
        response: "That's wonderful to hear! 😊 Since you're feeling calm, this is a great time to build resilience. Consider:\n\n✨ **Mindfulness Practice**: Spend 5 minutes observing your breath\n\n📝 **Gratitude Journal**: Write down 3 things you're grateful for\n\n🚶 **Gentle Movement**: A short walk or light stretching\n\nKeeping up these habits will help maintain your positive state!",
        stressLevel: 'low'
      };
    }
    
    if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted') || lowerMessage.includes('sleep')) {
      return {
        response: "Fatigue can definitely impact stress levels. Here's what can help:\n\n😴 **Sleep Hygiene**: Aim for 7-9 hours, keep a consistent schedule\n\n🌅 **Power Nap**: 10-20 minutes max if needed\n\n💧 **Stay Hydrated**: Dehydration increases stress hormones\n\n🥗 **Balanced Nutrition**: Avoid caffeine late in the day\n\nYour body needs rest to manage stress effectively. How's your sleep pattern lately?",
        stressLevel: 'medium'
      };
    }
    
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('boss')) {
      return {
        response: "Work-related stress is very common. Let's tackle this:\n\n⏰ **Time Management**: Use the Pomodoro Technique (25 min work, 5 min break)\n\n🎯 **Prioritize Tasks**: Focus on important and urgent items first\n\n🗣️ **Communication**: Don't hesitate to ask for help or clarification\n\n🚪 **Boundaries**: Leave work at work when possible\n\nRemember, your wellbeing comes first. What specific work situation is bothering you?",
        stressLevel: 'medium'
      };
    }
    
    // Default responses
    const defaultResponses = [
      "I'm here to help you manage stress. Can you tell me more about what's on your mind?",
      "Thank you for sharing. Based on your biometric data, I can provide personalized recommendations. What would be most helpful right now?",
      "Every feeling is valid. Let's work together to find strategies that work best for you. What usually helps you feel better?",
    ];
    
    return {
      response: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      stressLevel: 'medium'
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI processing time
    setTimeout(() => {
      const recommendation = getStressRecommendations(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: recommendation.response,
        timestamp: new Date(),
        stressLevel: recommendation.stressLevel,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getStressLevelColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-500" />
          AI Stress Management Chatbot
          <Badge className="bg-purple-100 text-purple-800">✅ Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-purple-500 text-white'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`max-w-xs lg:max-w-md ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <p className="whitespace-pre-line">{message.content}</p>
                    {message.stressLevel && (
                      <Badge className={`mt-2 ${getStressLevelColor(message.stressLevel)}`}>
                        Stress Level: {message.stressLevel}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-purple-500 text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me how you're feeling or ask for stress relief tips..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("I'm feeling stressed")}
              className="text-xs"
            >
              😰 I'm stressed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("I need breathing exercises")}
              className="text-xs"
            >
              🫁 Breathing help
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("I can't sleep")}
              className="text-xs"
            >
              😴 Sleep issues
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Work is overwhelming")}
              className="text-xs"
            >
              💼 Work stress
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StressChatbot;
