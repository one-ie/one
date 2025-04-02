export default function Elevate() {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Framework Image */}
      <div className="w-full bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto">
          <img 
            src="/images/drawings/Elevate.svg"
            alt="ELEVATE with AI Framework"  
            className="w-full h-auto drop-shadow-xl"
            loading="lazy"
          />
        </div>
      </div>

      {/* Framework Description */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <p className="text-xl leading-relaxed text-muted-foreground">
            The Elevate Ecommerce Framework is a strategic, step-by-step blueprint designed to systematize and accelerate your e-commerce growth by leveraging the power of Artificial Intelligence.
          </p>

          <p className="text-lg leading-relaxed">
            The framework begins with a crucial <strong>Foundation</strong> stage, focused on deeply understanding your <strong>Company Context</strong> (offer, brand voice), your <strong>Market Landscape</strong> and ideal <strong>Customer</strong>. From this strong base, it systematically guides customers through an upward spiral of engagement - first <strong>Attracting</strong> them through AI-powered personalized outreach and content, then <strong>Converting</strong> them with data-driven optimization and automated sales processes, and finally helping them <strong>Grow</strong> into loyal advocates.
          </p>

          <p className="text-lg leading-relaxed">
            As customers reach the <strong>Share</strong> stage at the summit, they naturally become ambassadors who introduce new prospects into the journey, creating a self-reinforcing cycle. Unlike traditional marketing funnels that simply move customers down a linear path, this next-generation framework creates an elevating spiral where each customer's journey strengthens the entire ecosystem, while the AI Prompt Playbook For Ecommerce delivers the high-speed engine for predictable, scalable e-commerce growth.
          </p>
        </div>
      </div>
    </div>
  );
}