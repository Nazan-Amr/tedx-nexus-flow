import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Home } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface NavigationHeaderProps {
  title: string;
  description?: string;
}

export function NavigationHeader({ title, description }: NavigationHeaderProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'management_board':
        return 'bg-primary text-primary-foreground';
      case 'high_board':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div>
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className={getRoleBadgeColor(profile.role)}>
              {formatRole(profile.role)}
            </Badge>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  {profile.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{profile.full_name}</p>
                <p className="text-muted-foreground">{profile.department}</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}