export const BULK_STATUSES = ["new", "reviewing", "quoted", "accepted", "closed"];

export const BULK_LABELS = {
  new: "Received",
  reviewing: "Under review",
  quoted: "Quotation ready",
  accepted: "Accepted, awaiting payment",
  closed: "Closed",
};

export const bulkTone = (status) =>
  ({ new: "amber", reviewing: "blue", quoted: "blue", accepted: "green", closed: "gray" })[status] || "gray";