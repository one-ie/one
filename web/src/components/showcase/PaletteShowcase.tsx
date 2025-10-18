'use client';

import { useState } from 'react';
import { Calendar, Flame, Sparkles } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function PaletteShowcase() {
  const [autoPilot, setAutoPilot] = useState(true);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="relative overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3rem] text-primary/70">
            <Sparkles className="h-4 w-4" />
            Interaction Suite
          </div>
          <CardTitle className="text-2xl">Buttons, Badges & Motion</CardTitle>
          <CardDescription>
            Polished actions aligned with the ONE design language—drop them into any flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Launch Playbook</Button>
            <Button variant="secondary" size="lg">
              Preview
            </Button>
            <Button variant="outline" size="lg">
              Invite Team
            </Button>
            <Button variant="ghost" size="lg">
              Explore
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="uppercase tracking-widest">Realtime</Badge>
            <Badge variant="outline">AI Ready</Badge>
            <Badge variant="secondary">Beautiful Defaults</Badge>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="link" className="px-0 text-primary">
                  View component tokens
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Customizable via CSS variables & Tailwind primitives.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3rem] text-primary/70">
            <Calendar className="h-4 w-4" />
            Intelligent Forms
          </div>
          <CardTitle className="text-2xl">Compose Flows Instantly</CardTitle>
          <CardDescription>
            Inputs, switches, and textareas come themed and accessible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="campaign-title">Campaign Title</Label>
              <Input id="campaign-title" placeholder="Moonshot Alpha" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="campaign-notes">Notes</Label>
              <Textarea
                id="campaign-notes"
                placeholder="Tell the agent what to build, then watch it compose the interface."
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Autopilot Mode</p>
                <p className="text-xs text-muted-foreground">
                  AI keeps components styled and responsive.
                </p>
              </div>
              <Switch
                checked={autoPilot}
                onCheckedChange={setAutoPilot}
                aria-label="Enable Autopilot Mode"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Edge-ready Tokens</p>
              <p className="text-xs text-muted-foreground">
                Works with dark mode, gradient backgrounds, and glassmorphism out of the box.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3rem] text-primary/70">
            <Flame className="h-4 w-4" />
            Collaborative Canvas
          </div>
          <CardTitle className="text-2xl">Tabs, Avatars & Live Cursors</CardTitle>
          <CardDescription>
            Use shadcn/ui primitives to choreograph multi-user experiences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="status" className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="https://i.pravatar.cc/100?img=40" />
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-semibold">Ava Synth</p>
                  <p className="text-sm text-muted-foreground">
                    Agent is aligning layout with brand system.
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  Active
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  Live cursors
                </span>
                <span className="rounded-full bg-foreground/10 px-3 py-1">
                  Real-time copy suggestions
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  Component versioning
                </span>
              </div>
            </TabsContent>
            <TabsContent value="notes" className="space-y-4">
              <Textarea
                defaultValue="Agents are reusing shadcn/ui primitives to keep design consistent across flows."
                rows={3}
              />
              <Button variant="secondary" className="self-start">
                Sync with Strategy Doc
              </Button>
            </TabsContent>
            <TabsContent value="activity" className="space-y-2 text-sm text-muted-foreground">
              <p>• 09:24 — Ava published new pricing card variations.</p>
              <p>• 09:31 — Leon connected dashboard metrics to live Convex data.</p>
              <p>• 09:42 — System generated localized strings for FR, DE.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
