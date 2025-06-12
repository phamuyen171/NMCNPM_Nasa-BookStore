import { renderPagination } from "../../components/js/pagination.js";

async function getFilteredCustomer(type="retail"){
  const response = await fetch(`http://localhost:3000/api/customers/filter-customer/${type}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
  });


  const data = await response.json();
  if (!response.ok){
    throw new Error (data.message);
  }

  if (!data || !data.data){
    throw new Error('Không tồn tại khách hàng nào');
  }

  return data.data;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}

let htmlByType = {
    'retail': `
    <div class="table-responsive">
      <table class="table table-bordered text-center table-hover">
        <thead class="table-primary">
          <tr>
            <th>SĐT TÍCH ĐIỂM</th>
            <th>HỌ VÀ TÊN</th>
            <th>NGÀY TẠO TÀI KHOẢN</th>
            <th>NGÀY RESET GẦN NHẤT</th>
            <th>TỔNG ĐIỂM TÍCH LŨY</th>
          </tr>
        </thead>
        <tbody>
  ` ,
    'wholesale': `
    <div class="table-responsive">
      <table class="table table-bordered text-center table-hover">
        <thead class="table-primary">
          <tr>
            <th>TÊN ĐƠN VỊ</th>
            <th>MÃ SỐ THUẾ</th>
            <th>ĐỊA CHỈ</th>
            <th>SĐT NGƯỜI ĐẠI DIỆN</th>
            <th>TÊN NGƯỜI ĐẠI DIỆN</th>
            <th>CHIẾT KHẤU</th>
            <th>GHI CHÚ</th>
          </tr>
        </thead>
        <tbody>
  `
};

function createTable(customers, type='retail') {
  if (customers.length === 0) {
    return `<p class="text-muted">Không tìm thấy khách hàng phù hợp.</p>`;
  }

  let html = htmlByType[type];

  customers.forEach(customer => {
    if (type === 'retail'){
        html += `
        <tr>
            <td>${customer.phone}</td>
            <td>${customer.name}</td>
            <td>${formatDate(customer.createdAt)}</td>
            <td>${formatDate(customer.resetAt)}</td>
            <td>${customer.points}</td>
        </tr>
        `;
    }
    else{
        html += `
        <tr>
            <td>${customer.companyName}</td>
            <td>${customer.taxId}</td>
            <td>${customer.address}</td>
            <td>${customer.phone}</td>
            <td>${customer.name}</td>
            <td>${customer.discountPercentage}%</td>
            <td>
            <div>
                <-- thông báo nợ xấu? -->
            </div>
            </td>
        </tr>
        `;
    }
    
    
  });

  html += `</tbody></table></div>`;
  return html;
}

function renderTable(staffs, type='retail') {
  const container = document.getElementById("customers-container");
  container.innerHTML = createTable(staffs, type);
}

function searchCustomer(allCustomers, type='retail'){
    document.getElementById("search-customer").addEventListener("input", function () {
      const keyword = this.value.trim().toLowerCase();
      let filtered = allCustomers.filter(customer =>
        customer.name.toLowerCase().includes(keyword) ||
        customer.phone.toLowerCase().includes(keyword)
      );
      if (type === 'wholesale'){
        filtered = filtered.filter(customer => 
            customer.companyName.toLowerCase().includes(keyword) ||
            customer.taxId.toLowerCase().includes(keyword)
        )
      }
      renderTableByPage(filtered, currentPage, type);
    });
}

function renderTableByPage(data, page, type='retail') {
  currentPage = page;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedCustomers = data.slice(start, end);

  renderTable(paginatedCustomers, type);
  renderPagination(data.length, pageSize, currentPage, (newPage) => {
    renderTableByPage(data, newPage, type);
  });
}

let currentPage = 1;
const pageSize = 8;

async function printList(type='retail') {
    try{
        let allCustomers = await getFilteredCustomer(type);

        const text = document.getElementById('notice-text');
        if (text){
          if (type === 'retail'){
            text.innerHTML = "DANH SÁCH KHÁCH HÀNG BÁN LẺ"
          }
          else {
            text.innerHTML = "DANH SÁCH ĐƠN VỊ - ĐẠI LÝ"
          }
        }

        renderTableByPage(allCustomers, currentPage, type);

        document.addEventListener("click", function (e) {
            const row = e.target.closest("tr");
            if (!row || !row.parentElement.matches("tbody")) return;

            document.querySelectorAll("tbody tr").forEach(tr => tr.classList.remove("selected"));
            
            row.classList.add("selected");
        });
        searchCustomer(allCustomers, type);
    
    }
    catch (error){
        showModalError("LỖI IN DANH SÁCH KHÁCH HÀNG", error.message)
    }
}

async function resetPoints(){
    let resetAt;
    let today = new Date();
    let retailCustomers;
    try{
        retailCustomers = await getFilteredCustomer('retail');
    } catch (error){
        showModalError("LỖI RESET MẬT KHẨU", "Không lấy được ngày reset gần nhất.");
    }
    resetAt = new Date(retailCustomers[0].resetAt);
    if (!resetAt){
        return;
    }
    if (resetAt.getFullYear() === today.getFullYear() && resetAt.getMonth() === today.getMonth() && resetAt.getDate() === today.getDate()){
        // fetch api
        const response = await fetch(`http://localhost:3000/api/customers/reset-points`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        });


        const data = await response.json();
        if (!response.ok){
            showModalError("LỖI RESET MẬT KHẨU", data.message);
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    printList('retail');
    const buttons = document.querySelectorAll('.filter-button');

    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            buttons.forEach(b => b.classList.remove('active', 'inactive'));
            buttons.forEach(b => b.classList.add('inactive'));

            btn.classList.remove('inactive');
            btn.classList.add('active');

            const type = btn.dataset.type;

            printList(type);
        });
    });

    resetPoints();
});


