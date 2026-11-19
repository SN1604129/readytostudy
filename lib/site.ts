import { offices, contactEmail, websiteDomain } from "./offices";

export const site = {
  name: "Ready to Study",
  tagline: "Education Services",
  domain: websiteDomain,
  email: contactEmail,
  phones: ["+61 426 243 477", "+880 1920 515157"],
  offices: offices.map((o) => ({
    label: o.label,
    address: o.addressLines.join(", "),
    phone: o.phones[0],
  })),
  founder: {
    name: "Mashfi Rahman",
    quote:
      "We simplify your study abroad journey by providing reliable guidance and accurate information.",
  },
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/pte-ielts-support", label: "PTE & IELTS Support" },
  { href: "/events", label: "Events" },
  { href: "/destinations", label: "Destinations" },
  { href: "/course-finder", label: "Course Finder" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
];
