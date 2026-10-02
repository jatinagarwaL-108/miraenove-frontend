import re

def fix_file(path, regex, repl):
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()
    code = re.sub(regex, repl, code)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)

fix_file('ml_satellite/frontend/src/pages/AnalysisPage.tsx', r'window\.open\(\$\{API_URL\}/api/events//export/, \'_blank\'\);', 'window.open(\/api/events/\/export/\, \'_blank\');')
fix_file('ml_satellite/frontend/src/services/api.ts', r'axios\.get\(\$\{API_URL\}/api/events//review\);', 'axios.get(\/api/events/\/review);')
fix_file('ml_satellite/frontend/src/services/api.ts', r'axios\.post\(\$\{API_URL\}/api/events//review, payload\);', 'axios.post(\/api/events/\/review, payload);')
