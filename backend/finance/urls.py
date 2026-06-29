from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AccountViewSet,
    BudgetViewSet,
    CategoryViewSet,
    DebtViewSet,
    GoalViewSet,
    SavingEntryViewSet,
    TransactionViewSet,
    analytics,
    dashboard,
)

router = DefaultRouter()
router.register("accounts", AccountViewSet)
router.register("budgets", BudgetViewSet)
router.register("categories", CategoryViewSet)
router.register("debts", DebtViewSet)
router.register("goals", GoalViewSet)
router.register("savings", SavingEntryViewSet)
router.register("transactions", TransactionViewSet, basename="transactions")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", dashboard),
    path("analytics/", analytics),
]
