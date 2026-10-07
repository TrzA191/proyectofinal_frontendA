import { buscarProductos } from '../api/api';
import type { Producto } from '../types';

export function mostrarProductos() {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (!app) return;

    app.innerHTML = `
        <div class="dashboard">
            <header class="dashboard-header">
                <div>
                    <h1>Sistema Comercial</h1>
                    <span>Consulta de productos</span>
                </div>
                <button id="volver-dashboard" class="logout-button">
                    Volver
                </button>
            </header>

            <main class="dashboard-content">
                <section class="welcome-card">
                    <div>
                        <h2>Buscar productos</h2>
                        <p>Consulta los productos disponibles en el sistema.</p>
                    </div>
                </section>

                <section class="search-card">
                    <form id="buscar-productos-form">
                        <div class="form-group">
                            <label for="filtro">Buscar producto</label>
                            <input
                                type="text"
                                id="filtro"
                                placeholder="Nombre o código SKU"
                            />
                        </div>

                        <button type="submit">
                            🔎 Buscar
                        </button>
                    </form>

                    <p id="productos-error" class="error"></p>
                </section>

                <section id="productos-resultados" class="products-grid">
                    <p>Escribe un filtro y realiza una búsqueda.</p>
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
        .querySelector<HTMLFormElement>('#buscar-productos-form')
        ?.addEventListener('submit', async (event) => {
            event.preventDefault();

            const filtro =
                document.querySelector<HTMLInputElement>('#filtro')?.value || '';

            const resultados =
                document.querySelector<HTMLDivElement>('#productos-resultados');

            const error =
                document.querySelector<HTMLParagraphElement>('#productos-error');

            if (!resultados || !error) return;

            error.textContent = '';
            resultados.innerHTML = '<p>Buscando productos...</p>';

            try {
                const data = await buscarProductos(filtro);

                if (!data.productos || data.productos.length === 0) {
                    resultados.innerHTML = `
                        <div class="empty-state">
                            <p>No se encontraron productos.</p>
                        </div>
                    `;
                    return;
                }

                resultados.innerHTML = data.productos
                    .map((producto: Producto) => `
                        <article class="product-card">
                            <h3>${producto.Nombre ?? producto.nombre ?? 'Sin nombre'}</h3>

                            <p>
                                <strong>SKU:</strong>
                                ${producto.CodigoSKU ?? producto.codigoSKU ?? 'N/A'}
                            </p>

                            <p>
                                <strong>Precio:</strong>
                                $${producto.Precio ?? producto.precio ?? 0}
                            </p>

                            <p>
                                <strong>Stock:</strong>
                                ${producto.Stock ?? producto.stock ?? 0}
                            </p>
                        </article>
                    `)
                    .join('');

            } catch (err) {
                resultados.innerHTML = '';
                error.textContent =
                    err instanceof Error
                        ? err.message
                        : 'Error al consultar productos';
            }
        });
}