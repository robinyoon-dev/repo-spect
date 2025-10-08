import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const repoUrl = typeof body?.repoUrl === "string" ? body.repoUrl : "";

    if (!repoUrl) {
      return NextResponse.json({ error: "Missing repoUrl" }, { status: 400 });
    }

    // TODO: Replace with real implementation calling GitHub + Gemini
    const content = `# DUMMY DATA! Repo-spect Draft\n\nSource: ${repoUrl}\n\n- This is a placeholder response.\n- Wire this to Gemini once the backend is ready.`;

    return NextResponse.json({ content }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
