import { useEffect, useRef } from "react";
import { hasSupabaseConfig, getSession, onAuthChange } from "../services/auth.service";

// Subscribe once. Fresh callbacks avoid resubscribing on every account render.
export default function useAccountSession(onSession, onError) {
  const callbacks = useRef({ onSession, onError });
  callbacks.current = { onSession, onError };
  useEffect(() => {
    if (!hasSupabaseConfig) return;
    let active = true;
    let receivedEvent = false;
    const unsubscribe = onAuthChange((user, event) => {
      if (!active) return;
      receivedEvent = true;
      callbacks.current.onSession(user, event);
    });
    getSession().then((session) => {
      if (active && !receivedEvent) callbacks.current.onSession(session?.user || null);
    }).catch(() => {
      if (active && !receivedEvent) callbacks.current.onError();
    });
    return () => { active = false; unsubscribe(); };
  }, []);
}
