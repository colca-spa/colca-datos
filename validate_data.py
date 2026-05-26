#!/usr/bin/env python3
"""
Validate CSV data for inconsistencies and duplicates.
"""
import csv
import pathlib
from collections import defaultdict

CSV_FILE = pathlib.Path(__file__).parent / 'Documentos.csv'


def validate_csv():
    """Check for common data issues."""
    
    print("🔍 VALIDANDO DATOS...\n")
    print("=" * 70)
    
    issues = []
    documents = []
    current_doc = None
    id_counts = defaultdict(list)
    
    with open(CSV_FILE, encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        for idx, row in enumerate(reader, start=2):  # Start at 2 (header is 1)
            has_id = row.get('ID', '').strip() != ''
            
            if has_id:
                if current_doc:
                    documents.append(current_doc)
                
                doc_id = row.get('ID', '').strip()
                codigo = row.get('Código', '')
                nombre = row.get('Nombre del Documento', '')
                
                current_doc = {
                    'id': doc_id,
                    'codigo': codigo,
                    'nombre': nombre,
                    'categoria': row.get('Categoría', ''),
                    'campos': [],
                    'line': idx
                }
                
                # Track ID usage
                id_counts[doc_id].append({
                    'nombre': nombre,
                    'categoria': current_doc['categoria'],
                    'line': idx
                })
            
            elif current_doc:
                campo = row.get('campos documento', '').strip()
                if campo:
                    current_doc['campos'].append(campo)
        
        if current_doc:
            documents.append(current_doc)
    
    # Check 1: Duplicate IDs
    print("\n❌ PROBLEMA 1: IDs DUPLICADOS")
    print("-" * 70)
    duplicate_ids = {k: v for k, v in id_counts.items() if len(v) > 1}
    
    if duplicate_ids:
        for doc_id, docs in duplicate_ids.items():
            print(f"\n  ID {doc_id} está asignado a {len(docs)} documentos:")
            for doc in docs:
                print(f"    • Línea {doc['line']}: {doc['nombre']} ({doc['categoria']})")
        issues.append(f"{len(duplicate_ids)} IDs duplicados encontrados")
    else:
        print("  ✓ No hay IDs duplicados")
    
    # Check 2: Documents with incorrect campos
    print("\n\n❌ PROBLEMA 2: DOCUMENTOS CON CAMPOS SOSPECHOSOS")
    print("-" * 70)
    
    # Known campo sets for validation
    licencia_campos = {'clase', 'numero de licencia', 'municipalidad', 
                       'primer otorgamiento', 'restricciones', 'actual otorgamiento'}
    
    suspicious = False
    for doc in documents:
        campos_set = set(doc['campos'])
        
        # Check if a non-license doc has license campos
        if 'licencia' not in doc['nombre'].lower():
            if licencia_campos.intersection(campos_set):
                print(f"\n  ⚠️  '{doc['nombre']}' (ID {doc['id']}, línea {doc['line']})")
                print(f"      Tiene campos de licencia de conducir: {campos_set & licencia_campos}")
                print(f"      Total campos: {len(doc['campos'])}")
                suspicious = True
                issues.append(f"Documento '{doc['nombre']}' tiene campos incorrectos")
        
        # Check if certification has too many campos
        if 'certificación' in doc['nombre'].lower() or 'certificado' in doc['nombre'].lower():
            if len(doc['campos']) > 5:
                print(f"\n  ⚠️  '{doc['nombre']}' (ID {doc['id']}, línea {doc['line']})")
                print(f"      Tiene {len(doc['campos'])} campos (sospechoso para un certificado)")
                suspicious = True
    
    if not suspicious:
        print("  ✓ No se detectaron campos sospechosos")
    
    # Check 3: Missing campos in main row
    print("\n\n❌ PROBLEMA 3: PRIMERA FILA DE CAMPOS FALTANTE")
    print("-" * 70)
    
    missing_first = False
    for doc in documents:
        if len(doc['campos']) > 0:
            # Check common first campos
            first_campo = doc['campos'][0]
            if first_campo in ['segundo apellido', 'segundo nombre']:
                print(f"\n  ⚠️  '{doc['nombre']}' (ID {doc['id']}, línea {doc['line']})")
                print(f"      Primer campo es '{first_campo}' - probablemente falta 'primer apellido/nombre'")
                missing_first = True
                issues.append(f"Documento '{doc['nombre']}' probablemente le falta el primer campo")
    
    if not missing_first:
        print("  ✓ No se detectaron campos faltantes obvios")
    
    # Summary
    print("\n\n" + "=" * 70)
    print("📊 RESUMEN")
    print("=" * 70)
    print(f"Total documentos: {len(documents)}")
    print(f"Total problemas encontrados: {len(issues)}")
    
    if issues:
        print("\n⚠️  ACCIONES RECOMENDADAS:")
        print("  1. Corregir IDs duplicados (usar secuencia única por categoría)")
        print("  2. Eliminar campos incorrectos de los documentos")
        print("  3. Agregar campos faltantes en las primeras filas")
        print("\n  Abre el archivo en el editor web para hacer las correcciones.")
    else:
        print("\n✅ ¡Todos los datos están correctos!")
    
    print("\n")


if __name__ == '__main__':
    validate_csv()
