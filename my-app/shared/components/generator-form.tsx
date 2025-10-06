"use client";

import type { JSX } from "react";
import React, { useCallback, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";


interface GenerateResponse {
  content: string;
}

export function GeneratorForm(): JSX.Element {
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultMarkdown, setResultMarkdown] = useState<string>("");
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
    if (!resultMarkdown) return;
    try {
      await navigator.clipboard.writeText(resultMarkdown);
    } catch (err) {
      console.error("clipboard write failed", err);
    }
  }, [resultMarkdown]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!isRepoUrlValid) return;

      setIsLoading(true);
      setErrorMessage("");
      setResultMarkdown("");

      try {
        const data = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl }),
        });

        if (!data.ok) {
          const text = await data.text();
          throw new Error(text || `Request failed with ${data.status}`);
        }

        const result = (await data.json()) as GenerateResponse;
        console.log(result);
        setResultMarkdown(result.content ?? "");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setErrorMessage(message);
      } finally {
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

        {!resultMarkdown && !isLoading && !errorMessage ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Your generated story will appear here.</p>
        ) : null}

        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <Spinner className="h-4 w-4" />
            Fetching and generating...
          </div>
        ) : null}

        {resultMarkdown ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold">Generated Story</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <article className="prose prose-neutral max-w-none dark:prose-invert">
                <ReactMarkdown>{resultMarkdown}</ReactMarkdown>
              </article>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
