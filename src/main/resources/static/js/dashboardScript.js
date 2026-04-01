const API_BASE = window.API_BASE_URL || window.location.origin;

document.addEventListener('DOMContentLoaded', function () {
     dashboardLoad();
});

async function getUserData() {

    const userId = localStorage.getItem('userId');

    const response = await fetch(`${API_BASE}/auth/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const userData = await response.json();
    console.log(userData);
    return userData;
}

async function getChildData() {
    const userId = localStorage.getItem('userId');
    const response = await fetch(`${API_BASE}/child/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const childData = await response.json();
    return childData;
}

async function cadastrarCrianca() {

     document.getElementById('addChildButton').blur();

    const name = document.getElementById('childName').value;
    const birthDate = createDate(document.getElementById('childBirthdate').value);
    const childGrade = document.getElementById('childGrade').value;
    const childCondition = document.getElementById('childCondition').value;
    const userId = localStorage.getItem('userId');
    const childData = {
        name: name,
        birthDate: birthDate,
        schoolClass: childGrade,
        condition: childCondition,
        responsibleId: userId
    };

    console.log(childData);

    try {
        const response = await fetch(`${API_BASE}/child`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(childData)
        });
        if (response.ok) {
            alert('Criança cadastrada com sucesso!');
            window.location.reload();
        }
    } catch (error) {
        console.error('Erro ao cadastrar criança:', error);
    }
}   


async function dashboardLoad() {
    const user = await getUserData();
    const children = await getChildData();

    const titleElement = document.getElementById('title');

    const childrenPerfisContainer = document.getElementById('perfil-criancas');
    
    titleElement.textContent = `Olá, ${user.name}`;
    
    children.forEach(child => {
        const childCardHTML = createChildCard(child);
        childrenPerfisContainer.insertAdjacentHTML('beforeend', childCardHTML);
    });


}

function createDate(date){
    const [year, month, day] = date.split("-").map(Number);

    return new Date(year, month - 1, day);              
}

function createChildCard(child) {
    return `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3">
              <div class="card h-100 shadow-sm">
                <div class="card-body text-center d-flex flex-column">
                  <img src="/img/logokids1.png" class="img-fluid mx-auto mb-3" style="max-width: 80px;">
                  <h3 class="card-title h6 mb-2">${child.name}</h3>
                  <p class="card-text text-muted small flex-grow-1">Idade: ${child.age}</p>
                  <a href="/selecao-perfil" class="btn btn-primary btn-sm mt-auto" data-childId="${child.id}">Ver Perfil</a>
                </div>
              </div>
            </div>
    `;
}