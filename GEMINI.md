
### 📋 Prompt para Recrear: Hitster LATAM App

> **Actúa como un Desarrollador Web Senior experto en Vanilla JS, Firebase Realtime Database y diseño UI/UX responsivo.**
> 
> Quiero construir desde cero una versión web multijugador del juego de mesa "Hitster" enfocada en música de Latinoamérica.
> El objetivo del juego es que los jugadores, en su turno, ordenen cronológicamente cartas de canciones en una línea de tiempo escuchando un fragmento de la canción. Gana el primero en acomodar 10 canciones correctamente.
> 
> **🛠️ Stack Tecnológico:**
> *   astro, react, tailwind (Diseño oscuro, premium, animaciones suaves tipo glassmorphism).
> *   Firebase Realtime Database (Compat v10) para sincronización del estado multijugador.
> *   Integración de audio: *Soporte nativo con la API de YouTube Iframe, priorizando cargar los videos mediante `loadVideoById` usando IDs directos, asegurando el inicio por interacción del usuario para burlar las políticas de autoplay.*
> 
> **🎮 Lógica del Multijugador y Sincronización (CRÍTICO):**
> 1.  **Salas (Rooms):** Debe haber una vista [Landing] donde se pueda "Crear Sala" (Host) generando un código de 4 letras, o "Unirse a Sala" (Guest).
> 2.  **Manejo de Roles:** El estado local de cada cliente debe tener muy claro quién es (`myPlayerIndex`). La UI de "Revelar" o "Colocar" **solo se debe habilitar si `myPlayerIndex === STATE.currentPlayerIdx`**.
> 3.  **Estado Global Centralizado (Firebase):** Toda la lógica debe leerse desde un único objeto `STATE`. Cuando el Host inicia la partida, se reparte una carta inicial a la línea de tiempo de cada jugador y se establece el mazo barajado.
> 4.  **Flujo del Turno:**
>     *   El jugador activo ve la carta a adivinar (solo Nombre/Artista). 
>     *   El jugador elige entre qué huecos temporales de su línea de tiempo actual colocarla.
>     *   Confirma la acción. Se revela el Año de la canción para todos en la sala.
>     *   Si es correcto, la carta entra en su línea y suma 1 punto. Si no, se descarta.
>     *   Pasa el turno al siguiente jugador conectado (`currentPlayerIdx + 1`).
> 
> **🎵 Reproductor Automático (Lecciones Aprendidas):**
> *   **El Bug del Caché de YouTube:** No uses `listType: search` con URLs o la API de YouTube, ya que se cachea la primera canción y crashea. Usa SIEMPRE una propiedad `yt: "ID_DEL_VIDEO"` en la base de datos de canciones y llama a `player.loadVideoById(card.yt)`. O simplemente busca la mejor manera y de la cual sepas que va a funcionar.

> *   **Bloqueos de Reproducción:** Añade que la llamada de reproducción se haga en una función limpia y que ofrezca *botones claros de "Play Manual" emergentes* si el navegador (iOS/Safari) bloquea el `autoplay` asíncrono.
> 
> **🗃️ Base de Datos de Canciones (`SONGS`):**
> *   busca la mejor manera para evitar los bloqueos de copyright VEVO tipo `Error 150`.
> 
> **🎨 Estética y UI:**
> *   Haz que la aplicación sea "Mobile-First" porque los jugadores la usarán en la misma mesa de su casa con sus celulares.
> *   Usa colores de acento neon sobre fondos oscuros (Ej: Coral, Aguamarina o Morado).
> *   Añade transiciones Flip 3D al revelar las cartas desde CSS para hacerlo vistoso.
> 

