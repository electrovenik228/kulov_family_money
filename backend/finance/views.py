from calendar import monthrange
from datetime import date
from decimal import Decimal

from django.db.models import Q, Sum
from django.db.models.functions import TruncMonth
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Account, Budget, Category, Debt, Goal, SavingEntry, Transaction
from .serializers import (
    AccountSerializer,
    BudgetSerializer,
    CategorySerializer,
    DebtSerializer,
    GoalSerializer,
    SavingEntrySerializer,
    TransactionSerializer,
)


def apply_transaction_filters(queryset, request):
    query = request.query_params.get("q", "")
    category = request.query_params.get("category")
    account = request.query_params.get("account")
    tx_type = request.query_params.get("type")
    year = request.query_params.get("year")
    month = request.query_params.get("month")
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")

    if query:
        queryset = queryset.filter(
            Q(comment__icontains=query)
            | Q(source__icontains=query)
            | Q(amount__icontains=query)
            | Q(account__name__icontains=query)
            | Q(category__name__icontains=query)
        )
    if category:
        queryset = queryset.filter(category_id=category)
    if account:
        queryset = queryset.filter(account_id=account)
    if tx_type:
        queryset = queryset.filter(type=tx_type)
    if year:
        queryset = queryset.filter(date__year=year)
    if month:
        queryset = queryset.filter(date__month=month)
    if date_from:
        queryset = queryset.filter(date__gte=date_from)
    if date_to:
        queryset = queryset.filter(date__lte=date_to)
    return queryset


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all().order_by("name")
    serializer_class = AccountSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("type", "name")
    serializer_class = CategorySerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category_type = self.request.query_params.get("type")
        if category_type:
            queryset = queryset.filter(type=category_type)
        return queryset


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return apply_transaction_filters(Transaction.objects.select_related("category", "account"), self.request)


class SavingEntryViewSet(viewsets.ModelViewSet):
    queryset = SavingEntry.objects.all()
    serializer_class = SavingEntrySerializer


class DebtViewSet(viewsets.ModelViewSet):
    queryset = Debt.objects.all()
    serializer_class = DebtSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        debt_type = self.request.query_params.get("type")
        if debt_type:
            queryset = queryset.filter(type=debt_type)
        return queryset


class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all().order_by("-created_at")
    serializer_class = GoalSerializer


class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.select_related("category").all()
    serializer_class = BudgetSerializer


def money(value):
    return float(value or Decimal("0"))


@api_view(["GET"])
def dashboard(request):
    today = date.today()
    first_day = today.replace(day=1)
    last_day = today.replace(day=monthrange(today.year, today.month)[1])

    transactions = Transaction.objects.select_related("category", "account")
    month_transactions = transactions.filter(date__gte=first_day, date__lte=last_day)
    income = month_transactions.filter(type=Transaction.INCOME).aggregate(total=Sum("amount"))["total"] or 0
    expenses = month_transactions.filter(type=Transaction.EXPENSE).aggregate(total=Sum("amount"))["total"] or 0
    total_balance = Account.objects.aggregate(total=Sum("balance"))["total"] or 0
    savings = SavingEntry.objects.order_by("-date").first()
    saving_balance = savings.balance if savings else Decimal("0")
    expense_ratio = float(expenses / income * 100) if income else 0

    return Response(
        {
            "cards": {
                "total_balance": money(total_balance),
                "monthly_income": money(income),
                "monthly_expenses": money(expenses),
                "savings": money(saving_balance),
                "remaining": money(Decimal(income) - Decimal(expenses)),
                "expense_ratio": round(expense_ratio, 1),
            },
            "recent_transactions": TransactionSerializer(transactions[:10], many=True).data,
        }
    )


@api_view(["GET"])
def analytics(request):
    transactions = Transaction.objects.select_related("category")
    monthly = (
        transactions.filter(type__in=[Transaction.INCOME, Transaction.EXPENSE])
        .annotate(month=TruncMonth("date"))
        .values("month", "type")
        .annotate(total=Sum("amount"))
        .order_by("month")
    )
    grouped = {}
    for row in monthly:
        label = row["month"].strftime("%b %Y")
        grouped.setdefault(label, {"month": label, "income": 0, "expenses": 0, "balance": 0})
        key = "income" if row["type"] == Transaction.INCOME else "expenses"
        grouped[label][key] = money(row["total"])

    monthly_data = []
    running_balance = 0
    for item in grouped.values():
        item["balance"] = item["income"] - item["expenses"]
        running_balance += item["balance"]
        item["cumulative"] = running_balance
        item["forecast"] = round(item["expenses"] * 1.08, 2)
        monthly_data.append(item)

    by_category = (
        transactions.filter(type__in=[Transaction.INCOME, Transaction.EXPENSE], category__isnull=False)
        .values("type", "category__name", "category__color")
        .annotate(total=Sum("amount"))
        .order_by("-total")
    )

    income_categories = []
    expense_categories = []
    for row in by_category:
        item = {
            "name": row["category__name"],
            "value": money(row["total"]),
            "color": row["category__color"],
        }
        if row["type"] == Transaction.INCOME:
            income_categories.append(item)
        else:
            expense_categories.append(item)

    return Response(
        {
            "monthly": monthly_data,
            "income_categories": income_categories,
            "expense_categories": expense_categories,
        }
    )
