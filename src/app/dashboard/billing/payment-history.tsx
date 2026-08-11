import { getPlanByTier } from "@/constants/membership";
import { formatCurrency } from "@/lib/utils";
import type { MembershipTier } from "@/types";

export type PaymentHistoryItem = {
  id: string;
  amount: number;
  payment_type: string;
  status: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

function formatPaymentDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getPaymentDescription(payment: PaymentHistoryItem): string {
  const meta = payment.metadata ?? {};

  if (payment.payment_type === "subscription") {
    const tier = meta.tier as MembershipTier | undefined;
    const planName = tier ? getPlanByTier(tier).name : "Membership";
    return meta.renewal ? `${planName} plan renewal` : `${planName} plan activation`;
  }

  if (payment.payment_type === "lead_credits") {
    const credits = meta.credits;
    return credits ? `${credits} lead credits` : "Lead credits";
  }

  if (payment.payment_type === "event") {
    return "Event listing";
  }

  return payment.payment_type.replace(/_/g, " ");
}

type PaymentHistoryProps = {
  payments: PaymentHistoryItem[];
};

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-sa-blue">Payment history</h2>
        <p className="mt-1 text-sm text-slate-600">
          {payments.length === 0
            ? "Completed payments will appear here after PayFast confirms them."
            : `${payments.length} completed payment${payments.length === 1 ? "" : "s"} to date.`}
        </p>
      </div>

      {payments.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground">No payments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-100 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3 text-slate-700">
                    {formatPaymentDate(payment.created_at)}
                  </td>
                  <td className="px-5 py-3 text-slate-800">
                    {getPaymentDescription(payment)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-slate-900">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
