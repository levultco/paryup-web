import type { LegalDoc, LegalId } from "@/lib/legal/types";

// Textos legales en español. Son una base sólida para una app de eventos en España,
// pero conviene que los revise un abogado antes del lanzamiento.

export const legalEs: Record<LegalId, LegalDoc> = {
  terms: {
    title: "Términos y condiciones",
    intro:
      "Estos términos regulan el uso de ParyUp, la app y la web con la que descubres eventos, compras entradas, hablas con tu gente y revives cada noche. Léelos con calma: al crear una cuenta o usar el servicio aceptas lo que aquí se explica.",
    sections: [
      {
        h: "Quiénes somos y qué es ParyUp",
        blocks: [
          {
            p: "ParyUp es una plataforma que reúne eventos y planes de ocio nocturno. Permite descubrir eventos, comprar entradas, entrar con un código QR, chatear con otras personas, hacer match con quienes coinciden en un evento y guardar el recuerdo de cada fiesta en un perfil.",
          },
          { company: true },
          {
            p: "ParyUp no organiza los eventos: los organizan clubes, salas y promotores («organizadores») que usan la plataforma para publicarlos y vender sus entradas.",
          },
        ],
      },
      {
        h: "Aceptación y cambios",
        blocks: [
          {
            p: "Usar ParyUp supone aceptar estos términos, la Política de privacidad, la Política de cookies y las Normas de la comunidad. Si no estás de acuerdo con alguno, no uses el servicio.",
          },
          {
            p: "Podemos actualizar estos términos para reflejar cambios del servicio o de la ley. Si el cambio es importante te avisaremos en la app o por correo con antelación razonable. Seguir usando ParyUp después de la fecha de entrada en vigor supone aceptar la nueva versión.",
          },
        ],
      },
      {
        h: "Tu cuenta",
        blocks: [
          {
            ul: [
              "Debes tener al menos 18 años para crear una cuenta y usar ParyUp.",
              "El registro se hace desde la app. La web permite iniciar sesión con una cuenta que ya existe, pero no crear cuentas nuevas.",
              "Tienes que facilitar datos veraces y mantenerlos actualizados. No puedes suplantar a otra persona.",
              "Eres responsable de tu contraseña y de lo que se haga con tu cuenta. Si crees que alguien accedió sin permiso, avísanos cuanto antes.",
              "Puedes eliminar tu cuenta cuando quieras desde la app. Al hacerlo se borran o anonimizan tus datos según la Política de privacidad.",
            ],
          },
        ],
      },
      {
        h: "Entradas y pagos",
        blocks: [
          {
            p: "Las entradas se compran desde la app. En esa compra, el contrato de acceso al evento es entre tú y el organizador; ParyUp actúa como plataforma que facilita la venta y el cobro. El organizador es responsable del evento, de su contenido, de su aforo y de las condiciones de acceso.",
          },
          {
            ul: [
              "El precio y las condiciones de cada entrada se muestran antes de pagar. Los pagos se procesan a través de un proveedor de pagos externo (Stripe); ParyUp no guarda los datos completos de tu tarjeta.",
              "Cada entrada tiene un código QR personal. Es válido solo para el evento, la fecha y el tipo de entrada indicados, y solo mientras el evento está en curso. Si se escanea una vez, se marca como usada.",
              "No puedes revender las entradas con ánimo de lucro ni compartir tu QR con terceros. Una entrada duplicada o fraudulenta puede ser anulada sin devolución.",
              "Si un evento se cancela, te corresponde el reembolso del importe de la entrada en los plazos que indique el organizador y el proveedor de pagos. Si se aplaza, la entrada sigue siendo válida para la nueva fecha, salvo que el organizador ofrezca otra solución.",
              "Las entradas para eventos de ocio con fecha o periodo de ejecución determinado no tienen derecho de desistimiento, conforme a la normativa de consumidores. Fuera de los casos de cancelación o cambio sustancial, las devoluciones dependen de la política del organizador.",
              "Los gastos de gestión, si los hay, se indican de forma separada antes de confirmar el pago.",
            ],
          },
        ],
      },
      {
        h: "Contenido que publicas",
        blocks: [
          {
            p: "Puedes subir fotos, escribir mensajes y compartir otros contenidos en ParyUp. Sigues siendo el titular de lo que publicas, pero nos concedes una licencia gratuita, no exclusiva y limitada para alojarlo, mostrarlo y distribuirlo dentro del servicio, y solo mientras sea necesario para prestarlo (por ejemplo, para mostrar tu perfil o el recap de un evento).",
          },
          {
            p: "Eres responsable de lo que publicas. No subas contenido que no te pertenezca, que vulnere derechos de otras personas o que incumpla las Normas de la comunidad. Podemos retirar contenido que infrinja estas reglas o la ley.",
          },
        ],
      },
      {
        h: "Uso permitido",
        blocks: [
          {
            p: "Te comprometes a usar ParyUp de forma legal y respetuosa. En concreto, no puedes:",
          },
          {
            ul: [
              "Acosar, amenazar, discriminar o incitar al odio contra otras personas.",
              "Publicar contenido ilegal, sexualmente explícito sin consentimiento, violento o que ponga en riesgo a menores.",
              "Usar la plataforma para spam, estafas, venta ilegal de entradas o suplantación.",
              "Intentar acceder sin permiso a sistemas, cuentas o datos, ni alterar o saturar el servicio.",
              "Usar bots, scraping u otros medios automáticos sin autorización por escrito.",
            ],
          },
        ],
      },
      {
        h: "Propiedad intelectual",
        blocks: [
          {
            p: "ParyUp, su diseño, su software, sus marcas y sus contenidos propios son de ParyUp o de sus licenciantes y están protegidos por la ley. Te damos un derecho personal, limitado y revocable para usar la app y la web; no puedes copiarlos, modificarlos ni distribuirlos sin permiso.",
          },
          {
            p: "Los nombres, imágenes y datos de los eventos pertenecen a los organizadores o a sus titulares.",
          },
        ],
      },
      {
        h: "Disponibilidad del servicio",
        blocks: [
          {
            p: "Trabajamos para que ParyUp funcione con fiabilidad, pero no garantizamos que esté siempre disponible ni libre de errores. Podemos hacer tareas de mantenimiento, cambiar funciones o interrumpir el servicio temporalmente. Haremos lo razonable por avisar cuando sea posible.",
          },
        ],
      },
      {
        h: "Responsabilidad",
        blocks: [
          {
            p: "ParyUp no es responsable de la celebración, la calidad, la seguridad ni el desarrollo de los eventos organizados por terceros, ni de lo que ocurra durante ellos, salvo en los casos en que la ley lo establezca. Tampoco respondemos por el contenido que publiquen otros usuarios.",
          },
          {
            p: "Nada de lo aquí dispuesto limita los derechos que la ley reconoce a las personas consumidoras ni excluye la responsabilidad que no pueda excluirse legalmente.",
          },
        ],
      },
      {
        h: "Suspensión y cierre de cuentas",
        blocks: [
          {
            p: "Podemos suspender o cerrar una cuenta, y retirar contenido, si incumples estos términos o las Normas de la comunidad, si es necesario para proteger a otras personas o si lo exige la ley. Siempre que sea posible te explicaremos el motivo y podrás reclamar escribiendo a nuestro correo de contacto.",
          },
        ],
      },
      {
        h: "Ley aplicable y resolución de conflictos",
        blocks: [
          {
            p: "Estos términos se rigen por la ley española. Si eres consumidor, puedes acudir a los tribunales de tu domicilio y a los sistemas de resolución de conflictos que la normativa reconoce, incluida la plataforma europea de resolución de litigios en línea (https://ec.europa.eu/consumers/odr).",
          },
        ],
      },
      {
        h: "Contacto",
        blocks: [
          {
            p: "Para cualquier duda sobre estos términos puedes escribirnos al correo de contacto indicado arriba.",
          },
        ],
      },
    ],
  },

  privacy: {
    title: "Política de privacidad",
    intro:
      "Cuidamos tus datos. Aquí te explicamos qué información tratamos cuando usas ParyUp, para qué la usamos, con quién la compartimos y qué derechos tienes. Cumplimos el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).",
    sections: [
      {
        h: "Quién es el responsable",
        blocks: [{ company: true }],
      },
      {
        h: "Qué datos tratamos",
        blocks: [
          {
            ul: [
              "Cuenta y perfil: nombre, nombre de usuario, correo electrónico, foto, banner, biografía, enlaces a redes, ciudad, fecha de nacimiento y género si decides indicarlos.",
              "Inicio de sesión: si entras con Google, recibimos tu nombre, correo y foto desde tu cuenta de Google. No recibimos tu contraseña de Google.",
              "Entradas y pagos: eventos a los que vas, entradas compradas, listas en las que entras, importes y estado del pago. Los datos de tu tarjeta los procesa Stripe; nosotros no los almacenamos.",
              "Contenido y comunicaciones: mensajes, fotos, álbumes, recaps, mensajes de voz y reacciones que compartes dentro de la app.",
              "Relaciones: personas a las que sigues, que te siguen, amistades, matches, bloqueos y silencios.",
              "Ubicación: si lo permites, tu ubicación aproximada para mostrarte eventos cercanos y, si lo activas, para compartirla en directo con tus amigos.",
              "Contactos: solo si lo permites, para encontrar a personas que ya usan ParyUp. Los usamos para esa comprobación y no los usamos para otros fines.",
              "Cámara, fotos y micrófono: solo cuando los usas (por ejemplo, para subir una foto o enviar un audio).",
              "Notificaciones: identificador del dispositivo para enviarte avisos push, si los activas.",
              "Datos técnicos: dirección IP, tipo de dispositivo y sistema, versión de la app y registros de errores y seguridad.",
            ],
          },
        ],
      },
      {
        h: "Para qué los usamos y con qué base legal",
        blocks: [
          {
            ul: [
              "Prestarte el servicio (crear tu cuenta, mostrar eventos, vender entradas, chat, perfil, matches y recap): ejecución del contrato.",
              "Procesar pagos, evitar fraudes y gestionar reembolsos: ejecución del contrato e interés legítimo.",
              "Enviarte avisos sobre tu cuenta, tus entradas y tus eventos: ejecución del contrato.",
              "Notificaciones push y funciones basadas en ubicación o contactos: tu consentimiento, que puedes retirar cuando quieras desde los ajustes del dispositivo.",
              "Seguridad, moderación y cumplimiento de las Normas de la comunidad: interés legítimo y obligación legal.",
              "Mejorar y mantener el servicio: interés legítimo.",
              "Cumplir obligaciones legales (por ejemplo, fiscales o requerimientos de autoridades): obligación legal.",
            ],
          },
        ],
      },
      {
        h: "Con quién compartimos tus datos",
        blocks: [
          {
            p: "No vendemos tus datos. Los compartimos solo cuando es necesario:",
          },
          {
            ul: [
              "Organizadores de eventos: al comprar una entrada, el organizador recibe los datos necesarios para gestionar el acceso (por ejemplo, tu nombre y el estado de tu entrada).",
              "Otras personas usuarias: tu perfil, tus publicaciones y tus asistencias son visibles según la privacidad que elijas en la app.",
              "Proveedores que tratan datos por nuestra cuenta (encargados del tratamiento): pagos (Stripe), inicio de sesión (Google), mapas (Mapbox), alojamiento y almacenamiento de archivos (Cloudflare y proveedores de infraestructura), envío de notificaciones push (Expo y los servicios de Apple y Google) y envío de correos.",
              "Autoridades y tribunales, cuando una ley o una orden válida nos obligue.",
            ],
          },
        ],
      },
      {
        h: "Transferencias internacionales",
        blocks: [
          {
            p: "Algunos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En esos casos exigimos garantías adecuadas, como las cláusulas contractuales tipo de la Comisión Europea u otros mecanismos válidos.",
          },
        ],
      },
      {
        h: "Cuánto tiempo conservamos los datos",
        blocks: [
          {
            p: "Conservamos tus datos mientras tengas la cuenta. Si la eliminas, borramos o anonimizamos tus datos, salvo los que debamos guardar por ley (por ejemplo, facturas y pagos, durante los plazos fiscales y mercantiles) o para atender reclamaciones, que se bloquean y se eliminan al terminar el plazo legal.",
          },
        ],
      },
      {
        h: "Tus derechos",
        blocks: [
          {
            p: "Puedes ejercer en cualquier momento los derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, y retirar los consentimientos que hayas dado. Muchos de ellos puedes hacerlos tú mismo desde la app: editar tu perfil, ajustar la privacidad, descargar tus datos o eliminar tu cuenta.",
          },
          {
            p: "Para cualquier otra solicitud escríbenos al correo de contacto indicado arriba. Si crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).",
          },
        ],
      },
      {
        h: "Menores de edad",
        blocks: [
          {
            p: "ParyUp está dirigido a personas mayores de 18 años. No recogemos a sabiendas datos de menores. Si detectamos una cuenta de una persona menor, la eliminaremos.",
          },
        ],
      },
      {
        h: "Seguridad",
        blocks: [
          {
            p: "Aplicamos medidas técnicas y organizativas para proteger tus datos: conexiones cifradas, control de accesos, contraseñas protegidas y copias de seguridad. Ningún sistema es infalible; si ocurre una brecha que afecte a tus derechos, te lo comunicaremos conforme a la ley.",
          },
        ],
      },
      {
        h: "Cambios en esta política",
        blocks: [
          {
            p: "Podemos actualizar esta política. Indicaremos arriba la fecha de la última revisión y, si el cambio es relevante, te avisaremos en la app o por correo.",
          },
        ],
      },
    ],
  },

  legal: {
    title: "Aviso legal",
    intro:
      "Información general sobre el titular de este sitio web, en cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).",
    sections: [
      {
        h: "Titular del sitio web",
        blocks: [{ company: true }],
      },
      {
        h: "Objeto",
        blocks: [
          {
            p: "Este sitio web informa sobre ParyUp y permite consultar eventos públicos, iniciar sesión con una cuenta existente y ver tus entradas y tu perfil. El registro de cuentas y la compra de entradas se realizan desde la aplicación móvil.",
          },
        ],
      },
      {
        h: "Condiciones de uso",
        blocks: [
          {
            p: "El acceso al sitio es libre y gratuito. Al usarlo te comprometes a hacerlo conforme a la ley, a la buena fe y a este aviso, y a no emplearlo para actividades ilícitas ni para dañar el sitio o a terceros. El uso del servicio completo se rige por los Términos y condiciones.",
          },
        ],
      },
      {
        h: "Propiedad intelectual e industrial",
        blocks: [
          {
            p: "Los contenidos del sitio (textos, diseño, logotipos, marcas, imágenes y código) pertenecen a ParyUp o a terceros que han autorizado su uso, y están protegidos por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción o uso comercial sin autorización expresa.",
          },
          {
            p: "Las imágenes y datos de los eventos son de los organizadores correspondientes.",
          },
        ],
      },
      {
        h: "Enlaces",
        blocks: [
          {
            p: "El sitio puede incluir enlaces a páginas de terceros (por ejemplo, las redes sociales de un perfil o las tiendas de aplicaciones). ParyUp no controla esos sitios ni responde de su contenido o de sus políticas.",
          },
        ],
      },
      {
        h: "Exclusión de garantías y responsabilidad",
        blocks: [
          {
            p: "Procuramos que la información sea correcta y esté actualizada, pero no garantizamos que no haya errores ni que el sitio esté siempre disponible. ParyUp no responde de los daños derivados de interrupciones, fallos técnicos o del uso indebido del sitio, en la medida que la ley lo permita.",
          },
        ],
      },
      {
        h: "Legislación aplicable",
        blocks: [
          {
            p: "Este aviso se rige por la ley española. Para cualquier controversia, y si eres consumidor, serán competentes los juzgados y tribunales de tu domicilio.",
          },
        ],
      },
    ],
  },

  cookies: {
    title: "Política de cookies",
    intro:
      "Una cookie es un pequeño archivo que un sitio web guarda en tu navegador. Aquí te explicamos cuáles usa esta web y para qué.",
    sections: [
      {
        h: "Qué cookies usamos",
        blocks: [
          {
            p: "Esta web solo usa cookies técnicas, necesarias para que funcione lo que tú pides. No usamos cookies de analítica, de publicidad ni de seguimiento.",
          },
          {
            ul: [
              "paryup_session: mantiene tu sesión iniciada. Es una cookie propia, segura (httpOnly) y caduca a los 7 días o al cerrar sesión.",
              "paryup_lang: recuerda el idioma que has elegido (español o inglés). Es propia y dura 1 año.",
            ],
          },
        ],
      },
      {
        h: "Inicio de sesión con Google",
        blocks: [
          {
            p: "Si decides iniciar sesión con Google, la página carga un componente de Google que puede usar sus propias cookies o tecnologías similares según su política (policies.google.com). Solo se carga en la pantalla de inicio de sesión.",
          },
        ],
      },
      {
        h: "Por qué no pedimos consentimiento",
        blocks: [
          {
            p: "Las cookies estrictamente necesarias para prestar el servicio que solicitas, como mantener tu sesión o recordar tu idioma, están exentas de consentimiento según la normativa. Si en el futuro añadimos cookies que no lo sean, te pediremos permiso antes de activarlas.",
          },
        ],
      },
      {
        h: "Cómo gestionarlas",
        blocks: [
          {
            p: "Puedes bloquear o borrar las cookies desde los ajustes de tu navegador. Si borras paryup_session tendrás que volver a iniciar sesión, y si borras paryup_lang la web volverá a usar el idioma de tu navegador.",
          },
        ],
      },
      {
        h: "Cambios",
        blocks: [
          {
            p: "Actualizaremos esta política si cambian las cookies que usamos. La fecha de la última revisión aparece al inicio.",
          },
        ],
      },
    ],
  },

  "community-guidelines": {
    title: "Normas de la comunidad",
    intro:
      "ParyUp existe para que salir de fiesta sea más fácil y más seguro. Estas normas valen para todo lo que haces en la plataforma: tu perfil, tus mensajes, tus fotos y tus matches.",
    sections: [
      {
        h: "Respeta a las demás personas",
        blocks: [
          {
            ul: [
              "Trata a todo el mundo con respeto. No se tolera el acoso, las amenazas ni el hostigamiento.",
              "No discrimines ni incites al odio por origen, raza, religión, género, orientación sexual, discapacidad u otra condición.",
              "Un «no» es un «no». Si alguien no quiere hablar contigo, no insistas: puedes ser bloqueado.",
            ],
          },
        ],
      },
      {
        h: "Contenido que no está permitido",
        blocks: [
          {
            ul: [
              "Contenido sexual explícito o publicado sin consentimiento de las personas que aparecen.",
              "Violencia, amenazas, autolesiones o contenido que glorifique el daño.",
              "Cualquier contenido que sexualice o ponga en riesgo a menores.",
              "Venta o promoción de drogas ilegales, armas u otros productos prohibidos.",
              "Información privada de otras personas (teléfono, dirección, documentos) sin su permiso.",
              "Contenido que infrinja derechos de autor, de imagen o de marca.",
            ],
          },
        ],
      },
      {
        h: "Sé tú mismo",
        blocks: [
          {
            ul: [
              "No te hagas pasar por otra persona, club o marca.",
              "Usa fotos y datos reales en tu perfil.",
              "Una persona, una cuenta. No crees cuentas para evadir un bloqueo o una sanción.",
            ],
          },
        ],
      },
      {
        h: "Entradas y eventos",
        blocks: [
          {
            ul: [
              "No revendas entradas con ánimo de lucro ni las compartas: cada QR es personal.",
              "No falsifiques entradas ni intentes entrar con una entrada que no es tuya.",
              "Respeta las normas del local y del organizador, y a su personal.",
            ],
          },
        ],
      },
      {
        h: "Chats, matches y ubicación",
        blocks: [
          {
            ul: [
              "Los matches y los chats se basan en el consentimiento de ambas partes.",
              "No compartas capturas ni conversaciones privadas para avergonzar o exponer a alguien.",
              "No uses la ubicación en directo de otra persona para localizarla o seguirla contra su voluntad.",
              "No uses ParyUp para spam, estafas, pirámides o promociones no solicitadas.",
            ],
          },
        ],
      },
      {
        h: "Cómo denunciar",
        blocks: [
          {
            p: "Si ves algo que incumple estas normas, puedes denunciarlo desde la app (en un perfil, un mensaje o un evento) o escribirnos al correo de contacto. También puedes bloquear o silenciar a cualquier persona en cualquier momento. Si hay un riesgo inmediato para ti o para otra persona, llama a los servicios de emergencia (112).",
          },
        ],
      },
      {
        h: "Qué pasa si no se cumplen",
        blocks: [
          {
            p: "Revisamos las denuncias y, según la gravedad, podemos retirar contenido, avisar, limitar funciones, suspender o cerrar la cuenta, y en casos graves informar a las autoridades. Si crees que hemos cometido un error, escríbenos y lo revisaremos.",
          },
        ],
      },
    ],
  },
};
