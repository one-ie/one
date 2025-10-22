# Education Ontology - Universities, Schools, Teachers

**Version:** 1.0.0
**Status:** Complete - Universal Education Model
**Extends:** Core Universal Ontology
**Principle:** This ontology models ANY educational institution - from individual teachers to universities - using the 6-dimension model.

---

## Philosophy: Education as a Living System

Traditional LMS platforms (Blackboard, Canvas, Moodle) treat education as content delivery. This ontology models education as a **living system** where:

- **Students learn** through courses, assignments, and assessments
- **Teachers teach** by creating content and guiding students
- **Institutions organize** programs, departments, and curricula
- **Knowledge grows** through interactions, completions, and mastery
- **Communities form** around shared learning experiences

This ontology works for:
- 👨‍🏫 **Individual Teachers** - Course creation, student management
- 🏫 **Schools** - K-12 education, multiple teachers, grade levels
- 🎓 **Universities** - Departments, programs, degrees, research
- 📚 **Training Organizations** - Corporate training, certifications
- 🌐 **Online Academies** - MOOCs, bootcamps, cohort-based courses

---

## GROUPS: Educational Organizations

Uses hierarchical groups for nested educational structures:

```typescript
{
  _id: Id<'groups'>,
  slug: string,
  name: string,
  type: 'organization',  // Educational institutions are organizations
  parentGroupId?: Id<'groups'>,  // Enables hierarchy

  // Educational metadata
  metadata: {
    institutionType: 'teacher' | 'school' | 'university' | 'training_org' | 'online_academy',

    // Accreditation & recognition
    accreditation?: {
      body: string,
      status: 'accredited' | 'pending' | 'none',
      validUntil?: number,
    },

    // Academic calendar
    calendar: {
      type: 'semester' | 'trimester' | 'quarter' | 'year_round',
      currentTerm?: string,  // e.g., "Fall 2025"
      termStart?: number,
      termEnd?: number,
    },

    // Grading system
    gradingSystem: {
      type: 'letter' | 'percentage' | 'points' | 'pass_fail',
      scale: {
        'A': { min: 90, max: 100 },
        'B': { min: 80, max: 89 },
        // etc.
      },
      passingGrade: string | number,
    },
  },

  // Contact (inherited from core)
  contact: {
    email: string,
    phone: string,
    address: {
      street: string,
      city: string,
      state: string,
      country: string,
      postalCode: string,
    },
    website: string,
  },

  // SEO (inherited from core)
  seo: { /* ... */ },

  // Settings
  settings: {
    visibility: 'public' | 'private',
    enrollment: 'open' | 'application_required' | 'invite_only',
    plan: 'starter' | 'pro' | 'enterprise',
  },
}
```

### Example Hierarchies

**University Structure:**
```
University (parent group)
  ├─ School of Engineering (child group)
  │   ├─ Computer Science Dept (grandchild group)
  │   ├─ Electrical Engineering Dept
  │   └─ Mechanical Engineering Dept
  ├─ School of Business
  │   ├─ Finance Dept
  │   └─ Marketing Dept
  └─ School of Arts & Sciences
      ├─ Mathematics Dept
      └─ Physics Dept
```

**School District Structure:**
```
School District (parent group)
  ├─ Lincoln High School (child group)
  ├─ Washington Middle School
  └─ Jefferson Elementary School
```

**Individual Teacher:**
```
Jane Doe's Academy (single group)
  ├─ No children - independent teacher
```

---

## PEOPLE: Educational Roles

Uses existing people roles + education-specific permissions:

```typescript
{
  _id: Id<'people'>,
  email: string,
  username: string,
  displayName: string,

  role: 'platform_owner' | 'group_owner' | 'group_user' | 'customer',

  // Education-specific role mapping
  // group_owner → University Admin, School Principal, Teacher
  // group_user → Department Head, Assistant Teacher, TA
  // customer → Student, Parent, Guest

  permissions: [
    // Teaching permissions
    'create_course',
    'grade_assignments',
    'manage_students',

    // Admin permissions
    'manage_teachers',
    'manage_curriculum',
    'manage_enrollment',
    'view_analytics',

    // Student permissions
    'enroll_in_courses',
    'submit_assignments',
    'view_grades',
  ],

  profile: {
    avatar: string,
    bio: string,

    // Education-specific profile
    educationProfile?: {
      // For teachers
      credentials?: string[],  // ['PhD Computer Science', 'MS Education']
      specializations?: string[],  // ['Machine Learning', 'Data Science']
      yearsExperience?: number,

      // For students
      studentId?: string,
      gradeLevel?: string,  // 'Freshman', 'Sophomore', 'Grade 10', etc.
      graduationYear?: number,
      gpa?: number,

      // For institutions
      institutionId?: string,
    },
  },
}
```

---

## THINGS: Education-Specific Types

Extends core ontology with 30+ education-specific thing types:

```typescript
type EducationThingType =
  // Academic Structure
  | "department"              // Academic department
  | "program"                 // Degree/diploma program
  | "curriculum"              // Structured learning path
  | "academic_year"           // School year container
  | "semester"                // Term/semester
  | "class_period"            // Scheduled class time
  | "classroom"               // Physical/virtual room

  // Courses & Content
  | "course"                  // Academic course
  | "course_section"          // Specific instance of course
  | "lesson"                  // Individual lesson/lecture
  | "module"                  // Collection of lessons
  | "unit"                    // Topic grouping
  | "lecture_notes"           // Lecture materials
  | "reading_material"        // Required/optional readings
  | "video_lecture"           // Recorded lectures
  | "lab"                     // Laboratory session
  | "tutorial"                // Tutorial/recitation

  // Assessments
  | "assignment"              // Homework/project
  | "quiz"                    // Short assessment
  | "exam"                    // Formal examination
  | "midterm"                 // Mid-term exam
  | "final_exam"              // Final exam
  | "project"                 // Long-term project
  | "presentation"            // Student presentation
  | "discussion"              // Discussion prompt

  // Submissions & Grading
  | "submission"              // Student work submitted
  | "grade"                   // Grade record
  | "rubric"                  // Grading criteria
  | "feedback"                // Teacher feedback
  | "peer_review"             // Peer assessment

  // Achievements & Progress
  | "certificate"             // Completion certificate
  | "degree"                  // Degree awarded
  | "diploma"                 // Diploma awarded
  | "badge"                   // Skill badge
  | "transcript"              // Academic transcript
  | "credit"                  // Course credit
  | "attendance_record"       // Attendance tracking

  // Resources
  | "textbook"                // Course textbook
  | "syllabus"                // Course syllabus
  | "calendar"                // Academic calendar
  | "schedule"                // Class schedule
  | "office_hours"            // Teacher availability

  // Communication
  | "announcement"            // Course announcements
  | "discussion_thread"       // Discussion board
  | "message"                 // Direct messages
  | "question"                // Q&A forum

  // Administration
  | "enrollment"              // Student enrollment record
  | "waitlist"                // Course waitlist
  | "prerequisite"            // Course requirement
  | "corequisite"             // Co-enrollment requirement
  | "learning_objective"      // Course objective
  | "competency"              // Skill competency
  | "accreditation"           // Accreditation record;
```

---

## CONNECTIONS: Education-Specific Relationships

```typescript
type EducationConnectionType =
  // Course Structure
  | "teaches"                 // teacher → course
  | "assists_with"            // TA → course
  | "enrolled_in"             // student → course
  | "auditing"                // student → course (non-credit)
  | "waitlisted_for"          // student → course

  // Hierarchy
  | "part_of_program"         // course → program
  | "part_of_curriculum"      // course → curriculum
  | "in_department"           // course → department
  | "prerequisite_for"        // course → course
  | "corequisite_with"        // course → course

  // Content Relationships
  | "assigned_to"             // assignment → course
  | "submitted_for"           // submission → assignment
  | "graded_by"               // submission → teacher
  | "peer_reviewed_by"        // submission → student

  // Achievements
  | "completed"               // student → course
  | "passed"                  // student → course
  | "failed"                  // student → course
  | "earned"                  // student → degree/certificate
  | "awarded"                 // student → badge

  // Mentorship & Guidance
  | "advises"                 // advisor → student
  | "mentors"                 // mentor → mentee
  | "supervises"              // professor → grad_student

  // Collaboration
  | "collaborates_with"       // student → student (group work)
  | "group_member"            // student → project

  // Resources
  | "uses_textbook"           // course → textbook
  | "requires_reading"        // lesson → reading_material

  // Administrative
  | "accredited_by"           // program → accreditation_body
  | "affiliated_with"         // institution → institution;
```

---

## EVENTS: Education-Specific Actions

```typescript
type EducationEventType =
  // Enrollment Events
  | "student_enrolled"        // Student enrolled in course
  | "student_dropped"         // Student dropped course
  | "student_waitlisted"      // Added to waitlist
  | "student_admitted"        // Admitted to program
  | "student_graduated"       // Graduated from program

  // Academic Events
  | "course_created"          // New course created
  | "course_published"        // Course made available
  | "course_completed"        // Student finished course
  | "lesson_viewed"           // Lesson accessed
  | "lesson_completed"        // Lesson marked complete
  | "module_completed"        // Module finished

  // Assessment Events
  | "assignment_created"      // Assignment created
  | "assignment_published"    // Assignment made available
  | "assignment_submitted"    // Student submitted work
  | "assignment_graded"       // Teacher graded work
  | "quiz_started"            // Quiz begun
  | "quiz_submitted"          // Quiz completed
  | "exam_scheduled"          // Exam date set
  | "exam_taken"              // Exam completed

  // Grading Events
  | "grade_posted"            // Grade published
  | "grade_updated"           // Grade changed
  | "feedback_provided"       // Teacher feedback given
  | "peer_review_completed"   // Peer review done

  // Achievements
  | "certificate_earned"      // Certificate awarded
  | "degree_conferred"        // Degree granted
  | "badge_awarded"           // Badge earned
  | "credit_awarded"          // Credit granted

  // Communication
  | "announcement_posted"     // Course announcement
  | "discussion_posted"       // Discussion thread created
  | "question_asked"          // Question posted
  | "question_answered"       // Answer provided
  | "message_sent"            // Direct message

  // Attendance
  | "attendance_marked"       // Attendance recorded
  | "absence_recorded"        // Absence noted
  | "tardy_recorded"          // Late arrival

  // Progress Tracking
  | "progress_updated"        // Progress milestone
  | "competency_achieved"     // Skill mastered
  | "learning_objective_met"  // Objective completed

  // Administrative
  | "semester_started"        // Term began
  | "semester_ended"          // Term completed
  | "office_hours_scheduled"  // Availability set
  | "meeting_scheduled"       // Meeting arranged

  // Analytics
  | "time_spent_learning"     // Learning time tracked
  | "engagement_tracked"      // Activity measured
  | "performance_analyzed"    // Analysis run;
```

---

## KNOWLEDGE: Education Context

Extends core knowledge with education-specific labels:

```typescript
{
  _id: Id<'knowledge'>,
  knowledgeType: 'label' | 'document' | 'chunk' | 'vector_only',

  // Education-specific labels
  labels: [
    // Subjects
    'subject:mathematics',
    'subject:science',
    'subject:english',
    'subject:history',
    'subject:computer_science',

    // Grade Levels
    'grade:k-5',
    'grade:6-8',
    'grade:9-12',
    'grade:undergraduate',
    'grade:graduate',
    'grade:postdoc',

    // Difficulty
    'difficulty:beginner',
    'difficulty:intermediate',
    'difficulty:advanced',
    'difficulty:expert',

    // Learning Styles
    'style:visual',
    'style:auditory',
    'style:kinesthetic',
    'style:reading_writing',

    // Content Type
    'type:lecture',
    'type:lab',
    'type:tutorial',
    'type:assignment',
    'type:assessment',

    // Learning Objectives (Bloom's Taxonomy)
    'objective:remember',
    'objective:understand',
    'objective:apply',
    'objective:analyze',
    'objective:evaluate',
    'objective:create',

    // Competencies
    'competency:critical_thinking',
    'competency:problem_solving',
    'competency:communication',
    'competency:collaboration',

    // Credentials
    'credential:certificate',
    'credential:diploma',
    'credential:degree',
    'credential:license',
  ],
}
```

---

## Property Schemas by Thing Type

### Course

```typescript
{
  _id: Id<'things'>,
  type: 'course',
  name: string,  // "Introduction to Computer Science"

  properties: {
    // Basic Info
    code: string,              // "CS 101"
    description: string,
    syllabus: string,          // Full syllabus text

    // Academic Details
    credits: number,           // 3, 4, etc.
    level: 'undergraduate' | 'graduate' | 'postdoc' | 'k12',
    department: string,

    // Schedule
    schedule: {
      days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday')[],
      startTime: string,       // "09:00"
      endTime: string,         // "10:30"
      location: string,        // "Room 302" or "Online"
    },

    // Duration
    duration: {
      weeks: number,
      hoursPerWeek: number,
      totalHours: number,
    },

    // Enrollment
    capacity: number,
    enrolled: number,
    waitlist: number,

    // Prerequisites
    prerequisites: Id<'things'>[],  // Other course IDs
    corequisites: Id<'things'>[],

    // Grading
    gradingPolicy: {
      assignments: number,     // 30% weight
      quizzes: number,         // 20%
      midterm: number,         // 20%
      final: number,           // 30%
      attendance: number,      // 0%
    },

    // Learning Outcomes
    learningObjectives: string[],
    competencies: string[],

    // Materials
    textbooks: {
      title: string,
      author: string,
      isbn: string,
      required: boolean,
    }[],

    // Settings
    allowLateSubmissions: boolean,
    latePenalty: number,       // Percentage per day
    allowDiscussions: boolean,
    allowPeerReview: boolean,
  },

  status: 'draft' | 'published' | 'active' | 'completed' | 'archived',
  groupId: Id<'groups'>,       // Department or institution
  createdAt: number,
  updatedAt: number,
}
```

### Assignment

```typescript
{
  _id: Id<'things'>,
  type: 'assignment',
  name: string,  // "Problem Set 1"

  properties: {
    // Basic Info
    description: string,
    instructions: string,

    // Linked Resources
    courseId: Id<'things'>,
    lessonId?: Id<'things'>,

    // Timing
    dueDate: number,
    availableFrom?: number,
    availableUntil?: number,
    estimatedTime: number,     // Minutes

    // Grading
    points: number,            // Total points
    rubric?: {
      criteria: string,
      points: number,
      description: string,
    }[],

    // Submission
    submissionType: 'text' | 'file' | 'url' | 'quiz' | 'code',
    allowedFileTypes?: string[],
    maxFileSize?: number,      // MB
    maxSubmissions?: number,

    // Settings
    allowLate: boolean,
    latePenalty?: number,
    requirePeerReview: boolean,
    peerReviewCount?: number,

    // Auto-grading (for quizzes/code)
    autoGrade: boolean,
    correctAnswers?: any,
    testCases?: any,
  },

  status: 'draft' | 'published' | 'active' | 'closed' | 'graded',
  groupId: Id<'groups'>,
  createdAt: number,
  updatedAt: number,
}
```

### Submission

```typescript
{
  _id: Id<'things'>,
  type: 'submission',
  name: string,  // "John Doe - Problem Set 1"

  properties: {
    // Links
    assignmentId: Id<'things'>,
    studentId: Id<'people'>,
    courseId: Id<'things'>,

    // Submission Data
    content?: string,          // Text submission
    files?: {
      name: string,
      url: string,
      size: number,
    }[],
    url?: string,              // External submission

    // Timing
    submittedAt: number,
    attemptNumber: number,
    isLate: boolean,
    minutesLate?: number,

    // Grading
    grade?: number,
    pointsEarned?: number,
    pointsPossible: number,
    letterGrade?: string,
    feedback?: string,
    rubricScores?: {
      criteria: string,
      pointsEarned: number,
      pointsPossible: number,
      feedback?: string,
    }[],

    // Grader Info
    gradedBy?: Id<'people'>,
    gradedAt?: number,

    // Peer Review
    peerReviews?: {
      reviewerId: Id<'people'>,
      rating: number,
      comments: string,
      submittedAt: number,
    }[],

    // Flags
    flaggedForReview: boolean,
    plagiarismScore?: number,
  },

  status: 'submitted' | 'grading' | 'graded' | 'returned' | 'resubmit',
  groupId: Id<'groups'>,
  createdAt: number,
  updatedAt: number,
}
```

### Enrollment

```typescript
{
  _id: Id<'things'>,
  type: 'enrollment',
  name: string,  // "John Doe - CS 101"

  properties: {
    // Links
    studentId: Id<'people'>,
    courseId: Id<'things'>,
    semesterId?: Id<'things'>,

    // Enrollment Details
    enrolledAt: number,
    enrollmentType: 'credit' | 'audit' | 'guest',

    // Progress
    progress: {
      lessonsCompleted: number,
      lessonsTotal: number,
      percentComplete: number,
      lastAccessedAt: number,
    },

    // Performance
    currentGrade: number,
    letterGrade?: string,
    gpa?: number,

    // Attendance
    attendanceRate: number,    // Percentage
    absences: number,
    tardies: number,

    // Engagement
    participationScore?: number,
    discussionPosts: number,
    questionsAsked: number,

    // Completion
    completedAt?: number,
    passed?: boolean,
    creditsEarned?: number,
    certificateId?: Id<'things'>,
  },

  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'failed',
  groupId: Id<'groups'>,
  createdAt: number,
  updatedAt: number,
}
```

---

## Use Cases

### Individual Teacher (Jane's Math Academy)

```yaml
Group Setup:
  - name: "Jane's Math Academy"
  - type: organization
  - institutionType: teacher

People:
  - Jane Doe (group_owner, teacher)
  - 30 students (customer role)

Courses:
  - Algebra 1 (15 students)
  - Geometry (15 students)

Features Enabled:
  - courses (course creation)
  - assignments (homework)
  - grading (grade tracking)
  - analytics (student progress)
```

### K-12 School (Lincoln High School)

```yaml
Group Setup:
  - name: "Lincoln High School"
  - type: organization
  - institutionType: school
  - children: [9th Grade, 10th Grade, 11th Grade, 12th Grade]

People:
  - Principal (group_owner)
  - 50 teachers (group_user)
  - 1000 students (customer)

Departments:
  - Mathematics Dept (child group)
  - Science Dept (child group)
  - English Dept (child group)

Courses:
  - 200+ courses across all grades

Features Enabled:
  - courses
  - assignments
  - grading
  - attendance
  - transcripts
  - parent_portal
  - analytics
```

### University (MIT)

```yaml
Group Setup:
  - name: "Massachusetts Institute of Technology"
  - type: organization
  - institutionType: university
  - children: [School of Engineering, School of Science, ...]

Hierarchy:
  MIT (parent)
    ├─ School of Engineering (child)
    │   ├─ Computer Science Dept (grandchild)
    │   ├─ Electrical Engineering Dept
    │   └─ Mechanical Engineering Dept
    └─ School of Science
        ├─ Mathematics Dept
        └─ Physics Dept

People:
  - University Admin (platform_owner)
  - Dean per school (group_owner at school level)
  - Department Heads (group_owner at dept level)
  - 1000+ professors (group_user)
  - 10,000+ students (customer)

Programs:
  - BS Computer Science
  - MS Electrical Engineering
  - PhD Mathematics

Features Enabled:
  - courses
  - programs
  - degrees
  - research
  - publications
  - accreditation
  - analytics
```

---

## Routes Enabled

```typescript
// Course Management
/courses                      # Course catalog
/courses/[id]                 # Course details
/courses/[id]/syllabus        # Course syllabus
/courses/[id]/assignments     # Assignments list
/courses/[id]/grades          # Grade book
/courses/[id]/discussions     # Discussion board
/courses/[id]/people          # Enrolled students

// Student Dashboard
/dashboard                    # Student homepage
/dashboard/courses            # My courses
/dashboard/assignments        # My assignments
/dashboard/grades             # My grades
/dashboard/schedule           # My schedule
/dashboard/transcript         # Academic transcript

// Assignment Workflow
/assignments/[id]             # Assignment details
/assignments/[id]/submit      # Submit work
/assignments/[id]/grade       # Grade submissions (teacher)

// Teaching Dashboard
/teach                        # Teacher homepage
/teach/courses                # Courses I teach
/teach/students               # My students
/teach/grading                # Grading queue
/teach/analytics              # Teaching analytics

// Admin
/admin/courses                # Course management
/admin/students               # Student management
/admin/teachers               # Faculty management
/admin/departments            # Department management
/admin/programs               # Program management
/admin/enrollment             # Enrollment management
/admin/reports                # Analytics & reports
```

---

## Integration Opportunities

### LMS Imports
- **Canvas** - Import courses, students, grades
- **Blackboard** - Migrate existing content
- **Moodle** - Course structure import
- **Google Classroom** - Sync assignments

### Video Platforms
- **Zoom** - Record & embed lectures
- **YouTube** - Host video content
- **Vimeo** - Premium video hosting
- **Loom** - Quick video feedback

### Assessment Tools
- **Turnitin** - Plagiarism detection
- **GradeScope** - Assignment grading
- **Kahoot** - Interactive quizzes
- **Quizlet** - Study tools

### Communication
- **Slack** - Course chat
- **Discord** - Student communities
- **Microsoft Teams** - Institutional chat

---

## Success Metrics

- [ ] Course creation workflow works
- [ ] Assignment submission & grading works
- [ ] Enrollment & student management works
- [ ] Grade calculation accurate
- [ ] Progress tracking functional
- [ ] Certificates generated
- [ ] Analytics dashboard shows insights
- [ ] Integrates with existing tools

---

## Next Steps

1. **Implement course management** (create, edit, publish)
2. **Build assignment workflow** (create, submit, grade)
3. **Add enrollment system** (enroll, drop, waitlist)
4. **Create grade book** (calculate, track, export)
5. **Build student dashboard** (courses, assignments, grades)
6. **Add teacher dashboard** (teaching, grading, analytics)
7. **Implement progress tracking** (completion, competencies)
8. **Generate certificates** (upon completion)

---

**This education ontology scales from individual teachers to global universities!** 🎓
