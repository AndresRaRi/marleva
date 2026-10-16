'use strict';
// Comprobación de estados de la maqueta; no acredita navegador ni integración Marleva.
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const folder = __dirname;
const html = fs.readFileSync(path.join(folder, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only' });
const { window } = dom;
window.scrollTo = () => {};
window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
window.eval(
  fs.readFileSync(path.join(folder, 'fixtures.js'), 'utf8') +
    '\n' +
    fs.readFileSync(path.join(folder, 'propuesta.js'), 'utf8'),
);
const document = window.document;
const results = [];
const check = (id, run) => {
  run();
  results.push({ id, result: 'PASS' });
};
const text = () => document.querySelector('main').textContent;
const click = (selector) => {
  const node = document.querySelector(selector);
  assert.ok(node, selector);
  node.click();
};
const scenario = (value) => {
  const input = document.querySelector('#scenario');
  input.value = value;
  input.dispatchEvent(new window.Event('change'));
};
const submit = (value) => {
  const input = document.querySelector('#credential');
  input.value = value;
  input.dispatchEvent(new window.Event('input'));
  input.form.dispatchEvent(new window.Event('submit', { cancelable: true }));
};
const scenarios = [
  ['loading', 'Buscando ofertas'],
  ['empty', 'Pronto habrá más'],
  ['error', 'No pudimos cargar'],
  ['removed', 'Esta oferta ya no está disponible'],
  ['expired-session', 'Tu sesión terminó'],
];
async function main() {
  for (const [value, expected] of scenarios)
    check('DOM-' + value, () => {
      scenario(value);
      assert.ok(text().includes(expected));
    });
  check('DOM-error-reintento', () => {
    scenario('error');
    click('[data-action="retry"]');
    assert.ok(text().includes('Pan de masa madre'));
  });
  check('DOM-paginacion-error-preserva', () => {
    scenario('more-error');
    click('[data-action="more"]');
    assert.ok(text().includes('Pan de masa madre'));
    assert.ok(text().includes('Tus ofertas y filtros se conservan'));
    click('[data-action="more"]');
    assert.ok(text().includes('Galletas de avena'));
  });
  check('DOM-filtros', () => {
    scenario('normal');
    click('[data-action="filters"]');
    assert.equal(document.querySelectorAll('#area option').length, 8);
    document.querySelector('#area').value = 'Paraíso Santa Fe';
    const dialog = document.querySelector('dialog');
    dialog.returnValue = 'apply';
    dialog.dispatchEvent(new window.Event('close'));
    assert.ok(text().includes('No encontramos coincidencias'));
    click('[data-action="clear"]');
    assert.ok(text().includes('Pan de masa madre'));
  });
  check('DOM-busqueda-sin-inyeccion', () => {
    const input = document.querySelector('#query');
    input.value = '<img src=x onerror=alert(1)>';
    input.form.dispatchEvent(new window.Event('submit', { cancelable: true }));
    assert.ok(text().includes('No encontramos coincidencias'));
    assert.equal(document.querySelectorAll('img').length, 0);
    click('[data-action="clear"]');
  });
  check('DOM-codigo-invalido-conserva-contexto', () => {
    click('[data-action="open:pan"]');
    click('[data-action="access"]');
    submit('vecino@example.test');
    submit('000000');
    assert.ok(text().includes('El código no es válido'));
    assert.ok(text().includes('Pan de masa madre'));
    assert.equal(document.querySelector('#credential').value, '000000');
  });
  check('DOM-reenvio-espera', () => {
    assert.ok(document.querySelector('#resend').disabled);
  });
  check('DOM-codigo-vencido-no-pasa-reintentando', () => {
    scenario('expired-code');
    submit('123456');
    assert.ok(text().includes('Este código venció'));
    submit('123456');
    assert.ok(text().includes('Este código venció'));
  });
  scenario('normal');
  click('[data-action="open:pan"]');
  click('[data-action="access"]');
  submit('123456');
  await new Promise((resolve) => setTimeout(resolve, 550));
  check('DOM-retorno-no-concede-compra', () => {
    assert.ok(text().includes('Accediste en la simulación'));
    assert.ok(text().includes('Pan de masa madre'));
    assert.ok(text().includes('no hay compra ni cotización habilitada'));
  });
  check('DOM-salida-limpia', () => {
    click('[data-nav="cuenta"]');
    click('[data-action="logout"]');
    click('[data-nav="cuenta"]');
    assert.ok(text().includes('Entra a tu comunidad'));
    assert.equal(document.querySelector('#credential').type, 'email');
  });
  const result = {
    date: '2026-10-16',
    type: 'DOM simulado con jsdom; no navegador',
    results,
    limits: [
      'Dialog simulado para probar filtros; foco y Escape reales no acreditados aquí',
      'No llamadas a API, base o correo',
      'No WCAG integral ni plataformas nativas',
    ],
    browserObserved: [
      'Chrome: explorar, detalle, correo, código incorrecto/correcto y regreso al mismo detalle',
      'M1 existente: acceso con correo capturado local, cuenta, avisos vacíos y salida',
    ],
    browserPending: [
      'Filtros/estados restantes interrumpidos por timeout de conexión; no se acreditan por jsdom',
    ],
  };
  fs.writeFileSync(path.join(folder, 'validacion.json'), JSON.stringify(result, null, 2) + '\n');
  window.close();
  console.log(JSON.stringify({ passed: results.length, type: result.type }));
}
main().catch((error) => {
  window.close();
  console.error(error);
  process.exitCode = 1;
});
