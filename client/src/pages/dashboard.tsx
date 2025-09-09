import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { AgentCard } from "@/components/agent-card";
import { AgentDemoModal } from "@/components/agent-demo-modal";
import { AgentRegistrationForm } from "@/components/agent-registration-form";
import { AgentDetailsModal } from "@/components/agent-details-modal";
import { USTHeader } from "@/components/ust-header";
import { AuthHeader } from "@/components/auth-header";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, Plus, Activity, Users, Server, TrendingUp, Store, Shield } from "lucide-react";
import { useState } from "react";
import type { Agent, SystemMetric, ActivityLog } from "@shared/schema";
import { apiClient } from "@/lib/apiClient";


export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsAgent, setDetailsAgent] = useState<Agent | null>(null);

  const { data: agents = [], isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ["/agents"], // Note: Removed '/api' as our client will add it
    queryFn: apiClient,
  });

  const { data: stats } = useQuery<{
    totalAgents: number;
    activeAgents: number;
    offlineAgents: number;
    agentTypes: Record<string, number>;
  }>({
    queryKey: ["/stats"], // Removed '/api'
    queryFn: apiClient,
  });

  const { data: activityLogs = [] } = useQuery<ActivityLog[]>({
    queryKey: ["/activity-logs"], // Removed '/api'
    queryFn: apiClient,
  });

  const { data: systemMetrics = [] } = useQuery<SystemMetric[]>({
    queryKey: ["/system-metrics"], // Removed '/api'
    queryFn: apiClient,
  });

  const handleOpenDemo = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsDemoModalOpen(true);
  };

  const handleOpenDetails = (agent: Agent) => {
    setLocation(`/agent/${agent.id}`);
  };

  const handleCloseDemo = () => {
    setSelectedAgent(null);
    setIsDemoModalOpen(false);
  };

  const formatTimeAgo = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getMetricValue = (metricName: string) => {
    const metric = systemMetrics.find(m => m.metric === metricName);
    return metric?.value || "N/A";
  };

  const getProgressWidth = (value: string) => {
    const numValue = parseFloat(value.replace('%', ''));
    return isNaN(numValue) ? 0 : numValue;
  };

  if (agentsLoading) {
    return (
      <div className="min-h-screen bg-ust-neutral-50">
        <USTHeader />
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ust-primary-500 mx-auto"></div>
              <p className="mt-2 text-ust-neutral-500">Loading agents...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ust-neutral-50 chrome-optimized safari-optimized">
      <USTHeader />
      <div className="flex h-screen">
        <Sidebar stats={stats} />
        
        <main className="flex-1 overflow-y-auto scroll-container">
          <div className="px-6 py-6 space-y-6 fade-in">
            {/* Access Level Notice */}
            <div className="bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <>
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-purple-900">Administrator Access</h3>
                      <p className="text-sm text-purple-700">You have access to all agents across all teams in the organization.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 text-teal-600" />
                    <div>
                      <h3 className="font-semibold text-teal-900">Team Member Access</h3>
                      <p className="text-sm text-teal-700">
                        You have access to agents assigned to your team: <span className="font-medium">{user?.team}</span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Compact Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white border-l-4 border-l-blue-500 border-gray-200 hover:shadow-sm transition-all duration-200">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-800">{stats?.totalAgents || 0}</div>
                      <p className="text-xs text-gray-500">Total Agents</p>
                    </div>
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-l-4 border-l-green-500 border-gray-200 hover:shadow-sm transition-all duration-200">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-800">{stats?.activeAgents || 0}</div>
                      <p className="text-xs text-gray-500">Active Agents</p>
                    </div>
                    <Activity className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-l-4 border-l-cyan-500 border-gray-200 hover:shadow-sm transition-all duration-200">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-800">24</div>
                      <p className="text-xs text-gray-500">Containers</p>
                    </div>
                    <Server className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-l-4 border-l-purple-500 border-gray-200 hover:shadow-sm transition-all duration-200">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-800">98.7%</div>
                      <p className="text-xs text-gray-500">Performance</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-bold text-gray-800">Agent Management</h2>
                <p className="mt-1 text-lg text-gray-600">Monitor and orchestrate containerized AI agents</p>
              </div>
              
              <div className="flex space-x-3">
                <Link href="/marketplace">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200">
                    <Store className="w-4 h-4 mr-2" />
                    Marketplace
                  </Button>
                </Link>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <AgentRegistrationForm>
                  <Button className="bg-gray-800 text-white hover:bg-gray-900 transition-all duration-200 shadow-md hover:shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Register New Agent
                  </Button>
                </AgentRegistrationForm>
              </div>
            </div>
            
            {/* UST System Status Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-green-800">
                    UST Agent Platform operational. Docker registry connected. Kubernetes cluster healthy.
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="flex items-center space-x-4 text-sm text-green-600">
                    <span>Registry: Online</span>
                    <span>•</span>
                    <span>K8s: Healthy</span>
                    <span>•</span>
                    <span>Last sync: 2 min ago</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Agent Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent: Agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onDemo={() => handleOpenDemo(agent)}
                  onDetails={() => handleOpenDetails(agent)}
                />
              ))}
            </div>
            
            {/* Recent Activity & Logs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Recent Activity</CardTitle>
                  <p className="text-base text-gray-500">Latest agent interactions and system events</p>
                </CardHeader>
                <CardContent>
                  <div className="flow-root">
                    <ul className="-mb-8 space-y-6">
                      {activityLogs.map((log, index) => (
                        <li key={log.id}>
                          <div className="relative pb-8">
                            {index < activityLogs.length - 1 && (
                              <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"></span>
                            )}
                            <div className="relative flex items-start space-x-3">
                              <div className="relative">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  log.type === 'interaction' ? 'bg-blue-100' :
                                  log.type === 'agent_registered' ? 'bg-green-100' :
                                  log.type === 'agent_status_change' ? 'bg-yellow-100' :
                                  'bg-purple-100'
                                }`}>
                                  {log.type === 'interaction' && (
                                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                  )}
                                  {log.type === 'agent_registered' && (
                                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                  )}
                                  {log.type === 'agent_status_change' && (
                                    <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                    </svg>
                                  )}
                                  {log.type === 'system_event' && (
                                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div>
                                  <div className="text-sm text-gray-900">{log.message}</div>
                                  <p className="mt-0.5 text-xs text-gray-500">
                                    {log.timestamp ? formatTimeAgo(log.timestamp) : 'Recently'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              {/* System Performance */}
              <Card className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                    System Performance
                  </CardTitle>
                  <p className="text-base text-gray-600">Real-time metrics and health indicators</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Docker Registry Status */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-medium text-gray-700">Docker Registry</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-sm">Healthy</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gray-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${getProgressWidth(getMetricValue('docker_registry_uptime'))}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {getMetricValue('docker_registry_uptime')} uptime · 156 containers stored
                    </p>
                  </div>
                  
                  {/* Kubernetes Cluster */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Kubernetes Cluster</span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">Running</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gray-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${getProgressWidth(getMetricValue('k8s_cluster_health'))}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">12 pods running · 3 nodes active</p>
                  </div>
                  
                  {/* Average Response Time */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Avg. Response Time</span>
                      <span className="text-xs font-medium text-gray-700">{getMetricValue('avg_response_time')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gray-600 h-3 rounded-full transition-all duration-500" style={{ width: "76%" }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Target: &lt;2.5s · Last 24 hours</p>
                  </div>
                  
                  {/* API Success Rate */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">API Success Rate</span>
                      <span className="text-xs font-medium text-gray-700">{getMetricValue('api_success_rate')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gray-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${getProgressWidth(getMetricValue('api_success_rate'))}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">2,341 requests processed today</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* UST Disclaimer Footer */}
            <div className="mt-8 pt-6 border-t border-ust-neutral-200">
              <div className="bg-ust-neutral-50 rounded-lg p-4 chrome-optimized">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-ust-neutral-600 font-medium">
                      © 2025 UST Global Inc. All rights reserved.
                    </p>
                    <p className="text-xs text-ust-neutral-500 mt-1">
                      This application is a proprietary asset of UST Global Inc. Unauthorized use, distribution, 
                      or modification is strictly prohibited. For internal use only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Agent Demo Modal */}
      {selectedAgent && (
        <AgentDemoModal
          agent={selectedAgent}
          isOpen={isDemoModalOpen}
          onClose={handleCloseDemo}
        />
      )}

      {/* Agent Details Modal */}
      {detailsAgent && (
        <AgentDetailsModal
          agent={detailsAgent}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </div>
  );
}
