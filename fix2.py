import re

with open('ml_satellite/frontend/src/pages/AnalysisPage.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

new_submit_review = '''const submitReview = () => {
        if (!reviewAction) return;
        const statusStr = reviewAction == 'ACCEPT' ? 'ACCEPTED' : reviewAction == 'REJECT' ? 'REJECTED' : 'UNCERTAIN';
        
        const payload = {
            status: statusStr,
            reason: reviewReason,
            notes: reviewReason,
            reviewer: 'Demo Analyst'
        };
        api.postReview(eventId as string, payload).then(newStatus => {
            setReviewStatus(newStatus);
            setReviewAction(null);
            setReviewReason('');
        }).catch(err => alert("Failed to submit review: " + err));
    };'''

code = re.sub(r'const handleSaveReview.*?setReviewAction\(null\);\s+\};', new_submit_review, code, flags=re.DOTALL)

with open('ml_satellite/frontend/src/pages/AnalysisPage.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
