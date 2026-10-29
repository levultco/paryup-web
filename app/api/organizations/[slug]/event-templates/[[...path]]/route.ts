import { proxyOrgRequest } from "@/lib/org-proxy";

const ALLOWED = [
  { method: "GET", pattern: /^$/ },
  { method: "GET", pattern: /^[\w-]+$/ },
  { method: "POST", pattern: /^$/ },
  { method: "PATCH", pattern: /^[\w-]+$/ },
  { method: "DELETE", pattern: /^[\w-]+$/ },
];

async function handle(
  request: Request,
  { params }: { params: Promise<{ slug: string; path?: string[] }> },
) {
  return proxyOrgRequest(request, params, {
    prefix: "/event-templates",
    allowed: ALLOWED,
  });
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
