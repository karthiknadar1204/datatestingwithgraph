import { Card } from "@/components/ui/card"
import { Shield, TrendingUp, Sparkles, Users } from "lucide-react"

export default function Benefits() {
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

  return (
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
  )
}
