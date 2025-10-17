import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, MapPin, Activity } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-600 rounded-full mb-4">
            <Shield className="w-14 h-14 text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 text-balance">
            Rwanda Veterinary Service Management System
          </h1>

          <p className="text-xl text-slate-600 text-pretty max-w-2xl mx-auto leading-relaxed">
            A comprehensive platform for managing animal health, tracking disease outbreaks, and monitoring veterinary
            services across Rwanda
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/login">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
            >
              <Link href="/register">Register as Veterinarian</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Animal Registration</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Register and manage animal records with comprehensive health tracking and vaccination history
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Disease Detection</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Report and track disease cases with detailed symptoms, diagnosis, and treatment information
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Disease Monitoring</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Real-time disease outbreak visualization on interactive maps with analytics and alerts
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
