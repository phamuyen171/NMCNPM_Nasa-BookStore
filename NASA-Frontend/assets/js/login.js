document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  
  const errorTiltle = 'LỖI ĐĂNG NHẬP';

  if (!username) {
    // alert('Vui lòng nhập tên đăng nhập!');
    showModalError(errorTiltle, 'Vui lòng nhập tên đăng nhập!', './');
    return;
  }

  if(!password){
    // alert('Vui lòng nhập mật khẩu!');
    showModalError(errorTiltle, 'Vui lòng nhập mật khẩu!', './');
    return;
  }

  if (password.length < 8) {
    // alert('Mật khẩu phải có ít nhất 8 ký tự!');
    showModalError(errorTiltle, 'Mật khẩu phải có ít nhất 8 ký tự!', './');
    return;
  }

  try {
      // Hiển thị loading (tuỳ chọn)
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Đang đăng nhập...';

    // Gọi API đăng nhập
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      // throw new Error(data.message || 'Đăng nhập thất bại');
      const message = data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
      // alert(message);
      showModalError(errorTiltle, message, './');
      // Reset lại nút đăng nhập
      const loginBtn = document.getElementById('loginBtn');
      loginBtn.disabled = false;
      loginBtn.textContent = 'ĐĂNG NHẬP';
      return;
    }

    // Lưu token vào localStorage hoặc cookie
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Chuyển hướng đến trang dashboard sau khi đăng nhập thành công
    window.location.href = './pages/dashboard/dashboard.html';
  }
  catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    // alert('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
    showModalError(errorTiltle, 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.', './');
  }
});