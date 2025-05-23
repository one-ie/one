import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BOOK_DIR = path.join(__dirname, '../src/content/book');
const ALLOWED_FIELDS = ['title', 'description', 'chapter', 'order', 'tags'];

function cleanupFrontmatter(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  const original = { ...parsed.data };
  // Only keep allowed fields
  parsed.data = Object.fromEntries(
    Object.entries(parsed.data).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
  // Only rewrite if something changed
  if (JSON.stringify(parsed.data) !== JSON.stringify(original)) {
    fs.writeFileSync(filePath, matter.stringify(parsed.content, parsed.data));
    return true;
  }
  return false;
}

function main() {
  const files = fs.readdirSync(BOOK_DIR)
    .filter(f => f.endsWith('.md') && f !== 'metadata.yaml');
  let changed = 0;
  for (const file of files) {
    const filePath = path.join(BOOK_DIR, file);
    if (cleanupFrontmatter(filePath)) {
      console.log(`Cleaned: ${file}`);
      changed++;
    }
  }
  if (changed === 0) {
    console.log('No files needed cleaning.');
  } else {
    console.log(`\n${changed} file(s) cleaned.`);
  }
}

main(); 