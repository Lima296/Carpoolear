from django.contrib import admin
from .models import Calificacion

@admin.register(Calificacion)
class CalificacionAdmin(admin.ModelAdmin):
    list_display = ('viaje', 'calificador', 'calificado', 'tipo', 'fecha_creacion')
    list_filter = ('tipo', 'fecha_creacion')
    search_fields = ('calificador__email', 'calificado__email', 'viaje__id')