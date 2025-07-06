
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/types/chat";
import { getLocalStressRecommendations } from "@/utils/stressRecommendations";
import ChatMessage from "./chat/ChatMessage";
import TypingIndicator from "./chat/TypingIndicator";
import ChatInput from "./chat/ChatInput";
import QuickActions from "./chat/QuickActions";

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
          message: inputValue
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleQuickAction = (message: string) => {
    setInputValue(message);
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
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
          />

          {/* Quick Actions */}
          <QuickActions onQuickAction={handleQuickAction} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StressChatbot;
