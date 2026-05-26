/**
 * Avatar de criança — sempre emoji (sem foto de perfil).
 */
const ZupiChildAvatar = (() => {
    const EMOJIS = ['🧒', '👧', '👦', '👶', '🙂', '😊', '🌟', '🦋', '🎈', '🌈', '🎨', '🐻'];

    function emojiForChild(child) {
        const key = String(child?.id ?? child?.name ?? '0');
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = (hash + key.charCodeAt(i)) % 2147483647;
        }
        return EMOJIS[Math.abs(hash) % EMOJIS.length];
    }

    function baseStyles(sizePx) {
        return [
            `width:${sizePx}px`,
            `height:${sizePx}px`,
            'min-width:' + sizePx + 'px',
            'min-height:' + sizePx + 'px',
            'border-radius:50%',
            'background:var(--zupi-highlight,#FFB677)',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'flex-shrink:0',
            `font-size:${Math.round(sizePx * 0.45)}px`,
            'line-height:1',
            'user-select:none'
        ].join(';');
    }

    function renderHtml(child, sizePx = 80, extraClass = '') {
        const emoji = emojiForChild(child);
        const label = child?.name ? `Avatar de ${child.name}` : 'Avatar da criança';
        const cls = extraClass ? ` class="${extraClass}"` : '';
        return `<div${cls} style="${baseStyles(sizePx)}" role="img" aria-label="${label}">${emoji}</div>`;
    }

    function applyToElement(el, child, sizePx = 80) {
        if (!el) return;
        const emoji = emojiForChild(child);
        el.textContent = '';
        el.style.cssText = baseStyles(sizePx);
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', child?.name ? `Avatar de ${child.name}` : 'Avatar da criança');
        el.appendChild(document.createTextNode(emoji));
        el.classList.add('child-emoji-avatar');
    }

    function createElement(child, sizePx = 80, extraClass = '') {
        const el = document.createElement('div');
        if (extraClass) el.className = extraClass;
        applyToElement(el, child, sizePx);
        return el;
    }

    return { emojiForChild, renderHtml, applyToElement, createElement };
})();

window.ZupiChildAvatar = ZupiChildAvatar;
