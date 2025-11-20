from rest_framework import serializers
from .models import Reserva
from viajes.models import Viaje
from viajes.serializers import ViajeSerializer
from usuarios.serializers import UsuarioSerializer

# Serializer para LEER datos (incluye detalles anidados)
class ReservaReadSerializer(serializers.ModelSerializer):
    viaje = ViajeSerializer(read_only=True)
    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = Reserva
        fields = ['uuid', 'usuario', 'viaje', 'fecha_reserva', 'cantidad_asientos', 'estado']

# Serializer para ESCRIBIR datos (usa IDs para relaciones)
class ReservaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = ['viaje', 'cantidad_asientos', 'usuario', 'estado']

    def validate(self, data):
        """
        Verifica que un usuario no pueda reservar en su propio viaje.
        Soporta PATCH (buscando datos en la instancia guardada).
        """
        # 1. Intentamos obtener los datos del JSON que entra
        viaje = data.get('viaje')
        usuario_reserva = data.get('usuario')

        # 2. Si estamos editando (PATCH/PUT) y no vienen los datos, usamos los guardados
        if self.instance:
            # Si 'viaje' no vino en el JSON, usamos el que ya tiene la reserva
            if not viaje:
                viaje = self.instance.viaje
            # Lo mismo para el usuario
            if not usuario_reserva:
                usuario_reserva = self.instance.usuario

        # 3. Validación (agregamos "if viaje" por seguridad)
        # Validamos solo si tenemos ambos datos (esto evita errores raros)
        if viaje and usuario_reserva:
            if viaje.conductor == usuario_reserva:
                raise serializers.ValidationError("No podés reservar un asiento en tu propio viaje.")

        return data