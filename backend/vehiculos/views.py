from django.http import JsonResponse
from django.shortcuts import render
from .models import Vehiculo
from usuarios.models import Usuario

def listado_vehiculos_api(request):
    vehiculos = Vehiculo.objects.all()
    data = []
    for v in vehiculos:
        # Buscar el usuario que tiene este vehículo asignado
        propietario = Usuario.objects.filter(patente_vehiculo=v).first()
        propietario_data = None
        if propietario:
            propietario_data = {
                'id': propietario.id,
                'nombre': propietario.nombre,
                'apellido': propietario.apellido,
                'correo': propietario.correo,
            }
        data.append({
            'patente': v.patente,
            'marca': v.marca,
            'modelo': v.modelo,
            'color': v.color,
            'propietario': propietario_data
        })
    return JsonResponse({'vehiculos': data})
