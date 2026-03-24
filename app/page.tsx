'use client';

import { useState } from 'react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const response = await fetch('/api/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(result.error || 'Something went wrong.');
      return;
    }

    setEmail('');
    setStatus('Your request has been received.');
  }

  return (
    <main className="container">
      <div className="grid grid-2">
        <section className="card stack">
          <h1>Request access credentials</h1>
          <p className="small">
            Enter your email address. Your request will be reviewed manually, and credentials can only be issued once per account.
          </p>
          <form className="stack" onSubmit={onSubmit}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button disabled={loading}>{loading ? 'Submitting...' : 'Request credentials'}</button>
          </form>
          {status ? <p className="small">{status}</p> : null}
        </section>

        <section className="card stack">
          <h2>How it works</h2>
          <p className="small">1. A user submits an email address.</p>
          <p className="small">2. The admin gets notified by email.</p>
          <p className="small">3. The admin picks an available account and sends it.</p>
          <p className="small">4. That account is permanently marked as used.</p>
          <div className="row wrap">
            <a href="/admin"><button type="button" className="secondary">Open admin panel</button></a>
          </div>
        </section>
      </div>
    </main>
  );
}
