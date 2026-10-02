import re

with open('ml_satellite/frontend/src/pages/AnalysisPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace useState
code = re.sub(r'const \[reviewStatus, setReviewStatus\] = useState<any>\(\(\) => \{.*?\n\s+\}\);', "const [reviewStatus, setReviewStatus] = useState<any>({ status: 'PENDING', decision: null, reason: '', timestamp: null });", code, flags=re.DOTALL)

# Replace localStorage logic
code = re.sub(r'const saved = localStorage\.getItem.*?setReviewStatus\(JSON\.parse\(saved\)\);\s+\}', "api.getReview(data.event_id).then(rev => setReviewStatus(rev)).catch(() => {});", code, flags=re.DOTALL)

# Replace submitReview
new_submit_review = '''const submitReview = () => {
        if (!reviewAction) return;
        const statusStr = reviewAction == 'ACCEPT' ? 'ACCEPTED' : reviewAction == 'REJECT' ? 'REJECTED' : 'UNCERTAIN';
        
        const payload = {
            status: statusStr,
            reason: reviewReason,
            notes: reviewReason,
            reviewer: 'Demo Analyst'
        };
        api.postReview(eventId, payload).then(newStatus => {
            setReviewStatus(newStatus);
            setReviewAction(null);
            setReviewReason('');
        }).catch(err => alert("Failed to submit review: " + err));
    };'''
code = re.sub(r'const submitReview = \(\) => \{.*?\n\s+\};', new_submit_review, code, flags=re.DOTALL)

with open('ml_satellite/frontend/src/pages/AnalysisPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
