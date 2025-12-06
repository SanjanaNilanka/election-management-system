// app/dashboard/election-commission/election/view/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Trophy, Users, Clock, Calendar, AlertCircle, Eye } from "lucide-react"
import { format } from "date-fns"
import axios from "axios"
import { useParams } from "next/navigation"

export default function ElectionResults() {
  const params = useParams()
  const electionId = params.id as string

  const [election, setElection] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const API_BASE = "http://localhost:5000/api"

  const fetchResults = async () => {
    try {
      const res = await axios.get(`${API_BASE}/elections/${electionId}`)
      const data = res.data
      if (!data) throw new Error("Election not found")

      setElection(data)

      if (data.status === 'pending') {
        // Only show candidates, no votes
        const candidates = data.candidates.map((c: any) => ({
          candidate: c.candidate,
          party: c.party,
          votes: 0,
          percentage: 0
        }))
        setResults(candidates.sort((a: any, b: any) => a.candidate.name.localeCompare(b.candidate.name)))
      } else {
        // active or closed → show real votes
        const totalVotes = data.votes?.length || 0
        const candidateVotes = data.candidates.map((c: any) => ({
          candidate: c.candidate,
          party: c.party,
          votes: c.votes || 0,
          percentage: totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0
        }))
        setResults(candidateVotes.sort((a: any, b: any) => b.votes - a.votes))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load election")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!electionId) return

    fetchResults()

    // Only auto-refresh if election is active
    if (election?.status === 'active') {
      const interval = setInterval(fetchResults, 5000)
      return () => clearInterval(interval)
    }
  }, [electionId, election?.status])

  if (isLoading) {
    return (
      <DashboardLayout userRole="election_commission">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading election details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !election) {
    return (
      <DashboardLayout userRole="election_commission">
        <Card className="max-w-2xl mx-auto mt-10">
          <CardContent className="py-10 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error || "Election not found"}</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const totalVotes = election.votes?.length || 0
  const winner = results[0]

  return (
    <DashboardLayout userRole="election_commission">
      <div className="space-y-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-8 text-white shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-3">{election.title}</h1>
              <p className="text-xl opacity-90">{election.description}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-lg px-4 py-2 mb-3">
                {election.status.toUpperCase()}
              </Badge>
              {election.status === 'active' && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live Updates</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-80">Total Votes</p>
              <p className="text-3xl font-bold">
                {election.status === 'pending' ? "—" : totalVotes.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-80">Started</p>
              <p className="text-lg font-medium">
                {format(new Date(election.start.date), "PPP 'at' p")}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-80">Ends</p>
              <p className="text-lg font-medium">
                {format(new Date(election.end.date), "PPP 'at' p")}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm opacity-80">Level</p>
              <p className="text-xl font-bold capitalize">{election.level}</p>
            </div>
          </div>
        </div>

        {/* Pending State */}
        {election.status === 'pending' && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-8 text-center">
              <Eye className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-blue-900">Election Not Started</h2>
              <p className="text-blue-700 mt-3">
                Candidates are listed below. Voting will begin when the election is activated.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Winner Announcement (Only when closed) */}
        {election.status === 'closed' && winner && (
          <Card className="border-4 border-green-500 shadow-2xl bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="py-10 text-center">
              <Trophy className="h-24 w-24 text-green-600 mx-auto mb-4" />
              <h2 className="text-5xl font-bold text-green-800">Winner Announced!</h2>
              <p className="text-4xl font-bold mt-6">{winner.candidate.name}</p>
              <p className="text-2xl text-green-700 mt-2">{winner.party.name}</p>
              <p className="text-5xl font-bold text-green-600 mt-8">
                {winner.votes.toLocaleString()} votes ({winner.percentage.toFixed(1)}%)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Candidates List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            {election.status === 'pending' ? 'Registered Candidates' : 'Election Results'}
          </h2>

          <div className="grid gap-6">
            {results.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No candidates registered for this election.
                </CardContent>
              </Card>
            ) : (
              results.map((result, index) => (
                <Card
                  key={result.candidate._id}
                  className={`overflow-hidden transition-all hover:shadow-xl ${
                    election.status === 'closed' && index === 0 ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-6">
                        <div className="text-4xl font-bold text-gray-400">#{index + 1}</div>
                        <div>
                          <h3 className="text-2xl font-bold">{result.candidate.name}</h3>
                          <p className="text-lg text-gray-600">{result.party.name}</p>
                        </div>
                      </div>
                      {election.status === 'closed' && index === 0 && (
                        <Trophy className="h-14 w-14 text-yellow-500" />
                      )}
                    </div>

                    {election.status !== 'pending' ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-lg">
                          <span className="font-semibold">{result.votes.toLocaleString()} votes</span>
                          <span className="font-bold text-indigo-600">
                            {result.percentage.toFixed(2)}%
                          </span>
                        </div>
                        <Progress value={result.percentage} className="h-10" />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-3" />
                        <p className="text-lg">Voting not started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Final Summary */}
        {election.status !== 'pending' && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Total Votes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-indigo-600">{totalVotes.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Status</CardTitle></CardHeader>
              <CardContent>
                <Badge variant={election.status === 'active' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                  {election.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Current Leader</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xl font-bold">
                  {winner ? winner.candidate.name : "No votes"}
                </p>
                <p className="text-gray-600">
                  {winner ? `${winner.votes.toLocaleString()} votes` : "—"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}