import { useState, useRef } from 'react';
import Modal from '../common/Modal';
import GlowInput from '../common/GlowInput';
import GlowButton from '../common/GlowButton';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { request } from '../../utils/apiClient';
import { fileToBase64, formatFileSize } from '../../utils/fileUtils';
import { todayISO } from '../../utils/dateUtils';
import '../../styles/modal.css';

export default function CertUploadModal({ isOpen, onClose, editCert }) {
  const { currentUser } = useAuth();
  const { addCert, updateCert } = useData();

  const isEdit = !!editCert;

  const [form, setForm] = useState({
    title:       editCert?.title        || '',
    issuer:      editCert?.issuer       || '',
    credentialId: editCert?.credentialId || '',
    issueDate:   editCert?.issueDate    || todayISO(),
    expiryDate:  editCert?.expiryDate   || '',
    tags:        editCert?.tags?.join(', ') || '',
  });

  const [docBase64,  setDocBase64]  = useState(editCert?.documentBase64   || null);
  const [docName,    setDocName]    = useState(editCert?.documentName      || null);
  const [docMime,    setDocMime]    = useState(editCert?.documentMimeType  || null);
  const [docSize,    setDocSize]    = useState(null);
  const [dragOver,   setDragOver]   = useState(false);
  const [fileError,  setFileError]  = useState('');
  const [scanInfo,   setScanInfo]   = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [saving,     setSaving]     = useState(false);
  const [scanning,   setScanning]   = useState(false);

  const fileInput = useRef(null);

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFile = async (file) => {
    setFileError('');
    setScanInfo('');
    try {
      const b64 = await fileToBase64(file);
      setDocBase64(b64);
      setDocName(file.name);
      setDocMime(file.type);
      setDocSize(file.size);
    } catch (err) {
      setFileError(err.message);
    }
  };

  const handleAutoScan = async () => {
    if (!docBase64) {
      setFileError('Please upload a certificate document first.');
      return;
    }

    setScanning(true);
    setFileError('');
    setScanInfo('Scanning your certificate...');

    try {
      const result = await request('/certifications/scan', {
        method: 'POST',
        body: {
          documentBase64: docBase64,
          documentName: docName,
          documentMimeType: docMime,
        },
      });

      const suggested = result?.suggestions || {};
      setForm(prev => ({
        ...prev,
        title: suggested.title || prev.title,
        issuer: suggested.issuer || prev.issuer,
        credentialId: suggested.credentialId || prev.credentialId,
        issueDate: suggested.issueDate || prev.issueDate,
        expiryDate: suggested.expiryDate || prev.expiryDate,
        tags: Array.isArray(suggested.tags) && suggested.tags.length
          ? suggested.tags.join(', ')
          : prev.tags,
      }));

      const warnings = Array.isArray(result?.warnings) ? result.warnings.filter(Boolean) : [];
      setScanInfo(warnings.length ? warnings[0] : 'Form auto-filled from certificate scan.');
    } catch (err) {
      setFileError(err.message || 'Unable to scan the certificate right now.');
      setScanInfo('');
    } finally {
      setScanning(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.issuer.trim()) errs.issuer = 'Issuer is required.';
    if (!form.issueDate) errs.issueDate = 'Issue date is required.';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setFileError('');
    const payload = {
      userId:          currentUser.id,
      title:           form.title.trim(),
      issuer:          form.issuer.trim(),
      credentialId:    form.credentialId.trim(),
      issueDate:       form.issueDate,
      expiryDate:      form.expiryDate || null,
      tags:            form.tags.split(',').map(t => t.trim()).filter(Boolean),
      documentBase64:  docBase64,
      documentName:    docName,
      documentMimeType: docMime,
    };

    try {
      if (isEdit) {
        await updateCert(editCert.id, payload);
      } else {
        await addCert(payload);
      }
      onClose();
    } catch (err) {
      setFileError(err.message || 'Failed to save certification.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '✏️ Edit Certification' : '🎓 Add Certification'}
      size="md"
    >
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        <GlowInput
          id="cert-title"
          label="Certification Title"
          value={form.title}
          onChange={set('title')}
          placeholder="e.g. AWS Solutions Architect"
          icon="🎓"
          error={formErrors.title}
          required
        />
        <GlowInput
          id="cert-issuer"
          label="Issuing Organization"
          value={form.issuer}
          onChange={set('issuer')}
          placeholder="e.g. Amazon Web Services"
          icon="🏢"
          error={formErrors.issuer}
          required
        />
        <GlowInput
          id="cert-credId"
          label="Credential / Certificate ID"
          value={form.credentialId}
          onChange={set('credentialId')}
          placeholder="Optional unique identifier"
          icon="🔖"
        />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
          <GlowInput
            id="cert-issue"
            label="Issue Date"
            type="date"
            value={form.issueDate}
            onChange={set('issueDate')}
            error={formErrors.issueDate}
            required
          />
          <GlowInput
            id="cert-expiry"
            label="Expiry Date (optional)"
            type="date"
            value={form.expiryDate}
            onChange={set('expiryDate')}
          />
        </div>

        <GlowInput
          id="cert-tags"
          label="Tags (comma-separated)"
          value={form.tags}
          onChange={set('tags')}
          placeholder="e.g. cloud, aws, devops"
          icon="🏷"
        />

        {/* File drop zone */}
        <div>
          <div className="glow-input-label" style={{ marginBottom:'0.5rem', fontSize:'0.82rem', fontWeight:600, color:'var(--text-secondary)', letterSpacing:'0.04em', textTransform:'uppercase' }}>
            Certificate Document
          </div>

          {docBase64 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              <div className="dropzone__active">
                <span style={{ fontSize:'1.4rem' }}>
                  {docMime === 'application/pdf' ? '📋' : '🖼️'}
                </span>
                <div style={{ flex:1 }}>
                  <div className="dropzone__active-name">{docName}</div>
                  {docSize && <div className="dropzone__active-size">{formatFileSize(docSize)}</div>}
                </div>
                <button
                  type="button"
                  style={{ background:'none', border:'none', color:'var(--glow-danger)', cursor:'pointer', fontSize:'1.1rem' }}
                  onClick={() => { setDocBase64(null); setDocName(null); setDocMime(null); setDocSize(null); }}
                  title="Remove document"
                >
                  🗑
                </button>
              </div>
              {/* Explicit replace button */}
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
                  background:'transparent', border:'1.5px dashed var(--border-normal)',
                  borderRadius:'var(--radius-md)', padding:'0.55rem 1rem',
                  color:'var(--text-secondary)', fontSize:'0.82rem', fontWeight:600,
                  cursor:'pointer', transition:'all var(--transition-fast)',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor='var(--glow-primary)'; e.currentTarget.style.color='var(--glow-primary)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor='var(--border-normal)'; e.currentTarget.style.color='var(--text-secondary)'; }}
              >
                🔄 Replace with a different document
              </button>
              <GlowButton
                type="button"
                variant="ghost"
                onClick={handleAutoScan}
                loading={scanning}
              >
                🤖 Auto-fill with AI Scan
              </GlowButton>
            </div>
          ) : (
            <div
              className={`dropzone${dragOver ? ' dropzone--drag-over' : ''}`}
              onClick={() => fileInput.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="dropzone__icon">📂</div>
              <div className="dropzone__text">Click or drag & drop to upload</div>
              <div className="dropzone__hint">PDF, PNG, JPG — max 5MB</div>
            </div>
          )}
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display:'none' }}
            onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
          />
          {fileError && <div style={{ color:'var(--glow-danger)', fontSize:'0.78rem', marginTop:'0.35rem' }}>{fileError}</div>}
          {scanInfo && <div style={{ color:'var(--text-secondary)', fontSize:'0.78rem', marginTop:'0.35rem' }}>{scanInfo}</div>}
        </div>

        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', marginTop:'0.5rem' }}>
          <GlowButton variant="ghost" onClick={onClose}>Cancel</GlowButton>
          <GlowButton onClick={handleSave} loading={saving}>
            {isEdit ? 'Save Changes' : 'Add Certification'}
          </GlowButton>
        </div>
      </div>
    </Modal>
  );
}
