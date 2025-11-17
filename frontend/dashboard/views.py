from django.shortcuts import render
from datetime import date

def dashboard_view(request):
    today = date.today().isoformat()  # Get today's date in YYYY-MM-DD format
    return render(request, 'dashboard.html', {'current_date': today})

def viaje_editar_view(request, viaje_id):
    today = date.today().isoformat()
    return render(request, 'viaje_editar.html', {'viaje_id': viaje_id, 'current_date': today})

def misviajes_view(request):
    today = date.today().isoformat()
    return render(request, 'misviajes.html', {'current_date': today})