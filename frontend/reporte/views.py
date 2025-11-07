from django.shortcuts import render

def reporte_view(request):
    return render(request, 'reporte.html')