import re

with open('ml_satellite/frontend/src/App.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

import_regex = r"import ReviewHistory from '\./pages/ReviewHistory';"
new_imports = "import ReviewHistory from './pages/ReviewHistory';\nimport ChangeExplorer from './pages/ChangeExplorer';\nimport GenericCompare from './pages/GenericCompare';\nimport Reports from './pages/Reports';"

route_regex = r'<Route path="/review-history" element=\{<ReviewHistory />\} />'
new_routes = '<Route path="/reviews" element={<ReviewHistory />} />\n        <Route path="/explorer" element={<ChangeExplorer />} />\n        <Route path="/compare" element={<GenericCompare />} />\n        <Route path="/reports" element={<Reports />} />'

code = re.sub(import_regex, new_imports, code)
code = re.sub(route_regex, new_routes, code)

with open('ml_satellite/frontend/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
