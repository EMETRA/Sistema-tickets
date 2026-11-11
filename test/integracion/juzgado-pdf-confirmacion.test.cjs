const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

test('cada reintento documental revisa y confirma de nuevo sin reutilizar un comando incierto', async () => {
    const saved = global.sessionStorage;
    const storage = new Map(), reviews = [], confirms = [];
    global.sessionStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
    const load = require('./load-ts.cjs')(root, {
        [path.join(root, 'src/platform/runtime.ts')]: { getPlatformRuntime: () => ({ actor: { admin: true } }) },
        '@/store/useAuthStore': { useAuthStore: { getState: () => ({ user: { id_usuario: '1' } }) } },
        '@/api/administrative-confirmation': { confirmAdministrativeChange: async change => { await change.onReview(); await change.onConfirm(); } },
        [path.join(root, 'src/platform/client.ts')]: { platformFetch: async (url, options) => {
            if (url === '/confirmations/review') { reviews.push(JSON.parse(options.body)); return { id: 'revision-' + reviews.length }; }
            confirms.push(url); return { paso: 2 };
        } },
    });
    try {
        const { legacyProof, completeLegacy } = load('src/platform/legacy-proof.ts');
        const endpoint = '/legacy/vivi/juzgado/resoluciones/4/documento/generar';
        const first = await legacyProof(endpoint, {}, 'Generar PDF');
        const second = await legacyProof(endpoint, {}, 'Reintentar PDF');
        assert.notEqual(first['X-Ticket-Request-Id'], second['X-Ticket-Request-Id']);
        assert.equal(first['X-Ticket-Confirmation'], 'revision-1');
        assert.equal(second['X-Ticket-Confirmation'], 'revision-2');
        assert.deepEqual(confirms, ['/confirmations/revision-1/confirm', '/confirmations/revision-2/confirm']);
        assert.ok(reviews.every(value => value.path === endpoint && value.method === 'POST'));
        assert.equal(reviews[0].body.requestId, first['X-Ticket-Request-Id']);
        assert.equal(reviews[1].body.requestId, second['X-Ticket-Request-Id']);
        // La recepción y decisión judiciales mantienen sus claves ante incertidumbre.
        for (const other of ['/graphql/viviJuzgadoResolverAcogida', '/legacy/otra/accion', endpoint + '-otra-accion']) {
            const one = await legacyProof(other, { id: 4 }, 'Acción');
            const two = await legacyProof(other, { id: 4 }, 'Acción');
            assert.equal(one['X-Ticket-Request-Id'], two['X-Ticket-Request-Id']);
            completeLegacy(two);
            assert.notEqual((await legacyProof(other, { id: 4 }, 'Acción'))['X-Ticket-Request-Id'], two['X-Ticket-Request-Id']);
        }
    } finally {
        if (saved === undefined) delete global.sessionStorage;
        else global.sessionStorage = saved;
    }
});
