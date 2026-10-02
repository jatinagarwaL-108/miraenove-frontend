import re

with open('ml_satellite/frontend/src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add review_status state
code = re.sub(r'const \[confidence, setConfidence\] = useState\(searchParams\.get\(\'confidence\'\) \|\| \'\'\);', "const [confidence, setConfidence] = useState(searchParams.get('confidence') || '');\n    const [reviewStatus, setReviewStatus] = useState(searchParams.get('review_status') || 'All');", code)

# Update handleSearch
code = re.sub(r'if \(confidence\) params\.append\(\'semantic_confidence\', confidence\);', "if (confidence) params.append('semantic_confidence', confidence);\n        if (reviewStatus && reviewStatus !== 'All') params.append('review_status', reviewStatus);", code)

# Update handleClearFilters
code = re.sub(r'setConfidence\(\'\'\);', "setConfidence('');\n        setReviewStatus('All');", code)

# Update URL syncing effect
code = re.sub(r'if \(confidence\) newParams\.set\(\'confidence\', confidence\);\n\s+else newParams\.delete\(\'confidence\'\);', "if (confidence) newParams.set('confidence', confidence);\n        else newParams.delete('confidence');\n        if (reviewStatus !== 'All') newParams.set('review_status', reviewStatus);\n        else newParams.delete('review_status');", code)

# Update active filters summary
code = re.sub(r'if \(confidence\) activeFilters\.push\("Confidence: " \+ confidence\);', "if (confidence) activeFilters.push(\"Confidence: \" + confidence);\n    if (reviewStatus !== 'All') activeFilters.push(\"Review: \" + reviewStatus);", code)

# Add dropdown to UI
dropdown_ui = '''
                        <label style={{ fontWeight: 'bold', color: '#475569' }}>REVIEW STATUS</label>
                        <select 
                            value={reviewStatus} 
                            onChange={(e) => setReviewStatus(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option value="All">All</option>
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="UNCERTAIN">Uncertain</option>
                        </select>
'''
code = re.sub(r'<label style=\{\{ fontWeight: \'bold\', color: \'#475569\' \}\}>CONFIDENCE</label>', dropdown_ui.strip() + '\\n                        <label style={{ fontWeight: \'bold\', color: \'#475569\' }}>CONFIDENCE</label>', code)

with open('ml_satellite/frontend/src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
