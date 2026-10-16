import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { create, act } from 'react-test-renderer';
const mock = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('../../../../apps/client/src/api', () => ({ api: mock.api }));
vi.mock('../../../../apps/client/node_modules/react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  StyleSheet: { create: (value) => value },
}));
import { M1App } from '../../../../apps/client/src/modules/m1/m1-app';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const account = (id) => ({
  id,
  correo: `${id}@example.test`,
  estado: 'active',
  pertenencia: 'pendiente',
  operador: false,
  acciones_permitidas: [],
});
const notice = (id) => ({
  id: `notice-${id}`,
  accountId: id,
  kind: 'fixture',
  text: `Aviso propio ${id}`,
  createdAt: '2026-10-15T12:00:00Z',
});
const failure = (status, code, message) => Object.assign(new Error(message), { status, code });
let tree, active, login, change, record, confirmMode, factorMode, requestFail, requests;
beforeEach(() => {
  active = account('a');
  login = active;
  change = null;
  record = null;
  confirmMode = 'invalid';
  factorMode = 'invalid';
  requestFail = false;
  requests = [];
  mock.api.mockImplementation(async (path, method = 'GET', body, signal, headers) => {
    requests.push({ path, method, body, signal, headers });
    if (path === '/v1/me') {
      if (!active) throw failure(401, 'SESION', 'Inicia sesión');
      return active;
    }
    if (path === '/v1/auth/challenges')
      return { challenge_id: 'challenge', mensaje: 'Revisa tu correo' };
    if (path === '/v1/auth/verifications') {
      active = login;
      return { cuenta: login };
    }
    if (path === '/v1/notifications') return { items: [notice(active.id)], next_cursor: null };
    if (path === '/v1/auth/email-changes/current') return { cambio: change };
    if (path === '/v1/auth/email-changes') {
      change = {
        id: 'change',
        account_id: active.id,
        correo_actual: active.correo,
        correo_nuevo: body.correo,
        actual_confirmado: false,
        nuevo_confirmado: false,
        estado: 'verificar_ambos_buzones',
        vence_en: '2030-10-15T18:00:00Z',
      };
      return { id: 'change', estado: 'verificar_ambos_buzones' };
    }
    if (path.includes('/email-changes/change/confirmations')) {
      if (confirmMode === 'session') {
        active = null;
        throw failure(401, 'SESION', 'Sesión vencida');
      }
      if (confirmMode === 'invalid')
        throw failure(401, 'CODIGO_NO_VALIDO', 'Revisa el código del cambio');
      if (confirmMode === 'complete') {
        change.estado = 'completo';
        return { estado: 'completo' };
      }
      change.actual_confirmado = true;
      return { estado: 'falta_otro_buzon' };
    }
    if (path.startsWith('/v1/auth/sessions')) {
      active = null;
      return { estado: 'sesion_revocada' };
    }
    if (path === '/v1/auth/mfa/factors')
      return { items: [{ id: 'old-factor', nombre: 'Mi autenticador', estado: 'verified' }] };
    if (path === '/v1/auth/mfa/enrollments')
      return { id: 'factor', totp: { uri: 'otpauth://totp/Fixture' } };
    if (path === '/v1/auth/mfa/verifications') {
      if (factorMode === 'invalid') throw failure(401, 'FACTOR', 'Revisa el autenticador');
      return { estado: 'factor_verificado' };
    }
    if (path === '/v1/operator/access') return { estado: 'operador_autenticado' };
    if (path === '/v1/auth/mfa-recoveries/current') return { recuperacion: record };
    if (path === '/v1/auth/mfa-recoveries') {
      if (requestFail) {
        requestFail = false;
        throw failure(503, 'DEPENDENCIA', 'Intenta de nuevo');
      }
      record = { id: 'recovery', state: 'requested', version: 1 };
      return record;
    }
    if (path.endsWith('/capabilities')) {
      record = { ...record, version: record.version + 1 };
      return { capability: 'c'.repeat(43), expires_at: '2030-10-15T18:00:00Z' };
    }
    if (path.endsWith('/enrollments')) {
      record = { ...record, version: record.version + 1 };
      return { factor_id: 'new-factor', uri: 'otpauth://totp/NewFixture', qr_code: 'fixture' };
    }
    if (path.endsWith('/verifications')) {
      expect(body.expected_version).toBe(record.version);
      if (factorMode === 'invalid') {
        record = { ...record, version: record.version + 2 };
        throw failure(401, 'FACTOR', 'Revisa el nuevo autenticador');
      }
      record = { ...record, state: 'completed', version: record.version + 1 };
      return record;
    }
    if (path.endsWith('/approvals')) return { id: 'other', state: 'approved', version: 2 };
    if (path.endsWith('/rejections')) return { id: 'other', state: 'rejected', version: 2 };
    if (path === '/v1/auth/mfa-recoveries/other')
      return { id: 'other', state: 'requested', version: 1 };
    throw new Error(`Ruta inesperada ${path}`);
  });
});
afterEach(async () => {
  if (tree) await act(async () => tree.unmount());
  tree = undefined;
  mock.api.mockReset();
});
async function mount() {
  await act(async () => {
    tree = create(React.createElement(M1App));
  });
}
function text() {
  return JSON.stringify(tree.toJSON());
}
async function press(label) {
  const control = tree.root
    .findAllByType('Pressable')
    .find((node) => node.props.accessibilityLabel === label);
  expect(control, `Control ${label}`).toBeDefined();
  expect(control.props.disabled).not.toBe(true);
  await act(async () => control.props.onPress());
}
async function fill(label, value) {
  await act(async () =>
    tree.root
      .findAllByType('TextInput')
      .find((node) => node.props.accessibilityLabel === label)
      .props.onChangeText(value),
  );
}
async function authenticate() {
  await fill('Correo', login.correo);
  await press('Recibir código');
  await fill('Código de seis cifras', '123456');
  await press('Verificar código');
}
it('MAR-M1-IT-FE-109-COMPONENT | error OTP conserva paso; sesión vencida retoma estado propio del servidor', async () => {
  await mount();
  await fill('Nuevo correo', 'new@example.test');
  await press('Iniciar cambio');
  await fill('Código del cambio', '111111');
  await press('Confirmar buzón');
  expect(text()).toContain('Revisa el código del cambio');
  expect(
    tree.root
      .findAllByType('TextInput')
      .find((node) => node.props.accessibilityLabel === 'Código del cambio').props.value,
  ).toBe('111111');
  confirmMode = 'session';
  await press('Confirmar buzón');
  expect(text()).toContain('Accede a tu cuenta');
  expect(text()).not.toContain('new@example.test');
  change.actual_confirmado = true;
  await authenticate();
  expect(
    tree.root
      .findAllByType('TextInput')
      .find((node) => node.props.accessibilityLabel === 'Buzón que estás verificando').props.value,
  ).toBe('new@example.test');
  confirmMode = 'complete';
  await fill('Código del cambio', '123456');
  await press('Confirmar buzón');
  expect(text()).toContain('Correo actualizado. Inicia sesión con el nuevo correo.');
  expect(text()).not.toContain('Código del cambio');
});
it('MAR-M1-IT-FE-109-IDENTITY | otra identidad no hereda cambio, código o destino privado', async () => {
  await mount();
  await fill('Nuevo correo', 'private@example.test');
  await press('Iniciar cambio');
  confirmMode = 'session';
  await fill('Código del cambio', '111111');
  await press('Confirmar buzón');
  login = account('b');
  change = null;
  await authenticate();
  expect(text()).toContain('Aviso propio b');
  expect(text()).not.toContain('private@example.test');
  expect(text()).not.toContain('Código del cambio');
  await press('Avisos');
  expect(text()).toContain('Avisos de cuenta');
  await press('Cuenta');
  await press('Cerrar todas las sesiones');
  expect(text()).toContain('Todas las sesiones cerradas');
});
it('MAR-M1-IT-FE-107-COMPONENT | código MFA inválido no cierra sesión ni pierde campo; verificado retira URI', async () => {
  active = { ...account('a'), operador: true };
  login = active;
  await mount();
  await press('Preparar segundo factor');
  expect(text()).toContain('otpauth://totp/Fixture');
  await fill('Código del segundo factor', '111111');
  await press('Verificar segundo factor');
  expect(text()).toContain('Tu cuenta');
  expect(text()).toContain('Revisa el autenticador');
  factorMode = 'valid';
  await fill('Código del segundo factor', '123456');
  await press('Verificar segundo factor');
  expect(text()).not.toContain('otpauth://totp/Fixture');
  await press('Comprobar permiso de operador');
  expect(text()).toContain('Permiso y segundo factor comprobados');
  await press('Cerrar esta sesión');
  expect(text()).not.toContain('Código del segundo factor');
});
it('MAR-M1-IT-FE-114-COMPONENT | solicitud idempotente, capacidad de sesión y factor nuevo se limpian al completar', async () => {
  active = { ...account('a'), operador: true };
  login = active;
  await mount();
  await press('Ayuda');
  await fill('Motivo de recuperación', 'Perdí mi autenticador');
  requestFail = true;
  await press('Solicitar recuperación');
  expect(text()).toContain('Intenta de nuevo');
  await press('Solicitar recuperación');
  const calls = requests.filter((item) => item.path === '/v1/auth/mfa-recoveries');
  expect(calls[0].headers['idempotency-key']).toBe(calls[1].headers['idempotency-key']);
  record = { id: 'recovery', state: 'reenrollment', version: 2 };
  await press('Consultar estado de recuperación');
  await press('Solicitar autorización temporal');
  await press('Preparar nuevo factor');
  expect(text()).toContain('otpauth://totp/NewFixture');
  await fill('Código del nuevo factor', '111111');
  await press('Completar recuperación');
  expect(text()).toContain('Revisa el nuevo autenticador');
  expect(text()).toContain('otpauth://totp/NewFixture');
  factorMode = 'valid';
  await fill('Código del nuevo factor', '123456');
  await press('Completar recuperación');
  expect(text()).toContain('Segundo factor recuperado. Inicia sesión nuevamente');
  expect(text()).not.toContain('otpauth://totp/NewFixture');
  expect(
    requests.find((item) => item.path.endsWith('/enrollments') && item.headers).headers[
      'x-recovery-capability'
    ],
  ).toBe('c'.repeat(43));
});
it('MAR-M1-IT-FE-114-REVIEW | revisión consulta referencia y manda versión/clave, sin conceder permisos desde cliente', async () => {
  active = { ...account('admin'), operador: true };
  login = active;
  await mount();
  await press('Ayuda');
  await fill('Referencia de solicitud a revisar', 'other');
  await press('Consultar solicitud a revisar');
  await press('Aprobar recuperación ajena');
  expect(text()).toContain('Solicitud aprobada. El sistema continúa');
  await fill('Referencia de solicitud a revisar', 'other');
  await press('Consultar solicitud a revisar');
  await fill('Motivo del rechazo', 'No se pudo verificar');
  await press('Rechazar recuperación ajena');
  expect(requests.find((item) => item.path.endsWith('/rejections')).body).toEqual({
    expected_version: 1,
    reason: 'No se pudo verificar',
  });
});
it('MAR-M1-IT-FE-109-START | acceso inicial y cancelación de consulta pendiente', async () => {
  active = null;
  login = account('a');
  await mount();
  await authenticate();
  expect(text()).toContain('Tu cuenta');
  await press('Actualizar cuenta');
  expect(requests.filter((item) => item.path === '/v1/notifications')).toHaveLength(2);
});

it('MAR-M1-IT-FE-107-RACE | lectura inicial tardía no sustituye el factor recién preparado', async () => {
  active = { ...account('a'), operador: true };
  let finish;
  const original = mock.api.getMockImplementation();
  mock.api.mockImplementation((path, ...args) =>
    path === '/v1/auth/mfa/factors'
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : original(path, ...args),
  );
  await mount();
  await press('Preparar segundo factor');
  await act(async () =>
    finish({ items: [{ id: 'stale', nombre: 'Anterior', estado: 'verified' }] }),
  );
  factorMode = 'valid';
  await fill('Código del segundo factor', '123456');
  await press('Verificar segundo factor');
  expect(requests.find((item) => item.path === '/v1/auth/mfa/verifications').body.factor_id).toBe(
    'factor',
  );
});
it('MAR-M1-IT-FE-114-RACE | lectura inicial tardía no borra una solicitud creada después', async () => {
  active = { ...account('a'), operador: true };
  let finish,
    first = true;
  const original = mock.api.getMockImplementation();
  mock.api.mockImplementation((path, ...args) => {
    if (path === '/v1/auth/mfa-recoveries/current' && first) {
      first = false;
      return new Promise((resolve) => {
        finish = resolve;
      });
    }
    return original(path, ...args);
  });
  await mount();
  await press('Ayuda');
  await press('Consultar estado de recuperación');
  await fill('Motivo de recuperación', 'Autenticador perdido');
  await press('Solicitar recuperación');
  await act(async () => finish({ recuperacion: null }));
  expect(text()).toContain('recovery');
  expect(text()).not.toContain('Motivo de recuperación');
});

it.each([
  ['/v1/auth/email-changes/current', 'Cuenta'],
  ['/v1/auth/mfa/factors', 'Cuenta'],
  ['/v1/auth/mfa-recoveries/current', 'Ayuda'],
])(
  'MAR-M1-IT-FE-109-READ | %s reconoce sesión vencida sin dejar datos privados',
  async (endpoint, destination) => {
    active = { ...account('a'), operador: true };
    const original = mock.api.getMockImplementation();
    mock.api.mockImplementation((path, ...args) =>
      path === endpoint
        ? Promise.reject(failure(401, 'SESION', 'Sesión vencida'))
        : original(path, ...args),
    );
    await mount();
    if (destination === 'Ayuda') await press('Ayuda');
    expect(text()).toContain('Accede a tu cuenta');
    expect(text()).not.toContain('Código del nuevo factor');
  },
);
it.each([
  ['/v1/auth/email-changes/current', 'Cuenta'],
  ['/v1/auth/mfa/factors', 'Cuenta'],
  ['/v1/auth/mfa-recoveries/current', 'Ayuda'],
])(
  'MAR-M1-IT-FE-110-READ | %s muestra error recuperable sin cerrar sesión',
  async (endpoint, destination) => {
    active = { ...account('a'), operador: true };
    const original = mock.api.getMockImplementation();
    mock.api.mockImplementation((path, ...args) =>
      path === endpoint
        ? Promise.reject(Error('Servicio temporalmente indisponible'))
        : original(path, ...args),
    );
    await mount();
    if (destination === 'Ayuda') await press('Ayuda');
    expect(text()).toContain('Servicio temporalmente indisponible');
    expect(text()).not.toContain('Accede a tu cuenta');
  },
);
it.each(['approved', 'executing', 'provider_pending'])(
  'MAR-M1-IT-FE-114-RESUME | estado %s retoma con clave estable',
  async (state) => {
    active = { ...account('a'), operador: true };
    record = { id: 'recovery', state, version: 2 };
    await mount();
    await press('Ayuda');
    await press('Continuar recuperación aprobada');
    expect(
      requests.find((item) => item.method === 'POST' && item.path === '/v1/auth/mfa-recoveries')
        .headers['idempotency-key'],
    ).toBeTypeOf('string');
    expect(text()).toContain('Proceso retomado');
  },
);
it.each(['enviando', 'verificando', 'conciliando', 'vencido', 'fallido', 'completo'])(
  'MAR-M1-IT-FE-106-STATE | cambio %s evita confirmaciones fuera de paso',
  async (state) => {
    change = {
      id: 'change',
      account_id: 'a',
      correo_actual: 'a@example.test',
      correo_nuevo: 'next@example.test',
      actual_confirmado: false,
      nuevo_confirmado: false,
      estado: state,
      vence_en: '2030-10-15T18:00:00Z',
    };
    await mount();
    expect(text()).not.toContain('Confirmar buzón');
    expect(text()).toContain(
      ['enviando', 'verificando', 'conciliando'].includes(state)
        ? 'Estamos comprobando el cambio'
        : 'Iniciar cambio',
    );
  },
);
it('MAR-M1-IT-FE-107-CHOICE | factores verificados múltiples requieren selección explícita', async () => {
  active = { ...account('a'), operador: true };
  const original = mock.api.getMockImplementation();
  mock.api.mockImplementation((path, ...args) =>
    path === '/v1/auth/mfa/factors'
      ? Promise.resolve({
          items: [
            { id: 'one', nombre: 'Primero', estado: 'verified' },
            { id: 'two', nombre: 'Segundo', estado: 'verified' },
          ],
        })
      : original(path, ...args),
  );
  await mount();
  await press('Usar Segundo');
  factorMode = 'valid';
  await fill('Código del segundo factor', '123456');
  await press('Verificar segundo factor');
  expect(requests.find((item) => item.path === '/v1/auth/mfa/verifications').body.factor_id).toBe(
    'two',
  );
});
it('MAR-M1-IT-FE-110-START | error de lectura inicial permite autenticación posterior', async () => {
  const original = mock.api.getMockImplementation();
  mock.api.mockImplementation((path, ...args) =>
    path === '/v1/me' ? Promise.reject(Error('No pudimos conectar')) : original(path, ...args),
  );
  await mount();
  expect(text()).toContain('No pudimos conectar');
  login = account('a');
  await authenticate();
  expect(text()).not.toContain('No pudimos conectar');
});
it('MAR-M1-IT-FE-110-CONTROLS | controles bloqueados comunican estado y conservan superficie táctil al presionar', async () => {
  await mount();
  const buttons = tree.root.findAllByType('Pressable');
  for (const button of buttons.filter((node) => typeof node.props.style === 'function')) {
    const pressed = button.props.style({ pressed: true }).filter(Boolean);
    expect(pressed.some((style) => style.minHeight >= 48)).toBe(true);
    expect(pressed).toContainEqual({ opacity: 0.8 });
    expect(button.props.style({ pressed: false }).filter(Boolean)).not.toContainEqual({
      opacity: 0.8,
    });
    expect(button.props.accessibilityState.disabled).toBe(Boolean(button.props.disabled));
  }
});

it('MAR-M1-IT-FE-107-PERMISSION-RACE | consultar permiso conserva la lectura pendiente del factor', async () => {
  active = { ...account('a'), operador: true };
  let finish;
  const original = mock.api.getMockImplementation();
  mock.api.mockImplementation((path, ...args) => {
    if (path === '/v1/auth/mfa/factors')
      return new Promise((resolve) => {
        finish = resolve;
      });
    if (path === '/v1/operator/access')
      return Promise.reject(failure(403, 'MFA', 'Verifica segundo factor'));
    return original(path, ...args);
  });
  await mount();
  await press('Comprobar permiso de operador');
  await act(async () =>
    finish({ items: [{ id: 'restored-factor', nombre: 'Restaurado', estado: 'verified' }] }),
  );
  factorMode = 'valid';
  await fill('Código del segundo factor', '123456');
  await press('Verificar segundo factor');
  expect(mock.api.mock.calls.filter(([path]) => path === '/v1/auth/mfa/factors')).toHaveLength(1);
  expect(requests.find((item) => item.path === '/v1/auth/mfa/verifications')?.body.factor_id).toBe(
    'restored-factor',
  );
});

it('MAR-M1-IT-FE-103-KEYS | cuenta y actualización conservan identidades distintas de paneles', async () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    await mount();
    await press('Actualizar cuenta');
    expect(errors.mock.calls.some((call) => String(call[0]).includes('same key'))).toBe(false);
  } finally {
    errors.mockRestore();
  }
});

it('MAR-M1-UT-FE-NAV-ARIA | selección accesible única coincide con el contenido al navegar', async () => {
  await mount();
  for (const [label, heading] of [
    ['Avisos', 'Avisos privados de tu cuenta.'],
    ['Ayuda', 'Ayuda con tu acceso'],
    ['Cuenta', 'Tu cuenta'],
  ]) {
    await press(label);
    const tabs = tree.root
      .findAllByType('Pressable')
      .filter((node) => node.props.accessibilityRole === 'tab');
    const selected = tabs.filter((node) => node.props['aria-selected'] === true);
    expect(selected.map((node) => node.props.accessibilityLabel)).toEqual([label]);
    expect(text()).toContain(heading);
  }
});
