import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity, Clock, Zap } from "lucide-react";

interface PerformanceMetric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change?: number;
  target?: number;
}

interface AgentPerformanceChartProps {
  agentId: string;
  agentName: string;
  animated?: boolean;
  compact?: boolean;
}

export function AgentPerformanceChart({ 
  agentId, 
  agentName, 
  animated = true, 
  compact = false 
}: AgentPerformanceChartProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate real-time performance data
  useEffect(() => {
    const generateMetrics = (): PerformanceMetric[] => {
      const baseMetrics = [
        {
          label: "Response Time",
          value: Math.floor(Math.random() * 200) + 50,
          unit: "ms",
          trend: (Math.random() > 0.5 ? 'up' : 'down') as 'up' | 'down' | 'stable',
          change: Math.floor(Math.random() * 20) - 10,
          target: 200
        },
        {
          label: "Success Rate",
          value: Math.floor(Math.random() * 15) + 85,
          unit: "%",
          trend: (Math.random() > 0.3 ? 'up' : 'stable') as 'up' | 'down' | 'stable',
          change: Math.floor(Math.random() * 5),
          target: 95
        },
        {
          label: "Throughput",
          value: Math.floor(Math.random() * 500) + 100,
          unit: "req/min",
          trend: (Math.random() > 0.4 ? 'up' : 'down') as 'up' | 'down' | 'stable',
          change: Math.floor(Math.random() * 50) - 25,
          target: 400
        },
        {
          label: "CPU Usage",
          value: Math.floor(Math.random() * 40) + 20,
          unit: "%",
          trend: (Math.random() > 0.6 ? 'up' : 'stable') as 'up' | 'down' | 'stable',
          change: Math.floor(Math.random() * 10) - 5,
          target: 70
        },
        {
          label: "Memory Usage",
          value: Math.floor(Math.random() * 30) + 40,
          unit: "%",
          trend: (Math.random() > 0.5 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
          change: Math.floor(Math.random() * 8) - 4,
          target: 80
        },
        {
          label: "Active Sessions",
          value: Math.floor(Math.random() * 50) + 10,
          unit: "",
          trend: (Math.random() > 0.4 ? 'up' : 'stable') as 'up' | 'down' | 'stable',
          change: Math.floor(Math.random() * 10) - 5,
          target: 100
        }
      ];

      return baseMetrics.slice(0, compact ? 3 : 6);
    };

    const updateMetrics = () => {
      setMetrics(generateMetrics());
      setIsLoading(false);
    };

    // Initial load
    updateMetrics();

    // Update every 5 seconds for real-time effect
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [agentId, compact]);

  const getMetricIcon = (label: string) => {
    if (label.includes('Response') || label.includes('Time')) return Clock;
    if (label.includes('Success') || label.includes('Rate')) return TrendingUp;
    if (label.includes('Throughput') || label.includes('Sessions')) return Activity;
    if (label.includes('CPU') || label.includes('Memory')) return Zap;
    return Activity;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Activity;
  };

  const getTrendColor = (trend: string, label: string) => {
    // For metrics where lower is better (like response time, CPU usage)
    const lowerIsBetter = label.includes('Response') || label.includes('CPU') || label.includes('Memory');
    
    if (trend === 'up') {
      return lowerIsBetter ? 'text-red-500' : 'text-green-500';
    }
    if (trend === 'down') {
      return lowerIsBetter ? 'text-green-500' : 'text-red-500';
    }
    return 'text-gray-500';
  };

  const getProgressColor = (value: number, target: number, label: string) => {
    const lowerIsBetter = label.includes('Response') || label.includes('CPU') || label.includes('Memory');
    const ratio = value / target;
    
    if (lowerIsBetter) {
      if (ratio <= 0.7) return 'bg-green-500';
      if (ratio <= 0.9) return 'bg-yellow-500';
      return 'bg-red-500';
    } else {
      if (ratio >= 0.9) return 'bg-green-500';
      if (ratio >= 0.7) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: compact ? 3 : 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = getMetricIcon(metric.label);
          const TrendIcon = getTrendIcon(metric.trend);
          
          return (
            <Card 
              key={metric.label}
              className={cn(
                "transition-all duration-300 hover:shadow-md",
                animated && "animate-in fade-in zoom-in"
              )}
              style={animated ? { animationDelay: `${index * 100}ms` } : undefined}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <TrendIcon className={cn(
                    "w-3 h-3",
                    getTrendColor(metric.trend, metric.label)
                  )} />
                </div>
                
                <div className="text-lg font-bold text-gray-800">
                  {metric.value}
                  <span className="text-xs text-gray-500 ml-1">{metric.unit}</span>
                </div>
                
                <div className="text-xs text-gray-600 mt-1">
                  {metric.label}
                </div>
                
                {metric.target && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Target: {metric.target}{metric.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-500",
                          getProgressColor(metric.value, metric.target, metric.label)
                        )}
                        style={{ 
                          width: `${Math.min((metric.value / metric.target) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Performance Metrics
          </div>
          <Badge variant="outline" className="text-xs">
            {agentName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const Icon = getMetricIcon(metric.label);
            const TrendIcon = getTrendIcon(metric.trend);
            
            return (
              <div 
                key={metric.label}
                className={cn(
                  "p-4 rounded-lg border bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-md hover:scale-105",
                  animated && "animate-in slide-in-from-bottom-2 fade-in"
                )}
                style={animated ? { animationDelay: `${index * 150}ms` } : undefined}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-sm text-gray-700">
                      {metric.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <TrendIcon className={cn(
                      "w-4 h-4",
                      getTrendColor(metric.trend, metric.label)
                    )} />
                    {metric.change && (
                      <span className={cn(
                        "text-xs font-medium",
                        getTrendColor(metric.trend, metric.label)
                      )}>
                        {metric.change > 0 ? '+' : ''}{metric.change}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  {metric.value}
                  <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                </div>
                
                {metric.target && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Target: {metric.target}{metric.unit}</span>
                      <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-1000 ease-out",
                          getProgressColor(metric.value, metric.target, metric.label)
                        )}
                        style={{ 
                          width: animated ? 
                            `${Math.min((metric.value / metric.target) * 100, 100)}%` : 
                            '0%',
                          transitionDelay: animated ? `${index * 200 + 500}ms` : '0ms'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}