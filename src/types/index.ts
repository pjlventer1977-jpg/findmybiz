export type MembershipTier = "free" | "starter" | "professional" | "enterprise";
export type BusinessStatus = "pending" | "approved" | "rejected" | "suspended";
export type LeadStatus = "new" | "viewed" | "contacted" | "closed" | "expired";
export type ModerationStatus = "pending" | "approved" | "rejected";
export type UserRole = "visitor" | "business_owner" | "admin";

export interface Province {
  id: string;
  name: string;
  slug: string;
  code: string;
}

export interface District {
  id: string;
  province_id: string;
  name: string;
  slug: string;
  code?: string;
}

export interface City {
  id: string;
  district_id?: string;
  province_id: string;
  name: string;
  slug: string;
  is_metro?: boolean;
}

export interface Suburb {
  id: string;
  city_id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  parent_id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sort_order?: number;
  children?: Category[];
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  trading_name?: string;
  slug: string;
  description?: string;
  contact_person?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  address?: string;
  province_id: string;
  district_id?: string;
  city_id: string;
  suburb_id?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  membership_tier: MembershipTier;
  status: BusinessStatus;
  is_verified: boolean;
  is_featured: boolean;
  is_local_champion: boolean;
  biz_trust_score: number;
  profile_views: number;
  search_appearances: number;
  lead_response_rate: number;
  email_verified: boolean;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  province?: Province;
  city?: City;
  suburb?: Suburb;
  categories?: Category[];
}

export type BusinessDocumentType = "proof_of_address" | "id_document" | "cipc";

export interface BusinessDocument {
  id: string;
  business_id: string;
  document_type: BusinessDocumentType;
  file_url: string;
  file_name?: string;
  verified: boolean;
  uploaded_at: string;
}

export interface Lead {
  id: string;
  quote_request_id: string;
  business_id: string;
  status: LeadStatus;
  credit_deducted: boolean;
  whatsapp_clicked: boolean;
  viewed_at?: string;
  contacted_at?: string;
  created_at: string;
  quote_request?: QuoteRequest;
}

export interface QuoteRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  province_id: string;
  city_id: string;
  category_id: string;
  service_description: string;
  budget?: string;
  photo_urls?: string[];
  popia_consent: boolean;
  status: string;
  created_at: string;
  province?: Province;
  city?: City;
  category?: Category;
}

export interface Review {
  id: string;
  business_id: string;
  reviewer_name: string;
  rating: number;
  comment?: string;
  status: ModerationStatus;
  created_at: string;
}

export interface Special {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  image_url?: string;
  start_date: string;
  expiry_date: string;
  status: ModerationStatus;
  created_at: string;
  business?: Business;
}

export interface Event {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner_url?: string;
  event_date: string;
  end_date?: string;
  venue?: string;
  province_id?: string;
  city_id?: string;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  ticket_link?: string;
  category?: string;
  status: ModerationStatus;
  created_at: string;
  business?: Business;
  province?: Province;
  city?: City;
}

export interface LeadCredits {
  id: string;
  business_id: string;
  balance: number;
  monthly_allocation: number;
  last_reset_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
}

export interface BizTrustInput {
  emailVerified: boolean;
  hasLogo: boolean;
  hasProofOfAddress: boolean;
  hasIdDocument: boolean;
  hasCipcDocument: boolean;
  profileCompleteness: number;
  averageRating: number;
  reviewCount: number;
  leadResponseRate: number;
  daysSinceApproval: number;
}
