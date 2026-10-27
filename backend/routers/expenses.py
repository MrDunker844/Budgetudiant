from models import Expense, ExpenseIn
from routers.common import make_money_router

# Toutes les routes /api/expenses (voir make_money_router dans common.py)
router = make_money_router(
    table="expenses", px="ex", model_in=ExpenseIn, model_out=Expense, tag="Dépenses", label="Dépense"
)
