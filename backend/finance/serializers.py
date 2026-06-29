from rest_framework import serializers

from .models import Account, Budget, Category, Debt, Goal, SavingEntry, Transaction


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_color = serializers.CharField(source="category.color", read_only=True)
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = Transaction
        fields = "__all__"


class SavingEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingEntry
        fields = "__all__"


class DebtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Debt
        fields = "__all__"


class GoalSerializer(serializers.ModelSerializer):
    progress = serializers.FloatField(read_only=True)

    class Meta:
        model = Goal
        fields = "__all__"


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_color = serializers.CharField(source="category.color", read_only=True)

    class Meta:
        model = Budget
        fields = "__all__"
