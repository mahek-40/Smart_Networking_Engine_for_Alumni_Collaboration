import analytics from '../data/analytics.json';

export const analyticsService = {
  getAll: async () => {
    await new Promise(r => setTimeout(r, 500));
    return analytics;
  },
  getKPIs: async () => {
    await new Promise(r => setTimeout(r, 300));
    return analytics.kpis;
  },
  getProfileViews: async () => {
    await new Promise(r => setTimeout(r, 400));
    return analytics.profileViews;
  },
};

export default analyticsService;
