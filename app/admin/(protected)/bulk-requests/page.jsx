import Link from "next/link";
import Container from "@/components/ui/Container";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/server/adminAuth";
import { listBulkRequests } from "@/lib/server/bulkRequests";
import { formatNaira, formatUsd } from "@/lib/utils/format";
import { BULK_LABELS, BULK_STATUSES, bulkTone } from "@/lib/utils/bulkStatus";

export const metadata = { title: "Bulk requests" };

export default async function AdminBulkRequestsPage({ searchParams }) {
  await requireAdmin();
  const { status } = await searchParams;

  const all = await listBulkRequests();
  const active = BULK_STATUSES.includes(status) ? status : "all";
  const rows = active === "all" ? all : all.filter((r) => r.status === active);

  const counts = Object.fromEntries(BULK_STATUSES.map((s) => [s, all.filter((r) => r.status === s).length]));

  const tabs = [
    { value: "all", label: "All", count: all.length },
    ...BULK_STATUSES.map((s) => ({ value: s, label: BULK_LABELS[s], count: counts[s] })),
  ];

  return (
    <Container className="py-10">
      <h1 className="font-serif text-3xl">Bulk procurement requests</h1>
      <p className="mt-2 mb-6 text-sm text-muted">Newest first. Open a request to review it and send a quotation.</p>

      <nav className="flex flex-wrap gap-2" aria-label="Filter by status">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/admin/bulk-requests" : `/admin/bulk-requests?status=${t.value}`}
            aria-current={active === t.value ? "page" : undefined}
            className={`border px-4 py-2 text-sm transition-colors ${
              active === t.value
                ? "border-foreground bg-foreground text-white"
                : "border-border bg-white hover:border-foreground"
            }`}
          >
            {t.label} ({t.count})
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="mt-12 text-center text-muted">
          {all.length === 0
            ? "No bulk requests yet. They appear here when customers submit the form."
            : "No requests with this status."}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-border bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3 font-medium">Request</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Quantity</th>
                <th className="p-3 font-medium">Budget</th>
                <th className="p-3 font-medium">Quotation</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.reference} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <Link href={`/admin/bulk-requests/${r.reference}`} className="font-medium hover:text-accent hover:underline">
                      {r.reference}
                    </Link>
                    <p className="text-xs text-muted">{r.createdLabel}</p>
                  </td>
                  <td className="p-3">
                    <p>{r.fullName}</p>
                    <p className="text-xs text-muted">{r.businessName}</p>
                  </td>
                  <td className="p-3">{r.quantity}</td>
                  <td className="p-3">
                    {r.estimatedBudget == null
                      ? "Not given"
                      : r.currency === "USD"
                        ? formatUsd(r.estimatedBudget)
                        : formatNaira(r.estimatedBudget)}
                  </td>
                  <td className="p-3">{r.quoteAmount != null ? formatNaira(r.quoteAmount) : "Not yet"}</td>
                  <td className="p-3">
                    <StatusBadge tone={bulkTone(r.status)}>{BULK_LABELS[r.status] || r.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}