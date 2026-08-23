from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas, auth

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.RoleChecker(["COMPETITION_MANAGER", "EVALUATION_MANAGER"]))
):
    total = db.query(models.Report).count()
    pending = db.query(models.Report).filter(models.Report.status == "pending").count()
    analyzed = db.query(models.Report).filter(models.Report.status == "analyzed").count()
    approved = db.query(models.Report).filter(models.Report.status == "approved").count()
    rejected = db.query(models.Report).filter(models.Report.status == "rejected").count()
    revise = db.query(models.Report).filter(models.Report.status == "revise").count()
    
    # Completion rate: proportion of reports with final decisions (approved + rejected + revise) over total reports
    completed = approved + rejected + revise
    rate = (completed / total * 100.0) if total > 0 else 0.0
    
    return {
        "total_reports": total,
        "pending_reports": pending,
        "analyzed_reports": analyzed,
        "approved_reports": approved,
        "rejected_reports": rejected,
        "revise_reports": revise,
        "completion_rate": round(rate, 2)
    }
