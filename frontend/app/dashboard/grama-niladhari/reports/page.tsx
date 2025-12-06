// app/dashboard/grama-niladhari/reports/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "@/components/ui/use-toast"
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  TrendingUp,
  Calendar,
  Download
} from "lucide-react"

export default function ReportsPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [gramaNiladhari, setGramaNiladhari] = useState<any>(null)
  const [voters, setVoters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"

  // Fetch GN officer
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

  // Fetch all voters in this division
  const fetchVoters = async () => {
    if (!gramaNiladhari?.gnDivision) return

    try {
      setIsLoading(true)
      const res = await fetch(`${API_BASE}/voter`)
      const data = await res.json()

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
        description: "Failed to load voter data for reports.",
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

  // Calculate stats
  const totalVoters = voters.length
  const approved = voters.filter(v => v.status === 'approved').length
  const pending = voters.filter(v => v.status === 'pending').length
  const rejected = voters.filter(v => v.status === 'rejected').length

  const approvalRate = totalVoters > 0 ? Math.round((approved / totalVoters) * 100) : 0
  const rejectionRate = totalVoters > 0 ? Math.round((rejected / totalVoters) * 100) : 0

  const pendingDocs = voters.reduce((count, v) => {
    if (v.nicApproval === 'pending') count++
    if (v.birthCertificateApproval === 'pending') count++
    if (v.addressApproval === 'pending') count++
    return count
  }, 0)

  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const registeredThisMonth = voters.filter(v => {
    const date = new Date(v.createdAt)
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
  }).length

  return (
    <DashboardLayout userRole="grama_niladhari">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Reports & Statistics - {gramaNiladhari?.gnDivision || "Loading..."}
          </h1>
          <p className="text-green-100">
            Overview of voter registration activity in your Grama Niladhari division
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading reports...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Registrations</CardTitle>
                  <Users className="h-5 w-5 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVoters}</div>
                  <p className="text-xs text-muted-foreground">
                    +{registeredThisMonth} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{approved}</div>
                  <p className="text-xs text-muted-foreground">
                    {approvalRate}% of total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
                  <Clock className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{pending}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingDocs} documents pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
                  <XCircle className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{rejected}</div>
                  <p className="text-xs text-muted-foreground">
                    {rejectionRate}% rejection rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Registration Status Summary
                  </CardTitle>
                  <CardDescription>
                    Current status of all applications in your division
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium">Approved</p>
                        <p className="text-sm text-muted-foreground">Fully verified & registered</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3">{approved}</Badge>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="font-medium">Pending</p>
                        <p className="text-sm text-muted-foreground">Awaiting review</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3">{pending}</Badge>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-8 w-8 text-red-600" />
                      <div>
                        <p className="font-medium">Rejected</p>
                        <p className="text-sm text-muted-foreground">Documents not accepted</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-3">{rejected}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Quick Report
                  </CardTitle>
                  <CardDescription>
                    Summary for official use or printing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <h3 className="font-bold text-lg mb-4">
                      Voter Registration Report
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Grama Niladhari Division: <strong>{gramaNiladhari?.gnDivision}</strong>
                      <br />
                      District: <strong>{gramaNiladhari?.district}</strong> | Province: <strong>{gramaNiladhari?.province}</strong>
                      <br />
                      Report Generated: {new Date().toLocaleDateString()}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Applications</p>
                        <p className="text-2xl font-bold">{totalVoters}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Approved Voters</p>
                        <p className="text-2xl font-bold text-green-600">{approved}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Review</p>
                        <p className="text-2xl font-bold text-orange-600">{pending}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                        <p className="text-2xl font-bold">{approvalRate}%</p>
                      </div>
                    </div>

                    <Button className="mt-6" variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report (PDF)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Footer Note */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  This report includes all voter registration applications submitted in your division as of today.
                  Data is automatically filtered to show only your area.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}