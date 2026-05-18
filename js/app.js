// CAMBIO FASE 2: Creación del objeto inicial del usuario según requerimientos
const defaultUser = {
    nombre: "Ash Ketchum",
    cuenta: "0987654321",
    pin: "1234",
    saldo: 500.00,
    transacciones: [] 
};

document.addEventListener('DOMContentLoaded', () => {
    
    if (!localStorage.getItem('pokemonBankUser')) {
        localStorage.setItem('pokemonBankUser', JSON.stringify(defaultUser));
    }

    const userData = JSON.parse(localStorage.getItem('pokemonBankUser'));

    // --- LÓGICA DE LOGIN ---
    const loginForm = document.getElementById('loginForm'); 
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const pinInput = document.getElementById('pinInput').value;
            
            //Validación estricta con ValidateJS
            const constraints = {
                pin: {
                    presence: { allowEmpty: false },
                    length: { is: 4 },
                    format: { pattern: "[0-9]+" }
                }
            };
            
            const validationResult = validate({ pin: pinInput }, constraints);
            
            if (validationResult) {
                // SweetAlert en lugar de alert()
                swal("Error", "El PIN debe tener exactamente 4 números.", "error");
                return;
            }

            // Verificación del PIN guardado
            if (pinInput === userData.pin) {
                swal("¡Bienvenido!", `Hola de nuevo, ${userData.nombre}`, "success")
                .then(() => {
                    window.location.href = "acciones.html"; // Redirección JS
                });
            } else {
                swal("PIN Incorrecto", "Intenta con el PIN de prueba: 1234", "error");
            }
        });
    }

    //LÓGICA DE LA PANTALLA DE ACCIONES
    const nombreUsuarioEl = document.getElementById('nombreUsuario');
    if (nombreUsuarioEl) {
        
        // Imprimir nombre y cuenta desde el LocalStorage
        nombreUsuarioEl.innerText = userData.nombre;
        document.getElementById('cuentaUsuario').innerText = userData.cuenta;

        // Botón Consultar Saldo usando SweetAlert
        const btnConsultar = document.getElementById('btnConsultar');
        if (btnConsultar) {
            btnConsultar.addEventListener('click', () => {
                const currentData = JSON.parse(localStorage.getItem('pokemonBankUser'));
                swal("Consulta de Saldo", `Tu saldo actual es: $${currentData.saldo.toFixed(2)}`, "info");
            });
        }
        
        // Depósito interactivo
        const btnDepositar = document.getElementById('btnDepositar');
        if (btnDepositar) {
            btnDepositar.addEventListener('click', () => {
                swal({
                    text: 'Ingrese el monto a depositar:',
                    content: "input",
                    button: { text: "Depositar" },
                })
                .then(monto => {
                    if (!monto || isNaN(monto) || Number(monto) <= 0) {
                        return swal("Error", "Monto inválido.", "error");
                    }
                    
                    let currentData = JSON.parse(localStorage.getItem('pokemonBankUser'));
                    let montoNum = parseFloat(monto);
                    
                    currentData.saldo += montoNum; // Sumar
                    
                    // Guardar transacción en el arreglo
                    currentData.transacciones.push({
                        fecha: new Date().toLocaleDateString(),
                        tipo: "Depósito",
                        monto: montoNum
                    });
                    
                    localStorage.setItem('pokemonBankUser', JSON.stringify(currentData)); // Guardar
                    swal("¡Éxito!", `Depositaste $${montoNum.toFixed(2)}. Saldo: $${currentData.saldo.toFixed(2)}`, "success");
                });
            });
        }

        // Retiro interactivo
        const btnRetirar = document.getElementById('btnRetirar');
        if (btnRetirar) {
            btnRetirar.addEventListener('click', () => {
                swal({
                    text: 'Ingrese el monto a retirar:',
                    content: "input",
                    button: { text: "Retirar" },
                })
                .then(monto => {
                    if (!monto || isNaN(monto) || Number(monto) <= 0) {
                        return swal("Error", "Monto inválido.", "error");
                    }
                    
                    let currentData = JSON.parse(localStorage.getItem('pokemonBankUser'));
                    let montoNum = parseFloat(monto);
                    
                    // Validar fondos
                    if (montoNum > currentData.saldo) {
                        return swal("Fondos insuficientes", `Saldo: $${currentData.saldo.toFixed(2)}`, "warning");
                    }
                    
                    currentData.saldo -= montoNum; // Restar
                    
                    currentData.transacciones.push({
                        fecha: new Date().toLocaleDateString(),
                        tipo: "Retiro",
                        monto: -montoNum // Negativo para diferenciar
                    });
                    
                    localStorage.setItem('pokemonBankUser', JSON.stringify(currentData));
                    swal("¡Éxito!", `Retiraste $${montoNum.toFixed(2)}. Saldo: $${currentData.saldo.toFixed(2)}`, "success");
                });
            });
        }

        // Botón Salir con confirmación
        const btnSalir = document.getElementById('btnSalir');
        if (btnSalir) {
            btnSalir.addEventListener('click', (e) => {
                e.preventDefault(); 
                swal({
                    title: "¿Cerrar Sesión?",
                    icon: "warning",
                    buttons: ["Cancelar", "Salir"],
                    dangerMode: true,
                })
                .then((willLogout) => {
                    if (willLogout) {
                        window.location.href = "index.html";
                    }
                });
            });
        }
    }
});