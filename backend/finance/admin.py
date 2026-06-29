from django.contrib import admin

from .models import Account, Budget, Category, Debt, Goal, SavingEntry, Transaction

admin.site.register(Account)
admin.site.register(Budget)
admin.site.register(Category)
admin.site.register(Debt)
admin.site.register(Goal)
admin.site.register(SavingEntry)
admin.site.register(Transaction)
