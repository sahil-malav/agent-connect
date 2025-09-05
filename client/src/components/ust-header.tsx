import { Button } from "@/components/ui/button";
import { Building2, Settings, User } from "lucide-react";
import { AuthHeader } from "./auth-header";

export function USTHeader() {
  return (
    <div className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* UST Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-800" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  UST Agent Portal
                </h1>
                <p className="text-gray-300 text-sm font-medium">
                  Unified Agent Interface & Orchestration Platform
                </p>
              </div>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:text-white transition-all"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            
            <AuthHeader />
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mt-4 flex items-center space-x-2 text-gray-400 text-sm">
          <span className="text-white font-medium">Dashboard</span>
          <span>/</span>
          <span>Agent Management</span>
        </div>
      </div>
    </div>
  );
}