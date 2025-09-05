import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Send, Download } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import type { Agent } from "@shared/schema";

interface AgentDemoModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  responseTime?: number;
}

export function AgentDemoModal({ agent, isOpen, onClose }: AgentDemoModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionStats, setSessionStats] = useState({
    messageCount: 0,
    avgResponse: "0s",
    successRate: "100%",
  });

  const { socket, isConnected, sendMessage } = useWebSocket({
    onMessage: (data: any) => {
      console.log('WebSocket message received:', data);
      if (data.type === 'agent_response') {
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'agent',
          content: data.content,
          timestamp: new Date(),
          responseTime: data.responseTime,
        };
        setMessages(prev => [...prev, newMessage]);
        updateSessionStats(data.responseTime);
      } else if (data.type === 'connection_established') {
        const systemMessage: Message = {
          id: Date.now().toString(),
          type: 'system',
          content: `Connected to ${agent.name}`,
          timestamp: new Date(),
        };
        setMessages([systemMessage]);
      }
    },
  });

  // Connect to agent when modal opens and WebSocket is ready
  useEffect(() => {
    if (isOpen && isConnected) {
      console.log('Connecting to agent:', agent.id);
      sendMessage({
        type: 'agent_connect',
        agentId: agent.id,
      });
    }
    
    // Reset when modal closes
    if (!isOpen) {
      setMessages([]);
      setSessionStats({
        messageCount: 0,
        avgResponse: "0s",
        successRate: "100%",
      });
    }
  }, [isOpen, isConnected]);

  const updateSessionStats = (responseTime: number) => {
    setSessionStats(prev => {
      const newMessageCount = prev.messageCount + 1;
      const avgResponseMs = responseTime;
      const avgResponseSeconds = (avgResponseMs / 1000).toFixed(1);
      
      return {
        messageCount: newMessageCount,
        avgResponse: `${avgResponseSeconds}s`,
        successRate: "100%",
      };
    });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !socket || !isConnected) {
      console.log('Cannot send message:', { inputMessage: inputMessage.trim(), socket: !!socket, isConnected });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    console.log('Adding user message to state:', userMessage);
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('Updated messages state:', newMessages);
      return newMessages;
    });
    
    console.log('Sending message:', { type: 'agent_message', content: inputMessage });

    sendMessage({
      type: 'agent_message',
      content: inputMessage,
    });

    setInputMessage("");
  };

  const handleSampleQuery = (query: string) => {
    const sampleQueries: Record<string, string> = {
      customer_complaint: "I need help with a refund for order #12345. The product was damaged when I received it.",
      refund_request: "Can you process a refund for my recent purchase? I'm not satisfied with the quality.",
      product_inquiry: "Can you tell me more about your premium subscription features?",
    };

    const message = sampleQueries[query] || "Hello, can you help me?";
    setInputMessage(message);
  };

  const handleClearChat = () => {
    setMessages(prev => prev.filter(msg => msg.type === 'system'));
    setSessionStats({
      messageCount: 0,
      avgResponse: "0s",
      successRate: "100%",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>{agent.name} - Demo Interface</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Interactive demo for testing agent capabilities</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">
          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Agent Interaction</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-gray-400'}`}></div>
                    <span className={`text-xs ${isConnected ? 'text-success-600' : 'text-gray-500'}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">

                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Start a conversation by typing a message below</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.type === 'system' && (
                      <div className="flex justify-center">
                        <Badge variant="secondary" className="text-xs">
                          {message.content}
                        </Badge>
                      </div>
                    )}
                    
                    {message.type === 'agent' && (
                      <div className="flex space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-blue-600">AI</span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg px-4 py-2">
                            <p className="text-sm text-gray-900">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</p>
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'user' && (
                      <div className="flex space-x-3 justify-end">
                        <div className="flex-1 flex justify-end">
                          <div className="bg-purple-600 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                            <p className="text-sm text-white">{message.content}</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-purple-600">You</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
              
              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex space-x-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={!isConnected}
                  />
                  <Button onClick={handleSendMessage} disabled={!isConnected || !inputMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Agent Info & Controls */}
          <div className="space-y-4 overflow-y-auto">
            {/* Agent Details */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Agent Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Technology:</span>
                  <span className="font-medium">{agent.techStack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium">{agent.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="secondary" className="bg-success-100 text-success-600 capitalize">
                    {agent.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => handleSampleQuery('customer_complaint')}
                >
                  Send Sample Complaint
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => handleSampleQuery('refund_request')}
                >
                  Test Refund Process
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => handleSampleQuery('product_inquiry')}
                >
                  Product Inquiry
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={handleClearChat}
                >
                  Clear Chat History
                </Button>
              </CardContent>
            </Card>
            
            {/* Performance Metrics */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Session Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Messages</span>
                  <span className="font-medium">{sessionStats.messageCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Response</span>
                  <span className="font-medium">{sessionStats.avgResponse}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-success-600">{sessionStats.successRate}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close Demo
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}