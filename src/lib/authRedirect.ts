const LINK_ERROR =
  "This email link is invalid or has expired. Request a new password reset email or sign in again.";

export function inspectAuthRedirect(href: string) {
  const url = new URL(href);
  const fragment = new URLSearchParams(url.hash.slice(1));
  const hasError = [url.searchParams, fragment].some(
    (params) => params.has("error") || params.has("error_code"),
  );
  if (hasError) {
    let fragmentChanged = false;
    for (const params of [url.searchParams, fragment]) {
      for (const key of [
        "error",
        "error_code",
        "error_description",
        "access_token",
        "refresh_token",
        "token_type",
        "expires_in",
        "expires_at",
        "provider_token",
        "provider_refresh_token",
        "type",
        "code",
        "token_hash",
      ]) {
        if (params === fragment && params.has(key)) fragmentChanged = true;
        params.delete(key);
      }
    }
    if (fragmentChanged) url.hash = fragment.toString();
  }
  return {
    error: hasError ? LINK_ERROR : "",
    recovery: !hasError && fragment.get("type") === "recovery" && Boolean(fragment.get("access_token")),
    cleanUrl: url.href,
  };
}
