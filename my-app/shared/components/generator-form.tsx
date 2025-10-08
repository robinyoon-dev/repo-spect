"use client";

import type { JSX } from "react";
import React, { useCallback, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CommitOut } from "@/shared/types/repository";
import { CommitCard } from "./commit-card";
import { formatCommitsAsMarkdown } from "../lib/repository";


interface RepositoryResponse {
  commits: CommitOut[];
}


export function GeneratorForm(): JSX.Element {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [commits, setCommits] = useState<CommitOut[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

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

      try {
        const data = await fetch(`/api/repository?url=${repoUrl}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!data.ok) {
          const text = await data.text();
          throw new Error(text || `Request failed with ${data.status}`);
        }

        const result = (await data.json()) as RepositoryResponse;
        
        setCommits(Array.isArray(result.commits) ? result.commits : []);
        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setErrorMessage(message);
        setIsLoading(false);
      }
    },
    [isRepoUrlValid, repoUrl]
  );

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

        <Button type="submit" disabled={!isRepoUrlValid || isLoading}>
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

        {!commits.length && !isLoading && !errorMessage ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Your commit history will appear here.</p>
        ) : null}

        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <Spinner className="h-4 w-4" />
            Fetching commit history...
          </div>
        ) : null}

        {commits.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold">
                Commit History ({commits.length} commits)
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
        ) : null}
      </div>
    </div>
  );
}
