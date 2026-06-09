import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axiosClient';

export const usePatients = () =>
  useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/api/patients').then((r) => r.data),
  });

export const usePatientStats = () =>
  useQuery({
    queryKey: ['patientStats'],
    queryFn: () => api.get('/api/patients/stats').then((r) => r.data),
  });

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/api/patients', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  });
};

export const useUpdatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/api/patients/${id}`, data).then((r) => r.data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['patients'] });
      const prev = qc.getQueryData(['patients']);
      qc.setQueryData(['patients'], (old) =>
        old ? old.map((p) => (p._id === id ? { ...p, ...data } : p)) : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['patients'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  });
};

export const useDeletePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/api/patients/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  });
};
