import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Container, Settings, Play, Square } from "lucide-react";
import { AnimatedStatusIndicator } from "./animated-status-indicator";
import { CapabilityVisualization } from "./capability-visualization";
import type { Agent } from "@shared/schema";

interface AgentCardProps {
  agent: Agent;
  onDemo: () => void;
  onDetails: () => void;
}

export function AgentCard({ agent, onDemo, onDetails }: AgentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-ust-success-500';
      case 'busy':
        return 'bg-ust-warning-500';
      case 'offline':
      default:
        return 'bg-ust-neutral-400';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-ust-success-600';
      case 'busy':
        return 'text-ust-warning-600';
      case 'offline':
      default:
        return 'text-ust-neutral-500';
    }
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'Simple reflex agents':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        );
      case 'Model-based agents':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        );
      case 'Goal-based agents':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'Utility-based agents':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        );
      case 'Learning agents':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        );
      case 'Hierarchical agents':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14-7H5m14 14H5m14-7H5"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        );
    }
  };

  const getCardGradient = (agentType: string) => {
    switch (agentType) {
      case 'Simple reflex agents':
        return 'bg-white border-l-4 border-l-red-500 border-gray-200';
      case 'Model-based agents':
        return 'bg-white border-l-4 border-l-blue-500 border-gray-200';
      case 'Goal-based agents':
        return 'bg-white border-l-4 border-l-green-500 border-gray-200';
      case 'Utility-based agents':
        return 'bg-white border-l-4 border-l-purple-500 border-gray-200';
      case 'Learning agents':
        return 'bg-white border-l-4 border-l-orange-500 border-gray-200';
      case 'Hierarchical agents':
        return 'bg-white border-l-4 border-l-cyan-500 border-gray-200';
      default:
        return 'bg-white border-l-4 border-l-gray-500 border-gray-200';
    }
  };

  const getIconBackgroundColor = (agentType: string) => {
    return 'bg-gray-50 border border-gray-200';
  };

  return (
    <Card className={`${getCardGradient(agent.agentType)} hover:shadow-md transition-all duration-200 chrome-optimized safari-optimized`} title={agent.description || undefined}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center ${getIconBackgroundColor(agent.agentType)}`}>
              {getAgentIcon(agent.agentType)}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800">{agent.name}</h3>
              <p className="text-base text-gray-600">{agent.team}</p>
            </div>
          </div>
          <AnimatedStatusIndicator
            status={agent.status === 'online' ? 'active' : agent.status === 'busy' ? 'busy' : 'offline'}
            size="sm"
            showText={true}
            animated={true}
          />
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-base">
            <span className="text-gray-500">Agent Type:</span>
            <span className="font-medium text-gray-800">{agent.agentType}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-gray-500">Response Time:</span>
            <span className={`font-medium ${agent.status === 'offline' ? 'text-gray-400' : 'text-gray-800'}`}>
              {agent.responseTime || '~250ms'}
            </span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-gray-500">Uptime:</span>
            <span className="font-medium text-gray-800">{agent.uptime || '99.9%'}</span>
          </div>
          {/* Container Info */}
          <div className="flex justify-between text-base">
            <span className="text-gray-500 flex items-center gap-1">
              <Container className="h-4 w-4" />
              Container:
            </span>
            <span className="font-medium text-gray-800 font-mono text-sm">
              {agent.dockerImage ? agent.dockerImage.split(':')[0].split('/').pop() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Tech Stack</h4>
          <CapabilityVisualization
            capabilities={agent.techStack.split(', ').map(tech => tech.trim())}
            animated={true}
            layout="compact"
            showProgress={false}
          />
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          {/* Quick Container Actions */}
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-cyan-300 text-cyan-600 hover:bg-cyan-50 transition-colors"
              disabled={agent.status === 'offline'}
            >
              {agent.status === 'online' ? <Square className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
              {agent.status === 'online' ? 'Stop' : 'Start'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Settings className="h-3 w-3 mr-1" />
              Scale
            </Button>
          </div>
          
          {/* Main Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 transition-colors ${
                agent.status === 'offline'
                  ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-400'
                  : 'border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100'
              }`}
              onClick={onDemo}
              disabled={agent.status === 'offline'}
            >
              Demo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={onDetails}
            >
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}