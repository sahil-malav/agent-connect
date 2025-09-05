import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Brain, 
  Database, 
  Code, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Zap,
  Cpu,
  Network,
  Bot
} from "lucide-react";

interface Capability {
  name: string;
  level: number; // 0-100
  type: 'core' | 'specialized' | 'integration';
  description?: string;
}

interface CapabilityVisualizationProps {
  capabilities: string[] | Capability[];
  animated?: boolean;
  layout?: 'grid' | 'list' | 'compact';
  showProgress?: boolean;
}

export function CapabilityVisualization({ 
  capabilities, 
  animated = true, 
  layout = 'grid',
  showProgress = true
}: CapabilityVisualizationProps) {
  const [animationDelay, setAnimationDelay] = useState(0);

  useEffect(() => {
    if (animated) {
      setAnimationDelay(0);
      const timer = setInterval(() => {
        setAnimationDelay(prev => prev + 100);
      }, 100);
      
      const cleanup = setTimeout(() => {
        clearInterval(timer);
        setAnimationDelay(0);
      }, capabilities.length * 100 + 1000);
      
      return () => {
        clearInterval(timer);
        clearTimeout(cleanup);
      };
    }
  }, [capabilities, animated]);

  const getCapabilityIcon = (name: string) => {
    const normalizedName = name.toLowerCase();
    if (normalizedName.includes('ai') || normalizedName.includes('ml') || normalizedName.includes('neural')) return Brain;
    if (normalizedName.includes('data') || normalizedName.includes('sql') || normalizedName.includes('database')) return Database;
    if (normalizedName.includes('code') || normalizedName.includes('development') || normalizedName.includes('programming')) return Code;
    if (normalizedName.includes('chat') || normalizedName.includes('conversation') || normalizedName.includes('nlp')) return MessageSquare;
    if (normalizedName.includes('analytics') || normalizedName.includes('reporting') || normalizedName.includes('metrics')) return BarChart3;
    if (normalizedName.includes('security') || normalizedName.includes('auth') || normalizedName.includes('encryption')) return Shield;
    if (normalizedName.includes('performance') || normalizedName.includes('optimization') || normalizedName.includes('speed')) return Zap;
    if (normalizedName.includes('compute') || normalizedName.includes('processing') || normalizedName.includes('cpu')) return Cpu;
    if (normalizedName.includes('api') || normalizedName.includes('integration') || normalizedName.includes('network')) return Network;
    return Bot;
  };

  const getCapabilityColor = (name: string, type?: string) => {
    if (type === 'core') return 'bg-blue-500/20 text-blue-700 border-blue-200';
    if (type === 'specialized') return 'bg-purple-500/20 text-purple-700 border-purple-200';
    if (type === 'integration') return 'bg-green-500/20 text-green-700 border-green-200';
    
    const normalizedName = name.toLowerCase();
    if (normalizedName.includes('ai') || normalizedName.includes('ml')) return 'bg-purple-500/20 text-purple-700 border-purple-200';
    if (normalizedName.includes('data') || normalizedName.includes('analytics')) return 'bg-blue-500/20 text-blue-700 border-blue-200';
    if (normalizedName.includes('security')) return 'bg-red-500/20 text-red-700 border-red-200';
    if (normalizedName.includes('performance')) return 'bg-yellow-500/20 text-yellow-700 border-yellow-200';
    return 'bg-gray-500/20 text-gray-700 border-gray-200';
  };

  const normalizeCapabilities = (caps: string[] | Capability[]): Capability[] => {
    return caps.map((cap, index) => {
      if (typeof cap === 'string') {
        return {
          name: cap,
          level: Math.floor(Math.random() * 30) + 70, // Random level between 70-100
          type: index % 3 === 0 ? 'core' : index % 3 === 1 ? 'specialized' : 'integration'
        };
      }
      return cap;
    });
  };

  const normalizedCapabilities = normalizeCapabilities(capabilities);

  if (layout === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {normalizedCapabilities.map((capability, index) => {
          const Icon = getCapabilityIcon(capability.name);
          return (
            <Badge
              key={capability.name}
              variant="outline"
              className={cn(
                getCapabilityColor(capability.name, capability.type),
                "transition-all duration-300 hover:scale-105",
                animated && "animate-in slide-in-from-bottom-2 fade-in"
              )}
              style={animated ? { animationDelay: `${index * 100}ms` } : undefined}
            >
              <Icon className="w-3 h-3 mr-1" />
              {capability.name}
            </Badge>
          );
        })}
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="space-y-3">
        {normalizedCapabilities.map((capability, index) => {
          const Icon = getCapabilityIcon(capability.name);
          return (
            <div
              key={capability.name}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/80",
                animated && "animate-in slide-in-from-left-2 fade-in"
              )}
              style={animated ? { animationDelay: `${index * 150}ms` } : undefined}
            >
              <div className={cn(
                "p-2 rounded-full",
                getCapabilityColor(capability.name, capability.type)
              )}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{capability.name}</h4>
                  {showProgress && (
                    <span className="text-xs text-gray-500">{capability.level}%</span>
                  )}
                </div>
                
                {showProgress && (
                  <Progress 
                    value={capability.level} 
                    className="h-2 bg-gray-200"
                  />
                )}
                
                {capability.description && (
                  <p className="text-xs text-gray-500 mt-1">{capability.description}</p>
                )}
              </div>
              
              <Badge variant="outline" className="text-xs">
                {capability.type}
              </Badge>
            </div>
          );
        })}
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {normalizedCapabilities.map((capability, index) => {
        const Icon = getCapabilityIcon(capability.name);
        return (
          <Card
            key={capability.name}
            className={cn(
              "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 bg-white/60 backdrop-blur-sm",
              animated && "animate-in zoom-in fade-in"
            )}
            style={animated ? { animationDelay: `${index * 100}ms` } : undefined}
          >
            <CardContent className="p-4 text-center">
              <div className={cn(
                "w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                getCapabilityColor(capability.name, capability.type)
              )}>
                <Icon className="w-6 h-6" />
              </div>
              
              <h4 className="font-medium text-sm mb-2 text-gray-800">
                {capability.name}
              </h4>
              
              {showProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Proficiency</span>
                    <span className="text-xs font-medium">{capability.level}%</span>
                  </div>
                  
                  <div className="relative">
                    <Progress 
                      value={animated ? 0 : capability.level} 
                      className={cn(
                        "h-2 bg-gray-200 transition-all duration-1000 ease-out",
                        animated && "animate-in"
                      )}
                      style={animated ? { 
                        animationDelay: `${index * 100 + 500}ms`,
                        '--tw-enter-scale': '0'
                      } : undefined}
                    />
                    {animated && (
                      <div
                        className="absolute top-0 left-0 h-full bg-current rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${capability.level}%`,
                          animationDelay: `${index * 100 + 500}ms`
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
              
              <Badge 
                variant="outline" 
                className="mt-2 text-xs"
              >
                {capability.type}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}