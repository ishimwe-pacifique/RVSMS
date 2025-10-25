import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { AnimalEditForm } from "@/components/animal-edit-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditAnimalPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  const { id } = await params

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav user={user} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/animals">
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Animals
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Animal</h1>
          <p className="text-slate-600">Update the animal details</p>
        </div>

        <AnimalEditForm animalId={id} user={user} />
      </div>
    </div>
  )
}