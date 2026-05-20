import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function EditProfile() {
  const { user, updateUserProfile } = useAuth();
  
  // Data State
  const [name,        setName]        = useState(user?.name || '');
  const [email,       setEmail]       = useState(user?.email || '');
  const [bio,         setBio]         = useState(user?.bio || '');
  const [password,    setPassword]    = useState('');
  const [address,     setAddress]     = useState(user?.address || '');
  const [phone,       setPhone]       = useState(user?.phone || '');
  
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const maxLength = 180;
  const characterCount = bio.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(''); 
    setError('');
    
    if (!name.trim()) { setError('Name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }

    setLoading(true);
    
    const updates = { 
       name: name.trim(), 
       email: email.trim(), 
       bio: bio.trim(),
       address: address.trim(),
       phone: phone.trim()
    };
    
    if (password.trim()) {
      updates.password = password;
    }

    const result = await updateUserProfile(updates);
    setLoading(false);
    
    if (result?.success) {
      setSuccess('Profile updated successfully!');
      setPassword(''); // Clear password field on success
    } else {
      setError(result?.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="edit-profile-wrapper" style={{ padding: '24px' }}>
      
      {/* ── Form Section ── */}
      <div className="edit-profile-form-area" style={{ marginTop: 0 }}>
        <h2 className="profile-section-title" style={{ marginTop: 0, marginBottom: '24px', paddingBottom: 0, border: 'none', fontSize: '1.5rem', color: 'var(--profile-section-title-color, #D4AF37)' }}>
          Edit Profile Information
        </h2>

        {success && <div className="profile-success-msg" style={{ marginBottom: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(52,211,153,0.15)', color: '#34d399', fontSize: '0.9rem' }}>{success}</div>}
        {error   && <div className="profile-error-msg" style={{ marginBottom: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(248,113,113,0.15)', color: '#f87171', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div className="form-col" style={{ flex: 1 }}>
              <label className="profile-label" style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.875rem' }}>Full Name</label>
              <input className="profile-input" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-col" style={{ flex: 1 }}>
              <label className="profile-label" style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.875rem' }}>Email Address</label>
              <input className="profile-input" type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div className="form-col" style={{ flex: 1 }}>
              <label className="profile-label" style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.875rem' }}>Phone Number</label>
              <input className="profile-input" type="text" placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-col" style={{ flex: 1 }}>
              <label className="profile-label" style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.875rem' }}>New Password</label>
              <input className="profile-input" type="password" placeholder="Leave blank to keep current" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="profile-label" style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.875rem' }}>Shipping Address</label>
            <input className="profile-input" type="text" placeholder="123 Luxury Lane, NY 10001" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label className="profile-label" style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.875rem' }}>Biography</label>
            <textarea 
              className="profile-textarea" 
              placeholder="Tell us about yourself..." 
              value={bio} 
              maxLength={maxLength}
              onChange={(e) => setBio(e.target.value)} 
              style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
            />
            <div className="char-count" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
              <span style={{ fontFamily: 'monospace' }}>{maxLength - characterCount}</span> characters left
            </div>
          </div>

          <div className="form-footer" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
             <button type="submit" className="profile-btn-primary" disabled={loading}>
               {loading ? 'Saving...' : 'Save changes'}
             </button>
          </div>
        </form>
      </div>

    </div>
  );
}
