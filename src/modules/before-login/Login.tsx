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
      <section className="login-brand-panel">
        <div className="brand-mark"><span>P</span></div>
        <p className="brand-name">procure<span>flow</span></p>
        <div className="brand-copy">
          <p className="eyebrow">Procurement, simplified.</p>
          <h1>Make every purchase count.</h1>
          <p>Bring your teams, vendors, and budgets together in one simple workspace.</p>
        </div>
        <div className="brand-footer"><span className="footer-dot" /> Trusted by modern teams to move faster.</div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="mobile-brand"><div className="brand-mark"><span>P</span></div><p className="brand-name">procure<span>flow</span></p></div>
          <div className="login-heading"><p className="eyebrow">Welcome back</p><h2>Sign in to your workspace</h2><p>Enter your details to continue where you left off.</p></div>
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Work email<input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /></label>
            <label htmlFor="password">Password<div className="password-field"><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required minLength={4} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
            <div className="login-options"><label className="remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Remember me</span></label><a href="#forgot-password">Forgot password?</a></div>
            <button className="login-submit" type="submit">Sign in <span>→</span></button>
          </form>
          <p className="login-signup">New to procureflow? <a href="#request-access">Request access</a></p>
          <p className="demo-hint">Demo mode: any valid email and password will sign you in.</p>
        </div>
      </section>
    </main>
  )
}
