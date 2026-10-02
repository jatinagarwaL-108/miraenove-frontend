import re
with open('src/pages/AnalysisPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove the localStorage local demo review state and replace with actual API state
# Look for: const [reviewStatus, setReviewStatus] = useState<any>(...);
review_state_regex = re.compile(r'const \[reviewStatus, setReviewStatus\] = useState<any>\(\(\) => \{.*?\n\s+\}\);', re.DOTALL)
code = review_state_regex.sub('const [reviewStatus, setReviewStatus] = useState<any>({ status: \'PENDING\', decision: null, reason: \'\', timestamp: null });', code)

# Look for loading local review: const saved = localStorage.getItem(eview_); if (saved) { setReviewStatus(JSON.parse(saved)); }
load_review_regex = re.compile(r'const saved = localStorage\.getItem\(eview_\$\{data\.event_id\}\);\s+if \(saved\) \{\s+setReviewStatus\(JSON\.parse\(saved\)\);\s+\}', re.DOTALL)
# Replace with actual API call
code = load_review_regex.sub('api.getReview(data.event_id).then(rev => setReviewStatus(rev)).catch(() => {});', code)

# Update submitReview function
submit_review_regex = re.compile(r'const submitReview = \(\) => \{.*?\n\s+\};', re.DOTALL)
new_submit_review = '''const submitReview = () => {
        if (!reviewAction) return;
        const statusStr = reviewAction === 'ACCEPT' ? 'ACCEPTED' : reviewAction === 'REJECT' ? 'REJECTED' : 'UNCERTAIN';
        
        const payload = {
            status: statusStr,
            reason: reviewReason,
            notes: reviewReason,
            reviewer: 'Demo Analyst'
        };
        api.postReview(eventId!, payload).then(newStatus => {
            setReviewStatus(newStatus);
            setReviewAction(null);
            setReviewReason('');
        }).catch(err => alert("Failed to submit review: " + err));
    };'''
code = submit_review_regex.sub(new_submit_review, code)

with open('src/pages/AnalysisPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
