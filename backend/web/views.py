from django.shortcuts import render
from datetime import date

def dashboard_view(request):
    return render(request, 'dashboard.html')

def viaje_editar_view(request, viaje_id):
    return render(request, 'viaje_editar.html', {'viaje_id': viaje_id})

def misviajes_view(request):
    return render(request, 'misviajes.html')