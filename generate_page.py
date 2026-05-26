#!/usr/bin/env python3
"""
Generate standalone HTML page with embedded data for public viewing.
This page is read-only and can be published to GitHub Pages or any static host.
"""

import csv
import json
import pathlib
from typing import List, Dict, Any

# Paths
HERE = pathlib.Path(__file__).parent
CSV_FILE = HERE / 'Documentos.csv'
OUTPUT_FILE = HERE / 'documentos_page.html'
STYLES_FILE = HERE / 'styles.css'


def parse_csv_to_relational(csv_path: pathlib.Path) -> List[Dict[str, Any]]:
    """
    Parse CSV and transform from flat structure to relational documents.
    
    Rows with ID are main documents.
    Rows without ID are campos belonging to the previous document.
    """
    documents = []
    current_doc = None
    
    with open(csv_path, encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        for row in reader:
            has_id = row['ID'] and row['ID'].strip() != ''
            
            if has_id:
                # Save previous document if exists
                if current_doc:
                    documents.append(current_doc)
                
                # Start new document
                current_doc = {
                    'id': row['ID'].strip(),
                    'codigo': row['Código'] or '',
                    'nombre': row['Nombre del Documento'] or '',
                    'puede_tener_mas': row['Puede tener + de 1'] or '',
                    'categoria': row['Categoría'] or '',
                    'tipo_vigencia': row['Tipo de vigencia'] or '',
                    'vigencia_dias': row['Vigencia sugerida (días)'] or '',
                    'campos': [],
                    'comentario': row['Comentario'] or ''
                }
            elif current_doc:
                # This is a campo row
                campo_nombre = row['campos documento'] or ''
                if campo_nombre.strip():
                    current_doc['campos'].append({
                        'nombre': campo_nombre.strip()
                    })
        
        # Save last document
        if current_doc:
            documents.append(current_doc)
    
    return documents


def generate_html(documents: List[Dict[str, Any]], css_content: str) -> str:
    """
    Generate standalone HTML with embedded data and styles.
    """
    # Serialize documents to JSON
    data_json = json.dumps(documents, ensure_ascii=False, indent=2)
    
    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registros COLCA - Documentos</title>
  <style>
{css_content}
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
        <strong>Base de Datos de Documentos</strong>
      </div>
      <div class="toolbar-right">
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
        <div class="multi-select" id="ms-categoria">
          <div class="ms-trigger">
            <span class="ms-text">Todas</span>
            <span class="ms-arrow">▼</span>
          </div>
          <div class="ms-dropdown" style="display:none">
            <div class="ms-options" id="ms-categoria-opts"></div>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label>Tipo de Vigencia</label>
        <div class="multi-select" id="ms-vigencia">
          <div class="ms-trigger">
            <span class="ms-text">Todos</span>
            <span class="ms-arrow">▼</span>
          </div>
          <div class="ms-dropdown" style="display:none">
            <div class="ms-options" id="ms-vigencia-opts"></div>
          </div>
        </div>
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
            <th>ID</th>
            <th>Código</th>
            <th>Nombre del Documento</th>
            <th>Categoría</th>
            <th>Tipo de Vigencia</th>
            <th>Vigencia (días)</th>
            <th># Campos</th>
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

  <!-- Overlay -->
  <div class="sidebar-overlay" id="sidebar-overlay" style="display: none;"></div>

  <script>
    // ========================================================================
    // EMBEDDED DATA
    // ========================================================================
    const DOCUMENTS = {data_json};

    // ========================================================================
    // STATE
    // ========================================================================
    const STATE = {{
      documents: DOCUMENTS,
      filteredDocuments: DOCUMENTS,
      filterState: {{
        search: '',
        categoria: [],
        tipo_vigencia: []
      }},
      currentPage: 1,
      rowsPerPage: 20,
      selectedDocumentId: null
    }};

    // ========================================================================
    // HELPERS
    // ========================================================================
    function escapeHtml(text) {{
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }}

    // ========================================================================
    // FILTERS
    // ========================================================================
    function buildMultiSelectOptions(containerId, fieldName) {{
      const uniqueValues = [...new Set(
        STATE.documents.map(doc => doc[fieldName]).filter(v => v && v.trim() !== '')
      )].sort();
      
      const container = document.getElementById(containerId + '-opts');
      container.innerHTML = uniqueValues.map(value => `
        <label class="ms-option">
          <input type="checkbox" value="${{escapeHtml(value)}}" 
                 onchange="onFilterChange('${{fieldName}}', this)">
          <span>${{escapeHtml(value)}}</span>
        </label>
      `).join('');
    }}

    function onFilterChange(fieldName, checkbox) {{
      const value = checkbox.value;
      
      if (checkbox.checked) {{
        if (!STATE.filterState[fieldName].includes(value)) {{
          STATE.filterState[fieldName].push(value);
        }}
      }} else {{
        STATE.filterState[fieldName] = STATE.filterState[fieldName].filter(v => v !== value);
      }}
      
      updateMultiSelectText(fieldName);
      applyFiltersAndRender();
    }}

    function updateMultiSelectText(fieldName) {{
      const msId = {{
        'categoria': 'ms-categoria',
        'tipo_vigencia': 'ms-vigencia'
      }}[fieldName];
      
      const selected = STATE.filterState[fieldName];
      const textEl = document.querySelector(`#${{msId}} .ms-text`);
      
      if (selected.length === 0) {{
        textEl.textContent = fieldName === 'categoria' ? 'Todas' : 'Todos';
      }} else if (selected.length === 1) {{
        textEl.textContent = selected[0];
      }} else {{
        textEl.textContent = `${{selected.length}} seleccionados`;
      }}
    }}

    function applyFiltersAndRender() {{
      let filtered = [...STATE.documents];
      
      // Search filter
      if (STATE.filterState.search.trim() !== '') {{
        const searchLower = STATE.filterState.search.toLowerCase();
        filtered = filtered.filter(doc => 
          (doc.nombre || '').toLowerCase().includes(searchLower) ||
          (doc.codigo || '').toLowerCase().includes(searchLower) ||
          (doc.categoria || '').toLowerCase().includes(searchLower)
        );
      }}
      
      // Categoria filter
      if (STATE.filterState.categoria.length > 0) {{
        filtered = filtered.filter(doc => 
          STATE.filterState.categoria.includes(doc.categoria)
        );
      }}
      
      // Tipo vigencia filter
      if (STATE.filterState.tipo_vigencia.length > 0) {{
        filtered = filtered.filter(doc => 
          STATE.filterState.tipo_vigencia.includes(doc.tipo_vigencia)
        );
      }}
      
      STATE.filteredDocuments = filtered;
      STATE.currentPage = 1;
      
      renderTable();
      updatePagination();
      updateStatsSummary();
    }}

    function clearAllFilters() {{
      STATE.filterState = {{
        search: '',
        categoria: [],
        tipo_vigencia: []
      }};
      
      document.getElementById('filter-search').value = '';
      document.querySelectorAll('.ms-option input[type="checkbox"]').forEach(cb => {{
        cb.checked = false;
      }});
      
      updateMultiSelectText('categoria');
      updateMultiSelectText('tipo_vigencia');
      applyFiltersAndRender();
    }}

    // ========================================================================
    // TABLE
    // ========================================================================
    function renderTable() {{
      const tbody = document.getElementById('table-body');
      const startIdx = (STATE.currentPage - 1) * STATE.rowsPerPage;
      const endIdx = startIdx + STATE.rowsPerPage;
      const pageData = STATE.filteredDocuments.slice(startIdx, endIdx);
      
      if (pageData.length === 0) {{
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="empty-state">No hay documentos que coincidan con los filtros</td>
          </tr>
        `;
        return;
      }}
      
      tbody.innerHTML = pageData.map(doc => `
        <tr onclick="openDocumentSidebar('${{doc.id}}')" class="table-row-clickable">
          <td>${{escapeHtml(doc.id)}}</td>
          <td><code class="code-badge">${{escapeHtml(doc.codigo)}}</code></td>
          <td><strong>${{escapeHtml(doc.nombre)}}</strong></td>
          <td><span class="badge badge-category">${{escapeHtml(doc.categoria)}}</span></td>
          <td><span class="badge badge-vigencia-${{doc.tipo_vigencia}}">${{escapeHtml(doc.tipo_vigencia)}}</span></td>
          <td>${{escapeHtml(doc.vigencia_dias)}}</td>
          <td><span class="badge badge-neutral">${{doc.campos.length}}</span></td>
          <td onclick="event.stopPropagation()">
            <button class="btn btn-sm btn-outline" onclick="openDocumentSidebar('${{doc.id}}')">Ver</button>
          </td>
        </tr>
      `).join('');
    }}

    function updatePagination() {{
      const totalPages = Math.ceil(STATE.filteredDocuments.length / STATE.rowsPerPage);
      const startIdx = (STATE.currentPage - 1) * STATE.rowsPerPage + 1;
      const endIdx = Math.min(startIdx + STATE.rowsPerPage - 1, STATE.filteredDocuments.length);
      
      document.getElementById('pagination-info').textContent = 
        `Mostrando ${{startIdx}}-${{endIdx}} de ${{STATE.filteredDocuments.length}}`;
      document.getElementById('page-indicator').textContent = 
        `Página ${{STATE.currentPage}} de ${{totalPages || 1}}`;
      
      document.getElementById('btn-prev-page').disabled = STATE.currentPage === 1;
      document.getElementById('btn-next-page').disabled = STATE.currentPage >= totalPages;
    }}

    function updateStatsSummary() {{
      document.getElementById('stats-summary').textContent = 
        `${{STATE.filteredDocuments.length}} documento(s)`;
      document.getElementById('total-docs').textContent = 
        `${{STATE.documents.length}} documentos`;
    }}

    // ========================================================================
    // SIDEBAR (READ-ONLY)
    // ========================================================================
    function openDocumentSidebar(documentId) {{
      STATE.selectedDocumentId = documentId;
      const doc = STATE.documents.find(d => d.id === documentId);
      if (!doc) return;
      
      document.getElementById('sidebar').style.display = 'flex';
      document.getElementById('sidebar-overlay').style.display = 'block';
      document.getElementById('sidebar-title').textContent = doc.nombre || 'Sin nombre';
      
      switchTab('general');
    }}

    function closeSidebar() {{
      document.getElementById('sidebar').style.display = 'none';
      document.getElementById('sidebar-overlay').style.display = 'none';
    }}

    function switchTab(tabId) {{
      document.querySelectorAll('.tab-btn').forEach(btn => {{
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) btn.classList.add('active');
      }});
      
      const doc = STATE.documents.find(d => d.id === STATE.selectedDocumentId);
      if (doc) renderTabContent(tabId, doc);
    }}

    function renderTabContent(tabId, doc) {{
      const container = document.getElementById('sidebar-body');
      
      switch (tabId) {{
        case 'general':
          container.innerHTML = `
            <div class="form-section">
              <div class="form-group"><label class="form-label">ID</label><p>${{escapeHtml(doc.id)}}</p></div>
              <div class="form-group"><label class="form-label">Código</label><p><code>${{escapeHtml(doc.codigo)}}</code></p></div>
              <div class="form-group"><label class="form-label">Nombre</label><p><strong>${{escapeHtml(doc.nombre)}}</strong></p></div>
              <div class="form-group"><label class="form-label">Categoría</label><p>${{escapeHtml(doc.categoria)}}</p></div>
              <div class="form-group"><label class="form-label">Puede tener +1</label><p>${{escapeHtml(doc.puede_tener_mas)}}</p></div>
            </div>
          `;
          break;
        case 'vigencia':
          container.innerHTML = `
            <div class="form-section">
              <div class="form-group"><label class="form-label">Tipo</label><p>${{escapeHtml(doc.tipo_vigencia)}}</p></div>
              <div class="form-group"><label class="form-label">Días</label><p>${{escapeHtml(doc.vigencia_dias)}}</p></div>
            </div>
          `;
          break;
        case 'campos':
          const camposHTML = doc.campos.length > 0 
            ? doc.campos.map((c, i) => `<tr><td>${{i+1}}</td><td>${{escapeHtml(c.nombre)}}</td></tr>`).join('')
            : '<tr><td colspan="2" class="empty-state-small">Sin campos</td></tr>';
          container.innerHTML = `
            <div class="form-section">
              <table class="mini-table">
                <thead><tr><th>#</th><th>Campo</th></tr></thead>
                <tbody>${{camposHTML}}</tbody>
              </table>
            </div>
          `;
          break;
        case 'notas':
          container.innerHTML = `
            <div class="form-section">
              <div class="form-group"><label class="form-label">Comentario</label><p>${{escapeHtml(doc.comentario) || '<em>Sin comentarios</em>'}}</p></div>
            </div>
          `;
          break;
      }}
    }}

    // ========================================================================
    // INIT
    // ========================================================================
    document.addEventListener('DOMContentLoaded', () => {{
      buildMultiSelectOptions('ms-categoria', 'categoria');
      buildMultiSelectOptions('ms-vigencia', 'tipo_vigencia');
      
      document.getElementById('filter-search').addEventListener('input', e => {{
        STATE.filterState.search = e.target.value;
        applyFiltersAndRender();
      }});
      
      document.getElementById('btn-clear-filters').addEventListener('click', clearAllFilters);
      document.getElementById('btn-prev-page').addEventListener('click', () => {{
        if (STATE.currentPage > 1) {{
          STATE.currentPage--;
          renderTable();
          updatePagination();
        }}
      }});
      document.getElementById('btn-next-page').addEventListener('click', () => {{
        const totalPages = Math.ceil(STATE.filteredDocuments.length / STATE.rowsPerPage);
        if (STATE.currentPage < totalPages) {{
          STATE.currentPage++;
          renderTable();
          updatePagination();
        }}
      }});
      document.getElementById('rows-per-page').addEventListener('change', e => {{
        STATE.rowsPerPage = parseInt(e.target.value);
        STATE.currentPage = 1;
        renderTable();
        updatePagination();
      }});
      
      document.getElementById('btn-close-sidebar').addEventListener('click', closeSidebar);
      document.getElementById('sidebar-overlay').addEventListener('click', closeSidebar);
      
      document.querySelectorAll('.tab-btn').forEach(btn => {{
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
      }});
      
      // Multi-select dropdowns
      document.querySelectorAll('.multi-select').forEach(ms => {{
        const trigger = ms.querySelector('.ms-trigger');
        const dropdown = ms.querySelector('.ms-dropdown');
        trigger.addEventListener('click', e => {{
          e.stopPropagation();
          document.querySelectorAll('.ms-dropdown').forEach(d => {{
            if (d !== dropdown) d.style.display = 'none';
          }});
          dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        }});
      }});
      
      document.addEventListener('click', () => {{
        document.querySelectorAll('.ms-dropdown').forEach(d => d.style.display = 'none');
      }});
      
      applyFiltersAndRender();
    }});
  </script>
</body>
</html>"""
    
    return html


def main():
    """Main execution."""
    print("🔄 Generando página pública...")
    
    # Check files exist
    if not CSV_FILE.exists():
        print(f"❌ Error: No se encontró {CSV_FILE}")
        return 1
    
    if not STYLES_FILE.exists():
        print(f"❌ Error: No se encontró {STYLES_FILE}")
        return 1
    
    # Parse CSV
    print(f"📖 Leyendo {CSV_FILE.name}...")
    documents = parse_csv_to_relational(CSV_FILE)
    print(f"✓ {len(documents)} documentos encontrados")
    
    # Read CSS
    print(f"🎨 Leyendo estilos...")
    css_content = STYLES_FILE.read_text(encoding='utf-8')
    
    # Generate HTML
    print(f"🏗️  Generando HTML standalone...")
    html_content = generate_html(documents, css_content)
    
    # Write output
    OUTPUT_FILE.write_text(html_content, encoding='utf-8')
    print(f"✅ Página generada: {OUTPUT_FILE.name}")
    print(f"📊 Total: {len(documents)} documentos embebidos")
    print()
    print("Para publicar en GitHub Pages:")
    print("  1. git add documentos_page.html")
    print("  2. git commit -m 'Update public page'")
    print("  3. git push origin main")
    print()
    print("O ejecuta: publish.bat")
    
    return 0


if __name__ == '__main__':
    exit(main())
