const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const makeLoader = require('./load-ts.cjs');
const root = path.resolve(__dirname, '../..');

test('el BFF solicita y devuelve perfil, roles y permisos sin convertir el perfil en un rol', async () => {
  const user = {id_usuario: '12', rol: 'JUZGADO', perfil: {id: 7, nombre: 'JUZGADO', descripcion: 'Perfil QA'},
    roles: [{id: 8, nombre: 'JUEZ', descripcion: null}], permisos: ['VIVI_JUZGADO_CONSULTAR']};
  const load = makeLoader(root, {[path.join(root, 'src/api/graphql/client.ts')]: {
    graphqlRequest: async query => {
      assert.match(query, /perfil\s*\{\s*id\s+nombre\s+descripcion\s*\}/);
      assert.match(query, /roles\s*\{\s*id\s+nombre\s+descripcion\s*\}/);
      return {usuario: user};
    },
  }});
  const response = await load('src/app/api/usuario/route.ts').GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(await response.json(), {usuario: user});
});

test('conserva el perfil y permisos de Auth al guardar y recargar la sesión; no eleva la navegación', async () => {
  const storage = new Map();
  const cookies = new Map();
  const previousStorage = global.localStorage;
  const previousDocument = global.document;
  global.localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  };
  global.document = {
    get cookie() { return [...cookies].map(([key, value]) => key + '=' + value).join('; '); },
    set cookie(value) {
      const [pair] = value.split(';');
      const index = pair.indexOf('=');
      cookies.set(pair.slice(0, index), pair.slice(index + 1));
    },
  };
  try {
    // Store real, Zustand real y js-cookie real; solo almacenamiento/DOM simulados.
    const store = makeLoader(root)('src/store/useAuthStore.ts').useAuthStore;
    const user = {id_usuario: '12', nombre: 'Cuenta QA', email: 'qa@example.invalid',
      rol: 'JUZGADO', perfil: {id: 7, nombre: 'JUZGADO', descripcion: 'Perfil QA'},
      roles: [{id: 8, nombre: 'JUEZ', descripcion: null}], permisos: ['VIVI_JUZGADO_CONSULTAR']};
    store.getState().setAuth('token-controlado', user);
    assert.deepEqual(store.getState().user, user);
    assert.equal(store.getState().getRole(), 'USUARIO');
    assert.equal(store.getState().hasRole('ADMINISTRADOR'), false);
    assert.equal(cookies.get('auth_role'), 'USUARIO');
    const persisted = JSON.parse(storage.get('auth-storage')).state;
    assert.equal(persisted.user.rol, 'JUZGADO');
    assert.deepEqual(persisted.user.permisos, user.permisos);
    assert.deepEqual(persisted.user.perfil, user.perfil);
    assert.deepEqual(persisted.user.roles, user.roles);
    const reloaded = makeLoader(root)('src/store/useAuthStore.ts').useAuthStore;
    await reloaded.persist.rehydrate();
    assert.deepEqual(reloaded.getState().user, user);
    assert.equal(reloaded.getState().token, 'token-controlado');
    assert.equal(cookies.get('auth_role'), 'USUARIO');
    reloaded.getState().setAuth('token-controlado', {...user, rol: 'USER_ADMIN',
      perfil: {id: 1, nombre: 'USER_ADMIN'}, roles: [{id: 1, nombre: 'VIVI_NOTICIAS'}],
      permisos: ['VIVI_NOTICIAS_EDITAR', 'VIVI_NOTICIAS_PUBLICAR', 'VIVI_NOTICIAS_LEER']});
    assert.equal(reloaded.getState().user.rol, 'USER_ADMIN');
    assert.equal(reloaded.getState().getRole(), 'USUARIO');
    assert.equal(reloaded.getState().hasRole('ADMINISTRADOR'), false);
    assert.equal(reloaded.getState().user.permisos.length, 3);
    reloaded.getState().setAuth('token-controlado', {...user, rol: 'administrador', permisos: []});
    assert.equal(reloaded.getState().user.rol, 'administrador');
    assert.equal(reloaded.getState().getRole(), 'ADMINISTRADOR');
    assert.deepEqual(reloaded.getState().user.permisos, []);
    assert.equal(cookies.get('auth_role'), 'ADMINISTRADOR');
  } finally {
    if (previousStorage === undefined) delete global.localStorage;
    else global.localStorage = previousStorage;
    if (previousDocument === undefined) delete global.document;
    else global.document = previousDocument;
  }
});
