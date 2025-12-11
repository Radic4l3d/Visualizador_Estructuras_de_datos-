// --- LÓGICA DE LA APLICACIÓN ---

const App = {
    // Estado en memoria
    state: {
        pila: [],
        cola: []
    },

    // Navegación
    navigate: (section, event) => {
        // Estilos botones
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        if(event) event.target.classList.add('active');
        
        // Mostrar sección
        document.querySelectorAll('.section-container').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
    },

    // ==========================================
    //  PILA (LIFO)
    // ==========================================
    pila: {
        push: () => {
            const input = document.getElementById('stack-input');
            const val = input.value.trim();
            if (!val) return alert("Ingresa un valor");

            // Lógica real
            App.state.pila.push(val);

            // Insertar al final, CSS column-reverse lo pone arriba
            const node = document.createElement('div');
            node.className = 'stack-node';
            node.innerText = val;
            document.getElementById('stack-container').appendChild(node);

            // Mostrar el código C
            App.helpers.setCode('stack', `void push(int val) {
    Nodo* nuevo = (Nodo*)malloc(sizeof(Nodo));
    nuevo->dato = ${val};
    nuevo->siguiente = tope;
    tope = nuevo;
}`);
            App.helpers.setStatus('stack', `Apilado: ${val}`);
            input.value = ''; input.focus();
        },

        pop: () => {
            if (App.state.pila.length === 0) return alert("Pila Vacía (Underflow)");

            const val = App.state.pila[App.state.pila.length - 1]; // Último elemento
            const container = document.getElementById('stack-container');
            const node = container.lastElementChild; // Visualmente el de arriba

            if (node) {
                node.classList.add('removing');
                setTimeout(() => {
                    App.state.pila.pop();
                    node.remove();
                    App.helpers.setStatus('stack', `Desapilado: ${val}`);
                }, 300);
            }

            App.helpers.setCode('stack', `int pop() {
    if(!tope) return -1;
    Nodo* temp = tope; // Dato: ${val}
    tope = tope->siguiente;
    free(temp);
}`);
        },

        // Memoria LOCAL
        save: () => {
            localStorage.setItem('mi_pila', JSON.stringify(App.state.pila));
            alert("Pila guardada en la memoria del dispositivo");
        },
        load: () => {
            const data = localStorage.getItem('mi_pila');
            if (!data) return alert("No hay pila guardada");
            
            App.state.pila = JSON.parse(data);
            const container = document.getElementById('stack-container');
            container.innerHTML = '';
            
            App.state.pila.forEach(val => {
                const node = document.createElement('div');
                node.className = 'stack-node';
                node.innerText = val;
                container.appendChild(node);
            });
            App.helpers.setStatus('stack', "Pila recuperada");
        },
        reset: () => {
            if(!confirm("¿Borrar pila?")) return;
            App.state.pila = [];
            document.getElementById('stack-container').innerHTML = '';
            localStorage.removeItem('mi_pila');
        }
    },

    // ==========================================
    // COLA (FIFO)
    // ==========================================
    cola: {
        enqueue: () => {
            const input = document.getElementById('queue-input');
            const val = input.value.trim();
            if (!val) return alert("Ingresa un valor");

            // Lógica real
            App.state.cola.push(val);

            // Insertar al final = Derecha
            const node = document.createElement('div');
            node.className = 'queue-node';
            node.innerText = val;
            document.getElementById('queue-container').appendChild(node);

            // Mostrar el código C
            App.helpers.setCode('queue', `void enqueue(int val) {
    Nodo* nuevo = (Nodo*)malloc(sizeof(Nodo));
    nuevo->dato = ${val};
    nuevo->siguiente = NULL;
    
    if(final == NULL) 
        frente = final = nuevo;
    else {
        final->siguiente = nuevo;
        final = nuevo;
    }
}`);
            App.helpers.setStatus('queue', `Encolado: ${val}`);
            input.value = ''; input.focus();
        },

        dequeue: () => {
            if (App.state.cola.length === 0) return alert("Cola Vacía (Underflow)");

            const val = App.state.cola[0]; // Primer elemento
            const container = document.getElementById('queue-container');
            const node = container.firstElementChild; // El de la izquierda

            if (node) {
                node.classList.add('removing');
                setTimeout(() => {
                    App.state.cola.shift(); // Eliminar del inicio del array
                    node.remove();
                    App.helpers.setStatus('queue', `Atendido: ${val}`);
                }, 300);
            }

            App.helpers.setCode('queue', `int dequeue() {
    if(!frente) return -1;
    Nodo* temp = frente; // Dato: ${val}
    frente = frente->siguiente;
    if(!frente) final = NULL;
    free(temp);
}`);
        },

        // Memoria LOCAL
        save: () => {
            localStorage.setItem('mi_cola', JSON.stringify(App.state.cola));
            alert("Cola guardada en la memoria del dispositivo");
        },
        load: () => {
            const data = localStorage.getItem('mi_cola');
            if (!data) return alert("No hay cola guardada");
            
            App.state.cola = JSON.parse(data);
            const container = document.getElementById('queue-container');
            container.innerHTML = '';
            
            App.state.cola.forEach(val => {
                const node = document.createElement('div');
                node.className = 'queue-node';
                node.innerText = val;
                container.appendChild(node);
            });
            App.helpers.setStatus('queue', "Cola recuperada");
        },
        reset: () => {
            if(!confirm("¿Borrar cola?")) return;
            App.state.cola = [];
            document.getElementById('queue-container').innerHTML = '';
            localStorage.removeItem('mi_cola');
        }
    },

    helpers: {
        setCode: (type, code) => document.getElementById(`${type}-code`).innerText = code,
        setStatus: (type, msg) => document.getElementById(`${type}-status`).innerText = msg
    }
};


