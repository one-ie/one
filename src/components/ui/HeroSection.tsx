import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronRight } from "lucide-react"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: string
  ctaHref?: string
  bottomImage?: {
    light: string
    dark: string
  }
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lightLineColor?: string
    darkLineColor?: string
  }
  videoSrc?: string
  stats?: Array<{
    value: string
    label: string
  }>
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "var(--primary)",
  darkLineColor = "var(--primary)",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent to-90%" />
    </div>
  )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "Build products for everyone",
      subtitle = {
        regular: "Designing your projects faster with ",
        gradient: "the largest figma UI kit.",
      },
      description = "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.",
      ctaText = "Browse courses",
      ctaHref = "#",
      bottomImage = {
        light: "/video-placeholder.jpg",
        dark: "/video-placeholder.jpg",
      },
      videoSrc,
      stats,
      gridOptions,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative min-h-screen flex flex-col justify-center py-8 lg:py-12 overflow-hidden", className)} ref={ref} {...props}>
        <div className="absolute top-0 z-[0] h-screen w-screen bg-primary/10" />
        <section className="relative max-w-full mx-auto z-1">
          <RetroGrid {...gridOptions} />
          <div className="max-w-screen-xl z-10 mx-auto px-4 py-8 gap-12 md:px-8">
            <div className="space-y-6 max-w-4xl mx-auto text-center">
              <h3 className="text-sm text-foreground/80 dark:text-foreground/70 group font-medium mx-auto px-5 py-2 bg-primary/10 border border-primary/10 rounded-full w-fit">
                {title}
                <ChevronRight className="inline w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </h3>
              <h2 className="text-4xl tracking-tight font-bold mx-auto md:text-6xl lg:text-7xl leading-[1.1]">
  {subtitle.regular}
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-gray-600 to-gray-400 dark:from-gray-700 dark:via-gray-500 dark:to-gray-300">
    {subtitle.gradient}
  </span>
</h2>
              <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto leading-normal">
                {description}
              </p>

              {/* Video/Image Preview */}
              {bottomImage && (
                <div className="relative aspect-video max-w-3xl mx-auto mt-8 mb-12 rounded-xl overflow-hidden one-glass-card animate-fade-in [--animation-delay:800ms]">
                  <div className="absolute inset-0 bg-primary/10" />
                  <img
                    src={bottomImage.light}
                    className="w-full h-full object-cover dark:hidden"
                    alt="Preview"
                  />
                  <img
                    src={bottomImage.dark}
                    className="hidden w-full h-full object-cover dark:block"
                    alt="Preview"
                  />
                  {videoSrc && (
                    <button className="absolute inset-0 flex items-center justify-center group">
                      <span className="w-20 h-20 flex items-center justify-center rounded-full bg-primary/90 text-white group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Stats Grid */}
              {stats && (
                <div className="grid md:grid-cols-3 gap-6 mb-4 animate-fade-in [--animation-delay:1000ms]">
                  {stats.map((stat, index) => (
                    <div key={index} className="p-6 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50">
                      <div className="flex items-center justify-center flex-col gap-2">
                        <div className="text-3xl font-bold text-primary">{stat.value}</div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }