"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "@/components/ui/use-toast"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { set } from "mongoose"

export default function ApprovedVotersPage() {
  const { data: session, status } = useSession()
  const [voters, setVoters] = useState<any[]>([])
  const [filteredVoters, setFilteredVoters] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [districtFilter, setDistrictFilter] = useState("")
  const [openDetails, setOpenDetails] = useState(false)
  const [selectedVoter, setSelectedVoter] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gramaNiladhari, setGramaNiladhari] = useState<any>(null)

  const userId = session?.user?.id

  const API_BASE = "http://localhost:5000/api"
  const IMAGE_BASE = "http://localhost:5000"

  useEffect(() => {
    if (userId) {
      fetchGramaNiladhari()
    }
  }, [userId])


  const fetchGramaNiladhari = async () => {
    try {
      const response = await fetch(`${API_BASE}/gns/user/${userId}`)
      const data = await response.json()
      console.log("userId:", userId)
      console.log("Grama Niladhari Data:", data)
      setGramaNiladhari(data)
    } catch (error) {
      return null
    }
  }

  // Fetch approved voters
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/voter`)
      const data = await response.json()
      const approvedVoters = Array.isArray(data) ? data.filter(v => v.status === 'approved') : []
      const votersOfDivition = approvedVoters.filter(voter => voter.gramaNiladhariDivision.trim().toUpperCase() === gramaNiladhari?.gnDivision?.trim()?.toUpperCase())
      console.log("Voter GN Division:", approvedVoters[0]?.gramaNiladhariDivision)
      console.log("Current GN Division:", gramaNiladhari?.gnDivision)
      console.log("All voters:", approvedVoters)
      setVoters(votersOfDivition)
      setFilteredVoters(votersOfDivition)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch voters. Please try again.",
      })
      setVoters([])
      setFilteredVoters([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (gramaNiladhari?.gnDivision) {
      fetchData()
    }
  }, [gramaNiladhari])

  // Filter voters
  useEffect(() => {
    let filtered = voters.filter((voter) => {
      const matchesSearch =
        voter.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDistrict = districtFilter ? (districtFilter == 'all'? true : voter.district === districtFilter) : true
      return matchesSearch && matchesDistrict
    })
    setFilteredVoters(filtered)
  }, [searchTerm, districtFilter, voters])

  // Get unique districts for filter, excluding empty or undefined values
  const uniqueDistricts = Array.from(
    new Set(voters.map((voter) => voter.district).filter((district) => district && district.trim() !== ""))
  )

  // Handle view details
  const handleViewDetails = (voter: any) => {
    setSelectedVoter(voter)
    setOpenDetails(true)
  }

  return (
    <DashboardLayout userRole="grama_niladhari">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Approved Voters of {gramaNiladhari?.gnDivision}</h1>
          <p className="text-indigo-100">View and manage approved voter registrations.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Approved Voters</CardTitle>
              <CardDescription>View details of approved voters.</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                placeholder="Search by name, NIC, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-1/3"
              />
              {/* <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="md:w-1/4">
                  <SelectValue placeholder="Filter by District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {uniqueDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div>Loading voters...</div>
              ) : filteredVoters.length === 0 ? (
                <div>No approved voters found in your grama niladhari divition.</div>
              ) : (
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">NIC</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">District</th>
                      <th className="p-2 text-left">Grama Niladari Divition</th>
                      <th className="p-2 text-left">Approved At</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVoters.map((voter) => (
                      <tr key={voter._id} className="border-b">
                        <td className="p-2 font-medium">{voter.user?.name || 'N/A'}</td>
                        <td className="p-2">{voter.nic}</td>
                        <td className="p-2">{voter.user?.email || 'N/A'}</td>
                        <td className="p-2 capitalize">{voter.district || 'N/A'}</td>
                        <td className="p-2">{voter.gramaNiladhariDivision}</td>
                        <td className="p-2">{new Date(voter.updatedAt).toLocaleDateString()}</td>
                        <td className="p-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(voter)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={openDetails} onOpenChange={setOpenDetails}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Voter Details</DialogTitle>
            </DialogHeader>
            {selectedVoter && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Personal Information</h4>
                    <p><strong>Name:</strong> {selectedVoter.user?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedVoter.user?.email || 'N/A'}</p>
                    <p><strong>NIC:</strong> {selectedVoter.nic}</p>
                    <p><strong>Phone:</strong> {selectedVoter.phone}</p>
                    <p><strong>Address:</strong> {selectedVoter.address}</p>
                    <p><strong>District:</strong> {selectedVoter.district || 'N/A'}</p>
                    <p><strong>Grama Niladhari Division:</strong> {selectedVoter.gramaNiladhariDivision}</p>
                    <p><strong>Status:</strong> {selectedVoter.status}</p>
                    <p><strong>Voter Number:</strong> {selectedVoter.voterNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Document Approvals</h4>
                    <p><strong>NIC Approval:</strong> {selectedVoter.nicApproval}</p>
                    <p><strong>Birth Certificate Approval:</strong> {selectedVoter.birthCertificateApproval}</p>
                    <p><strong>Address Approval:</strong> {selectedVoter.addressApproval}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedVoter.nicFrontPath ? (
                      <div>
                        <p><strong>NIC Front:</strong></p>
                        <img
                          src={`${IMAGE_BASE}/${selectedVoter.nicFrontPath}`}
                          alt="NIC Front"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    ) : (
                      <p>No NIC Front uploaded</p>
                    )}
                    {selectedVoter.nicBackPath ? (
                      <div>
                        <p><strong>NIC Back:</strong></p>
                        <img
                          src={`${IMAGE_BASE}/${selectedVoter.nicBackPath}`}
                          alt="NIC Back"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    ) : (
                      <p>No NIC Back uploaded</p>
                    )}
                    {selectedVoter.birthCertFrontPath ? (
                      <div>
                        <p><strong>Birth Certificate Front:</strong></p>
                        <img
                          src={`${IMAGE_BASE}/${selectedVoter.birthCertFrontPath}`}
                          alt="Birth Certificate Front"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    ) : (
                      <p>No Birth Certificate Front uploaded</p>
                    )}
                    {selectedVoter.birthCertBackPath ? (
                      <div>
                        <p><strong>Birth Certificate Back:</strong></p>
                        <img
                          src={`${IMAGE_BASE}/${selectedVoter.birthCertBackPath}`}
                          alt="Birth Certificate Back"
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    ) : (
                      <p>No Birth Certificate Back uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}