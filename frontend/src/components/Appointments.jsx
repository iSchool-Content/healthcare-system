import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentApi } from '../api/axiosClient';

const EMPTY = { patientName: '', patientId: '', doctor: '', date: '', time: '', type: 'consultation', status: 'scheduled', notes: '' };

export default function Appointments() {
  const qc = useQueryClient();
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentApi.get('/api/appointments').then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data) => appointmentApi.post('/api/appointments', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => appointmentApi.put(`/api/appointments/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => appointmentApi.delete(`/api/appointments/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const openCreate = () => { setForm(EMPTY); setSelected(null); setModal('create'); setError(''); };
  const openEdit = (a) => {
    setForm({
      patientName: a.patientName || '',
      patientId: a.patientId || '',
      doctor: a.doctor || '',
      date: a.date?.slice(0, 10) || '',
      time: a.time || '',
      type: a.type || 'consultation',
      status: a.status || 'scheduled',
      notes: a.notes || '',
    });
    setSelected(a); setModal('edit'); setError('');
  };
  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (modal === 'create') await createMut.mutateAsync(form);
      else await updateMut.mutateAsync({ id: selected._id, data: form });
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving appointment');
    }
  };

  if (isLoading) return <div className="loading">Loading appointments…</div>;

  return (
    <div>
      <h1 className="page-title">Appointments</h1>

      <div className="table-wrap">
        <div className="table-header">
          <span>{appointments.length} appointments</span>
          <button className="btn btn-primary" onClick={openCreate}>+ Book Appointment</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td><strong>{a.patientName}</strong></td>
                <td>{a.doctor}</td>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>{a.time}</td>
                <td style={{ textTransform: 'capitalize' }}>{a.type}</td>
                <td><span className={`badge ${a.status}`}>{a.status}</span></td>
                <td>
                  <div className="actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete?')) deleteMut.mutate(a._id); }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!appointments.length && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)' }}>No appointments found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal === 'create' ? 'Book Appointment' : 'Edit Appointment'}</h3>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient Name</label>
                  <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Patient ID (optional)</label>
                  <input value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} placeholder="MongoDB ObjectId" />
                </div>
              </div>
              <div className="form-group">
                <label>Doctor</label>
                <input value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="scheduled">Scheduled</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modal === 'create' ? 'Book' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
