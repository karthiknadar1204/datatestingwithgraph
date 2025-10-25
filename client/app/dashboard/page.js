"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Database, LogOut, User, Plus, Trash2, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [databases, setDatabases] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUrlMode, setIsUrlMode] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: "",
    database: "",
    username: "",
    password: "",
    url: ""
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const parseDatabaseUrl = (url) => {
    try {
      const urlObj = new URL(url)
      return {
        host: urlObj.hostname,
        port: urlObj.port || '5432',
        database: urlObj.pathname.slice(1), // Remove leading slash
        username: urlObj.username,
        password: urlObj.password,
        name: urlObj.pathname.slice(1) || 'Database Connection' // Use database name as default name
      }
    } catch (error) {
      console.error('Error parsing URL:', error)
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    let databaseData = { ...formData }
    
    // If URL mode, parse the URL to extract components
    if (isUrlMode && formData.url) {
      const parsedData = parseDatabaseUrl(formData.url)
      if (parsedData) {
        databaseData = {
          ...databaseData,
          ...parsedData
        }
      }
    }
    
    try {
      const response = await fetch('http://localhost:3004/api/databases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(databaseData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setDatabases([...databases, data.database])
        setFormData({
          name: "",
          host: "",
          port: "",
          database: "",
          username: "",
          password: "",
          url: ""
        })
        setIsModalOpen(false)
      } else {
        console.error('Error creating database:', data.message)
      }
    } catch (error) {
      console.error('Error creating database:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3004/api/databases/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        setDatabases(databases.filter(db => db.id !== id))
      } else {
        console.error('Error deleting database')
      }
    } catch (error) {
      console.error('Error deleting database:', error)
    }
  }

  const loadDatabases = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/databases', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setDatabases(data.databases)
      }
    } catch (error) {
      console.error('Error loading databases:', error)
    }
  }

  useEffect(() => {
    loadDatabases()
  }, [])

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
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                    <Plus className="w-4 h-4" />
                    Add Database
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Database Connection</DialogTitle>
                  </DialogHeader>
                  
                  {/* Toggle Switch */}
                  <div className="flex items-center justify-center space-x-4 py-4 border-b">
                    <span className={`text-sm ${!isUrlMode ? 'font-medium' : 'text-muted-foreground'}`}>
                      Detailed Form
                    </span>
                    <Switch
                      checked={isUrlMode}
                      onCheckedChange={setIsUrlMode}
                    />
                    <span className={`text-sm ${isUrlMode ? 'font-medium' : 'text-muted-foreground'}`}>
                      URL Mode
                    </span>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isUrlMode ? (
                      // URL Mode - Single input
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="url">Database URL</Label>
                          <Input
                            id="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            placeholder="postgresql://username:password@host:port/database"
                            required
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Format: postgresql://username:password@host:port/database
                          </p>
                        </div>
                        
                        {/* Preview of parsed components */}
                        {formData.url && (() => {
                          const parsed = parseDatabaseUrl(formData.url)
                          return parsed ? (
                            <div className="p-4 bg-muted/20 rounded-lg border">
                              <h4 className="text-sm font-medium mb-3">Parsed Components:</h4>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Host:</span>
                                  <span className="ml-2 font-mono">{parsed.host}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Port:</span>
                                  <span className="ml-2 font-mono">{parsed.port}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Database:</span>
                                  <span className="ml-2 font-mono">{parsed.database}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Username:</span>
                                  <span className="ml-2 font-mono">{parsed.username}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Password:</span>
                                  <span className="ml-2 font-mono">••••••••</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                              <p className="text-xs text-red-400">Invalid URL format</p>
                            </div>
                          )
                        })()}
                      </div>
                    ) : (
                      // Detailed Form Mode
                      <>
                        <div>
                          <Label htmlFor="name">Connection Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="My Database"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="host">Host</Label>
                            <Input
                              id="host"
                              name="host"
                              value={formData.host}
                              onChange={handleInputChange}
                              placeholder="localhost"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="port">Port</Label>
                            <Input
                              id="port"
                              name="port"
                              value={formData.port}
                              onChange={handleInputChange}
                              placeholder="5432"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="database">Database</Label>
                          <Input
                            id="database"
                            name="database"
                            value={formData.database}
                            onChange={handleInputChange}
                            placeholder="database_name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="username"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="password"
                            required
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Add Connection
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
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

        {/* Main Dashboard */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold">Database Dashboard</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Manage your database connections and start chatting with your data using natural language.
              </p>
            </div>

            {/* Database Cards */}
            {databases.length === 0 ? (
              <Card className="p-12 text-center bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border-cyan-500/20">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">No Database Connections</h2>
                  <p className="text-muted-foreground">
                    Add your first database connection to get started
                  </p>
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Database
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {databases.map((db) => (
                  <Card key={db.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Database className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{db.name}</h3>
                            <p className="text-sm text-muted-foreground">{db.host}:{db.port}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDelete(db.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Database:</span>
                          <span className="font-mono">{db.database}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">User:</span>
                          <span className="font-mono">{db.username}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            db.status === 'connected' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {db.status}
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => router.push(`/dashboard/${db.id}`)}
                      >
                        Connect & Chat
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
