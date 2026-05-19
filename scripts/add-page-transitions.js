#!/usr/bin/env node

/**
 * Script to automatically add PageTransition wrappers to all pages
 * Categorizes pages and applies appropriate transition types
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define page categories and their corresponding transition types
const PAGE_CATEGORIES = {
  celebration: [
    'success', 'confirmed', 'received', 'sanctioned', 'allocation-confirmed'
  ],
  hero: [
    '/quote/page.tsx', '/kyc/page.tsx', '/payment/default/page.tsx'
  ],
  processing: [
    'processing', 'pending', 'upload', 'allocation-pending'
  ],
  default: [] // Everything else
};

// Pages already updated (skip these)
const UPDATED_PAGES = [
  'app/quote/page.tsx',
  'app/payment/booking-success/page.tsx', 
  'app/payment/page.tsx',
  'app/payment/down-payment-success/page.tsx',
  'app/kyc/processing/page.tsx',
  'app/kyc/page.tsx',
  'app/kyc/booking-confirmed/page.tsx',
  'app/page.tsx' // Just a redirect
];

function determineTransitionType(filePath) {
  const fileName = path.basename(filePath);
  const relativePath = filePath.replace(process.cwd() + '/', '');
  
  // Check if already updated
  if (UPDATED_PAGES.includes(relativePath)) {
    return null;
  }
  
  // Check celebration pages
  if (PAGE_CATEGORIES.celebration.some(keyword => 
    filePath.includes(keyword) || fileName.includes(keyword)
  )) {
    return 'CelebrationPageTransition';
  }
  
  // Check hero pages
  if (PAGE_CATEGORIES.hero.some(heroPath => filePath.endsWith(heroPath))) {
    return 'HeroPageTransition';
  }
  
  // Check processing pages
  if (PAGE_CATEGORIES.processing.some(keyword => 
    filePath.includes(keyword) || fileName.includes(keyword)
  )) {
    return 'FadePageTransition';
  }
  
  // Skip the root redirect page
  if (filePath.endsWith('app/page.tsx')) {
    return null;
  }
  
  // Default for everything else
  return 'DefaultPageTransition';
}

function updatePageFile(filePath, transitionType) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has PageTransition import
    if (content.includes('PageTransition')) {
      console.log(`⏭️  Skipping ${filePath} - already has PageTransition`);
      return;
    }
    
    const isClientComponent = content.includes('"use client"');
    
    // Add import after existing imports
    const importRegex = /^import.*from.*$/gm;
    const imports = content.match(importRegex) || [];
    const lastImportIndex = content.lastIndexOf(imports[imports.length - 1]);
    
    if (lastImportIndex !== -1) {
      const insertIndex = lastImportIndex + imports[imports.length - 1].length;
      const importStatement = `\nimport { ${transitionType} } from "@/components/ui/page-transition";`;
      content = content.slice(0, insertIndex) + importStatement + content.slice(insertIndex);
    }
    
    // Find the main export function and wrap its return
    const functionRegex = /export\s+default\s+function\s+\w+\([^)]*\)\s*{([\s\S]*?)^}/m;
    const match = content.match(functionRegex);
    
    if (match) {
      const functionBody = match[1];
      
      // Simple return statement (like: return <Component />;)
      const simpleReturnRegex = /return\s+(<[^;]+;)/;
      const simpleMatch = functionBody.match(simpleReturnRegex);
      
      if (simpleMatch) {
        const component = simpleMatch[1].replace(';', '');
        const wrapped = `return (
    <${transitionType}>
      ${component}
    </${transitionType}>
  );`;
        content = content.replace(simpleMatch[0], wrapped);
      } else {
        // Complex return with JSX block
        const jsxReturnRegex = /return\s+\(([\s\S]*?)\);/;
        const jsxMatch = functionBody.match(jsxReturnRegex);
        
        if (jsxMatch) {
          const jsxContent = jsxMatch[1].trim();
          const wrapped = `return (
    <${transitionType}>
${jsxContent}
    </${transitionType}>
  );`;
          content = content.replace(jsxMatch[0], wrapped);
        }
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath} with ${transitionType}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🎬 Adding PageTransitions to all pages...\n');

// Find all page files
const pageFiles = glob.sync('app/**/page.tsx', { cwd: process.cwd() });

pageFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  const transitionType = determineTransitionType(fullPath);
  
  if (transitionType) {
    console.log(`📄 Processing ${filePath} -> ${transitionType}`);
    updatePageFile(fullPath, transitionType);
  } else {
    console.log(`⏭️  Skipping ${filePath}`);
  }
});

console.log('\n🎉 Page transition setup complete!');