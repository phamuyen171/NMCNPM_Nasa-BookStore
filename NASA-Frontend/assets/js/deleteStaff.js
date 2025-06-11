import { renderPagination } from "../../components/js/pagination.js";

// ============================================IN DANH SÁCH==================================================
async function getAllStaffs(){
  const response = await fetch('http://localhost:3000/api/staff/get-all-staffs', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
  });

  const text = await response.text();

  if (!response.ok){
    throw new Error (response.statusText);
  }

  let data;
  try{
    data = JSON.parse(text);
  }
  catch {
    throw new Error("Không thể phân tích phản hồi từ server");
  }

  if (!data || !data.data){
    throw new Error('Không tồn tại nhân viên nào');
  }

  return data.data;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}

function createTable(staffs) {
  if (staffs.length === 0) {
    return `<p class="text-muted">Không tìm thấy nhân viên phù hợp.</p>`;
  }

  let html = `
    <div class="table-responsive">
      <table class="table table-bordered text-center table-hover">
        <thead class="table-primary">
          <tr>
            <th>MÃ NHÂN VIÊN</th>
            <th>HỌ VÀ TÊN</th>
            <th>CHỨC VỤ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
  `;

  staffs.forEach(staff => {
    html += `
      <tr>
        <td>${staff.username}</td>
        <td>${staff.fullName}</td>
        <td>${staff.role}</td>
        <td><button class="btn btn-delete" data-username="${staff.username}" data-role="${staff.role}">Xoá</button></td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  return html;
}

function renderTable(staffs) {
  const container = document.getElementById("staffs-container");
  container.innerHTML = createTable(staffs);
}

function renderTableByPage(data, page) {
  currentPage = page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedStaffs = data.slice(start, end);

  renderTable(paginatedStaffs);
  renderPagination(data.length, pageSize, currentPage, (newPage) => {
    renderTableByPage(data, newPage);
  });
}

let currentPage = 1;
const pageSize = 7;
let allStaffs = [];
let selectedToDelete = null;

document.addEventListener("DOMContentLoaded", async function () {
  try {
    allStaffs = await getAllStaffs();
    renderTableByPage(allStaffs, currentPage);
  } catch (error) {
    showModalError("LỖI IN DANH SÁCH NHÂN VIÊN", error.message);
  }
});

// Bấm chọn dòng để làm nổi bật
document.addEventListener("click", function (e) {
  const row = e.target.closest("tr");
  if (!row || !row.parentElement.matches("tbody")) return;

  document.querySelectorAll("tbody tr").forEach(tr => tr.classList.remove("selected"));
  row.classList.add("selected");
});

// ==============================XỬ LÝ NÚT XOÁ===========================================
// Xử lý xoá nhân viên
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-delete")) {
    const username = e.target.dataset.username;
    const role = e.target.dataset.role;

    selectedToDelete = username;

    const sameRoleCount = allStaffs.filter(s => s.role === role).length;

    if (sameRoleCount <= 1) {
      const modal = new bootstrap.Modal(document.getElementById("noReplacementModal"));
      modal.show();
    } else {
      const modal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
      modal.show();
    }
  }
});

// Xác nhận xoá
document.getElementById("confirmDeleteBtn").addEventListener("click", async function () {
  if (!selectedToDelete) return;

  try {
    const res = await fetch(`http://localhost:3000/api/staff/delete/${selectedToDelete}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal")).hide();

    const successModal = new bootstrap.Modal(document.getElementById("deleteSuccessModal"));
    successModal.show();

    allStaffs = await getAllStaffs(); // cập nhật lại
    renderTableByPage(allStaffs, currentPage);

  } catch (err) {
    showModalError("LỖI XOÁ NHÂN VIÊN", err.message);
  }
});

// Tìm kiếm
document.getElementById("search-staff").addEventListener("input", function () {
  const keyword = this.value.trim().toLowerCase();
  const filtered = allStaffs.filter(staff =>
    staff.username.toLowerCase().includes(keyword) ||
    staff.fullName.toLowerCase().includes(keyword)
  );
  renderTableByPage(filtered, 1);
});




