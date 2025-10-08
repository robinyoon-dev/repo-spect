import { CommitOut } from "@/shared/types/repository";

// ──────────────────────────────────────────────────────────────────────────────
// 유틸: GitHub 저장소 URL에서 owner/repo 추출
// 허용 예:
//   https://github.com/owner/repo
//   https://github.com/owner/repo/ (trailing slash OK)
//   https://github.com/owner/repo/tree/main (추가 세그먼트 있어도 OK)
// ──────────────────────────────────────────────────────────────────────────────
export const parseRepoUrl = (input: string) => {
  try {
    const u = new URL(input);
    if (u.hostname !== "github.com") {
      throw new Error("Not a GitHub URL");
    }
    const segments = u.pathname.replace(/^\/+|\/+$/g, "").split("/");
    // 최소 owner/repo
    if (segments.length < 2) throw new Error("Invalid GitHub repo URL");
    const [owner, repo] = segments;
    if (!owner || !repo) throw new Error("Invalid GitHub repo URL");
    return { owner, repo };
  } catch {
    throw new Error("Invalid URL format");
  }
};

export function formatCommitsAsMarkdown(commits: CommitOut[]): string {
  if (!commits || commits.length === 0) {
    return "No commits found.";
  }

  const header = `# Repository Commit History\n\nFound ${commits.length} recent commits:\n\n`;

  const commitList = commits
    .map((commit, index) => {
      const commitDate = new Date(commit.date || "").toLocaleDateString();
      const shortSha = commit.sha.substring(0, 7);

      return `## ${index + 1}. ${commit.message || "No message"}
  
  - **Author:** ${commit.authorName || "Unknown"} (@${commit.authorLogin || "unknown"})
  - **Date:** ${commitDate}
  - **Commit:** [${shortSha}](${commit.url})
  - **SHA:** \`${commit.sha}\`
  
  `;
    })
    .join("---\n\n");

  return header + commitList;
}
