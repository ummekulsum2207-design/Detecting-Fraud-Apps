let loggedInAdmin = null;
let currentTheme = 'light';
let fraudHistory = {};
let fraudChart = null;

function openTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabName).style.display = 'block';
}

function adminLogin() {
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;
  if (username === 'admin' && password === 'admin123') {
    loggedInAdmin = { token: 'dummy-admin-token' };
    openTab('admin-section');
    fetch('http://localhost:3000/api/apps')
      .then(res => res.json())
      .then(apps => updateAppList(apps))
      .catch(err => console.error('Error loading apps:', err));
  } else {
    alert('Invalid Admin Credentials');
  }
}

function addApp() {
  const name = document.getElementById('app-name').value.trim();
  const type = document.getElementById('app-type').value.trim();

  if (!name || !type) {
    document.getElementById('add-app-status').textContent = 'Please enter both App Name and App Type';
    return;
  }

  fetch('http://localhost:3000/api/apps', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type })
  })
    .then(res => res.json())
    .then(() => fetch('http://localhost:3000/api/apps'))
    .then(res => res.json())
    .then(apps => updateAppList(apps))
    .catch(err => console.error('Error adding app:', err));
}

function updateAppList(apps) {
  const list = document.getElementById('added-apps-list');
  list.innerHTML = '';
  if (!Array.isArray(apps)) return;

  apps.forEach(app => {
    const li = document.createElement('li');
    const status = app.isFraud ? 'Fraud' : 'Genuine';
    li.textContent = `${app.name} (${status}) `;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.style.marginLeft = '10px';
    delBtn.onclick = () => {
      fetch(`http://localhost:3000/api/apps/${app._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': loggedInAdmin?.token || '' }
      })
        .then(res => res.json())
        .then(() => fetch('http://localhost:3000/api/apps'))
        .then(res => res.json())
        .then(apps => updateAppList(apps))
        .catch(err => alert('Error deleting app: ' + err.message));
    };

    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// UPDATED SCRAPE FUNCTION - Real Play Store Reviews with Stars
function scrapeAndSave() {
  const appId = document.getElementById('scrape-app-id').value.trim();
  const appName = document.getElementById('scrape-app-name').value.trim();
  const lang = document.getElementById('scrape-lang').value;
  const country = document.getElementById('scrape-country').value;

  if (!appId || !appName) {
    document.getElementById('status-result').textContent = 'Please enter both App ID and App Name';
    return;
  }

  document.getElementById('status-result').textContent = 'Scraping reviews...';

  fetch('http://localhost:3000/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId, appName, lang, country })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('status-result').textContent = data.message;
      const reviewList = document.getElementById('review-list');
      
      if (!data.reviews || data.reviews.length === 0) {
        reviewList.innerHTML = '<p style="color: #e74c3c; font-style: italic;">No reviews found. Try checking App ID or internet.</p>';
        return;
      }

      reviewList.innerHTML = '<h4>Latest Reviews:</h4><ul style="list-style: none; padding: 0;">' +
        data.reviews.map(r => `
          <li style="margin-bottom: 12px; padding: 12px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #3498db;">
            <div style="font-weight: bold; color: #f39c12;">
              ${'★'.repeat(r.score)}${'☆'.repeat(5 - r.score)} 
              <span style="font-weight: normal; color: #7f8c8d; font-size: 0.9em;">(${r.date})</span>
            </div>
            <div style="margin-top: 6px; color: #2c3e50;">${r.text}</div>
          </li>
        `).join('') +
        '</ul>';
    })
    .catch(err => {
      console.error('Scrape error:', err);
      document.getElementById('status-result').textContent = 'Error: ' + (err.message || 'Unknown error');
    });
}

// Updated checkStatus for pie chart
function checkStatus() {
  const appName = document.getElementById('check-app-name').value.trim();
  const resultBox = document.getElementById('user-status-result');
  const ctx = document.getElementById('fraud-chart').getContext('2d');

  if (!appName) {
    resultBox.textContent = 'Please enter an app name';
    if (fraudChart) fraudChart.destroy();
    return;
  }

  fetch(`http://localhost:3000/api/check-fraud/${appName}`)
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        resultBox.textContent = data.message || 'Error checking status';
        if (fraudChart) fraudChart.destroy();
        return;
      }

      let genuinePercent = data.isFraud ? 10 : 90;
      let fraudPercent = 100 - genuinePercent;

      resultBox.textContent = data.isFraud ? 
        `${data.appName} is Fraudulent` : 
        `${data.appName} is Genuine`;

      if (fraudChart) fraudChart.destroy();

      fraudChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Genuine', 'Fraudulent'],
          datasets: [{
            data: [genuinePercent, fraudPercent],
            backgroundColor: ['#28a745', '#dc3545'],
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: `Fraud Score for ${data.appName}` }
          }
        }
      });
    })
    .catch(err => {
      console.error('Check status error:', err);
      resultBox.textContent = 'Error checking status: ' + err.message;
      if (fraudChart) fraudChart.destroy();
    });
}

function submitFeedback() {
  const feedback = document.getElementById('feedback-text').value.trim();
  const appName = document.getElementById('check-app-name').value.trim();

  if (!feedback || !appName) {
    document.getElementById('feedback-status').textContent = 'Please enter feedback and app name';
    return;
  }

  fetch('http://localhost:3000/api/apps/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appName, feedback })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('feedback-status').textContent =
        `Feedback saved. Fraud Prediction: ${data.fraudPrediction}`;
    })
    .catch(err => {
      console.error('Feedback error:', err);
      document.getElementById('feedback-status').textContent = 'Error saving feedback: ' + err.message;
    });
}

// Make functions global for HTML onclick
window.checkStatus = checkStatus;
window.adminLogin = adminLogin;
window.addApp = addApp;
window.scrapeAndSave = scrapeAndSave;
window.submitFeedback = submitFeedback;
window.openTab = openTab;