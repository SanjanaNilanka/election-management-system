// app/dashboard/citizen/support/page.tsx
"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  Shield, 
  FileText,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  Building
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import axios from "axios"

export default function CitizenSupport() {
  const { data: session, status } = useSession()
  const [voter, setVoter] = useState<any>(null)
  const [gnOfficer, setGNOfficer] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !session?.user?.id) return

      try {
        setLoading(true)
        const voterRes = await axios.get(`${API_BASE}/voter/user/${session.user.id}`)
        const voterData = voterRes.data
        setVoter(voterData)

        if (voterData?.gramaNiladhariDivision) {
          const gnRes = await axios.get(
            `${API_BASE}/gns/division/${encodeURIComponent(voterData.gramaNiladhariDivision)}`
          )
          setGNOfficer(gnRes.data)
        }
      } catch (err: any) {
        console.error("Failed to load support info:", err.response?.data || err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status])

  const user = session?.user

  return (
    <DashboardLayout userRole="citizen">
      <div className="space-y-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <HelpCircle className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">Help & Support Center</h1>
              <p className="text-blue-100 mt-2">
                We're here to help you with voter registration, voting, and account issues
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">Loading your information...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Account Details
              </CardTitle>
              <CardDescription>
                This information helps us assist you faster
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{user?.name || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium">{user?.email || "Not provided"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">User Role</p>
                      <Badge variant="secondary" className="mt-1">Citizen</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <Badge className="mt-1">{user ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-800">
              <Building className="h-6 w-6" />
              Your Grama Niladhari Officer
            </CardTitle>
            <CardDescription className="text-green-700">
              Contact your assigned officer for document verification and support
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading officer details...</p>
            ) : gnOfficer ? (
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-200 border-2 border-dashed border-green-400 rounded-full w-20 h-20 flex items-center justify-center">
                    <User className="h-10 w-10 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900">
                      {gnOfficer.user?.name || "Grama Niladhari"}
                    </h3>
                    <p className="text-green-700 font-medium">{gnOfficer.gnDivision}</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      {gnOfficer.user?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{gnOfficer.user.phone}</span>
                        </div>
                      )}
                      {gnOfficer.user?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{gnOfficer.user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 mb-2">Office Hours</p>
                  <p className="font-medium">Mon–Fri: 8:30 AM – 4:30 PM</p>
                  <p className="text-sm text-green-600 mt-2">Saturday: 9:00 AM – 12:00 PM</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-orange-700">
                <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                <p>No Grama Niladhari assigned yet</p>
                <p className="text-sm mt-2">This usually means your registration is still pending</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Support */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                Contact Support Team
              </CardTitle>
              <CardDescription>
                Get help from our dedicated support officers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Hotline (24/7)</p>
                    <p className="text-lg">011-234-5678</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-lg">support@elections.gov.lk</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Average Response Time</p>
                    <p className="text-lg">Within 2 hours</p>
                  </div>
                </div>
              </div>
              <Button className="w-full" size="lg">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-indigo-600" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Quick answers to common voter concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  q: "How long does voter registration approval take?",
                  a: "Usually 3–7 working days. Your Grama Niladhari will review your documents."
                },
                {
                  q: "I lost my voter ID. What should I do?",
                  a: "Contact your Grama Niladhari office with your NIC. A duplicate can be issued."
                },
                {
                  q: "Can I change my voting division?",
                  a: "Yes, but only by submitting a transfer request with proof of residence."
                },
                {
                  q: "Why can't I vote in an election?",
                  a: "Check: 1) Registration approved? 2) Election active? 3) Already voted?"
                },
                {
                  q: "Is my vote really secret?",
                  a: "Yes. Your vote is encrypted and cannot be traced back to you."
                }
              ].map((item, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-200 hover:text-indigo-600 transition">
                    <span className="font-medium">{item.q}</span>
                    <AlertCircle className="h-5 w-5 text-gray-400 group-open:rotate-180 transition" />
                  </summary>
                  <p className="text-gray-600 mt-3 pb-4 pl-1">{item.a}</p>
                </details>
              ))}
            </div>
            {/* <div className="mt-6 pt-6 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/faq">
                  View All FAQs
                </Link>
              </Button>
            </div> */}
          </CardContent>
        </Card>
        </div>

        {/* Common Help Topics */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-indigo-600" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Quick answers to common voter concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  q: "How long does voter registration approval take?",
                  a: "Usually 3–7 working days. Your Grama Niladhari will review your documents."
                },
                {
                  q: "I lost my voter ID. What should I do?",
                  a: "Contact your Grama Niladhari office with your NIC. A duplicate can be issued."
                },
                {
                  q: "Can I change my voting division?",
                  a: "Yes, but only by submitting a transfer request with proof of residence."
                },
                {
                  q: "Why can't I vote in an election?",
                  a: "Check: 1) Registration approved? 2) Election active? 3) Already voted?"
                },
                {
                  q: "Is my vote really secret?",
                  a: "Yes. Your vote is encrypted and cannot be traced back to you."
                }
              ].map((item, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-3 border-b border-gray-200 hover:text-indigo-600 transition">
                    <span className="font-medium">{item.q}</span>
                    <AlertCircle className="h-5 w-5 text-gray-400 group-open:rotate-180 transition" />
                  </summary>
                  <p className="text-gray-600 mt-3 pb-4 pl-1">{item.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/faq">
                  View All FAQs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card> */}

        {/* Emergency Notice */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-red-600 mt-1" />
              <div>
                <h3 className="font-bold text-red-800">Need Urgent Help?</h3>
                <p className="text-red-700 mt-2">
                  If you suspect fraud, identity theft, or system issues during voting, 
                  call the <strong>National Election Complaint Hotline</strong>:
                </p>
                <p className="text-2xl font-bold text-red-600 mt-3">1988</p>
                <p className="text-sm text-red-600 mt-1">Available 24/7 during election periods</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}