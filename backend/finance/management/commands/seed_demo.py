from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand

from finance.models import Account, Budget, Category, Debt, Goal, SavingEntry, Transaction


class Command(BaseCommand):
    help = "Create demo finance data"

    def handle(self, *args, **options):
        Transaction.objects.all().delete()
        SavingEntry.objects.all().delete()
        Debt.objects.all().delete()
        Goal.objects.all().delete()
        Budget.objects.all().delete()
        Category.objects.all().delete()
        Account.objects.all().delete()

        cash = Account.objects.create(name="Наличные", balance=Decimal("52500"), color="#111827", icon="banknote")
        card = Account.objects.create(name="Банковская карта", balance=Decimal("184300"), color="#2563eb", icon="credit-card")
        deposit = Account.objects.create(name="Депозит", balance=Decimal("650000"), color="#16a34a", icon="landmark")
        crypto = Account.objects.create(name="Криптокошелек", balance=Decimal("92000"), color="#7c3aed", icon="bitcoin")

        income_categories = [
            ("Зарплата", "#16a34a", "briefcase"),
            ("Фриланс", "#0891b2", "laptop"),
            ("Продажа", "#f59e0b", "badge-dollar-sign"),
            ("Дивиденды", "#6366f1", "line-chart"),
        ]
        expense_categories = [
            ("Продукты", "#ef4444", "shopping-basket"),
            ("Транспорт", "#f97316", "car"),
            ("Интернет", "#0ea5e9", "wifi"),
            ("Аренда", "#8b5cf6", "home"),
            ("Подписки", "#64748b", "repeat"),
            ("Развлечения", "#ec4899", "ticket"),
        ]

        categories = {}
        for name, color, icon in income_categories:
            categories[name] = Category.objects.create(name=name, type=Category.INCOME, color=color, icon=icon)
        for name, color, icon in expense_categories:
            categories[name] = Category.objects.create(name=name, type=Category.EXPENSE, color=color, icon=icon)

        today = date.today()
        for month_offset in range(6, -1, -1):
            base = today - timedelta(days=month_offset * 30)
            Transaction.objects.create(
                date=base.replace(day=min(base.day, 5)),
                type=Transaction.INCOME,
                category=categories["Зарплата"],
                source="Kulov Group",
                amount=Decimal("180000") + month_offset * 1000,
                account=card,
                comment="Основная зарплата",
            )
            Transaction.objects.create(
                date=base.replace(day=min(base.day, 12)),
                type=Transaction.INCOME,
                category=categories["Фриланс"],
                source="Частный проект",
                amount=Decimal("42000") - month_offset * 900,
                account=card,
                comment="Разработка интерфейса",
            )
            expenses = [
                ("Продукты", "Семейные покупки", Decimal("24500") + month_offset * 700, cash),
                ("Аренда", "Квартира", Decimal("48000"), card),
                ("Транспорт", "Такси и топливо", Decimal("12600") + month_offset * 350, card),
                ("Интернет", "Домашний интернет", Decimal("1600"), card),
                ("Подписки", "Сервисы", Decimal("3900"), card),
                ("Развлечения", "Кино и кафе", Decimal("11800") + month_offset * 500, cash),
            ]
            for index, (category_name, comment, amount, account) in enumerate(expenses, start=8):
                Transaction.objects.create(
                    date=base.replace(day=min(index + month_offset, 25)),
                    type=Transaction.EXPENSE,
                    category=categories[category_name],
                    amount=amount,
                    account=account,
                    comment=comment,
                    payment_method="Карта" if account == card else "Наличные",
                )

        Transaction.objects.create(
            date=today,
            type=Transaction.TRANSFER,
            amount=Decimal("25000"),
            account=card,
            transfer_to=deposit,
            comment="Перевод на депозит",
        )

        balance = Decimal("510000")
        for i in range(6):
            balance += Decimal("25000")
            SavingEntry.objects.create(
                date=today - timedelta(days=(5 - i) * 30),
                deposit=Decimal("25000"),
                withdrawal=Decimal("0"),
                balance=balance,
                comment="Пополнение цели",
            )

        Debt.objects.create(type=Debt.OWED_TO_ME, person="Азамат", amount=Decimal("18000"), date=today - timedelta(days=10), due_date=today + timedelta(days=12), status=Debt.OPEN, comment="За билеты")
        Debt.objects.create(type=Debt.OWED_BY_ME, person="Айжан", amount=Decimal("9500"), date=today - timedelta(days=4), due_date=today + timedelta(days=5), status=Debt.OPEN, comment="Обед и доставка")

        Goal.objects.create(name="Купить машину", target_amount=Decimal("2000000"), current_amount=Decimal("650000"), color="#2563eb")
        Goal.objects.create(name="Семейный отпуск", target_amount=Decimal("420000"), current_amount=Decimal("165000"), color="#f97316")

        Budget.objects.create(category=categories["Продукты"], limit=Decimal("20000"), month=today.month, year=today.year)
        Budget.objects.create(category=categories["Развлечения"], limit=Decimal("12000"), month=today.month, year=today.year)

        self.stdout.write(self.style.SUCCESS("Demo data created"))
