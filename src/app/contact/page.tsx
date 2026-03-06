import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await buildMetadata("/contact", {
    title: "Contact Us – Betting Forum",
    description: "Get in touch with the Betting Forum team. Email, phone, and contact form.",
  });
  return {
    title: meta.title,
    description: meta.description,
    openGraph: meta.openGraph,
    twitter: meta.twitter,
    alternates: meta.alternates,
  };
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
      <p className="mt-2 text-slate-600">
        We&apos;d love to hear from you. Reach out with questions, feedback, or partnership inquiries.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Email</h2>
          <a
            href="mailto:hello@bettingforum.com"
            className="mt-2 block text-felt hover:underline"
          >
            hello@bettingforum.com
          </a>
          <p className="mt-1 text-sm text-slate-500">
            We typically respond within 24–48 hours.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Phone</h2>
          <a
            href="tel:+15519339030"
            className="mt-2 block text-felt hover:underline"
          >
            (+1) 561.933.9030
          </a>
          <p className="mt-1 text-sm text-slate-500">
            Mon–Fri, 9am–5pm EST
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Quick Links</h2>
        <ul className="mt-4 space-y-2">
          <li>
            <Link href="/about" className="text-felt hover:underline">
              About us
            </Link>
          </li>
          <li>
            <Link href="/partnerships" className="text-felt hover:underline">
              Partnerships
            </Link>
          </li>
          <li>
            <Link href="/work-with-us" className="text-felt hover:underline">
              Work with us
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
