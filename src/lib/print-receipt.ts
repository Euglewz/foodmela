import { formatTk } from "@/lib/currency";
import { formatDeliveryAddress, PAYMENT_METHODS } from "@/lib/delivery";

export type ReceiptOrder = {
  id: string;
  total: number;
  sector: string;
  roadNumber: string;
  houseDetails: string;
  paymentMethod: string;
  createdAt: string;
  restaurant: { name: string };
  customer: { name: string; phone: string | null };
  items: { name: string; price: number; qty: number }[];
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

// Laid out for 80 mm thermal roll paper (about 72 mm printable), black only.
function receiptHtml(order: ReceiptOrder): string {
  const e = escapeHtml;
  const orderNumber = order.id.slice(-6).toUpperCase();
  const payment = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ?? order.paymentMethod;
  const itemRows = order.items
    .map(
      (line) =>
        `<tr><td class="qty">${line.qty}×</td><td>${e(line.name)}</td><td class="amt">${e(formatTk(line.price * line.qty))}</td></tr>`,
    )
    .join("");

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Order ${orderNumber}</title>
<style>
  @page { margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #000; }
  body { width: 72mm; padding: 3mm 2mm 8mm; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.35; }
  h1 { margin: 0; font-size: 18px; }
  .center { text-align: center; }
  .small { font-size: 11px; }
  .rule { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 1px 0; vertical-align: top; }
  .qty { width: 8mm; white-space: nowrap; }
  .amt { padding-left: 2mm; text-align: right; white-space: nowrap; }
  .total td { padding-top: 2px; font-size: 16px; font-weight: 700; }
  b { font-weight: 700; }
</style></head>
<body>
  <div class="center"><h1>${e(order.restaurant.name)}</h1></div>
  <div class="rule"></div>
  <div class="center"><b>ORDER #${orderNumber}</b><br><span class="small">${e(formatDateTime(new Date(order.createdAt)))}</span></div>
  <div class="rule"></div>
  <table>${itemRows}</table>
  <div class="rule"></div>
  <table><tr class="total"><td>TOTAL</td><td class="amt">${e(formatTk(order.total))}</td></tr></table>
  <div>Payment: ${e(payment)}</div>
  <div class="rule"></div>
  <div><b>Customer:</b> ${e(order.customer.name)}</div>
  ${order.customer.phone ? `<div><b>Phone:</b> ${e(order.customer.phone)}</div>` : ""}
  <div><b>Deliver to:</b> ${e(formatDeliveryAddress(order))}</div>
  <div class="rule"></div>
  <div class="center small">Printed ${e(formatDateTime(new Date()))}</div>
  <div class="center">Thank you!</div>
</body></html>`;
}

// Prints through the browser's normal print path, so any Windows printer driver works.
// Launching Chrome with --kiosk-printing skips the dialog and sends it straight to the default printer.
export function printOrderReceipt(order: ReceiptOrder): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  Object.assign(iframe.style, { position: "fixed", left: "-10000px", top: "0", width: "80mm", height: "10px", border: "0" });

  const cleanup = () => setTimeout(() => iframe.remove(), 1000);
  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return iframe.remove();
    win.addEventListener("afterprint", cleanup, { once: true });
    win.focus();
    win.print();
  };
  iframe.srcdoc = receiptHtml(order);
  document.body.appendChild(iframe);
  setTimeout(() => iframe.remove(), 120_000);
}
