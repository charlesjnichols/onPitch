export const uid = (): string => {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.crypto && 'randomUUID' in globalThis.crypto) {
      // @ts-ignore
      return globalThis.crypto.randomUUID()
    }
  } catch {}
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 9)
  return `${ts}_${rand}`
}