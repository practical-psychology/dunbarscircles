const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");

// Update imports from '@/components/ui/card' to '@/components/ui/Card'
function fixCardImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Fix import path case
    content = content.replace(
      /from ['"]@\/components\/ui\/card['"]/g,
      "from '@/components/ui/Card'",
    );

    // Fix relative imports
    content = content.replace(
      /from ['"](?:\.{1,2}\/)+ui\/card['"]/g,
      (match) => {
        const parts = match.split("/");
        parts[parts.length - 1] = "Card";
        return parts.join("/");
      },
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Fixed imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Find all TypeScript and JavaScript files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes("node_modules")) {
      findFiles(filePath, fileList);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Run the fix on all relevant files
const allFiles = findFiles(path.join(projectRoot, "src"));
const cardFiles = findFiles(path.join(projectRoot, "components"));
const pagesFiles = findFiles(path.join(projectRoot, "pages"));

const allRelevantFiles = [
  ...new Set([...allFiles, ...cardFiles, ...pagesFiles]),
];

console.log("Fixing Card imports in files...");
let fixedCount = 0;

allRelevantFiles.forEach((file) => {
  if (fixCardImports(file)) {
    fixedCount++;
  }
});

console.log(`\nFixed ${fixedCount} files with incorrect Card imports.`);
