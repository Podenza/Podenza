#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Base directory for the web app
const baseDir = './apps/web';

// Map of import patterns to their relative paths
const importMappings = {
  // Components
  '~/components/': {
    relativeTo: 'components/',
    getPath: (fromFile) => {
      const depth = (fromFile.split('/').length - 2); // -1 for file, -1 for base
      return '../'.repeat(depth) + 'components/';
    }
  },

  // Config files
  '~/config/': {
    relativeTo: 'config/',
    getPath: (fromFile) => {
      const depth = Math.max(0, fromFile.split('/').length - 2);
      return '../'.repeat(depth) + 'config/';
    }
  },

  // Lib files
  '~/lib/': {
    relativeTo: 'lib/',
    getPath: (fromFile) => {
      const depth = (fromFile.split('/').length - 2);
      return '../'.repeat(depth) + 'lib/';
    }
  },

  // App files
  '~/app/': {
    relativeTo: 'app/',
    getPath: (fromFile) => {
      const depth = (fromFile.split('/').length - 2);
      return '../'.repeat(depth) + 'app/';
    }
  },

  // Marketing components - special case
  '~/(marketing)/_components/': {
    relativeTo: 'app/(marketing)/_components/',
    getPath: (fromFile) => {
      // Handle marketing components specially
      const parts = fromFile.split('/');
      if (parts.includes('(marketing)')) {
        // If we're already in marketing folder
        const marketingIndex = parts.indexOf('(marketing)');
        const currentDepth = parts.length - marketingIndex - 2; // -1 for file, -1 for current dir
        if (currentDepth <= 1) {
          return './_components/';
        } else {
          return '../'.repeat(currentDepth - 1) + '_components/';
        }
      } else {
        // If we're outside marketing folder
        const depth = parts.length - 2;
        return '../'.repeat(depth) + 'app/(marketing)/_components/';
      }
    }
  }
};

function getAllFiles(dir, extension = '.tsx') {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...getAllFiles(fullPath, extension));
    } else if (item.isFile() && (item.name.endsWith(extension) || item.name.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }

  return files;
}

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let hasChanges = false;

  // Get relative path from baseDir
  const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');

  // Find all import statements with ~/
  const importRegex = /import\s+.*?from\s+['"]~\/([^'"]+)['"]/g;

  newContent = content.replace(importRegex, (match, importPath) => {
    // Find the appropriate mapping
    for (const [pattern, mapping] of Object.entries(importMappings)) {
      const patternPath = pattern.replace('~/', '');
      if (importPath.startsWith(patternPath)) {
        const newPath = mapping.getPath(relativePath) + importPath.substring(patternPath.length);
        hasChanges = true;
        return match.replace(`~/` + importPath, newPath);
      }
    }

    // Fallback: calculate generic relative path
    const depth = relativePath.split('/').length - 1;
    const newPath = '../'.repeat(depth) + importPath;
    hasChanges = true;
    return match.replace(`~/` + importPath, newPath);
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed imports in: ${relativePath}`);
    return true;
  }

  return false;
}

function main() {
  console.log('🔧 Fixing all import paths...');

  if (!fs.existsSync(baseDir)) {
    console.error(`Base directory ${baseDir} not found!`);
    process.exit(1);
  }

  const allFiles = getAllFiles(baseDir);
  let fixedCount = 0;

  for (const file of allFiles) {
    if (fixImportsInFile(file)) {
      fixedCount++;
    }
  }

  console.log(`✅ Fixed imports in ${fixedCount} files!`);
  console.log('🚀 All imports should now use relative paths instead of ~/');
}

if (require.main === module) {
  main();
}

module.exports = { fixImportsInFile, getAllFiles };