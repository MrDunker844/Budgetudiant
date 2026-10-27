from models import Income, IncomeIn
from routers.common import make_money_router

# Toutes les routes /api/incomes (voir make_money_router dans common.py)
router = make_money_router(
    table="incomes", px="inc", model_in=IncomeIn, model_out=Income, tag="Revenus", label="Revenu"
)
