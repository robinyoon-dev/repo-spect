"use client";

import type { JSX } from "react";
import React, { useCallback, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

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
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with ${res.status}`);
        }

        const data = (await res.json()) as GenerateResponse;
        setResultMarkdown(data.content ?? "");
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
        <input
          id="repoUrl"
          name="repoUrl"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="e.g., https://github.com/facebook/react"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base outline-none ring-0 transition focus:border-neutral-400 focus:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />

        <button
          type="submit"
          disabled={!isRepoUrlValid || isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isLoading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>Generate Story</>
          )}
        </button>
      </form>

      <div className="mt-8">
        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {errorMessage}
          </div>
        ) : null}

        {!resultMarkdown && !isLoading && !errorMessage ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Your generated story will appear here.</p>
        ) : null}

        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Fetching and generating...
          </div>
        ) : null}

        {resultMarkdown ? (
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Generated Story</h2>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-100 active:translate-y-[0.5px] dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M16.5 7.5V18a2.25 2.25 0 01-2.25 2.25h-7.5A2.25 2.25 0 014.5 18v-7.5A2.25 2.25 0 016.75 8.25H15a1.5 1.5 0 001.5-1.5z" />
                  <path d="M18 6.75a2.25 2.25 0 00-2.25-2.25H9.75A2.25 2.25 0 007.5 6.75V7.5h6.75A3.75 3.75 0 0118 11.25z" />
                </svg>
                Copy
              </button>
            </div>
            <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:mt-6 prose-headings:scroll-mt-20 prose-p:leading-relaxed prose-pre:rounded-lg">
              <ReactMarkdown>{resultMarkdown}</ReactMarkdown>
            </article>
          </div>
        ) : null}
      </div>
    </div>
  );
}
