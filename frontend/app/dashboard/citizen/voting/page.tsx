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
  const userId = session?.user.id

  // Fetch voter status and elections
  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const [voterRes, electionsRes] = await Promise.all([
          fetch(`${API_BASE}/voter/user/${userId}`).then((r) => r.json()),
          fetch(`${API_BASE}/elections`).then((r) => r.json()),
        ])

        if (voterRes.message === 'Voter not found for this user.') {
          setVoter(null)
        } else if (!voterRes.status) {
          setVoter({ ...voterRes, status: 'unknown' }) // Fallback for missing status
        } else {
          setVoter(voterRes)
          const votedElections = voterRes.votes?.map((vote: any) => vote.election) || []
          setHasVoted(votedElections)
        }

        setElections(Array.isArray(electionsRes) ? electionsRes : [])
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [userId, status])

  const handleVote = async () => {
    if (!selectedCandidate || !selectedElection) {
      toast({ variant: "destructive", description: "Please select an election and candidate" })
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

      setHasVoted((prev) => [...prev, selectedElection])
      setSelectedCandidate(null)
      setSelectedElection(null)
      toast({
        description: "Your vote has been successfully recorded. Thank you for participating!",
      })
    } catch (error: any) {
      toast({ variant: "destructive", description: error.message })
    }
  }

  const getTimeRemaining = (endTime: string) => {
    const now = new Date().getTime()
    const end = new Date(endTime).getTime()
    const timeLeft = end - now

    if (timeLeft <= 0) return "Voting ended"

    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m remaining`
  }

  const canVoteInElection = (election: any) => {
    return (
      election.status === 'active' &&
      !hasVoted.includes(election._id) &&
      voter?.status === 'approved'
    )
  }

  return (
    <DashboardLayout userRole="citizen">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vote</h1>
          <p className="text-gray-600">Cast your vote in active elections</p>
        </div>

        {status === "loading" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Loading authentication status...</AlertDescription>
          </Alert>
        )}

        {status === "unauthenticated" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please log in to vote.</AlertDescription>
          </Alert>
        )}

        {!isLoading && status === "authenticated" && !voter && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are not registered as a voter. Please register to vote.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && voter && voter.status !== 'approved' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your voter registration is {voter.status || 'unknown'}. Please wait for approval to vote.
            </AlertDescription>
          </Alert>
        )}

        {hasVoted.length > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You have voted in {hasVoted.length} election(s). Thank you for participating!
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Elections List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Available Elections</h2>
              {elections.length === 0 ? (
                <Card>
                  <CardContent className="py-4">
                    <p className="text-gray-600">No active elections available.</p>
                  </CardContent>
                </Card>
              ) : (
                elections.map((election) => (
                  <Card
                    key={election._id}
                    className={`cursor-pointer transition-all ${
                      selectedElection === election._id ? 'ring-2 ring-indigo-500' : ''
                    } ${!canVoteInElection(election) ? 'opacity-60' : ''}`}
                    onClick={() => canVoteInElection(election) && setSelectedElection(election._id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{election.title}</CardTitle>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge
                            variant={election.status === 'active' ? 'default' : 'secondary'}
                            className={election.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {election.status}
                          </Badge>
                          <Badge variant="outline">{election.type}</Badge>
                        </div>
                      </div>
                      <CardDescription>{election.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {election.start?.date
                              ? format(new Date(election.start.date), "PPP")
                              : 'N/A'}
                          </span>
                        </div>
                        {canVoteInElection(election) && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{election.end?.date ? getTimeRemaining(election.end.date) : 'N/A'}</span>
                          </div>
                        )}
                        {!canVoteInElection(election) && (
                          <div className="flex items-center space-x-2 text-sm text-orange-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>
                              {hasVoted.includes(election._id)
                                ? 'You have already voted'
                                : election.status !== 'active'
                                ? 'Voting not open'
                                : 'You are not approved to vote'}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Voting Panel */}
            <div>
              {selectedElection ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Vote className="h-5 w-5 text-indigo-600" />
                      <span>Cast Your Vote</span>
                    </CardTitle>
                    <CardDescription>
                      Select your preferred candidate below
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const election = elections.find((e) => e._id === selectedElection)
                      if (!election) return null

                      return (
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-900">{election.title}</h3>
                            <p className="text-sm text-blue-700">{election.description}</p>
                          </div>

                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Select a Candidate:</h4>
                            {election.candidates.length === 0 ? (
                              <p className="text-gray-600">No candidates available for this election.</p>
                            ) : (
                              election.candidates.map((candidate: any) => (
                                <div
                                  key={candidate.candidate._id}
                                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                    selectedCandidate === candidate.candidate._id
                                      ? 'border-indigo-500 bg-indigo-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => setSelectedCandidate(candidate.candidate._id)}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="text-2xl">🗳️</div>
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-900">{candidate.candidate.name}</h5>
                                      <p className="text-sm text-gray-600">{candidate.party.name}</p>
                                    </div>
                                    {selectedCandidate === candidate.candidate._id && (
                                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="pt-4 border-t">
                            <Button
                              onClick={handleVote}
                              disabled={!selectedCandidate || hasVoted.includes(selectedElection)}
                              className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                              <Vote className="h-4 w-4 mr-2" />
                              Cast Vote
                            </Button>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Your vote is secret and cannot be changed once submitted
                            </p>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Vote className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Election</h3>
                    <p className="text-gray-600 text-center">
                      Choose an active election from the list to view candidates and cast your vote
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Voting Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Voting Guidelines</CardTitle>
            <CardDescription>
              Important information about the voting process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Before You Vote:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ensure your voter registration is approved</li>
                  <li>• Review all candidates carefully</li>
                  <li>• Make sure you understand the election type</li>
                  <li>• Check voting deadlines</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Voting Process:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Select one candidate per election</li>
                  <li>• Your vote is completely confidential</li>
                  <li>• Votes cannot be changed once submitted</li>
                  <li>• You'll receive a confirmation after voting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}