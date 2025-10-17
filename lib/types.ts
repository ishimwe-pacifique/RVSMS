export interface Animal {
  _id?: string
  animalId: string
  species: string
  breed: string
  age: number
  sex: "male" | "female"
  color?: string
  identificationMarks?: string
  ownerName: string
  ownerContact: string
  ownerAddress: string
  province: string
  district: string
  sector: string
  cell?: string
  village?: string
  latitude?: number
  longitude?: number
  healthStatus: "healthy" | "sick" | "under_treatment" | "recovered" | "deceased"
  vaccinationHistory?: VaccinationRecord[]
  registeredBy: string
  registeredDate: Date
  lastUpdated: Date
}

export interface VaccinationRecord {
  vaccineName: string
  dateAdministered: Date
  nextDueDate?: Date
  administeredBy: string
}

export interface DiseaseReport {
  _id?: string
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
  diagnosisDate: Date
  diagnosisMethod: string
  treatmentProvided?: string
  outcome?: "recovered" | "under_treatment" | "deceased" | "ongoing"
  location: {
    province: string
    district: string
    sector: string
    cell?: string
    village?: string
    latitude?: number
    longitude?: number
  }
  reportedBy: string
  reportedDate: Date
  isOutbreak: boolean
  affectedAnimalsCount?: number
  notes?: string
}

export interface Province {
  name: string
  districts: District[]
}

export interface District {
  name: string
  sectors: string[]
}
