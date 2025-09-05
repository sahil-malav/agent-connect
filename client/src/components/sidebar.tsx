import { BarChart3, Settings, FileText, LayoutDashboard } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface SidebarProps {
  stats?: {
    totalAgents: number;
    activeAgents: number;
    offlineAgents: number;
    agentTypes: Record<string, number>;
  };
}

export function Sidebar({ stats }: SidebarProps) {
  const agentTypes = [
    { name: "Simple reflex agents", count: stats?.agentTypes?.["Simple reflex agents"] || 0 },
    { name: "Model-based agents", count: stats?.agentTypes?.["Model-based agents"] || 0 },
    { name: "Goal-based agents", count: stats?.agentTypes?.["Goal-based agents"] || 0 },
    { name: "Utility-based agents", count: stats?.agentTypes?.["Utility-based agents"] || 0 },
    { name: "Learning agents", count: stats?.agentTypes?.["Learning agents"] || 0 },
    { name: "Hierarchical agents", count: stats?.agentTypes?.["Hierarchical agents"] || 0 },
  ];

  return (
    <aside className="w-64 bg-surface shadow-sm border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">System Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-base text-gray-600">Total Agents</span>
              <span className="font-semibold text-gray-800">{stats?.totalAgents || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{stats?.activeAgents || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base text-gray-600">Offline</span>
              <span className="font-semibold text-gray-500">{stats?.offlineAgents || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-1">
          <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
          
          <a href="#" className="bg-gray-50 border-r-2 border-gray-500 text-gray-700 group flex items-center px-2 py-2 text-sm font-medium rounded-l-md">
            <LayoutDashboard className="text-gray-500 mr-3 h-5 w-5" />
            Dashboard
          </a>
          
          <a href="#" className="text-gray-700 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
            <BarChart3 className="text-gray-400 mr-3 h-5 w-5" />
            Analytics
          </a>
          
          <a href="#" className="text-gray-700 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
            <Settings className="text-gray-400 mr-3 h-5 w-5" />
            Configuration
          </a>
          
          <a href="#" className="text-gray-700 hover:bg-gray-50 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
            <FileText className="text-gray-400 mr-3 h-5 w-5" />
            Documentation
          </a>
        </nav>
        
        {/* Agent Categories Filter */}
        <div className="space-y-3">
          <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agent Types</h3>
          
          <div className="space-y-1">
            {agentTypes.map((type) => (
              <label key={type.name} className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">
                <Checkbox defaultChecked className="h-4 w-4" />
                <span className="ml-3 flex-1">{type.name}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {type.count}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}