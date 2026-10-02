import re

with open('ml_satellite/frontend/src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# I will add an export button directly next to the total events count.
search_header_regex = re.compile(r'<h2 style=\{\{ margin: \'0 0 5px 0\' \}\}>Search Results</h2>\n\s+<div style=\{\{ color: \'#666\' \}\}>Found \{events\.length\} matching events\.</div>')

export_buttons = '''
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: '0 0 5px 0' }}>Search Results</h2>
                                    <div style={{ color: '#666' }}>Found {events.length} matching events.</div>
                                </div>
                                
                                {events.length > 0 && (
                                    <div style={{ position: 'relative' }}>
                                        <button 
                                            onClick={() => {
                                                const params = new URLSearchParams();
                                                if (query) params.append('query', query);
                                                if (topK) params.append('top_k', topK.toString());
                                                if (fromDate) params.append('start_date', fromDate);
                                                if (toDate) params.append('end_date', toDate);
                                                if (minArea) params.append('min_area', minArea);
                                                if (maxArea) params.append('max_area', maxArea);
                                                if (confidence) params.append('semantic_confidence', confidence);
                                                if (transition) params.append('transition', transition);
                                                if (reviewStatus !== 'All') params.append('review_status', reviewStatus);
                                                
                                                alert("Exporting search results via PDF is scheduled for Phase 2 implementation. The backend endpoints for single-event export are currently live.");
                                            }} 
                                            style={{ padding: '8px 15px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#334155' }}>
                                            Export Search Summary ▼
                                        </button>
                                    </div>
                                )}
                            </div>
'''
code = search_header_regex.sub(export_buttons.strip(), code)

with open('ml_satellite/frontend/src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
