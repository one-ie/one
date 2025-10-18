'use client';

import { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';

import { Chart } from '@/components/Chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

const collaborators = [
  { name: 'Ava Synth', role: 'AI Composer', image: 'https://i.pravatar.cc/100?img=40' },
  { name: 'Leon Flux', role: 'Design Ops', image: 'https://i.pravatar.cc/100?img=12' },
  { name: 'Mira Chen', role: 'Product', image: 'https://i.pravatar.cc/100?img=33' },
];

export function ComponentCollage() {
  const [autopilot, setAutopilot] = useState(true);

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <div className="col-span-full overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-3 shadow-2xl shadow-primary/15">
        <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-[0.3rem] text-primary/70">
          <span>Insight Surface</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
            <Sparkles className="h-4 w-4" />
            Live
          </span>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-inner">
          <Chart />
        </div>
      </div>

      <Card className="relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
        <CardHeader>
          <CardTitle>Mission Control</CardTitle>
          <CardDescription>
            Pair buttons, badges, and switches to choreograph agent hand-offs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Launch Campaign</Button>
            <Button variant="secondary" size="lg">
              Preview
            </Button>
            <Button variant="ghost" size="lg">
              Share
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>AI Ready</Badge>
            <Badge variant="secondary">Realtime</Badge>
            <Badge variant="outline">Beautiful Defaults</Badge>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Autopilot Mode</p>
              <p className="text-xs text-muted-foreground">
                Agents keep the layout responsive while you focus on strategy.
              </p>
            </div>
            <Switch
              checked={autopilot}
              onCheckedChange={setAutopilot}
              aria-label="Toggle Autopilot Mode"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
        <CardHeader>
          <CardTitle>Story Tabs</CardTitle>
          <CardDescription>
            Use tabs, inputs, and copy blocks to narrate product value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vision" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vision">Vision</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="handoff">Hand-off</TabsTrigger>
            </TabsList>
            <TabsContent value="vision" className="space-y-4 text-sm text-muted-foreground">
              <p>
                Drop ONE components onto any page and let agents adapt copy, imagery, and data without breaking design.
              </p>
              <div className="grid gap-2">
                <Label htmlFor="headline">Headline</Label>
                <Input id="headline" defaultValue="Launch the future faster." />
              </div>
            </TabsContent>
            <TabsContent value="metrics" className="text-sm text-muted-foreground">
              <p>
                Recharts, cards, and badges sync with live data sources through our providers. Zero bespoke wiring needed.
              </p>
            </TabsContent>
            <TabsContent value="handoff" className="space-y-2 text-sm text-muted-foreground">
              <p>1. Agents assemble layout primitives.</p>
              <p>2. Humans tune tone and data highlights.</p>
              <p>3. Ship a cohesive experience in hours, not weeks.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader className="space-y-4">
          <CardTitle>Live Collaboration</CardTitle>
          <CardDescription>
            Avatars, status badges, and activity snapshots keep teams in sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {collaborators.map((person) => (
              <div
                key={person.name}
                className="flex items-center gap-3 rounded-2xl border border-border/80 bg-background/70 px-3 py-2"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={person.image} />
                  <AvatarFallback>{person.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{person.name}</p>
                  <p className="text-xs text-muted-foreground">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4" />
              Live updates
            </div>
            Agents stream component changes, humans review in context, and stakeholders approve on the spot.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
