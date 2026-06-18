/**
 * Agenda — eventos do responsável (ZupiAPI + JWT).
 */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof ZupiAPI === 'undefined' || !ZupiAPI.requireAuth()) return;

    const agendaItems = document.querySelector('#events');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const eventForm = document.getElementById('eventForm');

    findAllEvents().then((events) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedEvents = (events || []).sort((a, b) => {
            const diffA = Math.abs(new Date(a.date) - today);
            const diffB = Math.abs(new Date(b.date) - today);
            return diffA - diffB;
        });

        sortedEvents.forEach((event) => {
            agendaItems.insertAdjacentHTML('beforeend', createEventCard(event));
        });
    }).catch((error) => console.error('Erro ao buscar eventos:', error));

    loadChildren();
    loadSkillThemes();

    if (saveEventBtn) {
        saveEventBtn.addEventListener('click', salveEvent);
    }
});

async function findAllEvents() {
    const userId = ZupiAPI.getUser().id;
    if (!userId) return [];
    return (await ZupiAPI.fetchJson(`/${userId}/events`)) || [];
}

async function getChildren() {
    return ZupiAPI.fetchMyChildren();
}

async function getSkillThemes() {
    const user = ZupiAPI.getUser();
    const path = user.planType === 'PESSOA_FISICA' ? '/skillAreas/pf/agenda' : '/skillAreas';
    return (await ZupiAPI.fetchJson(path)) || [];
}

function createEventCard(event) {
    const title = event.title || 'Sem título';
    const eventDate = new Date(event.date);
    const date = eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timebegin = eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const finishTimeDate = new Date(event.finish);
    const timeEnd = finishTimeDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const childName = event.child?.name || 'Não informado';
    const category = event.skillArea?.name || 'Sem categoria';

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
            </div>`;
}

async function salveEvent() {
    const data = createDate(
        document.getElementById('eventDate').value,
        document.getElementById('eventTime').value
    );
    const finishTimeDate = createDate(
        document.getElementById('eventDate').value,
        document.getElementById('eventEnd').value
    );

    const childIdValue = document.getElementById('eventChild').value;
    const skillAreaValue = document.getElementById('eventCategory').value;
    const userIdValue = ZupiAPI.getUser().id;

    if (!document.getElementById('eventTitle').value ||
        !document.getElementById('eventDate').value ||
        !document.getElementById('eventTime').value ||
        !document.getElementById('eventEnd').value ||
        !childIdValue ||
        !skillAreaValue) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const formData = {
        title: document.getElementById('eventTitle').value,
        date: data.toISOString(),
        finish: finishTimeDate.toISOString(),
        childId: parseInt(childIdValue, 10),
        skillAreaId: parseInt(skillAreaValue, 10),
        userId: parseInt(userIdValue, 10)
    };

    try {
        const response = await ZupiAPI.post(`/${userIdValue}/events`, formData);
        if (response && response.ok) {
            alert('Atividade salva com sucesso!');
            document.getElementById('eventForm')?.reset();
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

function createDate(date, hours) {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = hours.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, 0);
}

async function loadChildren() {
    try {
        const childrenList = await getChildren();
        const select = document.getElementById('eventChild');
        if (!select) return;

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

async function loadSkillThemes() {
    try {
        const themesList = await getSkillThemes();
        const select = document.getElementById('eventCategory');
        if (!select) return;

        select.innerHTML = '<option value="">Selecionar categoria</option>';
        themesList.forEach((theme) => {
            const option = document.createElement('option');
            option.value = theme.id;
            option.textContent = theme.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}
