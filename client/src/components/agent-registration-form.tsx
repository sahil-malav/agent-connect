import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AgentRegistrationFormProps {
  children: React.ReactNode;
}

export function AgentRegistrationForm({ children }: AgentRegistrationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    team: "",
    agentType: "conversational",
    description: "",
    version: "1.0.0",
    endpoint: "",
    dockerImage: "",
    techStack: ["Python", "FastAPI"],
    capabilities: ["Natural Language Processing", "Task Automation"],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/agents", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Agent registered successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setFormData({
        name: "",
        team: "",
        agentType: "conversational",
        description: "",
        version: "1.0.0",
        endpoint: "",
        dockerImage: "",
        techStack: ["Python", "FastAPI"],
        capabilities: ["Natural Language Processing", "Task Automation"],
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to register agent",
        variant: "destructive",
      });
      console.error("Registration error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) {
    return (
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Register New Agent</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Agent Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. CustomerCare AI"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Team</label>
              <input
                type="text"
                value={formData.team}
                onChange={(e) => setFormData({...formData, team: e.target.value})}
                placeholder="e.g. Customer Success"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Agent Type</label>
              <select
                value={formData.agentType}
                onChange={(e) => setFormData({...formData, agentType: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="Simple reflex agents">Simple reflex agents</option>
                <option value="Model-based agents">Model-based agents</option>
                <option value="Goal-based agents">Goal-based agents</option>
                <option value="Utility-based agents">Utility-based agents</option>
                <option value="Learning agents">Learning agents</option>
                <option value="Hierarchical agents">Hierarchical agents</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Version</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
                placeholder="e.g. 1.0.0"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what this agent does and its main features..."
              className="w-full p-2 border rounded-md min-h-[80px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Technology Stack</label>
            <input
              type="text"
              value={formData.techStack.join(", ")}
              onChange={(e) => setFormData({...formData, techStack: e.target.value.split(", ").map(s => s.trim())})}
              placeholder="e.g. Python, FastAPI, Docker, LangChain"
              className="w-full p-2 border rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter technologies separated by commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Capabilities</label>
            <input
              type="text"
              value={formData.capabilities.join(", ")}
              onChange={(e) => setFormData({...formData, capabilities: e.target.value.split(", ").map(s => s.trim())})}
              placeholder="e.g. Natural Language Processing, Task Automation, Data Analysis"
              className="w-full p-2 border rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter capabilities separated by commas</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">API Endpoint</label>
              <input
                type="url"
                value={formData.endpoint}
                onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
                placeholder="https://api.example.com/agent"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Docker Image</label>
              <input
                type="text"
                value={formData.dockerImage}
                onChange={(e) => setFormData({...formData, dockerImage: e.target.value})}
                placeholder="registry.example.com/agent:latest"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              disabled={mutation.isPending}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? "Registering..." : "Register Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}