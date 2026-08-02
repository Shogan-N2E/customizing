import { flatRoutes } from "@remix-run/fs-routes";

// The portfolio site exposes only public routes. Shopify-only routes remain in
// the repository as the original integration reference, but are not loaded by
// the browser demo (and therefore do not require Shopify environment values).
export default flatRoutes({
  ignoredRouteFiles: ["**/app.**", "**/auth.**", "**/webhooks.**"],
});
