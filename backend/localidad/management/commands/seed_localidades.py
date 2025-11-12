import requests
import json
from django.core.management.base import BaseCommand
from localidad.models import Localidad

class Command(BaseCommand):
    help = 'Carga todas las localidades de Argentina desde una API pública.'

    def handle(self, *args, **kwargs):
        # URL del JSON con los departamentos de Argentina
        url = "https://infra.datos.gob.ar/georef/departamentos.json"
        self.stdout.write(self.style.NOTICE(f"Descargando localidades desde {url}..."))

        try:
            response = requests.get(url)
            response.raise_for_status()  # Lanza un error para respuestas HTTP malas (4xx o 5xx)
        except requests.exceptions.RequestException as e:
            self.stderr.write(self.style.ERROR(f"Error al descargar el archivo: {e}"))
            return

        data = response.json()
        
        # La estructura del JSON es {"departamentos": [...]} 
        localidades = data.get("departamentos", [])
        
        if not localidades:
            self.stderr.write(self.style.ERROR("No se encontraron 'departamentos' en la respuesta del JSON."))
            return

        self.stdout.write(self.style.NOTICE(f"Se encontraron {len(localidades)} localidades. Empezando la carga..."))

        count_created = 0
        count_skipped = 0

        for loc in localidades:
            nombre = loc.get("nombre")
            lat = loc.get("centroide", {}).get("lat")
            lon = loc.get("centroide", {}).get("lon")

            if not nombre or lat is None or lon is None:
                self.stdout.write(self.style.WARNING(f"Omitiendo registro por datos incompletos: {loc}"))
                continue

            # Usamos get_or_create para evitar duplicados
            obj, created = Localidad.objects.get_or_create(
                nombre=nombre,
                defaults={
                    'lat': lat,
                    'lon': lon
                }
            )

            if created:
                count_created += 1
                self.stdout.write(f"  -> Creada: {nombre}")
            else:
                count_skipped += 1

        self.stdout.write(self.style.SUCCESS(f"\n¡Proceso completado!"))
        self.stdout.write(self.style.SUCCESS(f"Localidades nuevas creadas: {count_created}"))
        self.stdout.write(self.style.WARNING(f"Localidades ya existentes (omitidas): {count_skipped}"))
