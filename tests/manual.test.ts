import { describe, expect, it } from 'vitest';
import { parseTimeInput } from '@/lib/timer/stats';

describe('tiempos escritos a mano', () => {
  it('entiende los formatos habituales', () => {
    expect(parseTimeInput('21.43')).toEqual({ t: 21430, p: null });
    expect(parseTimeInput('21,43')).toEqual({ t: 21430, p: null });
    expect(parseTimeInput('1:02.34')).toEqual({ t: 62340, p: null });
    expect(parseTimeInput('2143')).toEqual({ t: 21430, p: null });
    expect(parseTimeInput('12345')).toEqual({ t: 83450, p: null });
    expect(parseTimeInput('543')).toEqual({ t: 5430, p: null });
    expect(parseTimeInput('21')).toEqual({ t: 21000, p: null });
    expect(parseTimeInput('21.4')).toEqual({ t: 21400, p: null });
  });
  it('penalizaciones', () => {
    expect(parseTimeInput('21.43+')).toEqual({ t: 21430, p: '+2' });
    expect(parseTimeInput('21.43 +2')).toEqual({ t: 21430, p: '+2' });
    expect(parseTimeInput('DNF')).toEqual({ t: 0, p: 'DNF' });
    expect(parseTimeInput('dnf(21.43)')).toEqual({ t: 21430, p: 'DNF' });
  });
  it('rechaza lo que no es un tiempo', () => {
    for (const bad of ['', 'abc', '1:75.00', '0', '12.3.4']) expect(parseTimeInput(bad), bad).toBeNull();
  });
});
