import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { AnimalsList } from "@/components/animals-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AnimalsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Animal Registry</h1>
            <p className="text-slate-600">View and manage all registered animals in {user.sector || "your area"}</p>
          </div>
          <Link href="/animals/register">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              Register Animal
            </Button>
          </Link>
        </div>

        <AnimalsList />
      </div>
    </div>
  )
}
