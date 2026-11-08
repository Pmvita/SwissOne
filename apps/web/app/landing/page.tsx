"use client";

import { Logo } from "@/components/ui/Logo";
import { FadeIn, SlideIn } from "@/components/ui/animated";
import { AnimatedLinkButton } from "@/components/ui/animated/AnimatedLinkButton";
import Link from "next/link";

function MountainSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 320V180L180 90L340 160L520 40L700 140L880 20L1040 120L1200 60L1440 150V320H0Z"
        fill="rgba(11,18,32,0.35)"
      />
      <path
        d="M0 320V220L220 140L400 200L580 100L760 180L960 80L1140 160L1320 110L1440 180V320H0Z"
        fill="rgba(11,18,32,0.22)"
      />
      <path
        d="M0 320V260L300 200L500 250L720 180L920 240L1100 200L1300 250L1440 220V320H0Z"
        fill="rgba(11,18,32,0.14)"
      />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-snow">
      <nav className="absolute top-0 inset-x-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/landing" className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="font-display text-2xl tracking-wide text-snow">SwissOne</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#services" className="text-sm text-glacier/90 hover:text-snow transition-colors">
                Services
              </Link>
              <Link href="#about" className="text-sm text-glacier/90 hover:text-snow transition-colors">
                About
              </Link>
              <AnimatedLinkButton href="/login" variant="outline" size="sm" className="border-snow/40 text-snow hover:bg-snow/10">
                Client Login
              </AnimatedLinkButton>
            </div>
            <div className="md:hidden">
              <AnimatedLinkButton href="/login" variant="outline" size="sm" className="border-snow/40 text-snow hover:bg-snow/10">
                Login
              </AnimatedLinkButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Full-bleed alpine hero — brand first, one headline, one sentence, CTA */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden alpine-hero">
        <MountainSilhouette className="absolute bottom-0 inset-x-0 w-full h-[42%] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-snow via-transparent to-transparent opacity-90 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24 pt-32">
          <FadeIn delay={0.05} duration={0.7}>
            <p className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-snow tracking-tight mb-6 drop-shadow-sm">
              SwissOne
            </p>
          </FadeIn>

          <FadeIn delay={0.2} duration={0.65}>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-glacier font-medium max-w-xl leading-snug mb-4">
              Private wealth, held with alpine precision.
            </h1>
          </FadeIn>

          <FadeIn delay={0.32} duration={0.6}>
            <p className="text-base sm:text-lg text-glacier/85 max-w-md mb-10 leading-relaxed font-sans">
              Discreet banking and portfolio stewardship for clients who expect Swiss standards—without the noise.
            </p>
          </FadeIn>

          <SlideIn direction="up" delay={0.42}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <AnimatedLinkButton href="/signup" variant="primary" size="lg">
                Begin
              </AnimatedLinkButton>
              <AnimatedLinkButton
                href="/login"
                variant="outline"
                size="lg"
                className="border-ink/20 text-ink bg-snow/80 hover:bg-snow"
              >
                Existing Client
              </AnimatedLinkButton>
            </div>
          </SlideIn>
        </div>
      </section>

      {/* Services — one job, expressive type, no icon-card soup */}
      <section id="services" className="py-28 bg-snow border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.05}>
            <p className="text-brass text-sm font-medium tracking-[0.2em] uppercase mb-4">Services</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink max-w-2xl leading-tight mb-16">
              Three disciplines. One relationship.
            </h2>
          </FadeIn>

          <div className="divide-y divide-line">
            {[
              {
                title: "Wealth Management",
                description:
                  "Portfolio construction and preservation designed around your horizon, not a product shelf.",
              },
              {
                title: "Private Banking",
                description:
                  "Dedicated coverage, settled liquidity, and the operational quiet of a Swiss house.",
              },
              {
                title: "Investment Advisory",
                description:
                  "Clear views on risk, allocation, and opportunity—measured, not marketed.",
              },
            ].map((service, index) => (
              <FadeIn key={service.title} delay={0.1 + index * 0.08}>
                <div className="grid md:grid-cols-12 gap-4 md:gap-8 py-10">
                  <span className="md:col-span-1 font-display text-brass text-xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="md:col-span-4 font-display text-2xl md:text-3xl text-ink">
                    {service.title}
                  </h3>
                  <p className="md:col-span-7 text-slate text-lg leading-relaxed max-w-xl">
                    {service.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-28 alpine-mist border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.05}>
            <div className="max-w-2xl">
              <p className="text-brass text-sm font-medium tracking-[0.2em] uppercase mb-4">About</p>
              <h2 className="font-display text-4xl md:text-5xl text-ink leading-tight mb-6">
                Built on Swiss banking standards.
              </h2>
              <p className="text-lg text-slate leading-relaxed mb-10">
                Security, discretion, and long-horizon stewardship—carried forward with modern infrastructure,
                not gimmicks. FINMA-aligned processes, bank-grade encryption, and continuous monitoring.
              </p>
              <ul className="space-y-3 text-ink">
                {[
                  "FINMA-aligned & licensed posture",
                  "Bank-grade security & encryption",
                  "Swiss privacy standards",
                  "Continuous account monitoring",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-alpine flex-shrink-0" />
                    <span className="text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-24 bg-ink">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0.05}>
            <h2 className="font-display text-3xl md:text-5xl text-snow mb-5 leading-tight">
              Ready when you are.
            </h2>
            <p className="text-glacier/80 text-lg mb-10 max-w-lg mx-auto">
              Open a relationship, or return to your existing account.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <AnimatedLinkButton href="/signup" variant="primary" size="lg">
                Open an Account
              </AnimatedLinkButton>
              <AnimatedLinkButton
                href="/login"
                variant="outline"
                size="lg"
                className="border-snow/30 text-snow hover:bg-snow/10"
              >
                Access Your Account
              </AnimatedLinkButton>
            </div>
          </FadeIn>
        </div>
      </section>

      <footer className="bg-ink border-t border-slate/40 text-glacier/60 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Logo size="sm" />
                <span className="font-display text-xl text-snow">SwissOne</span>
              </div>
              <p className="text-sm max-w-xs">Private banking for the modern alpine standard.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="text-snow font-medium mb-3">Services</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#services" className="hover:text-snow transition-colors">
                      Wealth Management
                    </Link>
                  </li>
                  <li>
                    <Link href="#services" className="hover:text-snow transition-colors">
                      Private Banking
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-snow font-medium mb-3">Company</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="#about" className="hover:text-snow transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-snow transition-colors">
                      Client Login
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-snow font-medium mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li>
                    <span className="cursor-default">Privacy</span>
                  </li>
                  <li>
                    <span className="cursor-default">Terms</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate/30 mt-10 pt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SwissOne. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
