import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import matter from 'gray-matter';

const execAsync = promisify(exec);

async function generateEpub() {
  try {
    const bookDir = path.join(process.cwd(), 'src/content/book');
    
    // Get all markdown files and sort them
    const files = await fs.readdir(bookDir);
    const markdownFiles = files
      .filter(file => {
        // Only include numbered markdown files, exclude .baked files
        return file.endsWith('.md') && 
               !file.startsWith('-') && 
               !file.includes('metadata') &&
               !file.includes('.baked.') &&
               /^\d+/.test(file);
      })
      .sort((a, b) => {
        // Extract numbers from filenames for sorting
        const numA = parseInt(a.match(/^\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/^\d+/)?.[0] || '0');
        return numA - numB;
      });

    // Read the first markdown file to get metadata
    const firstFilePath = path.join(bookDir, markdownFiles[0]);
    const firstFileContent = await fs.readFile(firstFilePath, 'utf-8');
    const { data: metadata } = matter(firstFileContent);

    // Create temporary metadata file
    const tempMetadataPath = path.join(bookDir, '_temp_metadata.yaml');
    await fs.writeFile(tempMetadataPath, yaml.dump(metadata));

    // Change to the book directory for relative paths
    process.chdir(bookDir);

    // Construct pandoc command with relative paths
    const markdownFilePaths = markdownFiles
      .map(file => `"${file}"`)
      .join(' ');

    const command = `pandoc "${path.basename(tempMetadataPath)}" ${markdownFilePaths} \
      --resource-path=.:assets \
      --toc \
      --toc-depth=2 \
      --split-level=1 \
      --css=epub-style.css \
      --epub-cover-image=assets/Playbook.png \
      -o Elevate_Playbook_New.epub`;

    console.log('Running command:', command);

    // Execute pandoc command
    const { stdout, stderr } = await execAsync(command);
    console.log('EPUB generated successfully');
    if (stdout) console.log('Output:', stdout);
    if (stderr) console.error('Errors:', stderr);

    // Clean up temporary metadata file
    await fs.unlink(tempMetadataPath);

  } catch (error) {
    console.error('Error generating EPUB:', error);
    throw error;
  }
}

// Execute the function
generateEpub(); 