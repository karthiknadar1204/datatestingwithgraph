"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowRight,
  Database,
  MessageSquare,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  Check,
  Code2,
  Cpu,
  Lock,
  Users,
} from "lucide-react"

export default function LandingPage() {
  const features = [
    {
      icon: Database,
      title: "Real-Time Connection",
      description: "Connect directly to your PostgreSQL database and query data instantly without any setup hassle.",
    },
    {
      icon: MessageSquare,
      title: "Natural Language Queries",
      description:
        "Ask questions in plain English and get instant results. Our AI translates your queries to SQL automatically.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized queries and instant responses. Get the data you need in milliseconds, not seconds.",
    },
    {
      icon: Code2,
      title: "SQL Transparency",
      description: "See the exact SQL queries generated from your natural language questions for full transparency.",
    },
    {
      icon: Cpu,
      title: "AI-Powered",
      description: "Advanced AI models understand complex queries and context to deliver accurate results every time.",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description:
        "Your data never leaves your database. All queries are encrypted and secure with enterprise-grade protection.",
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Your data never leaves your database. All queries are encrypted and secure.",
    },
    {
      icon: TrendingUp,
      title: "Instant Insights",
      description: "Get actionable insights from your data in seconds, not hours.",
    },
    {
      icon: Sparkles,
      title: "No SQL Required",
      description: "Anyone on your team can query data, regardless of technical expertise.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share queries and insights with your team in real-time.",
    },
  ]

  const stats = [
    { value: "10K+", label: "Queries Processed" },
    { value: "99.9%", label: "Uptime" },
    { value: "<100ms", label: "Response Time" },
    { value: "500+", label: "Active Users" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Database className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              DBChat
            </span>
          </div>
          <Link href="/chat">
            <Button className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/30">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-40">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="space-y-12">
          <div className="space-y-8 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 w-fit">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">AI-Powered Database Interaction</span>
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-balance leading-tight">
              Chat with Your{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Database
              </span>{" "}
              in Real Time
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl text-balance leading-relaxed">
              Connect your PostgreSQL database and interact with your data using natural language. No SQL knowledge
              required. Get instant insights in seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/chat">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30 h-14 px-8 text-lg"
              >
                Start Chatting Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border-cyan-500/30 hover:bg-cyan-500/5 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-8 border-t border-border/40">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl sm:text-4xl font-bold text-cyan-400">{stat.value}</div>
                <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-border/40">
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-balance">
              Powerful Features Built for You
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to query your database with natural language
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <Card
                  key={idx}
                  className="group relative border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 hover:border-cyan-500/40 transition-all duration-300 p-8"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section with Two Column Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-border/40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-balance">Why Teams Choose DBChat</h2>

            <div className="space-y-6">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-3xl" />
            <Card className="relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 p-8 sm:p-12">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="pt-4 space-y-3">
                  <div className="h-3 bg-cyan-500/30 rounded-full w-3/4" />
                  <div className="h-3 bg-cyan-500/20 rounded-full w-full" />
                  <div className="h-3 bg-cyan-500/20 rounded-full w-5/6" />
                  <div className="pt-4 space-y-3">
                    <div className="h-2 bg-blue-500/30 rounded-full w-1/2" />
                    <div className="h-2 bg-blue-500/20 rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-border/40">
        <div className="text-center space-y-12">
          <div>
            <p className="text-sm font-semibold text-cyan-400 mb-4">WHAT USERS SAY</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-balance">
              Loved by data teams everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "DBChat has transformed how our team queries data. No more waiting for SQL experts!",
                author: "Sarah Chen",
                role: "Data Analyst",
                company: "TechCorp",
              },
              {
                quote: "The speed and accuracy are incredible. We've cut our query time by 80%.",
                author: "Marcus Johnson",
                role: "Engineering Lead",
                company: "DataFlow",
              },
              {
                quote: "Finally, a tool that makes database queries accessible to everyone on our team.",
                author: "Emily Rodriguez",
                role: "Product Manager",
                company: "CloudSync",
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-border/40">
        <div className="text-center space-y-12">
          <div>
            <p className="text-sm font-semibold text-cyan-400 mb-4">TRUSTED BY LEADING COMPANIES</p>
            <h2 className="text-3xl font-bold">Used by teams worldwide</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
            {["TechCorp", "DataFlow", "CloudSync", "QueryPro"].map((company) => (
              <div
                key={company}
                className="text-muted-foreground font-semibold text-lg opacity-60 hover:opacity-100 transition-opacity"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-border/40">
        <div className="text-center space-y-12">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-balance mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, scale as you grow. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for getting started",
                features: ["Up to 100 queries/month", "1 database connection", "Basic support"],
              },
              {
                name: "Pro",
                price: "$29",
                period: "/month",
                description: "For growing teams",
                features: ["Unlimited queries", "5 database connections", "Priority support", "Advanced analytics"],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large organizations",
                features: [
                  "Everything in Pro",
                  "Unlimited connections",
                  "Dedicated support",
                  "Custom integrations",
                  "SLA guarantee",
                ],
              },
            ].map((plan, idx) => (
              <Card
                key={idx}
                className={`relative border transition-all duration-300 p-8 ${
                  plan.highlighted
                    ? "border-cyan-500/60 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 ring-2 ring-cyan-500/20"
                    : "border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <Button
                  className={`w-full mb-6 ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  Get Started
                </Button>
                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-border/40">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
          <Card className="relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 p-12 sm:p-16 text-center space-y-8">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-balance">
              Ready to Transform Your Data?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of teams using DBChat to unlock insights from their PostgreSQL databases instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/30 h-14 px-8 text-lg"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-cyan-500/30 hover:bg-cyan-500/5 bg-transparent"
              >
                Schedule Demo
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">DBChat</span>
              </div>
              <p className="text-sm text-muted-foreground">Chat with your database in real time.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 DBChat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
