
import { Property, UserRole, UserAccount, ChatSession } from './types';

export const MOCK_GUIDES: UserAccount[] = [
  { id: 'g1', name: 'Musa Abubakar', email: 'musa@rentory.com', role: UserRole.TOUR_GUIDE, pin: '0001', status: 'ACTIVE', joinedAt: '2024', rating: 4.9, location: { lat: 9.0765, lng: 7.3986 }, balance: 15000 },
  { id: 'g2', name: 'Emeka Nwosu', email: 'emeka@rentory.com', role: UserRole.TOUR_GUIDE, pin: '0002', status: 'ACTIVE', joinedAt: '2024', rating: 4.8, location: { lat: 6.5244, lng: 3.3792 }, balance: 22000 },
  { id: 'g3', name: 'Tamuno Briggs', email: 'tamuno@rentory.com', role: UserRole.TOUR_GUIDE, pin: '0003', status: 'ACTIVE', joinedAt: '2024', rating: 5.0, location: { lat: 4.8156, lng: 7.0498 }, balance: 8000 },
  { id: 'g4', name: 'Sani Bello', email: 'sani@rentory.com', role: UserRole.TOUR_GUIDE, pin: '0004', status: 'ACTIVE', joinedAt: '2024', rating: 4.7, location: { lat: 10.5105, lng: 7.4165 }, balance: 5000 }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'p1',
    landlordId: 'u2', 
    // Fix: Added missing category property
    category: 'RESIDENTIAL',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
    ],
    title: 'Luxury VI Executive Loft',
    description: 'A masterpiece in Victoria Island. High-end finishes with expansive views of the Atlantic. Rentory Managed for absolute peace of mind.',
    price: 450000,
    address: 'Adetokunbo Ademola, Victoria Island, Lagos',
    features: ['Smart Lock', '24/7 Power', 'Gym', 'Staff Quarters'],
    status: 'ACTIVE',
    contactPreference: 'STAFF_GUIDE',
    assignedGuideId: 'g2',
    rentoryManaged: true,
    isVerified: true,
    availability: 'Daily 9AM-6PM',
    location: { lat: 6.4281, lng: 3.4219 }
  },
  {
    id: 'p2',
    landlordId: 'u2',
    // Fix: Added missing category property
    category: 'RESIDENTIAL',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80'
    ],
    title: 'Maitama Diplomatic Villa',
    description: '4-Bedroom detached villa with pool. Located in the highly secure Gana Street perimeter. Perfect for families or executives.',
    price: 850000,
    address: 'Gana Street, Maitama, Abuja',
    features: ['Pool', 'Security Hub', 'Borehole', 'Study'],
    status: 'ACTIVE',
    contactPreference: 'DIRECT',
    rentoryManaged: false,
    isVerified: true,
    availability: 'Weekends',
    location: { lat: 9.0765, lng: 7.4986 }
  },
  {
    id: 'p3',
    landlordId: 'u4',
    // Fix: Added missing category property
    category: 'RESIDENTIAL',
    images: [
      'https://images.unsplash.com/photo-1536376074432-ad261455be53?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=800&q=80'
    ],
    title: 'PH GRA Tech Studio',
    description: 'Optimized for digital nomads. High-speed fiber internet and silent inverter system already installed.',
    price: 120000,
    address: 'GRA Phase 2, Port Harcourt, Rivers',
    features: ['Fiber Internet', 'Inverter System', 'Security Post'],
    status: 'ACTIVE',
    contactPreference: 'STAFF_GUIDE',
    assignedGuideId: 'g3',
    rentoryManaged: true,
    isVerified: true,
    availability: 'Daily 9AM-5PM',
    location: { lat: 4.8156, lng: 7.0498 }
  }
];

export const MOCK_CHATS: ChatSession[] = [
  {
    id: 'chat_p1_u1',
    propertyId: 'p1',
    propertyTitle: 'Luxury VI Executive Loft',
    tenantId: 'u1',
    landlordId: 'u2',
    assignedGuideId: 'g2',
    messages: [
      { id: 'm1', senderId: 'g2', text: "Hello! I'm Emeka, your Guide for the VI Loft. Would you like to schedule a tour?", timestamp: new Date().toISOString(), isRead: true }
    ],
    lastUpdated: new Date().toISOString()
  }
];

export const PIN_CODES = {
  [UserRole.TENANT]: '1111',
  [UserRole.LANDLORD]: '5555',
  [UserRole.ADMIN]: '1414',
  [UserRole.TOUR_GUIDE]: '0000'
};
