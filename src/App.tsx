import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useVibeTuneStore } from "@/lib/store";
import { OnboardingScreen } from "@/pages/OnboardingScreen";
import { AuthScreen } from "@/pages/AuthScreen";
import { LevelSelectionScreen } from "@/pages/LevelSelectionScreen";
import { PlacementTestScreen } from "@/pages/PlacementTestScreen";
import { ChatScreen } from "@/pages/ChatScreen";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import { supabase } from "@/integrations/supabase/client";
const queryClient = new QueryClient();

const AppRouter = () => {
  const { user, session, setUser, setSession } = useVibeTuneStore();

  // Initialize Supabase auth state globally
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(null);
      if (session?.user) {
        // Defer profile fetch to avoid deadlocks
        setTimeout(() => {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) setUser(profile);
            });
        }, 0);
      }
    });

    // Also load existing session on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) setUser(profile);
          });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser]);

  // Not authenticated - show onboarding/auth flow
  if (!session || !user) {
    return (
      <Routes>
        <Route path="/" element={<OnboardingScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Authenticated but no placement test - redirect to level selection
  if (!user.placement_test_completed) {
    return (
      <AppLayout>
        <Routes>
          <Route path="/level-selection" element={<LevelSelectionScreen />} />
          <Route path="/placement-test" element={<PlacementTestScreen />} />
          <Route path="*" element={<Navigate to="/level-selection" replace />} />
        </Routes>
      </AppLayout>
    );
  }

  // Fully set up user - show main app
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/history" element={<div className="p-4">History Coming Soon</div>} />
        <Route path="/placement-test" element={<PlacementTestScreen />} />
        <Route path="/profile" element={<div className="p-4">Profile Coming Soon</div>} />
        <Route path="/settings" element={<div className="p-4">Settings Coming Soon</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
