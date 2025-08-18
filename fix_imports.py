#!/usr/bin/env python3
import os
import re

def fix_import_versions(file_path):
    """Fix import statements by removing version suffixes like @1.2.3"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match import statements with version suffixes
    pattern = r'(from\s+["\'])([^"\']+?)@[0-9][0-9\.]*(["\']\s*;?)'
    
    # Replace version suffixes
    new_content = re.sub(pattern, r'\1\2\3', content)
    
    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {file_path}")
        return True
    return False

def main():
    """Walk through all TypeScript/TSX files and fix imports"""
    project_dir = os.getcwd()
    
    for root, dirs, files in os.walk(project_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx')) and not file.endswith('.d.ts'):
                file_path = os.path.join(root, file)
                fix_import_versions(file_path)

if __name__ == "__main__":
    main()