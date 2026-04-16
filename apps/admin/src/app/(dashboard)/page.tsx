"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { adminService } from "@/services/admin/admin.service";
import { matchesService } from "@/services/matches/matches.service";
import { playersService } from "@/services/players/players.service";
import type { Match } from "@/services/matches/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getMatchStatusBadge(match: Match) {
  if (match.status === "live") return { label: "Live", variant: "success" as const };
  if (match.status === "finished") {
    return { label: "Finished", variant: "secondary" as const };
  }
  if (match.status === "half_time") {
    return { label: "Half Time", variant: "warning" as const };
  }
  return { label: "Scheduled", variant: "outline" as const };
}

function getMatchScore(match: Match) {
  if (match.homeScore === null || match.awayScore === null) return "vs";
  return `${match.homeScore} - ${match.awayScore}`;
}

export default function DashboardPage() {
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["matches", "stats"],
    queryFn: () => matchesService.getMatches({}),
  });

  const { data: playersData, isLoading: playersLoading } = useQuery({
    queryKey: ["players", "stats"],
    queryFn: () => playersService.getPlayers({}),
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["ingestion-logs", "pending"],
    queryFn: () => adminService.getIngestionLogs({ status: "pending", limit: 5 }),
  });

  const matches = matchesData?.data ?? [];
  const players = playersData?.data ?? [];
  const pendingLogs = logsData?.data ?? [];
  const liveMatches = matches.filter((match) => match.status === "live");
  const upcomingMatches = matches
    .filter((match) => match.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
    )
    .slice(0, 5);
  const recentMatches = [...matches]
    .sort(
      (a, b) =>
        new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime(),
    )
    .slice(0, 5);

  const totalPendingLogs = logsData?.total ?? pendingLogs.length;
  const playerCount = playersData?.total ?? players.length;

  const summaryCards = [
    {
      title: "Live Matches",
      value: liveMatches.length,
      description: "Active fixtures currently under live supervision",
      icon: Activity,
    },
    {
      title: "Upcoming Fixtures",
      value: upcomingMatches.length,
      description: "Scheduled matches ready for operational prep",
      icon: CalendarClock,
    },
    {
      title: "Pending Reviews",
      value: totalPendingLogs,
      description: "Ingestion items awaiting moderation",
      icon: ShieldCheck,
    },
    {
      title: "Registered Players",
      value: playerCount,
      description: "Profiles currently available in the registry",
      icon: Users,
    },
  ];

  const loading = matchesLoading || playersLoading || logsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Match operations overview</h2>
          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
            A clean working surface for live coverage, scheduling, and review.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/matches">
              Open matches
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/system-logs">Review queue</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className="text-3xl">{card.value}</CardTitle>
              </div>
              <div className="rounded-md border border-[color:var(--border)] p-2">
                <card.icon className="h-4 w-4 text-[color:var(--muted-foreground)]" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[color:var(--muted-foreground)]">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operations desk</CardTitle>
            <CardDescription>
              Switch between live coverage and upcoming schedules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="live" className="space-y-4">
              <TabsList>
                <TabsTrigger value="live">Live now</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="space-y-3">
                {loading ? (
                  <div className="flex min-h-40 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-[color:var(--muted-foreground)]" />
                  </div>
                ) : liveMatches.length > 0 ? (
                  liveMatches.map((match) => {
                    const badge = getMatchStatusBadge(match);
                    return (
                      <Link
                        key={match.id}
                        href={`/matches/${match.id}`}
                        className="block rounded-lg border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--muted)]"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={badge.variant}>{badge.label}</Badge>
                              <span className="text-xs text-[color:var(--muted-foreground)]">
                                {formatDateLabel(match.matchDate)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
                              <span>{match.homeTeam.name}</span>
                              <span className="font-display text-2xl">
                                {getMatchScore(match)}
                              </span>
                              <span>{match.awayTeam.name}</span>
                            </div>
                            <p className="text-sm text-[color:var(--muted-foreground)]">
                              {match.venue ?? "Venue pending"}
                            </p>
                          </div>
                          <Button variant="ghost" className="justify-start sm:justify-center">
                            Open
                          </Button>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted-foreground)]">
                    No live matches right now.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-3">
                {loading ? (
                  <div className="flex min-h-40 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-[color:var(--muted-foreground)]" />
                  </div>
                ) : upcomingMatches.length > 0 ? (
                  upcomingMatches.map((match) => (
                    <div
                      key={match.id}
                      className="rounded-lg border border-[color:var(--border)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {match.homeTeam.name} vs {match.awayTeam.name}
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                            {formatDateLabel(match.matchDate)}
                          </p>
                        </div>
                        <Badge variant="outline">Scheduled</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted-foreground)]">
                    No scheduled fixtures available yet.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review queue</CardTitle>
            <CardDescription>
              Pending ingestion items that need moderation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {logsLoading ? (
              <div className="flex min-h-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[color:var(--muted-foreground)]" />
              </div>
            ) : pendingLogs.length > 0 ? (
              pendingLogs.map((log, index) => (
                <div key={log.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="warning">{log.type}</Badge>
                        <span className="text-xs text-[color:var(--muted-foreground)]">
                          {formatDateLabel(log.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium">{log.source}</p>
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        Status: {log.status}
                      </p>
                    </div>
                    <AlertCircle className="mt-1 h-4 w-4 text-[color:var(--warning)]" />
                  </div>
                  {index < pendingLogs.length - 1 ? <Separator className="mt-3" /> : null}
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[color:var(--border)] p-6 text-center">
                <CheckCircle2 className="mx-auto h-5 w-5 text-[color:var(--success)]" />
                <p className="mt-3 text-sm font-medium">Queue is clear</p>
                <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                  New moderation items will show up here automatically.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent fixtures</CardTitle>
            <CardDescription>
              Most recent matches recorded in the admin workspace.
            </CardDescription>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/matches">View all</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex min-h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[color:var(--muted-foreground)]" />
            </div>
          ) : recentMatches.length > 0 ? (
            recentMatches.map((match) => {
              const badge = getMatchStatusBadge(match);
              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="flex flex-col gap-3 rounded-lg border border-[color:var(--border)] p-4 transition hover:bg-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      <span className="text-xs text-[color:var(--muted-foreground)]">
                        {formatDateLabel(match.matchDate)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium">
                      {match.homeTeam.name} {getMatchScore(match)} {match.awayTeam.name}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[color:var(--muted-foreground)]" />
                </Link>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-[color:var(--border)] p-6 text-sm text-[color:var(--muted-foreground)]">
              No match activity yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
