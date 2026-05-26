#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Regenerate embedded_css.js from styles.css
"""

# Read CSS file
with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Escape only backticks and ${ for template literals
escaped = css.replace('\\', '\\\\')  # Escape backslashes first
escaped = escaped.replace('`', '\\`')  # Escape backticks
escaped = escaped.replace('${', '\\${')  # Escape template literal syntax

# Write to embedded_css.js
output = f'// Auto-generated CSS constant for embedding\nconst EMBEDDED_CSS = `{escaped}`;'

with open('embedded_css.js', 'w', encoding='utf-8') as f:
    f.write(output)

print('✓ embedded_css.js regenerado correctamente')
print(f'✓ CSS size: {len(css)} bytes')
