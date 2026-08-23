import io
import pytest

def test_report_lifecycle(client):
    # 1. Register users (competitor & referee)
    client.post(
        "/api/auth/register",
        json={"email": "comp@test.org", "password": "password", "role": "COMPETITOR"}
    )
    client.post(
        "/api/auth/register",
        json={"email": "ref@test.org", "password": "password", "role": "REFEREE"}
    )
    client.post(
        "/api/auth/register",
        json={"email": "manager@test.org", "password": "password", "role": "COMPETITION_MANAGER"}
    )

    # Login competitor
    comp_login = client.post("/api/auth/login", data={"username": "comp@test.org", "password": "password"})
    comp_token = comp_login.json()["access_token"]

    # Login referee
    ref_login = client.post("/api/auth/login", data={"username": "ref@test.org", "password": "password"})
    ref_token = ref_login.json()["access_token"]

    # Login manager
    manager_login = client.post("/api/auth/login", data={"username": "manager@test.org", "password": "password"})
    manager_token = manager_login.json()["access_token"]

    # 2. Seed a category
    cat_res = client.post(
        "/api/categories",
        json={"name": "Robotics & Automation", "description": "Drone systems"},
        headers={"Authorization": f"Bearer {manager_token}"}
    )
    assert cat_res.status_code == 201
    cat_id = cat_res.json()["id"]

    # Seed a criterion template for the category
    crit_res = client.post(
        "/api/criteria",
        json={"category_id": cat_id, "title": "Template Compliance", "description": "Form check", "max_score": 100},
        headers={"Authorization": f"Bearer {manager_token}"}
    )
    assert crit_res.status_code == 201

    # 3. Upload a report
    file_data = io.BytesIO(b"%PDF-1.4 Mock PDF Content")
    upload_res = client.post(
        "/api/reports/upload",
        data={"project_name": "Autonomous Drone V1", "category_id": cat_id},
        files={"file": ("drone_report.pdf", file_data, "application/pdf")},
        headers={"Authorization": f"Bearer {comp_token}"}
    )
    
    assert upload_res.status_code == 201
    report_data = upload_res.json()
    report_id = report_data["id"]
    assert report_data["project_name"] == "Autonomous Drone V1"
    
    # The HTTP response of the upload endpoint returns immediately with "pending"
    assert report_data["status"] == "pending"

    # 4. Get report details as referee
    detail_res = client.get(
        f"/api/reports/{report_id}",
        headers={"Authorization": f"Bearer {ref_token}"}
    )
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["status"] == "analyzed"
    assert detail_data["ai_analysis"] is not None
    assert detail_data["ai_analysis"]["suggested_outcome"] in ["approve", "reject", "revise"]
    assert "languageTemplate" in detail_data["ai_analysis"]["results"]
    
    # 5. Submit referee decision
    decision_res = client.post(
        f"/api/reports/{report_id}/decision",
        json={"outcome": "approve", "final_score": 90, "rationale": "Excellent methodology and clear results."},
        headers={"Authorization": f"Bearer {ref_token}"}
    )
    assert decision_res.status_code == 200
    decision_data = decision_res.json()
    assert decision_data["outcome"] == "approve"
    assert decision_data["final_score"] == 90

    # Verify report status is now "approved"
    status_check_res = client.get(
        f"/api/reports/{report_id}",
        headers={"Authorization": f"Bearer {ref_token}"}
    )
    assert status_check_res.json()["status"] == "approved"
