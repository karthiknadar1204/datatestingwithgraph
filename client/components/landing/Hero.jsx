import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export default function Hero() {
  const stats = [
    { value: "10K+", label: "Queries Processed" },
    { value: "99.9%", label: "Uptime" },
    { value: "<100ms", label: "Response Time" },
    { value: "500+", label: "Active Users" },
  ]

  return (
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
  )
}
