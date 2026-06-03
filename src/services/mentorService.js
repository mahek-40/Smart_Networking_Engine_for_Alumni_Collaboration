import mentors from '../data/mentors.json';

export const mentorService = {
  getAll: async (filters = {}) => {
    await new Promise(r => setTimeout(r, 600));
    let data = [...mentors];
    if (filters.industry && filters.industry !== 'all') {
      data = data.filter(m => m.industry?.toLowerCase().includes(filters.industry.toLowerCase()));
    }
    if (filters.minRating) {
      data = data.filter(m => m.rating >= filters.minRating);
    }
    data.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return data;
  },
  requestMentorship: async (mentorId) => {
    await new Promise(r => setTimeout(r, 1000));
    return { success: true, message: 'Mentorship request sent! You will hear back within 48 hours.' };
  },
};

export default mentorService;
