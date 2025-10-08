import type { JSX } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IssueOut } from "@/shared/types/issue";

interface IssueCardProps {
  issue: IssueOut;
}

export function IssueCard({ issue }: IssueCardProps): JSX.Element {
  const createdDate = new Date(issue.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedDate = new Date(issue.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const closedDate = issue.closedAt
    ? new Date(issue.closedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground line-clamp-2 text-sm font-medium">{issue.title}</h3>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={issue.state === "open" ? "default" : "secondary"} className="text-xs">
                #{issue.number} {issue.state}
              </Badge>
              {issue.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {issue.labels.slice(0, 3).map((label) => (
                    <Badge
                      key={label.id}
                      variant="outline"
                      className="text-xs"
                      style={{
                        backgroundColor: `#${label.color}20`,
                        borderColor: `#${label.color}`,
                        color: `#${label.color}`,
                      }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                  {issue.labels.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{issue.labels.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {issue.body && (
            <div className="text-muted-foreground line-clamp-3 text-sm">{issue.body}</div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Author:</span>
            <span className="font-medium">
              {issue.authorName || issue.authorLogin || "Unknown"}
            </span>
            {issue.authorLogin && issue.authorName !== issue.authorLogin && (
              <span className="text-muted-foreground">(@{issue.authorLogin})</span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Created:</span>
            <span>{createdDate}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Updated:</span>
            <span>{updatedDate}</span>
          </div>

          {closedDate && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Closed:</span>
              <span>{closedDate}</span>
            </div>
          )}

          {issue.assignees.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Assignees:</span>
              <div className="flex flex-wrap gap-1">
                {issue.assignees.map((assignee) => (
                  <Badge key={assignee.id} variant="outline" className="text-xs">
                    {assignee.name || assignee.login}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Issue:</span>
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on GitHub
            </a>
          </div>

          {issue.authorUrl && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Author Profile:</span>
              <a
                href={issue.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Profile
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
