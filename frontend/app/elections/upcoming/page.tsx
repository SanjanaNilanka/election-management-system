"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Vote, Calendar, MapPin, Users, ArrowLeft } from 'lucide-react'
import Link from "next/link"
import axios from 'axios';

type Election = {
  id: string;
  title: string;
  description: string;
  date: string;
  registrationDeadline: number;
  type: string;
  status: string;
  districts: string[];
  expectedVoters: string;
  candidates: number;
};

export default function UpcomingElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/api/elections');
        interface ApiElection {
          _id: string;
          title: string;
          description: string;
          start: {
            date: string;
          };
          type: string;
          status: string;
          level: string;
          district?: string;
          candidates: unknown[];
        }

        const fetchedElections: Election[] = (response.data as ApiElection[]).map((election: ApiElection): Election => ({
          id: election._id,
          title: election.title,
          description: election.description,
          date: election.start.date,
          registrationDeadline: new Date(election.start.date).setDate(new Date(election.start.date).getDate() - 30), // Assuming 30 days before election
          type: election.type.charAt(0).toUpperCase() + election.type.slice(1),
          status: election.status,
          districts: election.level === 'district' ? [election.district ?? ''] : election.level === 'national' ? ['All Districts'] : [election.level],
          expectedVoters: 'N/A', // Adjust if API provides this data
          candidates: election.candidates.length
        }));
        setElections(fetchedElections);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching elections:', error);
        setError('Failed to load elections. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchElections();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Vote className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Sri Lanka Election Commission</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/auth/register">Register to Vote</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Elections</h1>
          <p className="text-gray-600">
            View all scheduled elections and their details. Register to vote and participate in Sri Lanka's democratic process.
          </p>
        </div>

        {/* Elections Grid */}
        {isLoading ? (
          <p className="text-gray-600">Loading elections...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : elections.length === 0 ? (
          <p className="text-gray-600">No elections found.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {elections.map((election) => (
              <Card key={election.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{election.title}</CardTitle>
                    <Badge className={getStatusColor(election.status)}>
                      {election.status === 'active' ? 'Registration Open' :
                       election.status === 'pending' ? 'Announced' : 'Closed'}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {election.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Election Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      <div>
                        <p className="font-medium">Election Date</p>
                        <p className="text-gray-600">{new Date(election.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="font-medium">Registration Deadline</p>
                        <p className="text-gray-600">{new Date(election.registrationDeadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium">Districts</p>
                        <p className="text-gray-600">{election.districts.join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Expected Voters</p>
                        <p className="text-gray-600">{election.expectedVoters}</p>
                      </div>
                    </div>
                  </div>

                  {/* Election Type and Candidates */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{election.type}</Badge>
                      <span className="text-sm text-gray-600">
                        {election.candidates} candidates
                      </span>
                    </div>
                    {election.status === 'active' && (
                      <Button size="sm" asChild>
                        <Link href="/auth/register">
                          Register Now
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-indigo-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Participate?</h2>
          <p className="text-indigo-100 mb-6">
            Register as a voter to participate in upcoming elections and make your voice heard in Sri Lanka's democracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">Register to Vote</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-indigo-600" asChild>
              <Link href="/auth/login">Login to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}