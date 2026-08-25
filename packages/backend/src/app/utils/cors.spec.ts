import { buildCorsOptions, DEFAULT_ALLOWED_ORIGINS } from './cors';

describe('buildCorsOptions', () => {
  it('should allow the default origins when ORIGIN is unset', () => {
    const options = buildCorsOptions({});
    expect(options.origin).toEqual(DEFAULT_ALLOWED_ORIGINS);
  });

  it('should keep default origins when ORIGIN is set to a single origin', () => {
    const options = buildCorsOptions({ ORIGIN: 'https://musira.fr' });
    expect(options.origin).toContain('https://musira.fr');
    expect(options.origin).toContain('https://www.musira.fr');
  });

  it('should merge comma-separated ORIGIN values with defaults', () => {
    const options = buildCorsOptions({
      ORIGIN: 'https://staging.musira.fr, https://dev.musira.fr',
    });
    expect(options.origin).toEqual(
      expect.arrayContaining([
        'https://musira.fr',
        'https://www.musira.fr',
        'https://staging.musira.fr',
        'https://dev.musira.fr',
      ]),
    );
  });

  it('should deduplicate origins', () => {
    const options = buildCorsOptions({ ORIGIN: 'https://musira.fr' });
    expect(
      options.origin.filter((o) => o === 'https://musira.fr'),
    ).toHaveLength(1);
  });

  it('should allow all methods used by the API, not just GET/HEAD/POST', () => {
    const options = buildCorsOptions({});
    expect(options.methods).toEqual(
      expect.arrayContaining(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    );
  });

  it('should always send credentials', () => {
    expect(buildCorsOptions({}).credentials).toBe(true);
  });
});
