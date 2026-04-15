import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function safeNavigate(
  router: AppRouterInstance,
  href: string,
  mode: "push" | "replace" = "push"
) {
  try {
    if (mode === "replace") {
      router.replace(href);
      return;
    }
    router.push(href);
  } catch {
    if (typeof window !== "undefined") {
      window.location.assign(href);
    }
  }
}
