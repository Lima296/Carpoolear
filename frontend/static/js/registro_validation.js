document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registroForm');
    if (!form) {
        return;
    }

    const fields = {
        'reg_nombre': {
            valueMissing: 'Por favor, ingresa tu nombre.'
        },
        'reg_apellido': {
            valueMissing: 'Por favor, ingresa tu apellido.'
        },
        'reg_email': {
            valueMissing: 'Por favor, ingresa tu correo electrónico.',
            typeMismatch: 'Por favor, ingresa un correo electrónico válido.'
        },
        'reg_check_email': {
            valueMissing: 'Por favor, repite tu correo electrónico.',
            typeMismatch: 'Por favor, ingresa un correo electrónico válido.'
        },
        'reg_password': {
            valueMissing: 'Por favor, ingresa una contraseña.'
        },
        'reg_check_password': {
            valueMissing: 'Por favor, repite tu contraseña.'
        },
        'reg_caracteristica': {
            valueMissing: 'Por favor, ingresa la característica de tu teléfono.',
            patternMismatch: 'La característica debe contener solo números.'
        },
        'reg_telefono': {
            valueMissing: 'Por favor, ingresa tu número de teléfono.',
            patternMismatch: 'El teléfono debe contener solo números.'
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
                } else if (validity.typeMismatch) {
                    message = fields[id].typeMismatch;
                } else if (validity.patternMismatch) {
                    message = fields[id].patternMismatch;
                }
                
                input.setCustomValidity(message);
            });

            input.addEventListener('input', function () {
                input.setCustomValidity('');
            });
        }
    }

    // Custom validation for email and password matching
    const regEmail = document.getElementById('reg_email');
    const regCheckEmail = document.getElementById('reg_check_email');
    const regPassword = document.getElementById('reg_password');
    const regCheckPassword = document.getElementById('reg_check_password');

    if (regEmail && regCheckEmail) {
        regCheckEmail.addEventListener('input', function () {
            if (regEmail.value !== regCheckEmail.value) {
                regCheckEmail.setCustomValidity('Los correos electrónicos no coinciden.');
            } else {
                regCheckEmail.setCustomValidity('');
            }
        });
        regEmail.addEventListener('input', function () {
            if (regEmail.value !== regCheckEmail.value) {
                regCheckEmail.setCustomValidity('Los correos electrónicos no coinciden.');
            } else {
                regCheckEmail.setCustomValidity('');
            }
        });
    }

    if (regPassword && regCheckPassword) {
        regCheckPassword.addEventListener('input', function () {
            if (regPassword.value !== regCheckPassword.value) {
                regCheckPassword.setCustomValidity('Las contraseñas no coinciden.');
            } else {
                regCheckPassword.setCustomValidity('');
            }
        });
        regPassword.addEventListener('input', function () {
            if (regPassword.value !== regCheckPassword.value) {
                regCheckPassword.setCustomValidity('Las contraseñas no coinciden.');
            } else {
                regCheckPassword.setCustomValidity('');
            }
        });
    }
});
