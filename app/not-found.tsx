import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-24 pb-28 text-center">
      <p className="font-script text-3xl text-navy-600">Lost your way?</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold text-navy-950">Page not found</h1>
      <p className="mt-3 text-navy-900/70">The page you&apos;re after doesn&apos;t exist or has moved.</p>
      <Link
        href="/"
        className="focus-ring mt-8 rounded-full bg-navy-700 px-7 py-3.5 font-bold text-white shadow-lg shadow-navy-700/25"
      >
        Back to home
      </Link>
    </section>
  );
}
