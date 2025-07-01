window.addEventListener("DOMContentLoaded", () => {
  ["banner", "header" ,"footer"].forEach(id => {
    const el = document.getElementById(id);
    const url = el?.dataset?.url;

    if (el && url) {
      fetch(`${url}?_=${Date.now()}`) // tránh cache
        .then(res => res.text())
        .then(html => {
          el.innerHTML = html;
          if (id === "header") {
            // Sau khi header đã load xong, cập nhật tên người dùng
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.username && user.image) {
              document.getElementById("userName").innerText = user.username;
              document.getElementById("userAvatar").src =  `http://localhost:3000/api/image/${user.image}`;
            }

            // Thêm sự kiện cho nút đăng xuất
            document.getElementById("logoutBtn").addEventListener("click", () => {
              localStorage.clear();
              window.location.href = "../../index.html";
            });
          }
        })
        .catch(err => console.error(`Lỗi khi load ${id}:`, err));
    }
  });
});
