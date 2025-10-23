const fs = require("fs");
const path = require("path");

// Find all test files
const testDirs = ["__tests__", "tests"];
const testFiles = [];

testDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    const files = require("glob").sync(`${dir}/**/*.test.{ts,tsx,js,jsx}`, {
      cwd: ".",
    });
    testFiles.push(...files);
  }
});

console.log(`Found ${testFiles.length} test files to fix...`);

// Fix imports in each file
testFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf8");

  // Replace Vitest imports with Jest
  let newContent = content
    .replace(/from\s+["']vitest["']/g, 'from "@jest/globals"')
    .replace(/vi\./g, "jest.")
    .replace(/vi\(/g, "jest(");

  // Write back if changed
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed: ${filePath}`);
  }
});

console.log("Done fixing test imports!");
