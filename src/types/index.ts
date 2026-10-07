export interface Usuario {
    usuarioGuid: string;
    nombreCompleto: string;
    email: string;
    rol: string;
}

export interface LoginResponse {
    mensaje: string;
    token: string;
    usuario: Usuario;
}

export interface Producto {
    CodigoSKU?: string;
    Nombre?: string;
    Precio?: number;
    Stock?: number;

    codigoSKU?: string;
    nombre?: string;
    precio?: number;
    stock?: number;
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

export interface BuscarProductosResponse {
    productos: Producto[];
}