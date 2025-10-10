import { CommitOut, IssueOut } from "../types/repository";

export const getFormattedCommitsData = (commits: CommitOut[]) => {
  const commitsData = commits.map((commit, index) =>
    `${index + 1}. **${commit.message || 'No message'}** (${commit.authorName || 'Unknown'}) - ${commit.date || 'Unknown date'}`
  ).join('\n');

  return commitsData;
}

export const getFormattedIssuesData = (issues: IssueOut[]) => {
  const issuesData = issues.map((issue, index) =>
    `${index + 1}. **${issue.title}** - ${issue.state} (${issue.createdAt})`
  ).join('\n');

  return issuesData;
}


export const getPrompts = (commits: string, issues: string) => {


  const prompt = `You are an expert AI project manager. Your task is to analyze the provided commit and issue data to generate a structured project retrospective in Korean.

Focus on extracting and classifying information directly from the data provided.

## Data:
### Commits:
${commits}

### Issues:
${issues}

## Your Task:
Based *only* on the data above, generate a retrospective report in Korean with the following structure.

### 1. 프로젝트 요약 (Project Summary)
- Analyze the commits and issues to generate a 2-3 sentence summary of the main accomplishments during this period.

### 2. 주요 성과 (What Went Well)
- Identify up to 3 key achievements from the commit messages. For each achievement, provide:
    - A brief title.
    - The relevant commit hash(es).
    - A 1-sentence explanation of its positive impact.

### 3. 직면했던 어려움 (Challenges)
- Extract the top 3 challenges or critical bugs from the issues data. For each challenge, provide:
    - A brief title describing the problem.
    - The relevant issue number(s).
    - A 1-sentence summary of the problem.

### 4. 핵심 학습 내용 (Key Learnings)
- Based on the overall data, formulate 2 actionable learnings using the KPT (Keep, Problem, Try) format.
    - **Keep**: Identify one practice or technical decision that worked well and should be continued.
    - **Try**: Suggest one new approach or improvement to address a challenge identified in the issues.

---

## EXAMPLE OUTPUT FORMAT:
### 1. 프로젝트 요약
이번 스프린트에서는 사용자 인증 흐름을 리팩토링하고, 주요 API의 응답 시간을 50ms 단축했습니다. 또한, 보고된 여러 치명적인 버그를 수정하여 안정성을 크게 향상시켰습니다.

### 2. 주요 성과
- **인증 시스템 리팩토링**
  - Commits: \`#a1b2c3d\`, \`#e4f5g6h\`
  - 영향: JWT 기반의 새로운 인증 로직을 도입하여 보안을 강화하고 코드 유지보수성을 높였습니다.
- **API 성능 최적화**
  - Commits: \`#i7j8k9l\`
  - 영향: 데이터베이스 쿼리를 최적화하여 사용자 대시보드 로딩 속도를 개선했습니다.

### 3. 직면했던 어려움
- **간헐적 API 타임아웃**
  - Issues: \`#101\`
  - 문제점: 특정 조건에서 외부 서비스 API 호출이 실패하여 전체 요청이 타임아웃되었습니다.
- **모바일 화면 깨짐**
  - Issues: \`#105\`
  - 문제점: 일부 안드로이드 기기에서 CSS 렌더링 문제로 인해 UI가 올바르게 표시되지 않았습니다.

### 4. 핵심 학습 내용
- **Keep**: 기능 구현 전 명확한 기술 스펙 문서를 작성하는 현재의 방식은 협업 효율을 높여주므로 계속 유지해야 합니다.
- **Try**: CI 파이프라인에 자동화된 UI 테스트 단계를 추가하여, 배포 전 크로스-브라우저 호환성 이슈를 조기에 발견하도록 시도해볼 수 있습니다.

---

Now, generate the report in Korean based on the provided data. Use Markdown for formatting.`;

  return prompt;


}