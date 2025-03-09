import { useRef, useEffect, useState } from "react"

interface SquaresProps {
  direction?: "right" | "left" | "up" | "down" | "diagonal"
  speed?: number
  borderColor?: string
  squareSize?: number
  hoverFillColor?: string
  className?: string
  glowIntensity?: number
  fadeEdges?: boolean
  pulseEffect?: boolean
  height?: string | number
}

export function Squares({
  direction = "right",
  speed = 1,
  borderColor = "rgba(255, 255, 255, 0.2)",
  squareSize = 40,
  hoverFillColor = "rgba(255, 255, 255, 0.1)",
  className = "",
  glowIntensity = 0.8,
  fadeEdges = true,
  pulseEffect = true,
  height = "500px",
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number>(0)
  const numSquaresX = useRef<number>(0)
  const numSquaresY = useRef<number>(0)
  const gridOffset = useRef({ x: 0, y: 0 })
  const pulsePhase = useRef<number>(0)
  const [hoveredSquare, setHoveredSquare] = useState<{
    x: number
    y: number
  } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.style.background = "transparent"

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${canvas.offsetWidth}px`
      canvas.style.height = `${canvas.offsetHeight}px`
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize

      if (pulseEffect) {
        pulsePhase.current = (pulsePhase.current + 0.02) % (Math.PI * 2)
      }

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize)
          const squareY = y - (gridOffset.current.y % squareSize)

          const centerX = canvas.width / 2
          const centerY = canvas.height / 2
          const distanceFromCenter = Math.sqrt(
            Math.pow((squareX - centerX) / centerX, 2) +
            Math.pow((squareY - centerY) / centerY, 2)
          )

          let opacity = pulseEffect
            ? 0.5 + 0.3 * Math.sin(pulsePhase.current + distanceFromCenter * 2)
            : 0.7
          opacity *= Math.max(0.3, 1 - distanceFromCenter)

          if (
            hoveredSquare &&
            Math.floor((x - startX) / squareSize) === hoveredSquare.x &&
            Math.floor((y - startY) / squareSize) === hoveredSquare.y
          ) {
            ctx.fillStyle = hoverFillColor
            ctx.fillRect(squareX, squareY, squareSize, squareSize)

            ctx.shadowColor = "rgba(255, 255, 255, 0.5)"
            ctx.shadowBlur = 20 * glowIntensity
          } else {
            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0
          }

          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.lineWidth = 1
          ctx.strokeRect(squareX, squareY, squareSize, squareSize)
        }
      }

      if (fadeEdges) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          Math.max(canvas.width, canvas.height) / 1.5
        )
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)")
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)")
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1)
      const time = Date.now() * 0.001

      const waveOffset = Math.sin(time) * 0.5

      switch (direction) {
        case "right":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + waveOffset + squareSize) % squareSize
          break
        case "left":
          gridOffset.current.x =
            (gridOffset.current.x + effectiveSpeed + waveOffset + squareSize) % squareSize
          break
        case "up":
          gridOffset.current.y =
            (gridOffset.current.y + effectiveSpeed + waveOffset + squareSize) % squareSize
          break
        case "down":
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + waveOffset + squareSize) % squareSize
          break
        case "diagonal":
          gridOffset.current.x =
            (gridOffset.current.x - effectiveSpeed + waveOffset + squareSize) % squareSize
          gridOffset.current.y =
            (gridOffset.current.y - effectiveSpeed + waveOffset + squareSize) % squareSize
          break
      }

      drawGrid()
      requestRef.current = requestAnimationFrame(updateAnimation)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize

      const hoveredSquareX = Math.floor(
        (mouseX + gridOffset.current.x - startX) / squareSize,
      )
      const hoveredSquareY = Math.floor(
        (mouseY + gridOffset.current.y - startY) / squareSize,
      )

      setHoveredSquare({ x: hoveredSquareX, y: hoveredSquareY })
    }

    const handleMouseLeave = () => {
      setHoveredSquare(null)
    }

    window.addEventListener("resize", resizeCanvas)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    resizeCanvas()
    requestRef.current = requestAnimationFrame(updateAnimation)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [direction, speed, borderColor, hoverFillColor, hoveredSquare, squareSize, glowIntensity, fadeEdges, pulseEffect])

  return (
    <canvas
      ref={canvasRef}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className={`w-full border-none block bg-transparent ${className}`}
    />
  )
}
