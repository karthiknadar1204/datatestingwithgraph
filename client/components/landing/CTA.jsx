import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

export default function CTA() {
  return (
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
  )
}
