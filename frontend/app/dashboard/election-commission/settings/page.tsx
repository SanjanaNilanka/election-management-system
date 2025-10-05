"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { toast } from "@/components/ui/use-toast"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [voterApprovalThreshold, setVoterApprovalThreshold] = useState("3")
  const [systemTheme, setSystemTheme] = useState("light")

  const handleSave = () => {
    toast({
      description: "Settings saved successfully (dummy action).",
    })
  }

  return (
    <DashboardLayout userRole="election_commission">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">System Settings</h1>
          <p className="text-indigo-100">Configure system preferences and notifications.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage system-wide preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">System Theme</Label>
                  <p className="text-sm text-gray-600">Choose the appearance of the dashboard.</p>
                </div>
                <Select value={systemTheme} onValueChange={setSystemTheme}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Temporarily disable public access to the system.</p>
                </div>
                <Switch checked={false} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how notifications are sent to users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send voter approval updates via email.</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Send election updates via SMS.</p>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
              <div>
                <Label className="font-medium">Notification Email</Label>
                <p className="text-sm text-gray-600">Email address for system notifications.</p>
                <Input
                  placeholder="notifications@election.gov"
                  className="mt-2"
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voter Approval Settings</CardTitle>
            <CardDescription>Manage voter registration approval process.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="font-medium">Approval Threshold</Label>
                <p className="text-sm text-gray-600">Number of approvals required for voter registration.</p>
                <Select value={voterApprovalThreshold} onValueChange={setVoterApprovalThreshold}>
                  <SelectTrigger className="w-40 mt-2">
                    <SelectValue placeholder="Select Threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Approval</SelectItem>
                    <SelectItem value="2">2 Approvals</SelectItem>
                    <SelectItem value="3">3 Approvals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-medium">Auto-Approve Verified Documents</Label>
                <p className="text-sm text-gray-600">Automatically approve voters with verified documents.</p>
                <Switch checked={false} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
            <Settings className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}