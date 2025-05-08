---
title: Analytics
description: Elevate KPIs
date: 2024-02-02
tags:
  - agents
order: 1
---
This appears to be a clean, modern email interface design with a strong focus on productivity and organization. Let me describe the UI components and how you could build something similar using shadcn/ui.

## Overall Layout and Components

The interface consists of:

1. **Left Sidebar**: Navigation menu with categories and counts
2. **Middle Panel**: Email list with filtering options and search
3. **Right Panel**: Email content viewer/composer

### Left Sidebar

- User profile at top ("Anthony O'Connell")
- Navigation items with counters (Learn: 128, Train: 9, Agents: 20, etc.)
- Each item has an icon and label

### Middle Panel

- Filter tabs at top (Now, Top, ToDo, Done)
- Search bar
- Category tags/filters (Meeting, Work)
- Email previews showing:
    - Subject line
    - Brief content preview
    - Time information (e.g., "1 min ago", "3 days ago")
    - Tags/labels (Budget, About, Work, etc.)

### Right Panel

- Email content display
- Multiple instances of the same email (possibly representing a thread)
- Sender information
- Action buttons at bottom (Save, Reply, Forward, Complete, Share)
- Recipient tags (@Teacher One, @Anthony O'Connell)

## Building with shadcn/ui

Here's how you could implement this using shadcn/ui components:

## Key Features and Implementation Details

Looking at this UI design, here's a detailed breakdown of how you could build it with shadcn/ui:

### Structure and Layout

- The app uses a three-column layout for maximum productivity and information density
- Each panel has a clear purpose: navigation, email list, and content viewing

### Component Breakdown

1. **Navigation**
    
    - Uses `NavigationMenu` from shadcn/ui
    - Each item includes an icon from `lucide-react`, text label, and count badge
    - Active state styling with subtle hover effects
2. **Email List**
    
    - Uses `Tabs` component for filter categories (Now, Top, ToDo, Done)
    - Custom search input with icon using the `Input` component
    - Email preview cards with time stamps, tags, and preview text
    - Active selection state
3. **Email Content**
    
    - Simple card-based layout for each message
    - Action buttons at bottom using `Button` components with outline variant
    - Recipient tags using `Badge` components
4. **Other UI Elements**
    
    - `Avatar` component for user representation
    - `Badge` components for tags and categories
    - `Separator` for dividing content sections
    - `Card` components for grouping related content

### Styling and Aesthetics

- Clean, minimal design with plenty of whitespace
- Clear visual hierarchy with appropriate font sizes and weights
- Subtle shadows and borders to create depth and separation
- Muted color scheme with accent colors for important elements

### Responsiveness

- The layout would need additional work to be fully responsive on mobile devices
- You could implement a collapsible sidebar and stacked layout for smaller screens

### Functionality Notes

- State management for the active email is handled with React useState
- Data for emails is structured for easy mapping to components
- You would need to add actual API integration for real functionality

The shadcn/ui library provides an excellent foundation for building this kind of interface, with its clean, accessible components that can be easily customized to match your design needs.

import React, { useState } from "react";
import { 
  NavigationMenu, 
  NavigationMenuItem, 
  NavigationMenuList 
} from "@/components/ui/navigation-menu";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Train, 
  Users, 
  Wrench, 
  User, 
  Search,
  Mail
} from "lucide-react";

export default function MailApp() {
  const [activeEmail, setActiveEmail] = useState(0);
  
  const emails = [
    {
      id: 1,
      sender: "Emily",
      subject: "Company",
      preview: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share.",
      time: "1 min ago",
      tags: ["Foundation", "Company"]
    },
    {
      id: 2,
      sender: "Weekend Plans",
      subject: "Welcome",
      preview: "Any plans for the weekend? I was thinking of going hiking in the nearby mountains.",
      time: "2 days ago",
      tags: ["Weekend", "Work"]
    },
    {
      id: 3,
      sender: "Emily Davis",
      subject: "Re: Question about Budget",
      preview: "I have a question about the budget for the upcoming project. It seems like there's a discrepancy in the allocation.",
      time: "3 days ago",
      tags: ["Budget", "About", "Work"]
    },
    {
      id: 4,
      sender: "David Lee",
      subject: "New Project Idea",
      preview: "I have an exciting new project idea to discuss with you. It involves expanding our services to target a niche market.",
      time: "3 days ago",
      tags: ["Label", "Label", "Label"]
    }
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-64 border-r p-4 flex flex-col">
        <div className="flex items-center space-x-2 mb-6">
          <Avatar className="h-8 w-8">
            <AvatarFallback>AO</AvatarFallback>
          </Avatar>
          <span className="font-medium">Anthony O'Connell</span>
        </div>
        
        <NavigationMenu orientation="vertical" className="w-full">
          <NavigationMenuList className="flex flex-col space-y-2 w-full">
            <NavigationMenuItem className="flex justify-between w-full px-3 py-2 hover:bg-gray-100 rounded-md">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-3" />
                <span>Learn</span>
              </div>
              <Badge variant="secondary" className="bg-gray-100">128</Badge>
            </NavigationMenuItem>
            
            <NavigationMenuItem className="flex justify-between w-full px-3 py-2 hover:bg-gray-100 rounded-md">
              <div className="flex items-center">
                <Train className="h-5 w-5 mr-3" />
                <span>Train</span>
              </div>
              <Badge variant="secondary" className="bg-gray-100">9</Badge>
            </NavigationMenuItem>
            
            <NavigationMenuItem className="flex justify-between w-full px-3 py-2 hover:bg-gray-100 rounded-md">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3" />
                <span>Agents</span>
              </div>
              <Badge variant="secondary" className="bg-gray-100">20</Badge>
            </NavigationMenuItem>
            
            <NavigationMenuItem className="flex justify-between w-full px-3 py-2 hover:bg-gray-100 rounded-md">
              <div className="flex items-center">
                <Wrench className="h-5 w-5 mr-3" />
                <span>Tools</span>
              </div>
              <Badge variant="secondary" className="bg-gray-100">10</Badge>
            </NavigationMenuItem>
            
            <NavigationMenuItem className="flex justify-between w-full px-3 py-2 hover:bg-gray-100 rounded-md">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3" />
                <span>People</span>
              </div>
              <Badge variant="secondary" className="bg-gray-100">128</Badge>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
      {/* Middle Panel - Email List */}
      <div className="w-1/3 border-r flex flex-col">
        <Tabs defaultValue="now" className="w-full">
          <div className="px-4 pt-4">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="now">Now</TabsTrigger>
              <TabsTrigger value="top">Top</TabsTrigger>
              <TabsTrigger value="todo">ToDo</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
            </TabsList>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search" 
                className="pl-10 bg-gray-50 border-gray-200" 
              />
            </div>
            
            <div className="flex space-x-2 mb-4">
              <Badge className="bg-gray-800 text-white hover:bg-gray-700">Meeting</Badge>
              <Badge variant="outline">Work</Badge>
            </div>
          </div>
          
          <TabsContent value="now" className="m-0">
            <div className="flex flex-col">
              {emails.map((email, index) => (
                <div 
                  key={email.id}
                  className={`border-b px-4 py-3 cursor-pointer hover:bg-gray-50 ${activeEmail === index ? 'bg-blue-50' : ''}`}
                  onClick={() => setActiveEmail(index)}
                >
                  <div className="flex justify-between mb-1">
                    <h3 className="font-medium">{email.subject}</h3>
                    <span className="text-xs text-gray-500">{email.time}</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">{email.sender}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{email.preview}</p>
                  <div className="flex space-x-2">
                    {email.tags.map((tag, i) => (
                      <Badge key={i} variant={i === 0 ? "default" : "outline"} className={i === 0 ? "bg-gray-800" : ""}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Right Panel - Email Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 flex-1">
          <div className="flex items-center mb-4">
            <Mail className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="font-medium">Company</h2>
            <p className="ml-auto text-sm text-gray-500">Gather insight and data for your company</p>
          </div>
          
          <div className="space-y-6 mb-4">
            {/* Repeated email content */}
            {[0, 1, 2].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-gray-700">
                    Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project
                    details and have some ideas I'd like to share. It's crucial that we align on our next steps to
                    ensure the project's success.
                  </p>
                </CardContent>
              </Card>
            ))}
            
            <p className="text-gray-700">Thanks, Emily</p>
          </div>
        </div>
        
        <div className="border-t p-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">Save</Button>
            <Button variant="outline" size="sm">Reply</Button>
            <Button variant="outline" size="sm">Forward</Button>
            <Button variant="outline" size="sm">Complete</Button>
          </div>
          <Button variant="outline" size="sm">Share</Button>
        </div>
        
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Badge variant="outline" className="bg-gray-100">@Teacher One</Badge>
            <Badge variant="outline" className="bg-gray-100">@Anthony O'Connell</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}