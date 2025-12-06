"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Clock, CheckCircle, FileText, Users } from 'lucide-react'
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function GramaNiladariDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [gramaNiladhari, setGramaNiladhari] = useState<any>(null)
  const [voters, setVoters] = useState<any[]>([]) // All voters in this GN division
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"

  // Fetch GN officer details
  const fetchGramaNiladhari = async () => {
    if (!userId) return
    try {
      const res = await fetch(`${API_BASE}/gns/user/${userId}`)
      const data = await res.json()
      setGramaNiladhari(data)
    } catch (err) {
      console.error("Failed to fetch GN data")
    }
  }

  useEffect(() => {
    if (userId) fetchGramaNiladhari()
  }, [userId])

  // Fetch ALL voters (approved + pending + rejected) from this GN division
  const fetchVoters = async () => {
    if (!gramaNiladhari?.gnDivision) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/voter`)
      const data = await response.json()

      const divisionVoters = Array.isArray(data)
        ? data.filter((v: any) =>
            v.gramaNiladhariDivision?.trim().toUpperCase() ===
            gramaNiladhari.gnDivision.trim().toUpperCase()
          )
        : []

      setVoters(divisionVoters)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch voter data.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (gramaNiladhari?.gnDivision) {
      fetchVoters()
    }
  }, [gramaNiladhari])

  // Calculate real stats from voters in this division only
  const pendingCount = voters.filter(v => v.status === 'pending').length
  const approvedCount = voters.filter(v => v.status === 'approved').length
  const rejectedCount = voters.filter(v => v.status === 'rejected').length
  const totalCount = voters.length

  // Recent 3 pending requests
  const recentRequests = voters
    .filter(v => v.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(v => ({
      name: v.user?.name || 'Unknown',
      nic: v.nic,
      submittedAt: new Date(v.createdAt).toLocaleDateString(),
    }))

  return (
    <DashboardLayout userRole="grama_niladhari">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Dashboard - {gramaNiladhari?.gnDivision || "Loading..."}
          </h1>
          <p className="text-green-100">
            Welcome back! Here's an overview of voter registrations in your division.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading your dashboard...</div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
                  <Clock className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                  <p className="text-xs text-gray-500">Awaiting review</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Approved Voters</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                  <p className="text-xs text-gray-500">Successfully registered</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                  <p className="text-xs text-gray-500">All time in your division</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
                  <Users className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                  <p className="text-xs text-gray-500">Documents rejected</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Recent Pending Requests
                </CardTitle>
                <CardDescription>
                  Latest applications waiting for your approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending requests</p>
                ) : (
                  <div className="space-y-4">
                    {recentRequests.map((req, i) => (
                      <div key={i} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{req.name}</p>
                          <p className="text-sm text-gray-500">NIC: {req.nic}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Submitted</p>
                          <p className="text-sm font-medium">{req.submittedAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full mt-6" asChild>
                  <Link href="/dashboard/grama-niladhari/requests">
                    View All Requests →
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col" asChild>
                    <Link href="/dashboard/grama-niladhari/requests">
                      <Clock className="h-8 w-8 mb-2 text-orange-600" />
                      <span>Review Requests</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col" asChild>
                    <Link href="/dashboard/grama-niladhari/voters">
                      <Users className="h-8 w-8 mb-2 text-green-600" />
                      <span>Approved Voters</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col" asChild>
                    <Link href="/dashboard/grama-niladhari/reports">
                      <FileText className="h-8 w-8 mb-2 text-blue-600" />
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