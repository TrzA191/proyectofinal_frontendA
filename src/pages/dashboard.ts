import type { Usuario } from '../types';

export function mostrarDashboard() {
    const app = document.querySelector<HTMLDivElement>('#app');

    if (!app) return;

    // Verificar que exista una sesión válida en el frontend
    const token = sessionStorage.getItem('token');
    const usuarioGuardado = sessionStorage.getItem('usuario');

    if (!token || !usuarioGuardado) {
        window.dispatchEvent(new CustomEvent('logout'));
        return;
    }

    const usuario: Usuario = JSON.parse(usuarioGuardado);

    const esAdmin =
        usuario.rol.toLowerCase() === 'admin' ||
        usuario.rol.toLowerCase() === 'administrador';

    app.innerHTML = `
        <div class="dashboard">

            <header class="dashboard-header">
                <div>
                    <h1>Sistema Comercial</h1>
                    <span>Panel principal</span>
                </div>

                <button id="logout-button" class="logout-button">
                    Cerrar sesión
                </button>
            </header>

            <main class="dashboard-content">

                <section class="welcome-card">
                    <div>
                        <h2>Bienvenido, ${usuario.nombreCompleto}</h2>
                        <p>${usuario.email}</p>
                    </div>

                    <span class="role-badge">
                        ${usuario.rol}
                    </span>
                </section>

                <section class="menu-grid">

                    <button class="menu-card" id="productos-button">
                        <span class="menu-icon">🔎</span>
                        <span class="menu-title">Productos</span>
                        <span class="menu-description">
                            Buscar productos disponibles
                        </span>
                    </button>

                    <button class="menu-card" id="historial-button">
                        <span class="menu-icon">🛒</span>
                        <span class="menu-title">Mis compras</span>
                        <span class="menu-description">
                            Consultar historial de compras
                        </span>
                    </button>

                    ${
                        esAdmin
                            ? `
                                <button
                                    class="menu-card admin-card"
                                    id="admin-button"
                                >
                                    <span class="menu-icon">⚙️</span>
                                    <span class="menu-title">
                                        Administración
                                    </span>
                                    <span class="menu-description">
                                        Crear y administrar productos
                                    </span>
                                </button>
                            `
                            : ''
                    }

                </section>

            </main>

        </div>
    `;

    // Cerrar sesión
    document
        .querySelector<HTMLButtonElement>('#logout-button')
        ?.addEventListener('click', () => {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('usuario');

            window.dispatchEvent(new CustomEvent('logout'));
        });

    // Productos
    document
        .querySelector<HTMLButtonElement>('#productos-button')
        ?.addEventListener('click', () => {
            window.dispatchEvent(
                new CustomEvent('mostrar-productos')
            );
        });

    // Historial
    document
        .querySelector<HTMLButtonElement>('#historial-button')
        ?.addEventListener('click', () => {
            window.dispatchEvent(
                new CustomEvent('mostrar-historial')
            );
        });

    // Administración
    document
        .querySelector<HTMLButtonElement>('#admin-button')
        ?.addEventListener('click', () => {
            window.dispatchEvent(
                new CustomEvent('mostrar-admin')
            );
        });
}