# Traxxia Personal — Dirección estética

> Referencia permanente: *un libro premium abierto en la mesa de un ejecutivo,
> no otra app en su teléfono*.

El producto se siente **editorial, no de productividad**. Espacios amplios,
serifas en los momentos de reflexión, acentos escasos de sienna y ámbar sobre
un fondo neutro. Sin sombras dramáticas, sin gradientes fluorescentes, sin
emojis en el UI del sistema.

---

## Referencias visuales

Estudiar y superar. No copiar — destilar el *tono*.

| Referencia | Qué tomamos | Enlace |
|---|---|---|
| **Kinfolk magazine** | Composición editorial, aire, tipografía serif con respeto, fotografía silenciosa | https://www.kinfolk.com |
| **Craft.do** | Densidad de información cálida, jerarquía tipográfica, sensación de "documento premium" | https://www.craft.do |
| **Framer — "luxury productivity" templates** | Micro-interacciones sobrias, layouts amplios, uso disciplinado del color | https://www.framer.com/marketplace |
| **Timestripe** (a superar) | La capa temporal (zoom entre horizontes) muy pulida — pero sin framework dimensional ni scope ejecutivo | https://timestripe.com |
| **Are.na** | Neutralidad, contenido sobre cromo, tipografía como estructura | https://www.are.na |
| **Readymag / editorial portfolios** | Momentos "libro": una idea por pantalla, tipografía grande y ligera | — |

> Las capturas de pantalla de referencia se irán agregando a `docs/references/`
> a medida que se curen. Este archivo es la fuente de la *intención* estética.

---

## Paleta (tokens en `app/globals.css`)

### Dark (default — contexto ejecutivo, uso nocturno)

| Token | Hex | Uso |
|---|---|---|
| Background | `#0E1116` | Fondo base |
| Surface | `#161B22` | Tarjetas, sidebar |
| Surface elevated | `#1C2128` | Estados hover, popovers |
| Border | `#2A2F38` | Divisores sutiles |
| Text primary | `#F5EFE6` | Crema — texto principal |
| Text secondary | `#C9C3B8` | Texto de apoyo |
| Text muted | `#6B6358` | Metadatos, labels |
| Accent sienna | `#B8451F` | Acción primaria (escaso) |
| Accent amber | `#D4A574` | Énfasis editorial (escaso) |
| Success | `#5EAE8A` | Confirmaciones |

### Light ("papel premium")

Tema cálido tipo papel crema con la misma sienna/ámbar como acentos. Definido en
`.light` en `app/globals.css`.

### Colores de dimensión

Cada una de las 9 dimensiones tiene un color propio (ver `lib/dimensions.ts`),
usado en chips y en la futura visualización radar. Son colores apagados,
tierra/piedra, no saturados.

---

## Tipografía

| Rol | Fuente | Pesos |
|---|---|---|
| Headings y momentos editoriales (propósito, apuestas) | **Fraunces** (serif) | 300–500 |
| UI, body, listas, acción | **Manrope** (sans) | 400–600 |
| Números grandes (scores, %) | **Fraunces** light | 300 |

**Regla:** serifas en momentos de reflexión (Norte, Vida, Década); sans en
momentos de acción (Hoy, checkboxes).

---

## Principios

1. **Editorial, no productividad.** Se siente como un libro, no como Notion.
2. **Espacios amplios.** No apretar información.
3. **Acentos escasos.** La mayoría del UI es neutro crema/dim sobre negro.
4. **Sin ruido.** Sin sombras dramáticas, sin gradientes, sin emojis de sistema.
5. **La tipografía es la estructura.** El peso y el tamaño hacen la jerarquía,
   no las cajas de colores.
