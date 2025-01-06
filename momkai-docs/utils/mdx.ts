import fs from "fs";
import path from "path";

// PAGES_PATH is useful when you want to get the path to a specific file
export const PAGES_PATH = path.join(
  process.cwd(),
  "content/"
);

// indexedFilePaths is the list of all mdx files inside the PAGES_PATH directory
export const indexedFilePaths = searchDir(PAGES_PATH);

// https://stackoverflow.com/a/63111390/3584515
export function searchDir(dir: string) {
  let files: any = [];
  fs.readdirSync(dir).forEach((file) => {
    const absolute = path.join(dir, file);

    if (fs.statSync(absolute).isDirectory()) {
      files.push(...searchDir(absolute));
    } else {
      files.push(absolute.replace(PAGES_PATH, ""));
    }
  });
  return files.filter((path: string) => path.endsWith(".mdx"));
}
