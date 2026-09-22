import { useState } from 'react'
import type { FormEvent } from 'react'
import './Login.scss'

type LoginProps = {
  onLogin: (name: string) => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Ava Roberts'
    onLogin(name)
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <p className="product-logo">Procure<span>.AI</span></p>
        <p>Secure procurement workspace</p>
      </header>

      <div className="login-layout">
        <section className="login-brand-panel">
          <div className="brand-copy">
            <p className="eyebrow">AI-powered procurement</p>
            <h1>Make every<br />supplier decision<br />count.</h1>
            <p>Sign in to compare supplier quotations, surface commercial risks, and move from analysis to confident action.</p>
            <ul className="benefits-list">
              <li>Enterprise-grade access controls</li>
              <li>Transparent, auditable AI recommendations</li>
              <li>Your quotation data stays protected</li>
            </ul>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="login-panel-inner">
            <div className="login-steps" aria-label="Sign in progress">
              <div className="step active"><span>1</span><strong>Sign in</strong></div>
              <i />
              <div className="step"><span>2</span><strong>Upload quotations</strong></div>
              <i />
              <div className="step"><span>3</span><strong>AI recommendation</strong></div>
            </div>

        <div className="login-form-wrap">
          <div className="login-heading"><h2>Welcome back</h2><p>Sign in with your procurement team credentials.</p></div>
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Work email<input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" required /></label>
            <label htmlFor="password">Password<div className="password-field"><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" required minLength={4} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? '◉' : '◌'}</button></div></label>
            <div className="login-options"><label className="remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Remember me</span></label><a href="#forgot-password">Forgot password?</a></div>
            <button className="login-submit" type="submit">Log in</button>
          </form>
          <div className="login-divider"><span>or</span></div>
          <button className="sso-button" type="button"><span className="microsoft-icon"><i /><i /><i /><i /></span>Continue with Microsoft SSO</button>
          <p className="login-signup">Need access? Contact your procurement administrator.</p>
        </div>
          </div>
        </section>
      </div>
    </main>
  )
}
