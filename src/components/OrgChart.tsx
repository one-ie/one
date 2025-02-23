import { motion } from "framer-motion";
import { Card } from "./ui/card";
import {
  Brain,
  Palette,
  FileText,
  Eye,
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
import { useState } from "react";

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
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 gap-8 sm:gap-12 relative">
        {/* Managing Director Card */}
        <motion.div 
          key="director" 
          className="mb-8 sm:mb-12 max-w-2xl mx-auto w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className={`p-6 sm:p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 ${activeDepartment === 'director' ? 'bg-primary/15 shadow-lg ring-2 ring-primary/20' : 'hover:bg-primary/5 hover:shadow-md'}`}
            onClick={() => {
              if (activeDepartment === 'director') {
                setActiveDepartment('');
                setVisibleStaff(new Set());
              } else {
                setActiveDepartment('director');
              }
            }}
          >
            <div className="flex flex-col items-center gap-4 sm:gap-6 relative">

              <div className={`p-3 sm:p-4 rounded-full transition-all duration-300 transform ${activeDepartment === 'director' ? 'bg-primary/20 scale-110' : 'bg-primary/10 hover:scale-105'}`}>
                <Brain className={`w-8 h-8 sm:w-12 sm:h-12 transition-colors duration-300 ${activeDepartment === 'director' ? 'text-primary' : 'text-primary/70'}`} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 text-primary">Managing Director</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Build your AI Director to orchestrate company vision and assemble a team of AI Directors</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 relative">
        {departments.map((dept, index) => (
          <motion.div 
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card
              className={`p-4 sm:p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 ${activeDepartment === dept.id ? 'bg-primary/15 shadow-lg ring-2 ring-primary/20' : 'hover:bg-primary/5 hover:shadow-md'}`}
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
              <div className="flex items-center gap-3 sm:gap-4 relative">
  
                <div className={`p-2 sm:p-3 rounded-full transition-all duration-300 transform ${activeDepartment === dept.id ? 'bg-primary/20 scale-110' : 'bg-primary/10 hover:scale-105'}`}>
                  <dept.icon className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${activeDepartment === dept.id ? 'text-primary' : 'text-primary/70'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-primary">{dept.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{dept.description}</p>
                </div>
              </div>
            </Card>
            <div className="mt-3 sm:mt-4">
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
                      className={`p-3 sm:p-4 mb-2 bg-background/50 backdrop-blur-sm transition-all duration-300 ${activeDepartment === dept.id ? 'hover:bg-primary/10 scale-105' : 'hover:bg-primary/5'}`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-full transition-colors duration-300 ${activeDepartment === dept.id ? 'bg-primary/20' : 'bg-primary/10'}`}>
                          <member.icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${activeDepartment === dept.id ? 'text-primary' : 'text-primary/70'}`} />
                        </div>
                        <div>
                          <h5 className="font-medium text-sm sm:text-base">{member.title}</h5>
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
    </div>
  );
}
