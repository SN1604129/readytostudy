export type Testimonial = {
  name: string;
  course: string;
  institution: string;
  quote: string;
  image: string;
};

// Real students, real photos, real quotes — do not replace with stock content.
export const testimonials: Testimonial[] = [
  {
    name: "Henry Joy",
    course: "Bachelor of Early Childhood Education and Care",
    institution: "TAFE NSW",
    quote:
      "Thanks to Ready to Study for their excellent guidance and cooperation. They made my study abroad journey smooth and successful.",
    image: "/images/testimonial-henry-tafe.jpg",
  },
  {
    name: "Alok Biswas",
    course: "Bachelor of Cyber Security",
    institution: "Torrens University Australia",
    quote:
      "Had a great experience with Ready to Study! Their guidance and continuous support made my journey simple and successful.",
    image: "/images/testimonial-alok-torrens.jpg",
  },
  {
    name: "Mhafuza Akter Shithil",
    course: "Master of Public Health",
    institution: "CQ University",
    quote:
      "I couldn't believe how easy the whole process felt with Ready To Study by my side.",
    image: "/images/testimonial-mhafuza-cqu.jpg",
  },
];
