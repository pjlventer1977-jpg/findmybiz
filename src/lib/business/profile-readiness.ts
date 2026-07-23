import type { BusinessDocument, BusinessDocumentType } from "@/types";

type ReadinessBusiness = {
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  province_id?: string | null;
  city_id?: string | null;
  logo_url?: string | null;
};

export const APPROVAL_FIELD_LABELS = [
  "Business description",
  "Phone number",
  "Email address",
  "Province",
  "City / town",
  "Primary category",
  "Company logo",
] as const;

export const VERIFICATION_DOCUMENT_TYPES: BusinessDocumentType[] = [
  "proof_of_address",
  "id_document",
];

export function getProfileCompleteness(
  business: ReadinessBusiness,
  primaryCategoryId: string | null | undefined,
  hasLogo = Boolean(business.logo_url)
) {
  const missingFields: string[] = [];

  if (!business.description?.trim()) missingFields.push("Business description");
  if (!business.phone?.trim()) missingFields.push("Phone number");
  if (!business.email?.trim()) missingFields.push("Email address");
  if (!business.province_id) missingFields.push("Province");
  if (!business.city_id) missingFields.push("City / town");
  if (!primaryCategoryId) missingFields.push("Primary category");
  if (!hasLogo) missingFields.push("Company logo");

  return { isComplete: missingFields.length === 0, missingFields };
}

export function hasVerificationDocuments(documents: BusinessDocument[]) {
  return VERIFICATION_DOCUMENT_TYPES.every((type) =>
    documents.some((document) => document.document_type === type)
  );
}

export function getMissingVerificationDocuments(documents: BusinessDocument[]) {
  return VERIFICATION_DOCUMENT_TYPES.filter(
    (type) => !documents.some((document) => document.document_type === type)
  );
}

export function canApprove(
  business: ReadinessBusiness,
  primaryCategoryId: string | null | undefined,
  hasLogo = Boolean(business.logo_url)
) {
  return getProfileCompleteness(business, primaryCategoryId, hasLogo).isComplete;
}

export function canVerifiedApprove(
  business: ReadinessBusiness,
  documents: BusinessDocument[],
  primaryCategoryId: string | null | undefined,
  hasLogo = Boolean(business.logo_url)
) {
  return (
    canApprove(business, primaryCategoryId, hasLogo) &&
    hasVerificationDocuments(documents)
  );
}
