let originalStaff = null;
let isChanged = false;
let tryingToLeave = false;

document.addEventListener("DOMContentLoaded", () => {
  const staff = JSON.parse(localStorage.getItem("selectedStaff"));
  if (!staff) return;

  originalStaff = staff;

  // Đổ dữ liệu vào form
  document.getElementById("username").value = staff.username || "";
  document.getElementById("name").value = staff.fullName || "";
  document.getElementById("cccd").value = staff.CCCD || "";
  document.getElementById("email").value = staff.email || "";
  document.getElementById("address").value = staff.address || "";

  const roleSelect = document.getElementById("chucvu-select");
  if (staff.role === "Cửa hàng trưởng" || staff.role === "manager") {
    roleSelect.value = "manager";
  } else if (staff.role === "Nhân viên bán hàng" || staff.role === "staff") {
    roleSelect.value = "staff";
  } else if (staff.role === "Kế toán" || staff.role === "accountant") {
    roleSelect.value = "accountant";
  }

  // Gắn sự kiện thay đổi
  ["name", "address", "cccd", "email", "chucvu-select"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => isChanged = true);
  });

  // Bấm nút "Cập Nhật"
  document.getElementById("update-account").addEventListener("click", () => {
    const current = {
      fullName: document.getElementById("name").value.trim(),
      address: document.getElementById("address").value.trim(),
      CCCD: document.getElementById("cccd").value.trim(),
      email: document.getElementById("email").value.trim(),
      role: document.getElementById("chucvu-select").value
    };

    const noChange =
    current.fullName === originalStaff.fullName &&
    current.address === originalStaff.address &&
    current.CCCD === originalStaff.CCCD &&
    current.email === originalStaff.email &&
    current.role === originalStaff.role;

    if (noChange) {
      showNoChangeModal();
    } else {
      const staffId = originalStaff._id; // sử dụng _id từ localStorage

      fetch(`http://localhost:3000/api/staff/update-staff/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current)
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          isChanged = false;
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
      })
      .catch(err => {
        showModalError("LỖI", `Không thể kết nối đến server: ${err.message}`);
        console.error(err);
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

