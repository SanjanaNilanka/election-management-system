"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function SystemReportsPage() {
  const [voters, setVoters] = useState<any[]>([])
  const [elections, setElections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = "http://localhost:5000/api"

  // Fetch data
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [votersRes, electionsRes] = await Promise.all([
        fetch(`${API_BASE}/voter`).then((r) => r.json()),
        fetch(`${API_BASE}/elections`).then((r) => r.json()),
      ])
      setVoters(Array.isArray(votersRes) ? votersRes : [])
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

  useEffect(() => {
    fetchData()
  }, [])

  // Voter statistics
  const voterStats = {
    total: voters.length,
    approved: voters.filter(v => v.status === 'approved').length,
    pending: voters.filter(v => v.status === 'pending').length,
    rejected: voters.filter(v => v.status === 'rejected').length,
  }

  // Election statistics
  const electionStats = {
    total: elections.length,
    active: elections.filter(e => e.status === 'active').length,
    pending: elections.filter(e => e.status === 'pending').length,
    closed: elections.filter(e => e.status === 'closed').length,
  }

  // Get winner for an election
  const getWinner = (candidates: any[]) => {
    if (candidates.length === 0) return 'N/A'
    const maxVotes = Math.max(...candidates.map(c => c.votes))
    const winner = candidates.find(c => c.votes === maxVotes)
    return winner ? `${winner.candidate.name} (${winner.votes} votes)` : 'Tie'
  }

  return (
    <DashboardLayout userRole="election_commission">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">System Reports</h1>
          <p className="text-indigo-100">Overview of voters and election results.</p>
        </div>

        {isLoading ? (
          <div>Loading reports...</div>
        ) : (
          <>
            {/* Voter Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Voter Statistics</CardTitle>
                <CardDescription>Summary of voter registrations.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium">Total Voters</h3>
                    <p className="text-2xl font-bold">{voterStats.total}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium">Approved</h3>
                    <p className="text-2xl font-bold">{voterStats.approved}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium">Pending</h3>
                    <p className="text-2xl font-bold">{voterStats.pending}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium">Rejected</h3>
                    <p className="text-2xl font-bold">{voterStats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Election Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Election Statistics</CardTitle>
                <CardDescription>Summary of elections.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium">Total Elections</h3>
                    <p className="text-2xl font-bold">{electionStats.total}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium">Active</h3>
                    <p className="text-2xl font-bold">{electionStats.active}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium">Pending</h3>
                    <p className="text-2xl font-bold">{electionStats.pending}</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-medium">Closed</h3>
                    <p className="text-2xl font-bold">{electionStats.closed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Election Results */}
            <Card>
              <CardHeader>
                <CardTitle>Election Results</CardTitle>
                <CardDescription>Detailed results for each election.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="p-2 text-left">Title</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">Total Votes</th>
                        <th className="p-2 text-left">Winner</th>
                        <th className="p-2 text-left">Candidates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {elections.map((election) => (
                        <tr key={election._id} className="border-b">
                          <td className="p-2 font-medium">{election.title}</td>
                          <td className="p-2">
                            <Badge variant={election.status === 'closed' ? 'default' : 'secondary'}>
                              {election.status}
                            </Badge>
                          </td>
                          <td className="p-2">{election.votes.length}</td>
                          <td className="p-2">{getWinner(election.candidates)}</td>
                          <td className="p-2">
                            <ul className="list-disc list-inside">
                              {election.candidates.map((cand: any) => (
                                <li key={cand.candidate._id}>
                                  {cand.candidate.name} ({cand.party.name}): {cand.votes} votes
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}