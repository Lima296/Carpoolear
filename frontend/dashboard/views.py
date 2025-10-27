from django.shortcuts import render

def dashboard_view(request):
    return render(request, 'dashboard.html')

def viaje_editar_view(request, viaje_id):
    return render(request, 'viaje_editar.html', {'viaje_id': viaje_id})
