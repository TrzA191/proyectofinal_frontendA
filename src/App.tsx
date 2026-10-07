import { useEffect, useState, type FormEvent } from 'react';
import {
    buscarProductos,
    crearProducto,
    login,
    obtenerHistorial
} from './api/api';
import type { Producto, Usuario } from './types';

type Vista = 'dashboard' | 'productos' | 'historial' | 'admin';

function esUsuario(valor: unknown): valor is Usuario {
    return (
        typeof valor === 'object' &&
        valor !== null &&
        'usuarioGuid' in valor &&
        typeof valor.usuarioGuid === 'string' &&
        'nombreCompleto' in valor &&
        typeof valor.nombreCompleto === 'string' &&
        'email' in valor &&
        typeof valor.email === 'string' &&
        'rol' in valor &&
        typeof valor.rol === 'string'
    );
}

function obtenerUsuarioGuardado(): Usuario | null {
    const token = sessionStorage.getItem('token');
    const usuarioGuardado = sessionStorage.getItem('usuario');

    if (!token || !usuarioGuardado) {
        return null;
    }

    try {
        const usuario: unknown = JSON.parse(usuarioGuardado);

        if (esUsuario(usuario)) {
            return usuario;
        }
    } catch {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');
        return null;
    }

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    return null;
}

export default function App() {
    const [usuario, setUsuario] = useState<Usuario | null>(obtenerUsuarioGuardado);
    const [vista, setVista] = useState<Vista>('dashboard');

    useEffect(() => {
        const cerrarSesion = () => {
            setUsuario(null);
            setVista('dashboard');
        };

        window.addEventListener('logout', cerrarSesion);
        return () => window.removeEventListener('logout', cerrarSesion);
    }, []);

    const iniciarSesion = (usuarioAutenticado: Usuario) => {
        setUsuario(usuarioAutenticado);
        setVista('dashboard');
    };

    const cerrarSesion = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');
        setUsuario(null);
        setVista('dashboard');
    };

    if (!usuario) {
        return <Login onLogin={iniciarSesion} />;
    }

    const esAdmin = ['admin', 'administrador'].includes(
        usuario.rol.toLowerCase()
    );

    const titulos: Record<Vista, string> = {
        dashboard: 'Panel principal',
        productos: 'Consulta de productos',
        historial: 'Historial de compras',
        admin: 'Administración de productos'
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Sistema Comercial</h1>
                    <span>{titulos[vista]}</span>
                </div>
                <div className="header-actions">
                    <span className="header-user" aria-label="Usuario conectado">
                        {usuario.nombreCompleto}
                    </span>
                    {vista !== 'dashboard' && (
                        <button
                            className="logout-button"
                            onClick={() => setVista('dashboard')}
                        >
                            Volver
                        </button>
                    )}
                    <button className="logout-button" onClick={cerrarSesion}>
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                {vista === 'dashboard' && (
                    <Dashboard
                        usuario={usuario}
                        esAdmin={esAdmin}
                        onNavigate={setVista}
                    />
                )}
                {vista === 'productos' && <Productos />}
                {vista === 'historial' && <Historial />}
                {vista === 'admin' && esAdmin && <Administracion usuario={usuario} />}
            </main>
        </div>
    );
}

function Login({ onLogin }: { onLogin: (usuario: Usuario) => void }) {
    const [error, setError] = useState('');
    const [enviando, setEnviando] = useState(false);

    const manejarEnvio = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setEnviando(true);

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get('email') ?? '');
        const password = String(formData.get('password') ?? '');

        try {
            const data = await login(email, password);
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
            onLogin(data.usuario);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Sistema Comercial</h1>
                <p>Iniciar sesión</p>
                <form onSubmit={manejarEnvio}>
                    <div className="form-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="usuario@ejemplo.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Contraseña"
                            required
                        />
                    </div>
                    <button type="submit" disabled={enviando}>
                        {enviando ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                    <p className="error">{error}</p>
                </form>
            </div>
        </div>
    );
}

function Dashboard({
    usuario,
    esAdmin,
    onNavigate
}: {
    usuario: Usuario;
    esAdmin: boolean;
    onNavigate: (vista: Vista) => void;
}) {
    return (
        <>
            <section className="welcome-card">
                <div>
                    <h2>Bienvenido, {usuario.nombreCompleto}</h2>
                    <p>{usuario.email}</p>
                </div>
                <span className="role-badge">{usuario.rol}</span>
            </section>
            <section className="menu-grid">
                <button className="menu-card" onClick={() => onNavigate('productos')}>
                    <span className="menu-icon">🔎</span>
                    <span className="menu-title">Productos</span>
                    <span className="menu-description">
                        Buscar productos disponibles
                    </span>
                </button>
                <button className="menu-card" onClick={() => onNavigate('historial')}>
                    <span className="menu-icon">🛒</span>
                    <span className="menu-title">Mis compras</span>
                    <span className="menu-description">
                        Consultar historial de compras
                    </span>
                </button>
                {esAdmin && (
                    <button
                        className="menu-card admin-card"
                        onClick={() => onNavigate('admin')}
                    >
                        <span className="menu-icon">⚙️</span>
                        <span className="menu-title">Administración</span>
                        <span className="menu-description">
                            Crear y administrar productos
                        </span>
                    </button>
                )}
            </section>
        </>
    );
}

function Productos() {
    const [productos, setProductos] = useState<Producto[] | null>(null);
    const [error, setError] = useState('');
    const [buscando, setBuscando] = useState(false);

    const manejarBusqueda = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setBuscando(true);

        const formData = new FormData(event.currentTarget);

        try {
            const data = await buscarProductos(String(formData.get('filtro') ?? ''));
            setProductos(data.productos ?? []);
        } catch (err) {
            setProductos(null);
            setError(
                err instanceof Error ? err.message : 'Error al consultar productos'
            );
        } finally {
            setBuscando(false);
        }
    };

    return (
        <>
            <section className="welcome-card">
                <div>
                    <h2>Buscar productos</h2>
                    <p>Consulta los productos disponibles en el sistema.</p>
                </div>
            </section>
            <section className="search-card">
                <form onSubmit={manejarBusqueda}>
                    <div className="form-group">
                        <label htmlFor="filtro">Buscar producto</label>
                        <input
                            type="text"
                            id="filtro"
                            name="filtro"
                            placeholder="Nombre o código SKU"
                        />
                    </div>
                    <button type="submit" disabled={buscando}>
                        {buscando ? 'Buscando...' : '🔎 Buscar'}
                    </button>
                </form>
                <p className="error">{error}</p>
            </section>
            <section className="products-grid">
                {productos === null ? (
                    <p>Escribe un filtro y realiza una búsqueda.</p>
                ) : productos.length === 0 ? (
                    <div className="empty-state">
                        <p>No se encontraron productos.</p>
                    </div>
                ) : (
                    productos.map((producto, index) => (
                        <article className="product-card" key={`${producto.CodigoSKU ?? producto.codigoSKU ?? index}`}>
                            <h3>{producto.Nombre ?? producto.nombre ?? 'Sin nombre'}</h3>
                            <p>
                                <strong>SKU:</strong>
                                {producto.CodigoSKU ?? producto.codigoSKU ?? 'N/A'}
                            </p>
                            <p>
                                <strong>Precio:</strong>$
                                {producto.Precio ?? producto.precio ?? 0}
                            </p>
                            <p>
                                <strong>Stock:</strong>
                                {producto.Stock ?? producto.stock ?? 0}
                            </p>
                        </article>
                    ))
                )}
            </section>
        </>
    );
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null;
}

function primerValor(
    compra: Record<string, unknown>,
    campos: string[],
    defecto: string
): string | number {
    for (const campo of campos) {
        const valor = compra[campo];
        if (typeof valor === 'string' || typeof valor === 'number') {
            return valor;
        }
    }
    return defecto;
}

function Historial() {
    const [compras, setCompras] = useState<unknown[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let activo = true;

        obtenerHistorial()
            .then((data) => {
                if (activo) setCompras(data.historial ?? []);
            })
            .catch((err: unknown) => {
                if (activo) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Error al consultar el historial'
                    );
                }
            });

        return () => {
            activo = false;
        };
    }, []);

    return (
        <>
            <section className="welcome-card">
                <div>
                    <h2>Mis compras</h2>
                    <p>Consulta el historial de compras de tu cuenta.</p>
                </div>
            </section>
            {compras === null && !error && (
                <section className="products-grid">
                    <p>Consultando historial...</p>
                </section>
            )}
            {compras?.length === 0 && (
                <div className="empty-state">
                    <h3>Sin compras</h3>
                    <p>No se encontraron compras para este usuario.</p>
                </div>
            )}
            {compras && compras.length > 0 && (
                <section className="products-grid">
                    {compras.map((valor, index) => {
                        const compra = esRegistro(valor) ? valor : {};
                        return (
                            <article className="product-card" key={index}>
                                <h3>
                                    {primerValor(
                                        compra,
                                        ['NombreProducto', 'Nombre'],
                                        'Producto'
                                    )}
                                </h3>
                                <p>
                                    <strong>Fecha:</strong>
                                    {primerValor(compra, ['FechaVenta', 'Fecha'], 'N/A')}
                                </p>
                                <p>
                                    <strong>Cantidad:</strong>
                                    {primerValor(compra, ['Cantidad'], '0')}
                                </p>
                                <p>
                                    <strong>Total:</strong>$
                                    {primerValor(
                                        compra,
                                        ['Total', 'PrecioTotal'],
                                        '0'
                                    )}
                                </p>
                            </article>
                        );
                    })}
                </section>
            )}
            <p className="error">{error}</p>
        </>
    );
}

function Administracion({ usuario }: { usuario: Usuario }) {
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const manejarCreacion = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const codigoSKU = String(formData.get('codigoSKU') ?? '').trim();
        const nombre = String(formData.get('nombre') ?? '').trim();
        const precio = Number(formData.get('precio'));
        const stock = Number(formData.get('stock'));

        if (codigoSKU.length < 3 || codigoSKU.length > 20) {
            setError(true);
            setMensaje('El código SKU debe tener entre 3 y 20 caracteres.');
            return;
        }
        if (nombre.length < 2 || nombre.length > 150) {
            setError(true);
            setMensaje('El nombre debe tener entre 2 y 150 caracteres.');
            return;
        }
        if (!Number.isFinite(precio) || precio <= 0) {
            setError(true);
            setMensaje('El precio debe ser mayor que cero.');
            return;
        }
        if (!Number.isInteger(stock) || stock < 0) {
            setError(true);
            setMensaje('El stock debe ser un número entero igual o mayor que cero.');
            return;
        }

        setError(false);
        setMensaje('Creando producto...');
        setEnviando(true);

        try {
            const data = await crearProducto(codigoSKU, nombre, precio, stock);
            setMensaje(data.mensaje || 'Producto creado exitosamente');
            form.reset();
        } catch (err) {
            setError(true);
            setMensaje(err instanceof Error ? err.message : 'Error al crear producto');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <>
            <section className="welcome-card">
                <div>
                    <h2>Crear producto</h2>
                    <p>Registra un nuevo producto en el sistema.</p>
                </div>
                <span className="role-badge">{usuario.rol}</span>
            </section>
            <section className="search-card">
                <form onSubmit={manejarCreacion}>
                    <div className="form-group">
                        <label htmlFor="codigoSKU">Código SKU</label>
                        <input name="codigoSKU" id="codigoSKU" placeholder="PROD-013" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre</label>
                        <input name="nombre" id="nombre" placeholder="Nombre del producto" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="precio">Precio</label>
                        <input
                            name="precio"
                            id="precio"
                            type="number"
                            step="0.01"
                            placeholder="999.99"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="stock">Stock</label>
                        <input
                            name="stock"
                            id="stock"
                            type="number"
                            placeholder="10"
                            required
                        />
                    </div>
                    <button type="submit" disabled={enviando}>
                        {enviando ? 'Creando producto...' : 'Crear producto'}
                    </button>
                </form>
                <p id="admin-mensaje" className={error ? 'error' : ''}>
                    {mensaje}
                </p>
            </section>
        </>
    );
}
