from django.shortcuts import render
from datetime import date

from django.contrib.auth.decorators import login_required

@login_required
def dashboard_view(request):
    today = date.today().isoformat()  # Get today's date in YYYY-MM-DD format
    return render(request, 'dashboard.html', {'current_date': today})

@login_required
def viaje_editar_view(request, viaje_id):
    today = date.today().isoformat()
    return render(request, 'viaje_editar.html', {'viaje_id': viaje_id, 'current_date': today})

@login_required
def misviajes_view(request):
    today = date.today().isoformat()
    return render(request, 'misviajes.html', {'current_date': today})