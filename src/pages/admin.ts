import { crearProducto } from '../api/api';


export function mostrarAdmin() {
    const app = document.querySelector<HTMLDivElement>('#app');

    if (!app) return;

    const usuarioGuardado = sessionStorage.getItem('usuario');

    if (!usuarioGuardado) {
        window.dispatchEvent(new CustomEvent('logout'));
        return;
    }

    const usuario = JSON.parse(usuarioGuardado);

    app.innerHTML = `
        <div class="dashboard">
            <header class="dashboard-header">
                <div>
                    <h1>Sistema Comercial</h1>
                    <span>Administración de productos</span>
                </div>

                <button id="volver-dashboard" class="logout-button">
                    Volver
                </button>
            </header>

            <main class="dashboard-content">

                <section class="welcome-card">
                    <div>
                        <h2>Crear producto</h2>
                        <p>
                            Registra un nuevo producto en el sistema.
                        </p>
                    </div>

                    <span class="role-badge">
                        ${usuario.rol}
                    </span>
                </section>

                <section class="search-card">

                    <form id="crear-producto-form">

                        <div class="form-group">
                            <label for="codigoSKU">Código SKU</label>
                            <input
                                type="text"
                                id="codigoSKU"
                                placeholder="PROD-013"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                placeholder="Nombre del producto"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="precio">Precio</label>
                            <input
                                type="number"
                                id="precio"
                                step="0.01"
                                placeholder="999.99"
                                required
                            />
                        </div>

                        <div class="form-group">
                            <label for="stock">Stock</label>
                            <input
                                type="number"
                                id="stock"
                                placeholder="10"
                                required
                            />
                        </div>

                        <button type="submit">
                            Crear producto
                        </button>

                    </form>

                    <p id="admin-mensaje"></p>
                </section>

            </main>
        </div>
    `;

    document
        .querySelector<HTMLButtonElement>('#volver-dashboard')
        ?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('volver-dashboard'));
        });

    document
        .querySelector<HTMLFormElement>('#crear-producto-form')
        ?.addEventListener('submit', async (event) => {

            event.preventDefault();

            const codigoSKU =
                document.querySelector<HTMLInputElement>('#codigoSKU')?.value || '';

            const nombre =
                document.querySelector<HTMLInputElement>('#nombre')?.value || '';

            const precio =
                Number(
                    document.querySelector<HTMLInputElement>('#precio')?.value
                );

            const stock =
                Number(
                    document.querySelector<HTMLInputElement>('#stock')?.value
                );

            const mensaje =
                document.querySelector<HTMLParagraphElement>('#admin-mensaje');

            if (!mensaje) return;

            // Validación del lado del cliente
            if (
                codigoSKU.trim().length < 3 ||
                codigoSKU.trim().length > 20
            ) {
                mensaje.textContent =
                    'El código SKU debe tener entre 3 y 20 caracteres.';
                return;
            }

            if (
                nombre.trim().length < 2 ||
                nombre.trim().length > 150
            ) {
                mensaje.textContent =
                    'El nombre debe tener entre 2 y 150 caracteres.';
                return;
            }

            if (!Number.isFinite(precio) || precio <= 0) {
                mensaje.textContent =
                    'El precio debe ser mayor que cero.';
                return;
            }

            if (!Number.isInteger(stock) || stock < 0) {
                mensaje.textContent =
                    'El stock debe ser un número entero igual o mayor que cero.';
                return;
            }

            mensaje.textContent = 'Creando producto...';

            try {

                const data: CrearProductoResponse = await crearProducto(
                    codigoSKU.trim(),
                    nombre.trim(),
                    precio,
                    stock
                );

                mensaje.textContent =
                    data.mensaje || 'Producto creado exitosamente';

                document
                    .querySelector<HTMLFormElement>(
                        '#crear-producto-form'
                    )
                    ?.reset();

            } catch (err) {

                mensaje.textContent =
                    err instanceof Error
                        ? err.message
                        : 'Error al crear producto';
            }
        });
}


export interface CrearProductoResponse {
    mensaje: string;
    nuevoProductoId?: number;
    productGuid?: string;
}