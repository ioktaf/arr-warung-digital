import { updateOrderStatusAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/submit-button";
import { getOrderStatusActions } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { Order } from "@/types/domain";

const toneClasses = {
  neutral: "border border-line bg-white/70 text-foreground hover:bg-white",
  brand: "bg-brand text-white hover:bg-brand-strong",
  accent: "bg-accent text-white hover:bg-[#c26f05]",
  success: "bg-success text-white hover:bg-[#10692f]",
  danger: "bg-danger text-white hover:bg-[#9d1818]",
} as const;

type OrderStatusActionsProps = {
  order: Order;
};

export function OrderStatusActions({ order }: OrderStatusActionsProps) {
  const actions = getOrderStatusActions(order.status);

  if (!actions.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <form
          key={`${order.id}-${action.nextStatus}`}
          action={updateOrderStatusAction}
        >
          <input
            type="hidden"
            name="orderId"
            value={order.id}
          />
          <input
            type="hidden"
            name="productSlug"
            value={order.product.slug}
          />
          <input
            type="hidden"
            name="nextStatus"
            value={action.nextStatus}
          />
          <SubmitButton
            idleLabel={action.label}
            pendingLabel={action.pendingLabel}
            className={cn(
              "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
              toneClasses[action.tone],
            )}
          />
        </form>
      ))}
    </div>
  );
}
