// Admin review modal (verification / withdrawal).
import React, { useState } from "react";
import Modal from "../../components/ui/Modal";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { statusLabel } from "../../lib/status";
import { formatMoney } from "../../lib/storage";

interface ReviewItem {
  id?: string;
  amount_usd?: number;
  payout_method?: string;
  payout_address?: string;
  tx_hash?: string;
  admin_notes?: string;
  status?: string;
}

interface AdminReviewModalProps {
  item: ReviewItem | null;
  type: "verification" | "withdrawal";
  status: string;
  onClose: () => void;
  onSubmit: (item: ReviewItem, status: string, notes: string) => void;
  saving: boolean;
}

export default function AdminReviewModal({
  item,
  type,
  status,
  onClose,
  onSubmit,
  saving,
}: AdminReviewModalProps) {
  const [adminNotes, setAdminNotes] = useState(item?.admin_notes || "");
  if (!item) return null;
  const title = type === "withdrawal" ? "Review Withdrawal" : "Review Verification";

  return (
    <Modal title={title} eyebrow="Admin action" onClose={onClose} maxWidth="max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(item, status, adminNotes);
        }}
        className="p-6"
      >
        <p className="text-sm text-slate-400">
          Set status to {statusLabel(status as never)} and save an admin note.
        </p>
        <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-slate-400">
            {type === "withdrawal" ? "Request" : "Transaction"}
          </div>
          <div className="mt-2 break-all font-mono text-sm text-white">
            {type === "withdrawal"
              ? `${formatMoney(Number(item.amount_usd))} ${item.payout_method} ${item.payout_address}`
              : item.tx_hash}
          </div>
        </div>
        <div className="mt-4">
          <Textarea
            label="Admin note"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add review notes"
          />
        </div>
        <Button type="submit" variant="primary" disabled={saving} className="mt-4 w-full">
          {saving ? "Saving..." : "Save review"}
        </Button>
      </form>
    </Modal>
  );
}
