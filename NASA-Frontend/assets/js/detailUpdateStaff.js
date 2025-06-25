let originalStaff = null;
let isChanged = false;
let tryingToLeave = false;
let noChange = true; // Biến để kiểm tra xem có thay đổi gì không

function formatDate(dateStr) {
    const date = new Date(dateStr);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng tính từ 0
    const year = String(date.getFullYear()); // Lấy 2 số cuối

    return `${day}/${month}/${year}`;
}

function toISODate(ddmmyyyy) {
  let [day, month, year] = ddmmyyyy.split('/');
  if (!day || !month || !year) {
    [day, month, year] = ddmmyyyy.split('-');
  }
  return new Date(year, month -1, day);
}


document.addEventListener("DOMContentLoaded", () => {
  const staff = JSON.parse(localStorage.getItem("selectedStaff"));
  if (!staff) return;

  originalStaff = staff;

  // Đổ dữ liệu vào form
  document.getElementById("manv").value = staff.username || "";
  document.getElementById("username").value = staff.username || "";
  document.getElementById("password").value = "NASA@" + staff.CCCD.slice(-4) || ""; 
  document.getElementById("cccd").value = staff.CCCD || "";
  document.getElementById("email").value = staff.email || "";
  document.getElementById("address").value = staff.address || "";
  document.getElementById("phone").value = staff.phone || "";
  document.getElementById("birth").value = staff.DoB ? formatDate(staff.DoB) : "";
  document.getElementById("start-work-day").value = formatDate(staff.startDate) || "";
  document.getElementById("name").value = staff.fullName || "";
  const imageId = staff.image; // ID từ MongoDB
  if (imageId) {
    const imageUrl = `http://localhost:3000/api/image/${imageId}`; 
    document.getElementById("preview-image").src = imageUrl;
    document.getElementById("preview-image").style.display = "block";
    document.getElementById("placeholder").style.display = "none";
  }

  const roleSelect = document.getElementById("chucvu-select");
  if (staff.role === "Cửa hàng trưởng" || staff.role === "manager") {
    roleSelect.value = "manager";
  } else if (staff.role === "Nhân viên bán hàng" || staff.role === "staff") {
    roleSelect.value = "staff";
  } else if (staff.role === "Kế toán" || staff.role === "accountant") {
    roleSelect.value = "accountant";
  }

  // Gắn sự kiện thay đổi
  let cccd;
  ["name", "address", "cccd", "phone", "chucvu-select", "birth"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => {
      isChanged = true;
      cccd = document.getElementById("cccd").value.trim();
      if (id === "cccd") {
        document.getElementById("password").value = "NASA@" + cccd.slice(-4) || "";
      }
      if (id === "chucvu-select") {
        if (roleSelect.value === originalStaff.role) {
          document.getElementById("manv").value = originalStaff.username || "";
          document.getElementById("username").value = originalStaff.username || "";
          document.getElementById("email").value = originalStaff.email || "";
        }
        else{
          fetch("http://localhost:3000/api/staff/fill-staff-auto", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              role: roleSelect.value,
              CCCD: cccd,
              startDate: toISODate(document.getElementById("start-work-day").value.trim())
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
        }
      }
    });
  });

  document.getElementById('image-file').addEventListener('change', function (event) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user.username === originalStaff.username){
      showModalError("LỖI CẬP NHẬP NHÂN VIÊN", "Cập nhập hình ảnh bản thân trong trang cá nhân!");
      return;
    }
    noChange = false;
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const previewImage = document.getElementById('preview-image');
      previewImage.src = e.target.result;
      previewImage.style.display = 'block';
      document.getElementById('placeholder').style.display = 'none';
    };

    reader.readAsDataURL(file); // đọc file ảnh thành base64
  });


  // Bấm nút "Cập Nhật"
  document.getElementById("update-account").addEventListener("click", () => {
    const current = {
      fullName: document.getElementById("name").value.trim(),
      address: document.getElementById("address").value.trim(),
      CCCD: document.getElementById("cccd").value.trim(),
      email: document.getElementById("email").value.trim(),
      role: document.getElementById("chucvu-select").value,
      phone: document.getElementById("phone").value.trim(),
      DoB: document.getElementById("birth").value.trim(),
      username: document.getElementById("username").value.trim(),
      password: document.getElementById("password").value.trim(),
      startDate: toISODate(document.getElementById("start-work-day").value.trim())
    };

    noChange = noChange &&
    current.fullName === originalStaff.fullName &&
    current.address === originalStaff.address &&
    current.CCCD === originalStaff.CCCD &&
    current.email === originalStaff.email &&
    current.phone === originalStaff.phone &&
    toISODate(document.getElementById("birth").value.trim()).toISOString() === originalStaff.DoB &&
    toISODate(document.getElementById("start-work-day").value.trim()).toISOString() === originalStaff.startDate &&
    current.role === originalStaff.role;

    console.log(current);
    // console.log("No change:", current.DoB, originalStaff.DoB);
    if (noChange) {
      showNoChangeModal();
    } else {
      const staffId = originalStaff._id; // sử dụng _id từ localStorage

      showModalConfirm("CẬP NHẬP THÔNG TIN NHÂN VIÊN", `cập nhập nhân viên <b>${current.fullName}</b>`, "", async () => {
          if (Object.keys(current).length !== 0) {
            fetch(`http://localhost:3000/api/staff/update-staff/${staffId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ current})
            })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                isChanged = false;
                if (!document.getElementById("image-file").files[0]) {
                  showSuccessModal(
                    "Cập nhật thông tin nhân viên",
                    `Cập nhật thông tin nhân viên <b>${staff.fullName}</b> thành công!`,
                    [
                      {
                        text: 'Xem danh sách',
                        link: 'staff.html'
                      },
                      {
                        text: 'Cập nhật nhân viên khác',
                        link: 'updateStaff.html'
                        
                      }
                    ]
                  )
                }
                
              }
            })
            .catch(err => {
              showModalError("LỖI", `Không thể kết nối đến server: ${err.message}`);
              console.error(err);
              return;
            });
          }

          if (!document.getElementById("image-file").files[0]) {
            // Nếu không có file ảnh mới, chỉ cập nhật thông tin
            return;
          }
          const formData = new FormData();
          const inputImg = document.getElementById("image-file");
          formData.append('image', inputImg.files[0]);
          formData.append('startDate', toISODate(document.getElementById("start-work-day").value.trim()));
          fetch(`http://localhost:3000/api/staff/update-staff-image/${staffId}`, {
            method: "PUT",
            body: formData
          })
          .then(res => res.json())
          .then(data => {
            if (!data.success) {
              throw new Error(data.message || "Không thể cập nhật ảnh đại diện");
            }
            showSuccessModal(
                "Cập nhật thông tin nhân viên",
                `Cập nhật thông tin nhân viên <b>${staff.fullName}</b> thành công!`,
                [
                  {
                    text: 'Xem danh sách',
                    link: 'staff.html'
                  },
                  {
                    text: 'Cập nhật nhân viên khác',
                    link: 'updateStaff.html'
                    
                  }
                ]
              )
          })
          .catch(err => {
            showModalError("LỖI", `${err.message}`);
            console.error(err);
            return;
          });
      });
    }
  });


  // Ngăn rời trang nếu có thay đổi chưa lưu
  window.addEventListener("beforeunload", function (e) {
    if (isChanged && !tryingToLeave) {
      e.preventDefault();
      e.returnValue = '';
      showUnsavedModal();
      return '';
    }
  });

  // Xử lý nút trong modal cảnh báo thoát
  document.getElementById("stayOnPage").addEventListener("click", () => {
    tryingToLeave = false;
  });

  document.getElementById("discardChanges").addEventListener("click", () => {
    tryingToLeave = true;
    window.removeEventListener("beforeunload", () => {});
    window.location.href = "./updateStaff.html";
  });

  // Xử lý modal "không có cập nhật"
  document.getElementById("cancelUpdate").addEventListener("click", () => {
    window.location.href = "./updateStaff.html";
  });
});

function showNoChangeModal() {
  const modal = new bootstrap.Modal(document.getElementById("noChangeModal"));
  modal.show();
}

function showUnsavedModal() {
  const modal = new bootstrap.Modal(document.getElementById("unsavedModal"));
  modal.show();
}

