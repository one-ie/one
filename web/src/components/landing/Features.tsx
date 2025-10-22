export function Features() {
  return (
    <section className="py-20 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Why Choose ONE Platform?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for speed, scalability, and developer experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">AI-Native Architecture</h3>
              <p className="text-muted-foreground">Built on a 6-dimension ontology that models reality through Groups, People, Things, Connections, Events, and Knowledge.</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Multi-Tenant by Design</h3>
              <p className="text-muted-foreground">Hierarchical groups from friend circles to global governments. Complete data isolation with flexible access control.</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Real-Time Everything</h3>
              <p className="text-muted-foreground">Powered by Convex for instant updates. Effect.ts for pure business logic. Type-safe from database to UI.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
