import { NavLink, useLocation } from "react-router-dom";
import { Home, ListTodo, FileText, GraduationCap, CalendarDays, MessageSquare, Lightbulb, Megaphone, Wrench, BarChart3, User, Users, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Training", url: "/training", icon: GraduationCap },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Innovation", url: "/innovation", icon: Lightbulb },
  { title: "Feedback", url: "/feedback", icon: Megaphone },
  { title: "Tools", url: "/tools", icon: Wrench },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const analyticsItem = { title: "Analytics", url: "/analytics", icon: BarChart3 } as const;
  const profileItem = { title: "Profile", url: "/profile", icon: User } as const;
  const usersItem = { title: "Users", url: "/users", icon: Users } as const;

  const items = [...navItems, profileItem];
  if (profile?.role === "management_board") items.push(analyticsItem, usersItem);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
