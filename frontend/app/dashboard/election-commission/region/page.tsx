"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Plus, Edit, Trash2, Search } from "lucide-react"

interface Region {
  _id: string
  name: string
  type: string
}

export default function RegionManagementPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([])
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")

  // Dialog states
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  // Form states
  const [regionName, setRegionName] = useState("")
  const [regionType, setRegionType] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)

  // Fetch all regions
  const fetchRegions = async () => {
    const res = await fetch("http://localhost:5000/api/regions")
    const data = await res.json()
    setRegions(data)
    setFilteredRegions(data)
  }

  useEffect(() => {
    fetchRegions()
  }, [])

  // Search + Filter logic
  useEffect(() => {
    let data = regions
    if (filterType !== "all") data = data.filter(r => r.type === filterType)
    if (search.trim() !== "")
      data = data.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    setFilteredRegions(data)
  }, [search, filterType, regions])

  // Handle create
  const handleCreate = async () => {
    await fetch("http://localhost:5000/api/regions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: regionName, type: regionType })
    })
    setOpenAdd(false)
    setRegionName("")
    setRegionType("")
    fetchRegions()
  }

  // Handle update
  const handleUpdate = async () => {
    if (!selectedRegion) return
    await fetch(`http://localhost:5000/api/regions/${selectedRegion._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: regionName, type: regionType })
    })
    setOpenEdit(false)
    fetchRegions()
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRegion) return
    await fetch(`http://localhost:5000/api/regions/${selectedRegion._id}`, { method: "DELETE" })
    setOpenDelete(false)
    fetchRegions()
  }

  return (
    <DashboardLayout userRole="election_commission">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Region Management</h1>
          <p className="text-indigo-100">
            Manage and organize administrative regions across Sri Lanka.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Regions</CardTitle>
              <CardDescription>Search, filter, and manage region data</CardDescription>
            </div>
            <Button onClick={() => setOpenAdd(true)} className="mt-3 md:mt-0">
              <Plus className="mr-2 h-4 w-4" /> Add Region
            </Button>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by region name..."
                  className="pl-8"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[220px]">
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
              <table className="w-full text-sm border">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-right py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegions.map(region => (
                    <tr key={region._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{region.name}</td>
                      <td className="py-2 px-4">
                        <Badge variant="outline" className="capitalize">{region.type}</Badge>
                      </td>
                      <td className="py-2 px-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRegion(region)
                            setRegionName(region.name)
                            setRegionType(region.type)
                            setOpenEdit(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRegion(region)
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

        {/* Add Region Dialog */}
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Region</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Region Name</Label>
                <Input value={regionName} onChange={e => setRegionName(e.target.value)} />
              </div>
              <div>
                <Label>Region Type</Label>
                <Select value={regionType} onValueChange={setRegionType}>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="province">Province</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem>
                    <SelectItem value="urban">Urban</SelectItem>
                    <SelectItem value="pradeshiya-sabha">Pradeshiya Sabha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Region Dialog */}
        <Dialog open={openEdit} onOpenChange={setOpenEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Region</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Region Name</Label>
                <Input value={regionName} onChange={e => setRegionName(e.target.value)} />
              </div>
              <div>
                <Label>Region Type</Label>
                <Select value={regionType} onValueChange={setRegionType}>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="province">Province</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem>
                    <SelectItem value="urban">Urban</SelectItem>
                    <SelectItem value="pradeshiya-sabha">Pradeshiya Sabha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDelete} onOpenChange={setOpenDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Region</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete <strong>{selectedRegion?.name}</strong>?</p>
            <DialogFooter>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}