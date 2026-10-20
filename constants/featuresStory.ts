export type FeatureStoryItem = {
  id: string;
  title: string;
  subtitle: string;
  videoSrc: string;
  label: string;
  ghostWord: string;
};

export const FEATURE_STORY_ITEMS: FeatureStoryItem[] = [
  {
    id: "discover",
    title: "Descubre qué hacer ahora",
    subtitle:
      "Encuentra eventos, fiestas y planes cerca de ti en segundos, con una experiencia visual clara y directa.",
    videoSrc: "/features/315_720x30_shots_so.mp4",
    label: "Descubre",
    ghostWord: "AHORA",
  },
  {
    id: "plan",
    title: "Organiza todo en un solo lugar",
    subtitle:
      "Desde el evento hasta la ruta, el transporte o la entrada, todo el plan vive dentro de la misma experiencia.",
    videoSrc: "/features/800_720x30_shots_so.mp4",
    label: "Plan",
    ghostWord: "PLANEA",
  },
  {
    id: "chat",
    title: "Habla y decide al momento",
    subtitle:
      "Coordina con tu grupo, responde rápido y muévete sin salir de la conversación.",
    videoSrc: "/features/108_720x30_shots_so.mp4",
    label: "Chat",
    ghostWord: "DECIDE",
  },
  {
    id: "circle",
    title: "Tu círculo, tu espacio",
    subtitle:
      "Comparte con quien tú quieras y mantén cada plan dentro del entorno que mejor encaja contigo.",
    videoSrc: "/features/234_720x30_shots_so.mp4",
    label: "Círculo",
    ghostWord: "CERCANO",
  },
  {
    id: "albums",
    title: "Revive la noche después",
    subtitle:
      "Guarda y comparte fotos de cada fiesta con una experiencia pensada para lo público y lo privado.",
    videoSrc: "/features/71_720x30_shots_so.mp4",
    label: "Álbumes",
    ghostWord: "RECUERDOS",
  },
];
