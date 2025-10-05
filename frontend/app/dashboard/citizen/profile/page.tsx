"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { User, Mail, Phone, MapPin, FileText, Edit, Save, X } from 'lucide-react'
import axios from "axios"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogOverlay,
} from "@/components/ui/dialog"

export default function CitizenProfile() {
  const { data: session, status } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [hasVoter, setHasVoter] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    nic: "",
    address: "",
    district: "",
    gnDivision: "",
    status: "",
    voterNumber: null,
    nicFrontPath: "",
    nicBackPath: "",
    birthCertFrontPath: "",
    birthCertBackPath: "",
    nicApproval: '',
    birthCertificateApproval: '',
    addressApproval: '',
    createdAt: new Date(),
  })
  const [voterId, setVoterId] = useState("")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null)
  const [currentImageTitle, setCurrentImageTitle] = useState("")

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      axios
        .get(`http://localhost:5000/api/voter/user/${session.user.id}`)
        .then((res) => {
          const voter = res.data;
          setProfileData({
            name: session.user.name || "",
            email: session.user.email || "",
            nic: voter.nic || "",
            phone: voter.phone || "",
            address: voter.address || "",
            district: voter.district || "",
            gnDivision: voter.gramaNiladhariDivision || "",
            status: voter.status || "",
            voterNumber: voter.voterNumber || "",
            nicFrontPath: voter.nicFrontPath || "",
            nicBackPath: voter.nicBackPath || "",
            birthCertFrontPath: voter.birthCertFrontPath || "",
            birthCertBackPath: voter.birthCertBackPath || "",
            nicApproval: voter.nicApproval || '',
            birthCertificateApproval: voter.birthCertificateApproval || '',
            addressApproval: voter.addressApproval || '',
            createdAt: voter.createdAt || new Date(),
          });
          setVoterId(voter._id);
          setHasVoter(true);
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            // No voter found
            setProfileData({
              name: session.user.name || "",
              email: session.user.email || "",
              nic: "",
              phone: "",
              address: "",
              district: "",
              gnDivision: "",
              status: "",
              voterNumber: null,
              nicFrontPath: "",
              nicBackPath: "",
              birthCertFrontPath: "",
              birthCertBackPath: "",
              nicApproval: '',
              birthCertificateApproval: '',
              addressApproval: '',
              createdAt: new Date(),
            });
            setHasVoter(false);
          }
        });
    }
  }, [status, session]);

  const openImageDialog = (imagePath: string | null, title: string | "") => {
    if (!imagePath) return;
    setCurrentImagePath(imagePath)
    setCurrentImageTitle(title)
    setOpen(true)
  }

  const handleSave = () => {
    if (!hasVoter) return;
    axios
      .put(`http://localhost:5000/api/voter/${voterId}`, {
        phone: profileData.phone,
        address: profileData.status !== "approved" ? profileData.address : undefined,
        district: profileData.status !== "approved" ? profileData.district : undefined,
        gramaNiladhariDivision: profileData.status !== "approved" ? profileData.gnDivision : undefined
      })
      .then(() => setIsEditing(false));
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  // const handleSave = () => {
  //   // Here you would typically save to the database
  //   setIsEditing(false)
  //   // Show success message
  // }

  const documents = [
    { name: "National Identity Card", status: "Verified", uploadedAt: "2024-01-15" },
    { name: "Address Proof", status: "Verified", uploadedAt: "2024-01-15" },
    { name: "Birth Certificate", status: "Pending", uploadedAt: "2024-01-20" }
  ]

  return (
    <DashboardLayout userRole="citizen">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentImageTitle}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-[400px] flex justify-center items-center">
            {currentImagePath ? (
              <img
                src={`http://localhost:5000/${currentImagePath}`}
                alt="Document Image"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <p>No image available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and documents</p>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Your basic information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profileData.name} disabled className="bg-gray-50" />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={profileData.email} disabled className="bg-gray-50" />
                </div>

                {/* Only show voter details if voter exists */}
                {hasVoter ? (
                  <>
                    {/* NIC */}
                    <div className="space-y-2">
                      <Label htmlFor="nic">NIC Number</Label>
                      <Input id="nic" value={profileData.nic} disabled className="bg-gray-50" />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address">Residential Address</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        disabled={!isEditing || profileData.status === "approved"}
                      />
                    </div>

                    {/* District */}
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        value={profileData.district}
                        onChange={(e) => handleInputChange("district", e.target.value)}
                        disabled={!isEditing || profileData.status === "approved"}
                      />
                    </div>

                    {/* GN Division */}
                    <div className="space-y-2">
                      <Label htmlFor="gnDivision">Grama Niladhari Division</Label>
                      <Input
                        id="gnDivision"
                        value={profileData.gnDivision}
                        onChange={(e) => handleInputChange("gnDivision", e.target.value)}
                        disabled={!isEditing || profileData.status === "approved"}
                      />
                    </div>
                  </>
                ) : (
                  <Button onClick={() => router.push("/dashboard/citizen/voter-reg")} className="mt-4">
                    Register as Voter
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
                <CardDescription>
                  Your voter registration information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge 
                    variant="default" 
                    className={
                      profileData.status.toLowerCase() === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : profileData.status.toLowerCase() === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {hasVoter ? 
                      (profileData.status.charAt(0).toUpperCase() + profileData.status.slice(1).toLowerCase())
                      : 
                      "Not Registered"
                    }
                  </Badge>
                </div>
                {profileData.status == "approved"? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Voter Number</span>
                    <span className="text-sm text-gray-600">{profileData.voterNumber || "N/A"}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Voter Number</span>
                    <span className="text-sm text-gray-600">N/A</span>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    {hasVoter ?
                      profileData.status == "approved" ?
                      `Your registration is approved on ${new Date(profileData.createdAt).toLocaleDateString()}. You can now participate in all eligible elections.`
                      :
                      `Your registration is pending approval. Wait until Grama Niladhari approves the request.`
                      :
                      "You have not registered as a voter yet. Please complete your voter registration."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <span>Documents</span>
                </CardTitle>
                {hasVoter? (
                <CardDescription>
                  Your uploaded verification documents
                </CardDescription>
                ):(
                <CardDescription>
                  Register as a voter to upload documents
                </CardDescription>
                )}
              </CardHeader>
              {hasVoter? (
              <CardContent className="space-y-3">
                <div
                  onClick={() => openImageDialog(profileData.nicFrontPath, "NIC Front")}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">NIC Front</p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {profileData.nicBackPath ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <Badge
                    className={
                      profileData.nicApproval.toLowerCase() === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : profileData.nicApproval.toLowerCase() === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {profileData.nicApproval.charAt(0).toUpperCase() +
                      profileData.nicApproval.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div
                  onClick={() => openImageDialog(profileData.nicBackPath, "NIC Back")}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">NIC Back</p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {profileData.nicBackPath ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <Badge
                    className={
                      profileData.nicApproval.toLowerCase() === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : profileData.nicApproval.toLowerCase() === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {profileData.nicApproval.charAt(0).toUpperCase() +
                      profileData.nicApproval.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div
                  onClick={() => openImageDialog(profileData.birthCertFrontPath, "Birth Certificate Front")}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Birth Certificate Front</p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {profileData.nicBackPath ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <Badge
                    className={
                      profileData.birthCertificateApproval.toLowerCase() === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : profileData.birthCertificateApproval.toLowerCase() === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {profileData.birthCertificateApproval.charAt(0).toUpperCase() +
                      profileData.birthCertificateApproval.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <div
                  onClick={() => openImageDialog(profileData.birthCertBackPath, "Birth Certificate Back")}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Birth Certificate Back</p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {profileData.nicBackPath ? new Date(profileData.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <Badge
                    className={
                      profileData.birthCertificateApproval.toLowerCase() === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : profileData.birthCertificateApproval.toLowerCase() === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {profileData.birthCertificateApproval.charAt(0).toUpperCase() +
                      profileData.birthCertificateApproval.slice(1).toLowerCase()}
                  </Badge>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
              </CardContent>
              ):(
                <CardContent className="pr-6 text-left text-gray-500">
                  <div className="pt-4 border-t">
                    <p className="text-sm">No documents uploaded yet. Please register as a voter to upload your documents.</p>
                  </div>
                  
                </CardContent>
              )}
              {/* <CardContent className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={doc.status === 'Verified' ? 'default' : 'secondary'}
                      className={doc.status === 'Verified' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
              </CardContent> */}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
