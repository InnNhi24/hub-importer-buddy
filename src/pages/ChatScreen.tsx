import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, Square, RotateCcw, Volume2 } from 'lucide-react';
import { useVibeTuneStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MessageBubbleProps {
  message: {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    prosody_feedback?: any;
    vocab_suggestions?: any;
    guidance?: string;
    created_at: string;
  };
  onRetry?: () => void;
}

const MessageBubble = ({ message, onRetry }: MessageBubbleProps) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'ml-12' : 'mr-12'}`}>
        <Card className={`${
          isUser 
            ? 'bg-accent text-accent-foreground' 
            : 'bg-card border'
        }`}>
          <CardContent className="p-3">
            <p className="text-sm leading-relaxed">{message.content}</p>
            
            {message.prosody_feedback && (
              <div className="mt-3 space-y-2">
                <Badge variant="outline" className="text-xs">
                  Pronunciation Feedback
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {message.guidance}
                </div>
              </div>
            )}
            
            {message.vocab_suggestions && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Vocabulary Suggestions
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
        
        {isUser && onRetry && (
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export const ChatScreen = () => {
  const { 
    user, 
    currentConversation, 
    messages, 
    setCurrentConversation, 
    addMessage, 
    setMessages,
    isRecording,
    setIsRecording,
  } = useVibeTuneStore();
  
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && !currentConversation) {
      initializeConversation();
    }
  }, [user, currentConversation]);

  const initializeConversation = async () => {
    if (!user) return;
    
    try {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          profile_id: user.id,
          topic: 'General Practice',
          is_placement_test: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentConversation(conversation);
      
      // Add welcome message
      const welcomeMessage = {
        id: `welcome_${Date.now()}`,
        conversation_id: conversation.id,
        sender: 'ai' as const,
        type: 'text' as const,
        content: `Hello ${user.username || 'there'}! I'm your VibeTune AI coach. I'm here to help you improve your English pronunciation, intonation, and rhythm. You can type a message or use the microphone to practice speaking. What would you like to work on today?`,
        created_at: new Date().toISOString(),
        version: 1,
      };
      
      addMessage(welcomeMessage);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendText = async () => {
    if (!textInput.trim() || !currentConversation) return;
    
    const userMessage = {
      id: `msg_${Date.now()}`,
      conversation_id: currentConversation.id,
      sender: 'user' as const,
      type: 'text' as const,
      content: textInput,
      created_at: new Date().toISOString(),
      version: 1,
    };
    
    addMessage(userMessage);
    setTextInput('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: `ai_${Date.now()}`,
        conversation_id: currentConversation.id,
        sender: 'ai' as const,
        type: 'text' as const,
        content: "I can see you're practicing text input. For the best pronunciation feedback, try using the microphone to speak your responses. This way, I can analyze your intonation, rhythm, and stress patterns. Would you like to try speaking your next response?",
        created_at: new Date().toISOString(),
        version: 1,
      };
      
      addMessage(aiResponse);
      setIsLoading(false);
    }, 1500);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Speak clearly into your microphone",
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    if (!currentConversation) return;
    
    // Simulate audio message
    const audioMessage = {
      id: `audio_${Date.now()}`,
      conversation_id: currentConversation.id,
      sender: 'user' as const,
      type: 'audio' as const,
      content: "[Audio message - analyzing pronunciation...]",
      audio_url: 'placeholder_audio_url',
      created_at: new Date().toISOString(),
      version: 1,
    };
    
    addMessage(audioMessage);
    setIsLoading(true);
    
    // Simulate AI analysis and response
    setTimeout(() => {
      const aiResponse = {
        id: `ai_analysis_${Date.now()}`,
        conversation_id: currentConversation.id,
        sender: 'ai' as const,
        type: 'text' as const,
        content: "Great pronunciation practice! I noticed good rhythm in your speech. For improvement, try emphasizing the stressed syllables more clearly. Would you like to practice with a specific phrase or continue with open conversation?",
        prosody_feedback: {
          rhythm_score: 8.5,
          intonation_score: 7.2,
          stress_score: 6.8,
        },
        guidance: "Focus on word stress patterns in multi-syllable words",
        vocab_suggestions: ["emphasize", "rhythm", "intonation"],
        created_at: new Date().toISOString(),
        version: 1,
      };
      
      addMessage(aiResponse);
      setIsLoading(false);
    }, 3000);
  };

  const handleRetry = (messageId: string) => {
    toast({
      title: "Retrying Analysis",
      description: "Getting fresh feedback on your pronunciation",
    });
    // TODO: Implement retry logic
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="border-b border-border p-4 bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Practice Session</h2>
            <p className="text-sm text-muted-foreground">
              Level: {user?.level || 'Not set'} • AI Pronunciation Coach
            </p>
          </div>
          <Badge variant="secondary" className="bg-success text-success-foreground">
            <div className="w-2 h-2 bg-success-foreground rounded-full mr-2" />
            Active
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRetry={() => handleRetry(message.id)}
          />
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%] mr-12">
              <Card className="bg-card border">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="text-sm text-muted-foreground ml-2">
                      AI is analyzing...
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card">
        <div className="flex items-end space-x-3">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Type your message or use the microphone..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
              disabled={isLoading}
            />
            <div className="text-xs text-muted-foreground">
              💡 Use voice input for pronunciation feedback
            </div>
          </div>
          
          <div className="flex space-x-2">
            {!isRecording ? (
              <Button
                size="icon"
                onClick={handleStartRecording}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading}
              >
                <Mic className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleStopRecording}
                variant="destructive"
                className="animate-pulse"
              >
                <Square className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              size="icon"
              onClick={handleSendText}
              disabled={!textInput.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};