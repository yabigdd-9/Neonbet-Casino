import React, { useState } from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { updatePassword } from "../../services/auth.service";

export default function PasswordRecoveryModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (saving || password.length < 12 || password !== confirm) return;
    setSaving(true);
    setError("");
    try {
      await updatePassword(password);
      onSuccess();
    } catch {
      setError("Your password could not be updated. Request a new recovery link and try again.");
    } finally { setSaving(false); }
  }
  return (
    <Modal title="Reset your password" onClose={saving ? undefined : onClose} maxWidth="max-w-lg">
      <form onSubmit={submit} className="space-y-4 p-5">
        <p className="text-slate-300">Choose a new password with at least 12 characters.</p>
        <Input label="New password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} error={confirm && password !== confirm ? "Passwords must match." : undefined} />
        {error && <p role="alert" className="text-rose-100">{error}</p>}
        <Button type="submit" disabled={saving || password.length < 12 || password !== confirm}>{saving ? "Saving…" : "Update password"}</Button>
      </form>
    </Modal>
  );
}
