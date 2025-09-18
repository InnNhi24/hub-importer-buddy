import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Mic, Play, Square, RotateCcw } from 'lucide-react';
import { useVibeTuneStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const placementQuestions = [
  {
    id: 1,
    type: 'pronunciation',
    text: "Please read this sentence aloud: 'The quick brown fox jumps over the lazy dog.'",
    focus: 'Basic pronunciation and rhythm',
  },
  {
    id: 2,
    type: 'stress',
    text: "Say this word with correct stress: 'PHOTOGRAPH' vs 'photoGRAPHic'",
    focus: 'Word stress patterns',
  },
  {
    id: 3,
    type: 'intonation',
    text: "Ask this question with rising intonation: 'Are you coming to the party?'",
    focus: 'Question intonation',
  },
  {
    id: 4,
    type: 'rhythm',
    text: "Read with natural rhythm: 'I would have gone to the store if I had had more time.'",
    focus: 'Connected speech and rhythm',
  },
];

export const PlacementTestScreen = () => {
  const navigate = useNavigate();
  const { user, setUser, placementTestProgress, setPlacementTestProgress } = useVibeTuneStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<{ [key: number]: string }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const progress = ((currentQuestion + 1) / placementQuestions.length) * 100;

  useEffect(() => {
    setPlacementTestProgress(progress);
  }, [progress, setPlacementTestProgress]);

  const handleStartRecording = () => {
    setIsRecording(true);
    // TODO: Implement actual recording logic
    toast({
      title: "Recording Started",
      description: "Speak clearly into your microphone",
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Implement actual recording stop logic
    const recordingId = `recording_${currentQuestion}_${Date.now()}`;
    setRecordings(prev => ({
      ...prev,
      [currentQuestion]: recordingId
    }));
    
    toast({
      title: "Recording Saved",
      description: "Your response has been recorded",
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < placementQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleCompleteTest();
    }
  };

  const handleCompleteTest = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      // Create placement test conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          profile_id: user.id,
          topic: 'Placement Test',
          is_placement_test: true,
        })
        .select()
        .single();

      if (convError) throw convError;

      // Simulate AI analysis (in production, this would call your AI service)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Determine level based on recordings (simplified logic)
      const completedQuestions = Object.keys(recordings).length;
      let assessedLevel = 'beginner';
      
      if (completedQuestions >= 3) {
        assessedLevel = 'intermediate';
      }
      if (completedQuestions === 4) {
        assessedLevel = 'advanced';
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          level: assessedLevel,
            placement_test_completed: true
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser({
        ...user,
        level: assessedLevel,
        placement_test_completed: true,
      });

      setTestResults({
        level: assessedLevel,
        strengths: ['Clear pronunciation', 'Good rhythm'],
        improvements: ['Intonation patterns', 'Word stress'],
      });

      toast({
        title: "Test Complete!",
        description: `Your level has been assessed as ${assessedLevel}`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetakeTest = () => {
    setCurrentQuestion(0);
    setRecordings({});
    setTestResults(null);
    setPlacementTestProgress(0);
  };

  if (testResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Placement Test Results</CardTitle>
            <CardDescription>Here's your personalized assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Badge className="text-lg px-4 py-2 bg-success text-success-foreground">
                {testResults.level.toUpperCase()} LEVEL
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-success">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {testResults.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-accent">Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {testResults.improvements.map((improvement: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/chat')} className="flex-1 max-w-xs">
                Start Learning
              </Button>
              <Button variant="outline" onClick={handleRetakeTest}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Analyzing Your Responses</h2>
            <p className="text-muted-foreground">
              Our AI is processing your pronunciation to determine your level...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = placementQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Placement Test</h1>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {placementQuestions.length}
          </p>
          <Progress value={progress} className="w-full" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">{question.focus}</Badge>
              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1}/{placementQuestions.length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg leading-relaxed">{question.text}</p>
            </div>

            <div className="flex justify-center">
              {!isRecording ? (
                <Button
                  size="lg"
                  onClick={handleStartRecording}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg"
                  disabled={!!recordings[currentQuestion]}
                >
                  <Mic className="w-6 h-6 mr-2" />
                  {recordings[currentQuestion] ? 'Recorded' : 'Start Recording'}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={handleStopRecording}
                  variant="destructive"
                  className="px-8 py-6 text-lg animate-pulse"
                >
                  <Square className="w-6 h-6 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>

            {recordings[currentQuestion] && (
              <div className="text-center space-y-4">
                <Badge className="bg-success text-success-foreground">
                  Response Recorded
                </Badge>
                <Button
                  onClick={handleNextQuestion}
                  className="w-full"
                >
                  {currentQuestion === placementQuestions.length - 1 ? 
                    'Complete Test' : 
                    'Next Question'
                  }
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};