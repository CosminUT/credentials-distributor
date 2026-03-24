import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

async function getData() {
  const [requests, availableAccounts, sentCount, totalCount] = await Promise.all([
    db.request.findMany({
      orderBy: { createdAt: 'desc' },
      include: { fulfilledAccount: true },
      take: 50,
    }),
    db.account.findMany({
      where: { status: 'AVAILABLE' },
      orderBy: { createdAt: 'asc' },
      take: 200,
    }),
    db.account.count({ where: { status: 'SENT' } }),
    db.account.count(),
  ]);

  return { requests, availableAccounts, sentCount, totalCount };
}

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className="container">
        <section className="card stack" style={{ maxWidth: 480, margin: '0 auto' }}>
          <h1>Admin login</h1>
          <p className="small">Use the admin email and password from your environment variables.</p>
          <form className="stack" method="post" action="/api/admin/login">
            <input type="email" name="email" placeholder="admin@example.com" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Sign in</button>
          </form>
        </section>
      </main>
    );
  }

  const { requests, availableAccounts, sentCount, totalCount } = await getData();

  return (
    <main className="container stack">
      <div className="spread">
        <div className="stack">
          <h1>Credential Distributor Admin</h1>
          <p className="small">Review requests, import accounts, and send each account only once.</p>
        </div>
        <form method="post" action="/api/admin/logout">
          <button type="submit" className="secondary">Sign out</button>
        </form>
      </div>

      <section className="grid grid-2">
        <div className="card stack">
          <h2>Import CSV</h2>
          <p className="small">Expected columns: username,password,label</p>
          <form className="stack" method="post" action="/api/admin/import">
            <textarea name="csvText" rows={10} placeholder={`username,password,label\nuser1,pass1,Pool A\nuser2,pass2,Pool B`} required />
            <button type="submit">Import accounts</button>
          </form>
        </div>

        <div className="card stack">
          <h2>Inventory</h2>
          <div className="row wrap">
            <span className="badge available">Available: {availableAccounts.length}</span>
            <span className="badge sent">Sent: {sentCount}</span>
            <span className="badge pending">Total: {totalCount}</span>
          </div>
          <p className="small">Available accounts can be assigned once. Sent accounts are permanently locked.</p>
        </div>
      </section>

      <section className="card stack">
        <h2>Requests</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Requester</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Assigned account</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.requesterEmail}</td>
                <td>
                  <span className={`badge ${request.status === 'PENDING' ? 'pending' : 'sent'}`}>
                    {request.status}
                  </span>
                </td>
                <td>{new Date(request.createdAt).toLocaleString()}</td>
                <td>{request.fulfilledAccount?.username ?? '—'}</td>
                <td>
                  {request.status === 'PENDING' ? (
                    <form className="stack" method="post" action="/api/admin/send">
                      <input type="hidden" name="requestId" value={request.id} />
                      <select name="accountId" required defaultValue="">
                        <option value="" disabled>Select available account</option>
                        {availableAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.username}{account.label ? ` — ${account.label}` : ''}
                          </option>
                        ))}
                      </select>
                      <button type="submit">Send credentials</button>
                    </form>
                  ) : (
                    <span className="small">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
