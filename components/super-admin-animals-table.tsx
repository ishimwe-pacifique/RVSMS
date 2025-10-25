"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Filter, Search, ChevronLeft, ChevronRight, Eye, MapPin, Calendar } from "lucide-react"
import { rwandaProvinces } from "@/lib/rwanda-locations"

interface Animal {
  _id: string
  tagNumber: string
  species: string
  breed: string
  age: number
  gender: string
  healthStatus: string
  owner: {
    name: string
    phone: string
  }
  location: {
    province: string
    district: string
    sector: string
  }
  registrationDate: string
  lastHealthCheck: string
  vaccinations: Array<{
    vaccine: string
    date: string
  }>
}

interface AnimalsResponse {
  animals: Animal[]
  total: number
  page: number
  totalPages: number
}

export function SuperAdminAnimalsTable() {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvince, setSelectedProvince] = useState<string>("all")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalAnimals, setTotalAnimals] = useState(0)
  const [pageSize] = useState(20)

  useEffect(() => {
    fetchAnimals()
  }, [selectedProvince, selectedDistrict, searchTerm, currentPage])

  const fetchAnimals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(selectedProvince !== "all" && { province: selectedProvince }),
        ...(selectedDistrict !== "all" && { district: selectedDistrict }),
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/animals/super-admin?${params}`)
      const data: AnimalsResponse = await response.json()
      
      setAnimals(data.animals)
      setTotalPages(data.totalPages)
      setTotalAnimals(data.total)
    } catch (error) {
      console.error("Failed to fetch animals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province)
    setSelectedDistrict("all")
    setCurrentPage(1)
  }

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district)
    setCurrentPage(1)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedProvince("all")
    setSelectedDistrict("all")
    setSearchTerm("")
    setCurrentPage(1)
  }

  const getDistrictsForProvince = (provinceName: string) => {
    const province = rwandaProvinces.find(p => p.name === provinceName)
    return province ? province.districts.map(d => d.name) : []
  }

  const getHealthStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy": return "default"
      case "sick": return "destructive"
      case "under_treatment": return "secondary"
      case "quarantine": return "outline"
      default: return "secondary"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">National Animal Registry</h2>
          <p className="text-slate-600">
            {totalAnimals.toLocaleString()} animals registered across Rwanda
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Select value={selectedProvince} onValueChange={handleProvinceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                {rwandaProvinces.map(province => (
                  <SelectItem key={province.name} value={province.name}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedDistrict} 
              onValueChange={handleDistrictChange}
              disabled={selectedProvince === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {getDistrictsForProvince(selectedProvince).map(district => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by tag, owner, species..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Animals Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Animals Registry</CardTitle>
            <div className="text-sm text-slate-600">
              Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalAnimals)} of {totalAnimals.toLocaleString()} animals
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-600">Loading animals...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag Number</TableHead>
                      <TableHead>Species & Breed</TableHead>
                      <TableHead>Age/Gender</TableHead>
                      <TableHead>Health Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Last Check</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {animals.map((animal) => (
                      <TableRow key={animal._id}>
                        <TableCell className="font-medium">
                          {animal.tagNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{animal.species}</div>
                            <div className="text-sm text-slate-600">{animal.breed}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{animal.age} years</div>
                            <div className="text-sm text-slate-600 capitalize">{animal.gender}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getHealthStatusColor(animal.healthStatus)}>
                            {animal.healthStatus.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{animal.owner.name}</div>
                            <div className="text-sm text-slate-600">{animal.owner.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 mt-1 text-slate-400" />
                            <div className="text-sm">
                              <div>{animal.location.sector}</div>
                              <div className="text-slate-600">{animal.location.district}</div>
                              <div className="text-slate-500">{animal.location.province}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(animal.registrationDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {animal.lastHealthCheck ? formatDate(animal.lastHealthCheck) : "No check"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}