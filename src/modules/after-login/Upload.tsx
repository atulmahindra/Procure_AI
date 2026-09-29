import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { AuthenticatedHeader } from '../shared/AuthenticatedHeader'
import folderOpenIcon from '../../assets/folder-open.png'
import shieldCheckIcon from '../../assets/shield-check.png'
import trashIcon from '../../assets/trash.png'
import sparklesIcon from '../../assets/sparkles.png'
import { MAX_FILE_MB, MAX_FILES, QuotationError, processQuotations, saveResult, warmUpApi } from './quotationApi'
import './Upload.scss'

type UploadProps = {
  userName: string
  onLogout: () => void
  onCompare: () => void
}

type UploadedFile = {
  file: File
  name: string
  size: string
}

export function Upload({ userName, onLogout, onCompare }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [prNumber, setPrNumber] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [limitWarning, setLimitWarning] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<QuotationError | null>(null)

  useEffect(() => { warmUpApi() }, [])

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return
    setError(null)
    const all = Array.from(fileList)
    const pdfs = all.filter((file) => file.name.toLowerCase().endsWith('.pdf'))
    const valid = pdfs.filter((file) => file.size <= MAX_FILE_MB * 1024 * 1024)
    const warnings: string[] = []
    if (pdfs.length < all.length) warnings.push('Only PDF quotations are accepted.')
    if (valid.length < pdfs.length) warnings.push(`Files larger than ${MAX_FILE_MB} MB were skipped.`)

    setFiles((current) => {
      const incoming = valid
        .filter((file) => !current.some((c) => c.name === file.name && c.file.size === file.size))
        .map((file) => ({ file, name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB` }))
      const availableSlots = MAX_FILES - current.length
      if (availableSlots <= 0) {
        setLimitWarning(`You can upload a maximum of ${MAX_FILES} files.`)
        return current
      }
      if (incoming.length > availableSlots) {
        warnings.push(`You can upload a maximum of ${MAX_FILES} files. Only the first ${availableSlots} were added.`)
      }
      setLimitWarning(warnings.join(' '))
      return [...current, ...incoming.slice(0, availableSlots)]
    })
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files)
    event.target.value = ''
  }

  function dropFiles(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (files.length >= MAX_FILES) {
      setLimitWarning(`You can upload a maximum of ${MAX_FILES} files.`)
      return
    }
    addFiles(event.dataTransfer.files)
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))
    setLimitWarning('')
    setError(null)
  }

  async function processFiles() {
    setIsProcessing(true)
    setError(null)
    try {
      const result = await processQuotations(files.map((f) => f.file))
      saveResult({ ...result, pr_number: prNumber.trim() })
      onCompare()
    } catch (e) {
      setError(e instanceof QuotationError ? e : new QuotationError('Something went wrong. Please try again.'))
    } finally {
      setIsProcessing(false)
    }
  }

  const isLimitReached = files.length >= MAX_FILES
  const needsReplacing = (name: string) => error?.filesToReplace.some((f) => f === name || f.endsWith(`(${name})`)) ?? false

  return (
    <main className="upload-page">
      <AuthenticatedHeader userName={userName} onLogout={onLogout} />

      <section className="upload-content">
        <nav className="upload-steps" aria-label="Quotation workflow"><div className="upload-step done"><span>1</span><strong>Sign in</strong></div><i /><div className="upload-step active"><span>2</span><strong>Upload quotations</strong></div><i /><div className="upload-step"><span>3</span><strong>AI recommendation</strong></div></nav>
        <div className="upload-intro"><div><p className="eyebrow">New comparison</p><h1>Upload supplier quotations</h1><p>Add the quotations for one requirement (same items and quantities) and Procure.AI will normalize and compare them.</p></div><span className="files-ready">{files.length} files ready</span></div>

        <div className="upload-grid">
          <section className="upload-card">
            <button className={`drop-zone ${isDragging ? 'is-dragging' : ''}`} disabled={isLimitReached || isProcessing} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); if (!isLimitReached) setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={dropFiles}><input ref={inputRef} type="file" onChange={selectFile} accept=".pdf,application/pdf" multiple hidden /><span className="upload-icon"></span><strong>Drag and drop quotations here</strong><span>PDF (digital or scanned) · Up to {MAX_FILE_MB} MB each · Maximum {MAX_FILES} files</span><span className="browse-button"><img src={folderOpenIcon} alt="" />Browse files</span></button>
            {limitWarning && <p className="limit-warning" role="alert">{limitWarning}</p>}
            <div className="security-note"><span className="security-note-copy"><img src={shieldCheckIcon} alt="" /> Files are encrypted in transit and used only for this comparison.</span><input className="pr-number-input" type="text" value={prNumber} onChange={(event) => setPrNumber(event.target.value)} placeholder="PR Number" aria-label="PR Number" required /></div>
          </section>

         <section className="files-card">
  <div className="files-heading">
    <h2>Uploaded files</h2>
    <strong>{files.length} of {MAX_FILES}</strong>
  </div>
  <div className="file-list">
    {files.map((file, index) => (
      <div className="file-row" key={`${file.name}-${index}`}>
        <span className="file-icon"></span>
        <div>
          <p>{file.name}</p>
          <small>{file.size} · {needsReplacing(file.name) ? <b className="file-replace">Replace this file</b> : <b>Ready</b>}</small>
        </div>
        <button onClick={() => removeFile(index)} disabled={isProcessing} aria-label={`Remove ${file.name}`}>
          <img src={trashIcon} alt="" />
        </button>
      </div>
    ))}
  </div>
  {files.length > 0 && !error && (
    <p className="files-success">
      <span>✓</span> All files passed security and format checks.
    </p>
  )}
</section>
        </div>

        {error && (
          <div className="process-error" role="alert">
            <strong>{error.message}</strong>
            {error.details.length > 0 && <ul>{error.details.map((d) => <li key={d}>{d}</li>)}</ul>}
          </div>
        )}

        <div className="upload-footer"><p>{isProcessing ? 'Reading the quotations and ranking suppliers. Scanned PDFs can take up to a minute.' : 'Tip: Include at least two supplier quotations for a meaningful comparison.'}</p><div><button className="save-button" type="button">Save draft</button><button className="process-button" type="button" disabled={files.length < 2 || !prNumber.trim() || isProcessing} onClick={processFiles} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><img src={sparklesIcon} alt="" style={{ display: 'block', width: 16, height: 16 }} />{isProcessing ? 'Processing quotations…' : <>Process &amp; compare quotations</>}</button></div></div>
      </section>
    </main>
  )
}
