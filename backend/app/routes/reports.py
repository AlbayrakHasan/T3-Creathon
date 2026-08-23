import json
import os
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from .. import models, schemas, auth
from ..services import ai

router = APIRouter(prefix="/api/reports", tags=["Reports"])

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def run_background_analysis(report_id: str, file_path: str, db: Session):
    try:
        # Get category information
        categories = db.query(models.Category).all()
        categories_dict = [{"id": c.id, "name": c.name} for c in categories]
        
        # Get existing report files (for similarity checking)
        other_reports = db.query(models.Report).filter(models.Report.id != report_id).all()
        existing_paths = [r.file_path for r in other_reports if os.path.exists(r.file_path)]
        
        # Get criteria templates for this report's category
        report = db.query(models.Report).filter(models.Report.id == report_id).first()
        criteria = db.query(models.Criteria).filter(models.Criteria.category_id == report.category_id).all()
        criteria_dict = [{"id": cr.id, "title": cr.title, "max_score": cr.max_score} for cr in criteria]
        
        # Run AI analysis
        analysis_data = ai.run_full_analysis(
            file_path=file_path,
            db_categories=categories_dict,
            existing_files=existing_paths,
            criteria_list=criteria_dict
        )
        
        # Save analysis results
        db_analysis = models.AiAnalysis(
            id=str(uuid.uuid4()),
            report_id=report_id,
            analyzed_at=datetime.datetime.utcnow(),
            engine_version="eval-engine v1.0",
            suggested_outcome=analysis_data["suggested_outcome"],
            suggested_score=analysis_data["suggested_score"],
            rationale=analysis_data["rationale"],
            
            language_template_score=analysis_data["language_template"]["score"],
            language_template_summary=analysis_data["language_template"]["summary"],
            language_template_findings=json.dumps(analysis_data["language_template"]["findings"]),
            
            content_heading_score=analysis_data["content_heading"]["score"],
            content_heading_summary=analysis_data["content_heading"]["summary"],
            content_heading_findings=json.dumps(analysis_data["content_heading"]["findings"]),
            
            category_match_score=analysis_data["category_match"]["score"],
            category_match_summary=analysis_data["category_match"]["summary"],
            category_match_findings=json.dumps(analysis_data["category_match"]["findings"]),
            
            similarity_score=analysis_data["similarity"]["score"],
            similarity_summary=analysis_data["similarity"]["summary"],
            similarity_findings=json.dumps(analysis_data["similarity"]["findings"])
        )
        
        db.add(db_analysis)
        
        # Update report status to analyzed
        report.status = "analyzed"
        db.commit()
    except Exception as e:
        print(f"Error analyzing report {report_id}: {str(e)}")
        # In a real app we'd log this, and set report status to error
        report = db.query(models.Report).filter(models.Report.id == report_id).first()
        if report:
            report.status = "error"
            db.commit()


@router.post("/upload", response_model=schemas.ReportResponse, status_code=status.HTTP_201_CREATED)
async def upload_report(
    background_tasks: BackgroundTasks,
    project_name: str = Form(...),
    category_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["COMPETITION_MANAGER", "COMPETITOR"]))
):
    # Verify category
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
        
    # Check file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".doc", ".docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Upload a PDF or Word document."
        )
        
    report_id = f"RPT-2026-{str(uuid.uuid4())[:6].upper()}"
    file_path = os.path.join(UPLOAD_DIR, f"{report_id}{ext}")
    
    # Save file to disk
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # Create Report record (status = pending)
    db_report = models.Report(
        id=report_id,
        project_name=project_name,
        category_id=category_id,
        status="pending",
        file_path=file_path,
        submitted_by_id=current_user.id,
        submission_date=datetime.datetime.utcnow()
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    # Run analysis in background
    background_tasks.add_task(run_background_analysis, report_id, file_path, db)
    
    return db_report


@router.get("", response_model=List[schemas.ReportResponse])
def list_reports(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Report)
    
    # Standard role filtering: Competitors only see their own submissions
    if current_user.role == "COMPETITOR":
        query = query.filter(models.Report.submitted_by_id == current_user.id)
        
    if status:
        query = query.filter(models.Report.status == status)
        
    return query.all()


@router.get("/{report_id}", response_model=schemas.ReportResponse)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    # Competitors can only view their own reports
    if current_user.role == "COMPETITOR" and report.submitted_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this report."
        )
        
    # Before returning, format AI findings lists from serialized JSON string in db to python list
    # The Pydantic model (schemas.AiAnalysisResponse) expect results to contain findings List[str]
    # Pydantic handles validation if we inject it
    if report.ai_analysis:
        analysis = report.ai_analysis
        # Construct dynamic results dict for API
        results = {
            "languageTemplate": {
                "score": analysis.language_template_score,
                "summary": analysis.language_template_summary,
                "findings": json.loads(analysis.language_template_findings) if analysis.language_template_findings else []
            },
            "contentHeading": {
                "score": analysis.content_heading_score,
                "summary": analysis.content_heading_summary,
                "findings": json.loads(analysis.content_heading_findings) if analysis.content_heading_findings else []
            },
            "categoryMatch": {
                "score": analysis.category_match_score,
                "summary": analysis.category_match_summary,
                "findings": json.loads(analysis.category_match_findings) if analysis.category_match_findings else []
            },
            "similarity": {
                "score": analysis.similarity_score,
                "summary": analysis.similarity_summary,
                "findings": json.loads(analysis.similarity_findings) if analysis.similarity_findings else []
            }
        }
        # Attach dynamic results field for schema serialization
        setattr(report.ai_analysis, 'results', results)
        
    return report


@router.post("/{report_id}/decision", response_model=schemas.FinalDecisionResponse)
def submit_decision(
    report_id: str,
    decision_in: schemas.FinalDecisionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["REFEREE"]))
):
    # Verify report exists
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    # Ensure it's analyzed first
    if report.status == "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Report must be analyzed by AI before referee decision can be made."
        )
        
    # Check if decision already exists
    existing_decision = db.query(models.FinalDecision).filter(models.FinalDecision.report_id == report_id).first()
    if existing_decision:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A decision has already been submitted for this report."
        )
        
    # Create decision
    decision_id = str(uuid.uuid4())
    db_decision = models.FinalDecision(
        id=decision_id,
        report_id=report_id,
        referee_id=current_user.id,
        outcome=decision_in.outcome,
        final_score=decision_in.final_score,
        rationale=decision_in.rationale,
        submitted_at=datetime.datetime.utcnow()
    )
    
    # Update report status
    report.status = decision_in.outcome # approve, reject, revise -> maps to status
    if decision_in.outcome == "approve":
        report.status = "approved"
    elif decision_in.outcome == "reject":
        report.status = "rejected"
        
    db.add(db_decision)
    db.commit()
    db.refresh(db_decision)
    return db_decision
