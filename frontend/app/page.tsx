"use client"

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Vote, Users, Shield, FileText, Phone, HelpCircle, Calendar, TrendingUp, Activity } from 'lucide-react'
import Link from "next/link"
import axios from 'axios';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalVoters: "Loading...",
    digitalElections: "Loading...",
    activeElections: "Loading...",
    systemUptime: "Loading..."
  });
  const [upcomingElections, setUpcomingElections] = useState([]);

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

  const newsUpdates = [
    "New voter registration centers opened in Kandy district",
    "Digital voting pilot program shows 98% success rate in Ratnapura",
    "Election Commission announces enhanced security measures",
    "Mobile voter registration units deployed to remote areas",
    "Online voter education program launches next month"
  ]

  useEffect(() => {
    // Fetch voter statistics
    const fetchVoterStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/voter');
        const voters = response.data;
        const approvedVoters = voters.filter(voter => voter.status === 'approved').length;
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
          .filter(election => new Date(election.start.date) > new Date())
          .map(election => ({
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
          activeElections: elections.filter(e => e.status === 'active').length.toString()
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
              <img src="/logo.png" width={30}/>
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

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
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

      {/* Statistics */}
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

      {/* Information Tiles */}
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

      {/* Upcoming Elections */}
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

      {/* News Ticker */}
      <section className="py-8 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
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