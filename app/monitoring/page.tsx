import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { DiseaseMonitoringMap } from "@/components/disease-monitoring-map"

export default async function MonitoringPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Disease Monitoring Map</h1>
          <p className="text-slate-600">Real-time visualization of disease outbreaks across Rwanda</p>
        </div>

        <DiseaseMonitoringMap />
      </div>
    </div>
  )
}
