# Rwanda Veterinary Service Management System (RVSMS)

A comprehensive web application for managing animal health records, tracking disease outbreaks, and monitoring veterinary services across Rwanda.

## Features

### 1. Authentication & User Management
- Secure JWT-based authentication
- Role-based access control (Veterinarian, Administrator)
- Location-based user assignment (Province, District, Sector)

### 2. Animal Registration Module
- Register animals with comprehensive details (species, breed, age, sex, owner information)
- Track animal health status (healthy, sick, under treatment, recovered, deceased)
- Vaccination history management
- Location tracking with GPS coordinates
- Search and filter animals by multiple criteria

### 3. Disease Detection Module
- Report disease cases linked to registered animals
- Document symptoms, diagnosis methods, and treatments
- Track disease severity (mild, moderate, severe, critical)
- Mark outbreak cases affecting multiple animals
- Update animal health status automatically

### 4. Disease Monitoring Map
- Interactive map visualization using Leaflet
- Color-coded markers based on disease severity
- Filter by disease type, severity, location, and date range
- Real-time outbreak alerts
- Click markers for detailed case information
- Statistics dashboard with disease distribution analytics

### 5. Analytics Dashboard
- Real-time statistics on animals and diseases
- Visual charts and graphs:
  - Disease trends over time (line chart)
  - Animals by species distribution (pie chart)
  - Top 5 diseases (bar chart)
  - Diseases by severity (bar chart)
- Recent activity feed
- Quick action buttons for common tasks

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB
- **Authentication**: JWT with jose
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Maps**: Leaflet
- **Charts**: Recharts
- **Password Hashing**: bcryptjs

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
\`\`\`

## Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables (see above)

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Users Collection
- email, password (hashed), name, role
- province, district, sector (location assignment)
- createdAt

### Animals Collection
- animalId (unique), species, breed, age, sex
- owner information (name, contact, address)
- location (province, district, sector, cell, village, coordinates)
- healthStatus, vaccinationHistory
- registeredBy, registeredDate, lastUpdated

### Diseases Collection
- reportId (unique), animalId, animalDetails
- diseaseName, diseaseType, symptoms, severity
- diagnosisDate, diagnosisMethod, treatmentProvided, outcome
- location (with coordinates), reportedBy, reportedDate
- isOutbreak, affectedAnimalsCount, notes

## User Roles

### Veterinarian
- Register and manage animals in assigned sector
- Report disease cases
- View animals and diseases in assigned sector
- Access monitoring map and analytics

### Administrator
- Full system access
- View all animals and diseases across Rwanda
- System-wide analytics and reporting

## Key Features by Module

### Animal Registration
- Comprehensive animal profile with owner details
- Rwanda location hierarchy (Province → District → Sector → Cell → Village)
- GPS coordinate tracking
- Health status management
- Vaccination record keeping

### Disease Detection
- Link disease reports to registered animals
- Multiple symptom tracking
- Severity classification
- Treatment documentation
- Outbreak flagging with affected animal count

### Monitoring Map
- Interactive Leaflet map centered on Rwanda
- Color-coded severity indicators:
  - Yellow: Mild
  - Orange: Moderate
  - Red: Severe
  - Dark Red: Critical
- Larger markers with "!" for outbreaks
- Advanced filtering options
- Statistics sidebar with distribution charts

### Analytics Dashboard
- Key metrics cards (total animals, diseases, outbreaks)
- Visual trend analysis
- Species and disease type distribution
- Recent activity feeds
- Quick action shortcuts

## Security Features

- HTTP-only cookies for JWT tokens
- Password hashing with bcrypt
- Protected API routes with authentication middleware
- Role-based data filtering
- Secure MongoDB queries

## Deployment

The application is ready for deployment on Vercel:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Support

For issues or questions, please contact the system administrator.

## License

Proprietary - Rwanda Veterinary Service Management System
