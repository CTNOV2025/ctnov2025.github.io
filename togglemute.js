// ...existing code...
function toggleMute(target) {
    // get all video elements we care about (prefer class "videocropped", fall back to any <video>)
    const videos = Array.from(document.querySelectorAll('video.videocropped, video'));
    if (!videos.length) return;

    // resolve the target video element
    let theVideo = null;

    // helper: try to coerce a candidate into a <video> element
    const resolveCandidate = cand => {
        if (!cand) return null;
        if (cand.tagName === 'VIDEO') return cand;
        if (cand instanceof HTMLVideoElement) return cand;
        // if element has data-target (id or selector)
        if (cand.dataset && cand.dataset.target) {
            const byId = document.getElementById(cand.dataset.target);
            if (byId && byId.tagName === 'VIDEO') return byId;
            try {
                const sel = document.querySelector(cand.dataset.target);
                if (sel && sel.tagName === 'VIDEO') return sel;
            } catch (e) { /* ignore invalid selector */ }
        }
        // aria-controls often references the controlled element id
        const aria = cand.getAttribute && cand.getAttribute('aria-controls');
        if (aria) {
            const a = document.getElementById(aria);
            if (a && a.tagName === 'VIDEO') return a;
        }
        // nearest ancestor video
        const anc = cand.closest && cand.closest('video');
        if (anc) return anc;
        // video inside the element
        const inside = cand.querySelector && cand.querySelector('video');
        if (inside) return inside;
        return null;
    };

    if (!target) {
        theVideo = document.getElementById('videocropped') || document.querySelector('.videocropped') || videos[0];
    } else if (typeof Event !== 'undefined' && target instanceof Event) {
        theVideo = resolveCandidate(target.currentTarget || target.target);
    } else if (typeof target === 'string') {
        theVideo = document.getElementById(target) || document.querySelector(target) || videos[0];
    } else if (target instanceof HTMLElement) {
        theVideo = resolveCandidate(target) || videos[0];
    }

    if (!theVideo || theVideo.tagName !== 'VIDEO') return;

    // toggle the clicked/target video's muted state
    const wasMuted = !!theVideo.muted; // true => it was muted and will become unmuted
    theVideo.muted = !wasMuted;

    // if we just unmuted one video, ensure all others are muted
    if (wasMuted) {
        videos.forEach(v => {
            if (v !== theVideo) v.muted = true;
        });
    }
}

// initialize: mute all videos and attach click handlers to toggle
(function initVideoToggle() {
    const videos = document.querySelectorAll('video.videocropped, video');
    videos.forEach(v => {
        v.muted = true; // start muted
        v.addEventListener('click', toggleMute);
    });

    // also bind buttons or controls that may call toggleMute directly:
    // buttons with data-target="#id" or data-target="selector" will toggle that video
    document.querySelectorAll('[data-target]').forEach(btn => {
        btn.addEventListener('click', e => toggleMute(e.currentTarget));
    });
})();
// ...existing code...