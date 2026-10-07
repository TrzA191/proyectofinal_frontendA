import './style.css';

import { mostrarLogin } from './pages/login';
import { mostrarDashboard } from './pages/dashboard';
import { mostrarProductos } from './pages/productos';
import { mostrarHistorial } from './pages/historial';
import { mostrarAdmin } from './pages/admin';
mostrarLogin();

window.addEventListener('login-success', () => {
    mostrarDashboard();
});

window.addEventListener('mostrar-productos', () => {
    mostrarProductos();
});

window.addEventListener('volver-dashboard', () => {
    mostrarDashboard();
});

window.addEventListener('logout', () => {
    mostrarLogin();
});

window.addEventListener('mostrar-historial', () => {
    mostrarHistorial();
});

window.addEventListener('mostrar-admin', () => {
    mostrarAdmin();
});