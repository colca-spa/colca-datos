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
  selectedDocumentId: null
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
 * Generate public HTML page
 */
function generatePublicPage() {
  const csvText = serializeToCSV(APP_STATE.documents);
  const blob = new Blob([csvText], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Documentos_export.csv';
  a.click();
  
  URL.revokeObjectURL(url);
  
  showNotification('CSV exportado. Ejecuta generate_page.py para crear la página pública.', 'info');
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
