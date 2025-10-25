"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Search, Eye, Edit, Trash2, Filter, Users, Grid, List } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Animal } from "@/lib/types"

export function AnimalsList() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState("all")
  const [healthFilter, setHealthFilter] = useState("all")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [owners, setOwners] = useState<string[]>([])

  useEffect(() => {
    fetchAnimals()
  }, [search, speciesFilter, healthFilter, ownerFilter])

  useEffect(() => {
    fetchOwners()
  }, [])

  const fetchAnimals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (speciesFilter !== "all") params.append("species", speciesFilter)
      if (healthFilter !== "all") params.append("healthStatus", healthFilter)
      if (ownerFilter && ownerFilter !== "all") params.append("owner", ownerFilter)

      const response = await fetch(`/api/animals?${params}`)
      const data = await response.json()
      setAnimals(data.animals || [])
    } catch (error) {
      console.error("Failed to fetch animals:", error)
      toast.error("Failed to load animals")
    } finally {
      setLoading(false)
    }
  }

  const fetchOwners = async () => {
    try {
      const response = await fetch("/api/animals/owners")
      const data = await response.json()
      setOwners(data.owners || [])
    } catch (error) {
      console.error("Failed to fetch owners:", error)
    }
  }

  const handleDelete = async (animalId: string) => {
    setDeleting(animalId)
    try {
      const response = await fetch(`/api/animals/${animalId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete animal")
      }

      toast.success("Animal deleted successfully")
      fetchAnimals()
    } catch (error) {
      console.error("Failed to delete animal:", error)
      toast.error("Failed to delete animal")
    } finally {
      setDeleting(null)
    }
  }

  const clearFilters = () => {
    setSearch("")
    setSpeciesFilter("all")
    setHealthFilter("all")
    setOwnerFilter("all")
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Animals Management ({animals.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              Table
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="gap-2"
            >
              <Grid className="w-4 h-4" />
              Grid
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by ID, owner, or breed..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {owners.map((owner) => (
                    <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
                <Filter className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>
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
      ) : viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Animal ID</TableHead>
                  <TableHead>Species/Breed</TableHead>
                  <TableHead>Age/Sex</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Health Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animals.map((animal) => (
                  <TableRow key={animal._id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      <Link href={`/animals/${animal._id}`} className="text-emerald-600 hover:text-emerald-700">
                        {animal.animalId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium capitalize">{animal.species}</p>
                        <p className="text-sm text-slate-500">{animal.breed}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{animal.age} years</p>
                        <p className="text-sm text-slate-500 capitalize">{animal.sex}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{animal.ownerName}</p>
                        <p className="text-sm text-slate-500">{animal.ownerContact}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{animal.sector}</p>
                        <p className="text-sm text-slate-500">{animal.district}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getHealthStatusColor(animal.healthStatus)}>
                        {animal.healthStatus.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(animal.registeredDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/animals/${animal._id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/animals/${animal._id}/edit`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Animal</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {animal.animalId}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(animal._id)}
                                disabled={deleting === animal._id}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleting === animal._id ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

                  <div className="flex items-center gap-2">
                    <Link href={`/animals/${animal._id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/animals/${animal._id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700 border-red-200">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Animal</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {animal.animalId}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(animal._id)}
                            disabled={deleting === animal._id}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deleting === animal._id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
