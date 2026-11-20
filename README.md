# ReportaBarrio

Plataforma ciudadana para reportar problemas del barrio.
Proyecto de aula · Tecnologías Web · Ingeniería de Sistemas · Universidad Simón Bolívar.

## Integrantes

- Esteban Oñate
- Jesús Oliveros

## Descripción

ReportaBarrio permite a los vecinos registrar reportes (huecos, basuras, alumbrado dañado, fugas de agua, etc.), consultarlos y filtrarlos por categoría y barrio, y ver estadísticas básicas por categoría y por estado. Está hecho con HTML5, CSS (Flexbox, Grid y media queries) y un servidor Node.js + Express. Los datos viven en un arreglo en memoria (sin base de datos), por lo que se reinician al apagar el servidor.

## ODS elegido

**ODS 11: Ciudades y comunidades sostenibles.** La aplicación contribuye a:

- **Meta 11.1:** acceso a servicios básicos, al visibilizar fallas de agua, alcantarillado y alumbrado.
- **Meta 11.3:** participación ciudadana, al dar a los vecinos un canal para reportar.
- **Meta 11.6:** reducción del impacto ambiental urbano, con reportes de residuos y zonas verdes.

## Instalación y ejecución

```bash
npm install
npm run dev     # desarrollo con nodemon
npm start       # ejecución normal
```

El servidor queda disponible en http://localhost:3000

## Rutas del servidor

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Página de inicio (archivo estático) |
| GET | `/reportar.html` | Formulario para registrar un reporte (archivo estático) |
| GET | `/reportes` | Listado de reportes; filtros opcionales `?categoria=...&barrio=...` (req.query) |
| POST | `/reportes` | Recibe el formulario (req.body), valida y guarda; redirige a `/reportes`; responde 400 si falta un campo |
| GET | `/estadisticas` | Conteo de reportes por categoría y por estado |
| GET | cualquier otra | Página 404 |

Categorías válidas para el filtro: `vias`, `alumbrado`, `residuos`, `agua`, `espacio`, `seguridad`.

## Video de sustentación

Enlace: _(pegar aquí el enlace del video)_
