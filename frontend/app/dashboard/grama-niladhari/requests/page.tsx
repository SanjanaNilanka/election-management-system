"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "@/components/ui/use-toast"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function RegistrationRequestsPage() {
  const [voters, setVoters] = useState<any[]>([])
  const [filteredVoters, setFilteredVoters] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [openApprove, setOpenApprove] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [selectedVoter, setSelectedVoter] = useState<any>(null)
  const [currentDocIndex, setCurrentDocIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"
  const IMAGE_BASE = "http://localhost:5000"

  // Fetch pending voters
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/voter`)
      if (!response.ok) {
        throw new Error("Failed to fetch voters")
      }
      const data = await response.json()
      const pendingVoters = Array.isArray(data) ? data.filter(v => v.status === 'pending') : []
      setVoters(pendingVoters)
      setFilteredVoters(pendingVoters)
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
    fetchData()
  }, [])

  // Filter voters
  useEffect(() => {
    const filtered = voters.filter((voter) => {
      const matchesSearch =
        voter.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voter.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    setFilteredVoters(filtered)
  }, [searchTerm, voters])

  // Handle approve click
  const handleApproveClick = (voter: any) => {
    setSelectedVoter(voter)
    if (voter.nicApproval === 'approved' && voter.birthCertificateApproval === 'approved' && voter.addressApproval === 'approved') {
      setOpenApprove(true)
    } else {
      setCurrentDocIndex(0)
      setOpenDetails(true)
    }
  }

  // Handle approve voter
  const handleApproveVoter = async () => {
    try {
      const response = await fetch(`${API_BASE}/voter/${selectedVoter._id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to approve voter")
      }
      setOpenApprove(false)
      fetchData()
      toast({ description: "Voter approved successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Handle reject click
  const handleRejectClick = (voter: any) => {
    setSelectedVoter(voter)
    if (voter.nicApproval === 'approved' && voter.birthCertificateApproval === 'approved' && voter.addressApproval === 'approved') {
      toast({ variant: "destructive", description: "Cannot reject fully approved voter. Reject an approval first." })
    } else {
      setOpenReject(true)
    }
  }

  // Handle reject voter
  const handleRejectVoter = async () => {
    try {
      const response = await fetch(`${API_BASE}/voter/${selectedVoter._id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reject voter")
      }
      setOpenReject(false)
      fetchData()
      toast({ description: "Voter rejected successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Handle approval change
  const handleApprovalChange = async (field: string, value: string) => {
    try {
      const payload = { [field]: value }
      const response = await fetch(`${API_BASE}/voter/${selectedVoter._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update approval")
      }
      const updatedVoter = await response.json()
      setSelectedVoter(updatedVoter)
      fetchData() // Refresh voter list to update table
      toast({ description: "Approval updated successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Documents array
  const getDocuments = () => {
    if (!selectedVoter) return []
    return [
      { label: 'NIC Front', src: selectedVoter.nicFrontPath },
      { label: 'NIC Back', src: selectedVoter.nicBackPath },
      { label: 'Birth Certificate Front', src: selectedVoter.birthCertFrontPath },
      { label: 'Birth Certificate Back', src: selectedVoter.birthCertBackPath },
    ].filter(doc => doc.src)
  }

  // Navigate documents
  const handlePrevDoc = () => {
    setCurrentDocIndex((prev) => (prev > 0 ? prev - 1 : getDocuments().length - 1))
  }

  const handleNextDoc = () => {
    setCurrentDocIndex((prev) => (prev < getDocuments().length - 1 ? prev + 1 : 0))
  }

  return (
    <DashboardLayout userRole="grama_niladhari">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Registration Requests</h1>
          <p className="text-green-100">Review and approve voter registrations.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Pending Voters</CardTitle>
              <CardDescription>Review pending voter registrations.</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                placeholder="Search by name, NIC, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-1/3"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div>Loading voters...</div>
              ) : filteredVoters.length === 0 ? (
                <div>No pending voters found.</div>
              ) : (
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">NIC</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Submitted At</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVoters.map((voter) => (
                      <tr key={voter._id} className="border-b">
                        <td className="p-2 font-medium">{voter.user?.name || 'N/A'}</td>
                        <td className="p-2">{voter.nic}</td>
                        <td className="p-2">{voter.user?.email || 'N/A'}</td>
                        <td className="p-2">{new Date(voter.createdAt).toLocaleDateString()}</td>
                        <td className="p-2 flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveClick(voter)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectClick(voter)}
                          >
                            Reject
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

        {/* Approve Confirmation Dialog */}
        <Dialog open={openApprove} onOpenChange={setOpenApprove}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Voter</DialogTitle>
            </DialogHeader>
            <p>
              All approvals are complete. Are you sure you want to approve <b>{selectedVoter?.user?.name}</b>?
            </p>
            <DialogFooter>
              <Button onClick={handleApproveVoter}>
                Confirm Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Confirmation Dialog */}
        <Dialog open={openReject} onOpenChange={setOpenReject}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Voter</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to reject <b>{selectedVoter?.user?.name}</b>?
            </p>
            <DialogFooter>
              <Button variant="destructive" onClick={handleRejectVoter}>
                Confirm Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Details and Approvals Dialog */}
        <Dialog open={openDetails} onOpenChange={setOpenDetails}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Voter Documents and Approvals</DialogTitle>
            </DialogHeader>
            {selectedVoter && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button variant="ghost" onClick={handlePrevDoc}>
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <div className="text-center flex-1">
                    <h4 className="font-medium">{getDocuments()[currentDocIndex]?.label}</h4>
                  </div>
                  <Button variant="ghost" onClick={handleNextDoc}>
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                <div className="border rounded-lg p-2">
                  <img
                    src={`${IMAGE_BASE}/${getDocuments()[currentDocIndex]?.src}`}
                    alt={getDocuments()[currentDocIndex]?.label}
                    className="max-w-full h-auto rounded-lg mx-auto"
                  />
                </div>
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Address</h4>
                  {selectedVoter.address}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium mb-2">NIC Approval</h4>
                    <p>Current: {selectedVoter.nicApproval}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprovalChange('nicApproval', 'approved')}
                        disabled={selectedVoter.nicApproval === 'approved'}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleApprovalChange('nicApproval', 'rejected')}
                        disabled={selectedVoter.nicApproval === 'rejected'}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Birth Certificate Approval</h4>
                    <p>Current: {selectedVoter.birthCertificateApproval}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprovalChange('birthCertificateApproval', 'approved')}
                        disabled={selectedVoter.birthCertificateApproval === 'approved'}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleApprovalChange('birthCertificateApproval', 'rejected')}
                        disabled={selectedVoter.birthCertificateApproval === 'rejected'}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Address Approval</h4>
                    <p>Current: {selectedVoter.addressApproval}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprovalChange('addressApproval', 'approved')}
                        disabled={selectedVoter.addressApproval === 'approved'}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleApprovalChange('addressApproval', 'rejected')}
                        disabled={selectedVoter.addressApproval === 'rejected'}
                      >
                        Reject
                      </Button>
                    </div>
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