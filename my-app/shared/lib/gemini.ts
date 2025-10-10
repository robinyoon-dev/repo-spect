import { GoogleGenAI } from "@google/genai";
import { CommitOut, IssueOut } from "../types/repository";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY });

export async function generateContent(commits: CommitOut[], issues: IssueOut[]): Promise<string> {
  // Format commits data
  const commitsData = commits.map((commit, index) => 
    `${index + 1}. **${commit.message || 'No message'}** (${commit.authorName || 'Unknown'}) - ${commit.date || 'Unknown date'}`
  ).join('\n');

  // Format issues data
  const issuesData = issues.map((issue, index) => 
    `${index + 1}. **${issue.title}** - ${issue.state} (${issue.createdAt})`
  ).join('\n');

  const prompt = `Write a comprehensive retrospective in Koreanfor this software project based on the following commits and issues:

## Recent Commits:
${commitsData}

## Recent Issues:
${issuesData}

Please structure the retrospective as follows:

1. **Project Overview**: Brief summary of what was accomplished
2. **Key Achievements**: Highlight the most significant commits and their impact
3. **Challenges Faced**: Based on the issues, what problems were encountered
4. **Technical Insights**: Analyze the commit patterns and technical decisions
5. **Lessons Learned**: What can be improved or what worked well


Make it professional, insightful, and actionable. Use markdown formatting for better readability.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  
  return response.text || "Failed to generate content";
}


//5. **Team Collaboration**: Insights about team dynamics from commit authors and issue interactions
//7. **Next Steps**: Recommendations for future development