import { motion } from "framer-motion";
import { Card } from "./ui/card";
import {
  Brain,
  Palette,
  FileText,
  Eye,
  MessageCircle,
  Users,
  Globe,
  LifeBuoy,
  Target,
  TrendingUp,
  FileSearch,
  MessageSquare,
  Shield,
  Bot,
  ArrowUpRight,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";

export type IconComponent = typeof Brain | typeof Palette | typeof FileText; // etc...

export interface TeamMember {
  title: string;
  description: string;
  icon: IconComponent;
}

export interface Department {
  id: string;
  title: string;
  description: string;
  icon: IconComponent;
  team: TeamMember[];
}

const departments: Department[] = [
  {
    id: 'content',
    title: 'Director of Content',
    description: 'Orchestrates AI content creation',
    icon: FileText,
    team: [
      {
        title: 'Content Strategist',
        description: 'Plans AI-driven content roadmap',
        icon: Brain
      },
      {
        title: 'Editorial Manager',
        description: 'Oversees AI content quality',
        icon: Eye
      },
      {
        title: 'Content Engineer',
        description: 'Builds AI content systems',
        icon: Bot
      },
      {
        title: 'Knowledge Curator',
        description: 'Manages AI learning data',
        icon: FileSearch
      },
      {
        title: 'Content Optimizer',
        description: 'Enhances AI output quality',
        icon: Zap
      },
      {
        title: 'Content Analyst',
        description: 'Analyzes content performance',
        icon: TrendingUp
      },
      {
        title: 'Localization Specialist',
        description: 'Adapts content for global markets',
        icon: Globe
      },
      {
        title: 'Quality Assurance',
        description: 'Ensures content excellence',
        icon: Shield
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Director of Marketing',
    description: 'Drives brand awareness and growth',
    icon: Target,
    team: [
      {
        title: 'Marketing Strategist',
        description: 'Develops marketing strategies',
        icon: Target
      },
      {
        title: 'Social Media Manager',
        description: 'Manages social media presence',
        icon: Globe
      },
      {
        title: 'Analytics Expert',
        description: 'Analyzes marketing performance',
        icon: TrendingUp
      },
      {
        title: 'Brand Designer',
        description: 'Creates visual brand assets',
        icon: Palette
      },
      {
        title: 'Campaign Manager',
        description: 'Orchestrates marketing campaigns',
        icon: Target
      },
      {
        title: 'Content Marketer',
        description: 'Creates marketing content',
        icon: FileText
      },
      {
        title: 'Digital Ads Specialist',
        description: 'Manages online advertising',
        icon: Zap
      },
      {
        title: 'Market Researcher',
        description: 'Studies market trends',
        icon: FileSearch
      }
    ]
  },
  {
    id: 'sales',
    title: 'Director of Sales',
    description: 'Maximizes revenue generation',
    icon: ArrowUpRight,
    team: [
      {
        title: 'Lead Generator',
        description: 'Identifies potential customers',
        icon: Users
      },
      {
        title: 'Sales Consultant',
        description: 'Provides product guidance',
        icon: MessageSquare
      },
      {
        title: 'Deal Closer',
        description: 'Finalizes sales agreements',
        icon: Shield
      },
      {
        title: 'Market Researcher',
        description: 'Analyzes market opportunities',
        icon: FileSearch
      },
      {
        title: 'Revenue Optimizer',
        description: 'Maximizes sales performance',
        icon: Zap
      },
      {
        title: 'Account Manager',
        description: 'Maintains client relationships',
        icon: Users
      },
      {
        title: 'Sales Trainer',
        description: 'Develops sales team skills',
        icon: Brain
      },
      {
        title: 'Pipeline Manager',
        description: 'Optimizes sales pipeline',
        icon: TrendingUp
      }
    ]
  },
  {
    id: 'service',
    title: 'Director of Service',
    description: 'Leads customer experience and support',
    icon: LifeBuoy,
    team: [
      {
        title: 'Support Lead',
        description: 'Manages support operations',
        icon: Users
      },
      {
        title: 'AI Support Engineer',
        description: 'Develops AI support solutions',
        icon: Bot
      },
      {
        title: 'Customer Success Manager',
        description: 'Ensures client satisfaction',
        icon: Target
      },
      {
        title: 'Support Analyst',
        description: 'Analyzes support metrics',
        icon: TrendingUp
      },
      {
        title: 'Experience Designer',
        description: 'Optimizes service interactions',
        icon: Palette
      },
      {
        title: 'Knowledge Manager',
        description: 'Maintains support resources',
        icon: FileText
      },
      {
        title: 'Quality Assurance',
        description: 'Monitors service quality',
        icon: Shield
      },
      {
        title: 'Training Coordinator',
        description: 'Develops support training',
        icon: Brain
      }
    ]
  },
  {
    id: 'education',
    title: 'Director of Education',
    description: 'Manages learning and development',
    icon: Brain,
    team: [
      {
        title: 'Learning Architect',
        description: 'Designs educational programs',
        icon: Brain
      },
      {
        title: 'Content Developer',
        description: 'Creates learning materials',
        icon: FileText
      },
      {
        title: 'Education Analyst',
        description: 'Measures learning outcomes',
        icon: TrendingUp
      },
      {
        title: 'Training Coordinator',
        description: 'Organizes learning sessions',
        icon: Users
      },
      {
        title: 'AI Learning Engineer',
        description: 'Implements AI learning tools',
        icon: Bot
      },
      {
        title: 'Curriculum Designer',
        description: 'Structures learning paths',
        icon: Target
      },
      {
        title: 'Education Tech Specialist',
        description: 'Manages learning platforms',
        icon: Globe
      },
      {
        title: 'Student Success Manager',
        description: 'Supports learner progress',
        icon: Shield
      }
    ]
  },
  {
    id: 'engineering',
    title: 'Director of Engineering',
    description: 'Leads technical development',
    icon: Bot,
    team: [
      {
        title: 'Tech Lead',
        description: 'Guides technical direction',
        icon: Brain
      },
      {
        title: 'AI Engineer',
        description: 'Develops AI systems',
        icon: Bot
      },
      {
        title: 'System Architect',
        description: 'Designs system infrastructure',
        icon: Globe
      },
      {
        title: 'QA Engineer',
        description: 'Ensures product quality',
        icon: Shield
      },
      {
        title: 'DevOps Engineer',
        description: 'Manages deployment pipeline',
        icon: Zap
      },
      {
        title: 'Security Engineer',
        description: 'Protects system integrity',
        icon: Shield
      },
      {
        title: 'Data Scientist',
        description: 'Analyzes AI performance',
        icon: TrendingUp
      },
      {
        title: 'Frontend Engineer',
        description: 'Builds user interfaces',
        icon: Palette
      }
    ]
  }
];

export default function OrgChart() {
  const [activeDepartment, setActiveDepartment] = useState<string>('');
  const [visibleStaff, setVisibleStaff] = useState<Set<string>>(new Set());

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 gap-8 relative">
        {/* Managing Director Card */}
        <motion.div key="director" className="mb-8">
          <Card
            className={`p-6 cursor-pointer transition-all duration-300 ${activeDepartment === 'director' ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
            onClick={() => {
              if (activeDepartment === 'director') {
                setActiveDepartment('');
                setVisibleStaff(new Set());
              } else {
                setActiveDepartment('director');
              }
            }}
          >
            <div className="flex items-center gap-4 justify-center">
              <div className={`p-3 rounded-full transition-colors duration-300 ${activeDepartment === 'director' ? 'bg-primary/20' : 'bg-primary/10'}`}>
                <Brain className={`w-8 h-8 transition-colors duration-300 ${activeDepartment === 'director' ? 'text-primary' : 'text-primary/70'}`} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-xl">Managing Director</h3>
                <p className="text-sm text-muted-foreground">Orchestrates company vision and strategy</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Department Grid */}
        <div className="grid md:grid-cols-3 gap-8 relative">
        {departments.map((dept) => (
          <motion.div key={dept.id}>
            <Card
              className={`p-6 cursor-pointer transition-all duration-300 ${activeDepartment === dept.id ? 'bg-primary/10' : 'hover:bg-primary/5'}`}
              onClick={() => {
                if (activeDepartment === dept.id) {
                  setActiveDepartment('');
                  setVisibleStaff(new Set());
                } else {
                  setActiveDepartment(dept.id);
                  setVisibleStaff(new Set(dept.team.map((_, i) => `${dept.id}-${i}`)));
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full transition-colors duration-300 ${activeDepartment === dept.id ? 'bg-primary/20' : 'bg-primary/10'}`}>
                  <dept.icon className={`w-6 h-6 transition-colors duration-300 ${activeDepartment === dept.id ? 'text-primary' : 'text-primary/70'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{dept.title}</h3>
                  <p className="text-sm text-muted-foreground">{dept.description}</p>
                </div>
              </div>
            </Card>
            <div className="mt-4">
              {dept.team.map((member, mIndex) => {
                const staffId = `${dept.id}-${mIndex}`;
                const isVisible = visibleStaff.has(staffId);

                return (
                  <motion.div
                    key={staffId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: isVisible ? 1 : 0,
                      x: isVisible ? 0 : -20,
                      height: isVisible ? 'auto' : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card
                      className={`p-4 mb-2 bg-background/50 backdrop-blur-sm transition-all duration-300 ${activeDepartment === dept.id ? 'hover:bg-primary/10 scale-105' : 'hover:bg-primary/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full transition-colors duration-300 ${activeDepartment === dept.id ? 'bg-primary/20' : 'bg-primary/10'}`}>
                          <member.icon className={`w-5 h-5 transition-colors duration-300 ${activeDepartment === dept.id ? 'text-primary' : 'text-primary/70'}`} />
                        </div>
                        <div>
                          <h5 className="font-medium">{member.title}</h5>
                          <p className="text-xs text-muted-foreground">{member.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
    </div>
  );
}
