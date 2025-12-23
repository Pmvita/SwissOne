"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { FadeIn, SlideIn } from "@/components/ui/animated";
import { AnimatedLinkButton } from "@/components/ui/animated/AnimatedLinkButton";
import { motion } from "framer-motion";
import Link from "next/link";
import { Briefcase, Building2, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Handle email confirmation callback
    const code = searchParams.get("code");
    if (code) {
      const handleCallback = async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
          router.push("/dashboard");
          router.refresh();
        } else {
          router.push("/login?error=Could not confirm email");
        }
      };
      handleCallback();
      return;
    }

    handleLoadingComplete();
  }, [searchParams, router]);

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <span className="text-xl font-semibold text-primary-900">SwissOne</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#services" className="text-gray-700 hover:text-primary-700 transition-colors">
                Services
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-primary-700 transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-gray-700 hover:text-primary-700 transition-colors">
                Contact
              </Link>
              <AnimatedLinkButton href="/login" variant="outline" size="sm">
                Client Login
              </AnimatedLinkButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50 pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn delay={0.1}>
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6"
                >
                  Swiss Private Banking Excellence
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Your Wealth,
                  <br />
                  <span className="text-primary-700">Managed with Precision</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Experience the highest standards of Swiss private banking. Secure, 
                  personalized wealth management services tailored to your unique needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <SlideIn direction="right" delay={0.3}>
                    <AnimatedLinkButton href="/signup" variant="primary" size="lg">
                      Begin Your Journey
                    </AnimatedLinkButton>
                  </SlideIn>
                  <SlideIn direction="left" delay={0.4}>
                    <AnimatedLinkButton href="/login" variant="outline" size="lg">
                      Existing Client
                    </AnimatedLinkButton>
                  </SlideIn>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.5}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-accent-200 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <Logo size="xl" className="mx-auto mb-6" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Security Level</span>
                      <span className="text-primary-700 font-semibold">Bank-Grade</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Privacy</span>
                      <span className="text-primary-700 font-semibold">Swiss Standards</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Compliance</span>
                      <span className="text-primary-700 font-semibold">FINMA Regulated</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.1}>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Comprehensive Private Banking Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tailored solutions for your wealth management needs
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Wealth Management",
                description: "Expert portfolio management and investment advisory services designed to grow and preserve your wealth.",
                icon: Briefcase,
                color: "text-primary-600",
              },
              {
                title: "Private Banking",
                description: "Exclusive banking services with dedicated relationship managers and personalized financial solutions.",
                icon: Building2,
                color: "text-primary-600",
              },
              {
                title: "Investment Advisory",
                description: "Strategic investment guidance backed by comprehensive market analysis and risk assessment.",
                icon: TrendingUp,
                color: "text-primary-600",
              },
            ].map((service, index) => {
              const IconComponent = service.icon;
              return (
                <FadeIn key={service.title} delay={0.2 + index * 0.1}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow"
                  >
                    <div className="mb-4">
                      <IconComponent className={`w-10 h-10 ${service.color}`} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </motion.div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeIn delay={0.1}>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Built on Swiss Banking Excellence
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  For over a century, Swiss banking has been synonymous with security, 
                  discretion, and financial expertise. We carry forward these traditions 
                  with modern technology and innovative solutions.
                </p>
                <div className="space-y-4">
                  {[
                    "FINMA Regulated & Licensed",
                    "Bank-Grade Security & Encryption",
                    "Swiss Privacy Standards",
                    "24/7 Account Monitoring",
                  ].map((feature, index) => (
                    <SlideIn key={feature} direction="left" delay={0.2 + index * 0.1}>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    </SlideIn>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="bg-primary-900 rounded-3xl p-12 text-white">
                <div className="space-y-8">
                  <div>
                    <div className="text-5xl font-bold mb-2">200+</div>
                    <div className="text-primary-200">Years of Combined Expertise</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold mb-2">50+</div>
                    <div className="text-primary-200">Countries Served</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold mb-2">99.9%</div>
                    <div className="text-primary-200">Uptime Guarantee</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-900 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Begin Your Private Banking Journey?
            </h2>
            <p className="text-xl text-primary-100 mb-10">
              Join our exclusive community of clients who trust SwissOne with their wealth management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AnimatedLinkButton href="/signup" variant="secondary" size="lg">
                Open an Account
              </AnimatedLinkButton>
              <AnimatedLinkButton href="/login" variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Access Your Account
              </AnimatedLinkButton>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo size="sm" />
                <span className="text-white font-semibold">SwissOne</span>
              </div>
              <p className="text-sm">
                Swiss private banking excellence for the modern era.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#services" className="hover:text-white transition-colors">Wealth Management</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors">Private Banking</Link></li>
                <li><Link href="#services" className="hover:text-white transition-colors">Investment Advisory</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SwissOne. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
