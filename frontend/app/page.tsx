"use client"

import { use, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Vote, Users, Shield, FileText, Phone, HelpCircle, Calendar, TrendingUp, Activity } from 'lucide-react'
import Link from "next/link"
import axios from 'axios';
import { se } from 'date-fns/locale';

export default function HomePage() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setLang(localStorage.getItem('lang') || 'en');
  }, [lang]);

  const handleLanguageChange = (value: string) => {
    setLang(value);
    localStorage.setItem('lang', value);
    // Optionally, you can trigger a page reload or re-fetch translations here
  }

  const [stats, setStats] = useState({
    totalVoters: "Loading...",
    digitalElections: "Loading...",
    activeElections: "Loading...",
    systemUptime: "Loading..."
  });
  type UpcomingElection = {
    title: string;
    date: string;
    type: string;
    status: string;
  };
  const [upcomingElections, setUpcomingElections] = useState<UpcomingElection[]>([]);

  const tiles = [
    {
      title: "Voter Registration Info",
      description: "Learn how to register as a voter",
      icon: Users,
      href: "/info/registration"
    },
    {
      title: "About Digital Elections",
      description: "Discover our digital transformation",
      icon: Vote,
      href: "/info/digital-elections"
    },
    {
      title: "FAQs",
      description: "Frequently asked questions",
      icon: HelpCircle,
      href: "/info/faqs"
    },
    {
      title: "Security & Privacy",
      description: "How we protect your data",
      icon: Shield,
      href: "/info/security"
    },
    {
      title: "Contact Election Commission",
      description: "Get in touch with us",
      icon: Phone,
      href: "/info/contact"
    }
  ]

  const tiles_si = [
    {
      title: "මැතිවරණ ලියාපදිංචි කිරීමේ තොරතුරු",
      description: "මැතිවරණකරුවකු ලෙස ලියාපදිංචි වීමේ ක්‍රමය ඉගෙන ගන්න",
      icon: Users,
      href: "/info/registration"
    },
    {
      title: "ඩිජිටල් මැතිවරණ පිළිබඳ",
      description: "අපගේ ඩිජිටල් පරිවර්තනය සොයා බලන්න",
      icon: Vote,
      href: "/info/digital-elections"
    },
    {
      title: "අනාවැකි ප්‍රශ්න",
      description: "සැරසිලි අසන ප්‍රශ්න",
      icon: HelpCircle,
      href: "/info/faqs"
    },
    {
      title: "ආරක්ෂාව සහ පෞද්ගලිකත්වය",
      description: "ඔබගේ දත්ත අපි කෙසේ ආරක්ෂා කරන්නේද",
      icon: Shield,
      href: "/info/security"
    },
    {
      title: "මැතිවරණ කොමිෂන් සභාව අමතන්න",
      description: "අප හා සම්බන්ධ වන්න",
      icon: Phone,
      href: "/info/contact"
    }
  ]

  const tiles_ta = [
    {
      title: "வாக்காளர் பதிவு தகவல்",
      description: "வாக்காளர் ஆக பதிவு செய்வது எப்படி என்பதை அறியவும்",
      icon: Users,
      href: "/info/registration"
    },
    {
      title: "டிஜிட்டல் தேர்தல்கள் பற்றி",
      description: "எங்கள் டிஜிட்டல் மாற்றத்தை கண்டறியவும்",
      icon: Vote,
      href: "/info/digital-elections"
    },
    {
      title: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      description: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
      icon: HelpCircle,
      href: "/info/faqs"
    },
    {
      title: "பாதுகாப்பு மற்றும் தனியுரிமை",
      description: "உங்கள் தரவை எவ்வாறு பாதுகாக்கிறோம்",
      icon: Shield,
      href: "/info/security"
    },
    {
      title: "தேர்தல் ஆணைக்குழுவை தொடர்பு கொள்ளவும்",
      description: "எங்களைத் தொடர்பு கொள்ளவும்",
      icon: Phone,
      href: "/info/contact"
    }
  ]

  const newsUpdates = [
    "New voter registration centers opened in Kandy district",
    "Digital voting pilot program shows 98% success rate in Ratnapura",
    "Election Commission announces enhanced security measures",
    "Mobile voter registration units deployed to remote areas",
    "Online voter education program launches next month"
  ]

  const newsUpdates_si = [
    "මහනුවර දිස්ත්‍රික්කයේ නව මැතිවරණ ලියාපදිංචි මධ්‍යස්ථාන විවෘත කර ඇත",
    "රත්නපුර දිස්ත්‍රික්කයේ ඩිජිටල් ඡන්ද පයිලට් වැඩසටහන 98% සාර්ථකත්ව අනුපාතයක් පෙන්වයි",
    "මැතිවරණ කොමිෂන් සභාව වැඩිදියුණු කළ ආරක්ෂක ක්‍රියාමාර්ග ප්‍රකාශ කරයි",
    "දුරස්ථ ප්‍රදේශවලට ජංගම මැතිවරණ ලියාපදිංචි ඒකක යොදා ඇත",
    "ඊළඟ මාසයේදී ඔන්ලයින් මැතිවරණකරුවන්ගේ අධ්‍යාපන වැඩසටහන ආරම්භ වේ"
  ]

  const newsUpdates_ta = [
    "கண்டி மாவட்டத்தில் புதிய வாக்காளர் பதிவு மையங்கள் திறக்கப்பட்டன",
    "ரத்தநபுரா மாவட்டத்தில் டிஜிட்டல் வாக்குப்பதிவு பைலட் திட்டம் 98% வெற்றிகரமான வீதத்தை காட்டுகிறது",
    "தேர்தல் ஆணைக்குழு மேம்படுத்தப்பட்ட பாதுகாப்பு நடவடிக்கைகளை அறிவித்தது",
    "தூர பகுதிகளுக்கு மொபைல் வாக்காளர் பதிவு அலகுகள் அனுப்பப்பட்டுள்ளன",
    "அடுத்த மாதம் ஆன்லைன் வாக்காளர் கல்வி திட்டம் தொடங்குகிறது"
  ]

  useEffect(() => {
    // Fetch voter statistics
    const fetchVoterStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/voter');
        const voters = response.data;
        const approvedVoters = voters.filter((voter: { status: string; }) => voter.status === 'approved').length;
        setStats(prev => ({
          ...prev,
          totalVoters: approvedVoters.toString(),
          digitalElections: "3", // Assuming 3 pilot programs, adjust as needed
          systemUptime: "99.9%" // Static for demo, replace with real metric if available
        }));
      } catch (error) {
        console.error('Error fetching voter stats:', error);
        setStats(prev => ({
          ...prev,
          totalVoters: "Error",
          digitalElections: "Error",
          systemUptime: "Error"
        }));
      }
    };

    // Fetch election data
    const fetchElections = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/elections');
        const elections = response.data;
        const upcoming = elections
          .filter((election: { start: { date: string | number | Date; }; }) => new Date(election.start.date) > new Date())
          .map((election: { title: any; start: { date: any; }; type: string; status: string; }) => ({
            title: election.title,
            date: election.start.date,
            type: election.type.charAt(0).toUpperCase() + election.type.slice(1),
            status: election.status === 'pending' ? 'Announced' : 
                    election.status === 'active' ? 'Registration Open' : 'Closed'
          }))
          .slice(0, 3); // Limit to 3 upcoming elections
        setUpcomingElections(upcoming);
        
        // Update active elections count
        setStats(prev => ({
          ...prev,
          activeElections: elections.filter((e: { status: string; }) => e.status === 'active').length.toString()
        }));
      } catch (error) {
        console.error('Error fetching elections:', error);
        setUpcomingElections([]);
        setStats(prev => ({ ...prev, activeElections: "Error" }));
      }
    };

    fetchVoterStats();
    fetchElections();
  }, []);

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

      {/* Hero Section */}
      {lang === 'en' &&
        <section className="py-20 px-4 sm:px-6 lg:px-8 height-[100vh]" style={{height: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center'}}>
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Digital Democracy for
              <span className="text-indigo-600 block">Sri Lanka</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Empowering citizens through secure, transparent, and accessible digital elections. 
              Join the future of democratic participation in Sri Lanka.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/auth/register">Register to Vote</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </div>
        </section>
      }
      {lang === 'si' &&
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{height: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center'}}>
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-indigo-600 block">ශ්‍රී ලංකාව</span>
              සඳහා ඩිජිටල් ජනතා තේරීම
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              ආරක්ෂිත, පාරදර්ශී, සහ ප්‍රවේශමත් ඩිජිටල් මැතිවරණ හරහා පුරවැසියන්ට බලය දීම. 
              ශ්‍රී ලංකාවේ ප්‍රජාතන්ත්‍රවාදී සහභාගීත්වයේ අනාගතයට එක්වන්න.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/auth/register">මැතිවරණයට ලියාපදිංචි වන්න</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">ඇතුල් වන්න</Link>
              </Button>
            </div>
          </div>
        </section>
      }
      {lang === 'ta' &&
        <section className="py-20 px-4 sm:px-6 lg:px-8" style={{height: 'calc(100vh - 100px)', display: 'flex', alignItems: 'center'}}>
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              இலங்கைக்கான டிஜிட்டல் ஜனநாயகம்
            </h2>
            <p className="text-md text-gray-600 mb-8 max-w-3xl mx-auto">
              பாதுகாப்பான, வெளிப்படையான மற்றும் அணுகக்கூடிய டிஜிட்டல் தேர்தல்களால் குடிமக்களுக்கு அதிகாரம் வழங்குதல். 
              இலங்கையின் ஜனநாயக பங்கேற்பின் எதிர்காலத்தில் இணைந்துகொள்ளுங்கள்.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/auth/register">வாக்காளர் பதிவு செய்யவும்</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">உள்நுழைய</Link>
              </Button>
            </div>
          </div>
        </section>
      }
      

      {/* Statistics */}
      {lang === 'en' &&
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Election Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Registered Voters", value: stats.totalVoters, icon: Users },
                { label: "Digital Elections Pilot", value: stats.digitalElections, icon: TrendingUp },
                { label: "Active Elections", value: stats.activeElections, icon: Vote },
                { label: "System Uptime", value: stats.systemUptime, icon: Activity }
              ].map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardHeader className="pb-2">
                    <stat.icon className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <CardTitle className="text-2xl font-bold text-indigo-600">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      }
      {lang === 'si' &&
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">මැතිවරණ සංඛ්‍යාත</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "ලියාපදිංචි වු මැතිවරණකරුවන්", value: stats.totalVoters, icon: Users },
                { label: "ඩිජිටල් මැතිවරණ පයිලට්", value: stats.digitalElections, icon: TrendingUp },
                { label: "සක්‍රීය මැතිවරණ", value: stats.activeElections, icon: Vote },
                { label: "පද්ධති කාලය", value: stats.systemUptime, icon: Activity }
              ].map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardHeader className="pb-2">
                    <stat.icon className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <CardTitle className="text-2xl font-bold text-indigo-600">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      }
      {lang === 'ta' &&
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">தேர்தல் புள்ளிவிவரங்கள்</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "மொத்த பதிவு செய்யப்பட்ட வாக்காளர்கள்", value: stats.totalVoters, icon: Users },
                { label: "டிஜிட்டல் தேர்தல் பைலட்", value: stats.digitalElections, icon: TrendingUp },
                { label: "செயலில் உள்ள தேர்தல்கள்", value: stats.activeElections, icon: Vote },
                { label: "கணினி செயல்திறன்", value: stats.systemUptime, icon: Activity }
              ].map((stat, index) => (
                <Card key={index} className="text-center">
                  <CardHeader className="pb-2">
                    <stat.icon className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                    <CardTitle className="text-2xl font-bold text-indigo-600">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      }

      {/* Information Tiles */}

      {lang === 'en' &&
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Information Center</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiles.map((tile, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={tile.href}>
                    <CardHeader>
                      <tile.icon className="h-8 w-8 text-indigo-600 mb-2" />
                      <CardTitle className="text-lg">{tile.title}</CardTitle>
                      <CardDescription>{tile.description}</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      }
      {lang === 'si' &&
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">තොරතුරු මධ්‍යස්ථානය</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiles_si.map((tile, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={tile.href}>
                    <CardHeader>
                      <tile.icon className="h-8 w-8 text-indigo-600 mb-2" />
                      <CardTitle className="text-lg">{tile.title}</CardTitle>
                      <CardDescription>{tile.description}</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      }
      {lang === 'ta' &&
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">தகவல் மையம்</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tiles_ta.map((tile, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link href={tile.href}>
                    <CardHeader>
                      <tile.icon className="h-8 w-8 text-indigo-600 mb-2" />
                      <CardTitle className="text-lg">{tile.title}</CardTitle>
                      <CardDescription>{tile.description}</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      }

      {/* Upcoming Elections */}
      {lang === 'en' &&
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900">Upcoming Elections</h3>
              <Button variant="outline" asChild>
                <Link href="/elections/upcoming">View All Elections</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingElections.length > 0 ? upcomingElections.map((election, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{election.title}</CardTitle>
                      <Badge variant={election.status === 'Registration Open' ? 'default' : 'default'}>
                        {election.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(election.date).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline">{election.type}</Badge>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              )) : (
                <p className="text-gray-600">No upcoming elections found.</p>
              )}
            </div>
          </div>
        </section>
      }
      {lang === 'si' &&
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900">ඉදිරියට පැවැත්වෙන මැතිවරණ</h3>
              <Button variant="outline" asChild>
                <Link href="/elections/upcoming">සියලුම මැතිවරණ බලන්න</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingElections.length > 0 ? upcomingElections.map((election, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{election.title}</CardTitle>
                      <Badge variant={election.status === 'Registration Open' ? 'default' : 'default'}>
                        {election.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(election.date).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline">{election.type}</Badge>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              )) : (
                <p className="text-gray-600">ඉදිරියට පැවැත්වෙන මැතිවරණ නොමැත.</p>
              )}
            </div>
          </div>
        </section>
      }
      {lang === 'ta' &&
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900">வரவிருக்கும் தேர்தல்கள்</h3>
              <Button variant="outline" asChild>
                <Link href="/elections/upcoming">அனைத்து தேர்தல்களையும் காண்க</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingElections.length > 0 ? upcomingElections.map((election, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{election.title}</CardTitle>
                      <Badge variant={election.status === 'Registration Open' ? 'default' : 'default'}>
                        {election.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(election.date).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline">{election.type}</Badge>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              )) : (
                <p className="text-gray-600">வரவிருக்கும் தேர்தல்கள் எதுவும் இல்லை.</p>
              )}
            </div>
          </div>
        </section>
      }

      {/* News Ticker */}
      <section className="py-8 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            {lang === 'en' &&
            <>
              <Badge variant="secondary" className="bg-white text-indigo-600 font-semibold">
                LATEST NEWS
              </Badge>
              <div className="flex-1 overflow-hidden">
                <div className="animate-scroll whitespace-nowrap">
                  {newsUpdates.map((news, index) => (
                    <span key={index} className="inline-block mr-12">
                      • {news}
                    </span>
                  ))}
                </div>
              </div>
            </>
            }
            {lang === 'si' &&
            <>
              <Badge variant="secondary" className="bg-white text-indigo-600 font-semibold" style={{ fontSize: '14px' }}>
                නවතම පුවත්
              </Badge>
              <div className="flex-1 overflow-hidden">
                <div className="animate-scroll whitespace-nowrap">
                  {newsUpdates_si.map((news, index) => (
                    <span key={index} className="inline-block mr-12">
                      • {news}
                    </span>
                  ))}
                </div>
              </div>
            </>
            }
            {lang === 'ta' &&
            <>
              <Badge variant="secondary" className="bg-white text-indigo-600 font-semibold">
                சமீபத்திய செய்திகள்
              </Badge>
              <div className="flex-1 overflow-hidden">
                <div className="animate-scroll whitespace-nowrap">
                  {newsUpdates_ta.map((news, index) => (
                    <span key={index} className="inline-block mr-12">
                      • {news}
                    </span>
                  ))}
                </div>
              </div>
            </>
            }
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Vote className="h-6 w-6" />
                <span className="font-bold">Sri Lanka Election Commission</span>
              </div>
              <p className="text-gray-400">
                Ensuring free, fair, and transparent elections for all Sri Lankan citizens.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/info/registration" className="hover:text-white">Voter Registration</Link></li>
                <li><Link href="/elections/upcoming" className="hover:text-white">Upcoming Elections</Link></li>
                <li><Link href="/info/faqs" className="hover:text-white">FAQs</Link></li>
                <li><Link href="/info/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Information</h4>
              <div className="text-gray-400 space-y-2">
                <p>Election Commission of Sri Lanka</p>
                <p>Sarana Mawatha, Rajagiriya</p>
                <p>Phone: +94 11 2868 080</p>
                <p>Email: info@elections.gov.lk</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Election Commission of Sri Lanka. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}