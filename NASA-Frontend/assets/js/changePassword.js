document.addEventListener("DOMContentLoaded", function () {
  const btnSubmit = document.getElementById("btn-submit");

  btnSubmit.addEventListener("click", async function () {
    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!oldPassword || !newPassword || !confirmPassword) {
      showModalError("LỖI ĐỔI MẬT KHẨU", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      showModalError("LỖI ĐỔI MẬT KHẨU", "Vui lòng xác nhận mật khẩu mới trùng khớp!");
      return;
    }

    // Nếu hợp lệ
    // TODO: Gửi dữ liệu lên server tại đây
    const userData = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await fetch(`http://localhost:3000/api/auth/change-password/${userData.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      showSuccessModal(
        'ĐỔI MẬT KHẨU',
        data.message,
        [
          {
            text: 'Đóng',
            link: window.location.href
          }
        ]
      );
    } catch (error) {
      showModalError("LỖI ĐỔI MẬT KHẨU", error.message);
    }
  });
});