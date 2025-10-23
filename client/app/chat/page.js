"use client"

import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Database, LogOut, User } from "lucide-react"

export default function ChatPage() {
  const { user, logout } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Database className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                DBChat
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Welcome, {user?.name}</span>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Chat Interface */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Welcome Message */}
            <Card className="p-8 text-center bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold">Welcome to DBChat</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Connect your PostgreSQL database and start chatting with your data using natural language. 
                  No SQL knowledge required!
                </p>
              </div>
            </Card>

            {/* Database Connection Form */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Connect Your Database</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Host</label>
                    <Input placeholder="localhost" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Port</label>
                    <Input placeholder="5432" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Database</label>
                    <Input placeholder="your_database" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Username</label>
                    <Input placeholder="your_username" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Password</label>
                    <Input type="password" placeholder="your_password" />
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                  Connect Database
                </Button>
              </div>
            </Card>

            {/* Chat Interface Placeholder */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Chat with Your Database</h2>
              <div className="space-y-4">
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                  <div className="text-center space-y-2">
                    <Database className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Connect your database to start chatting</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ask a question about your data..." 
                    className="flex-1"
                    disabled
                  />
                  <Button disabled>
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
