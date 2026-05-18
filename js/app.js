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
    let userData = JSON.parse(localStorage.getItem('pokemonBankUser'));

    function generarPDF(tipo, monto, saldoActual) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(204, 0, 0); 
        doc.text("Pokémon Bank ATM", 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Comprobante de Transaccion", 20, 30);
        
        doc.setFontSize(12);
        doc.text(`Fecha y Hora: ${new Date().toLocaleString()}`, 20, 45);
        doc.text(`Tipo de Movimiento: ${tipo}`, 20, 55);
        doc.text(`Monto: $${parseFloat(Math.abs(monto)).toFixed(2)}`, 20, 65);
        doc.text(`Saldo Disponible: $${parseFloat(saldoActual).toFixed(2)}`, 20, 75);
        
        doc.save(`Comprobante_${tipo.replace(/\s+/g, '')}.pdf`);
    }

    const loginForm = document.getElementById('loginForm'); 
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const pinInput = document.getElementById('pinInput').value;
            
            const constraints = {
                pin: {
                    presence: { allowEmpty: false },
                    length: { is: 4 },
                    format: { pattern: "[0-9]+" }
                }
            };
            
            if (validate({ pin: pinInput }, constraints)) {
                return swal("Error", "El PIN debe tener exactamente 4 números.", "error");
            }

            if (pinInput === userData.pin) {
                swal("¡Bienvenido!", `Hola, ${userData.nombre}`, "success")
                .then(() => window.location.href = "acciones.html");
            } else {
                swal("PIN Incorrecto", "El PIN no es válido.", "error");
            }
        });
    }

    const nombreUsuarioEl = document.getElementById('nombreUsuario');
    if (nombreUsuarioEl) {
        nombreUsuarioEl.innerText = userData.nombre;
        document.getElementById('cuentaUsuario').innerText = userData.cuenta;

        document.getElementById('btnConsultar')?.addEventListener('click', () => {
            userData = JSON.parse(localStorage.getItem('pokemonBankUser'));
            swal("Consulta de Saldo", `Tu saldo actual es: $${userData.saldo.toFixed(2)}`, "info");
        });

        document.getElementById('btnDepositar')?.addEventListener('click', () => {
            swal({ text: 'Monto a depositar:', content: "input", button: "Depositar" }).then(monto => {
                if (!monto || isNaN(monto) || Number(monto) <= 0) return swal("Error", "Monto inválido.", "error");
                userData = JSON.parse(localStorage.getItem('pokemonBankUser'));
                let montoNum = parseFloat(monto);
                userData.saldo += montoNum;
                userData.transacciones.push({ fecha: new Date().toLocaleString(), tipo: "Depósito", monto: montoNum });
                localStorage.setItem('pokemonBankUser', JSON.stringify(userData));
                
                swal({ title: "¡Éxito!", text: `Depositaste $${montoNum.toFixed(2)}.\n\n¿Descargar comprobante?`, icon: "success", buttons: ["No", "Sí, descargar PDF"] })
                .then(imp => { if (imp) generarPDF("Deposito", montoNum, userData.saldo); });
            });
        });

        document.getElementById('btnRetirar')?.addEventListener('click', () => {
            swal({ text: 'Monto a retirar:', content: "input", button: "Retirar" }).then(monto => {
                if (!monto || isNaN(monto) || Number(monto) <= 0) return swal("Error", "Monto inválido.", "error");
                userData = JSON.parse(localStorage.getItem('pokemonBankUser'));
                let montoNum = parseFloat(monto);
                if (montoNum > userData.saldo) return swal("Fondos insuficientes", `Saldo: $${userData.saldo.toFixed(2)}`, "warning");
                
                userData.saldo -= montoNum;
                userData.transacciones.push({ fecha: new Date().toLocaleString(), tipo: "Retiro", monto: -montoNum });
                localStorage.setItem('pokemonBankUser', JSON.stringify(userData));
                
                swal({ title: "¡Éxito!", text: `Retiraste $${montoNum.toFixed(2)}.\n\n¿Descargar comprobante?`, icon: "success", buttons: ["No", "Sí, descargar PDF"] })
                .then(imp => { if (imp) generarPDF("Retiro", montoNum, userData.saldo); });
            });
        });

        document.querySelectorAll('.pago-servicio').forEach(boton => {
            boton.addEventListener('click', (e) => {
                e.preventDefault();
                const serv = e.target.getAttribute('data-nombre');
                swal({ text: `Monto a pagar por ${serv}:`, content: "input", button: "Pagar" }).then(monto => {
                    if (!monto || isNaN(monto) || Number(monto) <= 0) return swal("Error", "Monto inválido.", "error");
                    userData = JSON.parse(localStorage.getItem('pokemonBankUser'));
                    let montoNum = parseFloat(monto);
                    if (montoNum > userData.saldo) return swal("Fondos insuficientes", `Saldo: $${userData.saldo.toFixed(2)}`, "warning");
                    
                    userData.saldo -= montoNum;
                    userData.transacciones.push({ fecha: new Date().toLocaleString(), tipo: `Pago ${serv}`, monto: -montoNum });
                    localStorage.setItem('pokemonBankUser', JSON.stringify(userData));
                    
                    swal({ title: "¡Éxito!", text: `Pagaste $${montoNum.toFixed(2)} de ${serv}.\n\n¿Descargar comprobante?`, icon: "success", buttons: ["No", "Sí, descargar PDF"] })
                    .then(imp => { if (imp) generarPDF(`Pago_${serv}`, montoNum, userData.saldo); });
                });
            });
        });

        document.getElementById('btnSalir')?.addEventListener('click', (e) => {
            e.preventDefault(); 
            swal({ title: "¿Cerrar Sesión?", icon: "warning", buttons: ["Cancelar", "Salir"], dangerMode: true })
            .then(out => { if (out) window.location.href = "index.html"; });
        });
    }

    const tablaHistorial = document.getElementById('tablaHistorial');
    if (tablaHistorial) {
        if (userData.transacciones.length === 0) {
            tablaHistorial.innerHTML = "<tr><td colspan='3' class='text-center'>No hay movimientos registrados.</td></tr>";
        } else {
            userData.transacciones.forEach(t => {
                let colorClass = t.monto > 0 ? 'text-success' : 'text-danger';
                let signo = t.monto > 0 ? '+' : '';
                tablaHistorial.innerHTML += `<tr>
                    <td>${t.fecha}</td>
                    <td>${t.tipo}</td>
                    <td class="${colorClass} font-weight-bold">${signo}$${t.monto.toFixed(2)}</td>
                </tr>`;
            });
        }
    }

    const ctx = document.getElementById('transaccionesChart');
    if (ctx) {
        let countDep = 0, countRet = 0, countPagos = 0;
        userData.transacciones.forEach(t => {
            if (t.tipo === "Depósito") countDep++;
            else if (t.tipo === "Retiro") countRet++;
            else if (t.tipo.includes("Pago")) countPagos++;
        });

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Depósitos', 'Retiros', 'Pago de Servicios'],
                datasets: [{
                    data: [countDep, countRet, countPagos],
                    backgroundColor: ['#28a745', '#ffc107', '#17a2b8']
                }]
            }
        });
    }
});