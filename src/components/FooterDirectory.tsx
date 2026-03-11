"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdSlot } from "./AdSlot";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
}

const FALLBACK_ABOUT: MenuItem[] = [
  { id: "1", href: "/about", label: "About us", order: 0 },
  { id: "2", href: "/areas-we-serve", label: "Areas we serve", order: 1 },
  { id: "3", href: "/work-with-us", label: "Work with us", order: 2 },
  { id: "4", href: "/products?sort=top", label: "Reviews", order: 3 },
  { id: "5", href: "/contact", label: "Contact", order: 4 },
  { id: "6", href: "/partnerships", label: "Partnerships", order: 5 },
];

const FALLBACK_SERVICES: MenuItem[] = [
  { id: "1", href: "/f/bet-sportsbooks", label: "Sportsbooks", order: 0 },
  { id: "2", href: "/f/bet-casinos", label: "Casinos", order: 1 },
  { id: "3", href: "/f/bet-crypto", label: "Crypto Betting", order: 2 },
  { id: "4", href: "/f/bet-bonuses", label: "Bonuses", order: 3 },
  { id: "5", href: "/products", label: "Top Reviewed", order: 4 },
];

const FALLBACK_PRODUCT: MenuItem[] = [
  { id: "1", href: "/articles", label: "Best Practices & Guides", order: 0 },
  { id: "2", href: "/products?sort=top", label: "Reviews", order: 1 },
];

const FALLBACK_RESOURCES: MenuItem[] = [
  { id: "1", href: "/forums", label: "All Forums", order: 0 },
  { id: "2", href: "/articles", label: "Blog", order: 1 },
  { id: "3", href: "/threads", label: "Threads", order: 2 },
  { id: "4", href: "/products", label: "Products", order: 3 },
  { id: "5", href: "/calculators", label: "Betting Calculators", order: 4 },
];

const FALLBACK_LEGAL: MenuItem[] = [
  { id: "1", href: "/terms", label: "Terms & Conditions", order: 0 },
  { id: "2", href: "/privacy", label: "Privacy Policy", order: 1 },
];

function LogoIcon({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <rect x="6" y="4" width="4" height="3" rx="0.5" fill="#3b82f6" />
        <rect x="6" y="10" width="4" height="3" rx="0.5" fill="#f97316" />
        <rect x="6" y="16" width="4" height="3" rx="0.5" fill="#fbbf24" />
      </svg>
    </div>
  );
}

export function FooterDirectory() {
  const [about, setAbout] = useState<MenuItem[]>(FALLBACK_ABOUT);
  const [services, setServices] = useState<MenuItem[]>(FALLBACK_SERVICES);
  const [product, setProduct] = useState<MenuItem[]>(FALLBACK_PRODUCT);
  const [resources, setResources] = useState<MenuItem[]>(FALLBACK_RESOURCES);
  const [legal, setLegal] = useState<MenuItem[]>(FALLBACK_LEGAL);

  useEffect(() => {
    Promise.all([
      fetch("/api/menus?location=footer_helpful").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/menus?location=footer_services").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/menus?location=footer_information").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/menus?location=footer_legal").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([a, s, i, l]) => {
        if (a?.length) setAbout(a.sort((x: MenuItem, y: MenuItem) => x.order - y.order));
        if (s?.length) setServices(s.sort((x: MenuItem, y: MenuItem) => x.order - y.order));
        if (i?.length) setResources(i.sort((x: MenuItem, y: MenuItem) => x.order - y.order));
        if (l?.length) setLegal(l.sort((x: MenuItem, y: MenuItem) => x.order - y.order));
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Main layout: left nav columns + right ad space */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-12">
          {/* Left: Logo + navigation columns */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <LogoIcon />
              <Link href="/" className="text-xl font-bold text-slate-900">
                Betting Forum
              </Link>
            </div>

            {/* Row 1: About, Services, Product, Resources */}
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">About Betting Forum</h3>
                <ul className="mt-4 space-y-3">
                  {about.map((link) => (
                    <li key={link.id}>
                      <Link href={link.href} className="text-sm text-slate-700 hover:text-felt">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Services</h3>
                <ul className="mt-4 space-y-3">
                  {services.map((link) => (
                    <li key={link.id}>
                      <Link href={link.href} className="text-sm text-slate-700 hover:text-felt">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Product</h3>
                <ul className="mt-4 space-y-3">
                  {product.map((link) => (
                    <li key={link.id}>
                      <Link href={link.href} className="text-sm text-slate-700 hover:text-felt">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Resources</h3>
                <ul className="mt-4 space-y-3">
                  {resources.map((link) => (
                    <li key={link.id}>
                      <Link href={link.href} className="text-sm text-slate-700 hover:text-felt">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Row 2: Legal, Contact */}
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Legal</h3>
                <ul className="mt-4 space-y-3">
                  {legal.map((link) => (
                    <li key={link.id}>
                      <Link href={link.href} className="text-sm text-slate-700 hover:text-felt">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact</h3>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link href="/contact" className="text-sm text-slate-700 hover:text-felt">
                      Contact us
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:hello@bettingforum.com" className="text-sm text-slate-700 hover:text-felt">
                      hello@bettingforum.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:+15519339030" className="text-sm text-slate-700 hover:text-felt">
                      (+1) 561.933.9030
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right: Ad space - dynamic with rotation & click tracking */}
          <div className="shrink-0 lg:w-80 lg:aspect-square">
            <AdSlot slot="footer_right" className="min-h-[200px] w-full lg:min-h-0 lg:h-full" />
          </div>
        </div>

        {/* Copyright row */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-sm text-slate-600">
            Copyright {new Date().getFullYear()} Betting Forum
          </p>
          <p className="text-sm text-slate-600">
            🔥 Made with passion on Planet Earth
          </p>
        </div>

        {/* Affiliate Disclosure row */}
        <div className="mt-6 border-t border-slate-200 pt-6">
          <Link href="/responsible" className="text-sm font-medium text-slate-700 hover:text-felt">
            Responsible Betting
          </Link>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            In compliance with responsible gambling standards, our platform enforces strict regulations to prevent individuals under the age of 21 from participating in any form of gambling. This commitment is reflected prominently on our website, where clear statements outline the prohibition of underage participation and emphasize the legal consequences associated with such actions. Before engaging in any gambling activities, users are required to affirm their legal age, ensuring compliance with regulations and safeguarding against underage involvement.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            To uphold these standards effectively, we conduct regular reviews of our age verification systems, assessing their robustness and updating them as needed to maintain efficacy. Furthermore, our dedication extends to comprehensive staff training, where all relevant team members are equipped with the necessary knowledge and skills to enforce age restrictions consistently. Through these measures, we strive to promote responsible gambling practices, protect vulnerable individuals, and uphold the integrity of our platform.
          </p>
        </div>

        {/* Affiliate Disclosure row */}
        <div className="mt-6 border-t border-slate-200 pt-6">
          <Link href="/affiliate-disclosure" className="text-sm font-medium text-slate-700 hover:text-felt">
            Affiliate Disclosure
          </Link>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            We may earn a commission when you sign up through our links. This does not affect our editorial independence.
          </p>
        </div>
      </div>
    </footer>
  );
}
