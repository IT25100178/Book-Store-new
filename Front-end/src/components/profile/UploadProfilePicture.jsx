// src/components/profile/UploadProfilePicture.jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users as usersApi } from '../../services/api';

export default function UploadProfilePicture() {
  const { user, updateLocalUser } = useAuth();
  const fileRef = useRef();
  const [preview, setPreview] = useState(user?.avatar || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPreview(user?.avatar || '');
  }, [user?.avatar]);

  const validateFile = (file) => {
    if (!file) return 'Please select an image file.';
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) return 'Only JPG, JPEG, or PNG images are allowed.';
    if (file.size > 2 * 1024 * 1024) return 'Image must be under 2 MB.';
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileError = validateFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setError('');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose an image first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await usersApi.uploadProfileImage(user.id, selectedFile.name, preview);
      if (result.ok) {
        const avatarUrl = result.data?.avatar;
        updateLocalUser({ avatar: avatarUrl });
        setSuccess('Profile picture updated successfully!');
        setSelectedFile(null);
      } else {
        setError(result.data?.message || 'Failed to upload profile picture.');
      }
    } catch (err) {
      setError('Unable to upload image. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleRemove = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await usersApi.removeProfileImage(user.id);
      if (result.ok) {
        updateLocalUser({ avatar: '' });
        setPreview('');
        setSelectedFile(null);
        setSuccess('Profile photo removed.');
      } else {
        setError(result.data?.message || 'Failed to remove profile photo.');
      }
    } catch (err) {
      setError('Unable to remove profile photo. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div>
      <h2 className="profile-section-title">Profile Picture</h2>
      {success && <div className="profile-success-msg">{success}</div>}
      {error && <div className="profile-error-msg">{error}</div>}

      <div className="profile-image-upload-card">
        <div className="profile-image-preview-shell" onClick={() => fileRef.current?.click()}>
          {preview ? (
            <img src={preview} alt="Profile preview" className="profile-image-preview" />
          ) : (
            <div className="profile-image-placeholder">
              <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
          )}
          <div className="profile-image-overlay">
            <span>📷</span>
            <span>Change Photo</span>
          </div>
        </div>

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div className="profile-image-upload-actions">
          <button className="profile-btn-outline" type="button" onClick={() => fileRef.current?.click()}>
            📁 Choose Image
          </button>
          <button
            className="profile-btn-primary"
            type="button"
            onClick={handleUpload}
            disabled={loading || !selectedFile}
          >
            {loading ? 'Uploading...' : '💾 Upload Image'}
          </button>
          {user?.avatar && (
            <button
              type="button"
              className="profile-btn-danger"
              onClick={handleRemove}
              disabled={loading}
            >
              Remove Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
