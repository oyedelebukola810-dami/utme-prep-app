import sys
import os
import unittest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

# Add backend directory to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.db.session import SessionLocal, init_db
from app.models.user import User
from app.models.subject import Subject
from app.models.question import Question
from app.core.security import get_password_hash, create_access_token

client = TestClient(app)

class TestAdminQuestionManagement(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.db = SessionLocal()

        # Seed subjects if empty
        if cls.db.query(Subject).count() == 0:
            s1 = Subject(code="ENG", name="Use of English", description="English language test")
            s2 = Subject(code="MTH", name="Mathematics", description="Mathematics test")
            cls.db.add_all([s1, s2])
            cls.db.commit()

        cls.eng_subject = cls.db.query(Subject).filter(Subject.code == "ENG").first()
        cls.mth_subject = cls.db.query(Subject).filter(Subject.code == "MTH").first()

        # Create Candidate User (Non-Admin)
        cls.cand_email = f"cand_test_{int(datetime.now(timezone.utc).timestamp())}@utmeprep.ng"
        cand = User(
            email=cls.cand_email,
            full_name="Candidate Student",
            hashed_password=get_password_hash("StudentPass123!"),
            is_active=True,
            is_verified=True,
            is_admin=False
        )
        cls.db.add(cand)

        # Create Admin User
        cls.admin_email = f"admin_test_{int(datetime.now(timezone.utc).timestamp())}@utmeprep.ng"
        admin = User(
            email=cls.admin_email,
            full_name="Admin Officer",
            hashed_password=get_password_hash("AdminPass123!"),
            is_active=True,
            is_verified=True,
            is_admin=True
        )
        cls.db.add(admin)
        cls.db.commit()

        cls.cand_token = create_access_token(data={"sub": cand.email, "id": cand.id})
        cls.admin_token = create_access_token(data={"sub": admin.email, "id": admin.id})

    @classmethod
    def tearDownClass(cls):
        # Clean up test users and test questions created during test suite
        cls.db.query(Question).filter(Question.question_text.ilike("%TEST_RUN_%")).delete(synchronize_session=False)
        cls.db.query(User).filter(User.email == cls.cand_email).delete()
        cls.db.query(User).filter(User.email == cls.admin_email).delete()
        cls.db.commit()
        cls.db.close()

    def test_01_admin_authorization_enforcement(self):
        """Unauthenticated and Candidate non-admin users must be rejected with 401/403"""
        # Unauthenticated request
        res1 = client.get("/api/v1/admin/questions/stats")
        self.assertEqual(res1.status_code, 401)

        # Candidate user (Non-admin)
        headers = {"Authorization": f"Bearer {self.cand_token}"}
        res2 = client.get("/api/v1/admin/questions/stats", headers=headers)
        self.assertEqual(res2.status_code, 403)
        self.assertIn("Administrator privileges required", res2.json()["detail"])

        # Admin user
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        res3 = client.get("/api/v1/admin/questions/stats", headers=admin_headers)
        self.assertEqual(res3.status_code, 200)
        self.assertIn("total_questions", res3.json())

    def test_02_create_question_and_duplicate_prevention(self):
        """Admin creates question; duplicate text in same subject is rejected with 409 Conflict"""
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        ts = int(datetime.now(timezone.utc).timestamp())
        q_text = f"TEST_RUN_{ts}: Choose the word most nearly opposite in meaning to 'OBSTINATE':"
        payload = {
            "subject_id": self.eng_subject.id,
            "subtopic": "Synonyms & Antonyms",
            "year": 2024,
            "source": "UTME Past Question 2024",
            "question_text": q_text,
            "options": {
                "A": "Flexible and compliant",
                "B": "Stubborn and unyielding",
                "C": "Rigid and firm",
                "D": "Arrogant and proud"
            },
            "correct_option": "A",
            "explanation": "Obstinate means stubborn. Opposite is flexible.",
            "difficulty": "Medium",
            "status": "Published"
        }

        # First creation -> 201 Success
        res1 = client.post("/api/v1/admin/questions", json=payload, headers=admin_headers)
        self.assertIn(res1.status_code, [200, 201])
        q_data = res1.json()
        self.assertEqual(q_data["correct_option"], "A")
        self.assertEqual(q_data["status"], "Published")

        # Duplicate creation -> 409 Conflict
        res2 = client.post("/api/v1/admin/questions", json=payload, headers=admin_headers)
        self.assertEqual(res2.status_code, 409)
        self.assertIn("duplicate question", res2.json()["detail"].lower())

    def test_03_create_draft_question_and_verify_candidate_exclusion(self):
        """Draft questions must NEVER be exposed to candidate public endpoint"""
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        ts = int(datetime.now(timezone.utc).timestamp())
        draft_payload = {
            "subject_id": self.eng_subject.id,
            "question_text": f"TEST_RUN_{ts}_DRAFT: Select the correct spelling of the word:",
            "options": {
                "A": "Accommodation",
                "B": "Acommodation",
                "C": "Accomodation",
                "D": "Acomodation"
            },
            "correct_option": "A",
            "explanation": "Accommodation has double c and double m.",
            "difficulty": "Easy",
            "status": "Draft"
        }

        res = client.post("/api/v1/admin/questions", json=draft_payload, headers=admin_headers)
        self.assertIn(res.status_code, [200, 201])
        draft_id = res.json()["id"]

        # Candidate endpoint
        cand_res = client.get(f"/api/v1/questions?subject_id={self.eng_subject.id}")
        self.assertEqual(cand_res.status_code, 200)
        cand_questions = cand_res.json()
        for q in cand_questions:
            self.assertNotEqual(q["id"], draft_id, "Draft question was leaked to candidate endpoint!")
            self.assertEqual(q["status"], "Published")

    def test_04_update_and_delete_question(self):
        """Admin updates and deletes questions"""
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        payload = {
            "subject_id": self.mth_subject.id,
            "question_text": "If 2x + 5 = 15, calculate the value of x.",
            "options": {
                "A": "5",
                "B": "10",
                "C": "15",
                "D": "20"
            },
            "correct_option": "A",
            "explanation": "2x = 10, so x = 5.",
            "difficulty": "Easy",
            "status": "Draft"
        }
        create_res = client.post("/api/v1/admin/questions", json=payload, headers=admin_headers)
        q_id = create_res.json()["id"]

        # Update to Published
        update_res = client.put(
            f"/api/v1/admin/questions/{q_id}",
            json={"status": "Published", "difficulty": "Medium"},
            headers=admin_headers
        )
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["status"], "Published")

        # Delete question
        del_res = client.delete(f"/api/v1/admin/questions/{q_id}", headers=admin_headers)
        self.assertEqual(del_res.status_code, 200)

        # Confirm 404 after deletion
        get_res = client.get(f"/api/v1/admin/questions/{q_id}", headers=admin_headers)
        self.assertEqual(get_res.status_code, 404)

if __name__ == "__main__":
    unittest.main()
