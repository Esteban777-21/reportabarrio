// ============================================================
// ReportaBarrio - Servidor Express
// Proyecto de aula · Tecnologías Web · ODS 11
// ============================================================
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
// 1. Catálogos (categorías pertinentes al ODS 11)
// ------------------------------------------------------------
const CATEGORIAS = {
  vias: 'Vías y huecos',
  alumbrado: 'Alumbrado público',
  residuos: 'Residuos y basuras',
  agua: 'Agua y alcantarillado',
  espacio: 'Espacio público y zonas verdes',
  seguridad: 'Seguridad vial'
};
const URGENCIAS = ['baja', 'media', 'alta'];
const ESTADOS = ['Pendiente', 'En proceso', 'Resuelto'];

// ------------------------------------------------------------
// 2. "Base de datos" en memoria (arreglo de reportes)
// ------------------------------------------------------------
let siguienteId = 4;
const reportes = [
  {
    id: 1, titulo: 'Hueco grande en la calle 45', categoria: 'vias', barrio: 'Centro',
    descripcion: 'Un hueco de casi un metro frente a la panadería está dañando los carros.',
    urgencia: 'alta', contacto: 'vecino1@correo.com', fecha: '2026-11-10', estado: 'Pendiente'
  },
  {
    id: 2, titulo: 'Poste de luz apagado', categoria: 'alumbrado', barrio: 'El Prado',
    descripcion: 'Desde hace dos semanas la cuadra queda a oscuras en la noche.',
    urgencia: 'media', contacto: '3001234567', fecha: '2026-11-12', estado: 'En proceso'
  },
  {
    id: 3, titulo: 'Basura acumulada en la esquina', categoria: 'residuos', barrio: 'Centro',
    descripcion: 'El camión no pasa hace una semana y la basura se está regando.',
    urgencia: 'media', contacto: 'vecina2@correo.com', fecha: '2026-11-15', estado: 'Resuelto'
  }
];

// ------------------------------------------------------------
// 3. Middlewares
// ------------------------------------------------------------
// Archivos estáticos (HTML, CSS, imágenes) de la carpeta public/
app.use(express.static(path.join(__dirname, 'public')));
// Leer el cuerpo de los formularios enviados por POST
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------------
// 4. Utilidades para construir HTML con template strings
// ------------------------------------------------------------
// Evita que el texto escrito por el usuario se interprete como HTML
function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Estructura común de todas las páginas generadas por el servidor
function plantilla(titulo, contenido) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo} | ReportaBarrio</title>
  <link rel="stylesheet" href="/estilos.css">
</head>
<body>
  <header class="encabezado">
    <a class="logo" href="/">Reporta<span>Barrio</span></a>
    <nav>
      <ul class="menu">
        <li><a href="/">Inicio</a></li>
        <li><a href="/reportar.html">Reportar</a></li>
        <li><a href="/reportes">Reportes</a></li>
        <li><a href="/estadisticas">Estadísticas</a></li>
      </ul>
    </nav>
  </header>
  <main>
${contenido}
  </main>
  <footer class="pie">
    <p>ReportaBarrio · Proyecto de aula de Tecnologías Web · ODS 11: Ciudades y comunidades sostenibles</p>
  </footer>
</body>
</html>`;
}

// Tarjeta de un reporte
function tarjeta(r) {
  return `      <article class="tarjeta urgencia-${r.urgencia}">
        <h3>${escapar(r.titulo)}</h3>
        <p class="etiquetas">
          <span class="etiqueta">${CATEGORIAS[r.categoria]}</span>
          <span class="etiqueta etiqueta-barrio">${escapar(r.barrio)}</span>
        </p>
        <p>${escapar(r.descripcion)}</p>
        <p class="meta">Urgencia: <strong>${r.urgencia}</strong> · Estado: <strong>${r.estado}</strong></p>
        <p class="meta">Contacto: ${escapar(r.contacto)} · ${r.fecha}</p>
      </article>`;
}

// ------------------------------------------------------------
// 5. Rutas
// ------------------------------------------------------------

// GET /reportes -> listado con filtros por req.query
app.get('/reportes', (req, res) => {
  const categoria = (req.query.categoria || '').trim();
  const barrio = (req.query.barrio || '').trim();

  let lista = reportes;
  if (categoria) {
    lista = lista.filter(r => r.categoria === categoria);
  }
  if (barrio) {
    lista = lista.filter(r => r.barrio.toLowerCase() === barrio.toLowerCase());
  }

  // Opciones del select de barrio, a partir de los barrios registrados
  const barrios = [...new Set(reportes.map(r => r.barrio))].sort();

  const opcionesCategoria = Object.entries(CATEGORIAS)
    .map(([clave, nombre]) =>
      `<option value="${clave}"${clave === categoria ? ' selected' : ''}>${nombre}</option>`)
    .join('');
  const opcionesBarrio = barrios
    .map(b => `<option value="${escapar(b)}"${b.toLowerCase() === barrio.toLowerCase() ? ' selected' : ''}>${escapar(b)}</option>`)
    .join('');

  const cuerpo = lista.length > 0
    ? `    <section class="cuadricula">\n${lista.map(tarjeta).join('\n')}\n    </section>`
    : `    <section class="mensaje">
      <p>No hay reportes que cumplan los filtros seleccionados.</p>
      <p><a href="/reportes">Ver todos los reportes</a></p>
    </section>`;

  const html = `    <section class="seccion">
      <h1>Reportes del barrio</h1>
      <form class="filtros" action="/reportes" method="GET">
        <label for="categoria">Categoría</label>
        <select id="categoria" name="categoria">
          <option value="">Todas</option>${opcionesCategoria}
        </select>
        <label for="barrio">Barrio</label>
        <select id="barrio" name="barrio">
          <option value="">Todos</option>${opcionesBarrio}
        </select>
        <button type="submit">Filtrar</button>
      </form>
      <p class="meta">Mostrando ${lista.length} de ${reportes.length} reportes</p>
    </section>
${cuerpo}`;

  res.send(plantilla('Reportes', html));
});

// POST /reportes -> recibe el formulario con req.body, valida y guarda
app.post('/reportes', (req, res) => {
  const { titulo, categoria, barrio, descripcion, urgencia, contacto } = req.body;

  // Validación en el servidor: se acumulan los errores encontrados
  const errores = [];
  if (!titulo || !titulo.trim()) errores.push('El título es obligatorio.');
  if (!categoria || !CATEGORIAS[categoria]) errores.push('Debes elegir una categoría válida.');
  if (!barrio || !barrio.trim()) errores.push('El barrio es obligatorio.');
  if (!descripcion || !descripcion.trim()) errores.push('La descripción es obligatoria.');
  if (!urgencia || !URGENCIAS.includes(urgencia)) errores.push('Debes elegir el nivel de urgencia (baja, media o alta).');
  if (!contacto || !contacto.trim()) errores.push('El contacto (correo o teléfono) es obligatorio.');

  if (errores.length > 0) {
    const html = `    <section class="mensaje error">
      <h1>No se pudo guardar el reporte</h1>
      <ul>
${errores.map(e => `        <li>${e}</li>`).join('\n')}
      </ul>
      <p><a class="boton" href="/reportar.html">Volver al formulario</a></p>
    </section>`;
    return res.status(400).send(plantilla('Error en el reporte', html));
  }

  reportes.push({
    id: siguienteId++,
    titulo: titulo.trim(),
    categoria,
    barrio: barrio.trim(),
    descripcion: descripcion.trim(),
    urgencia,
    contacto: contacto.trim(),
    fecha: new Date().toISOString().slice(0, 10),
    estado: 'Pendiente'
  });

  res.redirect('/reportes');
});

// GET /estadisticas -> conteo por categoría y por estado
app.get('/estadisticas', (req, res) => {
  const porCategoria = Object.entries(CATEGORIAS).map(([clave, nombre]) => ({
    nombre,
    total: reportes.filter(r => r.categoria === clave).length
  }));
  const porEstado = ESTADOS.map(estado => ({
    nombre: estado,
    total: reportes.filter(r => r.estado === estado).length
  }));

  const filas = datos => datos
    .map(d => `          <tr><td>${d.nombre}</td><td>${d.total}</td></tr>`)
    .join('\n');

  const html = `    <section class="seccion">
      <h1>Estadísticas</h1>
      <p class="meta">Total de reportes registrados: <strong>${reportes.length}</strong></p>
    </section>
    <section class="estadisticas">
      <article class="panel">
        <h2>Reportes por categoría</h2>
        <table>
          <thead><tr><th>Categoría</th><th>Reportes</th></tr></thead>
          <tbody>
${filas(porCategoria)}
          </tbody>
        </table>
      </article>
      <article class="panel">
        <h2>Reportes por estado</h2>
        <table>
          <thead><tr><th>Estado</th><th>Reportes</th></tr></thead>
          <tbody>
${filas(porEstado)}
          </tbody>
        </table>
      </article>
    </section>`;

  res.send(plantilla('Estadísticas', html));
});

// 404 -> cualquier ruta que no exista (debe ir al final)
app.use((req, res) => {
  const html = `    <section class="mensaje error">
      <h1>404 · Página no encontrada</h1>
      <p>La ruta <code>${escapar(req.originalUrl)}</code> no existe.</p>
      <p><a class="boton" href="/">Volver al inicio</a></p>
    </section>`;
  res.status(404).send(plantilla('Página no encontrada', html));
});

// ------------------------------------------------------------
// 6. Arranque del servidor
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`ReportaBarrio funcionando en http://localhost:${PORT}`);
});
