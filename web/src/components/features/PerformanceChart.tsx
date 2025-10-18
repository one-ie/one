import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const performanceData = [
  { framework: 'Astro', percentage: 63, highlighted: true },
  { framework: 'WordPress', percentage: 44, highlighted: false },
  { framework: 'Gatsby', percentage: 42, highlighted: false },
  { framework: 'Next.js', percentage: 27, highlighted: false },
  { framework: 'Nuxt', percentage: 24, highlighted: false },
];

export function PerformanceChart() {
  return (
    <div className="mx-auto w-full max-w-[900px] px-4">
      <Card>
      <CardHeader>
        <CardTitle>Core Web Vitals Performance</CardTitle>
        <CardDescription>
          % of real-world sites with good Core Web Vitals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAstro" x1="0" y1="0" x2="1" y2="0">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--color-primary))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--color-accent))"
                    stopOpacity={0.8}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--color-border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="hsl(var(--color-muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="framework"
                stroke="hsl(var(--color-muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.95)',
                }}
                formatter={(value: number) => [`${value}%`, 'Performance']}
                cursor={{ fill: 'rgba(0, 0, 0, 0.15)' }}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {performanceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.highlighted
                        ? 'url(#colorAstro)'
                        : 'hsl(var(--color-muted))'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
