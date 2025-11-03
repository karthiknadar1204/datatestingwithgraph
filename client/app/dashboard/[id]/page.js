"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Database, ArrowLeft, Send, MessageSquare, ChevronLeft, ChevronRight, Code, Eye, Wrench, Server, MessageCircle } from "lucide-react"

export default function DatabaseChatPage() {
  const { user, logout } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [database, setDatabase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")

  const menuOptions = [
    { id: "chat", label: "Chat with Database", icon: MessageCircle },
    { id: "sql-editor", label: "SQL Editor", icon: Code },
    { id: "sql-viewer", label: "SQL Viewer", icon: Eye },
    { id: "schema-creator", label: "Schema Creator", icon: Wrench },
    { id: "self-hosting", label: "Self Hosting", icon: Server }
  ]

  useEffect(() => {
    loadDatabase()
  }, [params.id])

  const loadDatabase = async () => {
    try {
      const response = await fetch(`http://localhost:3004/api/databases/${params.id}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setDatabase(data.database)
      } else {
        console.error('Error loading database')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error loading database:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages([...messages, newMessage])
    setInputMessage("")

    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "I understand you want to query the database. This is a placeholder response. The actual AI integration will be implemented later.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading database...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!database) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Database not found</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

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
              <div>
                <h1 className="text-xl font-bold">{database.name}</h1>
                <p className="text-sm text-muted-foreground">{database.host}:{database.port}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Welcome, {user?.name}</span>
            </div>
          </div>
        </header>

        {/* Fixed Sidebar */}
        <div className={`fixed left-0 top-0 h-full bg-background border-r border-border/40 shadow-lg transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}>
          <div className="p-4 h-full flex flex-col">
            {/* Back Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-2 mb-6 w-full justify-start"
            >
              <ArrowLeft className="w-4 h-4" />
              {!sidebarCollapsed && "Back to Dashboard"}
            </Button>

            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="mb-6 w-full justify-center"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>

            {/* Menu Options */}
            <nav className="space-y-2 flex-1">
              {menuOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Button
                    key={option.id}
                    variant={activeTab === option.id ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                      activeTab === option.id 
                        ? "bg-cyan-500 text-white hover:bg-cyan-600" 
                        : "hover:bg-muted"
                    } ${sidebarCollapsed ? 'px-2' : ''}`}
                    onClick={() => setActiveTab(option.id)}
                    title={sidebarCollapsed ? option.label : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && option.label}
                  </Button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-80'
        }`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Database Info Card */}
            <Card className="p-6 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Connected to {database.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {database.database} on {database.host}:{database.port}
                  </p>
                </div>
              </div>
            </Card>

            {/* Dynamic Content Based on Active Tab */}
            {activeTab === "chat" && (
              <Card className="h-96 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-semibold">Chat with your database</h3>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Start a conversation with your database</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Ask questions about your data in natural language
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-cyan-500 text-white'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t border-border/40">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask a question about your data..."
                        className="flex-1"
                      />
                      <Button type="submit" className="gap-2">
                        <Send className="w-4 h-4" />
                        Send
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "sql-editor" && (
              <Card className="h-96 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-semibold">SQL Editor</h3>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Code className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">SQL Editor coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "sql-viewer" && (
              <Card className="h-96 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-semibold">SQL Viewer</h3>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Eye className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">SQL Viewer coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "schema-creator" && (
              <Card className="h-96 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-semibold">Schema Creator</h3>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Wrench className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Schema Creator coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "self-hosting" && (
              <Card className="h-96 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-cyan-400" />
                      <h3 className="font-semibold">Self Hosting</h3>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Server className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Self Hosting options coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
