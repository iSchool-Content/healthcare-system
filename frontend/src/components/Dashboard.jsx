import { useQuery } from '@tanstack/react-query';
import { api } from '../api/axiosClient';
import { appointmentApi } from '../api/axiosClient';

export default function Dashboard() {
  const { data: patientStats } = useQuery({
    queryKey: ['patientStats'],
    queryFn: () => api.get('/api/patients/stats').then((r) => r.data),
  });

  const { data: apptStats } = useQuery({
    queryKey: ['apptStats'],
    queryFn: () => appointmentApi.get('/api/appointments/stats').then((r) => r.data),
  });

  const { data: records } = useQuery({
    queryKey: ['medicalRecords'],
    queryFn: () => api.get('/api/medical-records').then((r) => r.data),
  });

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="label">Total Patients</div>
          <div className="value">{patientStats?.total ?? '–'}</div>
        </div>
        <div className="stat-card warning">
          <div className="label">Today's Appointments</div>
          <div className="value">{apptStats?.todayCount ?? '–'}</div>
        </div>
        <div className="stat-card">
          <div className="label">Pending Records</div>
          <div className="value">{records?.length ?? '–'}</div>
        </div>
        <div className="stat-card danger">
          <div className="label">Urgent (Critical)</div>
          <div className="value">{patientStats?.critical ?? '–'}</div>
        </div>
        <div className="stat-card success">
          <div className="label">Stable Patients</div>
          <div className="value">{patientStats?.stable ?? '–'}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Appointments</div>
          <div className="value">{apptStats?.total ?? '–'}</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <strong>Recent Medical Records</strong>
        </div>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Diagnosis</th>
              <th>Visit Date</th>
            </tr>
          </thead>
          <tbody>
            {(records || []).slice(0, 5).map((r) => (
              <tr key={r._id}>
                <td>{r.patient?.name || 'N/A'}</td>
                <td>{r.doctor}</td>
                <td>{r.diagnosis}</td>
                <td>{new Date(r.visitDate).toLocaleDateString()}</td>
              </tr>
            ))}
            {!records?.length && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)' }}>No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
