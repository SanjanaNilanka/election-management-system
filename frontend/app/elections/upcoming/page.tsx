"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Vote, Calendar, MapPin, Users, ArrowLeft, Trophy, AlertCircle, Clock } from 'lucide-react'
import Link from "next/link"
import axios from 'axios';
import { Progress } from '@radix-ui/react-progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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
  votes?: any[];
  candidatesData?: any[];
};

export default function UpcomingElectionsPage() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'en');
  }, [lang]);

  const handleLanguageChange = (value: string) => {
    setLang(value);
    localStorage.setItem('lang', value);
    // Optionally, you can trigger a page reload or re-fetch translations here
  }
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

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
        
        const fetchedElections: Election[] = response.data.map((e: any) => ({
          id: e._id,
          title: e.title,
          description: e.description,
          date: e.start.date,
          registrationDeadline: new Date(e.start.date).setDate(new Date(e.start.date).getDate() - 30),
          type: e.type.charAt(0).toUpperCase() + e.type.slice(1),
          status: e.status,
          districts: e.level === 'district' ? [e.district ?? 'N/A'] : e.level === 'national' ? ['All Districts'] : [e.level],
          expectedVoters: 'N/A',
          candidates: e.candidates.length,
          votes: e.votes,
          candidatesData: e.candidates
        }));
        setElections(fetchedElections);
      } catch (error) {
        console.error('Error fetching elections:', error);
        setError('Failed to load elections.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchElections();
  }, []);

  const openResults = (election: Election) => {
    setSelectedElection(election);
    setShowResultsModal(true);
  }

  const getResultsContent = () => {
    if (!selectedElection) return null;

    if (selectedElection.status === 'pending') {
      return (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-blue-800">Election Not Started</h3>
          <p className="text-gray-600 mt-4">Results will be available once voting begins.</p>
        </div>
      )
    }

    if (selectedElection.status === 'active') {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-orange-800">Voting in Progress</h3>
          <p className="text-gray-600 mt-4">Please wait until the election closes to view final results.</p>
        </div>
      )
    }

    // Closed → Show full results
    const totalVotes = selectedElection.votes?.length || 0;
    const results = selectedElection.candidatesData
      ?.map((c: any) => ({
        name: c.candidate.name,
        party: c.party.name,
        votes: c.votes || 0,
        percentage: totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0
      }))
      .sort((a: any, b: any) => b.votes - a.votes);

    const winner = results?.[0];

    return (
      <div className="space-y-8">
        {/* Winner Card */}
        {winner && (
          <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-4 border-yellow-400">
            <CardContent className="py-10 text-center">
              <Trophy className="h-24 w-24 text-yellow-600 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-yellow-800">Winner!</h2>
              <p className="text-3xl font-bold mt-6">{winner.name}</p>
              <p className="text-2xl text-yellow-700">{winner.party}</p>
              <p className="text-5xl font-bold text-yellow-600 mt-8">
                {winner.votes.toLocaleString()} votes ({winner.percentage.toFixed(1)}%)
              </p>
            </CardContent>
          </Card>
        )}

        {/* Full Results */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            Final Results
          </h3>
          {results?.map((r: any, i: number) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-400">#{i + 1}</span>
                  <div>
                    <p className="text-xl font-semibold">{r.name}</p>
                    <p className="text-gray-600">{r.party}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{r.votes.toLocaleString()}</p>
                  <p className="text-lg text-indigo-600">{r.percentage.toFixed(1)}%</p>
                </div>
              </div>
              <Progress value={r.percentage} className="h-10" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/logo.png" width={38}/>
              <div>
                <h1 className="text-md font-bold text-gray-900">
                  ශ්‍රී ලංකා මැතිවරණ කොමිෂන් සභාව
                </h1>
                <h1 className="text-sm font-bold text-gray-900">
                  இலங்கை தேர்தல் ஆணைக்குழு
                </h1>
                <h1 className="text-md font-bold text-gray-900">
                  Sri Lanka Election Commission
                </h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <Select value={lang} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[150px]">
                  {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="si">සිංහල</SelectItem>
                  <SelectItem value="ta">தமிழ்</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" asChild>
                <Link href="/auth/login">
                  {lang === 'si' ? 'ඇතුල් වන්න' : lang === 'ta' ? 'உள்நுழைய' : 'Login'}
                </Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/auth/register">
                  {lang === 'si' ? 'ලියාපදිංචි වන්න' : lang === 'ta' ? 'பதிவு செய்யவும்' : 'Register'}
                </Link>
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
              {lang === 'si' ? 
              <span>මුල් පිටුවට</span> 
              : lang === 'ta' ? 
              <span>முகப்புக்கு</span> 
              : 
              <span>Back to Home</span>}
            </Link>
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          {lang === 'si' ?
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ඉදිරියට පැවැත්වෙන මැතිවරණ</h1>
          : lang === 'ta' ?
          <h1 className="text-2xl font-bold text-gray-900 mb-2">வரவிருக்கும் தேர்தல்கள்</h1>
          :
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upcoming Elections</h1>}
          
          {lang === 'si' ?
          <p className="text-gray-600">
            සියලුම නියමිත මැතිවරණ සහ ඒවායේ විස්තර බලන්න. ඡන්දය දායක වීමට ලියාපදිංචි වන්න සහ ශ්‍රී ලංකාවේ ප්‍රජාතන්ත්‍රවාදී ක්‍රියාවලියේ සහභාගී වන්න.
          </p>
          : lang === 'ta' ?
          <p className="text-gray-600 text-sm">
            அனைத்து திட்டமிடப்பட்ட தேர்தல்களையும் அவற்றின் விவரங்களையும் பார்வையிடுங்கள். வாக்களிக்க பதிவு செய்து இலங்கையின் ஜனநாயக செயல்முறையில் பங்கேற்கவும்.
          </p>
          :
          <p className="text-gray-600">
            View all scheduled elections and their details. Register to vote and participate in Sri Lanka's democratic process.
          </p>}
        </div>

        {/* Elections Grid */}
        {isLoading ? (
          <p className="text-gray-600">
            {lang === 'si' ? 'පූරණය වෙමින් පවතී...' : lang === 'ta' ? 'பதிவிறக்கம்...' : 'Loading...'}
          </p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : elections.length === 0 ? (
          <p className="text-gray-600">
            {lang === 'si' ? 'දැනට ඉදිරියට පැවැත්වෙන මැතිවරණ නොමැත.' : lang === 'ta' ? 'தற்போது வரவிருக்கும் தேர்தல்கள் எதுவும் இல்லை.' : 'No upcoming elections at the moment.'}
          </p>
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
                        <p className="font-medium">
                          {lang === 'si' ? 'මැතිවරණ දිනය' : lang === 'ta' ? 'தேர்தல் தேதி' : 'Election Date'}
                        </p>
                        <p className="text-gray-600">{new Date(election.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="font-medium">
                          {lang === 'si' ? 'ලියාපදිංචි වීමේ අවසන් දිනය' : lang === 'ta' ? 'பதிவு கடைசி தேதி' : 'Registration Deadline'}
                        </p>
                        <p className="text-gray-600">{new Date(election.registrationDeadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium">
                          {lang === 'si' ? 'මැතිවරණ දිස්ත්‍රික්කය' : lang === 'ta' ? 'தேர்தல் மாவட்டம்(கள்)' : 'Election District(s)'}
                        </p>
                        <p className="text-gray-600">{election.districts.join(", ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">
                          {lang === 'si' ? 'අනුමානිත ඡන්ද දායකයින්' : lang === 'ta' ? 'எதிர்பார்க்கப்படும் வாக்காளர்கள்' : 'Expected Voters'}
                        </p>
                        <p className="text-gray-600">{election.expectedVoters}</p>
                      </div>
                    </div>
                  </div>

                  {/* Election Type and Candidates */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{election.type}</Badge>
                      <span className="text-sm text-gray-600">
                        {lang === 'si' ? 'අපේක්ෂකයින් ' + election.candidates : lang === 'ta' ? 'வேட்பாளர்கள் ' + election.candidates :  election.candidates + ' Candidates ' }
                      </span>
                    </div>
                    <div className="flex gap-3">
                      {election.status === 'active' && (
                        <Button size="sm" asChild>
                          <Link href="/auth/register">Register Now</Link>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openResults(election)}
                      >
                        View Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Modal */}
        <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedElection?.title} - Results
              </DialogTitle>
              <DialogDescription>
                {selectedElection?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              {getResultsContent()}
            </div>
          </DialogContent>
        </Dialog>

        {/* Call to Action */}
        <div className="mt-12 bg-indigo-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Participate?</h2>
          <p className="text-indigo-100 mb-6">
            Register as a voter to participate in upcoming elections and make your voice heard in Sri Lanka's democracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default" asChild>
              <Link href="/auth/register">Register to Vote</Link>
            </Button>
            <Button size="lg" variant="secondary" className="text-white border-white hover:bg-white hover:text-indigo-600" asChild>
              <Link href="/auth/login">Login to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}