// Browser-local invitation attribution only, not proof of a referred signup or reward eligibility.
const OWN_KEY = "luckyOrbit:invitationCode";
const RECEIVED_KEY = "luckyOrbit:receivedInvitation";
const valid = (code) => typeof code === "string" && /^LO-[a-f0-9]{32}$/.test(code);
export function invitationCode() {
  let code;
  try {
    code = localStorage.getItem(OWN_KEY);
  } catch {
    /* optional storage */
  }
  if (!valid(code)) {
    code = `LO-${crypto.randomUUID().replaceAll("-", "")}`;
    try {
      localStorage.setItem(OWN_KEY, code);
    } catch {
      /* current link still works */
    }
  }
  return code;
}
export function invitationLink(code, location = window.location.href) {
  if (!valid(code)) throw new Error("Invalid invitation code");
  const url = new URL(location);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Invalid invitation URL");
  // Never share login tokens, recovery parameters, filters or fragments.
  url.search = "";
  url.hash = "";
  url.searchParams.set("ref", code);
  return url.href;
}
export function receivedInvitation(ownCode) {
  const url = new URL(window.location.href);
  const incoming = url.searchParams.get("ref");
  let saved;
  try {
    saved = localStorage.getItem(RECEIVED_KEY);
  } catch {
    /* optional storage */
  }
  if (!valid(saved) && valid(incoming) && incoming !== ownCode) {
    saved = incoming;
    try {
      localStorage.setItem(RECEIVED_KEY, saved);
    } catch {
      /* session-only attribution */
    }
  }
  if (incoming !== null) {
    url.searchParams.delete("ref");
    window.history.replaceState(window.history.state, "", url.href);
  }
  return valid(saved) && saved !== ownCode ? saved : null;
}
