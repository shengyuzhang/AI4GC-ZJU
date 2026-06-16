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
//
// Keyed by the CURRENT folder name; the first-add time is resolved with
// `git log --follow` so a folder that was renamed (e.g. an ID added later) still
// keeps its original submission order.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const teamRel = "content/team";
const teamDir = path.join(repoRoot, teamRel);
const outFile = path.join(repoRoot, "src/lib/content/member-order.json");

function listMemberFolders() {
  const folders = [];
  for (const group of readdirSync(teamDir, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const groupDir = path.join(teamDir, group.name);
    for (const folder of readdirSync(groupDir, { withFileTypes: true })) {
      if (folder.isDirectory() && existsSync(path.join(groupDir, folder.name, "index.md"))) {
        folders.push({ folder: folder.name, rel: `${teamRel}/${group.name}/${folder.name}/index.md` });
      }
    }
  }
  return folders;
}

// Earliest commit timestamp that added this file, following renames.
function firstAddTime(rel) {
  try {
    const out = execFileSync(
      "git",
      ["-C", repoRoot, "log", "--follow", "--diff-filter=A", "--reverse", "--format=%ct", "--", rel],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
    const first = out.trim().split("\n").filter(Boolean)[0];
    return first ? Number.parseInt(first, 10) : Number.MAX_SAFE_INTEGER;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

try {
  const folders = listMemberFolders().map((f) => ({ ...f, ts: firstAddTime(f.rel) }));
  const tracked = folders.filter((f) => f.ts !== Number.MAX_SAFE_INTEGER).length;
  if (tracked === 0) {
    console.warn("[gen-member-order] no git history found; keeping existing order file");
    if (!existsSync(outFile)) writeFileSync(outFile, "{}\n");
  } else {
    folders.sort((a, b) => a.ts - b.ts || a.folder.localeCompare(b.folder));
    const order = {};
    folders.forEach((f, i) => {
      order[f.folder] = i;
    });
    writeFileSync(outFile, `${JSON.stringify(order, null, 2)}\n`);
    console.log(`[gen-member-order] wrote ${folders.length} members -> ${path.relative(repoRoot, outFile)}`);
  }
} catch (error) {
  console.warn("[gen-member-order] failed:", error.message, "- keeping existing order file");
  if (!existsSync(outFile)) writeFileSync(outFile, "{}\n");
}
