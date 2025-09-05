import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Shield, Users } from 'lucide-react';

export function AuthHeader() {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex items-center gap-4 ml-auto">
      <div className="flex items-center gap-2">
        <Badge 
          variant={isAdmin ? "default" : "secondary"} 
          className={`gap-1 ${isAdmin ? 'bg-purple-600 text-white' : 'bg-gray-600 text-white'}`}
        >
          {isAdmin ? <Shield className="h-3 w-3" /> : <Users className="h-3 w-3" />}
          {user.role === 'admin' ? 'Admin' : 'Member'}
        </Badge>
        {user.team && (
          <Badge variant="outline" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
            {user.team}
          </Badge>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:text-white transition-all"
          >
            <User className="h-4 w-4" />
            {user.firstName || user.username}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm text-gray-500">
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-xs">{user.email}</div>
          </div>
          <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600">
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}