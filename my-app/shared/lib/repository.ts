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
}
