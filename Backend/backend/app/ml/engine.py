"""
AI Recommendation Engine — TF-IDF + Cosine Similarity + Weighted Scoring.

Algorithm overview
------------------
1. Build a text representation for every profile from:
   skills + interests + industry + career_goals + bio

2. TF-IDF vectorize all texts and compute cosine similarity between
   the target profile and every candidate.

3. Combine with explicit overlap scores:
   - Skill overlap  : |target ∩ candidate skills|  / |target skills|
   - Interest overlap: |target ∩ candidate interests| / |target interests|
   - Industry match : 1.0 if same industry else 0.0

4. Weighted final score (0–100):
   Cosine Similarity × 0.40  +  Skill Overlap × 0.30
   + Interest Overlap × 0.20  +  Industry Match × 0.10

5. Each result includes:
   - compatibility_score : float 0-100
   - label              : Excellent / Strong / Good / Moderate Match
   - match_reason       : human-readable explanation
   - score_breakdown    : per-component scores for transparency
   - skill_overlap      : list of shared skills
   - interest_overlap   : list of shared interests
"""
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Optional


def build_profile_text(profile: Dict[str, Any]) -> str:
    """Concatenate all text fields of a profile into a single string for TF-IDF."""
    skills = " ".join(profile.get("skills", []) or [])
    interests = " ".join(profile.get("interests", []) or [])
    industry = profile.get("industry") or ""
    goals = profile.get("career_goals") or ""
    bio = profile.get("bio") or ""
    return f"{skills} {interests} {industry} {goals} {bio}".strip()


def get_match_label(score: float) -> str:
    """Map a numeric score (0–100) to a human-readable match quality label."""
    if score >= 75:
        return "Excellent Match"
    if score >= 55:
        return "Strong Match"
    if score >= 35:
        return "Good Match"
    return "Moderate Match"


def build_match_reason(
    common_skills: List[str],
    common_interests: List[str],
    same_industry: bool,
    industry_name: Optional[str] = None,
) -> str:
    """Compose a plain-English explanation of why a candidate was recommended."""
    reasons = []
    if common_skills:
        skills_str = ", ".join(common_skills[:4])
        reasons.append(f"Shared skills: {skills_str}")
    if common_interests:
        interests_str = ", ".join(common_interests[:4])
        reasons.append(f"Shared interests: {interests_str}")
    if same_industry and industry_name:
        reasons.append(f"Same industry: {industry_name}")
    return " | ".join(reasons) if reasons else "Recommended based on overall profile similarity."


def calculate_recommendations(
    target_profile: Dict[str, Any],
    candidate_profiles: List[Dict[str, Any]],
    top_n: int = 5,
) -> List[Dict[str, Any]]:
    """
    Score every candidate profile against the target using TF-IDF + weighted scoring.

    Parameters
    ----------
    target_profile     : The logged-in user's profile dict.
    candidate_profiles : Other users' profile dicts to compare against.
    top_n              : Maximum number of results to return.

    Returns
    -------
    List of dicts sorted by compatibility_score DESC, each containing:
      profile, compatibility_score, label, match_reason,
      score_breakdown, skill_overlap, interest_overlap.
    """
    if not candidate_profiles:
        return []

    # ── Build text corpus ─────────────────────────────────────────────────
    target_text = build_profile_text(target_profile)
    candidate_texts = [build_profile_text(p) for p in candidate_profiles]
    all_texts = [target_text] + candidate_texts

    # Guard: if every text is empty, fall back to zero cosine similarity
    non_empty = [t for t in all_texts if t.strip()]
    if len(non_empty) < 2:
        cosine_sim = np.zeros(len(candidate_profiles))
    else:
        try:
            vectorizer = TfidfVectorizer(stop_words="english", min_df=1)
            tfidf_matrix = vectorizer.fit_transform(all_texts)
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        except Exception:
            cosine_sim = np.zeros(len(candidate_profiles))

    # ── Pre-compute target sets ───────────────────────────────────────────
    target_skills_lc = {s.strip().lower() for s in (target_profile.get("skills") or []) if s.strip()}
    target_interests_lc = {i.strip().lower() for i in (target_profile.get("interests") or []) if i.strip()}
    target_industry_lc = (target_profile.get("industry") or "").strip().lower()

    # Original-casing maps for display
    target_skills_orig = {s.strip().lower(): s.strip() for s in (target_profile.get("skills") or []) if s.strip()}
    target_interests_orig = {i.strip().lower(): i.strip() for i in (target_profile.get("interests") or []) if i.strip()}

    # ── Score each candidate ──────────────────────────────────────────────
    scored: List[Dict[str, Any]] = []

    for idx, candidate in enumerate(candidate_profiles):
        cand_skills_lc = {s.strip().lower() for s in (candidate.get("skills") or []) if s.strip()}
        cand_interests_lc = {i.strip().lower() for i in (candidate.get("interests") or []) if i.strip()}
        cand_industry_lc = (candidate.get("industry") or "").strip().lower()

        # Component 1: TF-IDF cosine similarity
        sim_score = float(cosine_sim[idx])

        # Component 2: Skill overlap
        common_skills_lc = target_skills_lc & cand_skills_lc
        common_skills = sorted(target_skills_orig[k] for k in common_skills_lc)
        skill_score = len(common_skills_lc) / max(len(target_skills_lc), 1)

        # Component 3: Interest overlap
        common_interests_lc = target_interests_lc & cand_interests_lc
        common_interests = sorted(target_interests_orig[k] for k in common_interests_lc)
        interest_score = len(common_interests_lc) / max(len(target_interests_lc), 1)

        # Component 4: Industry match
        same_industry = bool(target_industry_lc and target_industry_lc == cand_industry_lc)
        industry_score = 1.0 if same_industry else 0.0

        # ── Weighted formula ─────────────────────────────────────────────
        # TF-IDF 40% | Skills 30% | Interests 20% | Industry 10%
        weighted = (
            sim_score * 0.40
            + skill_score * 0.30
            + interest_score * 0.20
            + industry_score * 0.10
        )
        compatibility_score = min(round(weighted * 100, 1), 100.0)
        label = get_match_label(compatibility_score)
        match_reason = build_match_reason(
            common_skills,
            common_interests,
            same_industry,
            candidate.get("industry") if same_industry else None,
        )

        scored.append({
            "profile": candidate,
            "compatibility_score": compatibility_score,
            "label": label,
            "match_reason": match_reason,
            "score_breakdown": {
                "tfidf_similarity": round(sim_score * 100, 1),
                "skill_overlap_score": round(skill_score * 100, 1),
                "interest_overlap_score": round(interest_score * 100, 1),
                "industry_match_score": round(industry_score * 100, 1),
            },
            "skill_overlap": common_skills,
            "interest_overlap": common_interests,
        })

    scored.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return scored[:top_n]
