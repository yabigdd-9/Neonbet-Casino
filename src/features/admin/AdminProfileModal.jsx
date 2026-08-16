// Admin profile edit modal (bonus/rollover/admin notes).
import React, { useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";

export default function AdminProfileModal({ userProfile, onClose, onSubmit, saving }) {
  const [bonusBalance, setBonusBalance] = useState(String(userProfile?.bonus_balance ?? 100));
  const [rolloverProgress, setRolloverProgress] = useState(String(userProfile?.rollover_progress ?? 0));
  const [rolloverRequired, setRolloverRequired] = useState(String(userProfile?.rollover_required ?? 1000));
  const [adminNotes, setAdminNotes] = useState(userProfile?.admin_notes || "");
  if (!userProfile) return null;

  return (
    <Modal title={userProfile.username || userProfile.email} eyebrow="User controls" onClose={onClose} maxWidth="max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(userProfile, {
            bonus_balance: Number(bonusBalance),
            rollover_progress: Number(rolloverProgress),
            rollover_required: Number(rolloverRequired),
            admin_notes: adminNotes,
          });
        }}
        className="p-6"
      >
        <p className="text-sm text-slate-400">Edit bonus balance, rollover progress, and admin notes.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[["Bonus balance", bonusBalance, setBonusBalance], ["Rollover progress", rolloverProgress, setRolloverProgress], ["Rollover required", rolloverRequired, setRolloverRequired]].map(([label, value, setter]) => (
            <Input key={label} label={label} type="number" min="0" step="0.01" value={value} onChange={(e) => setter(e.target.value)} />
          ))}
        </div>
        <div className="mt-4">
          <Textarea label="Admin note" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
        </div>
        <Button type="submit" variant="primary" disabled={saving} className="mt-4 w-full">
          {saving ? "Saving..." : "Save user controls"}
        </Button>
      </form>
    </Modal>
  );
}
