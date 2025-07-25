import { renderPagination } from "../../components/js/pagination.js";

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
    const date = new Date(dateStr);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng tính từ 0
    const year = String(date.getFullYear()); // Lấy 2 số cuối

    return `${day}/${month}/${year}`;
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
            <th>MÃ NV</th>
            <th>HỌ VÀ TÊN</th>
            <th>NGÀY SINH</th>
            <th>CHỨC VỤ</th>
            <th>EMAIL</th>
            <th>SỐ ĐIỆN THOẠI</th>
            <th class="hide">CCCD</th>
            <th class="hide">MẬT KHẨU</th>
            <th class="hide">TÌNH TRẠNG</th>
            <th class="hide"></th>
          </tr>
        </thead>
        <tbody>
  `;

  staffs.forEach(staff => {
    let role;
    if (staff.role === "manager"){
      role = "Cửa hàng trưởng";
    } else if (staff.role === "staff"){
      role = "Nhân viên bán hàng";
    } else {
      role = "Kế toán";
    }
    // console.log(staff._id);
    html += `
      <tr>
        <td>${staff.username}</td>
        <td>${staff.fullName}</td>
        <td>${formatDate(staff.DoB)}</td>
        <td>${role }</td>
        <td>${staff.email}</td>
        <td>${staff.phone}</td>
        <td class="hide">${staff.CCCD}</td>
        <td class="hide"><div class="reset-password" data-username="${staff.username}" data-name="${staff.fullName}" style="text-decoration: underline;">Reset</div></td>
        <td class="hide">
          <div class="change-status" data-id="${staff._id}" data-name="${staff.fullName}" data-value="${staff.status}">
            ${staff.status === "inactive"
              ? `<span class="badge bg-danger">Đã sa thải</span>`
              : `<span class="badge bg-success">Đang làm việc</span>`
            }
          </div>
        </td>
        <td class="hide">
          <div class="delete-staff" data-id="${staff._id}" data-name="${staff.fullName}" style="text-decoration: underline;">Xóa</div>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  return html;
}

function renderTable(staffs) {
  const container = document.getElementById("staffs-container");
  container.innerHTML = createTable(staffs);
  const user = JSON.parse(localStorage.getItem("user"));
  if (user.role !== "manager"){
    document.querySelectorAll(".hide").forEach(hide => {
      hide.style.display = "none";
    });
  }
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
const pageSize = 8;

document.addEventListener("DOMContentLoaded", async function () {
  try{
    const user = JSON.parse(localStorage.getItem("user"));
    if (user.role !== "manager"){
      document.getElementById("add-staff-btn").style.display = "none";
      document.getElementById("update-staff-btn").style.display = "none";
    }
    let allStaffs = await getAllStaffs();

    renderTableByPage(allStaffs, currentPage);

    //sự kiện click vào các dòng
    document.addEventListener("click", function (e) {
        const row = e.target.closest("tr");
        if (!row || !row.parentElement.matches("tbody")) return;

        // Xóa class 'selected' khỏi tất cả hàng
        document.querySelectorAll("tbody tr").forEach(tr => tr.classList.remove("selected"));
        
        // Thêm class 'selected' cho hàng được click
        row.classList.add("selected");
    });

    // Lắng nghe sự kiện nhập vào ô tìm kiếm
    document.getElementById("search-staff").addEventListener("input", function () {
      const keyword = this.value.trim().toLowerCase();
      const filtered = allStaffs.filter(staff =>
        staff.fullName.toLowerCase().includes(keyword) ||
        staff.username.toLowerCase().includes(keyword)
      );
      renderTableByPage(filtered, currentPage);
    });
  }
  catch (error){
    showModalError("LỖI IN DANH SÁCH NHÂN VIÊN", error.message)
  }

});

