"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Filter, Search, ChevronLeft, ChevronRight, Eye, MapPin, Calendar, AlertTriangle, Activity } from "lucide-react"
import { rwandaProvinces } from "@/lib/rwanda-locations"

interface DiseaseReport {
  _id: string
  reportId: string
  animalId: string
  animalDetails: {
    species: string
    breed: string
    age: number
  }
  diseaseName: string
  diseaseType: "viral" | "bacterial" | "parasitic" | "fungal" | "other"
  symptoms: string[]
  severity: "mild" | "moderate" | "severe" | "critical"
  diagnosisDate: string
  outcome?: "recovered" | "under_treatment" | "deceased" | "ongoing"
  location: {
    province: string
    district: string
    sector: string
  }
  reportedBy: string
  reportedDate: string
  isOutbreak: boolean
  affectedAnimalsCount?: number
}

interface DiseasesResponse {
  diseases: DiseaseReport[]
  total: number
  page: number
  totalPages: number
}

export function SuperAdminDiseasesTable() {
  const [diseases, setDiseases] = useState<DiseaseReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProvince, setSelectedProvince] = useState<string>("all")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDiseases, setTotalDiseases] = useState(0)
  const [pageSize] = useState(20)

  useEffect(() => {
    fetchDiseases()
  }, [selectedProvince, selectedDistrict, selectedSeverity, selectedType, searchTerm, currentPage])

  const fetchDiseases = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(selectedProvince !== "all" && { province: selectedProvince }),
        ...(selectedDistrict !== "all" && { district: selectedDistrict }),
        ...(selectedSeverity !== "all" && { severity: selectedSeverity }),
        ...(selectedType !== "all" && { type: selectedType }),
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/diseases/super-admin?${params}`)
      const data: DiseasesResponse = await response.json()
      
      setDiseases(data.diseases)
      setTotalPages(data.totalPages)
      setTotalDiseases(data.total)
    } catch (error) {
      console.error("Failed to fetch diseases:", error)
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

  const handleSeverityChange = (severity: string) => {
    setSelectedSeverity(severity)
    setCurrentPage(1)
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSelectedProvince("all")
    setSelectedDistrict("all")
    setSelectedSeverity("all")
    setSelectedType("all")
    setSearchTerm("")
    setCurrentPage(1)
  }

  const getDistrictsForProvince = (provinceName: string) => {
    const province = rwandaProvinces.find(p => p.name === provinceName)
    return province ? province.districts.map(d => d.name) : []
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "mild": return "default"
      case "moderate": return "secondary"
      case "severe": return "destructive"
      case "critical": return "destructive"
      default: return "outline"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "viral": return "destructive"
      case "bacterial": return "secondary"
      case "parasitic": return "default"
      case "fungal": return "outline"
      default: return "outline"
    }
  }

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome?.toLowerCase()) {
      case "recovered": return "default"
      case "under_treatment": return "secondary"
      case "deceased": return "destructive"
      case "ongoing": return "outline"
      default: return "outline"
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
          <h2 className="text-2xl font-bold text-slate-900">Disease Reports</h2>
          <p className="text-slate-600">
            {totalDiseases.toLocaleString()} disease reports across Rwanda
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
          <div className="grid md:grid-cols-6 gap-4">
            <Select value={selectedProvince} onValueChange={handleProvinceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Province" />
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
                <SelectValue placeholder="District" />
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

            <Select value={selectedSeverity} onValueChange={handleSeverityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="mild">Mild</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="severe">Severe</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="viral">Viral</SelectItem>
                <SelectItem value="bacterial">Bacterial</SelectItem>
                <SelectItem value="parasitic">Parasitic</SelectItem>
                <SelectItem value="fungal">Fungal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search diseases..."
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

      {/* Diseases Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Disease Reports</CardTitle>
            <div className="text-sm text-slate-600">
              Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalDiseases)} of {totalDiseases.toLocaleString()} reports
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-slate-600">Loading disease reports...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report ID</TableHead>
                      <TableHead>Disease & Type</TableHead>
                      <TableHead>Animal</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Outbreak</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {diseases.map((disease) => (
                      <TableRow key={disease._id}>
                        <TableCell className="font-medium">
                          {disease.reportId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{disease.diseaseName}</div>
                            <Badge variant={getTypeColor(disease.diseaseType)} className="text-xs">
                              {disease.diseaseType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{disease.animalDetails.species}</div>
                            <div className="text-sm text-slate-600">
                              {disease.animalDetails.breed}, {disease.animalDetails.age}y
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(disease.severity)}>
                            {disease.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {disease.outcome ? (
                            <Badge variant={getOutcomeColor(disease.outcome)}>
                              {disease.outcome.replace('_', ' ')}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 mt-1 text-slate-400" />
                            <div className="text-sm">
                              <div>{disease.location.sector}</div>
                              <div className="text-slate-600">{disease.location.district}</div>
                              <div className="text-slate-500">{disease.location.province}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {disease.isOutbreak ? (
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="text-red-600 font-medium">
                                {disease.affectedAnimalsCount || 1} animals
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(disease.reportedDate)}
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