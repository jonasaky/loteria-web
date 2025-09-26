// ---------- CONFIGURACIÓN ----------
const CARTAS = [
    "El Gallo", "El Diablito", "La Dama", "El Catrín", "El Paraguas",
    "La Sirena", "La Escalera", "La Botella", "El Barril", "El Árbol",
    "El Melón", "El Valiente", "El Gorrito", "La Muerte", "La Pera",
    "La Bandera", "El Bandolón", "El Violoncello", "La Garza", "El Pájaro",
    "La Mano", "La Bota", "La Luna", "El Cotorro", "El Borracho",
    "El Negrito", "El Corazón", "La Sandía", "El Tambor", "El Camarón",
    "Las Jaras", "El Músico", "La Araña", "El Soldado", "La Estrella",
    "El Cazo", "El Mundo", "El Apache", "El Nopal", "El Alacrán",
    "La Rosa", "La Calavera", "La Campana", "El Cantarito", "El Venado", 
    "El Sol", "La Corona", "La Chalupa", "El Pino", "El Pescado", 
    "La Palma", "La Maceta", "El Arpa", "La Rana"
];

const IMG_PATH = "images/"; // carpeta con fotos
const CUT_SOUND = "sounds/cut.wav"; // efecto de corte
const BG_MUSIC = document.getElementById("bg-music");

// ---------- ELEMENTOS DEL DOM ----------
const drawBtn = document.getElementById("draw-btn");
const restartBtn = document.getElementById("restart-btn");
const cardImg = document.getElementById("card-img");
const cardName = document.getElementById("card-name");

// ---------- INICIALIZAR ----------
if (BG_MUSIC && BG_MUSIC.src) {
    // Algunos navegadores requieren interacción antes de reproducir audio.
    // Lo iniciamos al primer click del botón.
    drawBtn.addEventListener("click", () => {
        BG_MUSIC.volume = 0.2;
        BG_MUSIC.play();
    }, { once: true });
}

// ---------- FUNCIÓN DE REPRODUCCIÓN ----------
function playSound(src) {
    const audio = new Audio(src);
    audio.play();
}

// Array para almacenar las cartas restantes (se baraja al inicio)
let remainingCards = shuffle([...CARTAS]);

function shuffle(array) {
    // Algoritmo de Fisher-Yates
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ---------- SELECCIONAR CARTA ----------
function getRandomCard() {
    const name = remainingCards.shift(); // Tomamos la primera carta del array
    const normalized = name
        .toLowerCase()
        .replace(/[áàäâ]/g, "a")
        .replace(/[éèëê]/g, "e")
        .replace(/[íìïî]/g, "i")
        .replace(/[óòöô]/g, "o")
        .replace(/[úùüû]/g, "u")
        .replace(/ñ/g, "n")
        .replace(/ /g, "_");
    const file = normalized + ".jpg";
    const imgUrl = `${IMG_PATH}${file}`;
    return { name, imgUrl };
}

// ---------- FUNCIONES DE CONTROL DE JUEGO ----------
function checkGameEnd() {
    if (remainingCards.length === 0) {
        drawBtn.style.display = "none";
        restartBtn.style.display = "inline-block";
    }
}

function restartGame() {
    remainingCards = shuffle([...CARTAS]);
    drawBtn.style.display = "inline-block";
    restartBtn.style.display = "none";
    cardImg.hidden = true;
    cardName.textContent = "";
}

// ---------- ANIMACIÓN DE CAÍDA ----------
function animateFall() {
    // Reinicia posición fuera de vista
    cardImg.style.top = "-300px";
    // Forzamos reflow para que la transición vuelva a funcionar
    void cardImg.offsetWidth;
    // Después de un pequeño retardo, la movemos a 0
    setTimeout(() => {
        cardImg.style.top = "0px";
    }, 50);
}

// ---------- MANEJADOR DEL BOTÓN ----------
drawBtn.addEventListener("click", async () => {
    // 1️⃣ Sonido de corte
    playSound(CUT_SOUND);

    // 2️⃣ Seleccionar carta
    const { name, imgUrl } = getRandomCard();

    // 3️⃣ Mostrar nombre
    cardName.textContent = name;

    // 4️⃣ Cargar imagen (si existe)
    fetch(imgUrl, { method: "HEAD" })
        .then(resp => {
            if (resp.ok) {
                cardImg.src = imgUrl;
                cardImg.hidden = false;
                animateFall(); // animación solo si hay imagen
            } else {
                // No hay imagen → ocultamos
                cardImg.hidden = true;
            }
        })
        .catch(() => { cardImg.hidden = true; });

    // 5️⃣ Voz de la carta (Web Speech API)
    // Esperamos un momento para que el corte termine (~300 ms)
    setTimeout(() => {
        const utter = new SpeechSynthesisUtterance(name);
        utter.lang = "es-ES"; // voz en español
        // Seleccionar voz española si está disponible
        const voices = speechSynthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.startsWith("es"));
        
        if (spanishVoice) {
            utter.voice = spanishVoice;
        }
        // Ajustes opcionales:
        // utter.rate = 1.0; // velocidad
        // utter.pitch = 1.0; // tono
        speechSynthesis.speak(utter);
    }, 350); // 350 ms ≈ duración típica del corte
});