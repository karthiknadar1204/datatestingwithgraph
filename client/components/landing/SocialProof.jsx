export default function SocialProof() {
  const companies = ["TechCorp", "DataFlow", "CloudSync", "QueryPro"]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-border/40">
      <div className="text-center space-y-12">
        <div>
          <p className="text-sm font-semibold text-cyan-400 mb-4">TRUSTED BY LEADING COMPANIES</p>
          <h2 className="text-3xl font-bold">Used by teams worldwide</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
          {companies.map((company) => (
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
  )
}
