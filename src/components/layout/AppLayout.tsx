import { useEffect } from 'react';
import { useVibeTuneStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { SyncStatusIndicator } from '@/components/common/SyncStatusIndicator';
import { toast } from '@/hooks/use-toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { setUser, setSession, user } = useVibeTuneStore();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user && !user) {
          // Fetch user profile
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              setUser(profile);
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            toast({
              title: "Welcome to VibeTune!",
              description: "Let's set up your profile to get started.",
              variant: "default",
            });
          }
        } else if (!session) {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Fetch profile if we have a session but no user
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setUser(profile);
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, user]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <AppHeader />
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          
          <SyncStatusIndicator />
        </div>
      </div>
    </SidebarProvider>
  );
};