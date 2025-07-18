"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wand2 } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export default function LandingPage() {
  const mainRef = useRef(null)
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enhanced hero animations with stagger
      const tl = gsap.timeline()
      tl.from(".hero-title", {
        duration: 1.2,
        y: 100,
        opacity: 0,
        ease: "power3.out",
        delay: 0.3,
      })
        .from(
          ".hero-subtitle",
          {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: "power3.out",
          },
          "-=0.5",
        )
        .from(
          ".hero-cta",
          {
            duration: 0.8,
            y: 30,
            opacity: 0,
            ease: "power3.out",
          },
          "-=0.3",
        )

      // Parallax effect for hero background
      gsap.to(".hero-bg", {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })

      // Enhanced section animations
      const sections = gsap.utils.toArray(".animated-section")
      sections.forEach((section: any) => {
        gsap.fromTo(
          section,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        )
      })

      // Service cards stagger animation
      gsap.fromTo(
        ".service-card",
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".services-grid",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      )

      // Step items animation
      gsap.fromTo(
        ".step-item",
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: ".steps-container",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      )

      // Hover animations for service cards
      const serviceCards = document.querySelectorAll(".service-card")
      serviceCards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.05,
            y: -10,
            duration: 0.3,
            ease: "power2.out",
            boxShadow: "0 20px 40px rgba(139, 111, 71, 0.15)",
          })
        })
        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          })
        })
      })

      // Image reveal animations
      gsap.fromTo(
        ".reveal-image",
        { scale: 1.2, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".reveal-image",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, mainRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F1EB] font-sans" ref={mainRef}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5F1EB]/90 backdrop-blur-sm border-b border-[#D4C4B0]/20">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#8B6F47]">Style AI</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-light text-[#8B6F47] transition-colors hover:text-[#6B5537]">
              About
            </a>
            <a href="#services" className="text-sm font-light text-[#8B6F47] transition-colors hover:text-[#6B5537]">
              Services
            </a>
            <a href="#access" className="text-sm font-light text-[#8B6F47] transition-colors hover:text-[#6B5537]">
              How It Works
            </a>
          </nav>
          <Link href="/studio">
            <Button className="bg-[#8B6F47] hover:bg-[#6B5537] text-white font-light">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="mt-20 flex-grow">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative flex h-[80vh] items-center justify-center text-center text-white overflow-hidden"
        >
          <div className="hero-bg absolute inset-0 z-0">
            <Image
              src="https://placehold.co/1600x900.png"
              data-ai-hint="elegant fashion woman"
              alt="Stylish woman"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="relative z-10 max-w-4xl px-6">
            <h1 className="hero-title font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
              I am here to guide you
              <br />
              <span className="italic">to create magic</span>
              <br />
              in the colour space.
            </h1>
            <p className="hero-subtitle text-xl md:text-2xl font-light opacity-90 mb-8">
              Unlock your personal style with the power of AI.
            </p>
            <Link href="/studio" className="hero-cta inline-block">
              <Button size="lg" className="bg-[#8B6F47] hover:bg-[#6B5537] text-white px-8 py-3 text-lg font-light">
                Discover Your Style
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 md:py-32 animated-section bg-white">
          <div className="container mx-auto grid grid-cols-1 items-center gap-16 px-6 md:grid-cols-2">
            <div className="space-y-6">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#8B6F47]">About Style AI</h2>
              <p className="text-lg text-[#6B5537] font-light leading-relaxed">
                We believe that fashion is a form of self-expression. Our mission is to empower you to discover and
                embrace your unique style with confidence. We combine cutting-edge AI technology with fashion expertise
                to provide personalized guidance, making style accessible to everyone.
              </p>
              <p className="text-[#6B5537] font-light leading-relaxed">
                Whether you're looking to refine your wardrobe, understand what colors and shapes suit you best, or stay
                on top of trends, Style AI is your personal stylist, available anytime, anywhere.
              </p>
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-serif text-[#8B6F47] mb-2">10K+</div>
                  <div className="text-sm text-[#6B5537] font-light">STYLE ANALYSES</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif text-[#8B6F47] mb-2">95%</div>
                  <div className="text-sm text-[#6B5537] font-light">SATISFACTION</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-serif text-[#8B6F47] mb-2">24/7</div>
                  <div className="text-sm text-[#6B5537] font-light">AVAILABLE</div>
                </div>
              </div>
            </div>
            <div>
              <Image
                src="https://placehold.co/600x700.png"
                data-ai-hint="fashion designer sketch"
                alt="Fashion sketches"
                width={600}
                height={700}
                className="reveal-image rounded-lg object-cover shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="bg-[#F5F1EB] py-20 md:py-32 animated-section">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#8B6F47] mb-6">Our Services</h2>
            <p className="mx-auto max-w-2xl text-lg text-[#6B5537] font-light leading-relaxed mb-16">
              We offer a suite of AI-powered tools designed to be your ultimate fashion companion.
            </p>
            <div className="services-grid grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <ServiceCard
                title="Outfit Recommender"
                description="Get outfit suggestions based on your body type, color palette, and personal style."
              />
              <ServiceCard
                title="Body & Color Analysis"
                description="Discover your body shape and skin undertone by simply uploading a photo."
              />
              <ServiceCard
                title="Trend Finder"
                description="Upload an outfit photo to identify the latest trending items."
              />
              <ServiceCard
                title="Find Similar Items"
                description="Love an outfit? We'll find similar pieces on popular shopping platforms."
              />
            </div>
          </div>
        </section>

        {/* How to Access Section */}
        <section id="access" className="py-20 md:py-32 animated-section bg-white">
          <div className="container mx-auto grid grid-cols-1 items-center gap-16 px-6 md:grid-cols-2">
            <div>
              <Image
                src="https://placehold.co/600x700.png"
                data-ai-hint="woman using laptop"
                alt="Woman using Style AI"
                width={600}
                height={700}
                className="reveal-image rounded-lg object-cover shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#8B6F47]">How It Works</h2>
              <p className="text-lg text-[#6B5537] font-light leading-relaxed">
                Getting started with your style journey is simple and intuitive.
              </p>
              <div className="steps-container space-y-6">
                <Step
                  num="1"
                  title="Enter the Studio"
                  description="Click 'Get Started' to access our suite of AI styling tools. No sign-up required to get started."
                />
                <Step
                  num="2"
                  title="Choose a Service"
                  description="Select from features like Outfit Recommender, Color Analysis, or Trend Finder."
                />
                <Step
                  num="3"
                  title="Interact with the AI"
                  description="Provide your inputs, such as photos or style preferences, and let our AI work its magic."
                />
                <Step
                  num="4"
                  title="Receive Your Analysis"
                  description="Instantly get personalized recommendations and insights to elevate your style."
                />
              </div>
              <Link href="/studio" className="inline-block pt-6">
                <Button size="lg" className="bg-[#8B6F47] hover:bg-[#6B5537] text-white px-8 py-3 text-lg font-light">
                  Enter The Studio <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#8B6F47] text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <Wand2 className="mx-auto h-12 w-12 mb-4" />
          <p className="font-serif text-3xl font-bold mb-2">Style AI</p>
          <p className="text-lg font-light opacity-90 mb-8">Your Personal AI-Powered Fashion Assistant</p>
          <div className="text-sm opacity-70">© {new Date().getFullYear()} Style AI. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  )
}

function ServiceCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="service-card rounded-lg bg-white p-8 text-left shadow-lg border-none hover:shadow-xl transition-shadow">
      <div className="w-16 h-16 bg-[#8B6F47] rounded-full flex items-center justify-center mx-auto mb-6">
        <Wand2 className="h-8 w-8 text-white" />
      </div>
      <h3 className="font-serif text-2xl font-semibold text-[#8B6F47] mb-4 text-center">{title}</h3>
      <p className="text-[#6B5537] font-light leading-relaxed text-center">{description}</p>
    </div>
  )
}

function Step({ num, title, description }: { num: string; title: string; description: string }) {
  return (
    <li className="step-item flex items-start gap-6">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#8B6F47] font-serif font-bold text-white text-lg">
        {num}
      </div>
      <div>
        <h4 className="font-serif text-xl font-semibold text-[#8B6F47] mb-2">{title}</h4>
        <p className="text-[#6B5537] font-light leading-relaxed">{description}</p>
      </div>
    </li>
  )
}
