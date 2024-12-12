/**
 * Конвертирует Float32Array в Int16Array
 * @param {Float32Array} input - Входные данные в формате Float32Array
 * @returns {Int16Array} - Конвертированные данные в формате Int16Array
 */
export function floatTo16BitPCM(input: Float32Array) {
  const output = new Int16Array(input.length);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}
