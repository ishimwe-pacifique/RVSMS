"use client"

import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { SuperAdminAnalytics } from "@/components/super-admin-analytics"
import { SuperAdminAnimalsTable } from "@/components/super-admin-animals-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Database } from "lucide-react"
import { useEffect, useState } from "react"

export default function SuperAdminPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const userData = await response.json()
          if (userData.role !== 'super_admin') {
            window.location.href = '/dashboard'
            return
          }
          setUser(userData)
        } else {
          window.location.href = '/login'
          return
        }
      } catch (error) {
        window.location.href = '/login'
        return
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-slate-600">
            National overview of animal health and disease monitoring across Rwanda
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="animals" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Animals Registry
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics">
            <SuperAdminAnalytics />
          </TabsContent>
          
          <TabsContent value="animals">
            <SuperAdminAnimalsTable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}