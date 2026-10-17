export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = <T,>(arr: readonly T[]): T[] => arr.map(v => [Math.random(), v] as const).sort((a, b) => a[0] - b[0]).map(x => x[1]);
export const randomAuf = () => pick(['', 'U', 'U2', "U'"] as const);
