import api from '../config/axios';
import { DashboardResponseDTO, UpdateGoalsRequestDTO } from '../types/dashboard';

export const dashboardService = {
    getDashboardData: async (): Promise<DashboardResponseDTO> => {
        const response = await api.get('/dashboard');
        return response.data;
    },

    updateStudyGoals: async (data: UpdateGoalsRequestDTO): Promise<DashboardResponseDTO> => {
        const response = await api.put('/dashboard/goals', data);
        return response.data;
    }
};
