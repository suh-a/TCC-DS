const ZupiProfileMedia = (() => {
  const KEY = 'zupiProfilePhotos';

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{"responsibles":{},"children":{},"organizations":{}}');
    } catch (e) {
      return { responsibles: {}, children: {}, organizations: {} };
    }
  }

  function write(data) {
    localStorage.setItem(KEY, JSON.stringify({
      responsibles: data.responsibles || {},
      children: data.children || {},
      organizations: data.organizations || {}
    }));
  }

  function get(type, id) {
    if (!id) return '';
    const data = read();
    const bucket = data[bucketName(type)] || {};
    return bucket[String(id)] || '';
  }

  function set(type, id, dataUrl) {
    if (!id || !dataUrl) return;
    const data = read();
    const name = bucketName(type);
    data[name] = data[name] || {};
    data[name][String(id)] = dataUrl;
    write(data);
    window.dispatchEvent(new CustomEvent('zupi:profile-photo-updated', {
      detail: { type, id: String(id), dataUrl }
    }));
  }

  function renderAvatar({ type, id, name = '', size = 96, className = '', fallbackUrl = '' }) {
    const photo = get(type, id) || fallbackUrl;
    const initial = (name || defaultName(type)).trim().charAt(0).toUpperCase();
    const safeName = escapeHtml(name || 'Perfil');
    const cls = `zupi-profile-avatar ${className}`.trim();

    if (photo) {
      return `<img src="${photo}" alt="Foto de ${safeName}" class="${cls}" style="width:${size}px;height:${size}px;">`;
    }

    return `<div class="${cls} zupi-profile-avatar--fallback" style="width:${size}px;height:${size}px;" aria-label="Perfil de ${safeName}">${initial}</div>`;
  }

  function bindInput(input, { type, id, previewSelector }) {
    if (!input || !id) return;
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('Escolha uma imagem valida.');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        set(type, id, reader.result);
        const preview = document.querySelector(previewSelector);
        if (preview) {
          preview.innerHTML = renderAvatar({ type, id, name: preview.dataset.profileName || '', size: Number(preview.dataset.profileSize || 120) });
          animatePreview(preview);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function animatePreview(preview) {
    const avatar = preview && preview.querySelector('.zupi-profile-avatar');
    if (!avatar) return;
    avatar.classList.remove('zupi-profile-avatar--saved');
    requestAnimationFrame(() => avatar.classList.add('zupi-profile-avatar--saved'));
  }

  function saveFromInput(input, { type, id, onSaved }) {
    if (!input || !id) return;
    const file = input.files && input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Escolha uma imagem valida.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set(type, id, reader.result);
      if (typeof onSaved === 'function') onSaved(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function bucketName(type) {
    if (type === 'child') return 'children';
    if (type === 'organization') return 'organizations';
    return 'responsibles';
  }

  function defaultName(type) {
    if (type === 'child') return 'Crianca';
    if (type === 'organization') return 'Escola';
    return 'Responsavel';
  }

  return { get, set, renderAvatar, bindInput, saveFromInput, animatePreview, read };
})();

window.ZupiProfileMedia = ZupiProfileMedia;
