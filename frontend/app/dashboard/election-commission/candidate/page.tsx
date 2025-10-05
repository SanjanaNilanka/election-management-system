"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "@/components/ui/use-toast"

export default function CandidateManagementPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [parties, setParties] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<any[]>([])
  const [selectedPartyFilter, setSelectedPartyFilter] = useState("")
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    currentParty: "",
    participatedFrom: "district",
    regionName: "",
    bio: "",
    dob: "",
    image: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [partyRes, regionRes, candidateRes] = await Promise.all([
        fetch(`${API_BASE}/parties`).then((r) => r.json()),
        fetch(`${API_BASE}/regions`).then((r) => r.json()),
        fetch(`${API_BASE}/candidates`).then((r) => r.json()),
      ])
      
      // Ensure candidateRes is an array
      setCandidates(Array.isArray(candidateRes) ? candidateRes : [])
      setParties(Array.isArray(partyRes) ? partyRes : [])
      setRegions(Array.isArray(regionRes) ? regionRes : [])
      setFilteredCandidates(Array.isArray(candidateRes) ? candidateRes : [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data. Please try again.",
      })
      setCandidates([])
      setFilteredCandidates([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter candidates
  useEffect(() => {
    let filtered = Array.isArray(candidates) ? candidates : []
    filtered = filtered.filter(
      (c) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.currentParty?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (selectedPartyFilter && selectedPartyFilter !== "all") {
      filtered = filtered.filter((c) => c.currentParty?._id === selectedPartyFilter)
    }
    if (selectedRegionFilter && selectedRegionFilter !== "all") {
      filtered = filtered.filter((c) => c.regionName?._id === selectedRegionFilter)
    }
    setFilteredCandidates(filtered)
  }, [searchTerm, selectedPartyFilter, selectedRegionFilter, candidates])

  // Handle inputs
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: any) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }))
  }

  // Validate form
  const validateForm = () => {
    if (!formData.name) {
      toast({ variant: "destructive", description: "Name is required" })
      return false
    }
    if (!formData.currentParty) {
      toast({ variant: "destructive", description: "Party is required" })
      return false
    }
    if (!formData.participatedFrom) {
      toast({ variant: "destructive", description: "Participation level is required" })
      return false
    }
    if (formData.participatedFrom !== "national" && !formData.regionName) {
      toast({ variant: "destructive", description: "Region is required for non-national candidates" })
      return false
    }
    return true
  }

  // Create candidate
  const handleAddCandidate = async () => {
    if (!validateForm()) return

    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value && (key !== "regionName" || formData.participatedFrom !== "national")) {
        data.append(key, value as any)
      }
    })

    try {
      const response = await fetch(`${API_BASE}/candidates`, {
        method: "POST",
        body: data,
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.log('Backend error:', errorData)
        throw new Error(errorData.message)
      }
      setOpenAdd(false)
      resetForm()
      fetchData()
      toast({ description: "Candidate added successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Update candidate
  const handleUpdateCandidate = async () => {
    if (!validateForm()) return

    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value && (key !== "regionName" || formData.participatedFrom !== "national")) {
        data.append(key, value as any)
      }
    })

    try {
      const response = await fetch(`${API_BASE}/candidates/${selectedCandidate._id}`, {
        method: "PUT",
        body: data,
      })
      if (!response.ok) {
        throw new Error((await response.json()).message)
      }
      setOpenEdit(false)
      fetchData()
      toast({ description: "Candidate updated successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Delete candidate
  const handleDeleteCandidate = async () => {
    try {
      const response = await fetch(`${API_BASE}/candidates/${selectedCandidate._id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error((await response.json()).message)
      }
      setOpenDelete(false)
      fetchData()
      toast({ description: "Candidate deleted successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      currentParty: "",
      participatedFrom: "district",
      regionName: "",
      bio: "",
      dob: "",
      image: null,
    })
  }

  return (
    <DashboardLayout userRole="election_commission">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Candidate Management</h1>
          <p className="text-indigo-100">Manage candidates, their details, and filter by party and region.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Registered Candidates</CardTitle>
              <CardDescription>View, add, and manage election candidates.</CardDescription>
            </div>
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Candidate
            </Button>
          </CardHeader>

          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                placeholder="Search by name or party..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-1/3"
              />

              <Select value={selectedPartyFilter} onValueChange={setSelectedPartyFilter}>
                <SelectTrigger className="md:w-1/4">
                  <SelectValue placeholder="Filter by party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  {parties.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRegionFilter} onValueChange={setSelectedRegionFilter}>
                <SelectTrigger className="md:w-1/4">
                  <SelectValue placeholder="Filter by region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div>Loading candidates...</div>
              ) : filteredCandidates.length === 0 ? (
                <div>No candidates found.</div>
              ) : (
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-2 text-left">Image</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Party</th>
                      <th className="p-2 text-left">Region</th>
                      <th className="p-2 text-left">Level</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((c) => (
                      <tr key={c._id} className="border-b">
                        <td className="p-2">
                          {c.imageUrl ? (
                            <img
                              src={`http://localhost:5000${c.imageUrl}`}
                              alt={c.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <Badge variant="outline">No Image</Badge>
                          )}
                        </td>
                        <td className="p-2 font-medium">{c.name}</td>
                        <td className="p-2">{c.currentParty?.name || '-'}</td>
                        <td className="p-2">{c.regionName?.name || '-'}</td>
                        <td className="p-2 capitalize">{c.participatedFrom}</td>
                        <td className="p-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCandidate(c)
                              setFormData({
                                name: c.name || "",
                                currentParty: c.currentParty?._id || "",
                                participatedFrom: c.participatedFrom || "district",
                                regionName: c.regionName?._id || "",
                                bio: c.bio || "",
                                dob: c.dob ? new Date(c.dob).toISOString().substring(0, 10) : "",
                                image: null,
                              })
                              setOpenEdit(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedCandidate(c)
                              setOpenDelete(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Add Dialog */}
        <Dialog open={openAdd} onOpenChange={(open) => {
          setOpenAdd(open)
          if (!open) resetForm()
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input name="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
              </div>

              <div>
                <Label>Party</Label>
                <Select value={formData.currentParty} onValueChange={(value) => handleChange('currentParty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Party" />
                  </SelectTrigger>
                  <SelectContent>
                    {parties.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Participated From</Label>
                <Select value={formData.participatedFrom} onValueChange={(value) => handleChange('participatedFrom', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="province">Province</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem>
                    <SelectItem value="urban">Urban</SelectItem>
                    <SelectItem value="pradeshiya-sabha">Pradeshiya Sabha</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.participatedFrom !== "national" && (
                <div>
                  <Label>Region</Label>
                  <Select value={formData.regionName} onValueChange={(value) => handleChange('regionName', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r._id} value={r._id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Bio</Label>
                <Input name="bio" value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} />
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                />
              </div>

              <div>
                <Label>Image</Label>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCandidate}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={openEdit} onOpenChange={(open) => {
          setOpenEdit(open)
          if (!open) resetForm()
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Candidate</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input name="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
              </div>

              <div>
                <Label>Party</Label>
                <Select value={formData.currentParty} onValueChange={(value) => handleChange('currentParty', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Party" />
                  </SelectTrigger>
                  <SelectContent>
                    {parties.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Participated From</Label>
                <Select value={formData.participatedFrom} onValueChange={(value) => handleChange('participatedFrom', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="province">Province</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem>
                    <SelectItem value="urban">Urban</SelectItem>
                    <SelectItem value="pradeshiya-sabha">Pradeshiya Sabha</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.participatedFrom !== "national" && (
                <div>
                  <Label>Region</Label>
                  <Select value={formData.regionName} onValueChange={(value) => handleChange('regionName', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r._id} value={r._id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Bio</Label>
                <Input name="bio" value={formData.bio} onChange={(e) => handleChange('bio', e.target.value)} />
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                />
              </div>

              <div>
                <Label>Image (optional)</Label>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateCandidate}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Candidate</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete <b>{selectedCandidate?.name}</b>?
            </p>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDeleteCandidate}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}