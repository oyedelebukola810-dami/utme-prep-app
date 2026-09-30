import sys
import os
import unittest
from datetime import datetime, timezone

# Add backend directory to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.db.session import SessionLocal, init_db
from app.models.user import User
from app.core.security import get_password_hash, verify_password, generate_secure_token
from app.core.email import dispatch_verification_email

class TestUTMEAuthAndSystem(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init_db()
        cls.test_email = f"candidate_test_{int(datetime.now(timezone.utc).timestamp())}@utmeprep.ng"
        cls.test_password = "SecureCandidatePassword2026!"

    @classmethod
    def tearDownClass(cls):
        db = SessionLocal()
        db.query(User).filter(User.email == cls.test_email).delete()
        db.commit()
        db.close()

    def setUp(self):
        self.db = SessionLocal()

    def tearDown(self):
        self.db.close()

    def test_01_password_hashing_and_verification(self):
        hashed = get_password_hash(self.test_password)
        self.assertTrue(verify_password(self.test_password, hashed))
        self.assertFalse(verify_password("WrongPassword123", hashed))

    def test_02_user_registration_and_unverified_state(self):
        token = generate_secure_token()
        user = User(
            email=self.test_email,
            full_name="QA Scholar",
            hashed_password=get_password_hash(self.test_password),
            target_score=340,
            is_verified=False,
            verification_token=token
        )
        self.db.add(user)
        self.db.commit()

        # Query user back from database
        db_user = self.db.query(User).filter(User.email == self.test_email).first()
        self.assertIsNotNone(db_user)
        self.assertFalse(db_user.is_verified)
        self.assertEqual(db_user.verification_token, token)

    def test_03_email_dispatch_service(self):
        token = generate_secure_token()
        success, status_code, msg = dispatch_verification_email("delivered@resend.dev", token)
        self.assertTrue(success)
        self.assertIn(status_code, ["DELIVERED_VIA_SMTP", "LOCAL_DEV_STREAM"])

    def test_04_email_verification_token_activation(self):
        db_user = self.db.query(User).filter(User.email == self.test_email).first()
        self.assertIsNotNone(db_user)
        
        # Verify account
        db_user.is_verified = True
        db_user.verification_token = None
        self.db.commit()

        # Query back
        updated_user = self.db.query(User).filter(User.email == self.test_email).first()
        self.assertTrue(updated_user.is_verified)
        self.assertIsNone(updated_user.verification_token)

if __name__ == "__main__":
    unittest.main()
