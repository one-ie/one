<PLANNING>
**Goal:** Build out the course in `course.md` using the existing schemas and page structure.

**Relevant Files:**
- `src/content/config.ts`: Contains Zod schemas for courses and lessons, and defines the content collections.
- `src/pages/course.astro`: Renders the course overview, modules, and lessons using hardcoded data.
- `src/pages/lessons/[...slug].astro`: Renders individual lessons using the content collection `lessons`.

**Plan:**

1. **Define the Course in Markdown (`course.md`):**
   - Use the frontmatter to define course metadata (title, description, id, prerequisites, etc.) according to the `CourseSchema` in `config.ts`.
   - List the lessons (by slug or id) in the `lessons` array in the frontmatter.
   - Optionally, add instructors and AI config.

2. **Define Lessons in the Content Collection:**
   - Each lesson should be a markdown or MDX file in the `src/content/lessons/` directory, matching the slugs listed in the course.
   - Each lesson file should use frontmatter fields as per the `LessonSchema`.

3. **Update `course.astro` to Source Data from Content Collections:**
   - Instead of hardcoding `courseModulesData`, fetch the course and its lessons from the content collection using Astro’s content API.
   - Dynamically build the modules/sections and lesson lists from the course and lesson data.

4. **Update Navigation and Linking:**
   - Ensure that clicking a lesson in the course overview links to the correct `[...slug].astro` lesson page.

5. **(Optional) Add AI Config to Course and Lessons:**
   - Use the `aiConfig` field in the course and lesson frontmatter to customize the chat assistant per module or lesson.

6. **Testing and Validation:**
   - Validate that the course and lessons render correctly.
   - Ensure that the chat assistant is configured as expected for both the course and individual lessons.

**Next Steps:**
- Draft the structure for `course.md` frontmatter and content.
- List the required lesson slugs.
- (If not already present) create lesson markdown files in the content collection.

**Cursor Rules Used:**
- sonnet-3-7 (always check existing system files and use codebase_search for core files before creating new ones)
</PLANNING>

Would you like to see a draft of the `course.md` frontmatter and content structure as the next step?
