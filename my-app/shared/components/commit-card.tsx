import type { JSX } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CommitOut } from "@/shared/types/repository";

interface CommitCardProps {
  commit: CommitOut;
  index: number;
}

export function CommitCard({ commit, index }: CommitCardProps): JSX.Element {
  const commitDate = new Date(commit.date || "").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const shortSha = commit.sha.substring(0, 7);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground line-clamp-2 text-sm font-medium">
              {commit.message || "No message"}
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                #{index + 1}
              </Badge>
              <span className="text-muted-foreground font-mono text-xs">{shortSha}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Author:</span>
            <span className="font-medium">{commit.authorName || "Unknown"}</span>
            {commit.authorLogin && (
              <span className="text-muted-foreground">(@{commit.authorLogin})</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Date:</span>
            <span>{commitDate}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Commit:</span>
            <a
              href={commit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-mono text-xs hover:underline"
            >
              {commit.sha}
            </a>
          </div>

          {commit.authorUrl && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Profile:</span>
              <a
                href={commit.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View on GitHub
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
