const contactLines = [
  { phone: "+234 916 591 6235", whatsapp: "2349165916235" },
  { phone: "+234 903 308 1055", whatsapp: "2349033081055" },
];

export const siteConfig = {
  name: "AJISMART",
  tagline: "Connecting You to Global Markets.",
  services: "Global Sourcing | Procurement | Importation",
  description:
    "AJISMART connects customers and businesses in Nigeria to selected products from international markets, through an online catalogue and bulk procurement services.",
  currency: "NGN",

  hero: {
    headline: "Quality global products, made accessible.",
    subtext:
      "Shop selected products or access bulk procurement services through AJISMART. We connect customers and businesses in Nigeria to products from international markets.",
    // Put an image in /public (e.g. /public/hero.jpg) then set this to "/hero.jpg"
    image: "",
  },

  about: {
    title: "Connecting you to global markets.",
    text: "AJISMART is a global sourcing, procurement and importation brand connecting individuals, entrepreneurs, retailers and businesses in Nigeria to selected products from international markets.",
    image: "",
  },

  // Leave text empty to hide the promo banner
  promo: {
    text: "",
    link: "/marketplace",
  },

  contact: {
    heading: "Customer enquiries and bulk procurement",
    lines: contactLines,
    // Main WhatsApp number, used by the contact form and bulk procurement button
    whatsapp: contactLines[0].whatsapp,
    email: "ajisquarelimited@gmail.com",
    address: "",
  },

  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
  },
};