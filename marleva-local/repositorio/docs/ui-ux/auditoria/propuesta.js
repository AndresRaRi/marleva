'use strict';
const view = document.querySelector('#view');
const scenario = document.querySelector('#scenario');
const state = {
  page: 'explorar',
  selected: 'pan',
  q: '',
  category: 'Todo',
  area: '',
  mode: '',
  email: 'vecino@example.test',
  otp: '',
  step: 'email',
  signed: false,
  error: '',
  retry: false,
  more: false,
  busy: false,
  wait: 0,
  returnTo: null,
  resultScroll: 0,
  codeExpired: false,
};
let timer;
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const button = (label, action, kind = 'primary') =>
  `<button class="${kind}" data-action="${action}">${label}</button>`;
function art(kind) {
  const shapes =
    kind === 'guitarra'
      ? '<path d="M207 30l-25 95" stroke="#724a32" stroke-width="15"/><path d="M162 112c-52-22-80 33-46 63-18 48 45 78 70 36 51-8 34-75-8-70z" fill="#ae633e"/><circle cx="160" cy="170" r="17" fill="#573c2d"/><path d="M203 33l-45 167" stroke="#f8d6a3" stroke-width="3"/>'
      : kind === 'galletas'
        ? '<g fill="#c8904c" stroke="#ab733b" stroke-width="3"><circle cx="133" cy="135" r="47"/><circle cx="218" cy="133" r="47"/><circle cx="175" cy="185" r="47"/></g><g fill="#644631"><circle cx="118" cy="120" r="5"/><circle cx="147" cy="143" r="6"/><circle cx="209" cy="119" r="5"/><circle cx="231" cy="147" r="6"/><circle cx="165" cy="177" r="6"/><circle cx="187" cy="199" r="5"/></g>'
        : '<ellipse cx="180" cy="153" rx="95" ry="65" fill="#c18443"/><path d="M91 151c17-38 45-60 89-63 43 0 78 24 94 58-53 24-132 32-183 5z" fill="#d9a15f"/><g fill="none" stroke="#f9dfb2" stroke-width="8" stroke-linecap="round"><path d="M143 115l-20 38"/><path d="M183 108l-23 50"/><path d="M223 117l-22 39"/></g>';
  return `<svg viewBox="0 0 360 260" role="img" aria-label="Ilustración de ${kind === 'pan' ? 'pan' : kind === 'guitarra' ? 'guitarra' : 'galletas'} ficticio"><rect width="360" height="260" fill="${kind === 'guitarra' ? '#d7dfd3' : '#ead9bc'}"/><path d="M0 210C100 180 250 245 360 192V260H0" fill="#d4be9a"/><ellipse cx="180" cy="178" rx="135" ry="56" fill="#f6f0df"/><ellipse cx="180" cy="180" rx="115" ry="43" fill="none" stroke="#dfd6c0" stroke-width="2"/>${shapes}<path d="M304 78c-40-10-24-45-8-53 0 25 19 36 8 53" fill="#718363"/><path d="M302 79l-16 42" stroke="#718363" stroke-width="3"/></svg>`;
}
function go(page) {
  state.page = page;
  state.error = '';
  render();
  window.scrollTo(0, 0);
  view.focus();
}
function render() {
  const screens = { explorar: explore, detalle: detail, cuenta: account, ayuda: help };
  view.innerHTML = screens[state.page]();
  document
    .querySelectorAll('[data-nav]')
    .forEach((item) =>
      item.setAttribute(
        'aria-current',
        item.dataset.nav === (state.page === 'detalle' ? 'explorar' : state.page)
          ? 'page'
          : 'false',
      ),
    );
  bind();
}
function card(item) {
  return `<article class="card"><div class="visual">${art(item.art)}<span class="pill">${item.stock ? 'Oferta de ejemplo' : 'Agotado por ahora'}</span></div><div class="card-body"><span class="seller">${escape(item.seller)}</span><h2>${item.title}</h2><div class="price">${item.price} <small>${item.type === 'product' ? 'MXN / ' + item.unit : ''}</small></div><p class="metadata">${item.mode} · ${item.area}</p>${button('Ver ' + item.title, 'open:' + item.id, 'secondary')}</div></article>`;
}
function status(title, text, action = 'retry', label = 'Volver a intentar') {
  return `<section class="empty"><div class="symbol" aria-hidden="true">◇</div><h2>${title}</h2><p class="muted">${text}</p>${button(label, action)}</section>`;
}
function explore() {
  let items = UX_FIXTURES.filter(
    (x) =>
      (state.category === 'Todo' || x.category === state.category) &&
      (!state.area || x.area === state.area) &&
      (!state.mode || x.mode === state.mode) &&
      normalize(x.title + ' ' + x.category).includes(normalize(state.q)),
  );
  const selected = [state.area, state.mode].filter(Boolean).join(' · ');
  const head = `<span class="place">GRAN SANTA FE · MÉRIDA</span><h1>Lo que necesitas,<br>entre vecinos.</h1><p class="hero-copy">Productos y servicios de tu comunidad. Explora sin crear una cuenta.</p><form class="search" id="search"><label for="query" class="sr">Buscar productos o servicios</label><input id="query" name="q" value="${escape(state.q)}" placeholder="Pan, clases, reparaciones…" maxlength="120"><button aria-label="Buscar">⌕</button></form><div class="chips" aria-label="Categorías">${['Todo', 'Comida y postres', 'Artículos cotidianos', 'Clases', 'Reparaciones', 'Cuidado personal'].map((x) => `<button data-category="${x}" aria-pressed="${state.category === x}">${x}</button>`).join('')}</div><div class="topline"><strong>Ofertas de ejemplo</strong>${button('Filtros' + (selected ? ' · activos' : ''), 'filters', 'filterButton')}</div>${selected ? `<p class="metadata">${escape(selected)} · ${button('Limpiar', 'clear', 'linkButton')}</p>` : ''}`;
  if (scenario.value === 'loading' && !state.retry)
    return (
      head +
      '<p role="status">Buscando ofertas…</p><div class="skeleton" aria-hidden="true"></div>' +
      button('Terminar carga simulada', 'retry', 'secondary')
    );
  if (scenario.value === 'error' && !state.retry)
    return (
      head + status('No pudimos cargar las ofertas', 'Tu búsqueda sigue aquí. Intenta otra vez.')
    );
  if (scenario.value === 'empty' && !state.retry)
    return (
      head +
      status(
        'Pronto habrá más por aquí',
        'Todavía no hay ofertas en esta demostración.',
        'retry',
        'Ver ejemplos',
      )
    );
  if (!items.length)
    return (
      head +
      status(
        'No encontramos coincidencias',
        'Prueba otra palabra o quita un filtro.',
        'clear',
        'Limpiar búsqueda y filtros',
      )
    );
  if (!state.more) items = items.slice(0, 2);
  return (
    head +
    items.map(card).join('') +
    (state.error ? `<div class="notice error" role="alert">${state.error}</div>` : '') +
    (!state.more
      ? button(state.error ? 'Reintentar cargar más' : 'Ver más ofertas', 'more', 'secondary')
      : '<p class="small">Llegaste al final de los ejemplos.</p>') +
    '<p class="small">Cobertura y residencia son distintas. Los domicilios particulares no son públicos.</p>'
  );
}
function detail() {
  const item = UX_FIXTURES.find((x) => x.id === state.selected);
  const back = button('← Volver a resultados', 'back', 'back');
  if (scenario.value === 'removed' && !state.retry)
    return (
      back +
      status(
        'Esta oferta ya no está disponible',
        'Puede haberse retirado o pausado. Vuelve a tus resultados.',
        'back',
        'Volver a resultados',
      )
    );
  return (
    back +
    `<div class="visual">${art(item.art)}<span class="pill">${item.category} · ejemplo</span></div><p class="seller spacer">${item.seller}</p><h1>${item.title}</h1><div class="price">${item.price} <small>${item.type === 'product' ? 'MXN / ' + item.unit : ''}</small></div><p class="muted">${item.description}</p><div class="facts"><div><strong>${item.mode}</strong><span>${item.area}</span></div><div><strong>${item.time}</strong><span>${item.type === 'product' ? 'Disponibilidad sujeta a confirmación. No se reserva al explorar.' : 'No hay un precio contratado todavía.'}</span></div></div>${item.ingredients ? `<details class="helpDetails"><summary>Ingredientes, alérgenos y conservación</summary><p>${item.ingredients}</p><p>${item.allergens}</p><p>${item.storage}</p></details>` : ''}<div class="notice ${item.stock ? '' : 'warn'}"><strong>${item.stock ? '¿Te interesa?' : 'Agotado por ahora'}</strong><p>${item.stock ? 'Para comprar u ofrecer se necesita una cuenta y pertenencia vecinal aprobada. El correo solo permite acceder.' : 'Puedes revisar la información. No puedes pedir este producto en esta simulación.'}</p></div>${state.signed ? '<div class="success" role="status"><strong>Accediste en la simulación</strong><p>Volviste a la misma oferta. La pertenencia sigue sin revisar; no hay compra ni cotización habilitada.</p></div>' : ''}<div class="dock">${button(state.signed ? 'Ver mi cuenta de ejemplo' : 'Ver cómo acceder', 'access')}<p class="small">Solo revisión de diseño. No se envía un pedido.</p></div>`
  );
}
function account() {
  if (state.signed)
    return (
      '<span class="place">TU CUENTA · EJEMPLO</span><h1>Ya estás aquí.</h1><p>' +
      escape(state.email) +
      '</p><div class="notice"><strong>Correo verificado · simulación</strong><p>Tu pertenencia vecinal aún no está revisada. Acceder no habilita compras ni ofertas.</p></div>' +
      button('Volver a la oferta consultada', 'return') +
      button('Salir de la simulación', 'logout', 'secondary')
    );
  return auth();
}
function auth() {
  const isCode = state.step === 'code';
  const expired = scenario.value === 'expired-session';
  return (
    button(state.returnTo ? '← Volver a la oferta' : '← Seguir explorando', 'back', 'back') +
    `<div class="step"><i></i>${isCode ? '<i></i>' : ''}<span>Paso ${isCode ? '2' : '1'} de 2</span></div><h1>${isCode ? 'Revisa tu correo.' : 'Entra a tu comunidad.'}</h1><p class="muted">${isCode ? 'Si el correo es válido, recibirás un código. Escríbelo aquí para continuar.' : 'Accede con un código por correo. Sin contraseña.'}</p>${expired ? '<div class="notice warn" role="status">Tu sesión terminó. Accede para volver a la oferta consultada. No se repetirá ninguna operación.</div>' : ''}${state.returnTo ? `<div class="receipt"><span class="small">Al terminar, vuelves a</span><br><strong>${UX_FIXTURES.find((x) => x.id === state.returnTo).title}</strong></div>` : ''}<form id="auth" novalidate><label for="credential">${isCode ? 'Código de seis cifras' : 'Tu correo'}</label><input id="credential" class="${isCode ? 'otp' : ''}" name="credential" type="${isCode ? 'text' : 'email'}" inputmode="${isCode ? 'numeric' : 'email'}" autocomplete="${isCode ? 'one-time-code' : 'email'}" value="${escape(isCode ? state.otp : state.email)}" maxlength="${isCode ? '6' : '254'}" aria-invalid="${!!state.error}" ${state.error ? 'aria-describedby="field-error"' : ''} ${state.busy ? 'disabled' : ''}>${state.error ? `<p id="field-error" class="errorText" role="alert">${escape(state.error)}</p>` : ''}<div class="spacer"></div><button class="primary" ${state.busy ? 'disabled' : ''}>${state.busy ? 'Comprobando…' : isCode ? 'Verificar y volver' : 'Recibir código'}</button></form>${isCode ? `<p class="small">Correo: ${escape(state.email)}</p>${button('Cambiar correo', 'edit-email', 'linkButton')}<button id="resend" class="secondary" data-action="resend" ${state.wait ? 'disabled' : ''}>${state.wait ? 'Reenviar en ' + state.wait + ' s' : 'Enviar otro código'}</button>` : ''}<p class="small">Demo: usa un correo @example.test${isCode ? ' y el código ficticio 123456' : ''}. No enviamos correo.</p><details class="helpDetails"><summary>${isCode ? '¿No llegó el código?' : '¿Qué necesitas para comprar u ofrecer?'}</summary><p>${isCode ? 'Revisa la dirección escrita. Puedes corregirla o pedir otro código cuando termine la espera.' : 'Ser residente actual y completar la revisión vecinal. Esta propuesta no implementa esa revisión.'}</p></details>`
  );
}
function help() {
  return (
    '<span class="place">AYUDA</span><h1>Un paso a la vez.</h1><details open class="helpDetails"><summary>¿Puedo explorar sin cuenta?</summary><p>Sí. La cuenta y la revisión vecinal se requieren para comprar u ofrecer.</p></details><details class="helpDetails"><summary>Perdí acceso a mi correo</summary><p>Recupera el buzón con tu proveedor. Un comprobante de residencia no permite transferir tu cuenta.</p></details><div class="notice"><strong>Es una propuesta de diseño</strong><p>Todos los datos y la verificación son ficticios. La demo no comprueba residencia ni crea pedidos.</p></div>' +
    button('Explorar ejemplos', 'back')
  );
}
const normalize = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
function bind() {
  view
    .querySelectorAll('[data-action]')
    .forEach((x) => x.addEventListener('click', () => action(x.dataset.action)));
  view.querySelectorAll('[data-category]').forEach((x) =>
    x.addEventListener('click', () => {
      state.category = x.dataset.category;
      state.retry = false;
      render();
    }),
  );
  view.querySelector('#search')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.q = new FormData(event.target).get('q').trim();
    render();
    document.querySelector('#query').focus();
  });
  view.querySelector('#auth')?.addEventListener('submit', submitAuth);
  view.querySelector('#credential')?.addEventListener('input', (event) => {
    state[state.step === 'code' ? 'otp' : 'email'] = event.target.value;
  });
}
function action(key) {
  if (key.startsWith('open:')) {
    state.resultScroll = window.scrollY;
    state.selected = key.slice(5);
    state.retry = false;
    go('detalle');
    return;
  }
  const handlers = {
    back: () => {
      if (state.page === 'cuenta' && state.returnTo) {
        state.selected = state.returnTo;
        go('detalle');
      } else {
        go('explorar');
        window.scrollTo(0, state.resultScroll);
      }
    },
    retry: () => {
      state.retry = true;
      state.error = '';
      render();
    },
    clear: () => {
      state.q = '';
      state.category = 'Todo';
      state.area = '';
      state.mode = '';
      state.retry = false;
      render();
    },
    filters: filters,
    more: more,
    access: () => {
      state.returnTo = state.selected;
      go('cuenta');
    },
    return: () => {
      state.selected = state.returnTo || state.selected;
      go('detalle');
    },
    logout: () => {
      state.signed = false;
      state.otp = '';
      state.step = 'email';
      state.returnTo = null;
      clearInterval(timer);
      state.wait = 0;
      go('explorar');
    },
    'edit-email': () => {
      state.step = 'email';
      state.otp = '';
      go('cuenta');
    },
    resend: () => {
      state.codeExpired = false;
      state.otp = '';
      state.error = '';
      startWait();
      render();
      document.querySelector('#announce').textContent =
        'Nuevo código ficticio solicitado. El código de esta demo sigue siendo 123456.';
    },
  };
  handlers[key]?.();
}
function more() {
  if (scenario.value === 'more-error' && !state.retry) {
    state.error = 'No pudimos cargar más. Tus ofertas y filtros se conservan.';
    state.retry = true;
  } else {
    state.more = true;
    state.error = '';
  }
  render();
}
function startWait() {
  clearInterval(timer);
  state.wait = 60;
  timer = setInterval(() => {
    state.wait = Math.max(0, state.wait - 1);
    const target = document.querySelector('#resend');
    if (target) {
      target.disabled = state.wait > 0;
      target.textContent = state.wait ? 'Reenviar en ' + state.wait + ' s' : 'Enviar otro código';
    }
    if (!state.wait) clearInterval(timer);
  }, 1000);
}
function submitAuth(event) {
  event.preventDefault();
  if (state.busy) return;
  const value = new FormData(event.target).get('credential').trim();
  if (state.step === 'email') return sendCode(value);
  state.otp = value;
  if (state.codeExpired) {
    state.error = 'Este código venció. Pide otro cuando termine la espera.';
    render();
    return;
  }
  if (value !== '123456') {
    state.error = 'El código no es válido. Revisa las seis cifras y vuelve a intentar.';
    render();
    document.querySelector('#credential').focus();
    return;
  }
  state.error = '';
  state.busy = true;
  render();
  setTimeout(() => {
    state.busy = false;
    state.signed = true;
    state.otp = '';
    state.error = '';
    if (state.returnTo) {
      state.selected = state.returnTo;
      go('detalle');
    } else go('cuenta');
  }, 450);
}
function sendCode(value) {
  state.email = value;
  if (!/^[^\s@]+@example\.test$/.test(value)) {
    state.error = 'Para esta demo usa un correo ficticio, como vecino@example.test.';
    render();
    document.querySelector('#credential').focus();
    return;
  }
  state.step = 'code';
  state.otp = '';
  state.error = '';
  startWait();
  render();
  view.focus();
}
function filters() {
  const dialog = document.createElement('dialog');
  const areas = [
    'Gran Santa Fe I',
    'Gran Santa Fe II',
    'Gran Santa Fe Norte I',
    'Gran Santa Fe Norte II',
    'Gran Santa Fe Norte III',
    'Cerradas de Gran Santa Fe',
    'Paraíso Santa Fe',
  ];
  const options = (items, current) =>
    items.map((x) => `<option ${current === x ? 'selected' : ''}>${x}</option>`).join('');
  dialog.innerHTML = `<form method="dialog" id="filters"><h2>Encuentra lo que te sirve</h2><label for="area">Desarrollo atendido</label><select id="area" name="area"><option value="">Todos los desarrollos</option>${options(areas, state.area)}</select><label for="mode">Modalidad</label><select id="mode" name="mode"><option value="">Todas las modalidades</option>${options(['Recogida', 'Entrega del oferente', 'A domicilio', 'En establecimiento'], state.mode)}</select><p class="small">La cobertura no demuestra residencia. No pedimos tu domicilio.</p><div class="row"><button value="cancel">Cancelar</button><button class="primary" value="apply">Ver ofertas</button></div></form>`;
  document.body.append(dialog);
  dialog.addEventListener('close', () => {
    if (dialog.returnValue === 'apply') {
      const data = new FormData(dialog.querySelector('form'));
      state.area = data.get('area');
      state.mode = data.get('mode');
      render();
    }
    dialog.remove();
    view.querySelector('[data-action="filters"]')?.focus();
  });
  dialog.showModal();
}
scenario.addEventListener('change', () => {
  state.retry = false;
  state.error = '';
  state.more = false;
  state.codeExpired = scenario.value === 'expired-code';
  if (scenario.value.includes('code') || scenario.value.includes('session')) {
    state.signed = false;
    state.returnTo = state.selected;
    state.step = scenario.value === 'expired-code' ? 'code' : 'email';
    go('cuenta');
  } else go(scenario.value === 'removed' ? 'detalle' : 'explorar');
});
document
  .querySelectorAll('[data-nav]')
  .forEach((x) => x.addEventListener('click', () => go(x.dataset.nav)));
document.querySelector('.brand').addEventListener('click', (event) => {
  event.preventDefault();
  go('explorar');
});
render();

document.querySelector('.reviewToggle').addEventListener('click', (event) => {
  const expanded = document.querySelector('.review').classList.toggle('open');
  event.target.setAttribute('aria-expanded', String(expanded));
});
