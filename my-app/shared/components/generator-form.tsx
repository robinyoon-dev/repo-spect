"use client";

import type { JSX } from "react";
import React, { useCallback, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CommitOut, IssueOut } from "@/shared/types/repository";
import { CommitCard } from "./commit-card";
import { IssueCard } from "./issue-card";
import { CollapsibleSection } from "./collapsible-section";

interface RepositoryResponse {
  commits: CommitOut[];
}

interface IssuesResponse {
  issues: IssueOut[];
}

//TODO: 추후 UI 개선 필요.
export function GeneratorForm(): JSX.Element {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [isLoadingCommits, setIsLoadingCommits] = useState<boolean>(false);
  const [isLoadingIssues, setIsLoadingIssues] = useState<boolean>(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState<boolean>(false);
  const [commits, setCommits] = useState<CommitOut[]>([]);
  const [issues, setIssues] = useState<IssueOut[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const isRepoUrlValid = useMemo(() => {
    if (!repoUrl) return false;
    try {
      const url = new URL(repoUrl);
      return url.hostname === "github.com" && url.pathname.split("/").filter(Boolean).length >= 2;
    } catch {
      return false;
    }
  }, [repoUrl]);

  const handleCopy = useCallback(async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error("clipboard write failed", err);
    }
  }, [content]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isRepoUrlValid) return;

      setErrorMessage("");
      setCommits([]);
      setIssues([]);
      setContent("");

      let fetchedCommits: CommitOut[] = [];
      let fetchedIssues: IssueOut[] = [];

      // Fetch commits
      setIsLoadingCommits(true);
      try {
        const commitsResponse = await fetch(`/api/repository?url=${repoUrl}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!commitsResponse.ok) {
          const text = await commitsResponse.text();
          throw new Error(text || `Commits request failed with ${commitsResponse.status}`);
        }

        const commitsResult = (await commitsResponse.json()) as RepositoryResponse;
        fetchedCommits = Array.isArray(commitsResult.commits) ? commitsResult.commits : [];
        setCommits(fetchedCommits);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setErrorMessage(message);
      } finally {
        setIsLoadingCommits(false);
      }

      // Fetch issues
      setIsLoadingIssues(true);
      try {
        const issuesResponse = await fetch(`/api/repository`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl }),
        });

        if (!issuesResponse.ok) {
          const text = await issuesResponse.text();
          throw new Error(text || `Issues request failed with ${issuesResponse.status}`);
        }

        const issuesResult = (await issuesResponse.json()) as IssuesResponse;
        fetchedIssues = Array.isArray(issuesResult.issues) ? issuesResult.issues : [];
        setIssues(fetchedIssues);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setErrorMessage(message);
      } finally {
        setIsLoadingIssues(false);
      }

      // Generate content after both commits and issues are loaded
      if (fetchedCommits.length > 0 && fetchedIssues.length > 0) {
        await handleGenerate(fetchedCommits, fetchedIssues);
      }
    },
    [isRepoUrlValid, repoUrl]
  );

  const handleGenerate = async (commits: CommitOut[], issues: IssueOut[]) => {
    setIsGeneratingContent(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commits, issues }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with ${response.status}`);
      }

      const result = await response.json();
      setContent(result.content);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setErrorMessage(message);
      console.error("generate request failed", err);
    } finally {
      setIsGeneratingContent(false);
    }
  };


  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        <label htmlFor="repoUrl" className="sr-only">
          GitHub Repository URL
        </label>
        <Input
          id="repoUrl"
          name="repoUrl"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="e.g., https://github.com/facebook/react"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />

        <Button type="submit" disabled={!isRepoUrlValid || isLoadingCommits || isLoadingIssues || isGeneratingContent}>
          {isLoadingCommits || isLoadingIssues ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Fetching data...
            </span>
          ) : isGeneratingContent ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Generating content...
            </span>
          ) : (
            <>Generate Story</>
          )}
        </Button>
      </form>

      <div className="mt-8">
        {errorMessage ? (
          <Alert variant="destructive" className="text-sm">
            {errorMessage}
          </Alert>
        ) : null}

        {!commits.length && !issues.length && !isLoadingCommits && !isLoadingIssues && !errorMessage ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your repository data will appear here.
          </p>
        ) : null}

        {(commits.length > 0 || issues.length > 0 || isLoadingCommits || isLoadingIssues) ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Commits Section */}
            {isLoadingCommits ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Commits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                    <Spinner className="h-4 w-4" />
                    Loading commits...
                  </div>
                </CardContent>
              </Card>
            ) : commits.length > 0 ? (
              <CollapsibleSection title="Commits" count={commits.length}>
                {commits.map((commit, index) => (
                  <CommitCard key={commit.sha} commit={commit} index={index} />
                ))}
              </CollapsibleSection>
            ) : null}

            {/* Issues Section */}
            {isLoadingIssues ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                    <Spinner className="h-4 w-4" />
                    Loading issues...
                  </div>
                </CardContent>
              </Card>
            ) : issues.length > 0 ? (
              <CollapsibleSection title="Issues" count={issues.length}>
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </CollapsibleSection>
            ) : null}
          </div>
        ) : null}

        {content ? (
          <div className="mt-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold">
                  Generated Retrospective
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                  Copy as Markdown
                </Button>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : isGeneratingContent ? (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Generated Retrospective
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                  <Spinner className="h-4 w-4" />
                  Generating retrospective...
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
