import unittest
from backend.trust_engine import calculate_trust_score, make_decision
from backend.authorization import authorize_transaction
from backend.database import initialize_database, save_transaction, get_transactions
from backend.main import (
    root,
    health,
    get_providers,
    analyze_service,
    authorize,
    transactions,
    AnalyzeRequest,
    AuthorizeRequest,
)


class TestTrustEngine(unittest.TestCase):
    def test_high_trust_provider(self):
        result = calculate_trust_score(
            reputation=98,
            successful_transactions=127,
            verified=True,
            price=0.001,
        )
        self.assertGreaterEqual(result["trust_score"], 80)
        self.assertEqual(result["risk_level"], "LOW")
        self.assertEqual(result["decision"], "APPROVE")

    def test_low_trust_provider(self):
        result = calculate_trust_score(
            reputation=25,
            successful_transactions=3,
            verified=False,
            price=0.05,
        )
        self.assertLess(result["trust_score"], 60)
        self.assertEqual(result["risk_level"], "HIGH")
        self.assertEqual(result["decision"], "BLOCK")

    def test_make_decision(self):
        self.assertEqual(make_decision(95)["decision"], "APPROVE")
        self.assertEqual(make_decision(75)["decision"], "REVIEW")
        self.assertEqual(make_decision(40)["decision"], "BLOCK")


class TestAuthorizationGate(unittest.TestCase):
    def test_approved_transaction(self):
        decision = authorize_transaction(trust_score=85, amount=5.0)
        self.assertTrue(decision["authorized"])
        self.assertEqual(decision["decision"], "APPROVE")

    def test_high_amount_requires_review(self):
        decision = authorize_transaction(trust_score=85, amount=50.0)
        self.assertFalse(decision["authorized"])
        self.assertEqual(decision["decision"], "REVIEW")

    def test_low_trust_blocked(self):
        decision = authorize_transaction(trust_score=40, amount=1.0)
        self.assertFalse(decision["authorized"])
        self.assertEqual(decision["decision"], "BLOCK")


class TestBackendAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        initialize_database()

    def test_root_and_health(self):
        self.assertEqual(root()["status"], "online")
        self.assertEqual(health()["status"], "healthy")

    def test_get_providers(self):
        providers_resp = get_providers()
        self.assertIn("providers", providers_resp)
        self.assertGreater(len(providers_resp["providers"]), 0)

    def test_analyze_endpoint(self):
        req = AnalyzeRequest(
            reputation=98.0,
            successful_transactions=127,
            verified=True,
            price=0.001,
        )
        res = analyze_service(req)
        self.assertEqual(res["decision"], "APPROVE")
        self.assertEqual(res["risk_level"], "LOW")

    def test_authorize_endpoint_and_database_persistence(self):
        initial_count = len(get_transactions())
        auth_req = AuthorizeRequest(
            service="Automated Test Service",
            reputation=98.0,
            successful_transactions=120,
            verified=True,
            price=0.001,
            amount=0.01,
        )
        res = authorize(auth_req)
        self.assertTrue(res["authorized"])
        self.assertIsNotNone(res["transaction_id"])

        updated_count = len(get_transactions())
        self.assertEqual(updated_count, initial_count + 1)


if __name__ == "__main__":
    unittest.main()

