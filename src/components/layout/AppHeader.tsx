import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, RotateCcw } from 'lucide-react';
import { useVibeTuneStore } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

export const AppHeader = () => {
  const { user } = useVibeTuneStore();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">V</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">VibeTune</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user?.placement_test_completed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/placement-test')}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Redo Test
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4" />
        </Button>

        {user && (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {user.username?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
};