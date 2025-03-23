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
    id: 'strategy',
    title: 'Marketing Strategy Manager',
    description: 'Develops strategic marketing initiatives with AI insights',
    icon: Brain,
    team: [
      {
        title: 'Marketing Ops Specialist',
        description: 'Optimizes marketing processes with AI automation',
        icon: Zap
      },
      {
        title: 'Strategic Planning Analyst',
        description: 'Develops data-driven strategies with AI forecasting',
        icon: Target
      },
      {
        title: 'Brand Strategist',
        description: 'Shapes brand positioning with AI audience analysis',
        icon: Eye
      }
    ]
  },
  {
    id: 'growth',
    title: 'Growth Marketing Manager',
    description: 'Drives acquisition and retention with AI',
    icon: TrendingUp,
    team: [
      {
        title: 'Conversion Specialist',
        description: 'Maximizes conversion rates with AI testing',
        icon: ArrowUpRight
      },
      {
        title: 'Customer Journey Analyst',
        description: 'Maps personalized journeys with AI prediction',
        icon: Users
      },
      {
        title: 'Growth Hacking Specialist',
        description: 'Identifies growth opportunities using AI analysis',
        icon: Zap
      }
    ]
  },
  {
    id: 'digital',
    title: 'Digital Marketing Manager',
    description: 'Orchestrates digital channels with AI integration',
    icon: Globe,
    team: [
      {
        title: 'SEO/SEM Specialist',
        description: 'Optimizes search performance with AI algorithms',
        icon: FileSearch
      },
      {
        title: 'Paid Media Coordinator',
        description: 'Manages campaigns with AI bid optimization',
        icon: Target
      },
      {
        title: 'Marketing Automation Specialist',
        description: 'Builds intelligent workflows with AI triggers',
        icon: Bot
      }
    ]
  },
  {
    id: 'content',
    title: 'Content Marketing Manager',
    description: 'Guides content creation with AI insights',
    icon: FileText,
    team: [
      {
        title: 'Content Operations Specialist',
        description: 'Streamlines content workflow with AI tools',
        icon: Target
      },
      {
        title: 'Senior Content Creator',
        description: 'Produces premium content enhanced by AI',
        icon: Palette
      },
      {
        title: 'Content Analytics Specialist',
        description: 'Measures content performance with AI metrics',
        icon: TrendingUp
      }
    ]
  },
  {
    id: 'brand',
    title: 'Brand Marketing Manager',
    description: 'Crafts brand experiences with AI personalization',
    icon: Palette,
    team: [
      {
        title: 'Creative Lead',
        description: 'Leads creative strategy with AI-generated concepts',
        icon: Eye
      },
      {
        title: 'Brand Identity Specialist',
        description: 'Maintains brand consistency using AI monitoring',
        icon: Shield
      },
      {
        title: 'Design Systems Specialist',
        description: 'Creates scalable design frameworks with AI assistance',
        icon: Palette
      }
    ]
  },
  {
    id: 'social',
    title: 'Social Media Manager',
    description: 'Drives social engagement with AI-powered strategy',
    icon: MessageSquare,
    team: [
      {
        title: 'Community Manager',
        description: 'Nurtures online communities with AI sentiment analysis',
        icon: Users
      },
      {
        title: 'Social Content Creator',
        description: 'Creates viral content using AI trend prediction',
        icon: FileText
      },
      {
        title: 'Social Analytics Specialist',
        description: 'Tracks performance with AI-powered dashboards',
        icon: TrendingUp
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Marketing Analytics Manager',
    description: 'Transforms data into insights with AI',
    icon: Brain,
    team: [
      {
        title: 'Data Science Specialist',
        description: 'Builds predictive marketing models with AI',
        icon: FileSearch
      },
      {
        title: 'Marketing Analyst',
        description: 'Creates attribution models with AI algorithms',
        icon: TrendingUp
      },
      {
        title: 'Consumer Insights Analyst',
        description: 'Uncovers customer behaviors with AI pattern recognition',
        icon: Eye
      }
    ]
  },
  {
    id: 'product',
    title: 'Product Marketing Manager',
    description: 'Positions products with AI-driven insights',
    icon: Target,
    team: [
      {
        title: 'Market Research Specialist',
        description: 'Conducts research enhanced by AI data mining',
        icon: FileSearch
      },
      {
        title: 'Competitive Intelligence Analyst',
        description: 'Monitors competitors with AI tracking systems',
        icon: Shield
      },
      {
        title: 'Go-to-Market Coordinator',
        description: 'Plans launches using AI forecasting models',
        icon: ArrowUpRight
      }
    ]
  },
  {
    id: 'customer',
    title: 'Customer Marketing Manager',
    description: 'Enhances customer experience with AI personalization',
    icon: Users,
    team: [
      {
        title: 'Loyalty Program Specialist',
        description: 'Designs retention programs with AI-predicted behaviors',
        icon: Target
      },
      {
        title: 'Customer Success Coordinator',
        description: 'Improves satisfaction using AI-powered insights',
        icon: LifeBuoy
      },
      {
        title: 'Voice of Customer Analyst',
        description: 'Captures feedback with AI sentiment analysis',
        icon: MessageSquare
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
        {/* Marketing Director Card */}
        <motion.div
          key="marketing"
          className="mb-8 sm:mb-12 max-w-2xl mx-auto w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className={`p-6 sm:p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 ${activeDepartment === 'marketing' ? 'bg-primary/15 shadow-lg ring-2 ring-primary/20' : 'hover:bg-primary/5 hover:shadow-md'}`}
            onClick={() => {
              if (activeDepartment === 'marketing') {
                setActiveDepartment('');
                setVisibleStaff(new Set());
              } else {
                setActiveDepartment('marketing');
              }
            }}
          >
            <div className="flex flex-col items-center gap-4 sm:gap-6 relative">
              <div className={`p-3 sm:p-4 rounded-full transition-all duration-300 transform ${activeDepartment === 'marketing' ? 'bg-primary/20 scale-110' : 'bg-primary/10 hover:scale-105'}`}>
                <Target className={`w-8 h-8 sm:w-12 sm:h-12 transition-colors duration-300 ${activeDepartment === 'marketing' ? 'text-primary' : 'text-primary/70'}`} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl sm:text-2xl mb-2 text-primary">Director of Marketing</h3>
                <p className="text-sm sm:text-base text-muted-foreground">Drives brand awareness and growth through strategic marketing initiatives</p>
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
