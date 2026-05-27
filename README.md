# Registros COLCA - Base de Datos de Documentos

Sistema de gestión de documentos con editor local y página pública.

## 🌐 Páginas

- **`index.html`**: Página pública de solo lectura (GitHub Pages) con 106 documentos embebidos
  - Filtros y búsqueda interactiva
  - Ordenamiento por columnas
  - **Descarga CSV**: Botón para exportar todos los datos
- **`editor.html`**: Editor completo para uso local (requiere cargar CSV)
- **`documentos_page.html`**: Versión generada que se copia a index.html

## 🚀 Inicio Rápido

### Modo Edición Local

1. **Abrir el editor:**
   - Abre `editor.html` en Chrome/Edge
   - O accede localmente al archivo

2. **Cargar datos:**
   - Click en **"Cargar CSV"**
   - Selecciona `Documentos.csv`
   - Los datos se cargan en memoria

3. **Editar documentos:**
   - Click en cualquier fila para abrir el panel lateral
   - Edita campos en las pestañas correspondientes
   - Los cambios se guardan automáticamente en memoria

4. **Guardar cambios:**
   - **Guardar**: sobrescribe el archivo original
   - **Guardar como**: exporta a un nuevo CSV

5. **Filtrar y buscar:**
   - Usa los filtros multi-select (Categoría, Tipo de Vigencia)
   - Búsqueda de texto libre por nombre/código
   - Los filtros se actualizan dinámicamente

6. **Agregar/Eliminar:**
   - **+ Nuevo Documento**: crea un documento vacío
   - **Eliminar**: botón en el panel lateral (confirmación requerida)
   - **Duplicar**: crea una copia del documento actual

---

### Publicación (GitHub Pages)

1. **Generar página pública:**
   ```powershell
   python generate_page.py
   ```
   Esto crea `documentos_page.html` con datos embebidos

2. **Actualizar index.html público:**
   ```powershell
   Copy-Item documentos_page.html index.html
   ```

3. **Publicar automáticamente:**
   ```powershell
   .\publish.bat
   ```
   
**URL pública:** `https://colca-spa.github.io/colca-datos/`  
(Muestra index.html con 106 documentos embebidos, sin necesidad de cargar CSV)
   - Genera el HTML
   - Hace commit a Git
   - Pregunta si quieres hacer push

3. **Configurar GitHub Pages:**
   - Ve a Settings → Pages en tu repositorio
   - Source: Deploy from a branch
   - Branch: `main` / `(root)`
   - Guarda y espera ~1 minuto

4. **Acceder a la página:**
   ```
   https://tu-usuario.github.io/tu-repo/documentos_page.html
   ```

---

## 📁 Estructura de Archivos

```
Registros COLCA/
├── index.html           # Interfaz principal (modo edición)
├── app.js               # Lógica de la app (parser CSV, filtros, CRUD)
├── sidebar.js           # Panel lateral con tabs
├── styles.css           # Estilos y componentes
├── Documentos.csv       # Base de datos (delimiter: ;)
├── generate_page.py     # Generador de HTML público
├── publish.bat          # Script de publicación
├── documentos_page.html # Página pública (generada)
└── README.md            # Este archivo
```

---

## 🗂️ Estructura de Datos

El CSV usa **delimiter `;`** (punto y coma):

### Formato Relacional Plano

- **Filas con ID**: documento principal
- **Filas sin ID**: campos del documento anterior

**Ejemplo:**
```csv
ID;Código;Nombre del Documento;Puede tener + de 1;Categoría;Tipo de vigencia;Vigencia sugerida (días);campos documento;nombre campos;Comentario
1;ID_CEDULA;Cédula de identidad;no;Documentos de Identidad;fecha_expiracion;—;;primer apellido;
;ID_CEDULA;Cédula de identidad;no;Documentos de Identidad;fecha_expiracion;—;;segundo apellido;
;ID_CEDULA;Cédula de identidad;no;Documentos de Identidad;fecha_expiracion;—;;fecha de nacimiento;
```

### Transformación Interna

La app transforma automáticamente a modelo relacional:

```javascript
{
  id: "1",
  codigo: "ID_CEDULA",
  nombre: "Cédula de identidad",
  puede_tener_mas: "no",
  categoria: "Documentos de Identidad",
  tipo_vigencia: "fecha_expiracion",
  vigencia_dias: "—",
  campos: [
    { nombre: "primer apellido" },
    { nombre: "segundo apellido" },
    { nombre: "fecha de nacimiento" }
  ],
  comentario: ""
}
```

---

## 🎨 Características

✅ **CRUD Completo**
- Crear, leer, actualizar, eliminar documentos
- Gestión de campos anidados (agregar/eliminar)

✅ **Filtros Avanzados**
- Multi-select (Categoría, Tipo de Vigencia, Puede tener +1)
- Búsqueda de texto libre
- Paginación configurable (10/20/50/Todas)

✅ **File System Access API**
- Guarda directo al archivo CSV original
- No hay descargas innecesarias
- Indicador de cambios sin guardar

✅ **Sidebar con Tabs**
- **General**: ID, Código, Nombre, Categoría, Puede tener +1
- **Vigencia**: Tipo, Días
- **Campos**: Tabla editable de campos del documento
- **Notas**: Comentarios libres

✅ **Publicación**
- Genera HTML standalone con datos embebidos
- Sin dependencias externas (CSS/JS inline)
- Lista para GitHub Pages o cualquier hosting estático

---

## ⚙️ Requisitos

### Navegador
- **Chrome 86+** o **Edge 86+** (necesario para File System Access API)
- Firefox/Safari: funciona solo en modo lectura

### Python
- **Python 3.8+** (para generar página pública)
- Sin dependencias externas (solo stdlib)

### Sistema Operativo
- Windows (por `publish.bat`)
- Mac/Linux: adapta el script bash (ver abajo)

---

## 🔧 Adaptación a Otros Proyectos

### 1. Cambiar el Schema

Edita las constantes en `app.js`:

```javascript
// Define tabs y campos por tab
const TABS = [
  { id: 'general', label: 'General', fields: [...] },
  { id: 'vigencia', label: 'Vigencia', fields: [...] }
];

// Define campos tipo select
const SELECT_FIELDS = {
  estado: ['Activo', 'Inactivo'],
  prioridad: ['Alta', 'Media', 'Baja']
};
```

### 2. Cambiar Colores

Edita variables CSS en `styles.css`:

```css
:root {
  --primary: #0053e2;
  --success: #2a8703;
  --danger: #ea1100;
  /* ... */
}
```

### 3. Script para Mac/Linux

Crea `publish.sh`:

```bash
#!/bin/bash
python3 generate_page.py
git add documentos_page.html
git commit -m "Update public page"
git push origin main
```

---

## 🛡️ Seguridad

- ✅ Los datos nunca se envían a servidores externos
- ✅ Todo el procesamiento es local (client-side)
- ✅ File System API requiere permiso explícito del usuario
- ⚠️ Haz backups regulares del CSV (usa Git!)

---

## 📝 Workflow Típico

### Día a día:
1. Abrir `index.html` en Chrome
2. Cargar CSV
3. Filtrar y editar
4. Guardar cambios
5. Cerrar

### Publicación periódica:
1. Guardar cambios en CSV
2. Ejecutar `publish.bat`
3. Verificar URL en GitHub Pages

---

## ❓ Troubleshooting

### "No puedo guardar el archivo"
- **Problema**: No usas Chrome/Edge 86+
- **Solución**: Usa "Guardar como" (download) o cambia de navegador

### "Los cambios no se guardaron"
- **Problema**: No hiciste click en "Guardar"
- **Solución**: Los cambios están en memoria; guarda antes de cerrar

### "Error en generate_page.py"
- **Problema**: Python no instalado o CSV corrupto
- **Solución**: Verifica `python --version` y revisa el CSV

### "GitHub Pages no actualiza"
- **Problema**: Cache del navegador o propagación DNS
- **Solución**: Ctrl+F5 o espera ~5 minutos

---

## 📚 Referencias

- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [CSV Format (RFC 4180)](https://datatracker.ietf.org/doc/html/rfc4180)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

## 📄 Licencia

Proyecto interno para gestión de documentos COLCA.

---

**Desarrollado para:** Registros COLCA  
**Fecha:** Mayo 2026
