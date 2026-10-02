import re

with open('ml_satellite/frontend/src/components/Sidebar.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add review history icon
icons_regex = re.compile(r'metadata: <svg.*?</svg>,', re.DOTALL)
new_icon = '''metadata: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>,
    history: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,'''
code = icons_regex.sub(new_icon, code)

# Add nav item
nav_regex = re.compile(r'\{ id: \'metadata\', label: \'Metadata\', icon: ICONS\.metadata, path: eventId \? \'/analysis/\' \+ eventId \+ \'/metadata\' : null \},')
new_nav = '''{ id: 'metadata', label: 'Metadata', icon: ICONS.metadata, path: eventId ? '/analysis/' + eventId + '/metadata' : null },
        { id: 'review-history', label: 'Review History', icon: ICONS.history, path: '/review-history' },'''
code = nav_regex.sub(new_nav, code)

with open('ml_satellite/frontend/src/components/Sidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
