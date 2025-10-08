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
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-foreground line-clamp-2">
              {commit.message || "No message"}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                #{index + 1}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {shortSha}
              </span>
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
              <span className="text-muted-foreground">
                (@{commit.authorLogin})
              </span>
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
              className="text-primary hover:underline font-mono text-xs"
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
