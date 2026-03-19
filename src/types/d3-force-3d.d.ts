declare module "d3-force-3d" {
  export function forceY(y?: number | ((node: unknown, i: number, nodes: unknown[]) => number)): ForceY;

  interface ForceY {
    strength(value?: number | ((node: unknown, i: number, nodes: unknown[]) => number)): ForceY | number;
    y(value?: number | ((node: unknown, i: number, nodes: unknown[]) => number)): ForceY | number;
  }
}
