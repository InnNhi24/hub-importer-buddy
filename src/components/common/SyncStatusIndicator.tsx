import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useVibeTuneStore } from '@/lib/store';

export const SyncStatusIndicator = () => {
  const { sync, retryQueue } = useVibeTuneStore();

  if (!sync.online) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="destructive" className="flex items-center gap-2 py-2 px-3">
          <WifiOff className="w-3 h-3" />
          Offline
          {retryQueue.length > 0 && (
            <span className="bg-destructive-foreground text-destructive rounded-full px-2 py-0.5 text-xs">
              {retryQueue.length}
            </span>
          )}
        </Badge>
      </div>
    );
  }

  if (retryQueue.length > 0) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Badge variant="outline" className="flex items-center gap-2 py-2 px-3">
          <Clock className="w-3 h-3" />
          Syncing {retryQueue.length}
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge variant="secondary" className="flex items-center gap-2 py-2 px-3">
        <Wifi className="w-3 h-3" />
        Online
      </Badge>
    </div>
  );
};