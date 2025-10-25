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
  diseaseHistory?: string[]
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

export interface User {
  id: string
  email: string
  name: string
  role: "veterinarian" | "admin" | "super_admin"
  sector?: string
  district?: string
  province?: string
  permissions?: string[]
}

export interface AnalyticsData {
  totalAnimals: number
  totalDiseases: number
  activeOutbreaks: number
  provinceStats: ProvinceStats[]
  diseasesByLocation: LocationDiseaseStats[]
  animalsByLocation: LocationAnimalStats[]
  trends: TrendData[]
}

export interface ProvinceStats {
  province: string
  totalAnimals: number
  healthyAnimals: number
  sickAnimals: number
  totalDiseases: number
  activeOutbreaks: number
  districts: DistrictStats[]
}

export interface DistrictStats {
  district: string
  totalAnimals: number
  healthyAnimals: number
  sickAnimals: number
  totalDiseases: number
  activeOutbreaks: number
  sectors: SectorStats[]
}

export interface SectorStats {
  sector: string
  totalAnimals: number
  healthyAnimals: number
  sickAnimals: number
  totalDiseases: number
  activeOutbreaks: number
  commonDiseases: string[]
}

export interface LocationDiseaseStats {
  province: string
  district: string
  sector: string
  diseaseCount: number
  commonDiseases: { name: string; count: number }[]
  severity: { mild: number; moderate: number; severe: number; critical: number }
}

export interface LocationAnimalStats {
  province: string
  district: string
  sector: string
  animalCount: number
  species: { name: string; count: number }[]
  healthStatus: { healthy: number; sick: number; under_treatment: number; recovered: number; deceased: number }
}

export interface TrendData {
  date: string
  animals: number
  diseases: number
  outbreaks: number
}
