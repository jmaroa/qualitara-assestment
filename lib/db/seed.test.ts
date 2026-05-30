// @vitest-environment node

import { describe, expect, it } from "vitest";

import { generateSyntheticSeedDataset } from "@/lib/db/seed";

describe("generateSyntheticSeedDataset", () => {
  it("produces deterministic identifiers and counts", () => {
    // Arrange
    const firstDataset = generateSyntheticSeedDataset();
    const secondDataset = generateSyntheticSeedDataset();

    // Act
    const result = {
      firstEvent: firstDataset.events[0],
      lastEvent: firstDataset.events.at(-1),
      secondFirstEvent: secondDataset.events[0],
      secondLastEvent: secondDataset.events.at(-1),
      summary: firstDataset.summary,
    };

    // Assert
    expect(result).toEqual({
      firstEvent: firstDataset.events[0],
      lastEvent: firstDataset.events.at(-1),
      secondFirstEvent: firstDataset.events[0],
      secondLastEvent: firstDataset.events.at(-1),
      summary: {
        districtCount: 3,
        schoolCount: 9,
        teacherCount: 79,
        totalEvents: 2000,
      },
    });
  });

  it("spans four weeks with expected district and school ranges", () => {
    // Arrange
    const dataset = generateSyntheticSeedDataset();
    const districtIds = new Set(dataset.events.map((event) => event.districtId));
    const schoolIds = new Set(dataset.events.map((event) => event.schoolId));
    const firstTimestamp = dataset.events[0]?.timestamp ?? "";
    const lastTimestamp = dataset.events.at(-1)?.timestamp ?? "";

    // Act
    const spanInDays =
      (Date.parse(lastTimestamp) - Date.parse(firstTimestamp)) /
      (24 * 60 * 60 * 1000);
    const result = {
      districtCount: districtIds.size,
      schoolCount: schoolIds.size,
      spansFourWeeks: spanInDays > 27 && spanInDays < 28,
    };

    // Assert
    expect(result).toEqual({
      districtCount: 3,
      schoolCount: 9,
      spansFourWeeks: true,
    });
  });
});
