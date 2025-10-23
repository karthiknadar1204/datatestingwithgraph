import { Card } from "@/components/ui/card"
import {
  Database,
  MessageSquare,
  Zap,
  Code2,
  Cpu,
  Lock,
} from "lucide-react"

export default function Features() {
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

  return (
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
  )
}
