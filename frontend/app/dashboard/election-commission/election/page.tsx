// app/dashboard/election-commission/election/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Play, Square, Eye } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "@/components/ui/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function ElectionManagementPage() {
  const [elections, setElections] = useState<any[]>([])
  const [filteredElections, setFilteredElections] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openActivate, setOpenActivate] = useState(false)
  const [openClose, setOpenClose] = useState(false)
  const [selectedElection, setSelectedElection] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    level: "",
    start: { date: undefined as Date | undefined, time: "" },
    end: { date: undefined as Date | undefined, time: "" },
    candidates: [] as { candidate: string, party: string }[],
  })
  const [selectedCandidateId, setSelectedCandidateId] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [electionRes, candidateRes] = await Promise.all([
        fetch(`${API_BASE}/elections`).then((r) => r.json()),
        fetch(`${API_BASE}/candidates`).then((r) => r.json()),
      ])
      setElections(Array.isArray(electionRes) ? electionRes : [])
      setFilteredElections(Array.isArray(electionRes) ? electionRes : [])
      setCandidates(Array.isArray(candidateRes) ? candidateRes : [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data. Please try again.",
      })
      setElections([])
      setFilteredElections([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter elections
  useEffect(() => {
    let filtered = Array.isArray(elections) ? elections : []
    filtered = filtered.filter(
      (e) =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredElections(filtered)
  }, [searchTerm, elections])

  // Handle inputs
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (field: 'start' | 'end', date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: { ...prev[field], date } }))
  }

  const handleTimeChange = (field: 'start' | 'end', time: string) => {
    setFormData((prev) => ({ ...prev, [field]: { ...prev[field], time } }))
  }

  const addCandidate = () => {
    if (!selectedCandidateId) return
    const cand = candidates.find((c: any) => c._id === selectedCandidateId)
    if (cand && !formData.candidates.some((c) => c.candidate === selectedCandidateId)) {
      setFormData((prev) => ({
        ...prev,
        candidates: [...prev.candidates, { candidate: cand._id, party: cand.currentParty._id }]
      }))
    }
    setSelectedCandidateId("")
  }

  const removeCandidate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      candidates: prev.candidates.filter((_, i) => i !== index)
    }))
  }

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({ variant: "destructive", description: "Title is required" })
      return false
    }
    if (!formData.description.trim()) {
      toast({ variant: "destructive", description: "Description is required" })
      return false
    }
    if (!formData.type) {
      toast({ variant: "destructive", description: "Type is required" })
      return false
    }
    if (!formData.level) {
      toast({ variant: "destructive", description: "Level is required" })
      return false
    }
    if (!formData.start.date || !formData.start.time) {
      toast({ variant: "destructive", description: "Start date and time are required" })
      return false
    }
    if (!formData.end.date || !formData.end.time) {
      toast({ variant: "destructive", description: "End date and time are required" })
      return false
    }
    return true
  }

  // Create election
  const handleAddElection = async () => {
    if (!validateForm()) return

    const payload = {
      ...formData,
      start: { date: formData.start.date, time: formData.start.time },
      end: { date: formData.end.date, time: formData.end.time },
    }

    try {
      const response = await fetch(`${API_BASE}/elections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.log('Backend error:', errorData)
        throw new Error(errorData.message || "Failed to create election")
      }
      setOpenAdd(false)
      resetForm()
      fetchData()
      toast({ description: "Election added successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Update election
  const handleUpdateElection = async () => {
    if (!validateForm()) return

    const payload = {
      ...formData,
      start: { date: formData.start.date, time: formData.start.time },
      end: { date: formData.end.date, time: formData.end.time },
    }

    try {
      const response = await fetch(`${API_BASE}/elections/${selectedElection._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.log('Backend error:', errorData)
        throw new Error(errorData.message || "Failed to update election")
      }
      setOpenEdit(false)
      fetchData()
      toast({ description: "Election updated successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Delete election
  const handleDeleteElection = async () => {
    try {
      const response = await fetch(`${API_BASE}/elections/${selectedElection._id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        console.log('Backend error:', errorData)
        throw new Error(errorData.message || "Failed to delete election")
      }
      setOpenDelete(false)
      fetchData()
      toast({ description: "Election deleted successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Activate election
  const handleActivateElection = async () => {
    try {
      const response = await fetch(`${API_BASE}/elections/${selectedElection._id}/activate`, {
        method: "PATCH",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to activate election")
      }
      setOpenActivate(false)
      fetchData()
      toast({ description: "Election activated successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Close election
  const handleCloseElection = async () => {
    try {
      const response = await fetch(`${API_BASE}/elections/${selectedElection._id}/close`, {
        method: "PATCH",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to close election")
      }
      setOpenClose(false)
      fetchData()
      toast({ description: "Election closed successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "",
      level: "",
      start: { date: undefined, time: "" },
      end: { date: undefined, time: "" },
      candidates: [],
    })
  }

  return (
    <DashboardLayout userRole="election_commission">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Election Management</h1>
          <p className="text-indigo-100">Manage elections, their details, and status.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Registered Elections</CardTitle>
              <CardDescription>View, add, and manage elections.</CardDescription>
            </div>
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Election
            </Button>
          </CardHeader>

          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                placeholder="Search by title or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-1/3"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div>Loading elections...</div>
              ) : filteredElections.length === 0 ? (
                <div>No elections found.</div>
              ) : (
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-left">Type</th>
                      <th className="p-2 text-left">Level</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Start</th>
                      <th className="p-2 text-left">End</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                    <tbody>
                    {filteredElections.map((e) => (
                        <tr key={e._id} className="border-b">
                        <td className="p-2 font-medium">{e.title}</td>
                        <td className="p-2 capitalize">{e.type}</td>
                        <td className="p-2 capitalize">{e.level}</td>
                        <td className="p-2 capitalize">{e.status}</td>
                        <td className="p-2">
                            {e.start?.date && e.start?.time
                            ? `${format(new Date(e.start.date), "PPP")} ${e.start.time}`
                            : 'N/A'}
                        </td>
                        <td className="p-2">
                            {e.end?.date && e.end?.time
                            ? `${format(new Date(e.end.date), "PPP")} ${e.end.time}`
                            : 'N/A'}
                        </td>
                        <td className="p-2 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `/dashboard/election-commission/election/view/${e._id}`}
                              title="View Results"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedElection(e)
                                setFormData({
                                title: e.title || "",
                                description: e.description || "",
                                type: e.type || "",
                                level: e.level || "",
                                start: {
                                    date: e.start?.date ? new Date(e.start.date) : undefined,
                                    time: e.start?.time || "",
                                },
                                end: {
                                    date: e.end?.date ? new Date(e.end.date) : undefined,
                                    time: e.end?.time || "",
                                },
                                candidates: e.candidates.map((c: any) => ({
                                    candidate: c.candidate._id,
                                    party: c.party._id,
                                })),
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
                                setSelectedElection(e)
                                setOpenDelete(true)
                            }}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                            {e.status === 'pending' && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                setSelectedElection(e)
                                setOpenActivate(true)
                                }}
                            >
                                <Play className="h-4 w-4" />
                            </Button>
                            )}
                            {e.status === 'active' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                setSelectedElection(e)
                                setOpenClose(true)
                                }}
                            >
                                <Square className="h-4 w-4" />
                            </Button>
                            )}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Election</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => handleChange('description', e.target.value)} required />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presidential">Presidential</SelectItem>
                    <SelectItem value="parliamentary">Parliamentary</SelectItem>
                    <SelectItem value="provincial">Provincial</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select value={formData.level} onValueChange={(value) => handleChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="provincial">Provincial</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.start.date && "text-muted-foreground"
                        )}
                      >
                        {formData.start.date ? format(formData.start.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start.date}
                        onSelect={(date) => handleDateChange('start', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Label>Start Time</Label>
                  <Input type="time" value={formData.start.time} onChange={(e) => handleTimeChange('start', e.target.value)} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.end.date && "text-muted-foreground"
                        )}
                      >
                        {formData.end.date ? format(formData.end.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end.date}
                        onSelect={(date) => handleDateChange('end', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Label>End Time</Label>
                  <Input type="time" value={formData.end.time} onChange={(e) => handleTimeChange('end', e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Candidates</Label>
                <div className="flex gap-2 mb-2">
                  <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((c: any) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name} ({c.currentParty.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addCandidate}>Add</Button>
                </div>
                <div className="space-y-2">
                  {formData.candidates.map((cand, index) => {
                    const c = candidates.find((cc: any) => cc._id === cand.candidate)
                    return (
                      <div key={index} className="flex justify-between items-center">
                        <span>{c?.name} - {c?.currentParty.name}</span>
                        <Button variant="destructive" size="sm" onClick={() => removeCandidate(index)}>
                          Remove
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddElection}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={openEdit} onOpenChange={(open) => {
          setOpenEdit(open)
          if (!open) resetForm()
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Election</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => handleChange('description', e.target.value)} required />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presidential">Presidential</SelectItem>
                    <SelectItem value="parliamentary">Parliamentary</SelectItem>
                    <SelectItem value="provincial">Provincial</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select value={formData.level} onValueChange={(value) => handleChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="provincial">Provincial</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.start.date && "text-muted-foreground"
                        )}
                      >
                        {formData.start.date ? format(formData.start.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start.date}
                        onSelect={(date) => handleDateChange('start', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Label>Start Time</Label>
                  <Input type="time" value={formData.start.time} onChange={(e) => handleTimeChange('start', e.target.value)} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.end.date && "text-muted-foreground"
                        )}
                      >
                        {formData.end.date ? format(formData.end.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end.date}
                        onSelect={(date) => handleDateChange('end', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Label>End Time</Label>
                  <Input type="time" value={formData.end.time} onChange={(e) => handleTimeChange('end', e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Candidates</Label>
                <div className="flex gap-2 mb-2">
                  <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidates.map((c: any) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name} ({c.currentParty.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addCandidate}>Add</Button>
                </div>
                <div className="space-y-2">
                  {formData.candidates.map((cand, index) => {
                    const c = candidates.find((cc: any) => cc._id === cand.candidate)
                    return (
                      <div key={index} className="flex justify-between items-center">
                        <span>{c?.name} - {c?.currentParty.name}</span>
                        <Button variant="destructive" size="sm" onClick={() => removeCandidate(index)}>
                          Remove
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateElection}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Election</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete <b>{selectedElection?.title}</b>?
            </p>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDeleteElection}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activate Dialog */}
        <Dialog open={openActivate} onOpenChange={setOpenActivate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Activate Election</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to activate <b>{selectedElection?.title}</b>?
            </p>
            <DialogFooter>
              <Button onClick={handleActivateElection}>
                Activate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Close Dialog */}
        <Dialog open={openClose} onOpenChange={setOpenClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close Election</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to close <b>{selectedElection?.title}</b>?
            </p>
            <DialogFooter>
              <Button variant="secondary" onClick={handleCloseElection}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}