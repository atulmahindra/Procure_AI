import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import './Upload.scss'

type UploadProps = {
  userName: string
  onLogout: () => void
}

export function Upload({ userName, onLogout }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const firstName = userName.split(' ')[0]

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    setFileName(event.target.files?.[0]?.name ?? '')
  }

  return (
    <main className="upload-page">
      <header className="upload-header"><div className="upload-logo"><div className="brand-mark">P</div><span>procure<span>flow</span></span></div><div className="upload-header-actions"><button className="help-button">? <span>Help center</span></button><div className="user-menu"><div className="avatar">{userName.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><div className="user-details"><strong>{userName}</strong><small>Administrator</small></div><button className="logout-button" onClick={onLogout}>Log out</button></div></div></header>
      <section className="upload-content"><div className="upload-intro"><div><p className="eyebrow">Document center</p><h1>Upload your documents</h1><p>Hi {firstName}, add a file and we’ll organize the important details for you.</p></div><div className="step-indicator"><span className="active">1</span><i /><span>2</span><i /><span>3</span></div></div>
        <div className="upload-card"><div className="card-heading"><div><h2>Start with a document</h2><p>Upload a purchase order, invoice, or vendor agreement.</p></div><span className="secure-badge">⌁ Secure upload</span></div><button className={`drop-zone ${isDragging ? 'is-dragging' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); setFileName(event.dataTransfer.files[0]?.name ?? '') }}><input ref={inputRef} type="file" onChange={selectFile} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" hidden /><span className="upload-icon">↑</span><strong>{fileName || 'Drop your file here'}</strong><span>{fileName ? 'Ready to process' : 'or click to browse from your computer'}</span><small>PDF, DOCX, XLSX, or CSV · Max 25 MB</small></button>{fileName && <div className="selected-file"><span>▤</span><div><strong>{fileName}</strong><small>Ready for upload</small></div><button onClick={() => setFileName('')} aria-label="Remove selected file">×</button></div>}<button className="continue-button" disabled={!fileName} onClick={() => setFileName('')}>Upload and continue <span>→</span></button></div>
        <div className="upload-tips"><div><span>✦</span><div><strong>Smart extraction</strong><p>We’ll identify totals, dates, vendors, and line items automatically.</p></div></div><div><span>◉</span><div><strong>Your data stays private</strong><p>Files are encrypted in transit and at rest.</p></div></div></div>
      </section>
    </main>
  )
}
