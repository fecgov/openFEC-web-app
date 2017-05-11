from openfecwebapp.views import get_legal_category_order

def test_legal_category_order():
    results = {
        "total_statutes": 0,
        "total_advisory_opinions": 3,
        "total_murs": 10,
    }

    assert get_legal_category_order(results) == [
        "advisory_opinions", "murs", "regulations", "statutes"]
