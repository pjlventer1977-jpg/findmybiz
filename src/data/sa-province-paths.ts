export interface SaProvincePath {
  slug: string;
  name: string;
  d: string;
}

/** SVG paths calibrated to /sa-provinces-map.png (viewBox 0 0 1024 682). */
export const SA_PROVINCE_PATHS: SaProvincePath[] = [
  {
    slug: "limpopo",
    name: "Limpopo",
    d: "M 372,48 918,42 968,118 902,158 655,168 418,142 358,88 Z",
  },
  {
    slug: "mpumalanga",
    name: "Mpumalanga",
    d: "M 655,168 902,158 968,118 998,228 952,312 828,322 702,288 662,218 Z",
  },
  {
    slug: "gauteng",
    name: "Gauteng",
    d: "M 528,238 598,232 604,276 532,282 Z",
  },
  {
    slug: "north-west",
    name: "North West",
    d: "M 268,128 418,142 448,222 418,302 298,312 218,252 236,168 Z",
  },
  {
    slug: "northern-cape",
    name: "Northern Cape",
    d: "M 42,118 268,128 298,312 318,452 276,582 118,622 36,502 26,352 38,198 Z",
  },
  {
    slug: "free-state",
    name: "Free State",
    d: "M 418,302 528,292 598,322 618,402 578,462 478,472 398,432 378,362 Z M 512,358 592,352 598,412 518,418 Z",
  },
  {
    slug: "kwazulu-natal",
    name: "KwaZulu-Natal",
    d: "M 702,288 828,322 952,312 998,228 988,388 948,488 848,528 718,508 658,402 678,332 Z",
  },
  {
    slug: "eastern-cape",
    name: "Eastern Cape",
    d: "M 398,432 578,462 718,508 698,588 548,648 378,628 318,528 Z",
  },
  {
    slug: "western-cape",
    name: "Western Cape",
    d: "M 118,622 276,582 378,628 358,662 248,676 128,656 78,642 Z",
  },
];
