export const divmod = (x, y) => [Math.trunc(x / y), x % y];

export const outOfRange = (n, min, max) => isNaN(n) || n < min || n > max;

export const assert = (name, actual, expected = true, equals = (x, y) => x == y) => {
    let result = equals(actual, expected);
    (result ? console.log : console.error)('assert', name, ':', result, '\n\tactual', actual, '\n\texpected', expected);
};