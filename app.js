// ============================================================================
// REGISTROS COLCA - Main Application Logic
// ============================================================================

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const APP_STATE = {
  csvFileHandle: null,          // File System Access API handle
  rawCSVData: [],               // Original CSV rows (flat structure)
  documents: [],                // Transformed relational documents
  filteredDocuments: [],        // After applying filters
  filterState: {
    search: '',
    categoria: [],
    tipo_vigencia: [],
    puede_tener_mas: []
  },
  currentPage: 1,
  rowsPerPage: 20,
  hasUnsavedChanges: false,
  selectedDocumentId: null,
  sortColumn: null,             // Current sort column
  sortDirection: 'asc'          // 'asc' or 'desc'
};

// ============================================================================
// CSV PARSER (delimiter: semicolon)
// ============================================================================

/**
 * Parse CSV with semicolon delimiter, handling quoted fields
 * @param {string} text - Raw CSV text
 * @returns {Array<Array<string>>} - Parsed rows
 */
function parseCSV(text) {
  const result = [];
  let row = [], field = '', inQuote = false, i = 0;
  
  while (i < text.length) {
    const ch = text[i];
    
    if (inQuote) {
      if (ch === '"' && text[i+1] === '"') {
        field += '"';
        i += 2;
      } else if (ch === '"') {
        inQuote = false;
        i++;
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
        i++;
      } else if (ch === ';') {
        row.push(field);
        field = '';
        i++;
      } else if (ch === '\n') {
        row.push(field);
        if (row.length > 0 && row.some(f => f.trim() !== '')) {
          result.push(row);
        }
        row = [];
        field = '';
        i++;
      } else if (ch === '\r') {
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }
  
  // Handle last row
  if (field || row.length) {
    row.push(field);
    if (row.some(f => f.trim() !== '')) {
      result.push(row);
    }
  }
  
  return result;
}

/**
 * Serialize documents back to CSV format
 * @param {Array<Object>} documents - Documents array
 * @returns {string} - CSV text
 */
function serializeToCSV(documents) {
  const rows = [];
  
  // Header
  rows.push([
    'ID',
    'Código',
    'Nombre del Documento',
    'Puede tener + de 1',
    'Categoría',
    'Tipo de vigencia',
    'Vigencia sugerida (días)',
    'campos documento',
    'nombre campos',
    'Comentario'
  ]);
  
  // Transform relational back to flat
  documents.forEach(doc => {
    // Main document row
    rows.push([
      doc.id || '',
      doc.codigo || '',
      doc.nombre || '',
      doc.puede_tener_mas || '',
      doc.categoria || '',
      doc.tipo_vigencia || '',
      doc.vigencia_dias || '',
      '',
      '',
      doc.comentario || ''
    ]);
    
    // Campo rows (without ID)
    if (doc.campos && doc.campos.length > 0) {
      doc.campos.forEach(campo => {
        rows.push([
          '',
          doc.codigo || '',
          doc.nombre || '',
          doc.puede_tener_mas || '',
          doc.categoria || '',
          doc.tipo_vigencia || '',
          doc.vigencia_dias || '',
          campo.nombre || '',
          '',
          ''
        ]);
      });
    }
  });
  
  // Escape and join
  return rows.map(row => 
    row.map(field => {
      const str = String(field);
      if (str.includes(';') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }).join(';')
  ).join('\r\n');
}

/**
 * Transform flat CSV structure to relational documents
 * @param {Array<Array<string>>} rows - Parsed CSV rows
 * @returns {Array<Object>} - Documents array
 */
function transformToRelational(rows) {
  if (rows.length === 0) return [];
  
  const headers = rows[0];
  const documents = [];
  let currentDoc = null;
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const hasID = row[0] && row[0].trim() !== '';
    
    if (hasID) {
      // Save previous document if exists
      if (currentDoc) {
        documents.push(currentDoc);
      }
      
      // Start new document
      currentDoc = {
        id: row[0].trim(),
        codigo: row[1] || '',
        nombre: row[2] || '',
        puede_tener_mas: row[3] || '',
        categoria: row[4] || '',
        tipo_vigencia: row[5] || '',
        vigencia_dias: row[6] || '',
        campos: [],
        comentario: row[9] || ''
      };
    } else if (currentDoc) {
      // This is a campo row belonging to current document
      const campoNombre = row[7] || '';
      if (campoNombre.trim() !== '') {
        currentDoc.campos.push({
          nombre: campoNombre.trim()
        });
      }
    }
  }
  
  // Save last document
  if (currentDoc) {
    documents.push(currentDoc);
  }
  
  return documents;
}

// ============================================================================
// FILE OPERATIONS
// ============================================================================

/**
 * Load CSV file using File System Access API
 */
async function loadCSVFile() {
  try {
    [APP_STATE.csvFileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'Archivos CSV',
        accept: { 'text/csv': ['.csv'] }
      }],
      multiple: false
    });
    
    const file = await APP_STATE.csvFileHandle.getFile();
    const text = await file.text();
    
    APP_STATE.rawCSVData = parseCSV(text);
    APP_STATE.documents = transformToRelational(APP_STATE.rawCSVData);
    APP_STATE.hasUnsavedChanges = false;
    
    initializeApp();
    applyFiltersAndRender();
    
    showNotification('✓ CSV cargado correctamente', 'success');
  } catch (err) {
    if (err.name !== 'AbortError') {
      showNotification('Error al cargar el archivo: ' + err.message, 'error');
    }
  }
}

/**
 * Save changes to the original CSV file
 */
async function saveCSVFile() {
  if (!APP_STATE.csvFileHandle) {
    showNotification('No hay archivo cargado', 'warning');
    return;
  }
  
  try {
    const csvText = serializeToCSV(APP_STATE.documents);
    const writable = await APP_STATE.csvFileHandle.createWritable();
    await writable.write(csvText);
    await writable.close();
    
    APP_STATE.hasUnsavedChanges = false;
    updateUnsavedIndicator();
    
    showNotification('✓ Archivo guardado', 'success');
  } catch (err) {
    showNotification('Error al guardar: ' + err.message, 'error');
  }
}

/**
 * Save as new CSV file
 */
async function saveAsCSVFile() {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'Documentos.csv',
      types: [{
        description: 'Archivos CSV',
        accept: { 'text/csv': ['.csv'] }
      }]
    });
    
    const csvText = serializeToCSV(APP_STATE.documents);
    const writable = await handle.createWritable();
    await writable.write(csvText);
    await writable.close();
    
    APP_STATE.csvFileHandle = handle;
    APP_STATE.hasUnsavedChanges = false;
    updateUnsavedIndicator();
    
    showNotification('✓ Archivo guardado', 'success');
  } catch (err) {
    if (err.name !== 'AbortError') {
      showNotification('Error al guardar: ' + err.message, 'error');
    }
  }
}

// ============================================================================
// FILTER & SEARCH LOGIC
// ============================================================================

/**
 * Build multi-select dropdown options
 */
function buildMultiSelectOptions(containerId, fieldName) {
  const uniqueValues = [...new Set(
    APP_STATE.documents
      .map(doc => doc[fieldName])
      .filter(v => v && v.trim() !== '')
  )].sort();
  
  const container = document.getElementById(`${containerId}-opts`);
  container.innerHTML = uniqueValues.map(value => `
    <label class="ms-option">
      <input type="checkbox" value="${escapeHtml(value)}" 
             onchange="onFilterChange('${fieldName}', this)">
      <span>${escapeHtml(value)}</span>
    </label>
  `).join('');
}

/**
 * Handle filter checkbox change
 */
function onFilterChange(fieldName, checkbox) {
  const value = checkbox.value;
  
  if (checkbox.checked) {
    if (!APP_STATE.filterState[fieldName].includes(value)) {
      APP_STATE.filterState[fieldName].push(value);
    }
  } else {
    APP_STATE.filterState[fieldName] = APP_STATE.filterState[fieldName]
      .filter(v => v !== value);
  }
  
  updateMultiSelectText(fieldName);
  applyFiltersAndRender();
}

/**
 * Update multi-select trigger text
 */
function updateMultiSelectText(fieldName) {
  const msId = {
    'categoria': 'ms-categoria',
    'tipo_vigencia': 'ms-vigencia',
    'puede_tener_mas': 'ms-multiple'
  }[fieldName];
  
  const selected = APP_STATE.filterState[fieldName];
  const textEl = document.querySelector(`#${msId} .ms-text`);
  
  if (selected.length === 0) {
    textEl.textContent = fieldName === 'categoria' ? 'Todas' : 
                        fieldName === 'tipo_vigencia' ? 'Todos' : 'Todos';
  } else if (selected.length === 1) {
    textEl.textContent = selected[0];
  } else {
    textEl.textContent = `${selected.length} seleccionados`;
  }
}

/**
 * Apply all filters and update view
 */
function applyFiltersAndRender() {
  let filtered = [...APP_STATE.documents];
  
  // Search filter
  if (APP_STATE.filterState.search.trim() !== '') {
    const searchLower = APP_STATE.filterState.search.toLowerCase();
    filtered = filtered.filter(doc => 
      (doc.nombre || '').toLowerCase().includes(searchLower) ||
      (doc.codigo || '').toLowerCase().includes(searchLower) ||
      (doc.categoria || '').toLowerCase().includes(searchLower)
    );
  }
  
  // Categoria filter
  if (APP_STATE.filterState.categoria.length > 0) {
    filtered = filtered.filter(doc => 
      APP_STATE.filterState.categoria.includes(doc.categoria)
    );
  }
  
  // Tipo vigencia filter
  if (APP_STATE.filterState.tipo_vigencia.length > 0) {
    filtered = filtered.filter(doc => 
      APP_STATE.filterState.tipo_vigencia.includes(doc.tipo_vigencia)
    );
  }
  
  // Puede tener mas filter
  if (APP_STATE.filterState.puede_tener_mas.length > 0) {
    filtered = filtered.filter(doc => 
      APP_STATE.filterState.puede_tener_mas.includes(doc.puede_tener_mas)
    );
  }
  
  APP_STATE.filteredDocuments = filtered;
  APP_STATE.currentPage = 1;
  
  renderTable();
  updatePagination();
  updateStatsSummary();
}

/**
 * Clear all filters
 */
function clearAllFilters() {
  APP_STATE.filterState = {
    search: '',
    categoria: [],
    tipo_vigencia: [],
    puede_tener_mas: []
  };
  
  document.getElementById('filter-search').value = '';
  
  // Uncheck all checkboxes
  document.querySelectorAll('.ms-option input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  
  // Reset text
  updateMultiSelectText('categoria');
  updateMultiSelectText('tipo_vigencia');
  updateMultiSelectText('puede_tener_mas');
  
  applyFiltersAndRender();
}

// ============================================================================
// TABLE RENDERING
// ============================================================================

/**
 * Render data table with pagination
 */
function renderTable() {
  const tbody = document.getElementById('table-body');
  const startIdx = (APP_STATE.currentPage - 1) * APP_STATE.rowsPerPage;
  const endIdx = startIdx + APP_STATE.rowsPerPage;
  const pageData = APP_STATE.filteredDocuments.slice(startIdx, endIdx);
  
  if (pageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          ${APP_STATE.documents.length === 0 
            ? 'Carga un archivo CSV para comenzar' 
            : 'No hay documentos que coincidan con los filtros'}
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = pageData.map(doc => `
    <tr onclick="openDocumentSidebar('${doc.id}')" class="table-row-clickable">
      <td>${escapeHtml(doc.id)}</td>
      <td><code class="code-badge">${escapeHtml(doc.codigo)}</code></td>
      <td><strong>${escapeHtml(doc.nombre)}</strong></td>
      <td>
        <span class="badge badge-category">${escapeHtml(doc.categoria)}</span>
      </td>
      <td>
        <span class="badge badge-vigencia-${doc.tipo_vigencia}">
          ${escapeHtml(doc.tipo_vigencia)}
        </span>
      </td>
      <td>${escapeHtml(doc.vigencia_dias)}</td>
      <td>
        <span class="badge badge-neutral">${doc.campos.length}</span>
      </td>
      <td onclick="event.stopPropagation()">
        <button class="btn btn-sm btn-outline" 
                onclick="openDocumentSidebar('${doc.id}')">
          Ver
        </button>
      </td>
    </tr>
  `).join('');
  
  updateTableHeaders();
}

/**
 * Update pagination controls
 */
function updatePagination() {
  const totalPages = Math.ceil(APP_STATE.filteredDocuments.length / APP_STATE.rowsPerPage);
  const startIdx = (APP_STATE.currentPage - 1) * APP_STATE.rowsPerPage + 1;
  const endIdx = Math.min(startIdx + APP_STATE.rowsPerPage - 1, APP_STATE.filteredDocuments.length);
  
  document.getElementById('pagination-info').textContent = 
    `Mostrando ${startIdx}-${endIdx} de ${APP_STATE.filteredDocuments.length}`;
  
  document.getElementById('page-indicator').textContent = 
    `Página ${APP_STATE.currentPage} de ${totalPages || 1}`;
  
  document.getElementById('btn-prev-page').disabled = APP_STATE.currentPage === 1;
  document.getElementById('btn-next-page').disabled = APP_STATE.currentPage >= totalPages;
}

/**
 * Navigate to previous page
 */
function prevPage() {
  if (APP_STATE.currentPage > 1) {
    APP_STATE.currentPage--;
    renderTable();
    updatePagination();
  }
}

/**
 * Navigate to next page
 */
function nextPage() {
  const totalPages = Math.ceil(APP_STATE.filteredDocuments.length / APP_STATE.rowsPerPage);
  if (APP_STATE.currentPage < totalPages) {
    APP_STATE.currentPage++;
    renderTable();
    updatePagination();
  }
}

/**
 * Change rows per page
 */
function changeRowsPerPage(value) {
  APP_STATE.rowsPerPage = parseInt(value);
  APP_STATE.currentPage = 1;
  renderTable();
  updatePagination();
}

/**
 * Sort documents by column
 */
function sortDocuments(column) {
  if (APP_STATE.sortColumn === column) {
    APP_STATE.sortDirection = APP_STATE.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    APP_STATE.sortColumn = column;
    APP_STATE.sortDirection = 'asc';
  }
  
  APP_STATE.filteredDocuments.sort((a, b) => {
    let valA = a[column] || '';
    let valB = b[column] || '';
    
    // Special handling for numeric fields
    if (column === 'id') {
      valA = parseInt(valA) || 0;
      valB = parseInt(valB) || 0;
    } else if (column === 'campos_count') {
      valA = a.campos.length;
      valB = b.campos.length;
    } else {
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
    }
    
    if (valA < valB) return APP_STATE.sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return APP_STATE.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  APP_STATE.currentPage = 1;
  renderTable();
}

/**
 * Update table headers with sort indicators
 */
function updateTableHeaders() {
  const headers = document.querySelectorAll('#main-table th[data-sort]');
  headers.forEach(th => {
    const column = th.dataset.sort;
    th.classList.remove('sort-asc', 'sort-desc');
    
    if (APP_STATE.sortColumn === column) {
      th.classList.add(APP_STATE.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create new document
 */
function createNewDocument() {
  const newId = String(Math.max(0, ...APP_STATE.documents.map(d => parseInt(d.id) || 0)) + 1);
  
  const newDoc = {
    id: newId,
    codigo: '',
    nombre: 'Nuevo Documento',
    puede_tener_mas: 'no',
    categoria: '',
    tipo_vigencia: '',
    vigencia_dias: '',
    campos: [],
    comentario: ''
  };
  
  APP_STATE.documents.unshift(newDoc);
  markUnsaved();
  applyFiltersAndRender();
  openDocumentSidebar(newId);
  
  showNotification('Nuevo documento creado', 'success');
}

/**
 * Delete document by ID
 */
function deleteDocument(id) {
  if (!confirm('¿Estás seguro de eliminar este documento?')) {
    return;
  }
  
  APP_STATE.documents = APP_STATE.documents.filter(doc => doc.id !== id);
  markUnsaved();
  applyFiltersAndRender();
  closeSidebar();
  
  showNotification('Documento eliminado', 'success');
}

/**
 * Duplicate document
 */
function duplicateDocument(id) {
  const original = APP_STATE.documents.find(doc => doc.id === id);
  if (!original) return;
  
  const newId = String(Math.max(0, ...APP_STATE.documents.map(d => parseInt(d.id) || 0)) + 1);
  
  const duplicate = {
    ...JSON.parse(JSON.stringify(original)),
    id: newId,
    nombre: original.nombre + ' (copia)'
  };
  
  APP_STATE.documents.push(duplicate);
  markUnsaved();
  applyFiltersAndRender();
  openDocumentSidebar(newId);
  
  showNotification('Documento duplicado', 'success');
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 * Mark as unsaved
 */
function markUnsaved() {
  APP_STATE.hasUnsavedChanges = true;
  updateUnsavedIndicator();
}

/**
 * Update unsaved indicator
 */
function updateUnsavedIndicator() {
  const indicator = document.getElementById('unsaved-indicator');
  indicator.style.display = APP_STATE.hasUnsavedChanges ? 'inline-block' : 'none';
}

/**
 * Update stats summary
 */
function updateStatsSummary() {
  const summary = document.getElementById('stats-summary');
  summary.textContent = `${APP_STATE.filteredDocuments.length} documento(s)`;
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
  // Simple console log for now; can be enhanced with toast UI
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Optional: Show browser alert for errors
  if (type === 'error') {
    alert(message);
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize multi-select dropdowns
 */
function initMultiSelects() {
  document.querySelectorAll('.multi-select').forEach(ms => {
    const trigger = ms.querySelector('.ms-trigger');
    const dropdown = ms.querySelector('.ms-dropdown');
    
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Close other dropdowns
      document.querySelectorAll('.ms-dropdown').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
      });
      
      // Toggle current
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.ms-dropdown').forEach(d => {
      d.style.display = 'none';
    });
  });
}

/**
 * Initialize app after CSV is loaded
 */
function initializeApp() {
  // Enable controls
  document.getElementById('btn-save-csv').disabled = false;
  document.getElementById('btn-save-as').disabled = false;
  document.getElementById('btn-new-doc').disabled = false;
  document.getElementById('btn-generate-page').disabled = false;
  document.getElementById('filter-search').disabled = false;
  document.getElementById('btn-clear-filters').disabled = false;
  document.getElementById('rows-per-page').disabled = false;
  
  // Build filter options
  buildMultiSelectOptions('ms-categoria', 'categoria');
  buildMultiSelectOptions('ms-vigencia', 'tipo_vigencia');
  buildMultiSelectOptions('ms-multiple', 'puede_tener_mas');
}

/**
 * Generate public HTML page with embedded data
 */
function generatePublicPage() {
  try {
    showNotification('Generando página pública...', 'info');
    
    // Use embedded CSS constant (loaded from embedded_css.js)
    const cssContent = typeof EMBEDDED_CSS !== 'undefined' ? EMBEDDED_CSS : '';
    
    if (!cssContent) {
      showNotification('⚠️ CSS no encontrado. La página puede verse sin estilos.', 'warning');
    }
    
    // Serialize documents to JSON
    const dataJson = JSON.stringify(APP_STATE.documents, null, 2);
    
    // Generate complete HTML
    const html = generatePublicHTML(dataJson, cssContent);
    
    // Save as HTML file
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documentos_page.html';
    a.click();
    
    URL.revokeObjectURL(url);
    
    showNotification('✓ Página pública generada: documentos_page.html', 'success');
  } catch (err) {
    showNotification('Error al generar página: ' + err.message, 'error');
    console.error('Error generating page:', err);
  }
}

/**
 * Generate complete HTML with embedded data and styles
 */
function generatePublicHTML(dataJson, cssContent) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registros COLCA - Documentos</title>
  <style>
${cssContent}
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <h1>📁 Registros COLCA - Documentos</h1>
      <div class="header-actions">
        <span class="badge badge-neutral" id="total-docs"></span>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <div class="container">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <strong>Base de Datos de Documentos (Solo Lectura)</strong>
      </div>
      <div class="toolbar-right">
        <button id="btn-download-csv" class="btn btn-sm btn-outline" style="margin-right: 10px;">
          📥 Descargar CSV
        </button>
        <span id="stats-summary"></span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-panel">
      <div class="filter-group">
        <label>🔍 Buscar</label>
        <input type="text" id="filter-search" class="input-text" placeholder="Buscar por nombre...">
      </div>

      <div class="filter-group">
        <label>Categoría</label>
        <select id="filter-categoria" class="input-select">
          <option value="">Todas</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Tipo de Vigencia</label>
        <select id="filter-vigencia" class="input-select">
          <option value="">Todos</option>
        </select>
      </div>

      <div class="filter-group">
        <button id="btn-clear-filters" class="btn btn-sm btn-outline">✕ Limpiar filtros</button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="table-container">
      <table class="data-table" id="main-table">
        <thead>
          <tr>
            <th data-sort="id" onclick="sortDocuments('id')" class="sortable">ID</th>
            <th data-sort="nombre" onclick="sortDocuments('nombre')" class="sortable">Nombre del Documento</th>
            <th data-sort="categoria" onclick="sortDocuments('categoria')" class="sortable">Categoría</th>
            <th data-sort="tipo_vigencia" onclick="sortDocuments('tipo_vigencia')" class="sortable">Tipo de Vigencia</th>
            <th data-sort="vigencia_dias" onclick="sortDocuments('vigencia_dias')" class="sortable">Vigencia (días)</th>
            <th data-sort="campos_count" onclick="sortDocuments('campos_count')" class="sortable"># Campos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="table-body"></tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-bar">
      <div class="pagination-info">
        <span id="pagination-info">Mostrando 0 de 0</span>
      </div>
      <div class="pagination-controls">
        <label>Filas por página:</label>
        <select id="rows-per-page" class="select-sm">
          <option value="20" selected>20</option>
          <option value="50">50</option>
          <option value="999999">Todas</option>
        </select>
      </div>
      <div class="pagination-buttons">
        <button id="btn-prev-page" class="btn btn-sm">‹ Anterior</button>
        <span id="page-indicator">Página 1 de 1</span>
        <button id="btn-next-page" class="btn btn-sm">Siguiente ›</button>
      </div>
    </div>
  </div>

  <!-- Sidebar (Read-only view) -->
  <div class="sidebar" id="sidebar" style="display: none;">
    <div class="sidebar-header">
      <h2 id="sidebar-title">Detalle del Documento</h2>
      <button id="btn-close-sidebar" class="btn-icon">✕</button>
    </div>

    <div class="sidebar-tabs">
      <button class="tab-btn active" data-tab="general">Información General</button>
      <button class="tab-btn" data-tab="vigencia">Vigencia</button>
      <button class="tab-btn" data-tab="campos">Campos</button>
      <button class="tab-btn" data-tab="notas">Notas</button>
    </div>

    <div class="sidebar-body" id="sidebar-body"></div>
  </div>

  <!-- Overlay for sidebar -->
  <div class="sidebar-overlay" id="sidebar-overlay" style="display: none;"></div>

  <script>
    // Embedded data
    const DOCUMENTS = ${dataJson};
    
    // Read-only state
    const STATE = {
      documents: DOCUMENTS,
      filteredDocuments: [],
      currentPage: 1,
      rowsPerPage: 20,
      filterSearch: '',
      filterCategoria: '',
      filterVigencia: '',
      selectedDocumentId: null,
      sortColumn: null,
      sortDirection: 'asc'
    };
    
    // Initialize
    function init() {
      STATE.filteredDocuments = STATE.documents;
      buildFilterOptions();
      applyFilters();
      attachEventListeners();
    }
    
    // Build filter options
    function buildFilterOptions() {
      const categorias = [...new Set(STATE.documents.map(d => d.categoria).filter(c => c))].sort();
      const vigencias = [...new Set(STATE.documents.map(d => d.tipo_vigencia).filter(v => v))].sort();
      
      const catSelect = document.getElementById('filter-categoria');
      categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
      });
      
      const vigSelect = document.getElementById('filter-vigencia');
      vigencias.forEach(vig => {
        const opt = document.createElement('option');
        opt.value = vig;
        opt.textContent = vig;
        vigSelect.appendChild(opt);
      });
    }
    
    // Apply filters
    function applyFilters() {
      STATE.filteredDocuments = STATE.documents.filter(doc => {
        if (STATE.filterSearch && !doc.nombre.toLowerCase().includes(STATE.filterSearch.toLowerCase())) {
          return false;
        }
        if (STATE.filterCategoria && doc.categoria !== STATE.filterCategoria) {
          return false;
        }
        if (STATE.filterVigencia && doc.tipo_vigencia !== STATE.filterVigencia) {
          return false;
        }
        return true;
      });
      
      STATE.currentPage = 1;
      renderTable();
    }
    
    // Sort documents
    function sortDocuments(column) {
      if (STATE.sortColumn === column) {
        STATE.sortDirection = STATE.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        STATE.sortColumn = column;
        STATE.sortDirection = 'asc';
      }
      
      STATE.filteredDocuments.sort((a, b) => {
        let valA = a[column] || '';
        let valB = b[column] || '';
        
        if (column === 'id') {
          valA = parseInt(valA) || 0;
          valB = parseInt(valB) || 0;
        } else if (column === 'campos_count') {
          valA = a.campos.length;
          valB = b.campos.length;
        } else {
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
        }
        
        if (valA < valB) return STATE.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return STATE.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      STATE.currentPage = 1;
      renderTable();
    }
    
    // Update table headers with sort indicators
    function updateTableHeaders() {
      const headers = document.querySelectorAll('#main-table th[data-sort]');
      headers.forEach(th => {
        const column = th.dataset.sort;
        th.classList.remove('sort-asc', 'sort-desc');
        
        if (STATE.sortColumn === column) {
          th.classList.add(STATE.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
      });
    }
    
    // Render table
    function renderTable() {
      const tbody = document.getElementById('table-body');
      const start = (STATE.currentPage - 1) * STATE.rowsPerPage;
      const end = start + STATE.rowsPerPage;
      const pageData = STATE.filteredDocuments.slice(start, end);
      
      tbody.innerHTML = pageData.map((doc, idx) => \`
        <tr onclick="openSidebar(\${doc.id})">
          <td>\${doc.id}</td>
          <td><strong>\${escapeHtml(doc.nombre)}</strong></td>
          <td><span class="badge badge-neutral">\${escapeHtml(doc.categoria)}</span></td>
          <td>\${escapeHtml(doc.tipo_vigencia)}</td>
          <td>\${escapeHtml(doc.vigencia_dias)}</td>
          <td><span class="badge badge-primary">\${doc.campos.length}</span></td>
          <td><button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); openSidebar(\${doc.id})">Ver</button></td>
        </tr>
      \`).join('');
      
      updatePagination();
      updateStats();
      updateTableHeaders();
    }
    
    // Update pagination
    function updatePagination() {
      const totalPages = Math.ceil(STATE.filteredDocuments.length / STATE.rowsPerPage);
      const start = (STATE.currentPage - 1) * STATE.rowsPerPage + 1;
      const end = Math.min(start + STATE.rowsPerPage - 1, STATE.filteredDocuments.length);
      
      document.getElementById('pagination-info').textContent = \`Mostrando \${start}-\${end} de \${STATE.filteredDocuments.length}\`;
      document.getElementById('page-indicator').textContent = \`Página \${STATE.currentPage} de \${totalPages}\`;
      document.getElementById('btn-prev-page').disabled = STATE.currentPage === 1;
      document.getElementById('btn-next-page').disabled = STATE.currentPage >= totalPages;
    }
    
    // Update stats
    function updateStats() {
      document.getElementById('total-docs').textContent = \`\${STATE.filteredDocuments.length} documentos\`;
      document.getElementById('stats-summary').textContent = \`Total: \${STATE.documents.length} | Mostrando: \${STATE.filteredDocuments.length}\`;
    }
    
    // Open sidebar
    function openSidebar(id) {
      const doc = STATE.documents.find(d => d.id === id);
      if (!doc) return;
      
      STATE.selectedDocumentId = id;
      document.getElementById('sidebar-title').textContent = doc.nombre;
      document.getElementById('sidebar').style.display = 'flex';
      document.getElementById('sidebar-overlay').style.display = 'block';
      
      renderSidebarTab('general', doc);
    }
    
    // Close sidebar
    function closeSidebar() {
      document.getElementById('sidebar').style.display = 'none';
      document.getElementById('sidebar-overlay').style.display = 'none';
    }
    
    // Switch sidebar tab
    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
      });
      
      const doc = STATE.documents.find(d => d.id === STATE.selectedDocumentId);
      if (doc) renderSidebarTab(tabId, doc);
    }
    
    // Render sidebar tab
    function renderSidebarTab(tabId, doc) {
      const container = document.getElementById('sidebar-body');
      
      switch (tabId) {
        case 'general':
          container.innerHTML = \`
            <div class="form-section">
              <div class="form-group">
                <label class="form-label">ID</label>
                <input type="text" class="input-text" value="\${escapeHtml(doc.id)}" disabled>
              </div>
              <div class="form-group">
                <label class="form-label">Nombre del Documento</label>
                <input type="text" class="input-text" value="\${escapeHtml(doc.nombre)}" disabled>
              </div>
              <div class="form-group">
                <label class="form-label">Categoría</label>
                <input type="text" class="input-text" value="\${escapeHtml(doc.categoria)}" disabled>
              </div>
              <div class="form-group">
                <label class="form-label">¿Puede tener más de 1?</label>
                <input type="text" class="input-text" value="\${escapeHtml(doc.puede_tener_mas)}" disabled>
              </div>
            </div>
          \`;
          break;
        case 'vigencia':
          container.innerHTML = \`
            <div class="form-section">
              <div class="form-group">
                <label class="form-label">Tipo de Vigencia</label>
                <input type="text" class="input-text" value="\${escapeHtml(doc.tipo_vigencia)}" disabled>
              </div>
              <div class="form-group">
                <label class="form-label">Vigencia Sugerida (días)</label>
                <input type="text" class="input-text" value="\${escapeHtml(doc.vigencia_dias)}" disabled>
              </div>
            </div>
          \`;
          break;
        case 'campos':
          const camposHTML = doc.campos.length > 0 
            ? doc.campos.map((campo, idx) => \`
                <tr>
                  <td>\${idx + 1}</td>
                  <td>\${escapeHtml(campo.nombre)}</td>
                </tr>
              \`).join('')
            : '<tr><td colspan="2" style="text-align:center;padding:20px;color:#999;">No hay campos definidos</td></tr>';
          
          container.innerHTML = \`
            <div class="form-section">
              <table class="mini-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">#</th>
                    <th>Nombre del Campo</th>
                  </tr>
                </thead>
                <tbody>\${camposHTML}</tbody>
              </table>
            </div>
          \`;
          break;
        case 'notas':
          container.innerHTML = \`
            <div class="form-section">
              <div class="form-group">
                <label class="form-label">Comentarios y Notas</label>
                <textarea class="input-textarea" rows="10" disabled>\${escapeHtml(doc.comentario)}</textarea>
              </div>
            </div>
          \`;
          break;
      }
    }
    
    // Download CSV
    function downloadCSV() {
      // Convert documents to flat CSV structure
      const rows = [];
      
      // Header
      rows.push(['ID', 'Código', 'Nombre del Documento', 'Puede tener + de 1', 'Categoría', 'Tipo de vigencia', 'Vigencia sugerida (días)', 'campos documento', 'nombre campos', 'Comentario'].join(';'));
      
      // Data rows
      STATE.documents.forEach(doc => {
        // Document row
        rows.push([
          doc.id,
          doc.codigo || '',
          doc.nombre,
          doc.puede_tener_mas || '',
          doc.categoria || '',
          doc.tipo_vigencia || '',
          doc.vigencia_dias || '',
          '',
          '',
          doc.comentario || ''
        ].join(';'));
        
        // Campo rows
        doc.campos.forEach(campo => {
          rows.push([
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            campo.nombre || '',
            '',
            ''
          ].join(';'));
        });
      });
      
      // Create blob and download
      const csvContent = rows.join('\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Documentos_COLCA.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    // Attach event listeners
    function attachEventListeners() {
      document.getElementById('filter-search').addEventListener('input', e => {
        STATE.filterSearch = e.target.value;
        applyFilters();
      });
      
      document.getElementById('filter-categoria').addEventListener('change', e => {
        STATE.filterCategoria = e.target.value;
        applyFilters();
      });
      
      document.getElementById('filter-vigencia').addEventListener('change', e => {
        STATE.filterVigencia = e.target.value;
        applyFilters();
      });
      
      document.getElementById('btn-clear-filters').addEventListener('click', () => {
        STATE.filterSearch = '';
        STATE.filterCategoria = '';
        STATE.filterVigencia = '';
        document.getElementById('filter-search').value = '';
        document.getElementById('filter-categoria').value = '';
        document.getElementById('filter-vigencia').value = '';
        applyFilters();
      });
      
      document.getElementById('btn-download-csv').addEventListener('click', downloadCSV);
      
      document.getElementById('rows-per-page').addEventListener('change', e => {
        STATE.rowsPerPage = parseInt(e.target.value);
        STATE.currentPage = 1;
        renderTable();
      });
      
      document.getElementById('btn-prev-page').addEventListener('click', () => {
        if (STATE.currentPage > 1) {
          STATE.currentPage--;
          renderTable();
        }
      });
      
      document.getElementById('btn-next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(STATE.filteredDocuments.length / STATE.rowsPerPage);
        if (STATE.currentPage < totalPages) {
          STATE.currentPage++;
          renderTable();
        }
      });
      
      document.getElementById('btn-close-sidebar').addEventListener('click', closeSidebar);
      document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
      
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
      });
    }
    
    // Escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text || '';
      return div.innerHTML;
    }
    
    // Initialize on load
    document.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>`;
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // File operations
  document.getElementById('btn-load-csv').addEventListener('click', loadCSVFile);
  document.getElementById('btn-save-csv').addEventListener('click', saveCSVFile);
  document.getElementById('btn-save-as').addEventListener('click', saveAsCSVFile);
  
  // CRUD
  document.getElementById('btn-new-doc').addEventListener('click', createNewDocument);
  document.getElementById('btn-generate-page').addEventListener('click', generatePublicPage);
  
  // Filters
  document.getElementById('filter-search').addEventListener('input', (e) => {
    APP_STATE.filterState.search = e.target.value;
    applyFiltersAndRender();
  });
  document.getElementById('btn-clear-filters').addEventListener('click', clearAllFilters);
  
  // Pagination
  document.getElementById('btn-prev-page').addEventListener('click', prevPage);
  document.getElementById('btn-next-page').addEventListener('click', nextPage);
  document.getElementById('rows-per-page').addEventListener('change', (e) => {
    changeRowsPerPage(e.target.value);
  });
  
  // Initialize multi-selects
  initMultiSelects();
  
  // Warn on page close if unsaved
  window.addEventListener('beforeunload', (e) => {
    if (APP_STATE.hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
});
