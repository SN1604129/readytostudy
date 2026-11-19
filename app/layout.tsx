import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChatWidget } from "@/components/chat/chat-widget";
import { AdvisorProvider } from "@/components/chat/advisor-provider";
import { VirtualStudentPassport } from "@/components/virtual-student-passport";
import { RevealScript } from "@/components/reveal-script";
import { getCmsDestinations } from "@/lib/cms-destinations";
import { JourneyProvider } from "@/lib/journey";
import { site } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: {
    default: "Ready to Study — Study Abroad from Bangladesh, at Zero Cost",
    template: "%s | Ready to Study",
  },
  description:
    "Sydney-based education consultancy helping Bangladeshi students study abroad — course selection, admissions, scholarships and visas, free for students.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Ready to Study",
    title: "Ready to Study — Study Abroad from Bangladesh, at Zero Cost",
    description:
      "Sydney and Dhaka education counsellors helping Bangladeshi students compare destinations, courses, budgets and documents.",
    images: [
      {
        url: "/images/abstract-gold-navy.png",
        width: 1536,
        height: 1024,
        alt: "Ready to Study education consultancy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ready to Study — Study Abroad from Bangladesh",
    description: "Free study abroad counselling from Sydney and Dhaka.",
    images: ["/images/abstract-gold-navy.png"],
  },
  icons: {
    icon: "/icon.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const destinations = await getCmsDestinations();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: site.name,
    url: `https://${site.domain}`,
    email: site.email,
    telephone: site.phones[0],
    areaServed: ["Bangladesh", "Australia"],
    address: site.offices.map((office) => ({
      "@type": "PostalAddress",
      name: office.label,
      streetAddress: office.address,
      telephone: office.phone,
    })),
  };

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="focus-ring sr-only z-[60] rounded-lg bg-white px-4 py-2 font-semibold text-navy-800 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <RevealScript />
        <JourneyProvider>
          <AdvisorProvider destinations={destinations}>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <VirtualStudentPassport destinations={destinations} />
          <ChatWidget />
          </AdvisorProvider>
        </JourneyProvider>
      </body>
    </html>
  );
}
