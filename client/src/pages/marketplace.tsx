import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Users, 
  Clock, 
  Zap,
  Tag,
  TrendingUp,
  Award,
  ArrowLeft,
  Home
} from "lucide-react";
import type { Agent } from "@shared/schema";

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCapability, setSelectedCapability] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  // Extract unique capabilities from all agents
  const allCapabilities = Array.from(
    new Set(
      agents.flatMap(agent => 
        Array.isArray(agent.capabilities) 
          ? agent.capabilities 
          : typeof agent.capabilities === 'string'
          ? [agent.capabilities]
          : []
      )
    )
  );

  // Extract unique categories (agent types)
  const categories = Array.from(new Set(agents.map(agent => agent.agentType)));

  // Filter and sort agents based on selections
  const filteredAgents = agents
    .filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.techStack.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || agent.agentType === selectedCategory;
      
      const matchesCapability = selectedCapability === "all" || 
        (Array.isArray(agent.capabilities) && agent.capabilities.includes(selectedCapability)) ||
        (typeof agent.capabilities === 'string' && agent.capabilities.includes(selectedCapability));

      return matchesSearch && matchesCategory && matchesCapability;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "rating":
          return Math.random() - 0.5; // Placeholder for rating
        case "popularity":
        default:
          return Math.random() - 0.5; // Placeholder for popularity
      }
    });

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'Customer Service':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        );
      case 'Data Analysis':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        );
      case 'Content Generation':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        );
      case 'Process Automation':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        );
    }
  };

  const getCardStyle = (agentType: string) => {
    switch (agentType) {
      case 'Customer Service':
        return 'bg-white border-l-4 border-l-blue-500 border-gray-200';
      case 'Data Analysis':
        return 'bg-white border-l-4 border-l-purple-500 border-gray-200';
      case 'Content Generation':
        return 'bg-white border-l-4 border-l-green-500 border-gray-200';
      case 'Process Automation':
        return 'bg-white border-l-4 border-l-orange-500 border-gray-200';
      default:
        return 'bg-white border-l-4 border-l-gray-500 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-6 space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        {/* Marketplace Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800">
            Agent Marketplace
          </h1>
          <p className="mt-2 text-xl text-gray-600">
            Discover and deploy AI agents with powerful capabilities
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search agents, capabilities, tech stack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-base h-12"
                />
              </div>

              {/* Category Filter */}
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-12 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Capability Filter */}
              <select 
                value={selectedCapability} 
                onChange={(e) => setSelectedCapability(e.target.value)}
                className="flex h-12 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="all">All Capabilities</option>
                {allCapabilities.map(capability => (
                  <option key={capability} value={capability}>{capability}</option>
                ))}
              </select>

              {/* Sort By */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="flex h-12 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="popularity">Popularity</option>
                <option value="name">Name</option>
                <option value="recent">Recently Added</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredAgents.length} of {agents.length} agents
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {categories.length} categories
                </span>
                <span className="flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  {allCapabilities.length} capabilities
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className={`${getCardStyle(agent.agentType)} hover:shadow-md transition-all duration-200`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center bg-gray-50 border border-gray-200">
                      {getAgentIcon(agent.agentType)}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900 font-semibold">{agent.name}</CardTitle>
                      <p className="text-sm text-gray-500">{agent.team}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-gray-400 fill-current" />
                    <span className="text-sm font-medium text-gray-600">4.{Math.floor(Math.random() * 9)}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {agent.description || "Advanced AI agent with powerful capabilities for enterprise deployment."}
                </p>

                {/* Tech Stack */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Technology Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.techStack.split(', ').slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                        {tech}
                      </Badge>
                    ))}
                    {agent.techStack.split(', ').length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                        +{agent.techStack.split(', ').length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Key Capabilities</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(agent.capabilities) ? agent.capabilities : [agent.capabilities])
                      .slice(0, 2).map((capability, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-300 text-gray-600">
                        {capability}
                      </Badge>
                    ))}
                    {(Array.isArray(agent.capabilities) ? agent.capabilities : [agent.capabilities]).length > 2 && (
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                        +{(Array.isArray(agent.capabilities) ? agent.capabilities : [agent.capabilities]).length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-700">{agent.uptime}</div>
                    <div className="text-xs text-gray-500">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-700">{agent.responseTime}</div>
                    <div className="text-xs text-gray-500">Response</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-3">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-gray-800 text-white hover:bg-gray-900"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Deploy
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50">
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}