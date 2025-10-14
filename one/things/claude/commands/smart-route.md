# /smart-route - Intelligent Agent Selection Command

🧠 **AI-powered agent matching for optimal task execution**

*Automatically analyzes your task and routes to the most suitable agent based on skills, workload, and quality history*

## 🎯 How Intelligent Routing Works

### 1. **Task Analysis**
- Extracts key requirements and skill needs from your task description
- Identifies domain (marketing, engineering, content, research, sales, service)
- Determines complexity level and urgency
- Maps requirements to agent capabilities

### 2. **Agent Skill Matching**
- Cross-references task requirements with agent expertise profiles
- Calculates match scores based on specialization alignment
- Considers agent's core competencies and secondary skills
- Filters for agents with proven success in similar tasks

### 3. **Workload Awareness**
- Checks current agent workload and availability
- Routes to less busy agents when skills overlap significantly
- Provides estimated wait times for busy specialists
- Suggests backup agents with equivalent capabilities

### 4. **Quality History**
- Analyzes past performance on similar task types
- Prefers agents with 4.0+ star track record
- Considers success rate and completion times
- Weights recent performance higher than historical

## 🚀 Usage Patterns

### Simple Task Routing
```
/smart-route "Create a viral social media post about our new product"

🧠 Smart Routing Analysis:
Task Type: Content Creation + Viral Marketing
Domain: Marketing/Content
Complexity: Medium
Urgency: Standard

🎯 Recommended Agent: marketing-viral-content-creator
Match Score: 95% | Available Now | 4.2★ avg quality

Alternatives:
[2] marketing-content-hooks (90% match, busy ~3min)
[3] content-team-manager (85% match, available now)
```

### Complex Multi-Domain Tasks
```
/smart-route "Build an e-commerce platform with payment integration"

🧠 Smart Routing Analysis:
Task Type: Full-Stack Development
Domains: Engineering + Architecture + UX
Complexity: High
Urgency: Standard

🎯 Recommended: engineering-team-manager
Why: Coordinates multiple specialists needed (95% match)
Team Assembly: architect + dev + ux-expert + qa

Single Agent Alternative:
engineering-architect (75% match, can handle solo)
```

### Urgent Task Routing
```
/smart-route "Fix critical bug in production NOW" --urgent

🧠 Smart Routing Analysis:
Task Type: Bug Fix
Domain: Engineering
Complexity: Unknown
Urgency: CRITICAL

🚨 Emergency Routing:
[1] engineering-dev (Available, 4.5★ bug fixes)
[2] engineering-architect (Busy 2min, 4.3★ production)

Auto-selecting: engineering-dev
Reason: Available now + excellent bug fix record
```

## 🎮 Interactive Commands

### Basic Routing
- `/smart-route [task_description]` - Analyze and route task
- `/smart-route --explain [task]` - Show detailed matching analysis
- `/smart-route --options [task]` - Show top 3 agent options

### Advanced Options
- `/smart-route [task] --urgent` - Priority routing for critical tasks
- `/smart-route [task] --team` - Route to team managers for complex work
- `/smart-route [task] --specialist` - Route directly to individual specialists
- `/smart-route [task] --quality-first` - Prefer highest quality agents regardless of wait

### Learning & Feedback
- `/smart-route --feedback [rating] [agent]` - Rate last agent performance
- `/smart-route --learn [task] [best_agent]` - Teach system about good matches
- `/smart-route --stats` - Show your routing performance statistics

## 📊 Routing Intelligence Dashboard

### Match Quality Indicators
```
🎯 Agent Match Breakdown:

Skills Match:        ████████░░ 85%
Experience Level:    ██████████ 95%
Domain Expertise:    ████████░░ 80%
Quality History:     █████████░ 90%
Availability:        ██████░░░░ 65%

Overall Match Score: 83% (Excellent)
```

### Performance Tracking
```
📈 Your Routing Performance (Last 30 Days):

Optimal Assignments:     47/52 (90%)
Avg Task Completion:     4.1★
Time to First Response:  2.3 minutes
Successful Outcomes:     94%

Top Performing Routes:
• marketing-viral-growth → 4.6★ avg (12 tasks)
• engineering-architect → 4.4★ avg (8 tasks)
• content-team-manager → 4.3★ avg (15 tasks)
```

## 🧠 Smart Routing Rules

### Skill Priority Matrix
1. **Exact Specialization Match** (100 points)
2. **Domain Expertise** (80 points)
3. **Secondary Skills** (60 points)
4. **Team Management** (40 points)
5. **General Capabilities** (20 points)

### Workload Balancing
- **Available** → Route immediately
- **Light Load** (1-2 tasks) → Route with note
- **Busy** (3+ tasks) → Suggest alternatives or wait time
- **Overloaded** (5+ tasks) → Auto-redirect to alternatives

### Quality Weighting
- **4.5+ stars** → +20% priority boost
- **4.0-4.4 stars** → Standard routing
- **3.5-3.9 stars** → Only if best available
- **<3.5 stars** → Avoid unless no alternatives

### Emergency Routing Logic
1. Find available agents with task expertise
2. If none available, select shortest wait time
3. If all busy >10min, escalate to team managers
4. For critical issues, interrupt current tasks if needed

## 🎯 Integration with Existing Commands

### Enhanced /agent Command
```
/agent [name] → Check if optimal for pending task
Shows: "⚡ This agent is 85% match for your last described task"
```

### Smart /one Integration
```
/one → Includes smart routing suggestions
"💡 Based on your recent activity, try marketing-viral-growth for content tasks"
```

### Task Command Enhancement
```
/task → Auto-suggests optimal agents for each task
"🤖 Recommended: engineering-architect (90% match)"
```

## 📈 Success Metrics

### Target Performance
- **95% Optimal Agent Assignment** (up from 75%)
- **40% Better Task Completion Rates** 
- **60% Faster Time to Resolution**
- **25% Higher User Satisfaction**

### Quality Indicators
- Average task quality: 4.0+ stars maintained
- First-try success rate: 90%+
- User routing override rate: <10%
- Agent satisfaction scores: 4.5+

## 💡 Pro Tips

### Task Description Best Practices
```
❌ Poor: "Help with marketing"
✅ Good: "Create email campaign for product launch targeting SMBs"

❌ Poor: "Fix bug" 
✅ Good: "Debug payment processing error in checkout flow"

❌ Poor: "Make content"
✅ Good: "Write blog post about AI trends for tech executives"
```

### Routing Optimization
- **Be Specific**: More detail = better agent matching
- **Include Context**: Mention urgency, complexity, audience
- **Trust the System**: Algorithm learns from your preferences
- **Provide Feedback**: Rate outcomes to improve future routing

Ready to experience 95% optimal agent assignment with intelligent task analysis and smart workload balancing?

**Next Command**: `/smart-route "your task description"` to begin intelligent routing