// Auto-generated CSS constant for embedding
const EMBEDDED_CSS = `/* ============================================================================
   REGISTROS COLCA - Stylesheet
   Design System & Component Library
   ============================================================================ */

/* ============================================================================
   CSS VARIABLES
   ============================================================================ */

:root {
  /* Colors */
  --primary: #0053e2;
  --primary-hover: #003da3;
  --secondary: #ffc220;
  --success: #2a8703;
  --success-hover: #1f6602;
  --danger: #ea1100;
  --danger-hover: #b50d00;
  --warning: #ff9800;
  --info: #00bcd4;
  
  /* Grays */
  --gray-10: #f5f5f5;
  --gray-20: #eeeeee;
  --gray-50: #d0d0d0;
  --gray-100: #9e9e9e;
  --gray-140: #424242;
  --gray-160: #1a1a1a;
  
  /* UI */
  --border-radius: 6px;
  --border-radius-lg: 10px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.10);
  --shadow-md: 0 2px 8px rgba(0,0,0,.12);
  --shadow-lg: 0 4px 16px rgba(0,0,0,.15);
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "Consolas", "Monaco", "Courier New", monospace;
}

/* ============================================================================
   BASE STYLES
   ============================================================================ */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 1.5;
  color: var(--gray-160);
  background: var(--gray-10);
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
}

h1 { font-size: 24px; }
h2 { font-size: 20px; }
h3 { font-size: 16px; }

/* ============================================================================
   HEADER
   ============================================================================ */

.header {
  background: white;
  border-bottom: 1px solid var(--gray-20);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header h1 {
  margin: 0;
  color: var(--primary);
  font-size: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ============================================================================
   CONTAINER
   ============================================================================ */

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* ============================================================================
   BUTTONS
   ============================================================================ */

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: var(--success-hover);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: var(--danger-hover);
}

.btn-outline {
  background: white;
  color: var(--gray-140);
  border: 1px solid var(--gray-50);
}

.btn-outline:hover:not(:disabled) {
  background: var(--gray-10);
  border-color: var(--gray-100);
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.btn-icon {
  padding: 6px;
  background: transparent;
  border: none;
  font-size: 18px;
  color: var(--gray-100);
  cursor: pointer;
  transition: color 0.15s;
}

.btn-icon:hover {
  color: var(--gray-160);
}

/* ============================================================================
   TOOLBAR
   ============================================================================ */

.toolbar {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ============================================================================
   FILTERS PANEL
   ============================================================================ */

.filters-panel {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-140);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ============================================================================
   INPUTS
   ============================================================================ */

.input-text {
  padding: 8px 12px;
  border: 1px solid var(--gray-50);
  border-radius: var(--border-radius);
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.15s;
  width: 100%;
}

.input-text:focus {
  outline: none;
  border-color: var(--primary);
}

.input-text:disabled {
  background: var(--gray-10);
  cursor: not-allowed;
}

.input-text-inline {
  padding: 4px 8px;
  border: 1px solid var(--gray-50);
  border-radius: var(--border-radius);
  font-size: 13px;
  font-family: inherit;
  width: 100%;
}

.input-text-inline:focus {
  outline: none;
  border-color: var(--primary);
}

.input-textarea {
  padding: 10px 12px;
  border: 1px solid var(--gray-50);
  border-radius: var(--border-radius);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  width: 100%;
}

.input-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.input-select {
  padding: 8px 12px;
  border: 1px solid var(--gray-50);
  border-radius: var(--border-radius);
  font-size: 14px;
  font-family: inherit;
  background: white;
  cursor: pointer;
  width: 100%;
}

.input-select:focus {
  outline: none;
  border-color: var(--primary);
}

.select-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.input-group {
  display: flex;
  gap: 8px;
}

/* ============================================================================
   MULTI-SELECT DROPDOWN
   ============================================================================ */

.multi-select {
  position: relative;
  min-width: 180px;
}

.ms-trigger {
  padding: 8px 12px;
  border: 1px solid var(--gray-50);
  border-radius: var(--border-radius);
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: border-color 0.15s;
}

.ms-trigger:hover {
  border-color: var(--gray-100);
}

.ms-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.ms-arrow {
  color: var(--gray-100);
  font-size: 10px;
}

.ms-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid var(--gray-50);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  z-index: 1000;
  max-height: 250px;
  overflow-y: auto;
}

.ms-options {
  padding: 6px;
}

.ms-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background 0.15s;
}

.ms-option:hover {
  background: var(--gray-10);
}

.ms-option input[type="checkbox"] {
  cursor: pointer;
}

/* ============================================================================
   TABLE
   ============================================================================ */

.table-container {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: var(--gray-10);
  border-bottom: 2px solid var(--gray-50);
}

.data-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-140);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 30px;
}

.data-table th.sortable:hover {
  background: var(--gray-20);
}

.data-table th.sortable::after {
  content: '⇅';
  position: absolute;
  right: 10px;
  opacity: 0.3;
  font-size: 12px;
}

.data-table th.sort-asc::after {
  content: '↑';
  opacity: 1;
  color: var(--primary-blue);
}

.data-table th.sort-desc::after {
  content: '↓';
  opacity: 1;
  color: var(--primary-blue);
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--gray-20);
  font-size: 14px;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.table-row-clickable {
  cursor: pointer;
  transition: background 0.15s;
}

.table-row-clickable:hover {
  background: var(--gray-10);
}

.empty-state {
  text-align: center;
  padding: 60px 20px !important;
  color: var(--gray-100);
  font-size: 14px;
}

.empty-state-small {
  text-align: center;
  padding: 20px !important;
  color: var(--gray-100);
  font-size: 13px;
}

/* ============================================================================
   BADGES
   ============================================================================ */

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.badge-category {
  background: #e3eeff;
  color: #0040b0;
}

.badge-vigencia-fecha_expiracion {
  background: #fff3e0;
  color: #e65100;
}

.badge-vigencia-sin_vigencia {
  background: #e8f5e9;
  color: #1b5e20;
}

.badge-vigencia-periodo_desde_emision {
  background: #e1f5fe;
  color: #01579b;
}

.badge-neutral {
  background: var(--gray-20);
  color: var(--gray-140);
}

.badge-warning {
  background: var(--warning);
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.code-badge {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--gray-10);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--gray-140);
}

/* ============================================================================
   PAGINATION
   ============================================================================ */

.pagination-bar {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: 16px 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: var(--gray-100);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-controls label {
  font-size: 12px;
  color: var(--gray-140);
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

#page-indicator {
  font-size: 13px;
  color: var(--gray-140);
  font-weight: 500;
}

/* ============================================================================
   SIDEBAR
   ============================================================================ */

.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100vh;
  background: white;
  box-shadow: var(--shadow-lg);
  z-index: 1001;
  display: none;
  flex-direction: column;
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: none;
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sidebar-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-20);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-160);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--gray-20);
  background: var(--gray-10);
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-100);
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: var(--gray-160);
  background: white;
}

.tab-btn.active {
  color: var(--primary);
  background: white;
  border-bottom-color: var(--primary);
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.sidebar-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--gray-20);
  display: flex;
  gap: 10px;
}

/* ============================================================================
   FORM COMPONENTS
   ============================================================================ */

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-140);
}

.form-hint {
  font-size: 12px;
  color: var(--gray-100);
  font-style: italic;
}

/* ============================================================================
   INFO BOX
   ============================================================================ */

.info-box {
  padding: 16px;
  border-radius: var(--border-radius);
  border-left: 4px solid;
  background: var(--gray-10);
  margin-top: 10px;
}

.info-box-blue {
  border-left-color: var(--info);
  background: #e1f5fe;
}

.info-box-gray {
  border-left-color: var(--gray-100);
  background: var(--gray-10);
}

.info-box-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--gray-160);
}

.info-box p {
  font-size: 13px;
  color: var(--gray-140);
  margin: 6px 0;
}

.info-list {
  margin: 8px 0;
  padding-left: 20px;
}

.info-list li {
  font-size: 13px;
  color: var(--gray-140);
  margin: 4px 0;
}

/* ============================================================================
   MINI TABLE (for nested data)
   ============================================================================ */

.mini-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--gray-50);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.mini-table thead {
  background: var(--gray-10);
}

.mini-table th {
  padding: 10px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-140);
  border-bottom: 1px solid var(--gray-50);
}

.mini-table td {
  padding: 10px 12px;
  font-size: 13px;
  border-bottom: 1px solid var(--gray-20);
}

.mini-table tbody tr:last-child td {
  border-bottom: none;
}

/* ============================================================================
   RESPONSIVE
   ============================================================================ */

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }
  
  .filters-panel {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-left, .toolbar-right {
    flex-direction: column;
  }
  
  .pagination-bar {
    flex-direction: column;
    align-items: stretch;
  }
}

/* ============================================================================
   UTILITIES
   ============================================================================ */

.text-center { text-align: center; }
.text-right { text-align: right; }
.mt-10 { margin-top: 10px; }
.mt-20 { margin-top: 20px; }
.mb-10 { margin-bottom: 10px; }
.mb-20 { margin-bottom: 20px; }
`;