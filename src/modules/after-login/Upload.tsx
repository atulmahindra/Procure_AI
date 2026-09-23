import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { AuthenticatedHeader } from '../shared/AuthenticatedHeader'
import folderOpenIcon from '../../assets/folder-open.png'
import shieldCheckIcon from '../../assets/shield-check.png'
import trashIcon from '../../assets/trash.png'
import sparklesIcon from '../../assets/sparkles.png'
import './Upload.scss'

type UploadProps = {
  userName: string
  onLogout: () => void
  onCompare: () => void
}

type UploadedFile = {
  name: string
  size: string
}

const starterFiles: UploadedFile[] = [
  { name: 'Apex_Industrial_RFQ_2026-A.pdf', size: '2.4 MB' },
  { name: 'Zenith_Controls_Commercial_Quote.xlsx', size: '1.1 MB' },
  { name: 'Vortex_Equipments_Quotation.pdf', size: '3.8 MB' },
]

export function Upload({ userName, onLogout, onCompare }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadedFile[]>(starterFiles)
  const [isDragging, setIsDragging] = useState(false)

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    const incoming = Array.from(fileList).map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }))
    setFiles((current) => [...current, ...incoming].slice(0, 20))
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files)
    event.target.value = ''
  }

  function dropFiles(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
  }

  return (
    <main className="upload-page">
      <AuthenticatedHeader userName={userName} onLogout={onLogout} />

      <section className="upload-content">
        <nav className="upload-steps" aria-label="Quotation workflow"><div className="upload-step done"><span>1</span><strong>Sign in</strong></div><i /><div className="upload-step active"><span>2</span><strong>Upload quotations</strong></div><i /><div className="upload-step"><span>3</span><strong>AI recommendation</strong></div></nav>
        <div className="upload-intro"><div><p className="eyebrow">New comparison · RFQ-2026-A</p><h1>Upload supplier quotations</h1><p>Add all quotations you want Procure.AI to normalize and compare.</p></div><span className="files-ready">{files.length} files ready</span></div>

        <div className="upload-grid">
          <section className="upload-card">
            <button className={`drop-zone ${isDragging ? 'is-dragging' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={dropFiles}><input ref={inputRef} type="file" onChange={selectFile} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" multiple hidden /><span className="upload-icon"></span><strong>Drag and drop quotations here</strong><span>PDF, XLSX, XLS, CSV or DOCX · Up to 20 MB each · Maximum 20 files</span><span className="browse-button"><img src={folderOpenIcon} alt="" />Browse files</span></button>
            <p className="security-note"><img src={shieldCheckIcon} alt="" /> Files are encrypted in transit and used only for this comparison.</p>
          </section>

         <section className="files-card">
  <div className="files-heading">
    <h2>Uploaded files</h2>
    <strong>{files.length} of 20</strong>
  </div>
  <div className="file-list">
    {files.map((file, index) => (
      <div className="file-row" key={`${file.name}-${index}`}>
        <span className="file-icon"></span>
        <div>
          <p>{file.name}</p>
          <small>{file.size} · <b>Ready</b></small>
        </div>
        <button onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`}>
          <img src={trashIcon} alt="" />
        </button>
      </div>
    ))}
  </div>
  <p className="files-success">
    <span>✓</span> All files passed security and format checks.
  </p>
</section>
        </div>

        <div className="upload-footer"><p>Tip: Include at least two supplier quotations for a meaningful comparison.</p><div><button className="save-button" type="button">Save draft</button><button className="process-button" type="button" disabled={files.length < 2} onClick={onCompare} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><img src={sparklesIcon} alt="" style={{ display: 'block', width: 16, height: 16 }} />Process &amp; compare quotations</button></div></div>
      </section>
    </main>
  )
}
