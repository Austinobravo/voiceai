"use client"

import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sparkles,
  Users,
  Activity,
  Download,
  Settings,
  LogOut,
  Shield,
  BarChart3,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Mic,
  Volume2,
  MessageSquare,
  Database,
  Server,
  Cpu,
} from "lucide-react"
import { useState } from "react"

function AdminContent() {
  const { user, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [systemHealth, setSystemHealth] = useState({
    api: "healthy",
    database: "healthy",
    storage: "warning",
    ai: "healthy",
  })

  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalConversions: 15420,
    totalRecordings: 8934,
    aiQuestions: 12567,
    storageUsed: 78.5,
    apiCalls: 45230,
    errorRate: 0.2,
  }

  const recentUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      joinDate: "2024-01-15",
      status: "active",
      lastActive: "2 min ago",
      conversions: 45,
      recordings: 23,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      joinDate: "2024-01-14",
      status: "active",
      lastActive: "5 min ago",
      conversions: 67,
      recordings: 34,
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      joinDate: "2024-01-13",
      status: "inactive",
      lastActive: "2 days ago",
      conversions: 12,
      recordings: 8,
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      joinDate: "2024-01-12",
      status: "active",
      lastActive: "1 hour ago",
      conversions: 89,
      recordings: 56,
    },
    {
      id: 5,
      name: "Charlie Wilson",
      email: "charlie@example.com",
      joinDate: "2024-01-11",
      status: "suspended",
      lastActive: "1 week ago",
      conversions: 3,
      recordings: 1,
    },
  ]

  const systemActivity = [
    { action: "User Registration", user: "john@example.com", time: "2 minutes ago", type: "info" },
    { action: "Text-to-Speech", user: "jane@example.com", time: "5 minutes ago", type: "success" },
    { action: "AI Question", user: "bob@example.com", time: "8 minutes ago", type: "success" },
    { action: "Voice Recording", user: "alice@example.com", time: "12 minutes ago", type: "success" },
    { action: "API Error", user: "system", time: "15 minutes ago", type: "error" },
    { action: "Storage Warning", user: "system", time: "1 hour ago", type: "warning" },
  ]

  const analyticsData = [
    { period: "Today", users: 156, conversions: 1240, recordings: 890, questions: 567 },
    { period: "Yesterday", users: 142, conversions: 1180, recordings: 820, questions: 534 },
    { period: "This Week", users: 892, conversions: 8420, recordings: 5934, questions: 3567 },
    { period: "Last Week", users: 834, conversions: 7890, recordings: 5234, questions: 3234 },
    { period: "This Month", users: 3456, conversions: 32450, recordings: 23890, questions: 15670 },
  ]

  const filteredUsers = recentUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = userFilter === "all" || user.status === userFilter
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-blue-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VoiceAI Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin: {user?.email}
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your VoiceAI platform</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Health Alert */}
            {systemHealth.storage === "warning" && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Storage usage is at {stats.storageUsed}%. Consider upgrading your storage plan.
                </AlertDescription>
              </Alert>
            )}

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +12% from last month
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +8% from yesterday
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">API Calls</p>
                      <p className="text-2xl font-bold">{stats.apiCalls.toLocaleString()}</p>
                      <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                        Error rate: {stats.errorRate}%
                      </p>
                    </div>
                    <Server className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                      <p className="text-2xl font-bold">{stats.storageUsed}%</p>
                      <Progress value={stats.storageUsed} className="mt-2 h-2" />
                    </div>
                    <Database className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Usage Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Text-to-Speech</p>
                      <p className="text-2xl font-bold">{stats.totalConversions.toLocaleString()}</p>
                    </div>
                    <Volume2 className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Voice Recordings</p>
                      <p className="text-2xl font-bold">{stats.totalRecordings.toLocaleString()}</p>
                    </div>
                    <Mic className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">AI Questions</p>
                      <p className="text-2xl font-bold">{stats.aiQuestions.toLocaleString()}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
                <CardDescription>Latest platform events and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.user}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management Controls */}
            <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Search, filter, and manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active"
                                ? "default"
                                : user.status === "suspended"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{user.lastActive}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{user.conversions} conversions</p>
                            <p className="text-muted-foreground">{user.recordings} recordings</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Detailed usage statistics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>TTS Conversions</TableHead>
                      <TableHead>Voice Recordings</TableHead>
                      <TableHead>AI Questions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{data.period}</TableCell>
                        <TableCell>{data.users.toLocaleString()}</TableCell>
                        <TableCell>{data.conversions.toLocaleString()}</TableCell>
                        <TableCell>{data.recordings.toLocaleString()}</TableCell>
                        <TableCell>{data.questions.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            {/* System Health */}
            <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor system components and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(systemHealth.api)}
                        <div>
                          <p className="font-medium">API Service</p>
                          <p className="text-sm text-muted-foreground">Response time: 120ms</p>
                        </div>
                      </div>
                      <Badge variant={systemHealth.api === "healthy" ? "default" : "destructive"}>
                        {systemHealth.api}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(systemHealth.database)}
                        <div>
                          <p className="font-medium">Database</p>
                          <p className="text-sm text-muted-foreground">Connections: 45/100</p>
                        </div>
                      </div>
                      <Badge variant={systemHealth.database === "healthy" ? "default" : "destructive"}>
                        {systemHealth.database}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(systemHealth.storage)}
                        <div>
                          <p className="font-medium">Storage</p>
                          <p className="text-sm text-muted-foreground">Usage: {stats.storageUsed}%</p>
                        </div>
                      </div>
                      <Badge variant={systemHealth.storage === "healthy" ? "default" : "secondary"}>
                        {systemHealth.storage}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(systemHealth.ai)}
                        <div>
                          <p className="font-medium">AI Service</p>
                          <p className="text-sm text-muted-foreground">Queue: 12 requests</p>
                        </div>
                      </div>
                      <Badge variant={systemHealth.ai === "healthy" ? "default" : "destructive"}>
                        {systemHealth.ai}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure platform settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Export Analytics
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Backup Data
                    </Button>
                    <Button variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      API Settings
                    </Button>
                    <Button variant="outline">
                      <Cpu className="w-4 h-4 mr-2" />
                      Performance Tuning
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin={true}>
      <AdminContent />
    </AuthGuard>
  )
}
