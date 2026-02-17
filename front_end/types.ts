
export enum UserRole {
  TENANT = 'TENANT',
  LANDLORD = 'LANDLORD',
  ADMIN = 'ADMIN',
  TOUR_GUIDE = 'TOUR_GUIDE',
  STAFF = 'STAFF',
  GUEST = 'GUEST'
}

export type StaffPosition = 
  | 'COMPLIANCE_OFFICER' 
  | 'OPERATIONS_MANAGER' 
  | 'FINANCIAL_CONTROLLER' 
  | 'SUPPORT_LEAD';

export type PropertyCategory = 'RESIDENTIAL' | 'COMMERCIAL' | 'EVENT_CENTER' | 'LAND' | 'SHORTLET';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  preferences?: string;
  favorites?: string[];
  position?: StaffPosition;
  searchHistory?: string[];
}

export interface UserAccount extends User {
  email: string;
  pin: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  joinedAt: string;
  balance?: number;
  rating?: number;
  location?: { lat: number; lng: number };
}

export interface VerificationRequest {
  id: string;
  name: string;
  email: string;
  idImage: string;
  faceScan: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  roleRequested: UserRole;
  timestamp: string;
}

export interface TourRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  status: 'ASSIGNED' | 'COMPLETED' | 'CANCELLED';
  type: 'PROPERTY_TOUR' | 'LANDLORD_VERIFICATION';
  tourMode: 'BASIC' | 'PREMIUM';
  requestedAt: string;
  scheduledDate: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  propertyScore: number;
  landlordScore: number;
  guideScore: number;
  comment: string;
  createdAt: string;
}

export interface Property {
  id: string;
  landlordId: string;
  category: PropertyCategory;
  images: string[];
  title: string;
  description: string;
  neighborhoodDescription?: string;
  nearbyAttractions?: string[];
  price: number;
  address: string;
  features: string[];
  amenities?: string[];
  reviews?: Review[];
  ratings?: {
    security: number;
    power: number;
    neighborhood: number;
  };
  landDetails?: {
    size: number;
    unit: 'SQM' | 'PLOTS' | 'HECTARES';
    dimensions: string;
    zoning: string;
  };
  availability: string;
  status: 'ACTIVE' | 'PENDING' | 'ARCHIVED';
  contactPreference: 'DIRECT' | 'STAFF_GUIDE';
  assignedGuideId?: string;
  rentoryManaged: boolean; 
  isVerified: boolean;
  location?: { lat: number; lng: number };
}

export interface Lease {
  id: string;
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  landlordName: string;
  content: string;
  status: 'DRAFT' | 'SIGNED_BY_LANDLORD' | 'SIGNED_BY_TENANT' | 'PENDING_ADMIN' | 'FULLY_SIGNED';
  createdAt: string;
  tenantSignedAt?: string;
  adminSignature?: string;
  adminSignedAt?: string;
}

export interface ChatSession {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantId: string;
  landlordId: string;
  assignedGuideId?: string;
  messages: any[];
  lastUpdated: string;
}

export interface MatchResult {
  score: number;
  reason: string;
}
