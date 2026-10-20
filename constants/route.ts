export type TimeStoryItem = {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  videoSrc: string;
  label: string;
  ghostWord: string;
};

export const TIMELINE_STORY_ITEMS: TimeStoryItem[] = [
  {
    id: "discover",
    time: "22:30",
    title: "Descubres en el mapa",
    subtitle:
      "Abres ParyUp y ves en el mapa qué eventos hay cerca de ti, con la info clave de cada uno.",
    videoSrc: "/features/315_720x30_shots_so.mp4",
    label: "Mapa",
    ghostWord: "SALIR",
  },
  {
    id: "tickets",
    time: "22:34",
    title: "Compras tu entrada",
    subtitle:
      "Eliges evento y compras tu entrada en segundos. Si al final no puedes ir, la vendes desde la app.",
    videoSrc: "/features/800_720x30_shots_so.mp4",
    label: "Entradas",
    ghostWord: "ENTRA",
  },
  {
    id: "chat",
    time: "23:00",
    title: "Hablas con tu gente",
    subtitle:
      "Grupos y mensajes directos para quedar, sin depender de chats eternos.",
    videoSrc: "/features/108_720x30_shots_so.mp4",
    label: "Chat",
    ghostWord: "GRUPO",
  },
  {
    id: "matches",
    time: "00:30",
    title: "Haces match en el evento",
    subtitle:
      "Las personas con las que te cruzas en la fiesta aparecen en tus matches, para seguir hablando después.",
    videoSrc: "/features/234_720x30_shots_so.mp4",
    label: "Matches",
    ghostWord: "MATCH",
  },
  {
    id: "recap",
    time: "Sábado",
    title: "Revives el recap del día",
    subtitle:
      "Un resumen del evento con lo que pasó y quién estuvo, para volver a la noche cuando quieras.",
    videoSrc: "/features/71_720x30_shots_so.mp4",
    label: "Recap",
    ghostWord: "RECUERDA",
  },
  {
    id: "profile",
    time: "Domingo",
    title: "Tu perfil se llena",
    subtitle:
      "Las fiestas a las que has ido, la gente que sigues y quien te sigue, todo en tu perfil.",
    videoSrc: "/features/71_720x30_shots_so.mp4",
    label: "Perfil",
    ghostWord: "PERFIL",
  },
];
