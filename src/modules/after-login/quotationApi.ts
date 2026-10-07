// Connects the Procure.AI frontend to the Quotation Ranking backend.
// - run.bat (one server): VITE_API_URL empty -> calls the same address the page was loaded from.
// - npm run dev: .env.local -> VITE_API_URL=https://procure-ai-api-9z0x.onrender.com
// - Vercel: Settings -> Environment Variables -> VITE_API_URL = Render backend URL.
const DEFAULT_API_URL = 'https://procure-ai-api-9z0x.onrender.com'
const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? DEFAULT_API_URL).replace(/\/+$/, '')
const RESULT_KEY = 'procureai-comparison'

export const MAX_FILES = 3
export const MAX_FILE_MB = 10

export type SupplierRow = {
  position: number
  position_display: string
  supplier_name: string
  recommended: boolean
  ai_score: number
  total_cost: number
  total_cost_display: string
  delivery_days: number | null
  delivery_display: string
  rank: string
  rank_change_reason?: string
  details: {
    name_as_printed: string
    quotation_number: string | null
    quotation_date: string | null
    source_file: string
    delivery_term: string | null
    price_score: number
    delivery_score: number
    total_verification: string
    read_by: string
    warnings: string[]
  }
}

export type ComparisonResult = {
  pr_number?: string
  status: 'success'
  comparison_id: string
  generated_at: string
  currency: string
  header: { rfq_reference: string; subtitle: string; status: string; title: string }
  recommendation: {
    badge: string
    confidence: number
    confidence_display: string
    supplier_name: string
    title: string
    summary: string
    projected_savings: { label: string; amount: number; display: string; percent: number; text: string } | null
  }
  weights: { cost: number; delivery: number }
  weights_display: string
  suppliers: SupplierRow[]
  why_first: { title: string; points: string[] }
  transparency: { title: string; text: string; methodology: string[] }
  next_step: { title: string; text: string; button_label: string }
  total_files: number
  processed_files: number
  rejected_files: { file_name: string; error_code: string; message: string }[]
}

/** Error shown on the upload page. `details` = bullet points, `filesToReplace` = file names to flag. */
export class QuotationError extends Error {
  code: string
  details: string[]
  filesToReplace: string[]

  constructor(message: string, code = 'ERROR', details: string[] = [], filesToReplace: string[] = []) {
    super(message)
    this.code = code
    this.details = details
    this.filesToReplace = filesToReplace
  }
}

/** Wakes the backend (free hosting sleeps when idle). Called when the upload page opens. */
export function warmUpApi() {
  fetch(`${API_URL}/health`).catch(() => undefined)
}

export async function processQuotations(files: File[]): Promise<ComparisonResult> {
  const form = new FormData()
  files.forEach((file) => form.append('files', file, file.name))

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 180_000) // scanned PDFs + cold start can be slow
  let response: Response
  try {
    response = await fetch(`${API_URL}/api/v1/quotations/process`, { method: 'POST', body: form, signal: controller.signal })
  } catch (error) {
    throw new QuotationError(
      (error as Error).name === 'AbortError'
        ? 'The analysis took too long. Please try again.'
        : 'Could not reach the Procure.AI engine. Please check your connection and try again.',
      'NETWORK_ERROR',
    )
  } finally {
    clearTimeout(timer)
  }

  const body = await response.json().catch(() => null)
  if (!response.ok || !body || body.status !== 'success') {
    const err = body?.error ?? {}
    const d = err.details
    let details: string[] = []
    let filesToReplace: string[] = []
    if (Array.isArray(d)) {
      details = d.map((r: { file_name?: string; message?: string }) => `${r.file_name}: ${r.message}`)
      filesToReplace = d.map((r: { file_name?: string }) => r.file_name ?? '')
    } else if (d && Array.isArray(d.differences)) {
      details = d.differences
      filesToReplace = d.files_to_replace ?? []
    }
    throw new QuotationError(err.message ?? `Request failed (${response.status})`, err.code, details, filesToReplace)
  }
  return body as ComparisonResult
}

export function saveResult(result: ComparisonResult) {
  sessionStorage.setItem(RESULT_KEY, JSON.stringify(result))
}

export function loadResult(): ComparisonResult | null {
  try {
    return JSON.parse(sessionStorage.getItem(RESULT_KEY) ?? 'null')
  } catch {
    return null
  }
}
