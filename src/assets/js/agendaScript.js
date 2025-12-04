document.addEventListener('DOMContentLoaded', function() {
    const agendaItems = document.querySelector('#events');

    findAllEvents().then(events => {
        events.forEach(event => {
            const eventCardHTML = createEventCard(event);
            agendaItems.insertAdjacentHTML('beforeend', eventCardHTML);
        });
    }).catch(error => {
        console.error('Erro ao buscar eventos:', error);
    });

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

    const title = event.title;

    const date = new Date(event.Date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const timebegin = new Date(event.Date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const timeEnd = new Date(event.timeEnd).toLocaleTimeString('pt-BR', {   
        hour: '2-digit',
        minute: '2-digit'
    });

    const childName = event.childName;

    return `
            <div class="col-md-6 col-lg-4">
              <div class="card h-100">
                <div class="card-body">
                  <h3 class="card-title h5">${title}</h3>
                  <p class="card-text"><strong>Data:</strong> ${date}</p>
                  <p class="card-text"><strong>Horário:</strong> ${timebegin} - ${timeEnd}</p>
                  <p class="card-text"><strong>Criança:</strong> ${childName}</p>
                  <a href="#" class="btn btn-primary btn-sm">Ver Detalhes</a>
                </div>
              </div>
            </div>
    `;
}

