"""
Projects Router — Collaboration project management.
"""
from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field

from app.auth.deps import get_current_user
from app.database.connection import get_collection
from app.models.user import UserResponse
from app.utils.responses import success_response, error_response, paginated_response
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/projects", tags=["Projects"])


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    required_skills: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    status: str = Field(default="open")  # open, in_progress, completed


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None


@router.post(
    "/",
    summary="Create a new project",
    description="Create a new collaboration project",
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    project_data: ProjectCreate,
    current_user: UserResponse = Depends(get_current_user),
):
    projects_col = get_collection("projects")
    
    project = {
        "title": project_data.title,
        "description": project_data.description,
        "required_skills": project_data.required_skills,
        "tags": project_data.tags,
        "status": project_data.status,
        "owner_id": ObjectId(current_user.id),
        "owner_name": current_user.full_name,
        "members": [ObjectId(current_user.id)],
        "applicants": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    
    result = await projects_col.insert_one(project)
    
    logger.info("Project created | project_id=%s | owner=%s", result.inserted_id, current_user.id)
    return success_response(
        data={"project_id": str(result.inserted_id)},
        message="Project created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.get(
    "/",
    summary="Get all projects",
    description="Get all collaboration projects with pagination and filters",
)
async def get_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, description="Filter by status: open, in_progress, completed"),
    skills: Optional[str] = Query(None, description="Comma-separated skills to filter by"),
    current_user: UserResponse = Depends(get_current_user),
):
    projects_col = get_collection("projects")
    
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    if skills:
        skill_list = [s.strip() for s in skills.split(",") if s.strip()]
        query["required_skills"] = {"$in": skill_list}
    
    total = await projects_col.count_documents(query)
    skip = (page - 1) * page_size
    
    cursor = projects_col.find(query).sort("created_at", -1).skip(skip).limit(page_size)
    projects = await cursor.to_list(length=page_size)
    
    # Serialize
    result = []
    for proj in projects:
        proj["_id"] = str(proj["_id"])
        proj["id"] = proj["_id"]
        proj["owner_id"] = str(proj["owner_id"])
        proj["members"] = [str(m) for m in proj.get("members", [])]
        proj["applicants"] = [str(a) for a in proj.get("applicants", [])]
        
        if "created_at" in proj and hasattr(proj["created_at"], "isoformat"):
            proj["created_at"] = proj["created_at"].isoformat()
        if "updated_at" in proj and hasattr(proj["updated_at"], "isoformat"):
            proj["updated_at"] = proj["updated_at"].isoformat()
        
        result.append(proj)
    
    return paginated_response(
        data=result,
        total=total,
        page=page,
        page_size=page_size,
        message=f"Found {total} projects"
    )


@router.get(
    "/{project_id}",
    summary="Get project by ID",
    description="Get detailed information about a specific project",
)
async def get_project_by_id(
    project_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    projects_col = get_collection("projects")
    profiles_col = get_collection("profiles")
    
    try:
        proj_obj_id = ObjectId(project_id)
    except Exception:
        return error_response("Invalid project ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    project = await projects_col.find_one({"_id": proj_obj_id})
    
    if not project:
        return error_response("Project not found", status_code=status.HTTP_404_NOT_FOUND)
    
    # Serialize
    project["_id"] = str(project["_id"])
    project["id"] = project["_id"]
    project["owner_id"] = str(project["owner_id"])
    project["members"] = [str(m) for m in project.get("members", [])]
    project["applicants"] = [str(a) for a in project.get("applicants", [])]
    
    if "created_at" in project and hasattr(project["created_at"], "isoformat"):
        project["created_at"] = project["created_at"].isoformat()
    if "updated_at" in project and hasattr(project["updated_at"], "isoformat"):
        project["updated_at"] = project["updated_at"].isoformat()
    
    # Fetch member profiles
    member_profiles = []
    for member_id_str in project["members"]:
        profile = await profiles_col.find_one({"user_id": ObjectId(member_id_str)})
        if profile:
            member_profiles.append({
                "user_id": str(profile["user_id"]),
                "full_name": profile.get("full_name", "Unknown"),
                "role": profile.get("role", "Member"),
                "skills": profile.get("skills", []),
            })
    
    project["member_profiles"] = member_profiles
    
    return success_response(data=project, message="Project retrieved successfully")


@router.put(
    "/{project_id}",
    summary="Update project",
    description="Update project details (owner only)",
)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: UserResponse = Depends(get_current_user),
):
    projects_col = get_collection("projects")
    
    try:
        proj_obj_id = ObjectId(project_id)
    except Exception:
        return error_response("Invalid project ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    project = await projects_col.find_one({"_id": proj_obj_id})
    
    if not project:
        return error_response("Project not found", status_code=status.HTTP_404_NOT_FOUND)
    
    if str(project["owner_id"]) != current_user.id:
        return error_response("Only project owner can update the project", status_code=status.HTTP_403_FORBIDDEN)
    
    update_dict = {k: v for k, v in project_data.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    await projects_col.update_one(
        {"_id": proj_obj_id},
        {"$set": update_dict}
    )
    
    logger.info("Project updated | project_id=%s", project_id)
    return success_response(message="Project updated successfully")


@router.post(
    "/{project_id}/apply",
    summary="Apply to join project",
    description="Submit an application to join a project",
)
async def apply_to_project(
    project_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    projects_col = get_collection("projects")
    notifications_col = get_collection("notifications")
    
    try:
        proj_obj_id = ObjectId(project_id)
        current_obj_id = ObjectId(current_user.id)
    except Exception:
        return error_response("Invalid project ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    project = await projects_col.find_one({"_id": proj_obj_id})
    
    if not project:
        return error_response("Project not found", status_code=status.HTTP_404_NOT_FOUND)
    
    # Check if already a member
    if current_obj_id in project.get("members", []):
        return error_response("You are already a member of this project", status_code=status.HTTP_400_BAD_REQUEST)
    
    # Check if already applied
    if current_obj_id in project.get("applicants", []):
        return error_response("You have already applied to this project", status_code=status.HTTP_400_BAD_REQUEST)
    
    # Add to applicants
    await projects_col.update_one(
        {"_id": proj_obj_id},
        {"$push": {"applicants": current_obj_id}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    # Create notification for project owner
    notification = {
        "user_id": project["owner_id"],
        "type": "project_application",
        "from_user_id": current_obj_id,
        "message": f"{current_user.full_name} applied to join your project: {project['title']}",
        "metadata": {"project_id": str(proj_obj_id)},
        "read": False,
        "created_at": datetime.utcnow(),
    }
    await notifications_col.insert_one(notification)
    
    logger.info("Project application submitted | project_id=%s | user_id=%s", project_id, current_user.id)
    return success_response(message="Application submitted successfully")


@router.put(
    "/{project_id}/accept/{applicant_id}",
    summary="Accept project application",
    description="Accept an applicant to join the project (owner only)",
)
async def accept_project_application(
    project_id: str,
    applicant_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    projects_col = get_collection("projects")
    notifications_col = get_collection("notifications")
    
    try:
        proj_obj_id = ObjectId(project_id)
        applicant_obj_id = ObjectId(applicant_id)
    except Exception:
        return error_response("Invalid ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    project = await projects_col.find_one({"_id": proj_obj_id})
    
    if not project:
        return error_response("Project not found", status_code=status.HTTP_404_NOT_FOUND)
    
    if str(project["owner_id"]) != current_user.id:
        return error_response("Only project owner can accept applications", status_code=status.HTTP_403_FORBIDDEN)
    
    if applicant_obj_id not in project.get("applicants", []):
        return error_response("Applicant not found", status_code=status.HTTP_404_NOT_FOUND)
    
    # Move from applicants to members
    await projects_col.update_one(
        {"_id": proj_obj_id},
        {
            "$pull": {"applicants": applicant_obj_id},
            "$push": {"members": applicant_obj_id},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    # Create notification for applicant
    notification = {
        "user_id": applicant_obj_id,
        "type": "project_accepted",
        "from_user_id": ObjectId(current_user.id),
        "message": f"Your application to join '{project['title']}' was accepted!",
        "metadata": {"project_id": str(proj_obj_id)},
        "read": False,
        "created_at": datetime.utcnow(),
    }
    await notifications_col.insert_one(notification)
    
    logger.info("Project application accepted | project_id=%s | applicant_id=%s", project_id, applicant_id)
    return success_response(message="Application accepted successfully")


@router.put(
    "/{project_id}/reject/{applicant_id}",
    summary="Reject project application",
    description="Reject an applicant (owner only)",
)
async def reject_project_application(
    project_id: str,
    applicant_id: str,
    current_user: UserResponse = Depends(get_current_user),
):
    projects_col = get_collection("projects")
    
    try:
        proj_obj_id = ObjectId(project_id)
        applicant_obj_id = ObjectId(applicant_id)
    except Exception:
        return error_response("Invalid ID format", status_code=status.HTTP_400_BAD_REQUEST)
    
    project = await projects_col.find_one({"_id": proj_obj_id})
    
    if not project:
        return error_response("Project not found", status_code=status.HTTP_404_NOT_FOUND)
    
    if str(project["owner_id"]) != current_user.id:
        return error_response("Only project owner can reject applications", status_code=status.HTTP_403_FORBIDDEN)
    
    # Remove from applicants
    await projects_col.update_one(
        {"_id": proj_obj_id},
        {"$pull": {"applicants": applicant_obj_id}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    logger.info("Project application rejected | project_id=%s | applicant_id=%s", project_id, applicant_id)
    return success_response(message="Application rejected successfully")


@router.get(
    "/my/projects",
    summary="Get my projects",
    description="Get projects owned by or joined by the current user",
)
async def get_my_projects(
    current_user: UserResponse = Depends(get_current_user),
):
    projects_col = get_collection("projects")
    
    current_obj_id = ObjectId(current_user.id)
    
    # Projects where I'm the owner or a member
    cursor = projects_col.find({
        "$or": [
            {"owner_id": current_obj_id},
            {"members": current_obj_id}
        ]
    }).sort("created_at", -1)
    
    projects = await cursor.to_list(length=100)
    
    # Serialize
    result = []
    for proj in projects:
        proj["_id"] = str(proj["_id"])
        proj["id"] = proj["_id"]
        proj["owner_id"] = str(proj["owner_id"])
        proj["members"] = [str(m) for m in proj.get("members", [])]
        proj["applicants"] = [str(a) for a in proj.get("applicants", [])]
        
        if "created_at" in proj and hasattr(proj["created_at"], "isoformat"):
            proj["created_at"] = proj["created_at"].isoformat()
        if "updated_at" in proj and hasattr(proj["updated_at"], "isoformat"):
            proj["updated_at"] = proj["updated_at"].isoformat()
        
        result.append(proj)
    
    return success_response(data=result, message=f"Found {len(result)} projects")
