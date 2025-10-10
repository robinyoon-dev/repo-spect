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
import { formatCommitsAsMarkdown } from "../lib/repository";

interface RepositoryResponse {
  commits: CommitOut[];
}

interface IssuesResponse {
  issues: IssueOut[];
}

//TODO: 추후 UI 개선 필요.
export function GeneratorForm(): JSX.Element {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [commits, setCommits] = useState<CommitOut[]>([]);
  const [issues, setIssues] = useState<IssueOut[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isGeneratingContent, setIsGeneratingContent] = useState<boolean>(false);
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
    if (!commits.length) return;
    try {
      const markdownContent = formatCommitsAsMarkdown(commits);
      await navigator.clipboard.writeText(markdownContent);
    } catch (err) {
      console.error("clipboard write failed", err);
    }
  }, [commits]);




  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isRepoUrlValid) return;

      setIsLoading(true);
      setErrorMessage("");
      setCommits([]);
      setIssues([]);

      try {
        // Fetch commits and issues in parallel
        const [commitsResponse, issuesResponse] = await Promise.all([
          fetch(`/api/repository?url=${repoUrl}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch(`/api/repository`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repoUrl }),
          }),
        ]);

        if (!commitsResponse.ok) {
          const text = await commitsResponse.text();
          throw new Error(text || `Commits request failed with ${commitsResponse.status}`);
        }

        if (!issuesResponse.ok) {
          const text = await issuesResponse.text();
          throw new Error(text || `Issues request failed with ${issuesResponse.status}`);
        }

        const commitsResult = (await commitsResponse.json()) as RepositoryResponse;
        const issuesResult = (await issuesResponse.json()) as IssuesResponse;

        setCommits(Array.isArray(commitsResult.commits) ? commitsResult.commits : []);
        setIssues(Array.isArray(issuesResult.issues) ? issuesResult.issues : []);
        setIsLoading(false);
        handleGenerate(commitsResult.commits, issuesResult.issues);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setErrorMessage(message);
        setIsLoading(false);
      }
    },
    [isRepoUrlValid, repoUrl]
  );


  const handleGenerate = async (commits: CommitOut[], issues: IssueOut[]) =>{

    setIsLoading(true);
    setErrorMessage("");
    setIsGeneratingContent(true);

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
      setIsGeneratingContent(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setErrorMessage(message);
      console.error("generate request failed", err);
    } finally {
      setIsLoading(false);
    }
  }



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

        <Button type="submit" disabled={!isRepoUrlValid || isLoading || isGeneratingContent}>
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Generating...
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

        {!commits.length && !issues.length && !isLoading && !errorMessage ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your repository data will appear here.
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <Spinner className="h-4 w-4" />
            Fetching repository data...
          </div>
        ) : null}

        {commits.length > 0 || issues.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Commits Section */}
            {commits.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">
                    Commits ({commits.length})
                  </CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                    Copy as Markdown
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {commits.map((commit, index) => (
                      <CommitCard key={commit.sha} commit={commit} index={index} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Issues Section */}
            {issues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Issues ({issues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {issues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {content ? (
          <div className="mt-8">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : null}
      </div>
    </div>
  );
}
