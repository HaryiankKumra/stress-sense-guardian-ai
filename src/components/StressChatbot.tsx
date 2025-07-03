
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
      content: "Hi! I'm your AI stress management assistant. I'm here to help you with relaxation techniques, breathing exercises, and personalized stress relief strategies. How are you feeling right now?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      // Call GPT via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('stress-chatbot', {
        body: { 
          message: `Please answer stress management related questions as this is only a stress management app. If user asks any other thing, say "I don't know" and stick to stress management topics only! User message: ${inputValue}` 
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response || "I'm here to help with stress management. Could you tell me more about what's concerning you?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      // Fallback to local responses
      const recommendation = getLocalStressRecommendations(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: recommendation.response,
        timestamp: new Date(),
        stressLevel: recommendation.stressLevel,
      };

      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: "Using Offline Mode",
        description: "ChatGPT unavailable, using local responses",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  const getLocalStressRecommendations = (userMessage: string) => {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getStressLevelColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          AI Stress Management Chatbot
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">✅ Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-purple-600 text-white'
                }`}>
                  {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`max-w-xs lg:max-w-md ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 border border-slate-600 text-white'
                  }`}>
                    <p className="whitespace-pre-line">{message.content}</p>
                    {message.stressLevel && (
                      <Badge className={`mt-2 ${getStressLevelColor(message.stressLevel)} border`}>
                        Stress Level: {message.stressLevel}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-purple-600 text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-700 border border-slate-600 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
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
              className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              😰 I'm stressed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("I need breathing exercises")}
              className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              🫁 Breathing help
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("I can't sleep")}
              className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              😴 Sleep issues
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputValue("Work is overwhelming")}
              className="text-xs border-slate-600 text-slate-300 hover:bg-slate-700"
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
