import recommendations from '../data/recommendations.json';
import users from '../data/users.json';

export const recommendationService = {
  getAll: async (filters = {}) => {
    await new Promise(r => setTimeout(r, 600));
    let data = [...recommendations];
    if (filters.industry && filters.industry !== 'all') {
      data = data.filter(r => r.industry?.toLowerCase().includes(filters.industry.toLowerCase()));
    }
    if (filters.minScore) {
      data = data.filter(r => r.compatibilityScore >= filters.minScore);
    }
    return data;
  },
  getById: async (id) => {
    await new Promise(r => setTimeout(r, 300));
    return recommendations.find(r => r.id === id) || null;
  },
  connect: async (userId) => {
    await new Promise(r => setTimeout(r, 800));
    return { success: true, message: 'Connection request sent!' };
  },
  getAllUsers: async () => {
    await new Promise(r => setTimeout(r, 500));
    return users.filter(u => u.id !== 'current');
  },
};

export default recommendationService;
