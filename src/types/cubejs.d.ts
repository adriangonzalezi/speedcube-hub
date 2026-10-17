declare module 'cubejs' {
  class Cube {
    static initSolver(): void;
    static random(): Cube;
    static inverse(alg: string): string;
    solve(maxDepth?: number): string;
    move(alg: string): Cube;
    asString(): string;
  }
  export default Cube;
}
