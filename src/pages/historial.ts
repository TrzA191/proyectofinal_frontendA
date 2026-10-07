import { obtenerHistorial } from '../api/api';


export function mostrarHistorial() {
    const app = document.querySelector<HTMLDivElement>('#app');

    if (!app) return;

    const usuarioGuardado = sessionStorage.getItem('usuario');

    if (!usuarioGuardado) {
        window.dispatchEvent(new CustomEvent('logout'));
        return;
    }

    app.innerHTML = `
        <div class="dashboard">
            <header class="dashboard-header">
                <div>
                    <h1>Sistema Comercial</h1>
                    <span>Historial de compras</span>
                </div>

                <button id="volver-dashboard" class="logout-button">
                    Volver
                </button>
            </header>

            <main class="dashboard-content">

                <section class="welcome-card">
                    <div>
                        <h2>Mis compras</h2>
                        <p>
                            Consulta el historial de compras de tu cuenta.
                        </p>
                    </div>
                </section>

                <section
                    id="historial-resultados"
                    class="products-grid"
                >
                    <p>Consultando historial...</p>
                </section>

                <p id="historial-error" class="error"></p>

            </main>
        </div>
    `;

    document
        .querySelector<HTMLButtonElement>('#volver-dashboard')
        ?.addEventListener('click', () => {
            window.dispatchEvent(
                new CustomEvent('volver-dashboard')
            );
        });

    cargarHistorial();
}

async function cargarHistorial() {
    const resultados =
        document.querySelector<HTMLDivElement>(
            '#historial-resultados'
        );

    const error =
        document.querySelector<HTMLParagraphElement>(
            '#historial-error'
        );

    if (!resultados || !error) return;

    try {

        const data: HistorialResponse =
            await obtenerHistorial();

        if (
            !data.historial ||
            data.historial.length === 0
        ) {
            resultados.innerHTML = `
                <div class="empty-state">
                    <h3>Sin compras</h3>
                    <p>
                        No se encontraron compras para este usuario.
                    </p>
                </div>
            `;
            return;
        }

        resultados.innerHTML = data.historial
            .map((compra: any) => `
                <article class="product-card">

                    <h3>
                        ${compra.NombreProducto ??
                        compra.Nombre ??
                        'Producto'}
                    </h3>

                    <p>
                        <strong>Fecha:</strong>
                        ${compra.FechaVenta ??
                        compra.Fecha ??
                        'N/A'}
                    </p>

                    <p>
                        <strong>Cantidad:</strong>
                        ${compra.Cantidad ?? 0}
                    </p>

                    <p>
                        <strong>Total:</strong>
                        $${compra.Total ??
                        compra.PrecioTotal ??
                        0}
                    </p>

                </article>
            `)
            .join('');

    } catch (err) {

        resultados.innerHTML = '';

        error.textContent =
            err instanceof Error
                ? err.message
                : 'Error al consultar el historial';
    }
}


export interface HistorialResponse {
    usuarioGuid: string;
    historial: unknown[];
}

export interface CrearProductoResponse {
    mensaje: string;
    nuevoProductoId?: number;
    productGuid?: string;
}