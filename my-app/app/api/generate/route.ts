import { generateContent } from "@/shared/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const commits = body?.commits;
    const issues = body?.issues;

    if (!commits || !issues) {
      return NextResponse.json({ error: "Missing commits or issues" }, { status: 400 });
    }

    const content = await generateContent(commits, issues);

    return NextResponse.json({ content }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
