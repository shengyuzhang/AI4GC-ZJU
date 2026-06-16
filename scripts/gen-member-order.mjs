// Generates src/lib/content/member-order.json: a map of member folder name ->
// the order it was first added to the repo (≈ PR submission order). The team
// page uses this as the within-group tiebreaker when two members share an
// enrollment date. Run this whenever members are added/removed:
//
//   npm run team:order
//
// We bake it to a committed JSON (rather than calling git at build/runtime) so
// the order is reliable on Vercel, where the runtime has no .git and where build
// cwd is unreliable.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const teamRel = "content/team";
const teamDir = path.join(repoRoot, teamRel);
const outFile = path.join(repoRoot, "src/lib/content/member-order.json");

function countMemberFolders() {
  let count = 0;
  for (const group of readdirSync(teamDir, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const groupDir = path.join(teamDir, group.name);
    for (const folder of readdirSync(groupDir, { withFileTypes: true })) {
      if (folder.isDirectory() && existsSync(path.join(groupDir, folder.name, "index.md"))) {
        count += 1;
      }
    }
  }
  return count;
}

function gitAddOrder() {
  const out = execFileSync(
    "git",
    ["-C", repoRoot, "log", "--diff-filter=A", "--reverse", "--name-only", "--format=", "--", teamRel],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const order = {};
  let index = 0;
  for (const line of out.split("\n")) {
    const file = line.trim();
    if (!file.endsWith("/index.md")) continue;
    const folder = file.split("/").at(-2);
    if (folder && !(folder in order)) order[folder] = index++;
  }
  return order;
}

try {
  const order = gitAddOrder();
  const have = Object.keys(order).length;
  const need = countMemberFolders();
  if (have > 0 && have >= need) {
    writeFileSync(outFile, `${JSON.stringify(order, null, 2)}\n`);
    console.log(`[gen-member-order] wrote ${have} members -> ${path.relative(repoRoot, outFile)}`);
  } else {
    console.warn(
      `[gen-member-order] git history incomplete (${have}/${need}); keeping existing ${path.relative(repoRoot, outFile)}`,
    );
    if (!existsSync(outFile)) writeFileSync(outFile, "{}\n");
  }
} catch (error) {
  console.warn("[gen-member-order] git unavailable:", error.message, "- keeping existing order file");
  if (!existsSync(outFile)) writeFileSync(outFile, "{}\n");
}
