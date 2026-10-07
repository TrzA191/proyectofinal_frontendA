import { login } from '../api/api';
import type { LoginResponse } from '../types';

export function mostrarLogin() {
    const app = document.querySelector<HTMLDivElement>('#app');

    if (!app) return;

    app.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <h1>Sistema Comercial</h1>
                <p>Iniciar sesión</p>

                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="usuario@ejemplo.com"
                            required
                        />
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Contraseña"
                            required
                        />
                    </div>

                    <button type="submit">
                        Iniciar sesión
                    </button>

                    <p id="login-error" class="error"></p>
                </form>
            </div>
        </div>
    `;

    const form = document.querySelector<HTMLFormElement>('#login-form');
    const error = document.querySelector<HTMLParagraphElement>('#login-error');

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.querySelector<HTMLInputElement>('#email')?.value;
        const password = document.querySelector<HTMLInputElement>('#password')?.value;

        if (!email || !password) {
            if (error) {
                error.textContent = 'Ingresa correo y contraseña';
            }
            return;
        }

        try {
            const data: LoginResponse = await login(email, password);

            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

            window.dispatchEvent(new CustomEvent('login-success'));

        } catch (err) {
            if (error) {
                error.textContent =
                    err instanceof Error
                        ? err.message
                        : 'Error al iniciar sesión';
            }
        }
    });
}