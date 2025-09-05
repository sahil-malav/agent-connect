import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Agent } from "@shared/schema";
import { 
  Play, 
  Square, 
  RotateCcw, 
  Settings, 
  Activity, 
  Container,
  Cpu,
  HardDrive,
  Network
} from "lucide-react";

// Simple card components
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pb-4">{children}</div>;
}

function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
}

function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

function Button({ 
  children, 
  onClick, 
  disabled = false, 
  size = "default", 
  variant = "default",
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "default";
  variant?: "default" | "outline";
  className?: string;
}) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  const variantClasses = variant === "outline" 
    ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" 
    : "bg-blue-600 text-white hover:bg-blue-700";
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

interface ContainerManagementProps {
  agent: Agent;
}

interface ContainerMetrics {
  cpuUsage: string;
  memoryUsage: string;
  networkIO: string;
  diskIO: string;
  restartCount: number;
  uptime: string;
}

export function ContainerManagement({ agent }: ContainerManagementProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch container metrics
  const { data: metrics } = useQuery<ContainerMetrics>({
    queryKey: ["/api/agents", agent.id, "metrics"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Deployment actions
  const deployMutation = useMutation({
    mutationFn: async (action: string) => {
      return await apiRequest(`/api/agents/${agent.id}/container/${action}`, {
        method: "POST",
      });
    },
    onSuccess: (_, action) => {
      toast({
        title: "Success",
        description: `Container ${action} completed successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents", agent.id, "metrics"] });
      setIsDeploying(false);
    },
    onError: (error, action) => {
      toast({
        title: "Error",
        description: `Failed to ${action} container: ${error.message}`,
        variant: "destructive",
      });
      setIsDeploying(false);
    },
  });

  const scalingMutation = useMutation({
    mutationFn: async (replicas: number) => {
      return await apiRequest(`/api/agents/${agent.id}/scale`, {
        method: "POST",
        body: JSON.stringify({ replicas }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Agent scaled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to scale agent: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleContainerAction = (action: string) => {
    setIsDeploying(true);
    deployMutation.mutate(action);
  };

  const handleScale = (replicas: number) => {
    scalingMutation.mutate(replicas);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-100 text-green-800";
      case "offline": return "bg-red-100 text-red-800";
      case "deploying": return "bg-yellow-100 text-yellow-800";
      case "scaling": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Container Status and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Container className="h-5 w-5" />
            Container Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(agent.status)}>
                {agent.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600">
                Image: {agent.dockerImage || "No image specified"}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleContainerAction("start")}
                disabled={agent.status === "online" || isDeploying}
                size="sm"
                variant="outline"
              >
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
              
              <Button
                onClick={() => handleContainerAction("stop")}
                disabled={agent.status === "offline" || isDeploying}
                size="sm"
                variant="outline"
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
              
              <Button
                onClick={() => handleContainerAction("restart")}
                disabled={isDeploying}
                size="sm"
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restart
              </Button>
              
              <Button
                onClick={() => handleContainerAction("deploy")}
                disabled={isDeploying}
                size="sm"
              >
                <Settings className="h-4 w-4 mr-1" />
                {isDeploying ? "Deploying..." : "Deploy"}
              </Button>
            </div>
          </div>

          {/* Scaling Controls */}
          <div className="flex items-center gap-4 pt-2 border-t">
            <span className="text-sm font-medium">Replicas:</span>
            <div className="flex gap-2">
              {[1, 2, 3, 5].map((replicas) => (
                <Button
                  key={replicas}
                  onClick={() => handleScale(replicas)}
                  disabled={scalingMutation.isPending}
                  size="sm"
                  variant="outline"
                >
                  {replicas}
                </Button>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              Current: 1 replica
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Container Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Cpu className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium">CPU Usage</p>
                <p className="text-lg font-bold">{metrics?.cpuUsage || "0%"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <HardDrive className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Memory</p>
                <p className="text-lg font-bold">{metrics?.memoryUsage || "0 MB"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Network className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Network I/O</p>
                <p className="text-lg font-bold">{metrics?.networkIO || "0 KB/s"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <RotateCcw className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Restarts</p>
                <p className="text-lg font-bold">{metrics?.restartCount || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="font-medium">{metrics?.uptime || agent.uptime}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Last Health Check</span>
              <span className="font-medium">
                {agent.lastHealthCheck ? new Date(agent.lastHealthCheck).toLocaleString() : "Never"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kubernetes Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Kubernetes Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Namespace:</span>
              <span className="ml-2 text-gray-600">agent-{agent.team.toLowerCase().replace(/\s+/g, '-')}</span>
            </div>
            <div>
              <span className="font-medium">Service Type:</span>
              <span className="ml-2 text-gray-600">ClusterIP</span>
            </div>
            <div>
              <span className="font-medium">Port:</span>
              <span className="ml-2 text-gray-600">8080</span>
            </div>
            <div>
              <span className="font-medium">Health Check:</span>
              <span className="ml-2 text-gray-600">/health</span>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Resource Limits:</span>
              <div className="text-sm text-gray-600">
                CPU: 500m | Memory: 512Mi
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}