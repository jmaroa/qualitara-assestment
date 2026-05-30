import { AdminUsageSummaryPage } from "@/components/admin-usage-summary-page";

function getDefaultWeekEndingDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function HomePage() {
  return <AdminUsageSummaryPage defaultWeekEndingDate={getDefaultWeekEndingDate()} />;
}
