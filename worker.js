export default {
  async fetch(request, env) {
    try {
      let res = await env.ASSETS.fetch(request);
      if (res.status === 404) {
        return env.ASSETS.fetch(new Request(new URL("/", request.url)));
      }
      return res;
    } catch (e) {
      return new Response(e.stack || e.message || "Unknown error", { status: 500 });
    }
  }
}
