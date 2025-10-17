import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { DiseaseReportDetails } from "@/components/disease-report-details"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DiseaseReportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav user={user} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/diseases">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Disease Reports
          </Button>
        </Link>

        <DiseaseReportDetails reportId={id} />
      </div>
    </div>
  )
}
