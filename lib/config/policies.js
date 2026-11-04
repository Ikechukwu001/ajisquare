// Business decisions used by the policy pages.
// Leave anything blank (or null) that isn't decided yet. The pages then use neutral wording.
// The client should review the finished pages (ideally a lawyer too) before launch.
export const policies = {
  // Update this date whenever you change a policy
  lastUpdated: "3 November 2026",

  // Registered business name, if different from the brand name (shown in Privacy and Terms)
  legalName: "",

  // Registered business address (shown in Privacy and Terms when set)
  registeredAddress: "",

  // e.g. "Delivery within Nigeria usually takes 3 to 7 working days after your shipping fee is paid."
  deliveryTimeframe: "",

  // e.g. "Pre-order and bulk procurement items usually arrive in Nigeria within 3 to 6 weeks after payment."
  procurementTimeframe: "",

  // Number of days after delivery that the customer can report a problem, e.g. 7. Use null if not decided.
  returnWindowDays: null,

  // Who pays return shipping when the customer simply changes their mind: "customer", "business", or "" (not decided)
  returnShippingPaidBy: "",
};