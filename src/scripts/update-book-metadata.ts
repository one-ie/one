import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { BookMetadataSchema, defaultBookMetadata } from '../content/book/metadata.config';

const bookDir = path.join(process.cwd(), 'src/content/book');

async function updateBookMetadata() {
  try {
    const files = await fs.readdir(bookDir);
    const markdownFiles = files.filter(file => 
      file.endsWith('.md') && 
      !file.startsWith('-') && 
      !file.includes('metadata') &&
      !file.includes('.baked.') &&
      /^\d+/.test(file)
    );

    for (const file of markdownFiles) {
      const filePath = path.join(bookDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { data, content: markdownContent } = matter(content);

      // Extract chapter number from filename
      const chapterMatch = file.match(/^(\d+)/);
      const chapter = chapterMatch ? parseInt(chapterMatch[1]) : 0;

      // Create new frontmatter with validation
      const newFrontmatter = {
        ...defaultBookMetadata,
        ...data,
        chapter,
        order: chapter
      };

      // Validate metadata
      try {
        BookMetadataSchema.parse(newFrontmatter);
      } catch (error) {
        console.error(`❌ Validation error in ${file}:`, error);
        continue;
      }

      // Write updated content
      const newContent = matter.stringify(markdownContent, newFrontmatter);
      await fs.writeFile(filePath, newContent);
      console.log(`✅ Updated metadata for ${file}`);
    }

    console.log('🎉 All book files updated successfully!');
  } catch (error) {
    console.error('Error updating book metadata:', error);
    throw error;
  }
}

// Run the update
updateBookMetadata(); 