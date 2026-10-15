import { it, expect, vi } from 'vitest';
vi.mock('../../../../apps/client/node_modules/react-native', () => ({ Text: 'Text' }));
import { StatusMessages } from '../../../../apps/client/src/status-messages';
it.each([true, false])(
  'Mensajes conservan contenido, estilos y anuncio accesible; ocupado=%s',
  (busy) => {
    const styles = { error: { color: '#9b1c1c' }, message: { color: '#17473b' } };
    const rendered = StatusMessages({
      busy,
      error: 'Error de prueba',
      message: 'Continúa',
      styles,
    });
    const children = rendered.props.children;
    expect(Boolean(children[0])).toBe(busy);
    expect(children[1].props.children).toBe('Error de prueba');
    expect(children[1].props.accessibilityRole).toBe('alert');
    expect(children[1].props.style).toBe(styles.error);
    expect(children[2].props.children).toBe('Continúa');
    expect(children[2].props.accessibilityLiveRegion).toBe('polite');
  },
);
it('No presenta avisos vacíos', () => {
  const rendered = StatusMessages({
    busy: false,
    error: '',
    message: '',
    styles: { error: {}, message: {} },
  });
  expect(rendered.props.children).toEqual([false, false, false]);
});
