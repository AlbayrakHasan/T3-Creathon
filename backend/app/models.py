import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # COMPETITION_MANAGER, REFEREE, COMPETITOR, EVALUATION_MANAGER
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    reports = relationship("Report", back_populates="submitted_by")
    decisions = relationship("FinalDecision", back_populates="referee")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    reports = relationship("Report", back_populates="category")
    criteria_list = relationship("Criteria", back_populates="category")


class Criteria(Base):
    __tablename__ = "criteria"

    id = Column(String, primary_key=True, index=True)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    max_score = Column(Integer, default=100)

    # Relationships
    category = relationship("Category", back_populates="criteria_list")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True)
    project_name = Column(String, nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    status = Column(String, default="pending") # pending, analyzed, approved, rejected, revise
    file_path = Column(String, nullable=False)
    submitted_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    submission_date = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    submitted_by = relationship("User", back_populates="reports")
    category = relationship("Category", back_populates="reports")
    ai_analysis = relationship("AiAnalysis", back_populates="report", uselist=False)
    final_decision = relationship("FinalDecision", back_populates="report", uselist=False)


class AiAnalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("reports.id"), unique=True, nullable=False)
    analyzed_at = Column(DateTime, default=datetime.datetime.utcnow)
    engine_version = Column(String, default="eval-engine v1.0")
    suggested_outcome = Column(String, nullable=False) # approve, reject, revise
    suggested_score = Column(Integer, nullable=False)
    rationale = Column(Text, nullable=False)

    # Details
    language_template_score = Column(Integer, default=0)
    language_template_summary = Column(Text, nullable=True)
    language_template_findings = Column(Text, nullable=True) # JSON string

    content_heading_score = Column(Integer, default=0)
    content_heading_summary = Column(Text, nullable=True)
    content_heading_findings = Column(Text, nullable=True) # JSON string

    category_match_score = Column(Integer, default=0)
    category_match_summary = Column(Text, nullable=True)
    category_match_findings = Column(Text, nullable=True) # JSON string

    similarity_score = Column(Integer, default=0)
    similarity_summary = Column(Text, nullable=True)
    similarity_findings = Column(Text, nullable=True) # JSON string

    # Relationships
    report = relationship("Report", back_populates="ai_analysis")


class FinalDecision(Base):
    __tablename__ = "final_decisions"

    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("reports.id"), unique=True, nullable=False)
    referee_id = Column(String, ForeignKey("users.id"), nullable=False)
    outcome = Column(String, nullable=False) # approve, reject, revise
    final_score = Column(Integer, nullable=False)
    rationale = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    report = relationship("Report", back_populates="final_decision")
    referee = relationship("User", back_populates="decisions")
