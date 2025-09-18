import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  username: string;
  email: string;
  level?: string;
  placement_test_completed: boolean;
  created_at: string;
  last_login?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  type: 'text' | 'audio';
  content: string;
  audio_url?: string;
  prosody_feedback?: any;
  vocab_suggestions?: any;
  guidance?: string;
  retry_of_message_id?: string;
  version: number;
  created_at: string;
}

export interface Conversation {
  id: string;
  profile_id: string;
  topic?: string;
  is_placement_test: boolean;
  started_at: string;
  ended_at?: string;
}

interface VibeTuneState {
  // Auth
  user: Profile | null;
  session: any;
  
  // Chat
  currentConversation: Conversation | null;
  messages: Message[];
  
  // App State
  placementTestProgress: number;
  isRecording: boolean;
  
  // Sync
  sync: {
    online: boolean;
    lastSync: Date | null;
  };
  retryQueue: Message[];
  
  // Actions
  setUser: (user: Profile | null) => void;
  setSession: (session: any) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  setMessages: (messages: Message[]) => void;
  setPlacementTestProgress: (progress: number) => void;
  setIsRecording: (recording: boolean) => void;
  updateSyncStatus: (online: boolean) => void;
  addToRetryQueue: (message: Message) => void;
  removeFromRetryQueue: (messageId: string) => void;
}

export const useVibeTuneStore = create<VibeTuneState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      currentConversation: null,
      messages: [],
      placementTestProgress: 0,
      isRecording: false,
      sync: {
        online: navigator.onLine,
        lastSync: null,
      },
      retryQueue: [],
      
      // Actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      updateMessage: (messageId, updates) => set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      })),
      setMessages: (messages) => set({ messages }),
      setPlacementTestProgress: (progress) => set({ placementTestProgress: progress }),
      setIsRecording: (recording) => set({ isRecording: recording }),
      updateSyncStatus: (online) => set((state) => ({
        sync: { ...state.sync, online, lastSync: online ? new Date() : state.sync.lastSync }
      })),
      addToRetryQueue: (message) => set((state) => ({
        retryQueue: [...state.retryQueue, message]
      })),
      removeFromRetryQueue: (messageId) => set((state) => ({
        retryQueue: state.retryQueue.filter(msg => msg.id !== messageId)
      })),
    }),
    {
      name: 'vibetune-store',
      partialize: (state) => ({
        user: state.user,
        placementTestProgress: state.placementTestProgress,
        retryQueue: state.retryQueue,
      }),
    }
  )
);

// Online/offline sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useVibeTuneStore.getState().updateSyncStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useVibeTuneStore.getState().updateSyncStatus(false);
  });
}