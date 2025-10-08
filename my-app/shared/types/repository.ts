/**
 * 커밋 정보를 담는 타입
 * GitHub API에서 받아온 커밋 데이터를 정제한 형태
 */
export type CommitOut = {
  /** 커밋의 고유 해시값 (SHA) */
  sha: string;
  /** GitHub에서 해당 커밋을 볼 수 있는 URL */
  url: string;
  /** 커밋 메시지 (제목과 본문 포함) */
  message: string | undefined;
  /** 커밋 작성자의 실제 이름 */
  authorName: string | undefined;
  /** 커밋 작성자의 GitHub 사용자명 */
  authorLogin: string | null;
  /** 커밋 작성자의 GitHub 프로필 URL */
  authorUrl: string | null;
  /** 커밋이 생성된 날짜 (ISO 8601 형식) */
  date: string | undefined;
};

/**
 * 이슈 정보를 담는 인터페이스
 * GitHub API에서 받아온 이슈 데이터를 정제한 형태
 */
export interface IssueOut {
  /** 이슈의 고유 ID */
  id: number;
  /** 이슈 번호 (리포지토리 내에서의 순번) */
  number: number;
  /** 이슈 제목 */
  title: string;
  /** 이슈 본문 내용 (마크다운 형식) */
  body: string | null;
  /** 이슈 상태 (열림/닫힘) */
  state: "open" | "closed";
  /** GitHub에서 해당 이슈를 볼 수 있는 URL */
  url: string;
  /** 이슈 작성자의 실제 이름 */
  authorName: string | null;
  /** 이슈 작성자의 GitHub 사용자명 */
  authorLogin: string | null;
  /** 이슈 작성자의 GitHub 프로필 URL */
  authorUrl: string | null;
  /** 이슈가 생성된 날짜 (ISO 8601 형식) */
  createdAt: string;
  /** 이슈가 마지막으로 수정된 날짜 (ISO 8601 형식) */
  updatedAt: string;
  /** 이슈가 닫힌 날짜 (ISO 8601 형식, 닫히지 않은 경우 null) */
  closedAt: string | null;
  /** 이슈에 붙은 라벨 목록 */
  labels: Array<{
    /** 라벨의 고유 ID */
    id: number;
    /** 라벨 이름 */
    name: string;
    /** 라벨 색상 (16진수 코드) */
    color: string;
    /** 라벨 설명 */
    description: string | null;
  }>;
  /** 이슈에 할당된 담당자 목록 */
  assignees: Array<{
    /** 담당자의 고유 ID */
    id: number;
    /** 담당자의 GitHub 사용자명 */
    login: string;
    /** 담당자의 실제 이름 */
    name: string | null;
    /** 담당자의 GitHub 프로필 URL */
    url: string;
  }>;
}
