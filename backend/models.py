from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ---------- Utilisateurs ----------
class UserIn(BaseModel):
    """Données envoyées pour créer / modifier un utilisateur."""
    us_name: str = Field(min_length=1, max_length=100)
    us_email: EmailStr
    us_monthly_budget: Optional[float] = Field(default=None, gt=0)


class User(UserIn):
    """Utilisateur renvoyé par l'API."""
    us_id: int
    us_created_at: datetime


# ---------- Catégories ----------
class CategoryIn(BaseModel):
    cat_name: str = Field(min_length=1, max_length=50)
    cat_color: str = Field(default="#888888", pattern=r"^#[0-9A-Fa-f]{6}$")
    cat_description: Optional[str] = Field(default=None, max_length=255)


class Category(CategoryIn):
    cat_id: int
    cat_created_at: datetime


# ---------- Dépenses ----------
class ExpenseIn(BaseModel):
    user_id: int
    categorie_id: Optional[int] = None
    ex_title: str = Field(min_length=1, max_length=100)
    ex_amount: float = Field(gt=0)
    ex_date: date
    ex_description: Optional[str] = Field(default=None, max_length=255)


class Expense(ExpenseIn):
    ex_id: int
    ex_created_at: datetime


# ---------- Revenus ----------
class IncomeIn(BaseModel):
    user_id: int
    categorie_id: Optional[int] = None
    inc_title: str = Field(min_length=1, max_length=100)
    inc_amount: float = Field(gt=0)
    inc_date: date
    inc_description: Optional[str] = Field(default=None, max_length=255)


class Income(IncomeIn):
    inc_id: int
    inc_created_at: datetime


# ---------- Résumé du budget d'un utilisateur ----------
class CategoryTotal(BaseModel):
    category: Optional[str]  # None = dépenses sans catégorie
    total: float


class Summary(BaseModel):
    budget_mensuel: Optional[float] = None
    total_revenus: float
    total_depenses: float
    solde: float
    depenses_par_categorie: list[CategoryTotal]
