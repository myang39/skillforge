import dns from 'node:dns/promises'
import net from 'node:net'

const BLOCKED_HOSTS = new Set(['localhost', 'localhost.localdomain'])

export async function assertSafePublicUrl(value) {
  let url
  try { url = new URL(value) } catch { throw new Error('Enter a valid job-post URL.') }
  if (!['https:', 'http:'].includes(url.protocol) || BLOCKED_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error('Use a public http(s) job-post URL.')
  }

  const addresses = net.isIP(url.hostname) ? [{ address: url.hostname }] : await dns.lookup(url.hostname, { all: true })
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('This URL does not resolve to a public address.')
  }
  return url
}

export async function importJobDescription(value) {
  const url = await assertSafePublicUrl(value)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: 'error', headers: { 'User-Agent': 'SkillForge-job-importer/0.1' } })
    if (!response.ok) throw new Error(`The job site returned ${response.status}.`)
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) throw new Error('This URL did not return a readable job description.')
    const html = await response.text()
    if (html.length > 1_500_000) throw new Error('This job page is too large to import.')
    const text = toPlainText(html)
    if (text.length < 80) throw new Error('We could not find enough job-description text at this URL.')
    return { sourceUrl: url.href, text: text.slice(0, 30_000) }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('Job-post import timed out. Paste the description instead.', { cause: error })
    throw error
  } finally { clearTimeout(timeout) }
}

export function toPlainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ').trim()
}

function isPrivateAddress(address) {
  if (net.isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number)
    return a === 0 || a === 10 || a === 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168
  }
  const normalized = address.toLowerCase()
  return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:')
}
