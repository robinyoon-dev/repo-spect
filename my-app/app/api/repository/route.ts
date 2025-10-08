import { NextResponse } from "next/server";
import { Octokit } from "octokit";
import { parseRepoUrl } from "@/shared/lib/repository";
import { CommitOut } from "@/shared/types/repository";

export const runtime = "nodejs"; // Edge는 Octokit 일부 플러그인과 호환 이슈가 있어 nodejs 권장
export const revalidate = 0;      // 개발 중엔 캐시 끔


// Octokit 인스턴스 (요청마다 새로 만들어도 되지만 여기선 파일 스코프에 1개)
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN, // 없으면 비인증 호출(60/h), 있으면 5k/h
    request: {
        headers: {
            "x-github-api-version": "2022-11-28",
        },
    },
});



export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // 필수: repo URL
        const repoUrl = searchParams.get("url");
        if (!repoUrl) {
            return NextResponse.json(
                { error: "`url` query is required. Example: /api/commits?url=https://github.com/vercel/next.js" },
                { status: 400 }
            );
        }

        const { owner, repo } = parseRepoUrl(repoUrl);

        // 옵션: 페이지네이션/필터
        const page = Number(searchParams.get("page") ?? "1");
        const per_page = Math.min(Number(searchParams.get("per_page") ?? "10"), 100); // GitHub max 100
        const branch = searchParams.get("branch") ?? undefined; // sha 파라미터
        const since = searchParams.get("since") ?? undefined;   // ISO8601 (옵션)
        const until = searchParams.get("until") ?? undefined;   // ISO8601 (옵션)

        // 옵션: 여러 페이지를 합쳐 반환
        const all = (searchParams.get("all") ?? "").toLowerCase() === "true";
        const cap = Math.min(Number(searchParams.get("cap") ?? "500"), 2000); // 안전 상한 (기본 500건)

        // 단건 페이지 모드
        if (!all) {
            const res = await octokit.request("GET /repos/{owner}/{repo}/commits", {
                owner,
                repo,
                page,
                per_page,
                sha: branch,
                since,
                until,
            });

            const commits: CommitOut[] = res.data.map((c) => ({
                sha: c.sha,
                url: c.html_url!,
                message: c.commit?.message,
                authorName: c.commit?.author?.name,
                authorLogin: c.author?.login ?? null,
                authorUrl: c.author?.html_url ?? null,
                date: c.commit?.author?.date,
            }));

            const rateRemaining = res.headers["x-ratelimit-remaining"];
            const rateLimit = res.headers["x-ratelimit-limit"];

            return NextResponse.json(
                {
                    owner,
                    repo,
                    page,
                    per_page,
                    count: commits.length,
                    rate: { remaining: rateRemaining, limit: rateLimit },
                    commits,
                },
                { status: 200 }
            );
        }

        // all=true 모드: paginate.iterator로 여러 페이지 모으기
        const commits: CommitOut[] = [];
        const iterator = octokit.paginate.iterator("GET /repos/{owner}/{repo}/commits", {
            owner,
            repo,
            per_page: 100,
            sha: branch,
            since,
            until,
        });

        // cap까지 수집
        for await (const { data } of iterator) {
            for (const c of data) {
                commits.push({
                    sha: c.sha,
                    url: c.html_url!,
                    message: c.commit?.message,
                    authorName: c.commit?.author?.name,
                    authorLogin: c.author?.login ?? null,
                    authorUrl: c.author?.html_url ?? null,
                    date: c.commit?.author?.date,
                });
                if (commits.length >= cap) break;
            }
            if (commits.length >= cap) break;
        }

        return NextResponse.json(
            {
                owner,
                repo,
                mode: "all",
                cap,
                count: commits.length,
                commits,
            },
            { status: 200 }
        );
    } catch (e: any) {
        // Octokit 에러는 status, response 데이터가 달려오는 경우가 많음
        const status = e?.status ?? 500;
        const message = e?.message ?? "Unknown error";
        const details = e?.response?.data ?? undefined;

        return NextResponse.json(
            { error: "GitHub API error", message, details },
            { status }
        );
    }
}