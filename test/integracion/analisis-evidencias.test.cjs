const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createRequire } = require('node:module');
const makeLoader = require('./load-ts.cjs');
const root = path.resolve(__dirname, '../..');
const requireApp = createRequire(path.join(root, 'package.json'));
const React = requireApp('react');
const { renderToStaticMarkup } = requireApp('react-dom/server');
const load = makeLoader(root, {
  [path.join(root, 'src/views/JUZ01Detail/JUZ01Detail.module.scss')]: {},
});
const { AnalisisEvidencias } = load('src/views/JUZ01Detail/AnalisisEvidencias.tsx');
const base = {
  disponible: true, estado: 'REVISION', modo: 'EXIGIR', esPoliticaConjunto: true,
  criterioMotivo: 'SOBRE_BANQUETA', continuoConObservaciones: true,
  archivos: [{
    idEvidencia: '81', hecho: 'NO_DETERMINABLE', placa: 'PARCIAL',
    marca: 'NO_DETERMINABLE', indicioMarca: 'NO_RECONOCIBLE', motivo: 'INSUFICIENTE',
    contenidoSensible: false, posiblePantalla: false, fotogramas: 1,
    ubicacionVehiculo: 'NO_DETERMINABLE',
    verificacionBanqueta: {
      version: 'BANQUETA_APOYO_V3', ubicacionInicial: 'BANQUETA',
      limiteAcera: 'NO_IDENTIFICABLE', ruedaDelantera: 'NO_VISIBLE',
      ruedaTrasera: 'INDETERMINADA', estructuraSobreAcera: 'INDETERMINADA',
    },
  }],
};
const render = analisis => renderToStaticMarkup(React.createElement(AnalisisEvidencias, { analisis }));

test('distingue continuacion del aviso de aprobacion visual y no crea una tarea judicial automatica', () => {
  const html = render(base);
  assert.match(html, /Aviso continuado · análisis inconcluso/);
  assert.match(html, /sin aprobación automática/);
  assert.match(html, /si el propietario presenta defensa/);
  assert.doesNotMatch(html, /Superó la validación|Requiere valoración judicial/);
});
test('muestra incertidumbre y apoyos como estimaciones, sin convertir una rueda oculta en acera', () => {
  const html = render(base);
  assert.match(html, /Apoyos observados por IA/);
  assert.match(html, /Apoyo de rueda delantera<\/dt><dd>No visible/);
  assert.match(html, /Apoyo de rueda trasera<\/dt><dd>Sin determinar/);
  assert.match(html, /No identificable/);
  assert.match(html, /pueden contener errores/);
  assert.match(html, /Resultado de este archivo: No permite comprobar todos los criterios/);
});
test('un resultado historico no inventa verificacion ni continuacion del aviso', () => {
  const html = render({ ...base, continuoConObservaciones: undefined,
    archivos: [{ ...base.archivos[0], verificacionBanqueta: null }] });
  assert.doesNotMatch(html, /Aviso continuado|Apoyos observados por IA/);
  assert.match(html, /No consta una comprobación adicional/);
});

function cliente(respuestas) {
  const llamadas = [];
  const loadApi = makeLoader(root, {
    [path.join(root, 'src/api/graphql/client.ts')]: {
      graphqlRequestClient: async (query, options) => {
        llamadas.push({ query, options });
        const r = respuestas.shift();
        if (r instanceof Error) throw r;
        return r;
      },
    },
  });
  return { api: loadApi('src/api/graphql/juzgado.ts'), llamadas };
}
const errorCampo = field => Object.assign(new Error('Contrato anterior'), {
  graphQLErrors: [{
    message: `Cannot query field "${field}" on type "ViviJuzgadoAnalisis".`,
    extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
  }],
});
test('si el API aun carece del contrato ampliado consulta una vez el anterior, sin perder el caso', async () => {
  const { api, llamadas } = cliente([errorCampo('continuoConObservaciones'), { viviJuzgadoDetalle: { codigoCaso: 'QA-CASO' } }]);
  await api.consultarCasoJuzgado('QA-CASO');
  assert.equal(llamadas.length, 2);
  assert.equal(llamadas[0].query, api.DETALLE_JUZGADO_ANALISIS);
  assert.equal(llamadas[1].query, api.DETALLE_JUZGADO);
  assert.deepEqual(llamadas[0].options, llamadas[1].options);
});
test('no repite solicitudes ante error de red, permiso u otros campos incompatibles', async () => {
  for (const error of [new Error('Red'), errorCampo('campoAjeno'),
    Object.assign(new Error('Permiso'), { graphQLErrors: [{ extensions: { code: 'FORBIDDEN' } }] })]) {
    const { api, llamadas } = cliente([error]);
    await assert.rejects(api.consultarCasoJuzgado('QA-CASO'), e => e === error);
    assert.equal(llamadas.length, 1);
  }
});
