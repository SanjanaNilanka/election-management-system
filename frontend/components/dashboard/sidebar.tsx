"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Vote, User, FileText, History, HelpCircle, Bell, Home, Users, Settings, MessageSquare, BarChart3, Plus, Shield, Calendar, ChevronLeft, ChevronRight, Flag, Users2, Group } from 'lucide-react'

interface SidebarProps {
  userRole: "citizen" | "grama_niladhari" | "election_commission"
}

export function Sidebar({ userRole }: SidebarProps) {
  const { data: session, status } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const getMenuItems = () => {
    switch (userRole) {
      case "citizen":
        return [
          { icon: Home, label: "Overview", href: "/dashboard/citizen" },
          { icon: User, label: "My Profile", href: "/dashboard/citizen/profile" },
          { icon: FileText, label: "Voter Registration", href: "/dashboard/citizen/voter-reg" },
          { icon: Vote, label: "Vote", href: "/dashboard/citizen/voting" },
          // { icon: History, label: "Voting History", href: "/dashboard/citizen/history" },
          { icon: HelpCircle, label: "Support & Help", href: "/dashboard/citizen/support" },
          { icon: Bell, label: "Notifications", href: "/dashboard/citizen/notifications" },
        ]
      case "grama_niladhari":
        return [
          { icon: Home, label: "Overview", href: "/dashboard/grama-niladhari" },
          { icon: FileText, label: "Registration Requests", href: "/dashboard/grama-niladhari/requests" },
          { icon: Users, label: "Approved Voters", href: "/dashboard/grama-niladhari/voters" },
          // { icon: FileText, label: "Uploaded Documents", href: "/dashboard/grama-niladhari/documents" },
          { icon: BarChart3, label: "Reports", href: "/dashboard/grama-niladhari/reports" },
          // { icon: MessageSquare, label: "Messaging", href: "/dashboard/grama-niladhari/communication" },
          { icon: Settings, label: "Settings", href: "/dashboard/grama-niladhari/settings" },
        ]
      case "election_commission":
        return [
          { icon: Home, label: "Overview", href: "/dashboard/election-commission" },
          { icon: Calendar, label: "Manage Elections", href: "/dashboard/election-commission/election" },
          { icon: Flag, label: "Manage Regions", href: "/dashboard/election-commission/region" },
          { icon: Users2, label: "Manage Candidates", href: "/dashboard/election-commission/candidate" },
          { icon: Group, label: "Manage Parties", href: "/dashboard/election-commission/party" },
          { icon: Users, label: "All Voters", href: "/dashboard/election-commission/voter" },
          { icon: Shield, label: "GN Management", href: "/dashboard/election-commission/gn-officials" },
          { icon: Shield, label: "EC Management", href: "/dashboard/election-commission/ec-officials" },
          { icon: BarChart3, label: "System Reports", href: "/dashboard/election-commission/reports" },
          // { icon: MessageSquare, label: "User Feedback", href: "/dashboard/election-commission/feedback" },
          // { icon: Bell, label: "Announcements", href: "/dashboard/election-commission/notifications" },
          { icon: Settings, label: "Settings", href: "/dashboard/election-commission/settings" },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  const getRoleTitle = () => {
    switch (userRole) {
      case "citizen":
        return "Citizen Dashboard"
      case "grama_niladhari":
        return "Grama Niladhari"
      case "election_commission":
        return "Election Commission"
      default:
        return "Dashboard"
    }
  }

  return (
    <div className={cn(
      "relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Vote className="h-6 w-6 text-indigo-600" />
            <span className="font-semibold text-gray-900 text-sm">{getRoleTitle()}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-indigo-100 text-indigo-700" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  collapsed && "justify-center"
                )}>
                  <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user.role
                  ? session.user.role.replace(/\b\w/g, l => l.toUpperCase())
                  : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
