import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, Clock, Zap } from "lucide-react";

interface AnimatedStatusIndicatorProps {
  status: 'active' | 'inactive' | 'busy' | 'offline' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
}

export function AnimatedStatusIndicator({ 
  status, 
  size = 'md', 
  showText = false, 
  animated = true 
}: AnimatedStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          text: 'Active',
          pulseColor: 'animate-pulse bg-green-400',
          dotColor: 'bg-green-500'
        };
      case 'busy':
        return {
          icon: Zap,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          text: 'Busy',
          pulseColor: 'animate-pulse bg-yellow-400',
          dotColor: 'bg-yellow-500'
        };
      case 'inactive':
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          text: 'Inactive',
          pulseColor: 'animate-pulse bg-gray-400',
          dotColor: 'bg-gray-500'
        };
      case 'offline':
        return {
          icon: XCircle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          borderColor: 'border-gray-400/30',
          text: 'Offline',
          pulseColor: 'bg-gray-400',
          dotColor: 'bg-gray-400'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          text: 'Error',
          pulseColor: 'animate-pulse bg-red-400',
          dotColor: 'bg-red-500'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/30',
          text: 'Unknown',
          pulseColor: 'bg-gray-400',
          dotColor: 'bg-gray-500'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: 'w-6 h-6',
      icon: 'w-3 h-3',
      dot: 'w-2 h-2',
      text: 'text-xs'
    },
    md: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4',
      dot: 'w-3 h-3',
      text: 'text-sm'
    },
    lg: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      dot: 'w-4 h-4',
      text: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  if (showText) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className={cn(
              classes.container,
              config.bgColor,
              config.borderColor,
              "rounded-full border-2 flex items-center justify-center transition-all duration-300"
            )}
          >
            <Icon className={cn(classes.icon, config.color)} />
          </div>
          
          {animated && status !== 'offline' && (
            <div className="absolute inset-0 rounded-full">
              <div className={cn(
                classes.container,
                config.pulseColor,
                "rounded-full opacity-20"
              )} />
            </div>
          )}
        </div>
        
        <span className={cn(classes.text, config.color, "font-medium")}>
          {config.text}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main status indicator */}
      <div
        className={cn(
          classes.container,
          config.bgColor,
          config.borderColor,
          "rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110"
        )}
      >
        <Icon className={cn(classes.icon, config.color)} />
      </div>
      
      {/* Animated pulse ring */}
      {animated && status !== 'offline' && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping opacity-30">
            <div className={cn(classes.container, config.dotColor, "rounded-full")} />
          </div>
          <div className="absolute inset-0 rounded-full animate-pulse opacity-20">
            <div className={cn(classes.container, config.dotColor, "rounded-full")} />
          </div>
        </>
      )}
      
      {/* Activity dot for active status */}
      {status === 'active' && (
        <div className="absolute -top-1 -right-1">
          <div className={cn(
            classes.dot,
            "bg-green-500 rounded-full animate-bounce",
            "shadow-lg shadow-green-500/50"
          )} />
        </div>
      )}
      
      {/* Busy indicator animation */}
      {status === 'busy' && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}