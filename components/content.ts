// La estructura de la portada (ids, imágenes y huecos). Los textos están en
// `lib/i18n/es.ts` y `lib/i18n/en.ts`, con claves `feature.<id>.*`, `step.<n>.*` y `faq.<n>.*`.

export type Feature = {
  id: string;
  slot: string;
  span: string;
  /** Captura real de la función. Con ella, la card toma su fondo de la imagen. */
  image?: string;
  /** Ancho/alto de la imagen cuando es una pantalla vertical de la app: se muestra recortada por abajo. */
  imageAspect?: number;
  /** Capturas de la app: cada una va en su propio móvil dentro de la misma card (1 a 3). */
  screens?: string[];
  /** Cómo se colocan los móviles en la card (cada card una distinta). */
  variant?: import("./AppPhones").PhoneVariant;
  /** Contenido propio en lugar de una imagen (p. ej. una mini interfaz). */
  visual?: import("react").ReactNode;
  /** El contenido llega hasta los bordes de la tarjeta (p. ej. un móvil que sale por abajo). */
  bleed?: boolean;
};

export const FEATURES: Feature[] = [
  {
    id: "inicio",
    slot: "inicio",
    variant: "right",
    screens: ["/app/screens/1.png"],
    span: "md:col-span-7",
  },
  {
    id: "entradas",
    slot: "entradas",
    variant: "tiltLeft",
    screens: ["/app/screens/2.png"],
    span: "md:col-span-5",
  },
  {
    id: "chats",
    slot: "chats",
    variant: "left",
    screens: ["/app/screens/3.png"],
    span: "md:col-span-5",
  },
  {
    id: "perfil",
    slot: "perfil",
    variant: "floatLeft",
    screens: ["/app/screens/7.png"],
    span: "md:col-span-7",
  },
  {
    id: "matches",
    slot: "matches",
    variant: "fan",
    // El del medio es el primero que se ve: 4 al centro, 6 a la izquierda, 5 a la derecha.
    screens: [
      "/app/screens/6.png",
      "/app/screens/4.png",
      "/app/screens/5.png",
    ],
    span: "md:col-span-6",
  },
  {
    id: "recap",
    slot: "recap",
    variant: "steps",
    // 8 al centro, 9 a la izquierda, 10 a la derecha.
    screens: [
      "/app/screens/9.png",
      "/app/screens/8.png",
      "/app/screens/10.png",
    ],
    span: "md:col-span-6",
  },
];

export const STEPS: {
  n: string;
  screen?: string;
  /** Qué parte de la captura se ve en el recorte (object-position). */
  position?: string;
  /** Ancho de la card en la rejilla de 12 columnas. */
  span?: string;
}[] = [
  { n: "01", screen: "/app/screens/11.png", position: "50% 48%", span: "lg:col-span-7" },
  { n: "02", screen: "/app/screens/12.png", position: "50% 30%", span: "lg:col-span-5" },
  { n: "03", screen: "/app/screens/13.png", position: "50% 30%", span: "lg:col-span-5" },
  { n: "04", screen: "/app/screens/14.png", position: "50% 40%", span: "lg:col-span-7" },
];

export const FAQ_IDS = [1, 2, 3, 4, 5];

// TODO: poner los enlaces reales de las tiendas cuando la app esté publicada.
export const APP_STORE_URL = "#";
export const PLAY_STORE_URL = "#";
