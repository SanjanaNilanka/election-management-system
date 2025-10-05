"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Users, Vote, Calendar, Shield, Activity, AlertCircle, CheckCircle, BarChart3, Plus } from 'lucide-react'
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function ElectionCommissionDashboard() {
  const [voters, setVoters] = useState<any[]>([])
  const [elections, setElections] = useState<any[]>([])
  const [gnOfficers, setGnOfficers] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true)
  const [votersRes, electionsRes, gnOfficersRes, alertsRes] = await Promise.all([
    fetch(`${API_BASE}/voter`).then((r) => r.json()),
    fetch(`${API_BASE}/elections`).then((r) => r.json()),
    fetch(`${API_BASE}/users/grama_niladhari`).then((r) => r.json()),
    // fetch(`${API_BASE}/alerts`).then((r) => r.json()),
    Promise.resolve([
      {
        type: "warning",
        message: "High registration volume in Colombo district",
        time: "2 hours ago"
      },
      {
        type: "info",
        message: "System maintenance scheduled for tonight",
        time: "4 hours ago"
      },
      {
        type: "success",
        message: "Digital voting pilot completed successfully in Ratnapura",
        time: "1 day ago"
      }
    ])
  ])
      setVoters(Array.isArray(votersRes) ? votersRes : [])
      setElections(Array.isArray(electionsRes) ? electionsRes : [])
      setGnOfficers(Array.isArray(gnOfficersRes) ? gnOfficersRes : [])
      setAlerts(Array.isArray(alertsRes) ? alertsRes : [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // System stats
  const systemStats = [
    {
      title: "Total Registered Voters",
      value: voters.length.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: `+${voters.filter(v => new Date(v.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} this month`,
    },
    {
      title: "Active Elections",
      value: elections.filter(e => e.status === 'active').length.toString(),
      icon: Vote,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: `${elections.filter(e => e.status === 'pending').length} upcoming`,
    },
    {
      title: "GN Officers",
      value: gnOfficers.length.toLocaleString(),
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: `${((gnOfficers.length / (gnOfficers.length + 1)) * 100).toFixed(1)}% active`,
    },
    {
      title: "System Health",
      value: "99.8%", // Static for now, could integrate real metrics
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "All systems operational",
    },
  ]

  // District stats
  const districtStats = Array.from(
    new Set(voters.map(v => v.district).filter(d => d && d.trim() !== ""))
  ).map(district => ({
    district,
    voters: voters.filter(v => v.district === district).length.toLocaleString(),
    gnOfficers: gnOfficers.filter(o => o.district === district).length.toLocaleString(),
    status: "active", // Static for simplicity
  }))

  return (
    <DashboardLayout userRole="election_commission">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Election Commission Dashboard</h1>
          <p className="text-indigo-100">
            Oversee and manage Sri Lanka's digital electoral system.
          </p>
        </div>

        {isLoading ? (
          <div>Loading dashboard...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemStats.map((stat, index) => (
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        <span>Elections Overview</span>
                      </CardTitle>
                      <CardDescription>
                        Current and upcoming elections
                      </CardDescription>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/dashboard/election-commission/election">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Election
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {elections.length === 0 ? (
                    <div>No elections found.</div>
                  ) : (
                    elections.slice(0, 3).map((election, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{election.title}</h4>
                            <Badge variant="outline">{election.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            Date: {new Date(election.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Registrations: {voters.filter(v => v.electionId === election._id).length.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              election.status === 'active' ? 'default' :
                              election.status === 'pending' ? 'secondary' : 'outline'
                            }
                          >
                            {election.status}
                          </Badge>
                          <Button size="sm" variant="outline" asChild>
                            <Link href="/dashboard/election-commission/manage-elections">
                              Manage
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/election-commission/election">
                      View All Elections
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-indigo-600" />
                    <span>System Alerts</span>
                  </CardTitle>
                  <CardDescription>
                    Recent system notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {alerts.length === 0 ? (
                    <div>No alerts found.</div>
                  ) : (
                    alerts.map((alert, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`p-1 rounded-full ${
                          alert.type === 'warning' ? 'bg-orange-100' : 
                          alert.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          <div className={`h-2 w-2 rounded-full ${
                            alert.type === 'warning' ? 'bg-orange-600' : 
                            alert.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(alert.time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/election-commission/notifications">
                      View All Alerts
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <span>District Overview</span>
                </CardTitle>
                <CardDescription>
                  Voter registration statistics by district
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">District</th>
                        <th className="text-left py-2">Registered Voters</th>
                        <th className="text-left py-2">GN Officers</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {districtStats.length === 0 ? (
                        <tr><td colSpan={4}>No district data available.</td></tr>
                      ) : (
                        districtStats.map((district, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 font-medium">{district.district}</td>
                            <td className="py-2">{district.voters}</td>
                            <td className="py-2">{district.gnOfficers}</td>
                            <td className="py-2">
                              <Badge variant="outline" className="text-green-600">
                                {district.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/election-commission/reports">
                      View Detailed Reports
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link href="/dashboard/election-commission/election">
                      <Plus className="h-6 w-6" />
                      <span>Create Election</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link href="/dashboard/election-commission/voter">
                      <Users className="h-6 w-6" />
                      <span>Manage Voters</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link href="/dashboard/election-commission/gn-officials">
                      <Shield className="h-6 w-6" />
                      <span>GN Management</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                    <Link href="/dashboard/election-commission/reports">
                      <BarChart3 className="h-6 w-6" />
                      <span>View Reports</span>
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