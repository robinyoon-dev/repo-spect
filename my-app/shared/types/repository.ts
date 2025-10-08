export type CommitOut = {
    sha: string;
    url: string;
    message: string | undefined;
    authorName: string | undefined;
    authorLogin: string | null;
    authorUrl: string | null;
    date: string | undefined;
};