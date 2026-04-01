childId = localStorage.getItem('childId');

const API_BASE = window.API_BASE_URL || window.location.origin;

const childData = await fetch(`${API_BASE}/child/${childId}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
});

document.getElementById('childName').textContent = childData.name;