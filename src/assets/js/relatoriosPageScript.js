let skillThemes = [];
let dailyReportsData = [];

document.addEventListener('DOMContentLoaded', async function () {
  await loadSkillThemes();
  loadChildrenToSelect();
  setupReportSaveButton();
  setupScoresUI();  
  setTodayDate();
  createCardeSkillAverage(await getSkillAverage());

  const childId = localStorage.getItem('childId');
  if (childId) {
    dailyReportsData = await getRecentsReports();
    if (dailyReportsData.length !== 0) {
      renderDailyReports(dailyReportsData);
    }
  }

});


function renderDailyReports(reports) {
  const container = document.getElementById('reportsContainer');
  container.innerHTML = '';
  reports.forEach(report => {
    const reportDate = new Date(report.date);
    const formattedDate = reportDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const reportCardHTML = `
          <div class="col-md-6 col-lg-4 mb-3">
            <div class="card h-100">
              <div class="card-body d-flex flex-column">
                <h3 class="card-title h5">Relatório de ${formattedDate}</h3>    
                <button class="btn btn-primary mt-auto" onclick="openDailyReportDetails(${report.id})">Ver Detalhes</button>
              </div>
            </div>
          </div>
        `;
    container.insertAdjacentHTML('beforeend', reportCardHTML);
  });
}


async function getRecentsReports() {

  try {
    const childId = localStorage.getItem('childId');

    const response = await fetch(`http://localhost:8080/reports/lasted/${childId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const reports = await response.json();
    return reports;
  } catch (error) {
    console.error('Erro ao buscar relatórios diários:', error);
    return [];
  }
};



function openDailyReportDetails(reportId) {
  const report = dailyReportsData.find(r => r.id === reportId);
  if (!report) return;

    const formattedDate = new Date(report.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  document.getElementById('report-details-section').style.display = 'block';
  document.getElementById('report-title').textContent = `Detalhes - Relatório de ${formattedDate}`;
  renderScores(report.scores);

  window.scrollTo({ top: document.getElementById('report-details-section').offsetTop - 100, behavior: 'smooth' });
}

function renderScores(scores) {
  const container = document.getElementById('report-details');
  container.innerHTML = '';
  scores.forEach(score => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
          <div class="card h-100">
            <div class="card-body">
              <h4 class="card-title h5">${score.theme}</h4>
              <p class="card-text">Desempenho: <strong>${score.score}%</strong></p>
              <div class="progress">
                <div class="progress-bar bg-zupi-primary" role="progressbar" style="width: ${score.score}%" aria-valuenow="${score.score}" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </div>
        `;
    container.appendChild(col);
  });
}

const closeDetailsBtn = document.getElementById('close-details');
if (closeDetailsBtn) {
  closeDetailsBtn.addEventListener('click', function () {
    document.getElementById('report-details-section').style.display = 'none';
  });
}


function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('reportDate').value = today;
}

function setupScoresUI() {
  const addScoreBtn = document.getElementById('addScoreBtn');

  if (addScoreBtn) {
    addScoreBtn.addEventListener('click', function () {
      addScoreField();
    });
  }

  // Adiciona um campo de score inicial
  addScoreField();
}

async function getSkillThems() {

  try {
    const response = await fetch('http://localhost:8080/skillAreas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const themes = await response.json();
    return themes;
  } catch (error) {
    console.error('Erro ao buscar temas de habilidades:', error);
    return [];
  }

}

async function loadSkillThemes() {
  try {
    skillThemes = await getSkillThems();
  } catch (error) {
    console.error('Erro ao carregar themes:', error);
  }
}


function addScoreField() {
  const container = document.getElementById('scoresContainer');
  const scoreIndex = container.children.length;

  // Cria as options do dropdown com as themes
  let themeOptions = '<option value="">Selecionar tema...</option>';
  skillThemes.forEach(theme => {
    themeOptions += `<option value="${theme.id}" data-name="${theme.name}">${theme.name}</option>`;
  });

  const scoreHTML = `
        <div class="score-field mb-2 p-2 border rounded" data-index="${scoreIndex}">
          <div class="row g-2">
            <div class="col-8">
              <select class="form-select form-select-sm theme-select" name="themeId[]" data-index="${scoreIndex}" required>
                ${themeOptions}
              </select>
            </div>
            <div class="col-3">
              <input type="number" class="form-control form-control-sm" placeholder="Score" 
                name="score[]" min="0" max="100" value="" required>
            </div>
            <div class="col-1">
              <button type="button" class="btn btn-sm btn-danger remove-score" data-index="${scoreIndex}">×</button>
            </div>
          </div>
        </div>
      `;

  container.insertAdjacentHTML('beforeend', scoreHTML);

  // Adiciona listener para remover score
  const removeBtn = container.querySelector(`[data-index="${scoreIndex}"] .remove-score`);
  if (removeBtn) {
    removeBtn.addEventListener('click', function () {
      container.querySelector(`[data-index="${scoreIndex}"]`).remove();
    });
  }
}

async function loadChildrenToSelect() {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    console.error('ID de usuário não encontrado');
    return;
  }

  try {
    const response = await fetch(`http://localhost:8080/child/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar crianças');
    }

    const children = await response.json();
    const select = document.getElementById('reportChild');

    children.forEach(child => {
      const option = document.createElement('option');
      option.value = child.id;
      option.textContent = child.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar crianças:', error);
  }
}

function setupReportSaveButton() {
  const saveButton = document.getElementById('saveReportButton');

  if (saveButton) {
    saveButton.addEventListener('click', async function () {
      const form = document.getElementById('saveReportForm');

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Coleta os scores com IDs das themes
      const scores = [];
      const themeSelects = document.querySelectorAll('select[name="themeId[]"]');
      const scoreValues = document.querySelectorAll('input[name="score[]"]');

      themeSelects.forEach((select, index) => {
        const themeId = select.value;
        const themeName = select.options[select.selectedIndex]?.dataset.name || select.options[select.selectedIndex]?.text;
        const score = parseInt(scoreValues[index].value);

        if (themeId && !isNaN(score) && themeName) {
          scores.push({
            skillAreaId: parseInt(themeId),
            theme: themeName,
            score: score
          });
        }
      });

      if (scores.length === 0) {
        alert('Adicione pelo menos um score com tema e pontuação!');
        return;''
      }

      const daylyReport = localStorage.getItem('dailyReportId');

      const reportId = daylyReport ? parseInt(daylyReport) : null;

      try {
        const childId = document.getElementById('reportChild').value;

        let response;

        if (!reportId) {

          const reportData = {
            date: new Date(document.getElementById('reportDate').value).toISOString(),
            scores: scores
          };

          console.log(reportData);

          response = await fetch(`http://localhost:8080/reports/${childId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
          });

            const responseData = await response.json();
            await criateDailyReportId(responseData);

        } else {

          const reportData = {
            id: reportId,
            date: new Date(document.getElementById('reportDate').value).toISOString(),
            scores: scores
          };

          console.log(reportData);

          response = await fetch(`http://localhost:8080/reports/${childId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)

          });
        }

        if (response.ok) {
          alert('Relatório salvo com sucesso!');
          form.reset();
          // Reseta os scores
          document.getElementById('scoresContainer').innerHTML = '';
          setupScoresUI();
          setTodayDate();
          const modal = bootstrap.Modal.getInstance(document.getElementById('saveReportModal'));
          if (modal) {
            modal.hide()
          };
          location.reload();
        } else {
          alert('Erro ao salvar relatório.');
        }
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar relatório.');
      }


    });


  }
}

async function criateDailyReportId(responseData) {
  
  localStorage.setItem('dailyReportId', responseData.id);
  console.log(localStorage.getItem('dailyReportId'));

}

async function getSkillAverage(){

  try {
    const childId = localStorage.getItem('childId');

    const response = await fetch(`http://localhost:8080/reports/avg/${childId}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json'
      }
    });
    const averages = await response.json();
    return averages;
  } catch (error) {
    console.error('Erro ao buscar médias de habilidades:', error);
    return [];
  }
}

function createCardeSkillAverage(averages){
    
    const container = document.getElementById('avg');
    averages.forEach(avg => {

      const cardHTML = `
            <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <h3 class="card-title h5">${avg.skillArea.name}</h3>
                <p class="card-text">Último desempenho: <strong>${avg.average}%</strong></p>
                <div class="progress">
                  <div class="progress-bar bg-zupi-primary" role="progressbar" style="width: ${avg.average}%" aria-valuenow="${averages.average}"
                    aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
            </div>
          </div>
          `;
      container.insertAdjacentHTML('beforeend', cardHTML);
    });
}