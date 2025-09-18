import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, User, Clock, Star } from 'lucide-react';
import { useVibeTuneStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const LevelSelectionScreen = () => {
  const navigate = useNavigate();
  const { user, setUser } = useVibeTuneStore();
  const [isLoading, setIsLoading] = useState(false);

  const levels = [
    { 
      id: 'beginner', 
      name: 'Beginner', 
      description: 'Just starting with English pronunciation',
      color: 'bg-green-100 text-green-800'
    },
    { 
      id: 'intermediate', 
      name: 'Intermediate', 
      description: 'Have some experience with English pronunciation',
      color: 'bg-yellow-100 text-yellow-800'
    },
    { 
      id: 'advanced', 
      name: 'Advanced', 
      description: 'Looking to perfect subtle pronunciation details',
      color: 'bg-red-100 text-red-800'
    },
  ];

  const handleTakePlacementTest = () => {
    navigate('/placement-test');
  };

  const handleSelectLevel = async (levelId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          level: levelId,
          placement_test_completed: true 
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({
        ...user,
        level: levelId,
        placement_test_completed: true,
      });

      toast({
        title: "Level Set!",
        description: `You've selected ${levelId} level. You can always retake the placement test later.`,
      });

      navigate('/chat');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Choose Your Path</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let's find the right starting point for your English prosody journey. 
            You can take our placement test for a personalized assessment, or choose your level directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Placement Test Option */}
          <Card className="border-2 border-accent bg-accent/5 hover:bg-accent/10 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <TestTube className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl">Take Placement Test</CardTitle>
              <CardDescription>
                Get a personalized assessment of your pronunciation skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">5-10 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">AI-powered assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Personalized learning plan</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={handleTakePlacementTest}
                disabled={isLoading}
              >
                Start Placement Test
              </Button>
            </CardContent>
          </Card>

          {/* Self-Select Level */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Self-Select Level</CardTitle>
              <CardDescription>
                Choose your level based on your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {levels.map((level) => (
                  <div key={level.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={level.color}>
                          {level.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {level.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectLevel(level.id)}
                      disabled={isLoading}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                You can always retake the placement test later to adjust your level
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};