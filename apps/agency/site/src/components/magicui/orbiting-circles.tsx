"use client";

import { cn } from "@/lib/utils";

const ORBIT_KEYFRAMES = `
@keyframes orbit {
  from {
    transform: rotate(var(--orbit-start)) translateY(var(--orbit-radius)) rotate(var(--orbit-start-neg));
  }
  to {
    transform: rotate(var(--orbit-end)) translateY(var(--orbit-radius)) rotate(var(--orbit-end-neg));
  }
}
`;

interface OrbitingCirclesProps {
	className?: string;
	children?: React.ReactNode;
	reverse?: boolean;
	duration?: number;
	delay?: number;
	radius?: number;
	path?: boolean;
	startAngle?: number;
}

const OrbitingCircles = ({
	className,
	children,
	reverse,
	duration = 20,
	radius = 50,
	path = true,
	startAngle = 0,
}: OrbitingCirclesProps) => {
	const diameter = radius * 2;
	const start = `${startAngle}deg`;
	const startNeg = `${-startAngle}deg`;
	const end = reverse ? `${startAngle - 360}deg` : `${startAngle + 360}deg`;
	const endNeg = reverse ? `${360 - startAngle}deg` : `${-360 - startAngle}deg`;

	return (
		<>
			<style dangerouslySetInnerHTML={{ __html: ORBIT_KEYFRAMES }} />
			<div
				className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
				style={{ width: diameter, height: diameter }}
			>
				{path && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width={diameter}
						height={diameter}
						viewBox={`0 0 ${diameter} ${diameter}`}
						className="pointer-events-none absolute inset-0"
					>
						<circle
							className="stroke-black/10 stroke-1 dark:stroke-white/10"
							cx={radius}
							cy={radius}
							r={radius}
							fill="none"
						/>
					</svg>
				)}

				<div
					style={{
						"--orbit-radius": `${radius}px`,
						"--orbit-start": start,
						"--orbit-start-neg": startNeg,
						"--orbit-end": end,
						"--orbit-end-neg": endNeg,
						transformOrigin: "0 0",
						position: "absolute",
						left: "50%",
						top: "50%",
						animation: `orbit ${duration}s linear infinite`,
					} as React.CSSProperties}
					className={cn(className)}
				>
					{children}
				</div>
			</div>
		</>
	);
};

export default OrbitingCircles;
