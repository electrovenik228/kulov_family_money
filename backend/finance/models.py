from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Account(TimestampedModel):
    name = models.CharField(max_length=120)
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="KGS")
    color = models.CharField(max_length=24, default="#111827")
    icon = models.CharField(max_length=48, default="wallet")

    def __str__(self) -> str:
        return self.name


class Category(TimestampedModel):
    INCOME = "income"
    EXPENSE = "expense"
    TYPES = [(INCOME, "Доход"), (EXPENSE, "Расход")]

    name = models.CharField(max_length=120)
    type = models.CharField(max_length=12, choices=TYPES)
    color = models.CharField(max_length=24, default="#2563eb")
    icon = models.CharField(max_length=48, default="tag")

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self) -> str:
        return self.name


class Transaction(TimestampedModel):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"
    RETURN = "return"
    SAVING = "saving"
    TYPES = [
        (INCOME, "Доход"),
        (EXPENSE, "Расход"),
        (TRANSFER, "Перевод"),
        (RETURN, "Возврат"),
        (SAVING, "Накопление"),
    ]

    date = models.DateField()
    type = models.CharField(max_length=16, choices=TYPES)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL)
    source = models.CharField(max_length=160, blank=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    comment = models.TextField(blank=True)
    payment_method = models.CharField(max_length=80, blank=True)
    transfer_to = models.ForeignKey(
        Account,
        null=True,
        blank=True,
        related_name="incoming_transfers",
        on_delete=models.SET_NULL,
    )

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self) -> str:
        return f"{self.get_type_display()} {self.amount}"


class SavingEntry(TimestampedModel):
    date = models.DateField()
    deposit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    withdrawal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=14, decimal_places=2)
    comment = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["-date"]


class Debt(TimestampedModel):
    OWED_BY_ME = "owed_by_me"
    OWED_TO_ME = "owed_to_me"
    OPEN = "open"
    PAID = "paid"
    OVERDUE = "overdue"
    TYPES = [(OWED_BY_ME, "Я должен"), (OWED_TO_ME, "Мне должны")]
    STATUSES = [(OPEN, "Открыт"), (PAID, "Закрыт"), (OVERDUE, "Просрочен")]

    type = models.CharField(max_length=20, choices=TYPES)
    person = models.CharField(max_length=160)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUSES, default=OPEN)
    comment = models.TextField(blank=True)

    class Meta:
        ordering = ["status", "due_date", "-date"]


class Goal(TimestampedModel):
    name = models.CharField(max_length=160)
    target_amount = models.DecimalField(max_digits=14, decimal_places=2)
    current_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    color = models.CharField(max_length=24, default="#16a34a")
    due_date = models.DateField(null=True, blank=True)

    @property
    def progress(self) -> float:
        if not self.target_amount:
            return 0
        return min(float(self.current_amount / self.target_amount * 100), 100)


class Budget(TimestampedModel):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    limit = models.DecimalField(max_digits=14, decimal_places=2)
    month = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField()

    class Meta:
        unique_together = ("category", "month", "year")
