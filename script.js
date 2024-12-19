
const API_BASE = 'http://localhost:3000/api';
const currentPage = '/login';
const formTitle = document.getElementById('form-title');
const authForm = document.getElementById('auth-form');
const errorMessage = document.getElementById('error-message');

function getToken() {
    return localStorage.getItem('token');
}

function isTokenValid() {
    const token = getToken();
    console.log(token);
    if (!token) return false;

    // Verifica si el token tiene el formato de un JWT (tres partes separadas por ".")
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        console.warn('El token no tiene el formato esperado de un JWT.');
        return false;
    }

    try {
        // Decodifica la carga útil del JWT
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
        return payload.exp > currentTime; // El token es válido si no ha expirado
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return false; // Token inválido
    }
}

if (isTokenValid()) {
    window.location.href = '/index.html'; // Redirige si el token es válido
}

async function login(email, password) {
    try {
        const response = await axios.post(`${API_BASE}/auth/sign-in`, { email, password });
        console.log(response);
        const token = response.data.token.token;
        const codigo = response.data.codigo;

        console.log(token);
        if (response.data.status === "ok") {
            // Guardar el token en el localStorage
            localStorage.setItem('token', JSON.stringify(token));
            localStorage.setItem('codigoUsuario', JSON.stringify(codigo));

            window.location.href = '/index.html';
        } else {
            alert(response.data.errors.message);
        }



    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Credenciales incorrectas');
    }
}


// Función para manejar el envío del formulario
authForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        let response;
        login(email, password);

    } catch (error) {
        if (error.response) {
            console.error('Error del servidor:', error.response.data); // Muestra los errores devueltos
            errorMessage.textContent = error.response.data.errors
                .map(err => `${err.path}: ${err.message}`)
                .join('\n'); // Muestra los errores específicos al usuario
        } else {
            console.error('Error desconocido:', error);
            errorMessage.textContent = 'Ha ocurrido un error desconocido.';
        }
        errorMessage.style.display = 'block';
    }
});

