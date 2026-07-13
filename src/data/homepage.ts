import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  Car,
  CircleEllipsis,
  GraduationCap,
  Gavel,
  Hammer,
  HeartPulse,
  Home,
  MapPin,
  MessageCircle,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Calendar,
  Inbox,
  LayoutDashboard,
  Mail,
  TrendingUp,
} from "lucide-react";

export const HERO_BACKGROUND_IMAGE = "/hero-johannesburg-skyline.png";

export const POPULAR_SEARCHES = [
  { label: "Plumbers", query: "plumber" },
  { label: "Electricians", query: "electrician" },
  { label: "Painters", query: "painter" },
  { label: "Carpenters", query: "carpenter" },
  { label: "More", query: "" },
] as const;

export const CATEGORY_ICONS: LucideIcon[] = [
  Home,
  Car,
  BriefcaseBusiness,
  Hammer,
  HeartPulse,
  Gavel,
  Sparkles,
  Calendar,
  GraduationCap,
  Truck,
  Scissors,
  CircleEllipsis,
];

export const TRUST_BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Verified Businesses",
    description: "All businesses are verified",
  },
  {
    icon: MessageCircle,
    title: "Get 5 Quotes",
    description: "Compare up to 5 quotes",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Trusted",
    description: "Safe, reliable & transparent",
  },
  {
    icon: MapPin,
    title: "Across South Africa",
    description: "All provinces covered",
  },
] as const;

export const WHY_CHOOSE_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Verified Businesses",
    description:
      "Every business is checked to help build trust and professional service.",
  },
  {
    icon: Star,
    title: "Customer Reviews",
    description: "Read real feedback from local customers before you choose.",
  },
  {
    icon: MessageCircle,
    title: "Get 5 Quotes",
    description: "One request. Five competitive quotes. No hassle.",
  },
  {
    icon: MapPin,
    title: "Near Me Search",
    description: "Find businesses close to your location in seconds.",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Nandi M.",
    location: "Cape Town",
    quote:
      "Found a reliable electrician within 20 minutes. Best platform ever!",
  },
  {
    name: "Mike T.",
    location: "Johannesburg",
    quote:
      "We receive quality leads every week. FindMyBiz has grown our business.",
  },
  {
    name: "Themba K.",
    location: "Durban",
    quote: "The Get 5 Quotes feature is a game changer.",
  },
] as const;

export const BUSINESS_OWNER_BENEFITS = [
  {
    icon: Inbox,
    title: "Leads to Your Inbox",
    description:
      "Receive customer enquiries by email when QuoteMatch routes a lead to you — name, phone, service, and location.",
    featured: true,
  },
  {
    icon: TrendingUp,
    title: "Get 5 Quotes Engine",
    description:
      "One customer request matched to up to 5 verified local businesses — putting you in front of ready-to-buy customers.",
    featured: false,
  },
  {
    icon: LayoutDashboard,
    title: "Lead Dashboard",
    description:
      "Manage all enquiries from Dashboard → Leads. Mark leads as read and track your full lead history.",
    featured: false,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Follow-Up",
    description:
      "Lead details are ready for quick WhatsApp contact so you can respond fast and win the job.",
    featured: false,
  },
  {
    icon: ShieldCheck,
    title: "Verified Listing",
    description:
      "Build trust with customers. Verified businesses stand out in search and lead routing.",
    featured: false,
  },
  {
    icon: Mail,
    title: "Start Free",
    description:
      "List your business for free. Upgrade for more lead credits and priority routing — see plans on Pricing.",
    featured: false,
  },
] as const;

export const SA_PROVINCES = [
  { name: "Gauteng", slug: "gauteng" },
  { name: "Western Cape", slug: "western-cape" },
  { name: "KwaZulu-Natal", slug: "kwazulu-natal" },
  { name: "Eastern Cape", slug: "eastern-cape" },
  { name: "Northern Cape", slug: "northern-cape" },
  { name: "Free State", slug: "free-state" },
  { name: "Limpopo", slug: "limpopo" },
  { name: "Mpumalanga", slug: "mpumalanga" },
  { name: "North West", slug: "north-west" },
] as const;

export const FOOTER_LINKS = {
  find: [
    { label: "All Categories", href: "/search" },
    { label: "Near Me", href: "/search" },
    { label: "Specials", href: "/specials" },
    { label: "Events", href: "/events" },
  ],
  quotes: [
    { label: "How It Works", href: "/get-quotes" },
    { label: "Request a Quote", href: "/get-quotes" },
    { label: "Browse Categories", href: "/search" },
  ],
  about: [
    { label: "About Us", href: "/pricing" },
    { label: "Pricing", href: "/pricing" },
    { label: "New Business", href: "/register" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  support: [
    { label: "Help Centre", href: "/terms" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "POPIA", href: "/popia" },
  ],
} as const;
