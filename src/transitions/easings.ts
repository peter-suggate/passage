export function easeInSine(x: number): number {
  return 1 - Math.cos((x * Math.PI) / 2);
}

export function easeOutSine(x: number): number {
  return Math.sin((x * Math.PI) / 2);
}

export function easeInQuart(x: number): number {
  return x * x * x * x;
}

export function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
}
