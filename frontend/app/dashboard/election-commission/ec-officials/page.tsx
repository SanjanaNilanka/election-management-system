"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "@/components/ui/use-toast"

export default function ElectionCommissionManagementPage() {
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
  })
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"
  const ROLE = "election_commission"

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE}/users/${ROLE}`)
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
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  // Handle inputs
  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Create user
  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({ variant: "destructive", description: "All fields are required" })
      return
    }

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: ROLE }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create user")
      }
      setOpenAdd(false)
      resetForm()
      fetchData()
      toast({ description: "User added successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Update user
  const handleUpdateUser = async () => {
    if (!formData.name || !formData.email) {
      toast({ variant: "destructive", description: "Name and email are required" })
      return
    }

    try {
      const payload: { name: string; email: string; password?: string; role: string } = { ...formData, role: ROLE }
      if (!formData.password) delete payload.password // Don't update password if not provided

      const response = await fetch(`${API_BASE}/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update user")
      }
      setOpenEdit(false)
      fetchData()
      toast({ description: "User updated successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // Delete user
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/${selectedUser._id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete user")
      }
      setOpenDelete(false)
      fetchData()
      toast({ description: "User deleted successfully" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  // View user
  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setOpenView(true)
  }

  // Edit user
  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
    })
    setOpenEdit(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
    })
  }

  return (
    <DashboardLayout userRole="election_commission">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Election Commission Management</h1>
          <p className="text-indigo-100">Manage Election Commission users.</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Election Commission Users</CardTitle>
              <CardDescription>View, add, edit, and manage Election Commission users.</CardDescription>
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
                      <th className="p-2 text-left">Created At</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-b">
                        <td className="p-2 font-medium">{user.name}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
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
              <DialogTitle>Add New Election Commission User</DialogTitle>
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
              <DialogTitle>Edit Election Commission User</DialogTitle>
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
              <DialogTitle>Election Commission User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(selectedUser.updatedAt).toLocaleString()}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Election Commission User</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete <b>{selectedUser?.name}</b>?
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