
import { UserAccount, Property, Lease, ChatSession, VerificationRequest, UserRole } from '../types';
import { MOCK_PROPERTIES, MOCK_CHATS } from '../constants';

/**
 * Rentory API Service Layer
 * Centralized logic for all data fetching and mutations.
 */
const BASE_URL = '/api'; 

export const apiService = {
    // Auth & Accounts
    async login(pin: string): Promise<UserAccount | null> {
        // Future: return fetch(`${BASE_URL}/auth/login`, { method: 'POST', body: JSON.stringify({ pin }) })...
        return null; // Implementation in App.tsx for demo
    },
    
    async submitVerification(req: VerificationRequest): Promise<void> {
        console.log(`POST ${BASE_URL}/verify`, req);
    },

    // Tenant Services
    async getDiscoveryFeed(preferences: string): Promise<Property[]> {
        // Future: Fetch properties filtered by AI match score from backend
        return MOCK_PROPERTIES;
    },

    async toggleFavorite(propertyId: string): Promise<void> {
        console.log(`POST ${BASE_URL}/favorites/${propertyId}`);
    },

    // Landlord Services
    async getMyProperties(ownerId: string): Promise<Property[]> {
        return MOCK_PROPERTIES.filter(p => p.landlordId === ownerId);
    },

    async upsertProperty(prop: Partial<Property>): Promise<Property> {
        const method = prop.id ? 'PUT' : 'POST';
        console.log(`${method} ${BASE_URL}/properties`, prop);
        return prop as Property;
    },

    // Leasing
    async getLeases(userId: string, role: UserRole): Promise<Lease[]> {
        console.log(`GET ${BASE_URL}/leases?userId=${userId}&role=${role}`);
        return [];
    },

    async signLease(leaseId: string): Promise<void> {
        console.log(`PATCH ${BASE_URL}/leases/${leaseId}/sign`);
    },

    // Payments
    async initiateContactUnlock(propertyId: string): Promise<any> {
        console.log(`POST ${BASE_URL}/payments/unlock`, { propertyId });
        return { amount: 5000, currency: 'NGN' };
    }
};
