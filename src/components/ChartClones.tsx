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
} from "@/components/chat/chart"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/chat/chart"
const chartData = [
    { timestamp: "2025-02-09T00:00:00Z", total: 1, uniques: 1 },
    { timestamp: "2025-02-10T00:00:00Z", total: 56, uniques: 36 },
    { timestamp: "2025-02-11T00:00:00Z", total: 19, uniques: 12 },
    { timestamp: "2025-02-12T00:00:00Z", total: 27, uniques: 20 },
    { timestamp: "2025-02-13T00:00:00Z", total: 7, uniques: 4 },
    { timestamp: "2025-02-14T00:00:00Z", total: 51, uniques: 30 },
    { timestamp: "2025-02-15T00:00:00Z", total: 20, uniques: 11 },
    { timestamp: "2025-02-16T00:00:00Z", total: 7, uniques: 5 },
    { timestamp: "2025-02-17T00:00:00Z", total: 33, uniques: 13 },
    { timestamp: "2025-02-18T00:00:00Z", total: 25, uniques: 14 },
    { timestamp: "2025-02-19T00:00:00Z", total: 8, uniques: 5 },
    { timestamp: "2025-02-20T00:00:00Z", total: 30, uniques: 17 },
    { timestamp: "2025-02-21T00:00:00Z", total: 6, uniques: 3 },
    { timestamp: "2025-02-22T00:00:00Z", total: 4, uniques: 2 },
    { timestamp: "2025-02-23T00:00:00Z", total: 27, uniques: 11 },
]

const chartConfig = {
    views: {
        label: "Repository Clones",
    },
    total: {
        label: "Total Clones",
        color: "hsl(var(--chart-1))",
    },
    uniques: {
        label: "Unique Cloners",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function Chart() {
    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("total")

    const total = React.useMemo(
        () => ({
            total: chartData.reduce((acc, curr) => acc + curr.total, 0),
            uniques: chartData.reduce((acc, curr) => acc + curr.uniques, 0),
        }),
        []
    )

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
                                    {total[key as keyof typeof total].toLocaleString()}
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
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
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
                        <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
