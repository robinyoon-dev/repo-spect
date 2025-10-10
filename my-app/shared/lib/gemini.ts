import { GoogleGenAI } from "@google/genai";
import { CommitOut, IssueOut } from "../types/repository";
import { getFormattedCommitsData, getFormattedIssuesData, getPrompts } from "./prompts";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });

export async function generateContent(commits: CommitOut[], issues: IssueOut[]): Promise<string> {
  // Format commits data
  const commitsData = getFormattedCommitsData(commits);

  // Format issues data
  const issuesData = getFormattedIssuesData(issues);

  // Get prompt
  const prompt = getPrompts(commitsData, issuesData);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
  });

  return response.text || "Failed to generate content";
}
