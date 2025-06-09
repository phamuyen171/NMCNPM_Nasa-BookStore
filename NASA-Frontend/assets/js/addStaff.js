//nhập file ảnh vào thì in ảnh ra
document.addEventListener("DOMContentLoaded", function () {
  const imageFileInput = document.getElementById("image-file");
  const previewImage = document.getElementById("preview-image");
  const placeholder = document.getElementById("placeholder");

  imageFileInput.addEventListener("change", function () {
    const file = imageFileInput.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
        placeholder.style.display = "none";
      };
      imageFileInput.style.display = "none";

      reader.readAsDataURL(file); // đọc ảnh thành base64 để hiển thị ngay
    } else {
      previewImage.style.display = "none";
      placeholder.style.display = "block";
    }
  });
});

//gọi api lấy mã nhân viên, tên tk, mk
document.getElementById("chucvu-select").addEventListener("change", function () {
  const chucvu = this.value;
  const cccd = document.getElementById("cccd").value;

  if (!chucvu || !cccd) {
    // Nếu chưa chọn đủ, xóa hết input
    document.getElementById("manv").value = "";
    document.getElementById("username").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    return;
  }

  fetch("http://localhost:3000/api/staff/fill-staff-auto", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      role: chucvu,
      CCCD: cccd
    })
  })
    .then(response => {
      if (!response.ok) throw new Error("Lỗi phản hồi từ server");
      return response.json();
    })
    .then(result => {
      if (result.success && result.data) {
        const data = result.data;
        document.getElementById("manv").value = data.staffId || "";
        document.getElementById("username").value = data.username || "";
        document.getElementById("email").value = data.email || "";
        document.getElementById("password").value = data.password || "";

        //Tạm thời, lấy thời gian như này
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Tháng từ 0–11
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;
        document.getElementById("start-work-day").value = formattedDate;

      } else {
        throw new Error(result.message || "Không nhận được dữ liệu hợp lệ");
      }
    })
    .catch(error => {
      console.error("Lỗi khi lấy dữ liệu nhân viên:", error);
      alert("Không lấy được dữ liệu nhân viên, vui lòng thử lại sau.");
    });
});



//api thêm nhân viên
//api/auth/create-account
function toISODate(ddmmyyyy) {
  const [day, month, year] = ddmmyyyy.split('/');
  return `${year}-${month}-${day}`;
}


document.getElementById("create-account").addEventListener("click", function () {
  const fields = [
    { id: "name", label: "Họ và tên" },
    { id: "address", label: "Địa chỉ" },
    { id: "phone", label: "Số điện thoại" },
    { id: "cccd", label: "CCCD" },
    { id: "birth", label: "Ngày sinh" },
    { id: "image-file", label: "Ảnh" },
    { id: "chucvu-select", label: "Chức vụ" },
    { id: "manv", label: "Mã nhân viên" },
    { id: "email", label: "Email" },
    { id: "start-work-day", label: "Ngày vào làm" },
    { id: "username", label: "Tên tài khoản" },
    { id: "password", label: "Mật khẩu mặc định" }
  ];

  // Kiểm tra dữ liệu đầu vào
  for (let field of fields) {
    const el = document.getElementById(field.id);
    if (!el || !el.value.trim()) {
      alert(`Vui lòng nhập trường "${field.label}".`);
      el && el.focus();
      return;
    }
  }

  // Hiện modal xác nhận
  const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
  confirmModal.show();

  // Gắn sự kiện MỘT LẦN nếu chưa gắn
  const confirmBtn = document.getElementById('confirmAddBtn');
  if (!confirmBtn.dataset.bound) {
    confirmBtn.dataset.bound = "true"; // Đánh dấu đã gắn
    confirmBtn.addEventListener("click", function () {
      confirmModal.hide();

      // Tạo dữ liệu gửi
      const data = {
        username: document.getElementById("username").value.trim(),
        password: document.getElementById("password").value.trim(),
        fullName: document.getElementById("name").value.trim(),    
        address: document.getElementById("address").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        CCCD: document.getElementById("cccd").value.trim(),
        DoB: document.getElementById("birth").value.trim(),      
        email: document.getElementById("email").value.trim(),
        role: document.getElementById("chucvu-select").value.trim()
      };

      console.log("Gửi API với dữ liệu:", data);

      fetch('http://localhost:3000/api/auth/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(res => {
        if (!res.ok) throw new Error('Lỗi mạng');
        return res.json();
      })
      .then(response => {
        console.log("Phản hồi từ backend:", response);
        if (response.success) {
          const successModal = new bootstrap.Modal(document.getElementById('successModal'));
          successModal.show();
        } else {
          alert('Thêm nhân viên thất bại: ' + (response.message || ''));
        }
      })
      .catch(err => {
        alert('Lỗi khi gửi dữ liệu: ' + err.message);
      });
    });
  }
});



