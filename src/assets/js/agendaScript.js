document.addEventListener('DOMContentLoaded', function() {
    const agendaItems = document.querySelector('#events');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const eventForm = document.getElementById('eventForm');

    // Carrega eventos existentes
    findAllEvents().then(events => {
        events.forEach(event => {
            const eventCardHTML = createEventCard(event);
            agendaItems.insertAdjacentHTML('beforeend', eventCardHTML);
        });
    }).catch(error => {
        console.error('Erro ao buscar eventos:', error);
    });

    // Salva novo evento
    if (saveEventBtn) {
        saveEventBtn.addEventListener('click', salveEvent);
    }

});

async function  findAllEvents() {

    const response = await fetch('http://localhost:8080/events', {
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
    const category = event.category || event.eventCategory || 'Sem categoria';

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
            

            const formData = {
                title: document.getElementById('eventTitle').value,
                date: data.toISOString(),
                finish: finishTimeDate.toISOString(),
                child: document.getElementById('eventChild').value
            };


            // Validação básica
            if (!formData.title || !formData.date || !formData.finish || !formData.child) {
                alert('Por favor, preencha todos os campos!');
                return;
            }

            try {   
                const response = await fetch('http://localhost:8080/events', {
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

