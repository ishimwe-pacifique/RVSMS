"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, MapPin, User, Calendar, Activity, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Animal } from "@/lib/types"

export function AnimalDetails({ animalId }: { animalId: string }) {
  const router = useRouter()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnimal()
  }, [animalId])

  const fetchAnimal = async () => {
    try {
      const response = await fetch(`/api/animals/${animalId}`)
      const data = await response.json()
      setAnimal(data.animal)
    } catch (error) {
      console.error("Failed to fetch animal:", error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "sick":
        return "bg-red-100 text-red-700 border-red-200"
      case "under_treatment":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "recovered":
        return "bg-teal-100 text-teal-700 border-teal-200"
      case "deceased":
        return "bg-slate-100 text-slate-700 border-slate-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500">Loading animal details...</CardContent>
      </Card>
    )
  }

  if (!animal) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-slate-500">Animal not found</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{animal.animalId}</h1>
              <Badge className={getHealthStatusColor(animal.healthStatus)}>{animal.healthStatus.replace("_", " ")}</Badge>
            </div>
            <p className="text-slate-600">
              {animal.species} - {animal.breed}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={() => router.push(`/animals/${animal._id}/edit`)}
          >
            <Edit className="w-4 h-4" />
            Edit Details
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Animal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Species</p>
                <p className="font-medium text-slate-900 capitalize">{animal.species}</p>
              </div>
              <div>
                <p className="text-slate-500">Breed</p>
                <p className="font-medium text-slate-900">{animal.breed}</p>
              </div>
              <div>
                <p className="text-slate-500">Age</p>
                <p className="font-medium text-slate-900">{animal.age} years</p>
              </div>
              <div>
                <p className="text-slate-500">Sex</p>
                <p className="font-medium text-slate-900 capitalize">{animal.sex}</p>
              </div>
              {animal.color && (
                <div>
                  <p className="text-slate-500">Color</p>
                  <p className="font-medium text-slate-900">{animal.color}</p>
                </div>
              )}
            </div>
            {animal.identificationMarks && (
              <div>
                <p className="text-slate-500 text-sm">Identification Marks</p>
                <p className="font-medium text-slate-900 text-sm">{animal.identificationMarks}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-slate-500 text-sm">Name</p>
              <p className="font-medium text-slate-900">{animal.ownerName}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Contact</p>
              <p className="font-medium text-slate-900">{animal.ownerContact}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Address</p>
              <p className="font-medium text-slate-900">{animal.ownerAddress}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-600" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Province</p>
                <p className="font-medium text-slate-900">{animal.province}</p>
              </div>
              <div>
                <p className="text-slate-500">District</p>
                <p className="font-medium text-slate-900">{animal.district}</p>
              </div>
              <div>
                <p className="text-slate-500">Sector</p>
                <p className="font-medium text-slate-900">{animal.sector}</p>
              </div>
              {animal.cell && (
                <div>
                  <p className="text-slate-500">Cell</p>
                  <p className="font-medium text-slate-900">{animal.cell}</p>
                </div>
              )}
              {animal.village && (
                <div className="col-span-2">
                  <p className="text-slate-500">Village</p>
                  <p className="font-medium text-slate-900">{animal.village}</p>
                </div>
              )}
            </div>
            {animal.latitude && animal.longitude && (
              <div>
                <p className="text-slate-500 text-sm">Coordinates</p>
                <p className="font-medium text-slate-900 text-sm">
                  {animal.latitude}, {animal.longitude}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600" />
              Registration Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-slate-500 text-sm">Registered Date</p>
              <p className="font-medium text-slate-900">
                {new Date(animal.registeredDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Last Updated</p>
              <p className="font-medium text-slate-900">
                {new Date(animal.lastUpdated).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vaccination History</CardTitle>
        </CardHeader>
        <CardContent>
          {animal.vaccinationHistory && animal.vaccinationHistory.length > 0 ? (
            <div className="space-y-2">
              {animal.vaccinationHistory.map((vaccination, index) => (
                <div key={index} className="border-l-2 border-emerald-600 pl-4 py-2">
                  <p className="font-medium text-slate-900">{vaccination.vaccineName}</p>
                  <p className="text-sm text-slate-600">
                    Administered: {new Date(vaccination.dateAdministered).toLocaleDateString()}
                  </p>
                  {vaccination.nextDueDate && (
                    <p className="text-sm text-slate-600">
                      Next Due: {new Date(vaccination.nextDueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No vaccination records</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
