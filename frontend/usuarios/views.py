from django.contrib.auth.decorators import login_required
from django.shortcuts import render

def inicio_view(request):
    return render(request, 'inicio.html')

@login_required
def perfil_view(request):
    return render(request, 'miperfil.html')

def perfil_publico_view(request, usuario_id):
    return render(request, 'perfil_publico.html', {'usuario_id': usuario_id})

@login_required
def ayuda_view(request):
    return render(request, 'ayuda.html')