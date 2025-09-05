import { useState } from "react";
import { Agent } from "@shared/schema";
import { ContainerManagement } from "./container-management";
import { X, Bot, Users, Code, Activity, Container } from "lucide-react";

interface AgentDetailsModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentDetailsModal({ agent, isOpen, onClose }: AgentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "container" | "activity">("overview");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">{agent.name}</h2>
              <p className="text-sm text-gray-600">{agent.team}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "overview" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <Bot className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("container")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "container" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <Container className="h-4 w-4 inline mr-2" />
            Container
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "activity" 
                ? "border-b-2 border-blue-600 text-blue-600" 
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Agent Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Agent Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Description</span>
                      <p className="text-sm">{agent.description}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Type</span>
                      <p className="text-sm">{agent.agentType}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Tech Stack</span>
                      <p className="text-sm">{agent.techStack}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Status</span>
                      <p className={`text-sm font-medium ${
                        agent.status === 'online' ? 'text-green-600' : 
                        agent.status === 'offline' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {agent.status.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Response Time</span>
                      <p className="text-sm">{agent.responseTime}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Uptime</span>
                      <p className="text-sm">{agent.uptime}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Last Health Check</span>
                      <p className="text-sm">
                        {agent.lastHealthCheck ? new Date(agent.lastHealthCheck).toLocaleString() : "Never"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Capabilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities && Array.isArray(agent.capabilities) ? agent.capabilities.map((capability: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {capability.replace(/_/g, ' ')}
                    </span>
                  )) : <span className="text-sm text-gray-500">No capabilities defined</span>}
                </div>
              </div>

              {/* Docker Configuration */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Container className="h-5 w-5" />
                  Docker Configuration
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Container URL:</span>
                    <span className="text-sm font-mono">{agent.containerUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Docker Image:</span>
                    <span className="text-sm font-mono">{agent.dockerImage}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "container" && (
            <ContainerManagement agent={agent} />
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <h3 className="font-semibold">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Container deployed successfully</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Health check passed</p>
                    <p className="text-xs text-gray-600">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Scaled to 3 replicas</p>
                    <p className="text-xs text-gray-600">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}