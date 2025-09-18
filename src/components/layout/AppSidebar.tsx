import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { MessageCircle, History, User, TestTube } from 'lucide-react';
import { useVibeTuneStore } from '@/lib/store';

const navigationItems = [
  { title: 'Chat', url: '/chat', icon: MessageCircle },
  { title: 'History', url: '/history', icon: History },
  { title: 'Placement Test', url: '/placement-test', icon: TestTube },
  { title: 'Profile', url: '/profile', icon: User },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { user } = useVibeTuneStore();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50';

  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Progress</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2 text-sm">
                <div className="text-muted-foreground">Current Level:</div>
                <div className="font-medium text-foreground">
                  {user.level || 'Not assessed'}
                </div>
                <div className="text-muted-foreground mt-2">Status:</div>
                <div className="text-xs">
                  {user.placement_test_completed ? 
                    'Assessment complete' : 
                    'Assessment pending'
                  }
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};