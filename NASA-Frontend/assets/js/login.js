document.getElementById('loginBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (username === 'M0001' && password === '123456') {
    window.location.href = './pages/dashboard/dashboard.html';
  } else {
    alert('Sai tên đăng nhập hoặc mật khẩu!');
  }
});