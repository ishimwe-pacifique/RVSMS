"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Eye } from "lucide-react"
import Link from "next/link"
import type { Animal } from "@/lib/types"

export function AnimalsList() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [healthFilter, setHealthFilter] = useState("all")

  useEffect(() => {
    fetchAnimals()
  }, [search, speciesFilter, healthFilter])

  const fetchAnimals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (speciesFilter !== "all") params.append("species", speciesFilter)
      if (healthFilter !== "all") params.append("healthStatus", healthFilter)

      const response = await fetch(`/api/animals?${params}`)
      const data = await response.json()
      setAnimals(data.animals || [])
    } catch (error) {
      console.error("Failed to fetch animals:", error)
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by ID, owner, or breed..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Species" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Species</SelectItem>
                <SelectItem value="cattle">Cattle</SelectItem>
                <SelectItem value="goat">Goat</SelectItem>
                <SelectItem value="sheep">Sheep</SelectItem>
                <SelectItem value="pig">Pig</SelectItem>
                <SelectItem value="chicken">Chicken</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Health Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="under_treatment">Under Treatment</SelectItem>
                <SelectItem value="recovered">Recovered</SelectItem>
                <SelectItem value="deceased">Deceased</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">Loading animals...</CardContent>
        </Card>
      ) : animals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <p className="text-sm">No animals found</p>
            <p className="text-xs mt-1">Try adjusting your search filters or register a new animal</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {animals.map((animal) => (
            <Card key={animal._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">{animal.animalId}</h3>
                      <Badge className={getHealthStatusColor(animal.healthStatus)}>
                        {animal.healthStatus.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Species & Breed</p>
                        <p className="font-medium text-slate-900">
                          {animal.species} - {animal.breed}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Age & Sex</p>
                        <p className="font-medium text-slate-900">
                          {animal.age} years, {animal.sex}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Owner</p>
                        <p className="font-medium text-slate-900">{animal.ownerName}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Location</p>
                        <p className="font-medium text-slate-900">
                          {animal.sector}, {animal.district}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link href={`/animals/${animal._id}`}>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
