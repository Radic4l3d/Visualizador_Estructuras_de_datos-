// --- 1. CONFIGURACIÓN DE FIREBASE ---
let db, auth, user;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'demo-structs';

// Intentar inicializar Firebase con las variables del entorno
try {
    if (typeof __firebase_config !== 'undefined') {
        const firebaseConfig = JSON.parse(__firebase_config);
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        
        // Autenticación Anónima para persistencia por usuario
        auth.signInAnonymously().then((u) => {
            user = u.user;
            console.log("Usuario autenticado:", user.uid);
            App.setStatus("✅ Conectado al servidor");
        });
    } else {
        console.warn("Configuración de Firebase no encontrada. Modo Offline.");
    }
} catch (e) {
    console.warn("Error inicializando Firebase:", e);
}

// --- 2. LÓGICA DE LA APLICACIÓN (Patrón Módulo) ---
const App = {
    state: {
        pila: [] // Array simple como fuente de verdad
    },

    // --- Navegación entre pestañas ---
    navigate: (section, event) => {
        // Actualizar botones del menú
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        if(event) event.target.classList.add('active');

        // Mostrar sección correspondiente
        document.querySelectorAll('.section-container').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
    },

    // --- Helpers de UI ---
    setStatus: (msg) => {
        document.getElementById('stack-status').innerText = msg;
    },

    setCode: (code) => {
        const el = document.getElementById('code-output');
        el.innerText = code;
        el.scrollTop = 0;
    },

    // --- OPERACIONES DE PILA ---

    pushStack: () => {
        const input = document.getElementById('stack-input');
        const val = input.value.trim();
        
        if (!val) {
            alert("Por favor ingrese un valor numérico");
            return;
        }

        // 1. Actualizar Estado
        App.state.pila.push(val);

        // 2. Renderizar Visualmente
        App.renderPush(val);

        // 3. Generar Código C explicativo
        App.setCode(`void push(int valor) {
    // 1. Reservar memoria
    Nodo* nuevo = (Nodo*)malloc(sizeof(Nodo));
    
    // 2. Asignar datos
    nuevo->dato = ${val};
    
    // 3. El nuevo nodo apunta al antiguo tope
    nuevo->siguiente = tope;
    
    // 4. Actualizar el puntero tope
    tope = nuevo;
    
    printf("Elemento %d apilado", valor);
}`);
        
        // Limpieza
        input.value = '';
        input.focus();
        App.setStatus(`Elemento ${val} apilado`);
    },

    popStack: () => {
        if (App.state.pila.length === 0) {
            alert("Error: La pila está vacía (Stack Underflow)");
            App.setCode(`int pop() {
    if (tope == NULL) {
        printf("Stack Underflow\\n");
        return -1;
    }
    // ...
}`);
            return;
        }

        // 1. Obtener valor a eliminar
        const val = App.state.pila[App.state.pila.length - 1];

        // 2. Animar Salida en el DOM
        const container = document.getElementById('stack-container');
        // Importante: Como usamos column-reverse, el último elemento visual (Tope) 
        // es el último hijo del contenedor DOM.
        const node = container.lastElementChild; 
        
        if (node) {
            // Activar clase CSS de salida
            node.classList.add('removing');
            
            // Esperar a que termine la animación (400ms) antes de eliminar lógica
            setTimeout(() => {
                App.state.pila.pop(); // Eliminar del array
                node.remove();        // Eliminar del DOM
                App.setStatus(`Elemento ${val} eliminado`);
            }, 400);
        }

        // 3. Mostrar Código C
        App.setCode(`int pop() {
    if (tope == NULL) return -1;

    Nodo* temp = tope;     // tope apunta al nodo [${val}]
    int valor = temp->dato;
    
    // El tope baja al siguiente nodo
    tope = tope->siguiente;
    
    free(temp); // Liberar memoria
    return valor;
}`);
    },

    // --- RENDERIZADO ---
    
    renderPush: (val) => {
        const container = document.getElementById('stack-container');
        
        const node = document.createElement('div');
        node.className = 'stack-node';
        node.innerText = val;
        
        // Simplemente agregamos al final (appendChild).
        // CSS flex-direction: column-reverse se encarga de ponerlo arriba.
        container.appendChild(node);
    },

    renderFullStack: () => {
        const container = document.getElementById('stack-container');
        container.innerHTML = ''; // Limpiar todo
        
        App.state.pila.forEach(val => {
            const node = document.createElement('div');
            node.className = 'stack-node';
            // Quitamos la animación de entrada si estamos cargando masivamente
            // node.style.animation = 'none'; 
            node.innerText = val;
            container.appendChild(node);
        });
    },

    resetStack: () => {
        if(confirm("¿Desea limpiar la pila actual?")) {
            App.state.pila = [];
            document.getElementById('stack-container').innerHTML = '';
            App.setCode("// Pila reiniciada");
            App.setStatus("Nueva pila lista");
        }
    },

    // --- PERSISTENCIA (FIREBASE) ---
    
    saveStack: () => {
        if (!user || !db) { alert("Modo Offline: No se puede guardar en la nube."); return; }
        
        // Estructura: artifacts / {appId} / users / {uid} / data / saved_stack
        const docRef = db.collection('artifacts').doc(appId)
                         .collection('users').doc(user.uid)
                         .collection('data').doc('saved_stack');

        docRef.set({
            elements: App.state.pila,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            App.setStatus("✅ Pila guardada en la nube");
            alert("Pila guardada exitosamente");
        })
        .catch((err) => {
            console.error(err);
            alert("Error al guardar");
        });
    },

    loadStack: () => {
        if (!user || !db) { alert("Modo Offline: No se puede cargar de la nube."); return; }

        const docRef = db.collection('artifacts').doc(appId)
                         .collection('users').doc(user.uid)
                         .collection('data').doc('saved_stack');

        docRef.get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                App.state.pila = data.elements || [];
                App.renderFullStack();
                App.setStatus("📂 Pila cargada desde la nube");
                App.setCode("// Estructura recuperada del servidor");
            } else {
                alert("No hay una pila guardada previamente");
            }
        }).catch((err) => {
            console.error(err);
            alert("Error al cargar");
        });
    }
};

// Mensaje inicial
App.setCode("// Seleccione una operación para ver su código en C");


