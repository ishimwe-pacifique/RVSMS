"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Search } from "lucide-react"
import type { Animal } from "@/lib/types"

export function DiseaseReportForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchAnimal, setSearchAnimal] = useState("")
  const [animals, setAnimals] = useState<Animal[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [symptomInput, setSymptomInput] = useState("")

  const [formData, setFormData] = useState({
    animalId: "",
    diseaseName: "",
    diseaseType: "",
    severity: "",
    diagnosisDate: new Date().toISOString().split("T")[0],
    diagnosisMethod: "",
    treatmentProvided: "",
    outcome: "ongoing",
    isOutbreak: false,
    affectedAnimalsCount: "1",
    notes: "",
  })

  useEffect(() => {
    if (searchAnimal.length >= 2) {
      searchAnimals()
    }
  }, [searchAnimal])

  const searchAnimals = async () => {
    try {
      const response = await fetch(`/api/animals?search=${searchAnimal}`)
      const data = await response.json()
      setAnimals(data.animals || [])
    } catch (error) {
      console.error("Failed to search animals:", error)
    }
  }

  const handleAnimalSelect = (animal: Animal) => {
    setSelectedAnimal(animal)
    setFormData({ ...formData, animalId: animal._id || "" })
    setAnimals([])
    setSearchAnimal("")
  }

  const addSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()])
      setSymptomInput("")
    }
  }

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter((s) => s !== symptom))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedAnimal) {
      setError("Please select an animal")
      return
    }

    if (symptoms.length === 0) {
      setError("Please add at least one symptom")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/diseases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          symptoms,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Report submission failed")
        setLoading(false)
        return
      }

      router.push("/diseases")
      router.refresh()
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Select Animal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedAnimal ? (
              <div className="space-y-2">
                <Label htmlFor="searchAnimal">Search for Animal</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="searchAnimal"
                    value={searchAnimal}
                    onChange={(e) => setSearchAnimal(e.target.value)}
                    placeholder="Search by ID, owner name, or breed..."
                    className="pl-9"
                  />
                </div>

                {animals.length > 0 && (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 max-h-64 overflow-y-auto">
                    {animals.map((animal) => (
                      <button
                        key={animal._id}
                        type="button"
                        onClick={() => handleAnimalSelect(animal)}
                        className="w-full p-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <p className="font-medium text-slate-900">{animal.animalId}</p>
                        <p className="text-sm text-slate-600">
                          {animal.species} - {animal.breed} | Owner: {animal.ownerName}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{selectedAnimal.animalId}</p>
                    <p className="text-sm text-slate-600">
                      {selectedAnimal.species} - {selectedAnimal.breed}
                    </p>
                    <p className="text-sm text-slate-600">Owner: {selectedAnimal.ownerName}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAnimal(null)
                      setFormData({ ...formData, animalId: "" })
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disease Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diseaseName">Disease Name *</Label>
                <Input
                  id="diseaseName"
                  value={formData.diseaseName}
                  onChange={(e) => setFormData({ ...formData, diseaseName: e.target.value })}
                  placeholder="e.g., Foot and Mouth Disease"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diseaseType">Disease Type *</Label>
                <Select
                  value={formData.diseaseType}
                  onValueChange={(value) => setFormData({ ...formData, diseaseType: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viral">Viral</SelectItem>
                    <SelectItem value="bacterial">Bacterial</SelectItem>
                    <SelectItem value="parasitic">Parasitic</SelectItem>
                    <SelectItem value="fungal">Fungal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms *</Label>
              <div className="flex gap-2">
                <Input
                  id="symptoms"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="Enter a symptom and click Add"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSymptom()
                    }
                  }}
                />
                <Button type="button" onClick={addSymptom} variant="outline">
                  Add
                </Button>
              </div>
              {symptoms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {symptoms.map((symptom) => (
                    <div
                      key={symptom}
                      className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {symptom}
                      <button type="button" onClick={() => removeSymptom(symptom)} className="hover:text-red-600">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosisDate">Diagnosis Date *</Label>
                <Input
                  id="diagnosisDate"
                  type="date"
                  value={formData.diagnosisDate}
                  onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosisMethod">Diagnosis Method *</Label>
              <Input
                id="diagnosisMethod"
                value={formData.diagnosisMethod}
                onChange={(e) => setFormData({ ...formData, diagnosisMethod: e.target.value })}
                placeholder="e.g., Clinical examination, Lab test"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Treatment & Outcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="treatmentProvided">Treatment Provided</Label>
              <Textarea
                id="treatmentProvided"
                value={formData.treatmentProvided}
                onChange={(e) => setFormData({ ...formData, treatmentProvided: e.target.value })}
                placeholder="Describe the treatment administered..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">Current Outcome</Label>
              <Select value={formData.outcome} onValueChange={(value) => setFormData({ ...formData, outcome: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="under_treatment">Under Treatment</SelectItem>
                  <SelectItem value="recovered">Recovered</SelectItem>
                  <SelectItem value="deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outbreak Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOutbreak"
                checked={formData.isOutbreak}
                onCheckedChange={(checked) => setFormData({ ...formData, isOutbreak: checked as boolean })}
              />
              <Label htmlFor="isOutbreak" className="cursor-pointer">
                This is part of an outbreak (multiple animals affected)
              </Label>
            </div>

            {formData.isOutbreak && (
              <div className="space-y-2">
                <Label htmlFor="affectedAnimalsCount">Number of Animals Affected</Label>
                <Input
                  id="affectedAnimalsCount"
                  type="number"
                  min="1"
                  value={formData.affectedAnimalsCount}
                  onChange={(e) => setFormData({ ...formData, affectedAnimalsCount: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </div>
    </form>
  )
}
