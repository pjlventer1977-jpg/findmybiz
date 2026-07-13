export const LEAD_WITH_QUOTE_SELECT = `
  *,
  quote_request:quote_requests(
    customer_name,
    customer_email,
    customer_phone,
    service_description,
    budget,
    created_at,
    city:cities(name),
    province:provinces(name)
  )
`;
