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
};

export const FEATURES: Feature[] = [
  {
    id: "mapa",
    slot: "mapa",
    image: "/app/home-list.jpg",
    imageAspect: 900 / 1951,
    span: "md:col-span-7",
  },
  { id: "entradas", slot: "entradas", span: "md:col-span-5" },
  { id: "chats", slot: "chats", image: "/app/chat.jpg", span: "md:col-span-5" },
  { id: "matches", slot: "matches", span: "md:col-span-7" },
  { id: "perfil", slot: "perfil", span: "md:col-span-6" },
  {
    id: "recap",
    slot: "recap",
    image: "/app/recap.jpg",
    imageAspect: 853 / 1844,
    span: "md:col-span-6",
  },
];

export const STEPS = [{ n: "01" }, { n: "02" }, { n: "03" }, { n: "04" }];

export const FAQ_IDS = [1, 2, 3, 4, 5];

// TODO: poner los enlaces reales de las tiendas cuando la app esté publicada.
export const APP_STORE_URL = "#";
export const PLAY_STORE_URL = "#";
