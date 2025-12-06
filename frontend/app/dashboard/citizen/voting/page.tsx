"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Vote, Calendar, Clock, AlertCircle, CheckCircle, Trophy, Users } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { format, formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/react"

export default function CitizenVoting() {
  const [selectedElection, setSelectedElection] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [elections, setElections] = useState<any[]>([])
  const [voter, setVoter] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session, status } = useSession()

  const API_BASE = "http://localhost:5000/api"
  const userId = session?.user?.id

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !userId) return

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

  const hasVotedInElection = (election: any) => {
    if (!voter || !election.votes) return false
    return election.votes.some((v: any) => v.voter?.toString() === voter._id.toString())
  }

  const getEligibleCandidates = (election: any) => {
    if (!voter || !election.candidates) return []

    const level = election.level
    return election.candidates.filter((c: any) => {
      const candidate = c.candidate
      if (!candidate) return false

      if (candidate.participatedFrom === 'national') return level === 'national'

      const region = candidate.regionName
      if (!region) return false

      if (level === 'district') return voter.district === region.name && region.type === 'district'
      if (level === 'provincial') return voter.province === region.name && region.type === 'province'
      if (level === 'local') return voter.localAuthority === region.name && ['municipal', 'urban', 'pradeshiya-sabha'].includes(region.type)

      return false
    })
  }

  const handleVote = async () => {
    if (!selectedCandidate || !selectedElection) {
      toast({ variant: "destructive", description: "Please select a candidate" })
      return
    }

    try {
      const response = await fetch(`${API_BASE}/votes/${selectedElection}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: voter._id, candidateId: selectedCandidate }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to cast vote")
      }

      toast({ description: "Your vote has been recorded successfully!" })
      setSelectedCandidate(null)
      setSelectedElection(null)
      const updated = await fetch(`${API_BASE}/elections`).then(r => r.json())
      setElections(Array.isArray(updated) ? updated : [])
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  const canVoteInElection = (election: any) => {
    return election.status === 'active' && 
           !hasVotedInElection(election) && 
           voter?.status === 'approved' &&
           getEligibleCandidates(election).length > 0
  }

  const getTimeRemaining = (endDate: string | Date, endTime: string) => {
    try {
      const dateObj = typeof endDate === 'string' ? new Date(endDate) : endDate
      const dateStr = dateObj.toISOString().split('T')[0]
      const endDateTime = new Date(`${dateStr}T${endTime}`)
      return formatDistanceToNow(endDateTime, { addSuffix: true })
    } catch {
      return "Time unavailable"
    }
  }

  if (status === "loading" || isLoading) return <div className="p-10 text-center">Loading...</div>

  return (
    <DashboardLayout userRole="citizen">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cast Your Vote</h1>
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
            <AlertDescription>Your registration is pending approval.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Elections List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Elections</h2>
            {elections.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-gray-500">No elections available</CardContent></Card>
            ) : (
              elections.map(election => {
                const alreadyVoted = hasVotedInElection(election)
                const hasCandidates = getEligibleCandidates(election).length > 0

                return (
                  <Card
                    key={election._id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedElection === election._id ? 'ring-2 ring-indigo-500' : ''
                    } ${election.status === 'pending' || (!hasCandidates && !alreadyVoted) ? 'opacity-75' : ''}`}
                    onClick={() => setSelectedElection(election._id)} // Always clickable
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{election.title}</CardTitle>
                          <CardDescription className="mt-1">{election.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant={election.status === 'active' ? 'default' : 'secondary'}>
                            {election.status}
                          </Badge>
                          <Badge variant="outline" className="mt-2 block capitalize">
                            {election.level}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(election.start.date), "PP")}</span>
                        </div>
                        {election.status === 'active' && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <Clock className="h-4 w-4" />
                            <span>{getTimeRemaining(election.end.date, election.end.time)}</span>
                          </div>
                        )}
                      </div>

                      {/* Show status messages */}
                      {alreadyVoted && (
                        <div className="mt-3 text-green-600 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">You have voted</span>
                        </div>
                      )}
                      {!hasCandidates && !alreadyVoted && election.status !== 'pending' && (
                        <div className="mt-3 text-orange-600 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-medium">No candidates in your area</span>
                        </div>
                      )}
                      {election.status === 'pending' && (
                        <div className="mt-3 text-blue-600 flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">Election not started</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Right Panel */}
          <div>
            {selectedElection ? (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {elections.find(e => e._id === selectedElection)?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const election = elections.find(e => e._id === selectedElection)
                    if (!election) return null

                    const alreadyVoted = hasVotedInElection(election)
                    const eligibleCandidates = getEligibleCandidates(election)

                    // 1. Already voted + active
                    if (alreadyVoted && election.status === 'active') {
                      return (
                        <div className="text-center py-16 space-y-6">
                          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-16 w-16 text-green-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-green-800">Thank You!</h3>
                          <p className="text-lg text-gray-700">You have already cast your vote</p>
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl p-8">
                            <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-600">Results will be available after voting ends</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {getTimeRemaining(election.end.date, election.end.time)}
                            </p>
                          </div>
                        </div>
                      )
                    }

                    // 2. Election closed → show results
                    if (election.status === 'closed') {
                      const totalVotes = election.votes?.length || 0
                      const results = election.candidates
                        .map((c: any) => ({
                          candidate: c.candidate,
                          party: c.party,
                          votes: c.votes || 0,
                          percentage: totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0
                        }))
                        .sort((a: any, b: any) => b.votes - a.votes)

                      const winner = results[0]

                      return (
                        <div className="space-y-8">
                          {winner && (
                            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-400 border-2">
                              <CardContent className="py-8 text-center">
                                <Trophy className="h-20 w-20 text-yellow-600 mx-auto mb-4" />
                                <h3 className="text-3xl font-bold text-yellow-800">Winner!</h3>
                                <p className="text-2xl font-bold mt-4">{winner.candidate.name}</p>
                                <p className="text-xl text-yellow-700">{winner.party.name}</p>
                                <p className="text-4xl font-bold text-yellow-600 mt-6">
                                  {winner.votes.toLocaleString()} votes ({winner.percentage.toFixed(1)}%)
                                </p>
                              </CardContent>
                            </Card>
                          )}

                          <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              <Users className="h-6 w-6" />
                              Final Results
                            </h3>
                            {results.map((r: any, i: number) => (
                              <div key={r.candidate._id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-gray-400">#{i + 1}</span>
                                    <div>
                                      <p className="font-semibold">{r.candidate.name}</p>
                                      <p className="text-sm text-gray-600">{r.party.name}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">{r.votes.toLocaleString()}</p>
                                    <p className="text-sm text-gray-600">{r.percentage.toFixed(1)}%</p>
                                  </div>
                                </div>
                                <Progress value={r.percentage} className="h-8" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }

                    // 3. Can vote
                    if (canVoteInElection(election)) {
                      return (
                        <div className="space-y-6">
                          <div className="bg-indigo-50 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold">{election.title}</h3>
                            <p className="text-indigo-700 mt-2">{election.description}</p>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-lg">Select Your Candidate</h4>
                            {eligibleCandidates.map((c: any) => (
                              <div
                                key={c.candidate._id}
                                className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${selectedCandidate === c.candidate._id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-400'}`}
                                onClick={() => setSelectedCandidate(c.candidate._id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="text-lg font-semibold">{c.candidate.name}</h5>
                                    <p className="text-gray-600">{c.party.name}</p>
                                    {c.candidate.regionName && (
                                      <p className="text-sm text-gray-500 mt-1">From: {c.candidate.regionName.name}</p>
                                    )}
                                  </div>
                                  {selectedCandidate === c.candidate._id && (
                                    <CheckCircle className="h-8 w-8 text-indigo-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={handleVote}
                            disabled={!selectedCandidate}
                            className="w-full text-lg py-6"
                            size="lg"
                          >
                            <Vote className="h-6 w-6 mr-3" />
                            Confirm & Cast Vote
                          </Button>
                        </div>
                      )
                    }

                    // 4. DEFAULT: No candidates / pending / already voted
                    return (
                      <div className="text-center py-16 space-y-6">
                        <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800">
                          {alreadyVoted 
                            ? "You have already voted in this election"
                            : election.status === 'pending'
                            ? "Election has not started yet"
                            : "No candidates available in your area"}
                        </h3>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                          {alreadyVoted 
                            ? "Thank you for participating!"
                            : election.status === 'pending'
                            ? "Candidates will appear when the election is activated."
                            : "This election is for a different district, province, or local authority than yours."}
                        </p>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <Vote className="h-20 w-20 text-gray-300 mb-6 desap" />
                  <h3 className="text-2xl font-semibold text-gray-700">Select an Election</h3>
                  <p className="text-gray-500 mt-3 max-w-md">
                    Choose from the list on the left to view details and cast your vote
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}