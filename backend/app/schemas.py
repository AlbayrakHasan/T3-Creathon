from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    id: str

class CategoryResponse(CategoryBase):
    id: str

    class Config:
        from_attributes = True


# --- Criteria Schemas ---
class CriteriaBase(BaseModel):
    category_id: str
    title: str
    description: Optional[str] = None
    max_score: int = 100

class CriteriaCreate(CriteriaBase):
    id: str

class CriteriaResponse(CriteriaBase):
    id: str

    class Config:
        from_attributes = True


# --- AI Analysis Details ---
class AiCheckResult(BaseModel):
    score: int
    summary: str
    findings: List[str]

class AiAnalysisResponse(BaseModel):
    id: str
    report_id: str
    analyzed_at: datetime
    engine_version: str
    suggested_outcome: str
    suggested_score: int
    rationale: str
    results: Dict[str, AiCheckResult]

    class Config:
        from_attributes = True


# --- Final Decision Schemas ---
class FinalDecisionCreate(BaseModel):
    outcome: str # approve, reject, revise
    final_score: int
    rationale: str

class FinalDecisionResponse(BaseModel):
    id: str
    report_id: str
    referee_id: str
    outcome: str
    final_score: int
    rationale: str
    submitted_at: datetime

    class Config:
        from_attributes = True


# --- Report Schemas ---
class ReportBase(BaseModel):
    project_name: str
    category_id: str

class ReportCreate(ReportBase):
    id: str
    file_path: str
    submitted_by_id: str

class ReportResponse(ReportBase):
    id: str
    status: str
    file_path: str
    submitted_by_id: str
    submission_date: datetime
    ai_analysis: Optional[AiAnalysisResponse] = None
    final_decision: Optional[FinalDecisionResponse] = None

    class Config:
        from_attributes = True


# --- Dashboard Stats Schemas ---
class DashboardStats(BaseModel):
    total_reports: int
    pending_reports: int
    analyzed_reports: int
    approved_reports: int
    rejected_reports: int
    revise_reports: int
    completion_rate: float
