import { Fragment, useState } from 'react'
import { AuthenticatedHeader } from '../shared/AuthenticatedHeader'
import arrowUpRightIcon from '../../assets/arrow-up-right-from-square.png'
import downloadIcon from '../../assets/download.png'
import sparklesIcon from '../../assets/sparkles.png'
import { loadResult } from './quotationApi'
import './CompareQuotations.scss'

type CompareQuotationsProps = {
  userName: string
  onLogout: () => void
  onBack: () => void
  onProceed: () => void
}

const VERIFICATION: Record<string, string> = {
  verified: 'Verified (figures, words and line items agree)',
  stated_only: 'Taken from the printed total',
  stated_line_items_differ: 'Printed total used – differs from line items',
  computed_from_line_items: 'Computed from line items (no total printed)',
}

export function CompareQuotations({ userName, onLogout, onBack, onProceed }: CompareQuotationsProps) {
  const [data] = useState(loadResult)
  const [openRow, setOpenRow] = useState<string | null>(null)
  const [showMethod, setShowMethod] = useState(false)
  const [shareNote, setShareNote] = useState('')

  if (!data) {
    return (
      <main className="compare-page">
        <AuthenticatedHeader userName={userName} onLogout={onLogout} />
        <section className="compare-content">
          <section className="recommendation-card"><div className="recommendation-copy"><h2>No comparison yet</h2><p>Upload the supplier quotations to see the AI recommendation.</p></div><button className="review-button" onClick={onBack}>Upload quotations</button></section>
        </section>
      </main>
    )
  }

  const rec = data.recommendation
  const savings = rec.projected_savings

  async function share() {
    const lines = [rec.title, rec.summary, '', ...data!.suppliers.map((s) => `${s.rank} ${s.supplier_name} · AI score ${s.ai_score} · ${s.total_cost_display} · ${s.delivery_display}`)]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setShareNote('Summary copied')
    } catch {
      setShareNote('Copy not available')
    }
    setTimeout(() => setShareNote(''), 2500)
  }

  return (
    <main className="compare-page">
      <AuthenticatedHeader userName={userName} onLogout={onLogout} />
      <section className="compare-content">
        <div className="compare-topline"><nav className="upload-steps" aria-label="Quotation workflow"><div className="upload-step done"><span>1</span><strong>Sign in</strong></div><i /><div className="upload-step done"><span>2</span><strong>Upload quotations</strong></div><i /><div className="upload-step active"><span>3</span><strong>AI recommendation</strong></div></nav><div className="analysis-complete"><span>✓</span> {data.header.status}</div></div>
        <div className="compare-meta"><p className="eyebrow">{data.header.subtitle}</p>{data.pr_number && <p className="pr-number-display"><span>PR Number</span><strong>{data.pr_number}</strong></p>}</div>
        <div className="compare-intro"><div><h1>AI recommendation</h1></div><div className="intro-actions">
          <button className="outline-action" onClick={() => window.print()}><img src={downloadIcon} alt="" />Export report</button><button className="outline-action" onClick={share}><img src={arrowUpRightIcon} alt="" />{shareNote || 'Share'}</button></div></div>

        {data.rejected_files.length > 0 && (
          <p className="compare-warning" role="alert">Not included: {data.rejected_files.map((r) => `${r.file_name} – ${r.message}`).join('; ')}</p>
        )}

        <section className="recommendation-card"><span className="insight-icon"><img src={sparklesIcon} alt="" /></span><div className="recommendation-copy"><div><span className="recommendation-label">{rec.badge}</span><span className="confidence-label">{rec.confidence_display}</span></div><h2>{rec.title}</h2><p>{rec.summary}</p></div>
          {savings && <div className={`savings ${savings.label === 'ADDITIONAL COST' ? 'extra-cost' : ''}`}><span>{savings.label}</span><strong>{savings.display}</strong><small>{savings.text}</small></div>}
        </section>

        <div className="ranked-heading"><h2>Ranked supplier options</h2><span>{data.weights_display}</span></div>
        <section className="ranking-table">
          <div className="ranking-row ranking-header"><span>Rank / supplier</span><span>AI score</span><span>Total cost</span><span>Delivery</span><span>Rank</span><span /></div>
          {data.suppliers.map((s) => {
            const key = s.details.source_file
            const open = openRow === key
            return (
              <Fragment key={key}>
                <div className={`ranking-row ${s.recommended ? 'recommended' : 'standard'}`}>
                  <div className="rank-supplier"><strong>{s.position_display}</strong><b>{s.supplier_name}</b>{s.recommended && <small>RECOMMENDED</small>}</div>
                  <span>{s.ai_score}</span><span>{s.total_cost_display}</span><span>{s.delivery_display}</span>
                  <span className={s.rank === 'L1' ? 'low-risk' : ''}>{s.rank}</span>
                  <button className="review-button" onClick={() => setOpenRow(open ? null : key)}>{open ? 'Hide details' : 'Review details'}</button>
                </div>
                {open && (
                  <div className="ranking-details">
                    <div><small>Quotation no.</small><b>{s.details.quotation_number ?? '—'}</b></div>
                    <div><small>Quotation date</small><b>{s.details.quotation_date ?? '—'}</b></div>
                    <div><small>Delivery term (as quoted)</small><b>{s.details.delivery_term ?? 'Not stated'}</b></div>
                    <div><small>Price score / Delivery score</small><b>{s.details.price_score} / {s.details.delivery_score}</b></div>
                    <div><small>Total price check</small><b>{VERIFICATION[s.details.total_verification] ?? s.details.total_verification}</b></div>
                    <div><small>Source file</small><b>{s.details.source_file} · {s.details.read_by}</b></div>
                    {s.details.warnings.length > 0 && <p className="details-warnings">⚠ {s.details.warnings.join(' · ')}</p>}
                  </div>
                )}
              </Fragment>
            )
          })}
        </section>

        <div className="decision-grid">
          <section className="decision-card"><h2>{data.why_first.title}</h2>{data.why_first.points.map((p) => <p key={p}>• {p}</p>)}</section>
          <section className="decision-card"><h2>{data.transparency.title}</h2><p>{data.transparency.text}</p>
            <button onClick={() => setShowMethod((v) => !v)}>{showMethod ? 'Hide scoring methodology ↑' : 'View scoring methodology →'}</button>
            {showMethod && data.transparency.methodology.map((m) => <p key={m} className="method-line">• {m}</p>)}
          </section>
          <section className="proceed-card"><h2>{data.next_step.title}</h2><p>{data.next_step.text}</p><button onClick={onProceed}>→ &nbsp; {data.next_step.button_label}</button></section>
        </div>
      </section>
    </main>
  )
}
