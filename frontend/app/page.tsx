import Link from "next/link"
import { TopNav } from "@/components/layout/top-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Activity,
  Brain,
  Calendar,
  Shield,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  FileText,
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Predictions",
    description: "Advanced machine learning algorithms analyze your symptoms to provide accurate health predictions.",
  },
  {
    icon: Users,
    title: "Expert Doctors",
    description: "Connect with verified healthcare professionals across multiple specializations.",
  },
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description: "Book appointments in seconds with real-time availability and instant confirmation.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is encrypted and protected with enterprise-grade security.",
  },
  {
    icon: FileText,
    title: "Medical Records",
    description: "Store and access your medical records securely from anywhere, anytime.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get health predictions and recommendations in seconds, not days.",
  },
]

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "500+", label: "Verified Doctors" },
  { value: "98%", label: "Prediction Accuracy" },
  { value: "24/7", label: "Support Available" },
]

const steps = [
  {
    step: "01",
    title: "Enter Your Symptoms",
    description: "Describe your symptoms using our intuitive multi-step form with guided questions.",
  },
  {
    step: "02",
    title: "Get AI Analysis",
    description: "Our AI analyzes your symptoms and provides potential conditions with probability scores.",
  },
  {
    step: "03",
    title: "Consult a Doctor",
    description: "Book an appointment with a specialist based on your results for professional guidance.",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    content:
      "MediPredict helped me identify early warning signs that my regular checkups missed. The AI prediction was spot-on!",
    rating: 5,
  },
  {
    name: "Dr. Michael Chen",
    role: "Cardiologist",
    content:
      "As a physician, I appreciate how MediPredict prepares patients before consultations. It makes our sessions more productive.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Patient",
    content:
      "The convenience of booking appointments and getting quick health insights has been a game-changer for managing my family's health.",
    rating: 5,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="container px-4 md:px-6 lg:px-8 relative py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-5 py-2 text-sm font-semibold mb-6 text-slate-700">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>AI-Powered Healthcare Platform</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance text-foreground leading-tight mx-auto text-center">
              Your Health, <br />
              <span className="text-emerald-600 dark:text-accent">Predicted with Precision</span>
            </h1>
            <p className="mt-8 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-center">
              Get instant AI-powered health predictions based on your symptoms. Connect with expert doctors and take
              control of your health journey today.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/30">
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-12 px-8 border-2 border-slate-300 hover:bg-slate-50 font-semibold text-base">
                <Link href="/doctors">Find a Doctor</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-accent">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container px-4 md:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Everything You Need for Better Health</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and features designed to give you control over your health decisions.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="group bg-card border border-border hover:border-emerald-500 dark:hover:border-accent hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900 transition-colors">
                  <feature.icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-muted/30 py-24 md:py-32">
        <div className="container px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">How MediPredict Works</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Get health insights in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="text-6xl font-black text-muted/40 absolute -top-4 -left-2">{step.step}</div>
                <div className="relative pt-10 bg-card p-6 rounded-lg border border-border shadow-sm">
                  <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-emerald-400 dark:text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container px-4 md:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Trusted by Thousands</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our users and healthcare professionals say about MediPredict
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-card border border-border hover:border-emerald-500 dark:hover:border-accent hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-card-foreground mb-6 leading-relaxed text-base">{`"${testimonial.content}"`}</p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 dark:bg-slate-950 text-white">
        <div className="container py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-balance">Ready to Take Control of Your Health?</h2>
            <p className="mt-6 text-xl text-slate-300 dark:text-slate-400">
              Join thousands of users who trust MediPredict for their health insights.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-600/30">
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 bg-transparent border-2 border-white/20 hover:bg-white/10 text-white font-semibold text-base"
                asChild
              >
                <Link href="/doctors">Browse Doctors</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container px-4 md:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-extrabold text-foreground">MediPredict</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered health predictions and doctor consultations for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/#features" className="hover:text-emerald-600 dark:hover:text-accent transition-colors font-medium">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/doctors" className="hover:text-emerald-600 dark:hover:text-accent transition-colors font-medium">
                    Find Doctors
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="hover:text-emerald-600 dark:hover:text-accent transition-colors font-medium">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-emerald-600 dark:hover:text-accent transition-colors font-medium">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-600 dark:hover:text-accent transition-colors font-medium">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-600 dark:hover:text-accent transition-colors font-medium">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-emerald-600 dark:hover:text-accent transition-colors font-medium">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-600 dark:hover:text-accent transition-colors font-medium">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-600 dark:hover:text-accent transition-colors font-medium">
                    HIPAA Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MediPredict. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-accent">
              <Clock className="h-4 w-4" />
              <span>24/7 Support Available</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
