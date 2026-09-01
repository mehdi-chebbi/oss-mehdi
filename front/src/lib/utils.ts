import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createClientId() {
  const browserCrypto = globalThis.crypto

  if (typeof browserCrypto?.randomUUID === 'function') {
    return browserCrypto.randomUUID()
  }

  if (typeof browserCrypto?.getRandomValues === 'function') {
    const bytes = browserCrypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))

    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`
  }

  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const frenchConnectorPattern =
  /(^|[\s([{«])(à|a|au|aux|de|du|des|le|la|les|un|une|et|en|se|sur|pour|dans|par)[ \t]+(?=\S)/giu

export function formatFrenchTypography(value: string) {
  let formatted = value

  for (let pass = 0; pass < 2; pass += 1) {
    formatted = formatted.replace(
      frenchConnectorPattern,
      (_match, prefix: string, connector: string) => `${prefix}${connector}\u00a0`,
    )
  }

  return formatted
}
