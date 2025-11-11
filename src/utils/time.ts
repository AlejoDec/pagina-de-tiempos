export function pad(n: number, digits = 2) {
  return n.toString().padStart(digits, '0')
}

// format milliseconds to mm:ss:ms (ms 3 digits)
export function formatMsToDisplay(ms: number) {
  if (typeof ms !== 'number' || isNaN(ms)) return ''
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const millis = ms % 1000
  return `${pad(minutes, 2)}:${pad(seconds, 2)}:${pad(millis, 3)}`
}

// parse strings like "MM:SS:MS", "MM:SS.MS", "M:SS", "SS.ms", "SS"
// returns milliseconds or null if invalid
export function parseTimeStringToMs(input: string): number | null {
  if (!input || typeof input !== 'string') return null
  const s = input.trim()
  if (s.length === 0) return null

  // normalize separators
  const normalized = s.replace(',', '.').replace(/\s+/g, '')

  // If contains ':' separators
  const parts = normalized.split(':')
  try {
    if (parts.length === 3) {
      const mm = parseInt(parts[0], 10)
      const ss = parseInt(parts[1], 10)
      let msPart = parts[2]
      // msPart may contain dot but unlikely; remove non-digits
      msPart = msPart.replace(/[^0-9]/g, '')
      let ms = parseInt(msPart || '0', 10)
      // normalize to milliseconds depending on length
      if (msPart.length === 1) ms *= 100
      else if (msPart.length === 2) ms *= 10
      // if 3 digits, as is
      return (mm * 60 + ss) * 1000 + ms
    }

    // If two parts, could be M:SS or SS.ms
    if (parts.length === 2) {
      const left = parts[0]
      const right = parts[1]
      if (right.includes('.')) {
        // treat as minutes:seconds.millis or seconds.millis? assume minutes:seconds.millis
        const ssParts = right.split('.')
        const mm = parseInt(left, 10)
        const ss = parseInt(ssParts[0] || '0', 10)
        let ms = parseInt(ssParts[1] || '0', 10)
        if (ssParts[1].length === 1) ms *= 100
        else if (ssParts[1].length === 2) ms *= 10
        return (mm * 60 + ss) * 1000 + ms
      }
      // otherwise treat as M:SS
      const mm = parseInt(left, 10)
      const ss = parseInt(right, 10)
      if (isNaN(mm) || isNaN(ss)) return null
      return (mm * 60 + ss) * 1000
    }

    // If no colon, maybe seconds or seconds.millis
    if (parts.length === 1) {
      if (normalized.includes('.')) {
        const [sPart, msPart] = normalized.split('.')
        const seconds = parseInt(sPart || '0', 10)
        let ms = parseInt((msPart || '0').replace(/[^0-9]/g, ''), 10)
        if ((msPart || '').length === 1) ms *= 100
        else if ((msPart || '').length === 2) ms *= 10
        return seconds * 1000 + ms
      }
      const seconds = parseInt(normalized, 10)
      if (isNaN(seconds)) return null
      return seconds * 1000
    }
  } catch {
    return null
  }

  return null
}
