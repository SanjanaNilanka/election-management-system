"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import axios from "axios"
import { useRouter } from "next/navigation"

import gnDivisionsData from "@/data/gn-divisions.json"

interface GNData {
  [province: string]: { [district: string]: string[] }
}
const gnData: GNData = gnDivisionsData as any

interface LocalAuthority {
  _id: string
  name: string
  type: string
}

export default function VoterRegister() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasVoter, setHasVoter] = useState(false)

  const [formData, setFormData] = useState({
    nic: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    gnDivision: "",
    localAuthority: "",
    nic_front: null as File | null,
    nic_back: null as File | null,
    birth_cert_front: null as File | null,
    birth_cert_back: null as File | null,
  })

  const [provinces] = useState(Object.keys(gnData))
  const [districts, setDistricts] = useState<string[]>([])
  const [gnDivisions, setGnDivisions] = useState<string[]>([])
  const [localAuthorities, setLocalAuthorities] = useState<LocalAuthority[]>([])
  const [openGN, setOpenGN] = useState(false)
  const [openLA, setOpenLA] = useState(false)
  const [loadingLA, setLoadingLA] = useState(true)

  // Fetch Local Authorities (municipal, urban, pradeshiya-sabha)
  useEffect(() => {
    const fetchLocalAuthorities = async () => {
      try {
        setLoadingLA(true)
        const res = await axios.get("http://localhost:5000/api/regions")
        const filtered = res.data.filter((r: any) =>
          ["municipal", "urban", "pradeshiya-sabha"].includes(r.type)
        )
        setLocalAuthorities(filtered)
      } catch (err) {
        console.error("Failed to load local authorities")
      } finally {
        setLoadingLA(false)
      }
    }
    fetchLocalAuthorities()
  }, [])

  // Province → District
  useEffect(() => {
    if (formData.province && gnData[formData.province]) {
      setDistricts(Object.keys(gnData[formData.province]))
      setFormData(prev => ({ ...prev, district: "", gnDivision: "" }))
    }
  }, [formData.province])

  // District → GN Divisions
  useEffect(() => {
    if (formData.province && formData.district) {
      setGnDivisions(gnData[formData.province][formData.district] || [])
      setFormData(prev => ({ ...prev, gnDivision: "" }))
    }
  }, [formData.district])

  // Check if already registered
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      axios.get(`http://localhost:5000/api/voter/user/${session.user.id}`)
        .then(() => setHasVoter(true))
        .catch((err) => err.response?.status === 404 && setHasVoter(false))
    }
  }, [session, status])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    const fd = new FormData()
    fd.append("userId", session?.user?.id || "")
    fd.append("nic", formData.nic)
    fd.append("phone", formData.phone)
    fd.append("address", formData.address)
    fd.append("province", formData.province)
    fd.append("district", formData.district)
    fd.append("gramaNiladhariDivision", formData.gnDivision)
    fd.append("localAuthority", formData.localAuthority)

    if (formData.nic_front) fd.append("nic_front", formData.nic_front)
    if (formData.nic_back) fd.append("nic_back", formData.nic_back)
    if (formData.birth_cert_front) fd.append("birth_cert_front", formData.birth_cert_front)
    if (formData.birth_cert_back) fd.append("birth_cert_back", formData.birth_cert_back)

    try {
      await axios.post("http://localhost:5000/api/voter/register-with-docs", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      router.push("/dashboard/citizen/profile")
    } catch (err: any) {
      console.error(err.response?.data)
    }
  }

  if (status === "loading") return <div>Loading...</div>

  return (
    <DashboardLayout userRole="citizen">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{hasVoter ? "Registration Completed" : "Voter Registration"}</CardTitle>
          <CardDescription>
            {hasVoter ? "You have already registered." : "Please complete your voter registration."}
          </CardDescription>
        </CardHeader>

        {hasVoter ? (
          <CardContent>
            <Button onClick={() => router.push("/dashboard/citizen/profile")}>
              Go to Profile
            </Button>
          </CardContent>
        ) : (
          <CardContent className="space-y-8">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>NIC Number</Label><Input value={formData.nic} onChange={e => handleChange("nic", e.target.value)} /></div>
                <div><Label>Phone</Label><Input value={formData.phone} onChange={e => handleChange("phone", e.target.value)} /></div>
              </div>
              <div><Label>Address</Label><Input value={formData.address} onChange={e => handleChange("address", e.target.value)} /></div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Province</Label>
                  <Select value={formData.province} onValueChange={v => handleChange("province", v)}>
                    <SelectTrigger><SelectValue placeholder="Select Province" /></SelectTrigger>
                    <SelectContent>
                      {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>District</Label>
                  <Select value={formData.district} onValueChange={v => handleChange("district", v)} disabled={!formData.province}>
                    <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                    <SelectContent>
                      {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Grama Niladhari Division</Label>
                  <Popover open={openGN} onOpenChange={setOpenGN}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {formData.gnDivision || "Search GN Division..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search GN Division..." />
                        <CommandEmpty>No GN Division found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {gnDivisions.map(gn => (
                            <CommandItem key={gn} onSelect={() => {
                              handleChange("gnDivision", gn)
                              setOpenGN(false)
                            }}>
                              <Check className={`mr-2 h-4 w-4 ${formData.gnDivision === gn ? "opacity-100" : "opacity-0"}`} />
                              {gn}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Local Authority (Municipal / Urban / Pradeshiya Sabha)</Label>
                  <Popover open={openLA} onOpenChange={setOpenLA}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between" disabled={loadingLA}>
                        {loadingLA ? "Loading..." : formData.localAuthority || "Search Local Authority..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search local authority..." />
                        <CommandEmpty>No authority found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                          {localAuthorities.map(la => (
                            <CommandItem key={la._id} onSelect={() => {
                              handleChange("localAuthority", la.name)
                              setOpenLA(false)
                            }}>
                              <Check className={`mr-2 h-4 w-4 ${formData.localAuthority === la.name ? "opacity-100" : "opacity-0"}`} />
                              <div>
                                <p className="font-medium">{la.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{la.type.replace("-", " ")}</p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload Documents</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>NIC Front</Label><Input type="file" accept="image/*,.pdf" onChange={e => handleChange("nic_front", e.target.files?.[0] || null)} /></div>
                <div><Label>NIC Back</Label><Input type="file" accept="image/*,.pdf" onChange={e => handleChange("nic_back", e.target.files?.[0] || null)} /></div>
                <div><Label>Birth Certificate Front</Label><Input type="file" accept="image/*,.pdf" onChange={e => handleChange("birth_cert_front", e.target.files?.[0] || null)} /></div>
                <div><Label>Birth Certificate Back</Label><Input type="file" accept="image/*,.pdf" onChange={e => handleChange("birth_cert_back", e.target.files?.[0] || null)} /></div>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleSubmit}>
              Submit Registration
            </Button>
          </CardContent>
        )}
      </Card>
    </DashboardLayout>
  )
}