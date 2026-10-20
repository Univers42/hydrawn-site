import type { APIRoute } from "astro";
import { faviconSvg } from "../lib/mark";

/** The favicon is the mark's small cut, generated from the same source as every other size. */
export const GET: APIRoute = () =>
  new Response(faviconSvg(), { headers: { "Content-Type": "image/svg+xml" } });
