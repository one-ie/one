export function Hero() {
  return (
    <section className="px-6 py-24 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          AI Agents That
          <br />
          <span className="text-indigo-400">Actually Learn</span>
        </h1>
        <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
          Deploy your agent to web, Telegram, and Discord. Every conversation teaches the substrate. Good answers strengthen paths. Bad ones fade.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/chat"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition-colors"
          >
            Try the demo
          </a>
          <a
            href="https://dev.one.ie"
            className="px-6 py-3 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
          >
            Visit ONE
          </a>
        </div>
      </div>
    </section>
  )
}
