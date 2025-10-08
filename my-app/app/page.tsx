import type { JSX } from "react";
import { Suspense } from "react";
import { GeneratorForm } from "@/components/generator-form";

export default function Home(): JSX.Element {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center justify-start px-6 py-16 sm:px-8">
      <header className="mb-10 w-full text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Repo-spect</h1>
        <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300">
          Turn your repository&apos;s history into a compelling story.
        </p>
      </header>

      <main className="w-full">
        <Suspense fallback={<div className="text-sm text-neutral-500">Loading...</div>}>
          <GeneratorForm />
        </Suspense>
      </main>
    </div>
  );
}
