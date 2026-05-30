export default {
  async fetch(request, env) {
    try {
      let res = await env.ASSETS.fetch(request);
      if (res.status === 404) {
        return env.ASSETS.fetch(new Request(new URL("/", request.url)));
      }
      return res;
    } catch (e) {
      console.error(e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
}
