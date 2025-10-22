import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent p-12 md:p-20 text-center">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground">
              Ready to Build?
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Start creating with the ONE Platform today.
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                asChild
              >
                <a href="/account/signup">
                  Get Started
                </a>
              </Button>
            </div>
          </div>

          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
