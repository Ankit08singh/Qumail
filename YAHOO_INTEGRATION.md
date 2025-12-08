# Yahoo Mail Polling Integration Guide

## Overview
This guide shows how to add Yahoo Mail support to your dashboard with automatic polling every 30 seconds.

## Backend Setup Checklist

1. ✅ Install packages (in backend):
```bash
npm install imap mailparser nodemailer crypto-js
npm install --save-dev @types/imap @types/mailparser @types/nodemailer @types/crypto-js
```

2. ✅ Add to backend `.env`:
```env
ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-chars-long
```

3. ✅ Create backend files (see code provided above):
   - `backend/utils/encryption.ts`
   - `backend/models/EmailAccount.ts`
   - `backend/services/yahooImap.ts`
   - `backend/services/yahooSmtp.ts`
   - `backend/routes/yahooRoutes.ts`

4. ✅ Register Yahoo routes in your main backend file:
```typescript
import yahooRoutes from './routes/yahooRoutes';
app.use('/api/yahoo', yahooRoutes);
```

## Frontend Integration

### 1. Add Provider Selector to Dashboard

Add a provider state and selector UI:

```typescript
// In dashboard.tsx, add this state
const [emailProvider, setEmailProvider] = useState<'gmail' | 'yahoo'>('gmail');

// Add this UI component near your top header
<div className="flex space-x-2 mb-4">
  <button
    onClick={() => setEmailProvider('gmail')}
    className={`px-4 py-2 rounded ${
      emailProvider === 'gmail' 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-700 text-gray-300'
    }`}
  >
    Gmail
  </button>
  <button
    onClick={() => setEmailProvider('yahoo')}
    className={`px-4 py-2 rounded ${
      emailProvider === 'yahoo' 
        ? 'bg-purple-600 text-white' 
        : 'bg-gray-700 text-gray-300'
    }`}
  >
    Yahoo Mail
  </button>
</div>
```

### 2. Add Yahoo Polling Logic

```typescript
// In dashboard.tsx, add this effect for Yahoo polling
useEffect(() => {
  if (emailProvider !== 'yahoo') return;
  
  // Fetch Yahoo emails immediately
  const fetchYahooEmails = async () => {
    try {
      const res = await API.get('/yahoo/messages');
      setMessages(res.data.messages);
    } catch (error: any) {
      console.error('Failed to fetch Yahoo emails:', error);
      if (error.response?.status === 404) {
        // No Yahoo account connected, redirect to connect page
        alert('Please connect your Yahoo account first');
        // Optionally: router.push('/connect-yahoo');
      }
    }
  };

  fetchYahooEmails();

  // Poll every 30 seconds
  const interval = setInterval(fetchYahooEmails, 30000);

  return () => clearInterval(interval);
}, [emailProvider]);
```

### 3. Update Send Email Function

```typescript
// Modify your handleSend function to support both providers
const handleSend = async (e: React.FormEvent) => {
  e.preventDefault();
  setSendingEmail(true);
  
  try {
    if (emailProvider === 'gmail') {
      // Existing Gmail send logic
      const res = await API.post('/auth/send-encrypted-email', emailForm);
      console.log("Email sent successfully:", res);
    } else if (emailProvider === 'yahoo') {
      // Yahoo send logic
      const res = await API.post('/yahoo/send', emailForm);
      console.log("Yahoo email sent successfully:", res);
    }
    
    alert('Email sent successfully!');
    setEmailForm({ to: '', subject: '', body: '', isHtml: false, type: 'QKD' });
    setShowCompose(false);
    
    // Refresh messages
    if (emailProvider === 'gmail') {
      await fetchMessages();
    } else {
      // Yahoo will auto-refresh via polling
    }
  } catch (err: any) {
    console.error("Failed to send email:", err.message);
    alert('Failed to send email: ' + err.message);
  } finally {
    setSendingEmail(false);
  }
};
```

### 4. Add Connection Status Indicator

```typescript
// Add this component to show Yahoo connection status
const [yahooConnected, setYahooConnected] = useState(false);

useEffect(() => {
  if (emailProvider === 'yahoo') {
    API.get('/yahoo/accounts')
      .then(res => setYahooConnected(res.data.accounts.length > 0))
      .catch(() => setYahooConnected(false));
  }
}, [emailProvider]);

// In your UI
{emailProvider === 'yahoo' && !yahooConnected && (
  <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-4">
    <p className="text-yellow-300">
      Yahoo Mail not connected.{' '}
      <a href="/connect-yahoo" className="underline font-semibold">
        Connect now
      </a>
    </p>
  </div>
)}
```

## Testing Flow

1. **Connect Yahoo Account:**
   - Navigate to `/connect-yahoo`
   - Enter Yahoo email and app password
   - Submit form

2. **View Emails:**
   - Go to dashboard
   - Select "Yahoo Mail" provider
   - Emails will load automatically
   - Polling happens every 30 seconds

3. **Send Email:**
   - Click compose
   - Fill in details
   - Send (uses Yahoo SMTP)

## Polling Behavior

- ✅ Fetches emails every 30 seconds
- ✅ Only polls when Yahoo provider is selected
- ✅ Stops polling when switching to Gmail
- ✅ Automatically resumes when switching back
- ✅ Cleans up interval on unmount

## Security Notes

- Credentials are encrypted with AES before storage
- Use strong ENCRYPTION_KEY in production
- App passwords are more secure than regular passwords
- IMAP/SMTP connections use TLS/SSL

## Next Steps (Future Enhancement)

When ready to upgrade to real-time:
- Implement IMAP IDLE in backend
- Add WebSocket/SSE connection
- Push notifications instead of polling
- Better battery/resource efficiency

## Troubleshooting

**Error: "No Yahoo account connected"**
- Solution: Go to `/connect-yahoo` and add your account

**Error: "Failed to connect"**
- Check Yahoo app password is correct
- Ensure no spaces in password
- Verify Yahoo account security settings allow app passwords

**Emails not loading**
- Check backend logs for IMAP errors
- Verify ENCRYPTION_KEY is set
- Check MongoDB connection
