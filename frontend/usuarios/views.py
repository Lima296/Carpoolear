from django.shortcuts import render

def inicio_view(request):
    return render(request, 'inicio.html')

def perfil_view(request):
    return render(request, 'miperfil.html')