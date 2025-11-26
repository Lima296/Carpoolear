from django.shortcuts import render

def inicio_view(request):
    return render(request, 'inicio.html')

def perfil_view(request):
    return render(request, 'miperfil.html')

def perfil_publico_view(request, usuario_id):
    return render(request, 'perfil_publico.html', {'usuario_id': usuario_id})

def ayuda_view(request):
    return render(request, 'ayuda.html')