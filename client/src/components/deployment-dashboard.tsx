import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Agent } from "@shared/schema";
import { 
  Container, 
  Server, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Play,
  Square,
  RotateCcw,
  TrendingUp,
  Database,
  Network
} from "lucide-react";

interface DeploymentDashboardProps {
  agents: Agent[];
}

// Simple UI components
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className}`}>{children}</div>;
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
  variant?: "default" | "outline" | "danger";
  className?: string;
}) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  const variantClasses = 
    variant === "outline" ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" :
    variant === "danger" ? "bg-red-600 text-white hover:bg-red-700" :
    "bg-blue-600 text-white hover:bg-blue-700";
  
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

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "success" | "warning" | "danger" | "default" }) {
  const variantClasses = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800", 
    danger: "bg-red-100 text-red-800",
    default: "bg-gray-100 text-gray-800"
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

export function DeploymentDashboard({ agents }: DeploymentDashboardProps) {
  const [selectedNamespace, setSelectedNamespace] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Deploy multiple agents
  const bulkDeployMutation = useMutation({
    mutationFn: async (agentIds: string[]) => {
      const deployPromises = agentIds.map(id => 
        apiRequest(`/api/agents/${id}/container/deploy`, { method: "POST" })
      );
      return await Promise.all(deployPromises);
    },
    onSuccess: () => {
      toast({
        title: "Deployment Started",
        description: "All selected agents are being deployed to Kubernetes",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    },
    onError: (error) => {
      toast({
        title: "Deployment Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Scale cluster
  const scaleClusterMutation = useMutation({
    mutationFn: async ({ action }: { action: "scale-up" | "scale-down" }) => {
      return await apiRequest("/api/cluster/scale", {
        method: "POST",
        body: JSON.stringify({ action }),
      });
    },
    onSuccess: (_, { action }) => {
      toast({
        title: "Cluster Scaling",
        description: `Kubernetes cluster is ${action === "scale-up" ? "scaling up" : "scaling down"}`,
      });
    },
  });

  const deployableAgents = agents.filter(agent => agent.dockerImage);
  const onlineAgents = agents.filter(agent => agent.status === "online");
  const offlineAgents = agents.filter(agent => agent.status === "offline");

  // Kubernetes namespace grouping
  const namespaces = {
    "customer-experience": agents.filter(a => a.team.toLowerCase().includes("customer")),
    "analytics": agents.filter(a => a.team.toLowerCase().includes("analytics")),
    "marketing": agents.filter(a => a.team.toLowerCase().includes("marketing")),
    "operations": agents.filter(a => a.team.toLowerCase().includes("operations")),
    "hr": agents.filter(a => a.team.toLowerCase().includes("hr") || a.team.toLowerCase().includes("human")),
    "finance": agents.filter(a => a.team.toLowerCase().includes("finance")),
  };

  return (
    <div className="space-y-6">
      {/* Deployment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <Container className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Containers</p>
              <p className="text-2xl font-bold">{agents.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold">{onlineAgents.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-2xl font-bold">{offlineAgents.length}</p>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Deployable</p>
              <p className="text-2xl font-bold">{deployableAgents.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Kubernetes Cluster Status */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Server className="h-5 w-5" />
            Kubernetes Cluster Status
          </h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => scaleClusterMutation.mutate({ action: "scale-up" })}
              disabled={scaleClusterMutation.isPending}
            >
              Scale Up
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => scaleClusterMutation.mutate({ action: "scale-down" })}
              disabled={scaleClusterMutation.isPending}
            >
              Scale Down
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-3">Node Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Worker Nodes</span>
                <Badge variant="success">3 Ready</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Master Nodes</span>
                <Badge variant="success">1 Ready</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total CPU</span>
                <span className="text-sm font-medium">12 cores</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Memory</span>
                <span className="text-sm font-medium">32 GB</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Pod Distribution</h4>
            <div className="space-y-2">
              {Object.entries(namespaces).map(([namespace, nsAgents]) => (
                <div key={namespace} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{namespace.replace("-", " ")}</span>
                  <span className="text-sm font-medium">{nsAgents.length} pods</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Resource Usage</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>68%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "68%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage Usage</span>
                  <span>32%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "32%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Namespace Management */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Network className="h-5 w-5" />
            Namespace Management
          </h3>
          <div className="flex gap-2">
            <select 
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Namespaces</option>
              {Object.keys(namespaces).map(ns => (
                <option key={ns} value={ns}>{ns.replace("-", " ")}</option>
              ))}
            </select>
            <Button 
              size="sm"
              onClick={() => bulkDeployMutation.mutate(deployableAgents.map(a => a.id))}
              disabled={bulkDeployMutation.isPending || deployableAgents.length === 0}
            >
              Deploy All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(namespaces).map(([namespace, nsAgents]) => {
            if (selectedNamespace !== "all" && selectedNamespace !== namespace) return null;
            
            return (
              <div key={namespace} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium capitalize flex items-center gap-2">
                    <Container className="h-4 w-4" />
                    {namespace.replace("-", " ")}
                  </h4>
                  <Badge variant={nsAgents.some(a => a.status === "online") ? "success" : "default"}>
                    {nsAgents.filter(a => a.status === "online").length}/{nsAgents.length} online
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {nsAgents.map(agent => (
                    <div key={agent.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === "online" ? "bg-green-500" : 
                          agent.status === "busy" ? "bg-yellow-500" : "bg-gray-400"
                        }`}></div>
                        <span className="text-sm font-medium">{agent.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-mono">
                          {agent.dockerImage?.split(":")[1] || "latest"}
                        </span>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="p-1"
                            disabled={agent.status === "online"}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="p-1"
                            disabled={agent.status === "offline"}
                          >
                            <Square className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="p-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Docker Registry Status */}
      <Card>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Database className="h-5 w-5" />
          Docker Registry Status
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-3">Registry Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Registry Status</span>
                <Badge variant="success">Healthy</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Uptime</span>
                <span className="text-sm font-medium">99.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Sync</span>
                <span className="text-sm font-medium">2 min ago</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Image Statistics</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Images</span>
                <span className="text-sm font-medium">{deployableAgents.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Storage Used</span>
                <span className="text-sm font-medium">4.2 GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Latest Push</span>
                <span className="text-sm font-medium">15 min ago</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Recent Images</h4>
            <div className="space-y-1">
              {deployableAgents.slice(0, 3).map(agent => (
                <div key={agent.id} className="text-xs font-mono text-gray-600 truncate">
                  {agent.dockerImage}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}