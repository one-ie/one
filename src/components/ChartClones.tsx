"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type {
    ChartConfig,
} from "@/components/ui/chart"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
    views: {
        label: "Repository Clones",
    },
    total: {
        label: "Total Clones",
        color: "hsl(220, 100%, 50%)",
    },
    uniques: {
        label: "Unique Cloners",
        color: "hsl(220, 70%, 60%)",
    },
} satisfies ChartConfig

interface CloneData {
    timestamp: string;
    total: number;
    uniques: number;
}

// Custom styles to override Recharts defaults
const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "var(--radius)",
    color: "hsl(var(--foreground))",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

export function Chart() {
    const [chartData, setChartData] = React.useState<CloneData[]>([]);
    const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("total");

    const total = React.useMemo(
        () => ({
            total: chartData.reduce((acc: number, curr: CloneData) => acc + curr.total, 0),
            uniques: chartData.reduce((acc: number, curr: CloneData) => acc + curr.uniques, 0),
        }),
        [chartData]
    )

    React.useEffect(() => {
        const fetchCloneData = async () => {
            try {
                // Call our server-side API endpoint instead of GitHub directly
                const response = await fetch('/api/github');
                
                if (!response.ok) {
                    console.error(`API responded with status ${response.status}`);
                    setChartData([]);
                    return;
                }

                const data = await response.json();
                
                if (data && Array.isArray(data.clones)) {
                    const sortedClones = data.clones
                        .sort((a: { timestamp: string }, b: { timestamp: string }) => 
                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map((clone: { timestamp: string; count: number; uniques: number }) => ({
                            timestamp: clone.timestamp,
                            total: clone.count,
                            uniques: clone.uniques
                        }));
                    setChartData(sortedClones);
                } else {
                    console.error('Invalid response format from API');
                    setChartData([]);
                }
            } catch (error) {
                console.error('Error fetching clone data:', error);
                setChartData([]);
            }
        };

        fetchCloneData();
        const interval = setInterval(fetchCloneData, 5 * 60 * 1000); // Refresh every 5 minutes
        return () => clearInterval(interval);
    }, []);

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>GitHub Clone Statistics</CardTitle>
                    <CardDescription>
                        Repository clone activity over the last 15 days
                    </CardDescription>
                </div>
                <div className="flex">
                    {["total", "uniques"].map((key) => {
                        const chart = key as keyof typeof chartConfig
                        return (
                            <button
                                key={chart}
                                data-active={activeChart === chart}
                                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                                onClick={() => setActiveChart(chart)}
                            >
                                <span className="text-xs text-muted-foreground">
                                    {chartConfig[chart].label}
                                </span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    {total[key as keyof typeof total]?.toLocaleString() || '0'}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={24}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric"
                                })
                            }}
                        />
                        <ChartTooltip
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            contentStyle={tooltipStyle}
                            content={
                                <ChartTooltipContent
                                    className="w-[150px] bg-card text-card-foreground border-border"
                                    nameKey="views"
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                    }}
                                />
                            }
                        />
                        <Bar 
                            dataKey={activeChart} 
                            fill={activeChart === "total" ? "hsl(220, 100%, 50%)" : "hsl(220, 70%, 60%)"} 
                            radius={[4, 4, 0, 0]}
                            isAnimationActive={true}
                            animationDuration={500}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
