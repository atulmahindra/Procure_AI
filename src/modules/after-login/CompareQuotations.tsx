import { AuthenticatedHeader } from '../shared/AuthenticatedHeader'
import './CompareQuotations.scss'

type CompareQuotationsProps = {
  userName: string
  onLogout: () => void
  onBack: () => void
  onProceed: () => void
}

const suppliers = [
  { rank: '01', name: 'Apex Industrial', score: '94.6', total: '₹18.20L', delivery: '14 days', terms: 'Net 45', compliance: '98%', risk: 'Low', tone: 'recommended' },
  { rank: '02', name: 'Zenith Controls', score: '86.7', total: '₹19.50L', delivery: '10 days', terms: 'Net 30', compliance: '89%', risk: 'Medium', tone: 'standard' },
  { rank: '03', name: 'Vortex Equipments', score: '80.1', total: '₹17.80L', delivery: '21 days', terms: '50% advance', compliance: '92%', risk: 'Medium', tone: 'standard' },
]

export function CompareQuotations({ userName, onLogout, onBack, onProceed }: CompareQuotationsProps) {
  return (
    <main className="compare-page">
      <AuthenticatedHeader userName={userName} onLogout={onLogout} />
      <section className="compare-content">
        <nav className="upload-steps" aria-label="Quotation workflow"><div className="upload-step done"><span>1</span><strong>Sign in</strong></div><i /><div className="upload-step done"><span>2</span><strong>Upload quotations</strong></div><i /><div className="upload-step active"><span>3</span><strong>AI recommendation</strong></div></nav>
        <div className="compare-meta"><p className="eyebrow">RFQ-2026-A · 3 quotations compared</p><div className="analysis-complete"><span>✓</span> Analysis complete</div></div>
        <div className="compare-intro"><div><h1>AI recommendation for the Procurement Team</h1></div><div className="intro-actions">
          {/* <button className="back-button" onClick={onBack}>← Back to upload</button> */}
          <button className="outline-action">♧ &nbsp; Export report</button><button className="outline-action">□ &nbsp; Share</button></div></div>
        <section className="recommendation-card"><span className="insight-icon">✣</span><div className="recommendation-copy"><div><span className="recommendation-label">Best overall value</span><span className="confidence-label">94% confidence</span></div><h2>Proceed with Apex Industrial</h2><p>Apex offers the strongest balance of total cost, technical compliance, payment flexibility and supplier risk. Its quote is not the lowest, but the faster delivery and stronger terms create the best risk-adjusted value.</p></div><div className="savings"><span>Projected savings</span><strong>₹3.30L</strong><small>6.7% vs. next best</small></div></section>
        <div className="ranked-heading"><h2>Ranked supplier options</h2><span>Cost 35% · Compliance 25% · Delivery 20% · Terms 10% · Risk 10%</span></div>
        <section className="ranking-table"><div className="ranking-row ranking-header"><span>Rank / supplier</span><span>AI score</span><span>Total cost</span><span>Delivery</span><span>Payment terms</span><span>Compliance</span><span>Risk</span><span /></div>{suppliers.map((supplier) => <div className={`ranking-row ${supplier.tone}`} key={supplier.name}><div className="rank-supplier"><strong>{supplier.rank}</strong><b>{supplier.name}</b>{supplier.tone === 'recommended' && <small>RECOMMENDED</small>}</div><span>{supplier.score}</span><span>{supplier.total}</span><span>{supplier.delivery}</span><span>{supplier.terms}</span><span>{supplier.compliance}</span><span className={supplier.risk === 'Low' ? 'low-risk' : ''}>{supplier.risk}</span><button className="review-button">Review details</button></div>)}</section>
        <div className="decision-grid"><section className="decision-card"><h2>Why Apex ranks first</h2><p>• 98% technical compliance with no critical exceptions</p><p>• Net 45 terms improve working capital</p><p>• Low delivery and supplier-performance risk</p></section><section className="decision-card"><h2>Confidence &amp; transparency</h2><p>94% confidence based on 27 normalized fields. Two delivery assumptions were inferred and should be confirmed.</p><button>View scoring methodology →</button></section><section className="proceed-card"><h2>Ready to move forward?</h2><p>Create the approval package with Apex&apos;s quotation and full audit trail.</p><button onClick={onProceed}>→ &nbsp; Proceed with Apex</button></section></div>
      </section>
    </main>
  )
}
