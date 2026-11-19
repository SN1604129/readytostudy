import { CountUp } from "@/components/count-up";
import { destinations as defaults, type Destination } from "@/lib/destinations";
import { services } from "@/lib/services";

// Counts are DERIVED from the data files — add or remove a destination or
// service and every number on the site updates. Never hardcode a count.
export function Stats({ destinations = defaults }: { destinations?: Destination[] }) {
  const stats = [
    { to: destinations.length, label: "Study destinations" },
    { to: services.length, label: "Services, end to end" },
    { to: 2, label: "Offices — Sydney & Dhaka" },
    { to: 100, suffix: "%", label: "Free for students" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-navy-100">
          <dt className="order-2 mt-1 text-sm font-medium text-navy-900/70">{s.label}</dt>
          <dd className="font-display text-4xl font-extrabold text-navy-700">
            <CountUp to={s.to} suffix={s.suffix} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
