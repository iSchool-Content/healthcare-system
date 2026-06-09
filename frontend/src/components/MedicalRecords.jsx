import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axiosClient';

const EMPTY = { patientId: '', doctor: '', diagnosis: '', treatment: '', notes: '', visitDate: '' };

export default function MedicalRecords() {
  const qc = useQueryClient();
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['medicalRecords'],
    queryFn: () => api.get('/api/medical-records').then((r) => r.data),
  });
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/api/patients').then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data) => api.post('/api/medical-records', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicalRecords'] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/medical-records/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicalRecords'] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/api/medical-records/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medicalRecords'] }),
  });

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const openCreate = () => { setForm(EMPTY); setSelected(null); setModal('create'); setError(''); };
  const openEdit = (r) => {
    setForm({ ...r, patientId: r.patient?._id || r.patient, visitDate: r.visitDate?.slice(0, 10) });
    setSelected(r); setModal('edit'); setError('');
  };
  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, patient: form.patientId };
    try {
      if (modal === 'create') await createMut.mutateAsync(payload);
      else await updateMut.mutateAsync({ id: selected._id, data: payload });
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving record');
    }
  };

  if (isLoading) return <div className="loading">Loading medical records…</div>;

  return (
    <div>
      <h1 className="page-title">Medical Records</h1>

      <div className="table-wrap">
        <div className="table-header">
          <span>{records.length} records</span>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Record</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Treatment</th><th>Visit Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.patient?.name || 'N/A'}</strong></td>
                <td>{r.doctor}</td>
                <td>{r.diagnosis}</td>
                <td>{r.treatment}</td>
                <td>{new Date(r.visitDate).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(r._id); }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)' }}>No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal === 'create' ? 'Add Medical Record' : 'Edit Record'}</h3>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient</label>
                  <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required>
                    <option value="">— Select Patient —</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Doctor</label>
                  <input value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Diagnosis</label>
                <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Treatment</label>
                <input value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <div className="form-group">
                <label>Visit Date</label>
                <input type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal === 'create' ? 'Create' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
