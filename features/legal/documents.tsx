import Link from "next/link";
import type { ReactNode } from "react";
import type { BusinessSettings } from "@/services/settings";
import { LEGAL_VERSION } from "./acceptance";
import { ResetAcceptanceButton } from "./components/reset-acceptance-button";

/*
 * BORRADORES PARA REVISIÓN JURÍDICA. Redactados a partir de la Ley 1581 de 2012, la Ley 1480 de 2011
 * (modificada por la Ley 2439 de 2024) y el Decreto 1074 de 2015. Todo texto marcado como
 * "Pendiente" es un dato que el negocio debe entregar. No reemplazan la asesoría de un abogado.
 */

type LegalSection = { heading: string; body: ReactNode };
export type LegalDocument = { title: string; intro: ReactNode; sections: LegalSection[] };

function Pending({ children }: { children: ReactNode }) {
  return <mark className="rounded bg-warn-soft px-1 text-warn">[Pendiente: {children}]</mark>;
}

function contactChannels(s: BusinessSettings) {
  return (
    <ul>
      <li>WhatsApp y teléfono: {s.phone ?? <Pending>teléfono</Pending>}</li>
      <li>Correo electrónico: {s.contactEmail ?? <Pending>correo de atención</Pending>}</li>
      {s.socialLinks.map((social) => (
        <li key={social.href}>
          {social.label}:{" "}
          <a href={social.href} target="_blank" rel="noopener noreferrer">
            {social.href}
          </a>
        </li>
      ))}
    </ul>
  );
}

function responsible(s: BusinessSettings) {
  return (
    <ul>
      <li>Nombre comercial: {s.name}</li>
      <li>Teléfono: {s.phone ?? <Pending>teléfono</Pending>}</li>
      <li>Correo electrónico: {s.contactEmail ?? <Pending>correo de atención</Pending>}</li>
    </ul>
  );
}

export function getLegalDocument(slug: string, s: BusinessSettings): LegalDocument | null {
  switch (slug) {
    case "datos-personales":
      return {
        title: "Política de tratamiento de datos personales",
        intro: (
          <p>
            Esta política explica cómo {s.name} recolecta, usa, guarda y protege los datos
            personales, en cumplimiento de la Ley Estatutaria 1581 de 2012 y del Decreto 1074 de
            2015.
          </p>
        ),
        sections: [
          { heading: "1. Responsable del tratamiento", body: responsible(s) },
          {
            heading: "2. Datos que tratamos",
            body: (
              <>
                <p>Solo tratamos los datos que tú decides entregarnos:</p>
                <ul>
                  <li>
                    Si nos dejas tus datos en el formulario de contacto: nombre, correo electrónico
                    y producto de interés.
                  </li>
                  <li>
                    Si nos escribes por WhatsApp o Instagram: tu nombre de perfil, tu número o
                    usuario y el contenido de tus mensajes.
                  </li>
                  <li>
                    Si presentas una petición, queja o reclamo: nombre, correo y descripción de tu
                    solicitud.
                  </li>
                </ul>
                <p>
                  No solicitamos datos sensibles, datos bancarios ni contraseñas. Navegar por el
                  sitio no requiere entregar datos personales.
                </p>
              </>
            ),
          },
          {
            heading: "3. Finalidades",
            body: (
              <>
                <p>Usamos tus datos únicamente para:</p>
                <ul>
                  <li>Responder tus consultas sobre productos, precios y disponibilidad.</li>
                  <li>Gestionar la venta, entrega y garantía cuando decidas comprar.</li>
                  <li>Atender peticiones, quejas, reclamos y solicitudes sobre tus datos.</li>
                  <li>Cumplir obligaciones legales y requerimientos de autoridades.</li>
                  <li>
                    Enviarte ofertas y novedades, solo si lo autorizaste de forma separada y
                    opcional. Puedes retirar esa autorización cuando quieras.
                  </li>
                </ul>
                <p>No vendemos ni cedemos tus datos personales a terceros.</p>
              </>
            ),
          },
          {
            heading: "4. Autorización",
            body: (
              <p>
                Tratamos tus datos con tu autorización previa, expresa e informada, salvo en los
                casos en que la ley no la exige (artículo 10 de la Ley 1581 de 2012). Guardamos
                prueba de la autorización y de la versión del aviso que aceptaste.
              </p>
            ),
          },
          {
            heading: "5. Tus derechos",
            body: (
              <>
                <p>Como titular de los datos tienes derecho a:</p>
                <ul>
                  <li>Conocer, actualizar y rectificar tus datos.</li>
                  <li>Solicitar prueba de la autorización que otorgaste.</li>
                  <li>Ser informado sobre el uso que le hemos dado a tus datos.</li>
                  <li>
                    Presentar quejas ante la Superintendencia de Industria y Comercio, una vez
                    agotado el trámite de consulta o reclamo ante nosotros.
                  </li>
                  <li>
                    Revocar la autorización o solicitar la supresión de tus datos cuando no exista
                    un deber legal o contractual de conservarlos.
                  </li>
                  <li>Acceder gratuitamente a tus datos.</li>
                </ul>
              </>
            ),
          },
          {
            heading: "6. Cómo ejercer tus derechos",
            body: (
              <>
                <p>Puedes enviar tu consulta o reclamo por cualquiera de estos canales:</p>
                {contactChannels(s)}
                <p>
                  Indica tu nombre, cómo contactarte, la descripción de tu solicitud y, si aplica,
                  los documentos que la soporten. Área responsable:{" "}
                  <Pending>persona o área que atiende las solicitudes</Pending>.
                </p>
                <ul>
                  <li>
                    <strong>Consultas:</strong> respondemos en máximo 10 días hábiles. Si no es
                    posible, te informamos el motivo y la nueva fecha, que no superará 5 días
                    hábiles adicionales.
                  </li>
                  <li>
                    <strong>Reclamos</strong> (corrección, actualización, supresión o
                    incumplimiento): respondemos en máximo 15 días hábiles, prorrogables hasta 8
                    días hábiles más informándote el motivo. Si falta información, te la pediremos
                    dentro de los 5 días siguientes; si no la envías en 2 meses, se entenderá que
                    desististe.
                  </li>
                </ul>
              </>
            ),
          },
          {
            heading: "7. Seguridad",
            body: (
              <p>
                Aplicamos medidas técnicas y administrativas razonables: cifrado en tránsito, acceso
                restringido con doble factor de autenticación, permisos mínimos por rol y registro
                de cambios. Ningún sistema es completamente invulnerable; si ocurre un incidente que
                afecte tus datos, actuaremos conforme a la ley.
              </p>
            ),
          },
          {
            heading: "8. Conservación",
            body: (
              <p>
                Conservamos tus datos solo el tiempo necesario para la finalidad para la que los
                entregaste y para cumplir obligaciones legales. Plazo definido:{" "}
                <Pending>plazo de conservación de las consultas</Pending>. Después los eliminamos.
              </p>
            ),
          },
          {
            heading: "9. Vigencia y cambios",
            body: (
              <p>
                Esta política rige desde el <Pending>fecha de entrada en vigor</Pending> (versión{" "}
                {LEGAL_VERSION}). Si la cambiamos de forma sustancial, lo informaremos en este sitio
                antes de aplicar los cambios.
              </p>
            ),
          },
        ],
      };

    case "privacidad":
      return {
        title: "Aviso de privacidad",
        intro: (
          <p>
            Este aviso resume cómo tratamos tus datos personales. El detalle completo está en la{" "}
            <Link href="/legal/datos-personales">Política de tratamiento de datos personales</Link>.
          </p>
        ),
        sections: [
          { heading: "Responsable", body: responsible(s) },
          {
            heading: "Para qué usamos tus datos",
            body: (
              <p>
                Para responder tus consultas sobre productos y disponibilidad, gestionar ventas,
                entregas y garantías, atender peticiones, quejas y reclamos, y cumplir la ley. Solo
                te enviaremos publicidad si lo autorizas de forma separada.
              </p>
            ),
          },
          {
            heading: "Tus derechos",
            body: (
              <p>
                Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos,
                revocar tu autorización cuando proceda, pedir prueba de ella y acudir a la
                Superintendencia de Industria y Comercio. No estás obligado a responder preguntas
                sobre datos sensibles.
              </p>
            ),
          },
          { heading: "Canales de atención", body: contactChannels(s) },
        ],
      };

    case "terminos":
      return {
        title: "Términos y condiciones",
        intro: (
          <p>
            Estos términos regulan el uso de este sitio web de {s.name}. Ninguna cláusula limita los
            derechos que te otorga el Estatuto del Consumidor (Ley 1480 de 2011, modificada por la
            Ley 2439 de 2024).
          </p>
        ),
        sections: [
          { heading: "1. Identificación del proveedor", body: responsible(s) },
          {
            heading: "2. Alcance del sitio",
            body: (
              <p>
                Este sitio es un catálogo informativo. En él no se realizan pagos ni compras: si te
                interesa un producto, nos contactas por WhatsApp y allí acordamos la venta. Esa
                negociación es una venta a distancia y te da los derechos que la ley prevé para
                ella.
              </p>
            ),
          },
          {
            heading: "3. Información de los productos",
            body: (
              <p>
                Publicamos características, estado (nuevo, exhibición, seminuevo o reacondicionado),
                fotografías y disponibilidad con base en la información real de cada producto. Si
                una imagen es solo ilustrativa, lo indicamos. Antes de cerrar una compra te
                confirmamos por WhatsApp las características del equipo que vas a recibir.
              </p>
            ),
          },
          {
            heading: "4. Precios y disponibilidad",
            body: (
              <ul>
                <li>
                  Los precios están en pesos colombianos (COP) e incluyen los impuestos aplicables.
                </li>
                <li>
                  El precio que se aplica es el publicado al momento de acordar la compra. Los
                  costos de envío, si los hay, se informan por separado antes de pagar.
                </li>
                <li>
                  La disponibilidad se actualiza en el sitio, pero se confirma por WhatsApp antes de
                  cerrar la compra. Las ofertas indican su vigencia.
                </li>
              </ul>
            ),
          },
          {
            heading: "5. Compra, pago y entrega",
            body: (
              <>
                <p>
                  Antes de que pagues te informaremos por escrito el precio total, los medios de
                  pago disponibles, el plazo de entrega y las condiciones de garantía. La compra se
                  entiende acordada cuando confirmas expresamente el pedido.
                </p>
                <p>
                  Si no acordamos un plazo, entregaremos en máximo 30 días calendario. Si no podemos
                  entregar a tiempo o el producto no está disponible, puedes terminar la compra y te
                  devolveremos el dinero en máximo 15 días calendario.
                </p>
                <p>Medios de pago: transferencia bancaria y efectivo.</p>
              </>
            ),
          },
          {
            heading: "6. Garantía",
            body: (
              <p>
                Todos los productos tienen la garantía legal. Su plazo se indica en cada producto. A
                falta de indicación, es de un año para productos nuevos. Los productos usados tienen
                garantía de tres meses, salvo que hayas aceptado por escrito comprarlos sin ella
                cuando la ley lo permite.
              </p>
            ),
          },
          {
            heading: "7. Reversión del pago",
            body: (
              <p>
                Si pagas con tarjeta u otro medio electrónico, puedes solicitar la reversión del
                pago en los casos del artículo 51 de la Ley 1480 de 2011: fraude, operación no
                solicitada, producto no recibido, distinto al pedido o defectuoso.
              </p>
            ),
          },
          {
            heading: "8. Peticiones, quejas y reclamos",
            body: (
              <>
                <p>Puedes presentarlos por estos canales:</p>
                {contactChannels(s)}
              </>
            ),
          },
          {
            heading: "9. Menores de edad",
            body: (
              <p>
                Si eres menor de edad, necesitas la autorización de tus padres o representantes para
                comprar. Podremos pedir constancia de esa autorización.
              </p>
            ),
          },
          {
            heading: "10. Propiedad intelectual",
            body: (
              <p>
                La marca, el logo y los contenidos propios de {s.name} están protegidos. Las marcas
                de los fabricantes (por ejemplo, Apple, Samsung, Xiaomi o Motorola) pertenecen a sus
                titulares y se mencionan solo para identificar los productos. Su mención no implica
                que seamos distribuidores autorizados, salvo que lo indiquemos expresamente.
              </p>
            ),
          },
          {
            heading: "11. Responsabilidad",
            body: (
              <p>
                Respondemos por la calidad, idoneidad, seguridad y garantía de los productos que
                vendemos, en los términos de la ley. Procuramos que el sitio esté disponible y
                actualizado, pero puede tener interrupciones técnicas.
              </p>
            ),
          },
          {
            heading: "12. Ley aplicable y cambios",
            body: (
              <p>
                Estos términos se rigen por las leyes de Colombia. Si los modificamos, publicaremos
                la nueva versión aquí; las compras ya acordadas se rigen por los términos vigentes
                cuando se acordaron. Versión {LEGAL_VERSION}.
              </p>
            ),
          },
        ],
      };

    case "cookies":
      return {
        title: "Política de cookies",
        intro: (
          <p>
            Las cookies y el almacenamiento local son pequeños archivos que un sitio guarda en tu
            navegador. Este sitio usa el mínimo indispensable.
          </p>
        ),
        sections: [
          {
            heading: "Lo que sí usamos",
            body: (
              <ul>
                <li>
                  <strong>Tu aceptación de las condiciones del sitio</strong> (almacenamiento local,
                  clave <code>luxcell-aceptacion-legal</code>): recuerda que ya aceptaste, para no
                  volver a preguntarte. No contiene datos personales y no sale de tu navegador.
                </li>
                <li>
                  <strong>Sesión del panel administrativo</strong> (cookies <code>sb-…</code>): solo
                  para el personal autorizado de {s.name} que inicia sesión. Los visitantes no las
                  reciben.
                </li>
              </ul>
            ),
          },
          {
            heading: "Lo que no usamos",
            body: (
              <p>
                No usamos cookies analíticas, publicitarias ni de seguimiento, y no compartimos tu
                navegación con redes de publicidad. Si en el futuro las incorporamos, te pediremos
                consentimiento antes de activarlas.
              </p>
            ),
          },
          {
            heading: "Sitios externos",
            body: (
              <p>
                Los enlaces a WhatsApp o Instagram te llevan a sitios de terceros, que aplican sus
                propias políticas de cookies.
              </p>
            ),
          },
          {
            heading: "Cómo cambiar tu preferencia",
            body: (
              <>
                <p>
                  Puedes borrar tu aceptación en este navegador con el botón de abajo, o eliminar el
                  almacenamiento del sitio desde la configuración de tu navegador.
                </p>
                <ResetAcceptanceButton />
              </>
            ),
          },
        ],
      };

    default:
      return null;
  }
}
