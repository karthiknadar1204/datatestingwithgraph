import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
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
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-border/40">
      <div className="text-center space-y-12">
        <div>
          <p className="text-sm font-semibold text-cyan-400 mb-4">WHAT USERS SAY</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-balance">
            Loved by data teams everywhere
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
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
  )
}
