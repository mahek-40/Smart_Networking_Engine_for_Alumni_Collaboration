/**
 * Transform backend recommendation format to frontend format
 */
export const transformRecommendation = (backendRec) => {
  const profile = backendRec.profile || {};
  
  return {
    id: profile._id || profile.id,
    userId: profile.user_id || profile.userId,
    name: profile.full_name || 'Unknown',
    role: profile.role || 'Alumni',
    company: profile.company || 'Company',
    industry: profile.industry || 'Technology',
    experience: `${profile.experience_years || 0} years`,
    compatibilityScore: Math.round(backendRec.compatibility_score || 0),
    skills: profile.skills || [],
    interests: profile.interests || [],
    sharedSkills: backendRec.skill_overlap || [],
    sharedInterests: backendRec.interest_overlap || [],
    matchReasons: backendRec.match_reasons || [backendRec.match_reason] || [],
    aiInsight: backendRec.match_reason || 'Great match based on profile similarity',
    label: backendRec.label || 'Good Match',
    avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(profile.full_name || 'user')}`,
    isConnected: false,
  };
};

/**
 * Transform backend profile format to frontend format
 */
export const transformProfile = (backendProfile) => {
  return {
    id: backendProfile._id || backendProfile.id,
    userId: backendProfile.user_id || backendProfile.userId,
    name: backendProfile.full_name || 'Unknown',
    full_name: backendProfile.full_name || 'Unknown',
    email: backendProfile.email || '',
    role: backendProfile.role || 'Alumni',
    company: backendProfile.company || 'Company',
    industry: backendProfile.industry || 'Technology',
    experience: `${backendProfile.experience_years || 0} years`,
    experience_years: backendProfile.experience_years || 0,
    skills: backendProfile.skills || [],
    interests: backendProfile.interests || [],
    bio: backendProfile.bio || '',
    careerGoals: backendProfile.career_goals || '',
    career_goals: backendProfile.career_goals || '',
    university: backendProfile.university || '',
    degree: backendProfile.degree || '',
    branch: backendProfile.branch || '',
    graduationYear: backendProfile.graduation_year || null,
    graduation_year: backendProfile.graduation_year || null,
    avatar: `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(backendProfile.full_name || 'user')}`,
  };
};

/**
 * Transform backend project format to frontend format
 */
export const transformProject = (backendProject) => {
  return {
    id: backendProject._id || backendProject.id,
    title: backendProject.title || 'Untitled Project',
    description: backendProject.description || '',
    requiredSkills: backendProject.required_skills || [],
    tags: backendProject.tags || [],
    status: backendProject.status || 'open',
    ownerId: backendProject.owner_id || backendProject.ownerId,
    ownerName: backendProject.owner_name || backendProject.ownerName || 'Unknown',
    members: backendProject.members || [],
    applicants: backendProject.applicants || [],
    memberProfiles: backendProject.member_profiles || [],
    createdAt: backendProject.created_at || backendProject.createdAt,
    updatedAt: backendProject.updated_at || backendProject.updatedAt,
  };
};

/**
 * Transform backend notification format to frontend format
 */
export const transformNotification = (backendNotif) => {
  return {
    id: backendNotif._id || backendNotif.id,
    userId: backendNotif.user_id || backendNotif.userId,
    type: backendNotif.type || 'general',
    fromUserId: backendNotif.from_user_id || backendNotif.fromUserId,
    fromUserName: backendNotif.from_user_name || backendNotif.fromUserName || 'Someone',
    fromUserAvatar: backendNotif.from_user_avatar || backendNotif.fromUserAvatar,
    message: backendNotif.message || '',
    metadata: backendNotif.metadata || {},
    read: backendNotif.read || false,
    createdAt: backendNotif.created_at || backendNotif.createdAt,
  };
};
