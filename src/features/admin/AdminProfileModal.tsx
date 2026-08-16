// Admin profile editor modal.
import React, { useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

interface AdminProfileModalProps {
  item: any;
  type: string;
  status: string;
  onClose: () => void;
  onSubmit: (profile: any, updates?: Record<string, unknown>) => void;
  saving: boolean;
}

export default function AdminProfileModal({
  item,
  onClose,
  onSubmit,
  saving,
}: AdminProfileModalProps) {
  const [bonusBalance, setBonusBalance] = useState(item?.bonus_balance ?? 0);
  const [rolloverProgress, setRolloverProgress] = useState(item?.rollover_progress ?? 0);
  const [rolloverRequired, setRolloverRequired] = useState(item?.rollover_required ?? 0);
  const [adminNotes, setAdminNotes] = useState(item?.admin_notes ?? "");

  if (!item) return null;

  return (
    <Modal title="Edit Profile" eyebrow="Admin action" onClose={onClose} maxWidth="max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(item, {
            bonus_balance: Number(bonusBalance),
            rollover_progress: Number(rolloverProgress),
            rollover_required: Number(rolloverRequired),
            admin_notes: adminNotes,
          });
        }}
        className="space-y-4 p-6"
      >
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-slate-400">User</div>
          <div className="mt-2 break-all font-mono text-sm text-white">
            {item.username || item.email || item.id}
          </div>
        </div>

        <Input
          label="Bonus balance"
          type="number"
          value={bonusBalance}
          onChange={(e) => setBonusBalance(e.target.value)}
        />
        <Input
          label="Rollover progress"
          type="number"
          value={rolloverProgress}
          onChange={(e) => setRolloverProgress(e.target.value)}
        />
        <Input
          label="Rollover required"
          type="number"
          value={rolloverRequired}
          onChange={(e) => setRolloverRequired(e.target.value)}
        />
        <Input
          label="Admin notes"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
        />

        <Button type="submit" variant="primary" disabled={saving} className="mt-4 w-full">
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </form>
    </Modal>
  );
}
