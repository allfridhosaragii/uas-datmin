import json
import re

notebook_path = '../Tugas_Besar_Data_Mining.ipynb'
output_js_path = 'notebook_data.js'

with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Extract the main code cell
code_cell = None
for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        if not code_cell or len(cell.get('source', [])) > len(code_cell.get('source', [])):
            code_cell = cell

if not code_cell:
    print("No code cell found.")
    exit(1)

# Process Source into steps
steps = []
current_step = {'title': 'Initial Setup', 'code': [], 'outputs': []}

source_lines = code_cell.get('source', [])
i = 0
while i < len(source_lines):
    line = source_lines[i]
    # Check for print("="*80) or similar
    if 'print("="*80)' in line or 'print("=" * 80)' in line:
        # Next line usually contains the title
        title_line = ""
        if i + 1 < len(source_lines):
            title_line = source_lines[i+1]
        
        # Extract title from print("TITLE")
        match = re.search(r'print\("([^"]+)"\)', title_line)
        title = match.group(1) if match else "Step " + str(len(steps) + 1)
        
        # Save current step and start new one
        if current_step['code']:
            steps.append(current_step)
        
        current_step = {'title': title, 'code': [], 'outputs': []}
        
        # Add the print lines to code too
        current_step['code'].append(line)
        if title_line:
            current_step['code'].append(title_line)
            i += 1
        
        # Next line is usually another print("="*80), skip it if exists
        if i + 1 < len(source_lines) and ('print("="*80)' in source_lines[i+1] or 'print("=" * 80)' in source_lines[i+1]):
            current_step['code'].append(source_lines[i+1])
            i += 1
    else:
        current_step['code'].append(line)
    
    i += 1

if current_step['code']:
    steps.append(current_step)

# Combine code arrays into strings
for step in steps:
    step['code'] = ''.join(step['code'])

# Process Outputs and align with steps
current_step_idx = 0
outputs = code_cell.get('outputs', [])

for out in outputs:
    if out['output_type'] == 'stream':
        text = ''.join(out.get('text', []))
        
        # Check if this stream output contains the separator "====="
        # If it does, we might have moved to a new step.
        # Stream text can contain multiple prints.
        # We'll split the text by "================================================================================"
        parts = text.split("================================================================================")
        
        if len(parts) > 1:
            for j, part in enumerate(parts):
                if not part.strip(): continue
                
                # The first part belongs to the current step. 
                # Subsequent parts mean we advanced a step.
                if j > 0 and current_step_idx < len(steps) - 1:
                    # Look ahead to see if the part contains the title of the next step
                    next_title = steps[current_step_idx + 1]['title']
                    if next_title in part:
                        current_step_idx += 1
                
                steps[current_step_idx]['outputs'].append({
                    'type': 'text',
                    'content': part.strip()
                })
        else:
            steps[current_step_idx]['outputs'].append({
                'type': 'text',
                'content': text.strip()
            })

    elif out['output_type'] == 'display_data' or out['output_type'] == 'execute_result':
        data = out.get('data', {})
        if 'image/png' in data:
            steps[current_step_idx]['outputs'].append({
                'type': 'image',
                'content': data['image/png']
            })
        elif 'text/html' in data:
            html = ''.join(data['text/html'])
            # Only keep the table part, ignore scripts
            # This is a bit risky but usually dataframes are wrapped in div or table
            steps[current_step_idx]['outputs'].append({
                'type': 'html',
                'content': html
            })
        elif 'text/plain' in data:
            text = ''.join(data['text/plain'])
            steps[current_step_idx]['outputs'].append({
                'type': 'text',
                'content': text.strip()
            })

# Remove empty steps if any
steps = [s for s in steps if s['code'].strip() or s['outputs']]

js_content = f"const notebookData = {json.dumps(steps, indent=2)};"
with open(output_js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Data extracted to {output_js_path}. Total steps: {len(steps)}")
