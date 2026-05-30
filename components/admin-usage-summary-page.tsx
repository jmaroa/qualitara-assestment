"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/trpc/client";

type AdminUsageSummaryPageProps = {
  defaultWeekEndingDate: string;
};

type TopEventType = {
  eventType: string;
  count: number;
};

type SchoolSummary = {
  schoolId: string;
  activeTeachers: number;
  totalEvents: number;
  topEventTypes: TopEventType[];
};

type WeeklyDistrictSummary = {
  districtId: string;
  weekStarting: string;
  weekEnding: string;
  summary: {
    totalActiveTeachers: number;
    totalEvents: number;
    topEventTypes: TopEventType[];
  };
  schools: SchoolSummary[];
};

type QueryInput = {
  districtId: string;
  weekEndingDate: string;
};

type SortKey = "activeTeachers" | "totalEvents";
type SortDirection = "asc" | "desc";

function formatTopEventTypes(topEventTypes: TopEventType[]) {
  if (topEventTypes.length === 0) {
    return "None";
  }

  return topEventTypes.map((item) => `${item.eventType} (${item.count})`).join(", ");
}

export function sortSchools(schools: SchoolSummary[], sortKey: SortKey, sortDirection: SortDirection) {
  return [...schools].sort((left, right) => {
    const valueDifference = left[sortKey] - right[sortKey];

    if (valueDifference !== 0) {
      return sortDirection === "asc" ? valueDifference : -valueDifference;
    }

    return left.schoolId.localeCompare(right.schoolId);
  });
}

export function formatSummaryText(summary: WeeklyDistrictSummary) {
  const schoolLines = summary.schools.map(
    (school) =>
      `- ${school.schoolId}: ${school.activeTeachers} active teachers, ${school.totalEvents} events, top events ${formatTopEventTypes(school.topEventTypes)}`,
  );

  return [
    `District Usage Summary`,
    `District: ${summary.districtId}`,
    `Week: ${summary.weekStarting} to ${summary.weekEnding}`,
    `Active teachers: ${summary.summary.totalActiveTeachers}`,
    `Total events: ${summary.summary.totalEvents}`,
    `Top event types: ${formatTopEventTypes(summary.summary.topEventTypes)}`,
    "Schools:",
    ...schoolLines,
  ].join("\n");
}

export function AdminUsageSummaryPage({ defaultWeekEndingDate }: AdminUsageSummaryPageProps) {
  const [districtId, setDistrictId] = useState("");
  const [weekEndingDate, setWeekEndingDate] = useState(defaultWeekEndingDate);
  const [submittedInput, setSubmittedInput] = useState<QueryInput | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("totalEvents");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const summaryQuery = api.reports.weeklyDistrictSummary.useQuery(
    submittedInput ?? { districtId: "", weekEndingDate: defaultWeekEndingDate },
    {
      enabled: submittedInput !== null,
      retry: false,
    },
  );

  const summary = summaryQuery.data;
  const sortedSchools = useMemo(() => {
    if (!summary) {
      return [];
    }

    return sortSchools(summary.schools, sortKey, sortDirection);
  }, [sortDirection, sortKey, summary]);

  const isEmpty = summary !== undefined && summary.summary.totalEvents === 0 && summary.schools.length === 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextDistrictId = districtId.trim();
    if (nextDistrictId.length === 0) {
      setFormError("District ID is required.");
      return;
    }

    if (weekEndingDate.length === 0) {
      setFormError("Week-ending date is required.");
      return;
    }

    setFormError(null);
    setCopyFeedback(null);
    setSubmittedInput({ districtId: nextDistrictId, weekEndingDate });
  }

  function handleSort(nextSortKey: SortKey) {
    if (sortKey === nextSortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection("desc");
  }

  async function handleCopySummary() {
    if (!summary || typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyFeedback("Clipboard is not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(formatSummaryText(summary));
      setCopyFeedback("Summary copied.");
    } catch {
      setCopyFeedback("Failed to copy summary.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 print:min-h-0 print:px-0 print:py-4">
      <header className="space-y-2 print:space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Internal tool
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">District Usage Reports</h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted-foreground)] print:max-w-none">
          Request a weekly district summary, review the school breakdown, and copy or print a clean handoff for district admins.
        </p>
      </header>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="print-hidden">
          <CardTitle>Report request</CardTitle>
          <CardDescription>Enter a district ID and the week-ending date to load the weekly summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] sm:items-end print-hidden" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium" htmlFor="district-id">
              District ID
              <Input
                id="district-id"
                onChange={(event) => setDistrictId(event.target.value)}
                placeholder="district-1"
                value={districtId}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium" htmlFor="week-ending-date">
              Week-ending date
              <Input
                id="week-ending-date"
                onChange={(event) => setWeekEndingDate(event.target.value)}
                type="date"
                value={weekEndingDate}
              />
            </label>

            <Button className="sm:self-end" type="submit">
              Load summary
            </Button>
          </form>

          {formError ? (
            <p className="mt-3 text-sm text-[var(--color-destructive)]" role="alert">
              {formError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {summaryQuery.isPending ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-[var(--color-muted-foreground)]">Loading summary…</p>
          </CardContent>
        </Card>
      ) : null}

      {summaryQuery.error ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm font-medium text-[var(--color-destructive)]">Unable to load the weekly summary.</p>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">Check the district ID and week-ending date, then try again.</p>
          </CardContent>
        </Card>
      ) : null}

      {isEmpty ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-sm font-medium">No usage data found.</p>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              There are no events for district <span className="font-medium">{summary?.districtId}</span> in the week ending {summary?.weekEnding}.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {summary && !isEmpty ? (
        <>
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] print:block print:space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>District summary</CardTitle>
                <CardDescription>
                  {summary.districtId} · {summary.weekStarting} to {summary.weekEnding}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Active teachers</p>
                  <p className="mt-1 text-2xl font-semibold">{summary.summary.totalActiveTeachers}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Total events</p>
                  <p className="mt-1 text-2xl font-semibold">{summary.summary.totalEvents}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Top event types</p>
                  <p className="mt-1 text-sm font-medium">{formatTopEventTypes(summary.summary.topEventTypes)}</p>
                </div>
              </CardContent>
            </Card>

            <div className="print-hidden flex flex-col items-start gap-2">
              <Button onClick={handleCopySummary} variant="outline">
                Copy Summary
              </Button>
              {copyFeedback ? <p className="text-sm text-[var(--color-muted-foreground)]">{copyFeedback}</p> : null}
            </div>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>School breakdown</CardTitle>
              <CardDescription>Sortable by active teachers or total events.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>
                      <button className="print-hidden font-medium" onClick={() => handleSort("activeTeachers")} type="button">
                        Active teachers {sortKey === "activeTeachers" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                      </button>
                      <span className="hidden print:inline">Active teachers</span>
                    </TableHead>
                    <TableHead>
                      <button className="print-hidden font-medium" onClick={() => handleSort("totalEvents")} type="button">
                        Total events {sortKey === "totalEvents" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                      </button>
                      <span className="hidden print:inline">Total events</span>
                    </TableHead>
                    <TableHead>Top event types</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSchools.map((school) => (
                    <TableRow key={school.schoolId}>
                      <TableCell className="font-medium">{school.schoolId}</TableCell>
                      <TableCell>{school.activeTeachers}</TableCell>
                      <TableCell>{school.totalEvents}</TableCell>
                      <TableCell>{formatTopEventTypes(school.topEventTypes)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  );
}
