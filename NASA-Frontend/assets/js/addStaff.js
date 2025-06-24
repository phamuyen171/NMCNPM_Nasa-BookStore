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
      // imageFileInput.style.display = "none";

      reader.readAsDataURL(file); // đọc ảnh thành base64 để hiển thị ngay
    } else {
      previewImage.style.display = "none";
      placeholder.style.display = "block";
    }
  });
});

//gọi api lấy mã nhân viên, tên tk, mk
function fillStaffInfo(tag1, tag2){
  document.getElementById(tag1).addEventListener("change", function () {
    const tag_first = this.value;
    const tag_second = document.getElementById(tag2).value;

    if (!tag_second || !tag_first) {
      // Nếu chưa chọn đủ, xóa hết input
      document.getElementById("manv").value = "";
      document.getElementById("username").value = "";
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
      return;
    }
    let chucvu;
    let cccd; 
    if (tag1 === "chucvu-select"){
      chucvu = tag_first;
      cccd = tag_second;
    } else {
      chucvu = tag_second;
      cccd = tag_first;
    }

    fetch("http://localhost:3000/api/staff/fill-staff-auto", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: chucvu,
        CCCD: cccd,
        startDate: document.getElementById("start-work-day").value.trim()
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
          const day = new Date(data.startDate);
          const yyyy = day.getFullYear();
          const mm = String(day.getMonth() + 1).padStart(2, '0'); // Tháng từ 0–11
          const dd = String(day.getDate()).padStart(2, '0');
          const formattedDate = `${dd}-${mm}-${yyyy}`;
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
}
fillStaffInfo("chucvu-select", "cccd");
fillStaffInfo("cccd", "chucvu-select");



//api thêm nhân viên
//api/auth/create-account
function toISODate(ddmmyyyy) {
  let [day, month, year] = ddmmyyyy.split('/');
  if (!day || !month || !year) {
    [day, month, year] = ddmmyyyy.split('-');
  }
  return new Date(year, month -1, day);
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
      // alert(`Vui lòng nhập trường "${field.label}".`);
      showModalError("LỖI THÊM NHÂN VIÊN", `Vui lòng nhập trường "<b>${field.label}</b>".`);
      el && el.focus();
      return;
    }
  }

  // // Hiện modal xác nhận
  // const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
  // confirmModal.show();

  showModalConfirm("THÊM NHÂN VIÊN", "thêm nhân viên", "", async () => {
    // Tạo dữ liệu gửi
    const formData = new FormData();
    formData.append('username', document.getElementById("username").value.trim());
    formData.append('password', document.getElementById("password").value.trim());
    formData.append('fullName', document.getElementById("name").value.trim());
    formData.append('address', document.getElementById("address").value.trim());
    formData.append('phone', document.getElementById("phone").value.trim());
    formData.append('CCCD', document.getElementById("cccd").value.trim());
    formData.append('DoB', document.getElementById("birth").value.trim());
    formData.append('email', document.getElementById("email").value.trim());
    formData.append('role', document.getElementById("chucvu-select").value.trim());

    const inputImg = document.getElementById("image-file");
    formData.append('image', inputImg.files[0]);
    formData.append('startDate', toISODate(document.getElementById("start-work-day").value.trim()))

    try{
      const res = await fetch('http://localhost:3000/api/auth/create-account', {
        method: 'POST',
        body: formData
      });
      const data_res = await res.json();
      console.log(data_res);
      if (!res.ok) throw new Error(data_res.message);
      
      showSuccessModal(
        "THÊM NHÂN VIÊN",
        `Thêm nhân viên <b>${data_res.data.fullName}</b> thành công!`,
        [
          {
            text: 'Xem danh sách',
            link: 'staff.html'
          },
          {
            text: 'Thêm nhân viên',
            link: 'addStaff.html'
            
          }
        ]
      )
    }
    catch(err) {
      // alert('Lỗi khi gửi dữ liệu: ' + err.message);
      showModalError("THÊM NHÂN VIÊN", `Lỗi khi thêm nhân viên: ${err.message}`);
    }
    
  })

  
});



