import { apiUrl } from '../core/api.js';

async function getSkillThemes() {
  try {
    const response = await fetch(apiUrl('/skillAreas'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Erro ao buscar skill areas');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar skill areas:', error);
    return [];
  }
}

async function getChildren() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    console.error('ID de usuário não encontrado');
    return [];
  }
  try {
    const response = await fetch(apiUrl(`/child/${userId}`), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Erro ao buscar crianças');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar crianças:', error);
    return [];
  }
}

async function findAllEvents() {
  const userId = localStorage.getItem('userId');
  const response = await fetch(apiUrl(`/${userId}/events`), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.json();
}

function createEventCard(event) {
  const title = event.title || 'Sem título';
  const eventDate = new Date(event.date);
  const date = eventDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timebegin = eventDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const finishTimeDate = new Date(event.finish);
  const timeEnd = finishTimeDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const childName = event.child.name || 'Não informado';
  const category = event.skillArea.name || 'Sem categoria';

  return `
            <div class="col-md-6 col-lg-4">
              <div class="card h-100">
                <div class="card-body">
                  <h3 class="card-title h5">${title}</h3>
                  <p class="card-text"><strong>Data:</strong> ${date}</p>
                  <p class="card-text"><strong>Horário:</strong> ${timebegin} - ${timeEnd}</p>
                  <p class="card-text"><strong>Criança:</strong> ${childName}</p>
                  <p class="card-text"><strong>Categoria:</strong> ${category}</p>
                  <a href="#" class="btn btn-primary btn-sm">Ver Detalhes</a>
                </div>
              </div>
            </div>
    `;
}

function createDateTime(date, hours) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = hours.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0);
}

async function salveEvent() {
  const data = createDateTime(
    document.getElementById('eventDate').value,
    document.getElementById('eventTime').value
  );
  const finishTimeDate = createDateTime(
    document.getElementById('eventDate').value,
    document.getElementById('eventEnd').value
  );
  const childIdValue = document.getElementById('eventChild').value;
  const skillAreaValue = document.getElementById('eventCategory').value;
  const userIdValue = localStorage.getItem('userId');
  const eventForm = document.getElementById('eventForm');

  if (
    !document.getElementById('eventTitle').value ||
    !document.getElementById('eventDate').value ||
    !document.getElementById('eventTime').value ||
    !document.getElementById('eventEnd').value ||
    !childIdValue ||
    !skillAreaValue
  ) {
    alert('Por favor, preencha todos os campos!');
    return;
  }

  const formData = {
    title: document.getElementById('eventTitle').value,
    date: data.toISOString(),
    finish: finishTimeDate.toISOString(),
    childId: parseInt(childIdValue, 10),
    skillAreaId: parseInt(skillAreaValue, 10),
    userId: parseInt(userIdValue, 10),
  };

  try {
    const response = await fetch(apiUrl(`/${userIdValue}/events`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert('Atividade salva com sucesso!');
      eventForm?.reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
      if (modal) modal.hide();
      location.reload();
    } else {
      alert('Erro ao salvar atividade.');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao salvar atividade.');
  }
}

async function loadChildren() {
  try {
    const childrenList = await getChildren();
    const select = document.getElementById('eventChild');
    if (!select) {
      console.error('Elemento eventChild não encontrado');
      return;
    }
    select.innerHTML = '<option value="">Selecionar criança</option>';
    childrenList.forEach((child) => {
      const option = document.createElement('option');
      option.value = child.id;
      option.textContent = child.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar crianças:', error);
  }
}

async function loadSkillThemesSelect() {
  try {
    const themesList = await getSkillThemes();
    const select = document.getElementById('eventCategory');
    if (!select) {
      console.error('Elemento eventCategory não encontrado');
      return;
    }
    select.innerHTML = '<option value="">Selecionar categoria</option>';
    themesList.forEach((theme) => {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar skill themes:', error);
  }
}

function init() {
  const agendaItems = document.querySelector('#events');
  const saveEventBtn = document.getElementById('saveEventBtn');

  findAllEvents()
    .then((events) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sortedEvents = events.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const diffA = Math.abs(dateA - today);
        const diffB = Math.abs(dateB - today);
        return diffA - diffB;
      });
      sortedEvents.forEach((event) => {
        agendaItems.insertAdjacentHTML('beforeend', createEventCard(event));
      });
    })
    .catch((error) => {
      console.error('Erro ao buscar eventos:', error);
    });

  loadChildren();
  loadSkillThemesSelect();
  saveEventBtn?.addEventListener('click', salveEvent);
}

document.addEventListener('DOMContentLoaded', init);
