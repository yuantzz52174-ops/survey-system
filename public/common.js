const API_BASE = '';

function getToken() {
  return localStorage.getItem('token') || '';
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

function getAuthHeaders(json = true) {
  const headers = {};
  const token = getToken();

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (json) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || '请求失败');
  }

  return data;
}

function ensureLoggedIn() {
  if (!getToken()) {
    alert('请先登录');
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

function logout() {
  clearToken();
  alert('已退出登录');
  window.location.href = '/login.html';
}

function renderNavbar(currentPage = '') {
  const token = getToken();
  const nav = document.getElementById('navbar');
  if (!nav) return;

  nav.innerHTML = `
    <a href="/register.html">注册</a>
    <a href="/login.html">登录</a>
    <a href="/manage.html">创建和发布问卷</a>
    <a href="/fill.html">填写问卷</a>
    <a href="/stats.html">统计结果</a>
    <div class="right">
      ${token ? '<button onclick="logout()">退出登录</button>' : ''}
    </div>
  `;
}

function showJson(id, data) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = JSON.stringify(data, null, 2);
  }
}