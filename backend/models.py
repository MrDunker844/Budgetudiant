from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel


# ---------- Catégories ----------
class CategoryIn(BaseModel):
    name: str


class Category(CategoryIn):
    id: int


# ---------- Transactions ----------
class TransactionIn(BaseModel):
    amount: float
    type: Literal["revenu", "depense"]
    date: date
    description: Optional[str] = None
    category_id: Optional[int] = None


class Transaction(TransactionIn):
    id: int
