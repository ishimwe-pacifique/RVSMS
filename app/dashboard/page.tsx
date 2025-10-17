import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardAnalytics } from "@/components/dashboard-analytics"

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user.name}</h1>
          <p className="text-slate-600">
            Manage animal health and track disease outbreaks in {user.sector || "your assigned area"}
          </p>
        </div>

        <DashboardAnalytics />
      </div>
    </div>
  )
}
