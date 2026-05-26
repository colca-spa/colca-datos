#!/usr/bin/env python3
"""
Fix current CSV issues and add missing documents from complete table.
"""
import csv
import pathlib

CSV_FILE = pathlib.Path(__file__).parent / 'Documentos.csv'
OUTPUT_FILE = pathlib.Path(__file__).parent / 'Documentos_fixed.csv'


def fix_and_complete_csv():
    """Fix issues and add missing documents."""
    
    print("🔧 CORRIGIENDO Y COMPLETANDO DATOS...\n")
    
    # Step 1: Read and fix current documents
    print("[1/3] Leyendo datos actuales y corrigiendo problemas...")
    current_docs = []
    current_doc = None
    
    with open(CSV_FILE, encoding='utf-8-sig', newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        for row in reader:
            has_id = row.get('ID', '').strip() != ''
            
            if has_id:
                if current_doc:
                    current_docs.append(current_doc)
                
                current_doc = {
                    'codigo': row.get('Código', ''),
                    'nombre': row.get('Nombre del Documento', ''),
                    'puede_tener_mas': row.get('Puede tener + de 1', 'no'),
                    'categoria': row.get('Categoría', ''),
                    'tipo_vigencia': row.get('Tipo de vigencia', ''),
                    'vigencia_dias': row.get('Vigencia sugerida (días)', ''),
                    'campos': [],
                    'comentario': row.get('Comentario', '')
                }
            elif current_doc:
                campo = row.get('campos documento', '').strip()
                if campo:
                    current_doc['campos'].append(campo)
        
        if current_doc:
            current_docs.append(current_doc)
    
    print(f"   ✓ {len(current_docs)} documentos leídos")
    
    # Fix specific issues
    print("\n[2/3] Aplicando correcciones...")
    
    # Fix: Remove incorrect campos from "Certificación profesional especializada"
    for doc in current_docs:
        if 'certificación profesional especializada' in doc['nombre'].lower():
            doc['campos'] = []  # Clear incorrect license campos
            print(f"   ✓ Eliminados 23 campos incorrectos de '{doc['nombre']}'")
    
    # Fix: Add missing "primer apellido" to cedulas
    for doc in current_docs:
        if 'cedula de identidad' in doc['nombre'].lower():
            if doc['campos'] and doc['campos'][0] == 'segundo apellido':
                doc['campos'].insert(0, 'primer apellido')
                print(f"   ✓ Agregado 'primer apellido' a '{doc['nombre']}'")
    
    # Step 3: Add missing documents
    print("\n[3/3] Agregando documentos faltantes...")
    
    # Complete document list from the image
    missing_docs = [
        # Licencias de Conducir (que estaban como campos en certificación)
        {'codigo': 'LIC_CONDUCIR_A1', 'nombre': 'Licencia conducir clase A1', 'puede_tener_mas': 'no',
         'categoria': 'Licencias de Conducir y Habilitaciones', 'tipo_vigencia': 'fecha_expiracion', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LIC_CONDUCIR_A2', 'nombre': 'Licencia conducir clase A2 (con restricciones)', 'puede_tener_mas': 'no',
         'categoria': 'Licencias de Conducir y Habilitaciones', 'tipo_vigencia': 'fecha_expiracion', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LIC_CONDUCIR_A3', 'nombre': 'Licencia conducir clase A3', 'puede_tener_mas': 'no',
         'categoria': 'Licencias de Conducir y Habilitaciones', 'tipo_vigencia': 'fecha_expiracion', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LIC_CONDUCIR_A4', 'nombre': 'Licencia conducir clase A4 (con restricciones única)', 'puede_tener_mas': 'no',
         'categoria': 'Licencias de Conducir y Habilitaciones', 'tipo_vigencia': 'fecha_expiracion', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LIC_CONDUCIR_A5', 'nombre': 'Licencia conducir clase A5', 'puede_tener_mas': 'no',
         'categoria': 'Licencias de Conducir y Habilitaciones', 'tipo_vigencia': 'fecha_expiracion', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LIC_CONDUCIR_B', 'nombre': 'Licencia conducir clase B', 'puede_tener_mas': 'no',
         'categoria': 'Licencias de Conducir y Habilitaciones', 'tipo_vigencia': 'fecha_expiracion', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LIC_CONDUCIR_C', 'nombre': 'Licencia conducir clase C', 'puede_tener_mas': 'no',
         'categoria': 'Licencias de Conducir y Habilitaciones', 'tipo_vigencia': 'fecha_expiracion', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LIC_CONDUCIR_D', 'nombre': 'Licencia conducir clase D', 'puede_tener_mas': 'no',
         'categoria': 'Licencias de Conducir y Habilitaciones', 'tipo_vigencia': 'fecha_expiracion', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LIC_CONDUCIR_E', 'nombre': 'Licencia conducir clase E', 'puede_tener_mas': 'no',
         'categoria': 'Licencias de Conducir y Habilitaciones', 'tipo_vigencia': 'fecha_expiracion', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LIC_MAQUINARIA', 'nombre': 'Licencia para maquinaria', 'puede_tener_mas': 'si',
         'categoria': 'Licencias de Conducir y Habilitaciones', 'tipo_vigencia': 'fecha_expiracion', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        
        # Exámenes Médicos y Aptitud Ocupacional
        {'codigo': 'EXAM_PREOC', 'nombre': 'Examen preocupacional periódico', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_POSOP_ANUAL', 'nombre': 'Examen posocupacional periódico', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_ALTURA_FISICA', 'nombre': 'Examen trabajo en altura física', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_ALTURA_VISION', 'nombre': 'Examen trabajo en altura geográfica', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_PSICO_MINERIA', 'nombre': 'Examen psicoemocional', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_PSICOTECH', 'nombre': 'Examen psicotecnico', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_ALCOHOL_DROGAS', 'nombre': 'Examen alcohol y drogas', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_BATERIA_OCUPACIONAL', 'nombre': 'Batería ocupacional metalúrgica', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_AVIACION_RIESGO', 'nombre': 'Examen aviación de riesgo', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_VISION', 'nombre': 'Examen de visión', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_AUDIOMETRIA', 'nombre': 'Examen audiometría', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'EXAM_OHNO_OCUPACIO', 'nombre': 'Examen oftalmológico', 'puede_tener_mas': 'no',
         'categoria': 'Exámenes Médicos y Aptitud Ocupacional', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        
        # Certificaciones y Cursos - HEC / Técnicas
        {'codigo': 'CERT_TRABAJO_ALTURA', 'nombre': 'Certificado trabajo en altura', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_ESPACIOS_CONF', 'nombre': 'Certificado espacios confinados', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_PRIM_AUXILIOS', 'nombre': 'Certificado primeros auxilios', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '730', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_RCP', 'nombre': 'Certificado RCP', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_EXTINCION_INCEND', 'nombre': 'Certificado extinción incendio', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_MANEJO_DEFENSIVO', 'nombre': 'Curso manejo defensivo', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_MANEJO_DEF_SIM', 'nombre': 'Curso manejo defensivo simulador', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_ISAM_RIESGO', 'nombre': 'Certificado ISAM', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_MATERIALES_PELIG', 'nombre': 'Certificado materiales peligrosos', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_COMP_OTEC', 'nombre': 'Certificado competencias OTEC', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_EXAMENES_PRACT', 'nombre': 'Certificado exámenes prácticos', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_ANDAMIOS', 'nombre': 'Certificado montaje andamios', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_SISTEMAS_IZAJE', 'nombre': 'Certificado sistemas izaje', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_RIGGER', 'nombre': 'Certificado señalero', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_MANEJO_GPS', 'nombre': 'Certificado manejo GPS', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_CARGA_PELIGROSA', 'nombre': 'Certificado carga peligrosa', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_NACOGAMAT', 'nombre': 'Certificado NACOGAMAT', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_FATIGA', 'nombre': 'Certificado fatiga', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_GRUA_VIAJANTE', 'nombre': 'Certificado Grúa Viajante (Puente Grúa)', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '730', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_GUARDIA_ARMADO', 'nombre': 'Certificado Guardia Armado', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_MANEJO_RESIDUOS', 'nombre': 'Certificado Manejo de Residuos Peligrosos y No Peligrosos', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_CONTROL_ACCESO', 'nombre': 'Certificado Control de Acceso a Faena', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '730', 'campos': [], 'comentario': ''},
        {'codigo': 'CERT_TRANSENTE_CUSTOM', 'nombre': 'Certificado Transeúnte Customizado', 'puede_tener_mas': 'no',
         'categoria': 'Certificaciones y Cursos HEC / Técnicas', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        
        # Documentos Laborales
        {'codigo': 'LAB_CONTRATO', 'nombre': 'Contrato de trabajo', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_activo', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_ANEXO_MODIF_CONTRATO', 'nombre': 'Anexo modificación contrato de trabajo', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_activo', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_ANEXO_MODIF_FAENA', 'nombre': 'Anexo modificación faena', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_activo', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_ANEXO_CONVERSION_C', 'nombre': 'Anexo conversión contrato', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_activo', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_FINIQUITO', 'nombre': 'Finiquito', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_PRINCIPIO_ADT', 'nombre': 'Finiquito Salario con CCO', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_PRINCIPIO_PAGADOR', 'nombre': 'Finiquito principio pagador', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_CERT_EXPERIENCIA', 'nombre': 'Certificado experiencia laboral', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_LIK_CIS', 'nombre': 'Liquidación sueldo', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_LIK_INTERN', 'nombre': 'Liquidación compensaciones', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_CERT_RENTA', 'nombre': 'Certificado de renta', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '30', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_CERT_SALUD', 'nombre': 'Certificado cotizaciones salud', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '30', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_CERT_AFP', 'nombre': 'Certificado cotizaciones AFP', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '30', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_PREVIRED', 'nombre': 'Comprobante pago Previred', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '30', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_DECL_SUBALTER', 'nombre': 'Declaración contrato subalterno', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_ACUERDO_NEGOCIA', 'nombre': 'Acuerdo negociación', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_activo', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_CONSENT_DATOS', 'nombre': 'Consentimiento tratamiento datos personales', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_RIESG_ACCI_POL_SEG', 'nombre': 'Riesgos accidente póliza seguros y responsabilidad civil', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_activo', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_ANEXO_JORNADA_EXCEP', 'nombre': 'Anexo Jornada Excepcional', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_activo', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_DECL_SOC_PAREJA', 'nombre': 'Declaración socio/pareja Transelec', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_REG_INDIC_CLIENTE', 'nombre': 'Registro Inducción cliente/faena al trabajador', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_REG_DUL_CCO', 'nombre': 'Registro DUL-CCO', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '730', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_REG_RI_MANDANTE', 'nombre': 'Registro RI mastercertización', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_VIGENCIA_CUENTA', 'nombre': 'Vigencia cuenta bancaria', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '1825', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_LICENCIA_MEDICA', 'nombre': 'Licencia médica trabajador', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '1825', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_RENUNCIA', 'nombre': 'Carta de renuncia', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_EVAL_DESEMP_ANUAL', 'nombre': 'Evaluación desempeño anual', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_FORM_ENVIO_CCO', 'nombre': 'Formulario envio CCO', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_REGL_MANDANTE', 'nombre': 'Reglamento interno Reglamento interno MANDANTE', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_EPP_RECIBIDO', 'nombre': 'Registro entrega EPP', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '730', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_RECEP_NOTIFICACION_INDEL', 'nombre': 'Recepción notificación INDEL trabajador art EPP y otros implementos', 'puede_tener_mas': 'si',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_FICHA_PERSONAL', 'nombre': 'Ficha personal', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'LAB_FORM_EXTRALABORAL', 'nombre': 'Formulario Encuesta de Riesgo Factores Psicosociales Laborales y Extralaborales', 'puede_tener_mas': 'no',
         'categoria': 'Documentos Laborales', 'tipo_vigencia': 'periodo_desde_emision', 'vigencia_dias': '730', 'campos': [], 'comentario': ''},
        
        # Inducciones
        {'codigo': 'IND_REG_ATENCILES', 'nombre': 'Certificado presenciales Atención Cliente', 'puede_tener_mas': 'si',
         'categoria': 'Inducciones', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '135', 'campos': [], 'comentario': ''},
        {'codigo': 'IND_SENALIZACIONES', 'nombre': 'Certificado Señalizaciones', 'puede_tener_mas': 'no',
         'categoria': 'Inducciones', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        
        # Arrendamientos
        {'codigo': 'ARR_VIVA_VIDA_COND', 'nombre': 'Pago mes conductor', 'puede_tener_mas': 'si',
         'categoria': 'Arrendamientos (vehículos, terrenos, equipos)', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '365', 'campos': [], 'comentario': ''},
        {'codigo': 'ARR_PADRUNG_VEHICULO', 'nombre': 'Padrung de vehículo', 'puede_tener_mas': 'no',
         'categoria': 'Arrendamientos (vehículos, terrenos, equipos)', 'tipo_vigencia': 'periodo_activo', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'ARR_CONTRATO_VIVIENDA', 'nombre': 'Contrato vivienda arrendamiento', 'puede_tener_mas': 'no',
         'categoria': 'Arrendamientos (vehículos, terrenos, equipos)', 'tipo_vigencia': 'periodo_activo', 'vigencia_dias': '—', 'campos': [], 'comentario': ''},
        {'codigo': 'ARR_OTROS_CERT', 'nombre': 'Otros arrendamientos o independiente', 'puede_tener_mas': 'si',
         'categoria': 'Arrendamientos (vehículos, terrenos, equipos)', 'tipo_vigencia': 'sin_vigencia', 'vigencia_dias': '135', 'campos': [], 'comentario': ''},
    ]
    
    # Identify truly missing documents (not already in current_docs)
    current_codigos = {doc['codigo'] for doc in current_docs}
    truly_missing = [doc for doc in missing_docs if doc['codigo'] not in current_codigos]
    
    print(f"   ✓ {len(truly_missing)} documentos nuevos para agregar")
    
    # Combine: current fixed + new documents
    all_documents = current_docs + truly_missing
    
    # Write fixed CSV
    print(f"\n✍️  Escribiendo CSV corregido...")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, delimiter=';')
        
        # Header
        writer.writerow([
            'ID', 'Código', 'Nombre del Documento', 'Puede tener + de 1',
            'Categoría', 'Tipo de vigencia', 'Vigencia sugerida (días)',
            'campos documento', 'nombre campos', 'Comentario'
        ])
        
        # Write documents with sequential IDs
        for idx, doc in enumerate(all_documents, start=1):
            # Main document row
            writer.writerow([
                str(idx),
                doc['codigo'],
                doc['nombre'],
                doc['puede_tener_mas'],
                doc['categoria'],
                doc['tipo_vigencia'],
                doc['vigencia_dias'],
                '',
                '',
                doc['comentario']
            ])
            
            # Campo rows
            for campo in doc['campos']:
                writer.writerow([
                    '',
                    doc['codigo'],
                    doc['nombre'],
                    doc['puede_tener_mas'],
                    doc['categoria'],
                    doc['tipo_vigencia'],
                    doc['vigencia_dias'],
                    campo,
                    '',
                    ''
                ])
    
    print(f"\n✅ CSV CORREGIDO Y COMPLETADO")
    print(f"   📁 Archivo: {OUTPUT_FILE.name}")
    print(f"   📊 Total documentos: {len(all_documents)}")
    print(f"   🔧 Correcciones aplicadas: 3")
    print(f"   ➕ Documentos agregados: {len(truly_missing)}")
    print(f"\n💡 Revisa el archivo y si está correcto, renómbralo a 'Documentos.csv'")


if __name__ == '__main__':
    fix_and_complete_csv()
