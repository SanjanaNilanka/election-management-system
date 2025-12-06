"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Vote, Calendar, CheckCircle, AlertCircle, Clock, User } from 'lucide-react'
import { useSession } from "next-auth/react"
import Link from "next/link"
import axios from "axios"
import { format, formatDistanceToNow } from "date-fns"

export default function CitizenDashboard() {
  const { data: session, status } = useSession()
  const [voter, setVoter] = useState<any>(null)
  const [elections, setElections] = useState<any[]>([])
  const [votedElectionIds, setVotedElectionIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !session?.user?.id) return

      try {
        setIsLoading(true)
        const [voterRes, electionsRes] = await Promise.all([
          axios.get(`${API_BASE}/voter/user/${session.user.id}`).catch(() => null),
          axios.get(`${API_BASE}/elections`)
        ])

        // Voter status
        if (voterRes?.data) {
          setVoter(voterRes.data)
          const votedIds = voterRes.data.votes?.map((v: any) => v.election?._id || v.election) || []
          setVotedElectionIds(votedIds)
        }

        // Elections
        const allElections = Array.isArray(electionsRes.data) ? electionsRes.data : []
        setElections(allElections)
      } catch (err) {
        console.error("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session, status])

  // Find next active election
  const nextElection = elections
    .filter(e => e.status === 'active' && !votedElectionIds.includes(e._id))
    .sort((a, b) => new Date(a.end.date).getTime() - new Date(b.end.date).getTime())[0]

  const activeElectionsCount = elections.filter(e => 
    e.status === 'active' && !votedElectionIds.includes(e._id)
  ).length

  const stats = [
    {
      title: "Registration Status",
      value: voter ? (voter.status === 'approved' ? "Approved" : "Pending Approval") : "Not Registered",
      icon: CheckCircle,
      color: voter ? (voter.status === 'approved' ? "text-green-600" : "text-yellow-600") : "text-red-600",
      bgColor: voter ? (voter.status === 'approved' ? "bg-green-100" : "bg-yellow-100") : "bg-red-100"
    },
    {
      title: "Next Election",
      value: nextElection ? nextElection.title : "No active election",
      subtitle: nextElection ? formatDistanceToNow(new Date(nextElection.end.date), { addSuffix: true }) : "",
      icon: Calendar,
      color: nextElection ? "text-blue-600" : "text-gray-500",
      bgColor: nextElection ? "bg-blue-100" : "bg-gray-100"
    },
    {
      title: "Elections Voted",
      value: votedElectionIds.length.toString(),
      icon: Vote,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      title: "Active Elections",
      value: activeElectionsCount.toString(),
      subtitle: activeElectionsCount > 0 ? "You can vote now" : "No voting open",
      icon: Clock,
      color: activeElectionsCount > 0 ? "text-orange-600" : "text-gray-500",
      bgColor: activeElectionsCount > 0 ? "bg-orange-100" : "bg-gray-100"
    }
  ]

  if (status === "loading" || isLoading) {
    return (
      <DashboardLayout userRole="citizen">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="citizen">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {session?.user?.name || "Citizen"}!
          </h1>
          {voter ? (
            <p className="text-indigo-100">
              {voter.status === 'approved' 
                ? "You are fully registered and ready to vote in upcoming elections."
                : "Your registration is under review. Please wait for Grama Niladhari approval."}
            </p>
          ) : (
            <p className="text-indigo-100">
              You are not registered as a voter yet. 
              <Link href="/dashboard/citizen/register" className="underline ml-2">
                Register now
              </Link>
            </p>
          )}
        </div>

        {/* Stats Grid */}
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
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Elections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Vote className="h-5 w-5 text-indigo-600" />
              <span>Active Elections</span>
            </CardTitle>
            <CardDescription>
              Elections you can participate in right now
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeElectionsCount === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No active elections at the moment</p>
                <p className="text-sm mt-2">Check back later for upcoming elections</p>
              </div>
            ) : (
              <>
                {elections
                  .filter(e => e.status === 'active' && !votedElectionIds.includes(e._id))
                  .slice(0, 3)
                  .map(election => (
                    <div key={election._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{election.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Ends {format(new Date(election.end.date), "PPP 'at' p")}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{election.type}</Badge>
                          <Badge variant="outline" className="capitalize">{election.level}</Badge>
                        </div>
                      </div>
                      <Button asChild>
                        <Link href="/dashboard/citizen/voting">
                          {votedElectionIds.includes(election._id) ? "Already Voted" : "Vote Now"}
                        </Link>
                      </Button>
                    </div>
                  ))}
                {activeElectionsCount > 3 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/citizen/voting">
                      View All {activeElectionsCount} Elections
                    </Link>
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks at your fingertips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!voter ? (
                <Button className="h-20 flex flex-col" asChild>
                  <Link href="/dashboard/citizen/register">
                    <CheckCircle className="h-6 w-6 mb-2" />
                    <span>Register as Voter</span>
                  </Link>
                </Button>
              ) : voter.status !== 'approved' ? (
                <Button disabled className="h-20 flex flex-col opacity-60">
                  <Clock className="h-6 w-6 mb-2" />
                  <span>Waiting for Approval</span>
                </Button>
              ) : (
                <Button variant="outline" className="h-20 flex flex-col" asChild>
                  <Link href="/dashboard/citizen/voting">
                    <Vote className="h-6 w-6 mb-2 text-indigo-600" />
                    <span>Cast Your Vote</span>
                  </Link>
                </Button>
              )}

              <Button variant="outline" className="h-20 flex flex-col" asChild>
                <Link href="/dashboard/citizen/profile">
                  <User className="h-6 w-6 mb-2 text-green-600" />
                  <span>View Profile</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-20 flex flex-col" asChild>
                <Link href="/dashboard/citizen/support">
                  <AlertCircle className="h-6 w-6 mb-2 text-orange-600" />
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