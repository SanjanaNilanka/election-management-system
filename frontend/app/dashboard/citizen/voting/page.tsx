"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Vote, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { useSession } from "next-auth/react"

export default function CitizenVoting() {
  const [selectedElection, setSelectedElection] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState<string[]>([])
  const [elections, setElections] = useState<any[]>([])
  const [voter, setVoter] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()

  const API_BASE = "http://localhost:5000/api"
  const userId = session?.user?.id

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const [voterRes, electionsRes] = await Promise.all([
          fetch(`${API_BASE}/voter/user/${userId}`).then(r => r.json()),
          fetch(`${API_BASE}/elections`).then(r => r.json()),
        ])

        if (voterRes.message === 'Voter not found for this user.') {
          setVoter(null)
        } else {
          setVoter(voterRes)
          const votedElections = voterRes.votes?.map((v: any) => v.election?._id || v.election) || []
          setHasVoted(votedElections)
        }

        setElections(Array.isArray(electionsRes) ? electionsRes : [])
      } catch (error) {
        toast({ variant: "destructive", description: "Failed to load data." })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [userId, status])

  // Filter candidates based on election level and voter's location
  const getEligibleCandidates = (election: any) => {
    if (!voter || !election.candidates) return []

    const level = election.level

    return election.candidates.filter((c: any) => {
      const candidate = c.candidate
      if (!candidate || candidate.participatedFrom === 'national') {
        return level === 'national'
      }

      const region = candidate.regionName
      if (!region) return false

      if (level === 'district') {
        return voter.district === region.name && region.type === 'district'
      }
      if (level === 'provincial') {
        return voter.province === region.name && region.type === 'province'
      }
      if (level === 'local') {
        return voter.localAuthority === region.name && 
               ['municipal', 'urban', 'pradeshiya-sabha'].includes(region.type)
      }

      return false
    })
  }

  const handleVote = async () => {
    if (!selectedCandidate || !selectedElection) {
      toast({ variant: "destructive", description: "Please select a candidate" })
      return
    }

    if (!voter || voter.status !== 'approved') {
      toast({ variant: "destructive", description: "You are not approved to vote" })
      return
    }

    try {
      const response = await fetch(`${API_BASE}/elections/${selectedElection}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId: voter._id,
          candidateId: selectedCandidate,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to cast vote")
      }

      setHasVoted(prev => [...prev, selectedElection])
      setSelectedCandidate(null)
      toast({ description: "Your vote has been recorded successfully!" })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  const getTimeRemaining = (endDate: string, endTime: string) => {
    const end = new Date(`${endDate.split('T')[0]}T${endTime}`)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    if (diff <= 0) return "Voting ended"
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m left`
  }

  const canVoteInElection = (election: any) => {
    return election.status === 'active' && 
           !hasVoted.includes(election._id) && 
           voter?.status === 'approved'
  }

  if (status === "loading") return <div>Loading...</div>

  return (
    <DashboardLayout userRole="citizen">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cast Your Vote</h1>
          <p className="text-gray-600">Participate in active elections</p>
        </div>

        {!voter && status === "authenticated" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>You must register as a voter first.</AlertDescription>
          </Alert>
        )}

        {voter && voter.status !== 'approved' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Your registration is {voter.status}. Wait for approval.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Elections List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Active Elections</h2>
            {elections.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-gray-500">No elections available</CardContent></Card>
            ) : (
              elections.map(election => {
                const eligibleCandidates = getEligibleCandidates(election)
                const canVote = canVoteInElection(election) && eligibleCandidates.length > 0

                return (
                  <Card
                    key={election._id}
                    className={`cursor-pointer transition-all ${selectedElection === election._id ? 'ring-2 ring-indigo-500' : ''} ${!canVote ? 'opacity-60' : ''}`}
                    onClick={() => canVote && setSelectedElection(election._id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{election.title}</CardTitle>
                        <div className="text-right">
                          <Badge variant={election.status === 'active' ? 'default' : 'secondary'}>
                            {election.status}
                          </Badge>
                          <Badge variant="outline" className="mt-1 block">
                            {election.level} • {election.type}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>{election.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(election.start.date), "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-orange-600">
                          <Clock className="h-4 w-4" />
                          <span>{getTimeRemaining(election.end.date, election.end.time)}</span>
                        </div>
                        {!canVote && (
                          <div className="text-red-600 text-xs mt-2">
                            {hasVoted.includes(election._id) ? "Already voted" : "No eligible candidates in your area"}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Voting Panel */}
          <div>
            {selectedElection ? (
              <Card>
                <CardHeader>
                  <CardTitle>Cast Your Vote</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const election = elections.find(e => e._id === selectedElection)
                    if (!election) return null

                    const eligibleCandidates = getEligibleCandidates(election)

                    return (
                      <div className="space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h3 className="font-semibold">{election.title}</h3>
                          <p className="text-sm text-indigo-700">{election.description}</p>
                          <p className="text-xs mt-2">Level: <strong className="capitalize">{election.level}</strong></p>
                        </div>

                        {eligibleCandidates.length === 0 ? (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>No candidates available for your location.</AlertDescription>
                          </Alert>
                        ) : (
                          <>
                            <div className="space-y-3">
                              <h4 className="font-medium">Choose Your Candidate:</h4>
                              {eligibleCandidates.map((c: any) => (
                                <div
                                  key={c.candidate._id}
                                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedCandidate === c.candidate._id ? 'border-indigo-500 bg-indigo-50' : 'hover:border-gray-400'}`}
                                  onClick={() => setSelectedCandidate(c.candidate._id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-semibold">{c.candidate.name}</h5>
                                      <p className="text-sm text-gray-600">{c.party.name}</p>
                                      {c.candidate.regionName && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          From: {c.candidate.regionName.name}
                                        </p>
                                      )}
                                    </div>
                                    {selectedCandidate === c.candidate._id && <CheckCircle className="h-6 w-6 text-indigo-600" />}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <Button
                              onClick={handleVote}
                              disabled={!selectedCandidate}
                              className="w-full"
                              size="lg"
                            >
                              <Vote className="h-5 w-5 mr-2" />
                              Confirm Vote
                            </Button>
                          </>
                        )}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Vote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Select an election to vote</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}