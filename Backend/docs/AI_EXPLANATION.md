# AI Engine Explanation — How the Recommendation System Works

This document explains the AI/ML logic inside `backend/app/ml/engine.py` in plain language, suitable for a mentor review or internship presentation.

---

## 1. The Problem We're Solving

Given a user's profile (their skills, interests, industry, career goals, and bio), we want to find **other users in the network who are most compatible** — people they are likely to collaborate with, learn from, or mentor.

This is a **content-based filtering** problem: we recommend based on profile content, not on past interactions (unlike collaborative filtering used by Netflix/Spotify).

---

## 2. Step 1 — Build a Text Representation

```python
def build_profile_text(profile):
    skills    = " ".join(profile.get("skills", []))
    interests = " ".join(profile.get("interests", []))
    industry  = profile.get("industry", "")
    goals     = profile.get("career_goals", "")
    bio       = profile.get("bio", "")
    return f"{skills} {interests} {industry} {goals} {bio}".strip()
```

**Why?** TF-IDF works on text. We flatten the structured profile into a single string so the vectorizer can process it.

**Example output:**
> `"Python FastAPI MongoDB Docker Machine Learning Backend Development AI Engineering Software Development Looking to transition to AI/ML engineering..."`

---

## 3. Step 2 — TF-IDF Vectorization

```python
vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform([target_text] + candidate_texts)
```

**What is TF-IDF?**
- **TF (Term Frequency):** How often a word appears in this profile's text
- **IDF (Inverse Document Frequency):** How rare or unique that word is across all profiles
- **Result:** Words that are specific to a profile get high scores; common words like "the", "and" get low scores

**Example:**
- "Python" appears in many profiles → medium IDF weight
- "Penetration Testing" appears in few profiles → high IDF weight → more distinctive

Each profile becomes a **vector in high-dimensional space** where each dimension is a word.

---

## 4. Step 3 — Cosine Similarity

```python
cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
```

**What is cosine similarity?**
- Measures the **angle between two vectors** (not their magnitude)
- Score = **1.0** means vectors point in the same direction (very similar profiles)
- Score = **0.0** means no overlap at all

**Why cosine, not Euclidean distance?**
- Euclidean is sensitive to text length. A longer bio would seem "farther" from a short one.
- Cosine only cares about **direction** (what topics they talk about), not how much they wrote.

---

## 5. Step 4 — Weighted Scoring Formula

Pure TF-IDF similarity can miss structured data like exact skill tags. We blend it with explicit overlap counts:

```python
compatibility_score = (
    sim_score   * 0.40    # TF-IDF Cosine Similarity
  + skill_score * 0.30    # Exact Skill Overlap
  + interest_score * 0.20 # Interest Alignment
  + industry_score * 0.10 # Same Industry Bonus
) * 100
```

| Component | Weight | How It's Calculated |
|-----------|--------|---------------------|
| TF-IDF Cosine Similarity | **40%** | `cosine_similarity(target_vector, candidate_vector)` |
| Skill Overlap | **30%** | `len(target_skills ∩ candidate_skills) / len(target_skills)` |
| Interest Alignment | **20%** | `len(target_interests ∩ candidate_interests) / len(target_interests)` |
| Industry Match | **10%** | `1.0` if same industry, else `0.0` |

**Why these weights?**
- Skills are the strongest signal for professional compatibility (30%)
- TF-IDF captures semantic context including career goals and bio (40%)
- Interests show collaboration potential beyond just technical work (20%)
- Industry is a useful bonus signal but not definitive (10%)

---

## 6. Step 5 — Match Labels and Explanations (Explainable AI)

```python
def get_match_label(score):
    if score >= 75: return "Excellent Match"
    if score >= 55: return "Strong Match"
    if score >= 35: return "Good Match"
    return "Moderate Match"
```

The `match_reason` is built from actual data intersections:
```python
"Shared skills: Python, FastAPI | Shared interests: AI Engineering | Same industry: Software Development"
```

**This makes the AI transparent and trustworthy** — users can see exactly *why* someone was recommended, not just a black-box score.

---

## 7. Complete Example

**Target user (Aarav Sharma):**
- Skills: Python, Django, PostgreSQL
- Interests: Backend Development, Web APIs
- Industry: Software Development

**Candidate (Alice Johnson):**
- Skills: Python, FastAPI, MongoDB, Machine Learning
- Interests: Backend Development, AI Engineering
- Industry: Software Development

**Calculation:**
- `sim_score` (TF-IDF): 0.62 → 40% contribution: 24.8
- `skill_score`: 1/3 shared (Python) → 30% contribution: 10.0
- `interest_score`: 1/2 shared (Backend Development) → 20% contribution: 10.0
- `industry_score`: same industry → 10% contribution: 10.0
- **Total: 54.8 → "Strong Match"**

**Match reason output:**
> `"Shared skills: Python | Shared interests: Backend Development | Same industry: Software Development"`

---

## 8. Why Not Use a Neural Network?

| Approach | Pros | Cons |
|----------|------|------|
| TF-IDF + Cosine (our choice) | Fast, interpretable, no training data needed | Less semantic depth |
| Word2Vec / BERT | Rich semantic understanding | Needs large corpus, slow, not interpretable |
| Collaborative Filtering | Learns from behavior | Needs historical interaction data (cold-start problem) |

Our platform is new — we have **no interaction history** to train on. TF-IDF + cosine similarity is the **ideal solution for a cold-start alumni networking system**: it works immediately from profile data and produces transparent, explainable results.

---

## 9. Mentor Matching — What's Different?

Mentor matching uses the **exact same engine** but pre-filters candidates to `role == "Mentor"` before running TF-IDF. This means:
- Only mentors appear in results
- The same skill/interest/industry scoring applies
- Results are still sorted by compatibility score

---

## 10. Collaboration Prediction — Pairwise Scoring

Instead of comparing one user to all others, the `/collaborate/{candidate_id}` endpoint:
1. Fetches exactly two profiles: the current user and the specified candidate
2. Runs the same scoring formula on that pair
3. Returns a single detailed prediction with the full score breakdown

This is useful for answering: *"How compatible are these two specific people?"*
