# 📖 Tutorial: Actualizar Base de Datos COLCA

## 🎯 Resumen Rápido

1. **Editar localmente** → `editor.html` (privado, en tu PC)
2. **Guardar cambios** → Sobrescribir `Documentos.csv`
3. **Publicar** → Ejecutar `publish.bat`
4. **¡Listo!** → Página pública actualizada en GitHub Pages

---

## 📝 Paso a Paso Detallado

### 1️⃣ Abrir el Editor

1. Ve a la carpeta `Registros COLCA`
2. Haz doble clic en **`editor.html`**
3. Se abrirá en tu navegador (Chrome o Edge recomendado)

**⚠️ Importante:** Usa `editor.html`, NO `index.html` (index.html es la página pública)

---

### 2️⃣ Cargar el Archivo CSV

1. Click en el botón **📁 Cargar CSV** (arriba a la derecha)
2. Selecciona el archivo **`Documentos.csv`**
3. Verás la tabla con todos los documentos (actualmente 106)

**💡 Tip:** El archivo se carga en memoria, no se modifica hasta que guardes

---

### 3️⃣ Editar Documentos

#### **Ver/Editar un documento existente:**

1. **Click en cualquier fila** de la tabla
2. Se abre el panel lateral derecho con 4 pestañas:
   - **General:** Nombre, categoría, puede tener más de uno, etc.
   - **Vigencia:** Tipo y días de vigencia
   - **Campos:** Lista de campos que debe incluir el documento
   - **Notas:** Comentarios adicionales

3. **Edita los campos** que necesites
4. Click en **💾 Guardar Cambios** (abajo del panel)
5. El botón verde "Guardar" en el header cambia a naranja (indica cambios sin guardar al CSV)

#### **Agregar un nuevo documento:**

1. Click en **➕ Nuevo Documento**
2. Se crea un documento con ID automático
3. Edita todos los campos necesarios
4. Click en **💾 Guardar Cambios** en el panel

#### **Agregar campos a un documento:**

1. Abre el documento en el panel lateral
2. Ve a la pestaña **Campos**
3. Escribe el nombre del campo en el input
4. Click en **➕ Agregar Campo**
5. Click en **💾 Guardar Cambios**

#### **Eliminar un documento:**

1. Abre el documento en el panel lateral
2. Click en **🗑️ Eliminar** (abajo del panel)
3. Confirma la eliminación

#### **Filtrar y buscar:**

- **Búsqueda:** Escribe en el campo "🔍 Buscar" para filtrar por nombre
- **Categoría:** Click en el dropdown multi-select para filtrar por categoría
- **Tipo de Vigencia:** Filtra por vencimiento, permanente, etc.
- **Puede tener +1:** Filtra documentos que permiten múltiples copias
- **Ordenamiento:** Click en cualquier encabezado de columna para ordenar (↑↓)

---

### 4️⃣ Guardar Cambios al CSV

Cuando hayas terminado de editar:

1. Click en el botón verde **💾 Guardar** (arriba a la derecha)
2. Selecciona **sobrescribir** el archivo `Documentos.csv` original
3. El navegador te pedirá permiso para guardar
4. ✅ Cambios guardados localmente

**💡 Tip:** También puedes usar "Guardar como..." para crear un backup antes de sobrescribir

---

### 5️⃣ Publicar a GitHub Pages

Una vez guardados los cambios en `Documentos.csv`:

#### **Opción A: Automático (Recomendado)**

1. Abre PowerShell en la carpeta `Registros COLCA`
2. Ejecuta:
   ```powershell
   .\publish.bat
   ```

Esto hará automáticamente:
- ✅ Genera `documentos_page.html` con los datos actualizados
- ✅ Copia a `index.html` (página pública)
- ✅ Hace commit en Git
- ✅ Te pregunta si quieres hacer push
- ✅ Publica a GitHub Pages

#### **Opción B: Manual**

```powershell
# 1. Generar página con datos embebidos
python generate_page.py

# 2. Copiar a index.html (página pública)
Copy-Item documentos_page.html index.html

# 3. Agregar cambios a Git
git add Documentos.csv index.html documentos_page.html

# 4. Hacer commit
git commit -m "Actualizar base de datos"

# 5. Publicar
git push origin main
```

---

### 6️⃣ Verificar Publicación

1. Espera 1-2 minutos (GitHub Pages tarda en actualizar)
2. Visita: **https://colca-spa.github.io/colca-datos/**
3. ✅ ¡Tus cambios están en línea!

---

## ⚠️ Precauciones

### ❌ NO hagas esto:

- **NO edites `index.html` directamente** (se sobrescribe al publicar)
- **NO edites `documentos_page.html` directamente** (se regenera automáticamente)
- **NO edites el CSV con Excel** (puede romper el formato de semicolons)

### ✅ SÍ haz esto:

- **SÍ usa `editor.html`** para todas las ediciones
- **SÍ guarda cambios** antes de cerrar el navegador
- **SÍ haz backup** del CSV antes de cambios grandes
- **SÍ usa el botón "Guardar Cambios"** después de editar cada documento

---

## 🔄 Ejemplo de Flujo Completo

### Escenario: Agregar un nuevo tipo de certificación

1. **Abrir editor:**
   - Doble click en `editor.html`

2. **Cargar datos:**
   - Click "Cargar CSV" → Seleccionar `Documentos.csv`

3. **Crear documento:**
   - Click "➕ Nuevo Documento"
   - En el panel lateral:
     - **Nombre:** "Certificado de Manipulación de Alimentos"
     - **Categoría:** "Certificaciones"
     - **Tipo de vigencia:** "vencimiento"
     - **Vigencia (días):** "1825" (5 años)
     - **Puede tener +1:** "no"

4. **Agregar campos:**
   - Pestaña "Campos"
   - Agregar: "Número de certificado"
   - Agregar: "Institución emisora"
   - Agregar: "Fecha de emisión"
   - Agregar: "Fecha de vencimiento"

5. **Agregar nota:**
   - Pestaña "Notas"
   - Escribir: "Requerido para personal de cocina y manejo de alimentos"

6. **Guardar en el panel:**
   - Click "💾 Guardar Cambios"

7. **Guardar al CSV:**
   - Click "💾 Guardar" (arriba)
   - Sobrescribir `Documentos.csv`

8. **Publicar:**
   - Abrir PowerShell
   - Ejecutar: `.\publish.bat`
   - Confirmar push: `Y`

9. **Verificar:**
   - Esperar 1-2 minutos
   - Visitar: https://colca-spa.github.io/colca-datos/
   - ✅ El nuevo documento aparece en la tabla pública

---

## 🆘 Solución de Problemas

### "El botón Guardar no funciona"
- Asegúrate de estar usando **Chrome o Edge** (necesitas File System Access API)
- Verifica que hayas cargado el CSV primero
- Intenta "Guardar como..." en lugar de "Guardar"

### "Mis cambios no aparecen en GitHub Pages"
- Verifica que ejecutaste `publish.bat` correctamente
- Confirma que el push fue exitoso: `git status`
- Espera 2-3 minutos (GitHub Pages tarda en actualizar)
- Limpia caché del navegador: Ctrl+Shift+R

### "Perdí cambios sin guardar"
- Si cerraste el navegador sin guardar, los cambios se perdieron
- Debes volver a hacer las ediciones
- **Tip:** Guarda frecuentemente durante sesiones largas

### "El CSV se corrompió"
- Restaura desde `Documentos_Backup.csv`
- Si no existe backup, recupera desde Git:
  ```powershell
  git checkout HEAD -- Documentos.csv
  ```

---

## 📚 Archivos del Proyecto

| Archivo | Propósito | ¿Editar? |
|---------|-----------|----------|
| **editor.html** | Editor local con todas las funcionalidades | ❌ Solo usar |
| **index.html** | Página pública (GitHub Pages) | ❌ Se genera automáticamente |
| **documentos_page.html** | Versión generada con datos embebidos | ❌ Se genera automáticamente |
| **Documentos.csv** | Base de datos (semicolon delimiter) | ✅ Vía editor |
| **app.js** | Lógica de la aplicación | ❌ Solo si eres desarrollador |
| **sidebar.js** | Panel lateral del editor | ❌ Solo si eres desarrollador |
| **styles.css** | Estilos visuales | ❌ Solo si eres desarrollador |
| **embedded_css.js** | CSS embebido para páginas generadas | ❌ Se regenera automáticamente |
| **generate_page.py** | Script para generar página pública | ❌ Se ejecuta automáticamente |
| **publish.bat** | Script de publicación | ✅ Ejecutar para publicar |
| **regenerate_css.py** | Regenera embedded_css.js desde styles.css | ❌ Solo si cambias CSS |

---

## 🎓 Comandos Útiles

### Ver estado de cambios no publicados:
```powershell
git status
```

### Ver historial de cambios:
```powershell
git log --oneline
```

### Crear backup manual del CSV:
```powershell
Copy-Item Documentos.csv "Documentos_Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
```

### Ver diferencias del CSV:
```powershell
git diff Documentos.csv
```

### Deshacer cambios NO guardados en CSV:
```powershell
git checkout HEAD -- Documentos.csv
```

---

## ✅ Checklist de Actualización

Cada vez que actualices la base de datos, sigue esta lista:

- [ ] Abrir `editor.html` en Chrome/Edge
- [ ] Cargar `Documentos.csv`
- [ ] Hacer las ediciones necesarias
- [ ] Click "💾 Guardar Cambios" en cada documento editado
- [ ] Click "💾 Guardar" para sobrescribir CSV
- [ ] Ejecutar `.\publish.bat` en PowerShell
- [ ] Confirmar push con `Y`
- [ ] Esperar 1-2 minutos
- [ ] Verificar en https://colca-spa.github.io/colca-datos/
- [ ] ✅ ¡Listo!

---

## 💡 Tips y Mejores Prácticas

1. **Guarda frecuentemente:** No esperes a terminar todo para guardar
2. **Haz backups:** Antes de cambios grandes, copia el CSV
3. **Usa filtros:** Facilita encontrar documentos específicos
4. **Prueba localmente:** Verifica que todo se ve bien en `editor.html` antes de publicar
5. **Commits descriptivos:** Si haces push manual, usa mensajes claros
6. **Revisa la página pública:** Siempre verifica que los cambios se publicaron correctamente

---

## 📞 Contacto y Soporte

Si encuentras problemas o necesitas ayuda:

1. Revisa esta guía completa
2. Verifica la sección "Solución de Problemas"
3. Consulta el [README.md](README.md) para detalles técnicos
4. Contacta al administrador del repositorio

---

**Última actualización:** Mayo 2026
**Versión:** 1.0
