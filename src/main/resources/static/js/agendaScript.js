const API_BASE = window.API_BASE_URL || window.location.origin;

const getSkillThemes = async () => {
    try {
        const response = await fetch(`${API_BASE}/skillAreas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar skill areas');
        }

        const themes = await response.json();
        return themes;
    } catch (error) {
        console.error('Erro ao buscar skill areas:', error);
        return [];
    }
}

const getChildren = async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.error('ID de usuário não encontrado');
        return [];
    }

    try {
        const response = await fetch(`${API_BASE}/child/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar crianças');
        }

        const children = await response.json();
        return children;
    } catch (error) {
        console.error('Erro ao buscar crianças:', error);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const agendaItems = document.querySelector('#events');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const eventForm = document.getElementById('eventForm');

    // Carrega eventos existentes
    findAllEvents().then(events => {
        // Ordena eventos pela data mais próxima do dia atual
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera horas para comparar apenas datas

        const sortedEvents = events.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            // Calcula a diferença absoluta em milissegundos entre a data do evento e hoje
            const diffA = Math.abs(dateA - today);
            const diffB = Math.abs(dateB - today);
            
            // Ordena pela menor diferença (mais próximo de hoje primeiro)
            return diffA - diffB;
        });

        sortedEvents.forEach(event => {
            const eventCardHTML = createEventCard(event);
            agendaItems.insertAdjacentHTML('beforeend', eventCardHTML);
        });
    }).catch(error => {
        console.error('Erro ao buscar eventos:', error);
    });

    // Carrega crianças e skill areas nos selects
    loadChildren();
    loadSkillThemes();

    // Salva novo evento
    if (saveEventBtn) {
        saveEventBtn.addEventListener('click', salveEvent);
    }
    

});



async function  findAllEvents() {
    const userId = localStorage.getItem('userId');

    const response = await fetch(`${API_BASE}/events/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const events = await response.json();

    return events;
}

function createEventCard(event) {

    const title = event.title || 'Sem título';
   
    const eventDate = new Date(event.date);
    
    const date = eventDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const timebegin = eventDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const finishTimeDate = new Date(event.finish)

    const timeEnd = finishTimeDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
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

async function salveEvent() {
            const data = createDate(document.getElementById('eventDate').value,document.getElementById('eventTime').value);
            

            const finishTimeDate = createDate(document.getElementById('eventDate').value,document.getElementById('eventEnd').value);
            

            const childIdValue = document.getElementById('eventChild').value;
            const skillAreaValue = document.getElementById('eventCategory').value;
            const userIdValue = localStorage.getItem('userId');

            // Validação básica
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
                childId: parseInt(childIdValue),
                skillArea: parseInt(skillAreaValue),
                userId: parseInt(userIdValue)
            };

            console.log('FormData enviado:', formData);

            try {   
                const response = await fetch(`${API_BASE}/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    //alert('Atividade salva com sucesso!');
                    eventForm.reset();
                    // Fecha o modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
                    if (modal) modal.hide();
                    // Recarrega a página ou adiciona o novo evento dinamicamente
                    location.reload();
                } else {
                    alert('Erro ao salvar atividade.');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao salvar atividade.');
            }

}

function createDate(date,hours){
    const [year, month, day] = date.split("-").map(Number);
    
    const [hour, minute] = hours.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute, 0   );
}

async function loadChildren() {
    try {
        const childrenList = await getChildren();
        const select = document.getElementById('eventChild');
        
        if (!select) {
            console.error('Elemento eventChild não encontrado');
            return;
        }

        // Limpa opções existentes (exceto a primeira se houver)
        select.innerHTML = '<option value="">Selecionar criança</option>';

        childrenList.forEach(child => {
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
        
        if (!select) {
            console.error('Elemento eventCategory não encontrado');
            return;
        }

        // Limpa opções existentes (exceto a primeira se houver)
        select.innerHTML = '<option value="">Selecionar categoria</option>';

        themesList.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.id;
            option.textContent = theme.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar skill themes:', error);
    }
}



