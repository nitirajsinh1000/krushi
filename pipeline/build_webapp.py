#!/usr/bin/env python3
"""
BUILD_WEBAPP — turns webapp_data.json into the final, deployable index.html.

Run this AFTER run_pipeline.py has produced webapp_data.json.

WHAT THIS DOES:
  1. Combines icons.jsx + app_logic.jsx (the app's UI code) into one file.
  2. Compiles that JSX into plain JavaScript using the TypeScript compiler
     (tsc) — this is what makes the final file load instantly on a phone
     instead of translating code live in the browser (that live-translation
     approach is what broke the app the first time; do not reintroduce it).
  3. Injects webapp_data.json and the compiled code into index_template2.html.
  4. Writes everything into deploy_package/ as the same 5 files used before:
     index.html, manifest.json, service-worker.js, icon-192.png, icon-512.png,
     plus HOW_TO_PUBLISH.txt.
  5. Zips deploy_package/ into a ready-to-upload .zip.

HOW TO RUN THIS:
    python3 build_webapp.py

REQUIRES:
  - Node.js with the TypeScript compiler available
    (this project already has it at hand via: npx tsc)
  - The following files present in the same folder:
    icons.jsx, app_logic.jsx, index_template2.html, tsconfig_compile.json,
    manifest.json, service-worker.js, icon-192.png, icon-512.png,
    HOW_TO_PUBLISH.txt, webapp_data.json

IF YOU CHANGE THE APP'S LOOK OR ADD A FEATURE:
  Edit app_logic.jsx (and icons.jsx if you need a new icon), then re-run
  this script. Do not hand-edit compiled_app.js or index.html directly —
  they are generated files and will be overwritten.
"""
import json
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).parent


def run(cmd, **kwargs):
    print(f"  $ {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=HERE, **kwargs)
    if result.returncode != 0:
        print(result.stdout)
        print(result.stderr)
        raise RuntimeError(f"Command failed: {' '.join(cmd)}")
    return result


def main():
    data_path = HERE / 'webapp_data.json'
    if not data_path.exists():
        print("ERROR: webapp_data.json not found. Run run_pipeline.py first.")
        sys.exit(1)

    print("1. Combining icons.jsx + app_logic.jsx ...")
    combined = (HERE / 'icons.jsx').read_text(encoding='utf-8') + \
        (HERE / 'app_logic.jsx').read_text(encoding='utf-8')
    (HERE / 'combined_source.jsx').write_text(combined, encoding='utf-8')

    print("2. Compiling JSX to plain JavaScript (tsc) ...")
    run(['npx', 'tsc', '--project', 'tsconfig_compile.json'])
    compiled_js = (HERE / 'compiled_app.js').read_text(encoding='utf-8')
    print(f"   compiled_app.js: {len(compiled_js)} bytes")

    print("3. Injecting data + compiled app into the HTML template ...")
    data_json = data_path.read_text(encoding='utf-8')
    data_json_safe = data_json.replace('</script', '<\\/script').replace('<!--', '<\\!--')
    html = (HERE / 'index_template2.html').read_text(encoding='utf-8')
    html = html.replace('__INJECT_DATA_HERE__', data_json_safe)
    html = html.replace('__INJECT_COMPILED_APP_HERE__', compiled_js)

    if '__INJECT' in html:
        raise RuntimeError("A template placeholder was not filled in - aborting.")
    if 'babel' in html.lower():
        raise RuntimeError("Babel reference found - the no-build-step architecture was broken.")

    print("4. Validating the assembled file ...")
    m = re.search(r'<script type="application/json" id="app-data">(.*?)</script>', html, re.DOTALL)
    data = json.loads(m.group(1))
    print(f"   Data OK: {len(data['crops'])} crops, {len(data['groups'])} pesticide groups")
    scripts = re.findall(r'<script>(.*?)</script>', html, re.DOTALL)
    app_script = max(scripts, key=len)
    if 'PesticideSelector' not in app_script:
        raise RuntimeError("Compiled app script not found in final HTML - aborting.")

    print("5. Writing deploy_package/ ...")
    out_dir = HERE / 'deploy_package'
    out_dir.mkdir(exist_ok=True)
    (out_dir / 'index.html').write_text(html, encoding='utf-8')
    for fname in ('manifest.json', 'service-worker.js', 'icon-192.png', 'icon-512.png', 'HOW_TO_PUBLISH.txt'):
        shutil.copy(HERE / fname, out_dir / fname)

    zip_path = HERE / 'PPQS Pesticide Finder - Ready to Publish.zip'
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for f in out_dir.iterdir():
            if f.is_file():
                zf.write(f, f.name)

    print(f"\nDone. {zip_path.name} ({zip_path.stat().st_size // 1024} KB) is ready to upload to Netlify.")


if __name__ == '__main__':
    main()
