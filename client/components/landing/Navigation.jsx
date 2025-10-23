import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Database, ArrowRight } from "lucide-react"

export default function Navigation() {
  return (
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
  )
}
