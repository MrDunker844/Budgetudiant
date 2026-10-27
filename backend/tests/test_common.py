from datetime import date

from routers.common import month_filter, month_range
from routers.users import compute_summary


def test_month_range_mois_classique():
    assert month_range("2026-10") == (date(2026, 10, 1), date(2026, 11, 1))


def test_month_range_decembre_passe_a_l_annee_suivante():
    assert month_range("2026-12") == (date(2026, 12, 1), date(2027, 1, 1))


def test_month_filter_sans_mois():
    assert month_filter("ex_date", None) == ("", [])


def test_month_filter_avec_mois():
    sql, params = month_filter("e.ex_date", "2026-10")
    assert sql == " AND e.ex_date >= %s AND e.ex_date < %s"
    assert params == [date(2026, 10, 1), date(2026, 11, 1)]


def test_compute_summary_totaux_et_solde():
    incomes = [{"amount": 450}, {"amount": 320}]
    expenses = [
        {"amount": 380, "category": "Logement"},
        {"amount": 65.4, "category": "Alimentation"},
        {"amount": 4.6, "category": "Alimentation"},
        {"amount": 10, "category": None},
    ]
    summary = compute_summary(incomes, expenses)
    assert summary["total_revenus"] == 770
    assert summary["total_depenses"] == 460
    assert summary["solde"] == 310
    # Triées de la plus grosse dépense à la plus petite, None = sans catégorie
    assert summary["depenses_par_categorie"] == [
        {"category": "Logement", "total": 380},
        {"category": "Alimentation", "total": 70},
        {"category": None, "total": 10},
    ]


def test_compute_summary_sans_rien():
    assert compute_summary([], []) == {
        "total_revenus": 0,
        "total_depenses": 0,
        "solde": 0,
        "depenses_par_categorie": [],
    }
