import type {
    CrearProductoResponse,
    LoginResponse,
    BuscarProductosResponse,
    HistorialResponse
} from '../types';
const API_URL = 'http://localhost:3000/api';
function obtenerToken(): string | null {
    return sessionStorage.getItem('token');
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiereAuth = false
): Promise<T> {

    const headers = new Headers(options.headers);

    headers.set('Content-Type', 'application/json');

    if (requiereAuth) {
        const token = obtenerToken();

        if (!token) {
            throw new Error('Sesión no válida o expirada');
        }

        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    let data: any = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');

        window.dispatchEvent(new CustomEvent('logout'));

        throw new Error('Sesión expirada. Inicia sesión nuevamente.');
    }

    if (response.status === 403) {
        throw new Error('No tienes permisos para realizar esta operación.');
    }

    if (!response.ok) {
        throw new Error(
            data.error || 'No fue posible completar la operación'
        );
    }

    return data;
}

export async function login(
    email: string,
    password: string
): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

export async function buscarProductos(
    filtro: string
): Promise<BuscarProductosResponse> {

    return request<BuscarProductosResponse>(
        `/productos/buscar?filtro=${encodeURIComponent(filtro)}`,
        {},
        true
    );
}

export async function obtenerHistorial(): Promise<HistorialResponse> {
    return request<HistorialResponse>(
        '/productos/historial',
        {},
        true
    );
}

export async function crearProducto(
    codigoSKU: string,
    nombre: string,
    precio: number,
    stock: number
): Promise<CrearProductoResponse> {
    return request<CrearProductoResponse>(
        '/productos/crear',
        {
            method: 'POST',
            body: JSON.stringify({
                codigoSKU,
                nombre,
                precio,
                stock
            })
        },
        true
    );
}