// ============================================================================
// SIDEBAR MANAGEMENT - Document Detail Panel with Tabs
// ============================================================================

/**
 * Open sidebar for a specific document
 */
function openDocumentSidebar(documentId) {
  APP_STATE.selectedDocumentId = documentId;
  const doc = APP_STATE.documents.find(d => d.id === documentId);
  
  if (!doc) {
    showNotification('Documento no encontrado', 'error');
    return;
  }
  
  // Show sidebar
  document.getElementById('sidebar').style.display = 'flex';
  document.getElementById('sidebar-overlay').style.display = 'block';
  
  // Set title
  document.getElementById('sidebar-title').textContent = 
    doc.nombre || 'Documento sin nombre';
  
  // Reset to first tab
  switchTab('general');
  renderTabContent('general', doc);
}

/**
 * Close sidebar
 */
function closeSidebar() {
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('sidebar-overlay').style.display = 'none';
  APP_STATE.selectedDocumentId = null;
}

/**
 * Switch between tabs
 */
function switchTab(tabId) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    }
  });
  
  // Render tab content
  const doc = APP_STATE.documents.find(d => d.id === APP_STATE.selectedDocumentId);
  if (doc) {
    renderTabContent(tabId, doc);
  }
}

/**
 * Render tab content based on tab ID
 */
function renderTabContent(tabId, doc) {
  const container = document.getElementById('sidebar-body');
  
  switch (tabId) {
    case 'general':
      container.innerHTML = renderGeneralTab(doc);
      break;
    case 'vigencia':
      container.innerHTML = renderVigenciaTab(doc);
      break;
    case 'campos':
      container.innerHTML = renderCamposTab(doc);
      break;
    case 'notas':
      container.innerHTML = renderNotasTab(doc);
      break;
  }
}

/**
 * Render General Info tab
 */
function renderGeneralTab(doc) {
  // Get unique categories for suggestions
  const allCategorias = [...new Set(
    APP_STATE.documents.map(d => d.categoria).filter(c => c)
  )];
  
  return `
    <div class="form-section">
      <div class="form-group">
        <label class="form-label">ID</label>
        <input type="text" class="input-text" value="${escapeHtml(doc.id)}" 
               disabled style="background: #f5f5f5; cursor: not-allowed;">
        <small class="form-hint">El ID se genera automáticamente</small>
      </div>
      
      <div class="form-group">
        <label class="form-label">Nombre del Documento *</label>
        <input type="text" class="input-text" value="${escapeHtml(doc.nombre)}" 
               onchange="updateDocumentField('nombre', this.value)"
               placeholder="ej: Cédula de identidad antigua">
      </div>
      
      <div class="form-group">
        <label class="form-label">Categoría</label>
        <input type="text" class="input-text" value="${escapeHtml(doc.categoria)}" 
               onchange="updateDocumentField('categoria', this.value)"
               placeholder="ej: Documentos de Identidad"
               list="categoria-suggestions">
        <datalist id="categoria-suggestions">
          ${allCategorias.map(c => `<option value="${escapeHtml(c)}">`).join('')}
        </datalist>
        <small class="form-hint">Escribe o selecciona de las sugerencias</small>
      </div>
      
      <div class="form-group">
        <label class="form-label">¿Puede tener más de 1?</label>
        <select class="input-select" 
                onchange="updateDocumentField('puede_tener_mas', this.value)">
          <option value="si" ${doc.puede_tener_mas === 'si' ? 'selected' : ''}>Sí</option>
          <option value="no" ${doc.puede_tener_mas === 'no' ? 'selected' : ''}>No</option>
        </select>
      </div>
    </div>
  `;
}

/**
 * Render Vigencia tab
 */
function renderVigenciaTab(doc) {
  // Get unique vigencia types for suggestions
  const allTiposVigencia = [...new Set(
    APP_STATE.documents.map(d => d.tipo_vigencia).filter(t => t)
  )];
  
  return `
    <div class="form-section">
      <div class="form-group">
        <label class="form-label">Tipo de Vigencia</label>
        <input type="text" class="input-text" 
               value="${escapeHtml(doc.tipo_vigencia)}" 
               onchange="updateDocumentField('tipo_vigencia', this.value)"
               placeholder="ej: fecha_expiracion"
               list="vigencia-suggestions">
        <datalist id="vigencia-suggestions">
          ${allTiposVigencia.map(t => `<option value="${escapeHtml(t)}">`).join('')}
        </datalist>
        <small class="form-hint">Opciones comunes: fecha_expiracion, sin_vigencia, periodo_desde_emision</small>
      </div>
      
      <div class="form-group">
        <label class="form-label">Vigencia Sugerida (días)</label>
        <input type="text" class="input-text" 
               value="${escapeHtml(doc.vigencia_dias)}" 
               onchange="updateDocumentField('vigencia_dias', this.value)"
               placeholder="ej: 90, 180, 365 o —">
        <small class="form-hint">Número de días o "—" para no aplica</small>
      </div>
      
      <div class="info-box info-box-blue">
        <div class="info-box-title">ℹ️ Tipos de Vigencia</div>
        <ul class="info-list">
          <li><strong>fecha_expiracion:</strong> El documento tiene una fecha de vencimiento</li>
          <li><strong>sin_vigencia:</strong> El documento no caduca</li>
          <li><strong>periodo_desde_emision:</strong> Válido por X días desde su emisión</li>
        </ul>
      </div>
    </div>
  `;
}

/**
 * Render Campos tab
 */
function renderCamposTab(doc) {
  const camposHTML = doc.campos.length > 0 
    ? doc.campos.map((campo, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <input type="text" class="input-text-inline" 
                   value="${escapeHtml(campo.nombre)}"
                   onchange="updateCampoNombre(${idx}, this.value)">
          </td>
          <td>
            <button class="btn btn-sm btn-danger" 
                    onclick="deleteCampo(${idx})"
                    title="Eliminar campo">
              ✕
            </button>
          </td>
        </tr>
      `).join('')
    : `
        <tr>
          <td colspan="3" class="empty-state-small">
            No hay campos definidos
          </td>
        </tr>
      `;
  
  return `
    <div class="form-section">
      <div class="form-group">
        <label class="form-label">Campos del Documento</label>
        <table class="mini-table">
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Nombre del Campo</th>
              <th style="width: 80px;">Acciones</th>
            </tr>
          </thead>
          <tbody id="campos-table-body">
            ${camposHTML}
          </tbody>
        </table>
      </div>
      
      <div class="form-group">
        <label class="form-label">Agregar Nuevo Campo</label>
        <div class="input-group">
          <input type="text" class="input-text" id="new-campo-nombre" 
                 placeholder="ej: primer apellido">
          <button class="btn btn-primary" onclick="addNewCampo()">
            ➕ Agregar
          </button>
        </div>
      </div>
      
      <div class="info-box info-box-gray">
        <div class="info-box-title">💡 Campos del Documento</div>
        <p>Los campos representan los datos individuales que se extraen de este documento.</p>
        <p><strong>Ejemplo:</strong> Para una cédula de identidad, los campos serían: primer nombre, segundo nombre, primer apellido, fecha de nacimiento, etc.</p>
      </div>
    </div>
  `;
}

/**
 * Render Notas tab
 */
function renderNotasTab(doc) {
  return `
    <div class="form-section">
      <div class="form-group">
        <label class="form-label">Comentarios y Notas</label>
        <textarea class="input-textarea" rows="10" 
                  onchange="updateDocumentField('comentario', this.value)"
                  placeholder="Escribe aquí cualquier nota o comentario sobre este documento...">${escapeHtml(doc.comentario)}</textarea>
      </div>
    </div>
  `;
}

/**
 * Update document field
 */
function updateDocumentField(fieldName, value) {
  const doc = APP_STATE.documents.find(d => d.id === APP_STATE.selectedDocumentId);
  if (!doc) return;
  
  doc[fieldName] = value;
  markUnsaved();
  
  // Update title if nombre changed
  if (fieldName === 'nombre') {
    document.getElementById('sidebar-title').textContent = value || 'Documento sin nombre';
  }
  
  // Rebuild filters if category or vigencia changed
  if (fieldName === 'categoria' || fieldName === 'tipo_vigencia' || fieldName === 'puede_tener_mas') {
    buildMultiSelectOptions('ms-categoria', 'categoria');
    buildMultiSelectOptions('ms-vigencia', 'tipo_vigencia');
    buildMultiSelectOptions('ms-multiple', 'puede_tener_mas');
    applyFiltersAndRender();
  } else {
    // Just re-render table if other fields changed
    renderTable();
  }
}

/**
 * Update campo nombre
 */
function updateCampoNombre(index, value) {
  const doc = APP_STATE.documents.find(d => d.id === APP_STATE.selectedDocumentId);
  if (!doc || !doc.campos[index]) return;
  
  doc.campos[index].nombre = value;
  markUnsaved();
  renderTable();
}

/**
 * Save document changes to CSV file
 */
async function saveDocumentChanges() {
  const doc = APP_STATE.documents.find(d => d.id === APP_STATE.selectedDocumentId);
  if (!doc) {
    showNotification('No hay documento seleccionado', 'error');
    return;
  }
  
  // Validate required fields
  if (!doc.nombre || doc.nombre.trim() === '') {
    showNotification('El nombre del documento es obligatorio', 'error');
    return;
  }
  
  // Save to CSV file
  try {
    await saveCSVFile();
    showNotification('✓ Cambios guardados correctamente', 'success');
  } catch (err) {
    showNotification('Error al guardar: ' + err.message, 'error');
  }
}

/**
 * Add new campo
 */
function addNewCampo() {
  const input = document.getElementById('new-campo-nombre');
  const value = input.value.trim();
  
  if (!value) {
    alert('Por favor ingresa un nombre para el campo');
    return;
  }
  
  const doc = APP_STATE.documents.find(d => d.id === APP_STATE.selectedDocumentId);
  if (!doc) return;
  
  doc.campos.push({ nombre: value });
  markUnsaved();
  
  // Re-render tab
  renderTabContent('campos', doc);
  renderTable();
  
  showNotification('Campo agregado', 'success');
}

/**
 * Delete campo
 */
function deleteCampo(index) {
  const doc = APP_STATE.documents.find(d => d.id === APP_STATE.selectedDocumentId);
  if (!doc) return;
  
  if (!confirm(`¿Eliminar el campo "${doc.campos[index].nombre}"?`)) {
    return;
  }
  
  doc.campos.splice(index, 1);
  markUnsaved();
  
  // Re-render tab
  renderTabContent('campos', doc);
  renderTable();
  
  showNotification('Campo eliminado', 'success');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar close
  document.getElementById('btn-close-sidebar').addEventListener('click', closeSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
  
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });
  
  // Sidebar actions
  document.getElementById('btn-delete-doc').addEventListener('click', () => {
    if (APP_STATE.selectedDocumentId) {
      deleteDocument(APP_STATE.selectedDocumentId);
    }
  });
  
  document.getElementById('btn-duplicate-doc').addEventListener('click', () => {
    if (APP_STATE.selectedDocumentId) {
      duplicateDocument(APP_STATE.selectedDocumentId);
    }
  });
  
  // Escape key closes sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('sidebar').style.display !== 'none') {
      closeSidebar();
    }
  });
});
