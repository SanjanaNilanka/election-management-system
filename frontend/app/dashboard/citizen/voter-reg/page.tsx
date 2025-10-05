"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Vote, User, Mail, Lock, Phone, MapPin, IdCard } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VoterRegister() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasVoter, setHasVoter] = useState(false)

  const [formData, setFormData] = useState({
    nic: "",
    phone: "",
    address: "",
    district: "",
    gnDivision: "",
    nic_front: null,
    nic_back: null,
    birth_cert_front: null,
    birth_cert_back: null,
  });

  const districts = [
    "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
    "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
    "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
    "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
    "Moneragala", "Ratnapura", "Kegalle"
  ]

  useEffect(() => {
      if (status === "authenticated" && session?.user?.id) {
        axios
          .get(`http://localhost:5000/api/voter/user/${session.user.id}`)
          .then((res) => {
            const voter = res.data;
            
            setHasVoter(true);
          })
          .catch((err) => {
            if (err.response?.status === 404) {
              
              setHasVoter(false);
            }
          });
      }
    }, [session, status])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("userId", session?.user?.id || "");
    fd.append("nic", formData.nic);
    fd.append("phone", formData.phone);
    fd.append("address", formData.address);
    fd.append("district", formData.district);
    fd.append("gramaNiladhariDivision", formData.gnDivision);
    if (formData.nic_front) fd.append("nic_front", formData.nic_front);
    if (formData.nic_back) fd.append("nic_back", formData.nic_back);
    if (formData.birth_cert_front) fd.append("birth_cert_front", formData.birth_cert_front);
    if (formData.birth_cert_back) fd.append("birth_cert_back", formData.birth_cert_back);
    console.log("Submitting voter registration with data:", formData);
    try {
      await axios.post("http://localhost:5000/api/voter/register-with-docs", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      router.push("/dashboard/citizen/profile");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout userRole="citizen">
      {hasVoter ? (
<div></div>
      ):(
        <div></div>
      )}
      <Card>
        {!hasVoter &&(
          <CardHeader>
            <CardTitle>Voter Registration</CardTitle>
            <CardDescription>
              Please fill out the form below to register as a voter.
            </CardDescription>
          </CardHeader>
        )}
        {hasVoter &&(
          <CardHeader>
            <CardTitle>Voter Registration is Completed</CardTitle>
            <CardDescription>
              You have already registered as a voter.
            </CardDescription>
          </CardHeader>
        )}
        {hasVoter ? (
          <CardContent className="space-y-4">
            <Button onClick={() => router.push("/dashboard/citizen/profile")}>Go to Profile</Button>
          </CardContent>
        ):(
          <CardContent className="space-y-4 border-t">
            <h3 className="text-lg font-medium text-gray-900 pt-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NIC */}
              <div className="space-y-2">
                <Label htmlFor="nic">NIC</Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="nic"
                    placeholder="Enter your NIC"
                    value={formData.nic}
                    onChange={(e) => handleChange("nic", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="address">Residential Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="Enter your full address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Select onValueChange={(value) => handleChange("district", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gnDivision">Grama Niladhari Division</Label>
                  <Input
                    id="gnDivision"
                    placeholder="Enter your GN Division"
                    value={formData.gnDivision}
                    onChange={(e) => handleChange("gnDivision", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Uploads */}
                <div>
                  <Label>NIC Front</Label>
                  <Input type="file" accept="image/*,application/pdf"
                    onChange={(e) => handleChange("nic_front", e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>NIC Back</Label>
                  <Input type="file" accept="image/*,application/pdf"
                    onChange={(e) => handleChange("nic_back", e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>Birth Certificate Front</Label>
                  <Input type="file" accept="image/*,application/pdf"
                    onChange={(e) => handleChange("birth_cert_front", e.target.files?.[0] || null)} />
                </div>
                <div>
                  <Label>Birth Certificate Back</Label>
                  <Input type="file" accept="image/*,application/pdf"
                    onChange={(e) => handleChange("birth_cert_back", e.target.files?.[0] || null)} />
                </div>
              </div>
            </div>

            

            <Button onClick={handleSubmit}>Submit Registration</Button>
          </CardContent>
        )}
        
      </Card>
    </DashboardLayout>
  );
}
