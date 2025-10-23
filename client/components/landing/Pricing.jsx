import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function Pricing() {
  const plans = [
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
  ]

  return (
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
          {plans.map((plan, idx) => (
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
  )
}
