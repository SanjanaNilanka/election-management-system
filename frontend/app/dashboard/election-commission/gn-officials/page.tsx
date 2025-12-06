"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "@/components/ui/use-toast"
import gnDivisions from "@/data/gn-divisions.json"

export default function GramaNiladhariManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    province: "",
    district: "",
    gnDivision: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [gnDivisionSearch, setGNDivisionSearch] = useState("")

  const API_BASE = "http://localhost:5000/api"
  const ROLE = "grama_niladhari"

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/gns`)
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])
      setFilteredUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data. Please try again.",
      })
      setUsers([])
      setFilteredUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter users
  useEffect(() => {
    let filtered = users.filter(
      (u) =>
        u.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  // Handle inputs
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "province") {
      setFormData((prev) => ({ ...prev, district: "", gnDivision: "" }))
      setGNDivisionSearch("")
    } else if (name === "district") {
      setFormData((prev) => ({ ...prev, gnDivision: "" }))
      setGNDivisionSearch("")
    }
  }

  // Create GN
  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.province || !formData.district || !formData.gnDivision) {
      toast({ variant: "destructive", description: "All fields are required" })
      return
    }

    try {
      const response = await fetch(`${API_BASE}/gns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: ROLE }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create GN")
      }
      setOpenAdd(false)
      resetForm()
      fetchData()
      toast({ description: "GN added successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Update GN
  const handleUpdateUser = async () => {
    if (!formData.name || !formData.email || !formData.province || !formData.district || !formData.gnDivision) {
      toast({ variant: "destructive", description: "Name, email, province, district, and GN division are required" })
      return
    }

    try {
      const payload: { name: string; email: string; password?: string; province: string; district: string; gnDivision: string; role: string } = { ...formData, role: ROLE }
      if (!formData.password) delete payload.password

      const response = await fetch(`${API_BASE}/gns/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update GN")
      }
      setOpenEdit(false)
      fetchData()
      toast({ description: "GN updated successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Delete GN
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/gns/${selectedUser._id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete GN")
      }
      setOpenDelete(false)
      fetchData()
      toast({ description: "GN deleted successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // View GN
  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setOpenView(true)
  }

  // Edit GN
  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setFormData({
      name: user.user.name,
      email: user.user.email,
      password: "",
      province: user.province,
      district: user.district,
      gnDivision: user.gnDivision,
    })
    setOpenEdit(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      province: "",
      district: "",
      gnDivision: "",
    })
    setGNDivisionSearch("")
  }

  // Get province, district, and GN division options
  const provinces = Object.keys(gnDivisions)
  const districts = formData.province ? Object.keys(gnDivisions[formData.province as keyof typeof gnDivisions]) : []
  const gnDivisionsList =
    formData.district
      ? (gnDivisions[formData.province as keyof typeof gnDivisions] as Record<string, string[]> | undefined)?.[formData.district] || []
      : []
  const filteredGNDivisions = gnDivisionsList.filter((division: string) =>
    division.toLowerCase().includes(gnDivisionSearch.toLowerCase())
  )

  return (
    <DashboardLayout userRole="election_commission">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Grama Niladhari Management</h1>
          <p className="text-indigo-100">Manage Grama Niladhari users.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Grama Niladhari Users</CardTitle>
              <CardDescription>View, add, edit, and manage Grama Niladhari users.</CardDescription>
            </div>
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </CardHeader>

          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-1/3"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div>Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div>No users found.</div>
              ) : (
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Province</th>
                      <th className="p-2 text-left">District</th>
                      <th className="p-2 text-left">GN Division</th>
                      {/* <th className="p-2 text-left">Created At</th> */}
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b">
                        <td className="p-2 font-medium">{user.user?.name}</td>
                        <td className="p-2">{user.user?.email}</td>
                        <td className="p-2">{user.province}</td>
                        <td className="p-2">{user.district}</td>
                        <td className="p-2">{user.gnDivision}</td>
                        {/* <td className="p-2">{new Date(user.user?.createdAt).toLocaleDateString()}</td> */}
                        <td className="p-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
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
              <DialogTitle>Add New Grama Niladhari</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required />
              </div>
              <div>
                <Label>Province</Label>
                <Select value={formData.province} onValueChange={(value) => handleChange('province', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>{province} Province</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>District</Label>
                <Select value={formData.district} onValueChange={(value) => handleChange('district', value)} disabled={!formData.province}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>GN Division</Label>
                <Input
                  placeholder="Search GN division..."
                  value={gnDivisionSearch}
                  onChange={(e) => setGNDivisionSearch(e.target.value)}
                  className="mb-2"
                />
                <Select value={formData.gnDivision} onValueChange={(value) => handleChange('gnDivision', value)} disabled={!formData.district}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GN division" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {filteredGNDivisions.map((division: string) => (
                      <SelectItem key={division} value={division}>{division}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddUser}>Save</Button>
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
              <DialogTitle>Edit Grama Niladhari</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
              </div>
              <div>
                <Label>Password (optional)</Label>
                <Input type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} />
              </div>
              <div>
                <Label>Province</Label>
                <Select value={formData.province} onValueChange={(value) => handleChange('province', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>District</Label>
                <Select value={formData.district} onValueChange={(value) => handleChange('district', value)} disabled={!formData.province}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>GN Division</Label>
                <Input
                  placeholder="Search GN division..."
                  value={gnDivisionSearch}
                  onChange={(e) => setGNDivisionSearch(e.target.value)}
                  className="mb-2"
                />
                <Select value={formData.gnDivision} onValueChange={(value) => handleChange('gnDivision', value)} disabled={!formData.district}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GN division" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {filteredGNDivisions.map((division: string) => (
                      <SelectItem key={division} value={division}>{division}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateUser}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={openView} onOpenChange={setOpenView}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grama Niladhari Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedUser.user?.name}</p>
                <p><strong>Email:</strong> {selectedUser.user?.email}</p>
                <p><strong>Role:</strong> {selectedUser.user?.role}</p>
                <p><strong>Province:</strong> {selectedUser.province}</p>
                <p><strong>District:</strong> {selectedUser.district}</p>
                <p><strong>GN Division:</strong> {selectedUser.gnDivision}</p>
                <p><strong>Created At:</strong> {new Date(selectedUser.user?.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(selectedUser.user?.updatedAt).toLocaleString()}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Grama Niladhari</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete <b>{selectedUser?.user?.name}</b>?
            </p>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}