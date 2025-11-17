document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-publicar-viaje');
    if (!form) {
        return;
    }

    const fields = {
        'origen-publicar': {
            valueMissing: 'Por favor, completa el origen del viaje.'
        },
        'destino-publicar': {
            valueMissing: 'Por favor, completa el destino del viaje.'
        },
        'fecha-publicar': {
            valueMissing: 'Por favor, selecciona una fecha de salida.'
        },
        'hora-publicar': {
            valueMissing: 'Por favor, especifica la hora de salida.'
        },
        'precio-publicar': {
            valueMissing: 'Por favor, ingresa el precio por asiento.',
            rangeUnderflow: 'El precio no puede ser negativo.'
        },
        'asientos-publicar': {
            rangeUnderflow: 'Debe haber al menos un asiento disponible.'
        }
    };

    for (const id in fields) {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('invalid', function (event) {
                const validity = input.validity;
                let message = '';

                if (validity.valueMissing) {
                    message = fields[id].valueMissing;
                } else if (validity.rangeUnderflow) {
                    message = fields[id].rangeUnderflow;
                } else if (validity.rangeOverflow) {
                    message = fields[id].rangeOverflow;
                } else if (validity.typeMismatch) {
                    message = fields[id].typeMismatch;
                }
                
                input.setCustomValidity(message);
            });

            // Limpiar el mensaje de error personalizado cuando el usuario empieza a corregir
            input.addEventListener('input', function () {
                input.setCustomValidity('');
            });
        }
    }
});
