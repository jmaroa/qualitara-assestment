import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminUsageSummaryPage, formatSummaryText } from "@/components/admin-usage-summary-page";

const { useWeeklyDistrictSummaryQueryMock } = vi.hoisted(() => ({
  useWeeklyDistrictSummaryQueryMock: vi.fn(),
}));

vi.mock("@/lib/trpc/client", () => ({
  api: {
    reports: {
      weeklyDistrictSummary: {
        useQuery: useWeeklyDistrictSummaryQueryMock,
      },
    },
  },
}));

function createSummary() {
  return {
    districtId: "district-1",
    schools: [
      {
        activeTeachers: 1,
        schoolId: "school-b",
        topEventTypes: [{ count: 5, eventType: "login" }],
        totalEvents: 5,
      },
      {
        activeTeachers: 3,
        schoolId: "school-a",
        topEventTypes: [{ count: 2, eventType: "assignment_view" }],
        totalEvents: 2,
      },
    ],
    summary: {
      topEventTypes: [{ count: 7, eventType: "login" }],
      totalActiveTeachers: 4,
      totalEvents: 7,
    },
    weekEnding: "2026-05-30",
    weekStarting: "2026-05-24",
  };
}

beforeEach(() => {
  useWeeklyDistrictSummaryQueryMock.mockReset();
});

describe("AdminUsageSummaryPage", () => {
  it("shows a loading state while the summary request is in flight", () => {
    // Arrange
    useWeeklyDistrictSummaryQueryMock.mockReturnValue({
      data: undefined,
      error: null,
      isPending: true,
    });

    // Act
    render(<AdminUsageSummaryPage defaultWeekEndingDate="2026-05-30" />);

    // Assert
    expect(screen.getByText("Loading summary…")).toBeInTheDocument();
  });

  it("shows an explicit empty state when the summary has no events", () => {
    // Arrange
    useWeeklyDistrictSummaryQueryMock.mockReturnValue({
      data: {
        districtId: "district-1",
        schools: [],
        summary: {
          topEventTypes: [],
          totalActiveTeachers: 0,
          totalEvents: 0,
        },
        weekEnding: "2026-05-30",
        weekStarting: "2026-05-24",
      },
      error: null,
      isPending: false,
    });

    // Act
    render(<AdminUsageSummaryPage defaultWeekEndingDate="2026-05-30" />);

    // Assert
    expect(screen.getByText("No usage data found.")).toBeInTheDocument();
  });

  it("shows an explicit error state when the query fails", () => {
    // Arrange
    useWeeklyDistrictSummaryQueryMock.mockReturnValue({
      data: undefined,
      error: new Error("boom"),
      isPending: false,
    });

    // Act
    render(<AdminUsageSummaryPage defaultWeekEndingDate="2026-05-30" />);

    // Assert
    expect(screen.getByText("Unable to load the weekly summary.")).toBeInTheDocument();
  });

  it("sorts schools by active teachers", async () => {
    // Arrange
    const user = userEvent.setup();
    useWeeklyDistrictSummaryQueryMock.mockReturnValue({
      data: createSummary(),
      error: null,
      isPending: false,
    });

    // Act
    render(<AdminUsageSummaryPage defaultWeekEndingDate="2026-05-30" />);
    await user.click(screen.getByRole("button", { name: /active teachers/i }));

    // Assert
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("school-a");
  });

  it("formats a clipboard-friendly text summary", () => {
    // Arrange
    const summary = createSummary();

    // Act
    const result = formatSummaryText(summary);

    // Assert
    expect(result).toBe(
      [
        "District Usage Summary",
        "District: district-1",
        "Week: 2026-05-24 to 2026-05-30",
        "Active teachers: 4",
        "Total events: 7",
        "Top event types: login (7)",
        "Schools:",
        "- school-b: 1 active teachers, 5 events, top events login (5)",
        "- school-a: 3 active teachers, 2 events, top events assignment_view (2)",
      ].join("\n"),
    );
  });
});
