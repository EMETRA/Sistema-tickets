const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const loader = require("./load-ts.cjs");
const root = path.resolve(__dirname, "../..");
const catalog = {
  comunicacion: { meta: { id: "comunicacion" }, sections: {} },
};
async function fixture(run, authorization = null, cookie = "sesion-ficticia") {
  const previous = process.env.TICKETS_PLATFORM_ENABLED,
    fetch = global.fetch;
  process.env.TICKETS_PLATFORM_ENABLED = "true";
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return Response.json(catalog);
  };
  const load = loader(root, {
    "next/headers": {
      headers: async () =>
        new Headers(authorization === null ? {} : { authorization }),
      cookies: async () => ({
        get: () => (cookie ? { value: cookie } : undefined),
      }),
    },
    "@/api/config/env": {
      getGraphqlEndpoint: () => "https://tickets.example.invalid/graphql",
    },
  });
  try {
    await run(load("src/api/graphql/home/getAppsCatalog.ts"), calls);
  } finally {
    global.fetch = fetch;
    if (previous === undefined) delete process.env.TICKETS_PLATFORM_ENABLED;
    else process.env.TICKETS_PLATFORM_ENABLED = previous;
  }
}
test("la navegación de aplicaciones usa su cookie de sesión y conserva el origen fijo sin caché", () =>
  fixture(async ({ getAppsCatalog }, calls) => {
    assert.deepEqual(await getAppsCatalog(), catalog);
    assert.equal(
      calls[0].options.headers.Authorization,
      "Bearer sesion-ficticia",
    );
    assert.equal(
      calls[0].url,
      "https://tickets.example.invalid/platform/catalog",
    );
    assert.equal(calls[0].options.cache, "no-store");
    assert.equal(calls[0].options.redirect, "error");
  }));
test("el BFF respeta la identidad explícita cuando también existe cookie", () =>
  fixture(async ({ getAppsCatalog }, calls) => {
    await getAppsCatalog();
    assert.equal(calls[0].options.headers.Authorization, "Bearer otra-sesion");
  }, "Bearer otra-sesion"));
test("una cabecera inválida no utiliza una cookie alternativa ni consulta red", () =>
  fixture(async ({ getAppsCatalog }, calls) => {
    await assert.rejects(getAppsCatalog(), (e) => e.status === 401);
    assert.equal(calls.length, 0);
  }, "Basic invalida"));
test("el catálogo exige sesión y no abre las aplicaciones por su nombre o rol", () =>
  fixture(
    async ({ getAppsCatalog }, calls) => {
      await assert.rejects(getAppsCatalog(), (e) => e.status === 401);
      assert.equal(calls.length, 0);
    },
    null,
    null,
  ));
test("un fallo del proveedor devuelve un error controlado sin texto interno", () =>
  fixture(async ({ getAppsCatalog }) => {
    global.fetch = async () =>
      new Response("detalles Oracle y credenciales", { status: 503 });
    await assert.rejects(
      getAppsCatalog(),
      (e) => e.status === 503 && !e.message.includes("Oracle"),
    );
  }));
test("HTML con HTTP 200 no se acepta como catálogo de aplicaciones", () =>
  fixture(async ({ getAppsCatalog }) => {
    global.fetch = async () =>
      new Response("<html>proxy</html>", {
        headers: { "content-type": "text/html" },
      });
    await assert.rejects(getAppsCatalog(), (e) => e.status === 502);
  }));
