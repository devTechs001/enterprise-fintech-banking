#!/usr/bin/env python3
import re
import os

# Read the structure.txt file
with open('structure.txt', 'r') as f:
    content = f.read()

# Pattern to match file sections with code
pattern = r'### (Client|Server): `([^`]+)`\s*\n\s*```(\w+)?\n(.*?)```'

matches = re.findall(pattern, content, re.DOTALL)

print(f"Found {len(matches)} files with complete implementations:\n")
for i, (type_, path, lang, code) in enumerate(matches, 1):
    print(f"{i}. [{type_}] {path}")
    
    # Determine base directory
    base_dir = 'client' if type_ == 'Client' else 'server'
    full_path = os.path.join(base_dir, path)
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    # Write the file
    with open(full_path, 'w') as f:
        f.write(code.strip())
    
    print(f"   -> Created: {full_path}\n")

print("\n✅ All files extracted successfully!")
