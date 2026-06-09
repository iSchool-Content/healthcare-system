import { useState } from 'react';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '../hooks/usePatients';

const EMPTY = { name: '', age: '', gender: 'male', phone: '', email: '', status: 'stable', bloodType: '', allergies: '' };

export default function Patients() {
  const { data: patients = [], isLoading } = usePatients();
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const openCreate = () => { setForm(EMPTY); setSelected(null); setModal('create'); setError(''); };
  const openEdit = (p) => {
    setForm({ ...p, age: String(p.age), allergies: (p.allergies || []).join(', ') });
    setSelected(p);
    setModal('edit');
    setError('');
  };
  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, age: Number(form.age), allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()) : [] };
    try {
      if (modal === 'create') {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync({ id: selected._id, data: payload });
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving patient');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient?')) return;
    await deleteMutation.mutateAsync(id);
  };

  const handleStatusChange = (id, status) => {
    updateMutation.mutate({ id, data: { status } });
  };

  if (isLoading) return <div className="loading">Loading patients…</div>;

  return (
    <div>
      <h1 className="page-title">Patients</h1>

      <div className="table-wrap">
        <div className="table-header">
          <span>{patients.length} patients</span>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Patient</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.name}</strong></td>
                <td>{p.age}</td>
                <td style={{ textTransform: 'capitalize' }}>{p.gender}</td>
                <td>{p.phone}</td>
                <td>
                  <select
                    className={`badge ${p.status}`}
                    value={p.status}
                    onChange={(e) => handleStatusChange(p._id, e.target.value)}
                    style={{ border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    <option value="stable">stable</option>
                    <option value="good">good</option>
                    <option value="critical">critical</option>
                  </select>
                </td>
                <td>
                  <div className="actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!patients.length && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>No patients found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal === 'create' ? 'Add Patient' : 'Edit Patient'}</h3>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required min={0} max={150} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="stable">Stable</option>
                    <option value="good">Good</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Blood Type</label>
                  <input value={form.bloodType} onChange={(e) => setForm({ ...form, bloodType: e.target.value })} placeholder="A+" />
                </div>
                <div className="form-group">
                  <label>Allergies (comma-separated)</label>
                  <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="penicillin, aspirin" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {modal === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
