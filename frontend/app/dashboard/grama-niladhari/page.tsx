"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Clock, CheckCircle, FileText, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function GramaNiladariDashboard() {
  const [voters, setVoters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"

  // Fetch voters
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/voter`)
      const data = await response.json()
      setVoters(Array.isArray(data) ? data : [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch voter data. Please try again.",
      })
      setVoters([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Calculate time-based boundaries (in milliseconds)
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Calculate stats
  const stats = [
    {
      title: "Pending Requests",
      value: voters.filter(v => v.status === 'pending').length.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: `+${voters.filter(v => v.status === 'pending' && new Date(v.createdAt) >= oneDayAgo).length} since yesterday`
    },
    {
      title: "Approved Voters",
      value: voters.filter(v => v.status === 'approved').length.toString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: `+${voters.filter(v => v.status === 'approved' && new Date(v.createdAt) >= oneWeekAgo).length} this week`
    },
    {
      title: "Documents to Review",
      value: voters.reduce((count, v) => {
        let docCount = 0
        if (v.nicApproval === 'pending') docCount++
        if (v.birthCertificateApproval === 'pending') docCount++
        return count + docCount
      }, 0).toString(),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: `+${voters.reduce((count, v) => {
        let docCount = 0
        if (v.nicApproval === 'pending' && new Date(v.createdAt) >= oneDayAgo) docCount++
        if (v.birthCertificateApproval === 'pending' && new Date(v.createdAt) >= oneDayAgo) docCount++
        return count + docCount
      }, 0)} today`
    },
    {
      title: "Total Registered",
      value: voters.length.toString(),
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      change: `+${voters.filter(v => new Date(v.createdAt) >= oneMonthAgo).length} this month`
    }
  ]

  // Recent pending requests (latest 3)
  const recentRequests = voters
    .filter(v => v.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(v => ({
      name: v.user?.name || 'N/A',
      nic: v.nic,
      submittedAt: new Date(v.createdAt).toISOString().split('T')[0],
      status: v.status,
      priority: (v.nicApproval === 'pending' || v.birthCertificateApproval === 'pending') ? 'high' : 'medium'
    }))

  // Quick stats (partially computed)
  const quickStats = [
    { label: "Today's Approvals", value: "0" }, // Requires approval timestamp
    { label: "This Week's Rejections", value: voters.filter(v => v.status === 'rejected' && new Date(v.createdAt) >= oneWeekAgo).length.toString() },
    { label: "Average Processing Time", value: "N/A" }, // Requires approval timestamp
    { label: "Completion Rate", value: "N/A" } // Requires total processed count
  ]

  return (
    <DashboardLayout userRole="grama_niladhari">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Grama Niladhari Dashboard</h1>
          <p className="text-green-100">
            Manage voter registrations and serve your community efficiently.
          </p>
        </div>

        {isLoading ? (
          <div>Loading dashboard...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span>Recent Registration Requests</span>
                  </CardTitle>
                  <CardDescription>
                    Latest voter registration applications requiring your review
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentRequests.length === 0 ? (
                    <div>No pending requests found.</div>
                  ) : (
                    recentRequests.map((request, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{request.name}</h4>
                            {request.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs">High Priority</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">NIC: {request.nic}</p>
                          <p className="text-xs text-gray-400">
                            Submitted: {request.submittedAt}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <Button size="sm" asChild>
                            <Link href="/dashboard/grama-niladhari/requests">
                              Review
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/grama-niladhari/requests">
                      View All Requests
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <span>Performance</span>
                  </CardTitle>
                  <CardDescription>
                    Your processing statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quickStats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{stat.label}</span>
                      <span className="font-semibold text-gray-900">{stat.value}</span>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/grama-niladhari/reports">
                      View Detailed Reports
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for managing voter registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link href="/dashboard/grama-niladhari/requests">
                      <Clock className="h-6 w-6" />
                      <span>Review Requests</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link href="/dashboard/grama-niladhari/voters">
                      <Users className="h-6 w-6" />
                      <span>View Voters</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link href="/dashboard/grama-niladhari/documents">
                      <FileText className="h-6 w-6" />
                      <span>Check Documents</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link href="/dashboard/grama-niladhari/communication">
                      <AlertTriangle className="h-6 w-6" />
                      <span>Send Messages</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}