import { resolveAppTextClassName } from './AppText';

describe('resolveAppTextClassName', () => {
  it('aplica Archivo regular quando não há className', () => {
    expect(resolveAppTextClassName(undefined)).toBe('font-archivo');
  });

  it('aplica Archivo regular quando o className não tem família de fonte', () => {
    expect(resolveAppTextClassName('text-sm text-ink-secondary')).toBe(
      'font-archivo text-sm text-ink-secondary'
    );
  });

  it.each([
    'font-archivo-medium',
    'font-archivo-semibold',
    'font-archivo-bold',
    'font-display',
    'font-archivo',
  ])('respeita a família já presente (%s), sem duplicar', (fontClass) => {
    const className = `text-2xl ${fontClass} text-ink`;
    expect(resolveAppTextClassName(className)).toBe(className);
  });

  it('não confunde font-archivo-semibold com uma correspondência parcial', () => {
    // regressão: a regex não pode casar por acidente com algo como
    // "font-archivos" ou variantes que não existem no design system.
    expect(resolveAppTextClassName('font-archivos')).toBe('font-archivo font-archivos');
  });
});
