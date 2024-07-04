import { promises as fs } from "node:fs";
import path from "node:path";
import fastGlob from "fast-glob";

const __dirname = import.meta.dirname;

const sourceDir = path.join(__dirname, "src");
const destDir = path.join(__dirname, "dist");

async function getFilePaths() {
  const pattern = ["types/*.ts", "types.ts"]; // Add types.ts to the pattern
  const files = await fastGlob(pattern, { cwd: sourceDir });

  return files.filter((file) => !file.endsWith(".test.ts"));
}

try {
  // Ensure destination directory exists
  await fs.mkdir(path.join(destDir, "types"), { recursive: true });

  // Get list of files using getFilePaths function
  const files = await getFilePaths();

  await Promise.all(
    files.map(async (file) => {
      const sourceFile = path.join(sourceDir, file);
      const destFile = path.join(destDir, file.replace(/\.ts$/, ".d.ts"));
      await fs.copyFile(sourceFile, destFile);

      const relativeSource = path.relative(__dirname, sourceFile);
      const relativeDest = path.relative(__dirname, destFile);

      console.log(`Copied and renamed: ${relativeSource} -> ${relativeDest}`);
    }),
  );
} catch (err) {
  console.error("Error:", err);
}
