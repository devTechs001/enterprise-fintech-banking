#!/usr/bin/env python3
"""
Extract all complete file implementations from structure.txt
"""
import re
import os

def extract_files():
    with open('structure.txt', 'r') as f:
        content = f.read()
    
    # Pattern to match: ### Type: `path` followed by code block
    pattern = r'### (Client|Server): `([^`]+)`\s*\n```(\w*)\n(.*?)```'
    
    matches = re.findall(pattern, content, re.DOTALL)
    
    created = []
    
    for type_, path, lang, code in matches:
        base_dir = 'client' if type_ == 'Client' else 'server'
        full_path = os.path.join(base_dir, path.strip())
        
        # Create directory
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        # Write file
        with open(full_path, 'w') as f:
            f.write(code.strip())
        
        created.append((full_path, len(code.split('\n'))))
        print(f"✅ Created: {full_path} ({len(code.split('\\n'))} lines)")
    
    print(f"\n📊 Total: {len(created)} files created")
    total_lines = sum(lines for _, lines in created)
    print(f"📝 Total lines: {total_lines}")
    
    return created

if __name__ == '__main__':
    extract_files()
