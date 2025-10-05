"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Upload } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function PartyManagementPage() {
  const [parties, setParties] = useState<any[]>([])
  const [filteredParties, setFilteredParties] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedParty, setSelectedParty] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    foundedYear: "",
    color: "",
    description: "",
    logo: null as File | null,
  })

  // Fetch parties
  const fetchParties = async () => {
    const res = await fetch("http://localhost:5000/api/parties")
    const data = await res.json()
    setParties(data)
    setFilteredParties(data)
  }

  useEffect(() => {
    fetchParties()
  }, [])

  // Filter by search and type
  useEffect(() => {
    let filtered = parties.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (filterType !== "all") {
      filtered = filtered.filter(p => p.type === filterType)
    }
    setFilteredParties(filtered)
  }, [searchTerm, filterType, parties])

  // Handle form change
  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: any) => {
    setFormData(prev => ({ ...prev, logo: e.target.files[0] }))
  }

  // Add new party
  const handleAddParty = async () => {
    const data = new FormData()
    Object.keys(formData).forEach(key => {
      if (formData[key as keyof typeof formData]) {
        data.append(key, formData[key as keyof typeof formData] as any)
      }
    })

    await fetch("http://localhost:5000/api/parties", {
      method: "POST",
      body: data
    })
    setOpenAdd(false)
    setFormData({ name: "", abbreviation: "", foundedYear: "", color: "", description: "", logo: null })
    fetchParties()
  }

  // Update party
  const handleUpdateParty = async () => {
    const data = new FormData()
    Object.keys(formData).forEach(key => {
      if (formData[key as keyof typeof formData]) {
        data.append(key, formData[key as keyof typeof formData] as any)
      }
    })

    await fetch(`http://localhost:5000/api/parties/${selectedParty._id}`, {
      method: "PUT",
      body: data
    })
    setOpenEdit(false)
    fetchParties()
  }

  // Delete party
  const handleDeleteParty = async () => {
    await fetch(`http://localhost:5000/api/parties/${selectedParty._id}`, {
      method: "DELETE"
    })
    setOpenDelete(false)
    fetchParties()
  }

  return (
    <DashboardLayout userRole="election_commission">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Party Management</h1>
          <p className="text-indigo-100">
            Manage political parties, their details, and logos in the electoral system.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Registered Parties</CardTitle>
              <CardDescription>View, add, and manage political parties.</CardDescription>
            </div>
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Party
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                placeholder="Search by name or abbreviation..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="md:w-1/3"
              />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="md:w-1/4">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="district">District</SelectItem>
                  <SelectItem value="province">Province</SelectItem>
                  <SelectItem value="municipal">Municipal</SelectItem>
                  <SelectItem value="urban">Urban</SelectItem>
                  <SelectItem value="pradeshiya-sabha">Pradeshiya Sabha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-2 text-left">Logo</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Abbreviation</th>
                    <th className="p-2 text-left">Founded Year</th>
                    <th className="p-2 text-left">Color</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParties.map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">
                        {p.logoUrl ? (
                          <img src={`http://localhost:5000${p.logoUrl}`} alt={p.name} className="h-10 w-10 rounded" />
                        ) : (
                          <Badge variant="outline">No Logo</Badge>
                        )}
                      </td>
                      <td className="p-2 font-medium">{p.name}</td>
                      <td className="p-2">{p.abbreviation}</td>
                      <td className="p-2">{p.foundedYear || "-"}</td>
                      <td className="p-2">
                        <Badge style={{ backgroundColor: p.color || "#ccc" }}>{p.color || "N/A"}</Badge>
                      </td>
                      <td className="p-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedParty(p)
                            setFormData({
                              name: p.name,
                              abbreviation: p.abbreviation,
                              foundedYear: p.foundedYear || "",
                              color: p.color || "",
                              description: p.description || "",
                              logo: null
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
                            setSelectedParty(p)
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
            </div>
          </CardContent>
        </Card>

        {/* Add Dialog */}
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} />
              <Label>Abbreviation</Label>
              <Input name="abbreviation" value={formData.abbreviation} onChange={handleChange} />
              <Label>Founded Year</Label>
              <Input type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange} />
              <Label>Color (Hex or name)</Label>
              <Input name="color" value={formData.color} onChange={handleChange} />
              <Label>Description</Label>
              <Input name="description" value={formData.description} onChange={handleChange} />
              <Label>Logo</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <DialogFooter>
              <Button onClick={handleAddParty}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Party</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Label>Name</Label>
              <Input name="name" value={formData.name} onChange={handleChange} />
              <Label>Abbreviation</Label>
              <Input name="abbreviation" value={formData.abbreviation} onChange={handleChange} />
              <Label>Founded Year</Label>
              <Input type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange} />
              <Label>Color</Label>
              <Input name="color" value={formData.color} onChange={handleChange} />
              <Label>Description</Label>
              <Input name="description" value={formData.description} onChange={handleChange} />
              <Label>Logo (optional)</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateParty}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Party</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete <b>{selectedParty?.name}</b>?</p>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDeleteParty}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
