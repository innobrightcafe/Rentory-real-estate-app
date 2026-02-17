# Rentory: Backend Engineering Specification (v1.2)

### 1. System Overview
Rentory is an AI-first real estate marketplace app. The backend must handle high-bandwidth image data, real-time communication, sensitive identity verification (KYC), and complex AI orchestration using the Gemini 3 API series.

**Core Requirements:**
*   **Architecture:** Modular Monolith (Node.js/TypeScript) with a focus on high-concurrency for chat.
*   **Database:** PostgreSQL (Relational) + PostGIS (Geo-spatial searches) + Redis (Cache).
*   **AI Orchestration:** Google Gemini (Flash for speed/Pro for legal/reasoning).
*   **Payments:** Paystack (Webhooks for ₦5,000 Contact Unlocks & Rent Payments).

### 2. Data Schema (Entity Relationship Diagram)

#### 2.1 Users & Authentication
*   **Users:** `id`, `email`, `password_hash`, `pin` (hashed), `role` (Enum: `TENANT`, `LANDLORD`, `GUIDE`, `ADMIN`, `STAFF`), `status` (Enum: `ACTIVE`, `SUSPENDED`, `PENDING`), `created_at`.
*   **Profiles:** `user_id`, `full_name`, `avatar_url`, `phone`, `bio`, `preferences` (JSONB for AI persona/search history).
*   **Staff_Metadata:** `user_id`, `position` (Enum: `COMPLIANCE_OFFICER`, `OPERATIONS_MANAGER`, `FINANCIAL_CONTROLLER`, `SUPPORT_LEAD`).

#### 2.2 Property Engine
*   **Properties:** `id`, `landlord_id`, **`category` (Enum: `RESIDENTIAL`, `COMMERCIAL`, `EVENT_CENTER`, `LAND`, `SHORTLET`)**, `title`, `description`, `neighborhood_description` (AI generated), `price` (Decimal), `address`, `coordinates` (PostGIS), `status` (Enum: `ACTIVE`, `PENDING`, `ARCHIVED`), `is_verified` (Boolean), `rentory_managed` (Boolean).
*   **Land_Details:** `property_id`, `size` (Float), **`unit` (Enum: `SQM`, `PLOTS`, `HECTARES`)**, `dimensions` (String), `zoning` (String).
*   **Property_Ratings:** `property_id`, `security` (int), `power` (int), `neighborhood` (int) — derived from AI audits and tenant reviews.

#### 2.3 Verification & KYC
*   **Verification_Requests:** `id`, `user_id`, `id_image_url`, `face_scan_url`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `role_requested`, `reviewer_id`.
*   **Face_Match_Audit:** Automated service that compares `face_scan_url` against `id_image_url` using Gemini Vision before staff review.

#### 2.4 Leasing & Communication
*   **Chat_Sessions:** `id`, `property_id`, `tenant_id`, `landlord_id`, `assigned_guide_id` (optional), `last_updated`.
*   **Messages:** `id`, `session_id`, `sender_id`, `content`, `is_read`, `is_admin_intervention` (Boolean).
*   **Leases:** `id`, `property_id`, `tenant_id`, `landlord_id`, `content` (Markdown), **`status` (Enum: `DRAFT`, `SIGNED_BY_LANDLORD`, `SIGNED_BY_TENANT`, `PENDING_ADMIN`, `FULLY_SIGNED`)**.

### 3. AI Integration (Gemini API)

#### 3.1 Lifestyle "Concierge"
*   **Model:** `gemini-3-flash-preview`.
*   **Task:** Maintain stateful conversation with tenants to build a high-fidelity "Tenant Persona" (JSON). This persona is used to filter properties by `match_score`.

#### 3.2 Automated Asset Ingestion
*   **Model:** `gemini-3-flash-preview` (Multimodal).
*   **Input:** Multi-image upload (Up to 10 photos).
*   **Output:** Structured property details, amenity list, neighborhood vibe description, and "Suggested Market Price" based on visual cues.

#### 3.3 Legal Architect
*   **Model:** `gemini-3-pro-preview`.
*   **Task:** Generate context-aware lease agreements (Markdown) based on local tenancy laws, property details, and landlord-tenant negotiation points.

### 4. Key API Endpoints

#### 4.1 Onboarding
*   `POST /auth/register`: Receives multipart form (Bio + ID + Face Scan).
*   `POST /auth/login`: PIN-based verification.

#### 4.2 Property Operations
*   `POST /properties/analyze`: Initial AI analysis of property photos.
*   `POST /properties`: Finalize listing (requires Landlord role).
*   `GET /properties/discover`: Returns properties sorted by AI match score.

#### 4.3 Digital Signatures
*   `PATCH /leases/:id/sign`: Updates signature status based on user role.
*   `POST /leases/:id/authorize`: Final Admin/Compliance sign-off.

### 5. Security & Compliance
*   **PII Security:** GCS/S3 buckets for ID images must be private. Use Signed URLs with 60-second TTL.
*   **Access Control:** Tenants are blocked from accessing `landlord_contact_info` via the API unless a `Transaction` record of type `CONTACT_UNLOCK` exists with status `SUCCESS`.
*   **Audit Trail:** Every status change in `Leases` and `Verification_Requests` must record the `actor_id` and `ip_address`.

### 6. Technical Stack
*   **Backend:** Node.js (NestJS) / TypeScript.
*   **Storage:** PostgreSQL (Prisma) + Google Cloud Storage.
*   **Real-time:** Socket.io for sub-200ms message delivery.
*   **Infrastructure:** GCP Cloud Run (Serverless) for automatic scaling during traffic spikes.
