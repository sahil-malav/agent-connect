import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Activity, Settings, Play, Square, Container, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimatedStatusIndicator } from "@/components/animated-status-indicator";
import { CapabilityVisualization } from "@/components/capability-visualization";
import { AgentPerformanceChart } from "@/components/agent-performance-chart";

import type { Agent } from "@shared/schema";

export function AgentDetail() {
  const [, params] = useRoute("/agent/:id");
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'capabilities'>('overview');

  const handleBackToDashboard = () => {
    setLocation('/');
  };

  const { data: agent, isLoading, error } = useQuery<Agent>({
    queryKey: ['/api/agents', params?.id],
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" className="mb-6" onClick={handleBackToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Agent not found or access denied.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'Analytics':
        return <Activity className="w-8 h-8 text-blue-600" />;
      case 'Support':
        return <Zap className="w-8 h-8 text-green-600" />;
      case 'Development':
        return <Settings className="w-8 h-8 text-purple-600" />;
      case 'Marketing':
        return <Container className="w-8 h-8 text-orange-600" />;
      default:
        return <Activity className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleBackToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              className={agent.status === 'offline' ? 'opacity-50 cursor-not-allowed' : ''}
              disabled={agent.status === 'offline'}
            >
              {agent.status === 'active' ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {agent.status === 'active' ? 'Stop' : 'Start'} Agent
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        {/* Agent Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {getAgentIcon(agent.agentType)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{agent.name}</h1>
                  <p className="text-gray-600 mt-1">{agent.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="outline" className="px-3 py-1">
                      {agent.team}
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      {agent.agentType}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <AnimatedStatusIndicator
                status={agent.status === 'active' ? 'active' : agent.status === 'busy' ? 'busy' : 'offline'}
                size="lg"
                showText={true}
                animated={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'overview', label: 'Overview', icon: Activity },
            { key: 'performance', label: 'Performance', icon: Zap },
            { key: 'capabilities', label: 'Capabilities', icon: Settings }
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? 'default' : 'ghost'}
              onClick={() => setActiveTab(key as any)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Technology Stack</label>
                      <p className="text-gray-800 font-medium">{agent.techStack}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Agent Type</label>
                      <p className="text-gray-800 font-medium">{agent.agentType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Response Time</label>
                      <p className="text-gray-800 font-medium">{agent.responseTime || '~250ms'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Uptime</label>
                      <p className="text-gray-800 font-medium">{agent.uptime || '99.9%'}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Container</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Container className="w-4 h-4 text-gray-500" />
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {agent.dockerImage || 'No container configured'}
                      </code>
                    </div>
                  </div>
                  
                  {agent.containerUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Container URL</label>
                      <p className="text-sm text-blue-600 font-mono">{agent.containerUrl}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Quick Performance Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentPerformanceChart
                    agentId={agent.id}
                    agentName={agent.name}
                    animated={true}
                    compact={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    disabled={agent.status === 'offline'}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Demo
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    View Logs
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Container className="w-4 h-4 mr-2" />
                    Scale Instance
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Agent started successfully
                      <span className="text-gray-500 ml-auto">2m ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Health check passed
                      <span className="text-gray-500 ml-auto">5m ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Configuration updated
                      <span className="text-gray-500 ml-auto">1h ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <AgentPerformanceChart
              agentId={agent.id}
              agentName={agent.name}
              animated={true}
              compact={false}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Response Time History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Historical response time data would be displayed here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Usage analytics and metrics would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Technology Stack & Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <CapabilityVisualization
                  capabilities={agent.techStack.split(', ').map(tech => tech.trim())}
                  animated={true}
                  layout="list"
                  showProgress={true}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Specialized Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <CapabilityVisualization
                  capabilities={[
                    { name: 'Natural Language Processing', level: 95, type: 'specialized' },
                    { name: 'Data Analysis', level: 88, type: 'core' },
                    { name: 'API Integration', level: 92, type: 'integration' },
                    { name: 'Real-time Processing', level: 85, type: 'core' },
                    { name: 'Machine Learning', level: 78, type: 'specialized' },
                    { name: 'Cloud Integration', level: 90, type: 'integration' }
                  ]}
                  animated={true}
                  layout="grid"
                  showProgress={true}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}