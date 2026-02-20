# 🏍️ PROMPT DE RESPALDO — Honda Quiz en Railway.app

## ¿QUÉ ES RAILWAY?
Railway.app es la mejor alternativa gratuita actual. Da URL pública, soporta Node.js + Socket.io, y el deploy es en 5 minutos conectando GitHub.

---

## PASO A PASO — Railway (GRATIS, ~10 minutos)

### 1. Sube los archivos a GitHub
1. Ve a **github.com** → New repository → nómbralo `honda-quiz` → Public → Create
2. Sube los 3 archivos:
   - `server.js`
   - `package.json`
   - `public/index.html` (dentro de una carpeta llamada `public`)

   La estructura debe verse así:
   ```
   honda-quiz/
   ├── server.js
   ├── package.json
   └── public/
       └── index.html
   ```

### 2. Despliega en Railway
1. Ve a **railway.app** → Login with GitHub
2. Clic en **"New Project"** → **"Deploy from GitHub repo"**
3. Selecciona `honda-quiz`
4. Railway detecta automáticamente que es Node.js y empieza el deploy
5. Espera ~2 minutos

### 3. Obtener URL pública
1. Una vez desplegado, ve a **Settings → Domains**
2. Clic en **"Generate Domain"**
3. Te da una URL tipo: `honda-quiz-production.up.railway.app`
4. ¡Esa es tu URL! Compártela con todos

### 4. Generar QR
- Ve a **qr-code-generator.com** → pega la URL → descarga el QR
- Ponlo en tu diapositiva de PowerPoint para que la gente lo escanee

---

## PLAN GRATUITO DE RAILWAY
- ✅ 500 horas/mes gratis (más que suficiente para un evento)
- ✅ URL pública incluida
- ✅ Soporte completo para Node.js y Socket.io
- ✅ Sin tarjeta de crédito requerida

---

## PROMPT PARA IA (si necesitas regenerar el proyecto)

Copia y pega esto en cualquier IA (Claude, ChatGPT, etc.) para regenerar el proyecto completo:

---

Crea una aplicación web tipo Kahoot llamada "Honda Power Platform Quiz" con las siguientes especificaciones EXACTAS:

**STACK:** Node.js + Express + Socket.io (sin base de datos, todo en memoria RAM)

**ARCHIVOS A CREAR:**

### package.json
```json
{
  "name": "honda-power-platform-quiz",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  }
}
```

### server.js
Servidor Express con Socket.io que maneja:
- Estado del juego EN MEMORIA (no base de datos): `{ phase, questionIndex, startTime, players, answers }`
- Fases: `lobby → question → results → podium`
- Eventos socket que debe manejar:
  - `host:start` → cambia phase a 'question', registra startTime = Date.now()
  - `host:showResults` → cambia phase a 'results'
  - `host:next` → avanza questionIndex o va a 'podium' si era la última
  - `host:reset` → resetea todo el estado
  - `player:join({ name }, callback)` → agrega jugador, callback con `{ ok:true }` o `{ error:'...' }`
  - `player:answer({ name, ans })` → registra respuesta, calcula puntos por velocidad (máx 1000, mín 300 si correcto), actualiza score del jugador
- Timer automático de 20 segundos: después de `host:start` y `host:next`, si pasan 20.5s sin que el host muestre resultados, cambiar automáticamente a phase='results'
- Emitir `io.emit('state', game)` cada vez que el estado cambie
- Puerto: `process.env.PORT || 3000`
- Servir archivos estáticos desde carpeta `public/`

**Respuestas correctas por índice (0-based):** [3, 1, 2, 1, 2, 2, 0, 1]

### public/index.html
App completa en un solo HTML con Socket.io cliente. DISEÑO EN TEMA BLANCO/CLARO:
- Fondo: #F7F7F7
- Tarjetas: #FFFFFF con sombras suaves
- Color principal: #CC0000 (rojo Honda)
- Tipografía: Google Fonts - Rajdhani (títulos) + Exo 2 (cuerpo)
- Botones respuesta: A=rojo #e74c3c, B=azul #3498db, C=verde #27ae60, D=naranja #e67e22

**FUNCIONALIDADES:**

PANTALLA INICIAL - Selección de rol:
- Botón grande rojo "🎮 Soy el Presentador (HOST)" con subtítulo "Requiere contraseña"
- Botón blanco "👤 Soy Participante"

LOGIN HOST:
- Campo password
- Contraseña correcta: Honda2025
- Si incorrecto: mostrar error en rojo

HOST - LOBBY:
- Muestra URL del sitio para compartir (en caja roja suave)
- Contador grande de participantes en tiempo real
- Grid con chips de cada participante que se une
- Botón "Iniciar Quiz" (deshabilitado si no hay participantes)

HOST - PREGUNTA ACTIVA:
- Timer visual: barra horizontal + círculo con segundos
- Texto de la pregunta en card blanca
- Los 4 botones de respuesta (display only, sin interacción)
- Contador "X / Y han respondido" que se actualiza en TIEMPO REAL sin re-renderizar la pantalla
- Botón "Ver Resultados ahora"
- IMPORTANTE: el timer no debe interrumpirse cuando llegan eventos de socket

HOST - RESULTADOS (después de cada pregunta):
- Gráfica de barras horizontal ANIMADA para cada opción A/B/C/D
- Barras arrancan en 0% y se animan hasta el % real (transition: width 1s)
- Barra de respuesta correcta tiene glow verde
- Porcentaje de aciertos grande en verde
- Mini ranking top 5 con posición, nombre y puntaje
- Botón "Siguiente Pregunta" o "Ver Podio Final"

HOST - PODIO:
- Título animado con gradiente dorado-rojo
- Podio visual: 2do (plata), 1ro (oro más alto), 3ro (bronce)
- Tabla completa con todos los participantes, posición y puntaje

PLAYER - JOIN:
- Campo de texto para nombre
- Validación: nombre requerido, no duplicado, quiz no iniciado

PLAYER - WAITING:
- Saludo con nombre del jugador
- Contador de participantes en tiempo real
- Animación de puntos pulsantes esperando al presentador

PLAYER - PREGUNTA:
- Timer (barra + número)
- Pregunta en card
- 4 botones grandes de respuesta con colores A/B/C/D
- Al tocar un botón: se deshabilitan todos inmediatamente
- IMPORTANTE: no re-renderizar si ya está en esta pantalla y llega un evento de socket (solo re-renderizar si ya respondió)

PLAYER - FEEDBACK:
- Emoji grande (🎉 correcto, 😞 incorrecto, ⏱️ tiempo agotado)
- Muestra la respuesta correcta
- Puntaje acumulado
- Animación de espera hasta que el host muestre resultados

PLAYER - RESULTADOS:
- Misma gráfica de barras animada
- Badge "✓ ¡Correcto!" si acertó
- Puntaje acumulado
- Espera animada para siguiente pregunta

PLAYER - PODIO:
- Mismo podio visual
- Posición final del jugador destacada en rojo

LÓGICA SOCKET CLIENTE - MUY IMPORTANTE:
```javascript
socket.on('state', newGs => {
  gs = newGs;
  // Si HOST está en pantalla de pregunta: SOLO actualizar contador, NO re-renderizar
  if (myRole==='host' && screen==='host-q') { updateCounter(); return; }
  // Si PLAYER está respondiendo: solo re-renderizar si ya respondió en servidor
  if (myRole==='player' && screen==='player-q') {
    const answered = gs.answers?.[`q${gs.questionIndex}`]?.[myName];
    if (answered!==undefined) { stopTick(); render(); }
    return;
  }
  render(); // Para todos los demás casos, re-renderizar normal
});
```

**PREGUNTAS DEL QUIZ:**
```javascript
const Qs = [
  { q:"¿Cuál es el objetivo principal del despliegue del WORKFLOW SA en Honda?",
    opts:["Reducir el uso de papel en las oficinas.","Impulsar la transformación digital para reducción de tiempos.","Tener trazabilidad sobre las Solicitudes.","Todas las anteriores."], correct:3 },
  { q:"Según la presentación, ¿qué es la Transformación Digital?",
    opts:["Es simplemente comprar software nuevo cada año.","Un cambio cultural y estratégico que integra tecnologías para mejorar la eficiencia.","Una forma de reemplazar a todas las personas por robots.","Un proceso que no requiere la participación de los empleados."], correct:1 },
  { q:"¿Cuál es la función principal de Power Apps?",
    opts:["Crear gráficos de barras y pasteles únicamente.","Enviar correos electrónicos de forma masiva.","Ser la herramienta para crear aplicaciones y capturar datos (la 'cara' del proceso).","Reparar motores de motocicletas automáticamente."], correct:2 },
  { q:"¿Qué herramienta se define como el 'motor' que traslada información y automatiza tareas?",
    opts:["Power BI","Power Automate","Excel","Word"], correct:1 },
  { q:"¿Qué característica hace que un flujo de trabajo sea ideal para ser automatizado?",
    opts:["Que las reglas cambien todos los días sin previo aviso.","Que el proceso se haga una sola vez al año.","Que tenga alta repetición, reglas claras y sea propenso al error humano.","Que no requiera ningún tipo de datos de entrada."], correct:2 },
  { q:"¿Qué herramienta de Power Platform se utiliza para análisis de datos y dashboards?",
    opts:["Power Apps","Power Automate","Power BI","Teams"], correct:2 },
  { q:"¿Cuál es el primer paso en la hoja de ruta para crear un flujo de trabajo?",
    opts:["Identificación: elegir un proceso doloroso, tedioso o repetitivo.","Comprar licencias premium inmediatamente.","Despedir al personal del proceso manual.","Dibujar un gráfico en Power BI sin tener datos."], correct:0 },
  { q:"¿Cómo recibe el aprobador la notificación para tomar una decisión?",
    opts:["Mediante una llamada telefónica del asociado.","Recibe una notificación por correo para revisar la solicitud en el App.","El sistema imprime una hoja y se la lleva un mensajero.","Debe buscar la solicitud manualmente en una carpeta de Excel."], correct:1 }
];
```

Genera los 3 archivos listos para subir a GitHub y desplegar en Railway.app.
