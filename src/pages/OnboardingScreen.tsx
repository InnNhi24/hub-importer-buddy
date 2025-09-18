import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MessageCircle, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: Mic,
    title: 'Voice Practice',
    description: 'Practice English pronunciation with AI-powered feedback',
  },
  {
    icon: MessageCircle,
    title: 'Interactive Chat',
    description: 'Engage in natural conversations to improve fluency',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your improvement with detailed analytics',
  },
  {
    icon: Users,
    title: 'Personalized Learning',
    description: 'Adaptive lessons tailored to your skill level',
  },
];

export const OnboardingScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to VibeTune',
      subtitle: 'Your AI-powered English prosody coach',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Mic className="w-12 h-12 text-primary-foreground" />
          </div>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Master English intonation, rhythm, and stress patterns with personalized AI feedback.
          </p>
        </div>
      ),
    },
    {
      title: 'How VibeTune Works',
      subtitle: 'Four powerful features to accelerate your learning',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <feature.icon className="w-8 h-8 text-accent mx-auto mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
    {
      title: 'Ready to Start?',
      subtitle: 'Join thousands of learners improving their English',
      content: (
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full max-w-sm bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => navigate('/auth?mode=signup')}
            >
              Sign Up - It's Free
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full max-w-sm"
              onClick={() => navigate('/auth?mode=signin')}
            >
              Already have an account? Log In
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required • Start learning immediately
          </p>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <Card className="border-0 shadow-xl bg-card/95 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-foreground">
              {currentStepData.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {currentStepData.subtitle}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {currentStepData.content}
            
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-accent' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                >
                  Next
                </Button>
              ) : (
                <div className="w-16" /> // Spacer for layout balance
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};