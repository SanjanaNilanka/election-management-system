"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Vote, User, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useSession } from "next-auth/react"
import Link from "next/link"
import axios from "axios"

export default function CitizenDashboard() {
  const { data: session, status } = useSession()

  const [hasVoter, setHasVoter] = useState(false)
  const [approvedVoter, setApprovedVoter] = useState(false)
  const [regStatus, setRegStatus] = useState("")

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      axios
        .get(`http://localhost:5000/api/voter/user/${session.user.id}`)
        .then((res) => {
          const voter = res.data;
          setApprovedVoter(voter.approved);
          if (voter.approved) {
            setRegStatus("Approved");
          } else {
            setRegStatus("Pending");
          }
          setHasVoter(true);
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            
            setHasVoter(false);
          }
        });
    }
  }, [session, status])
  

  const stats = [
    {
      title: "Registration Status",
      value: hasVoter ? regStatus : "Not Registered",
      icon: CheckCircle,
      color: hasVoter ? (approvedVoter ? "text-green-600" : "text-yellow-600") : "text-red-600",
      bgColor: hasVoter ? (approvedVoter ? "bg-green-100" : "bg-yellow-100") : "bg-red-100"
    },
    {
      title: "Next Election",
      value: "N/A",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Elections Voted",
      value: "N/A",
      icon: Vote,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      title: "Pending Actions",
      value: "N/A",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ]

  const upcomingElections = [
    {
      title: "N/A",
      date: "2025-07-15",
      status: "Registration Open",
      canVote: true
    },
    {
      title: "N/A",
      date: "2025-04-20",
      status: "Upcoming",
      canVote: true
    }
  ]

  const recentActivity = [
    {
      action: "N/A",
      date: "2025-08-15",
      type: "success"
    },
    {
      action: "N/A",
      date: "2025-08-10",
      type: "info"
    },
    {
      action: "N/A",
      date: "2025-08-05",
      type: "success"
    }
  ]

  return (
    <DashboardLayout userRole="citizen">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {session && session.user ? session.user.name : "Citizen"}
          </h1>
          {hasVoter ? (
            <p className="text-indigo-100">
              Your voter registration is {approvedVoter ? "approved. You can participate in upcoming elections." : "pending approval. Wait untill Grama Niladari approve the request"}.
            </p>
          ) : (
            <p className="text-indigo-100">
              You have not registered as a voter yet. Please complete your voter registration.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Vote className="h-5 w-5 text-indigo-600" />
                <span>Upcoming Elections</span>
              </CardTitle>
              <CardDescription>
                Elections you can participate in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingElections.map((election, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{election.title}</h4>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(election.date).toLocaleDateString()}
                    </p>
                    <Badge 
                      variant={election.status === 'Registration Open' ? 'default' : 'default'}
                      className="mt-2"
                    >
                      {election.status}
                    </Badge>
                  </div>
                  {election.canVote && (
                    <Button size="sm" asChild>
                      <Link href="/dashboard/citizen/voting">
                        Vote Now
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/citizen/voting">
                  View All Elections
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Your recent actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${
                    activity.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <div className={`h-2 w-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/citizen/notifications">
                  View All Notifications
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/dashboard/citizen/profile">
                  <User className="h-6 w-6" />
                  <span>Update Profile</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/dashboard/citizen/voting">
                  <Vote className="h-6 w-6" />
                  <span>Cast Vote</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/dashboard/citizen/support">
                  <AlertCircle className="h-6 w-6" />
                  <span>Get Help</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 
