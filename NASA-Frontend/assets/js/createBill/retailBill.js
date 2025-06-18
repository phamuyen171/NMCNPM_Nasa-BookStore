// ===================================BẢNG 1: DANH SÁCH===========================================

let booksData = [];         // Dữ liệu gốc từ API
let filteredBooks = [];     // Dữ liệu sau khi tìm kiếm
let currentPage = 0;
const itemsPerPage = 4;
const invoiceItems = {};

let checkErrorQuantity = false;
let checkStaffId = false;
let isCheckingStaff = false;


// Hàm render trang
function renderPage() {
  const grid = document.getElementById('product-grid');
  grid.innerHTML = '';

  const start = currentPage * itemsPerPage;
  const end = Math.min(start + itemsPerPage, filteredBooks.length);
  const pageItems = filteredBooks.slice(start, end);

  for (let i = 0; i < pageItems.length; i += 2) {
    const row = document.createElement('div');

    // Nếu chỉ còn 1 sách, căn giữa theo chiều ngang
    if (pageItems.length === 1) {
        const row = document.createElement('div');
        row.className = 'row justify-content-center mt-0'; // loại bỏ margin top dư thừa

        const col = document.createElement('div');
        col.className = 'col-md-6 d-flex justify-content-center';

        const book = pageItems[0];
        col.innerHTML = `
        <div class="product-box mb-2 book-item"
            data-id="${book._id}"
            data-title="${book.title}"
            data-author="${book.author}"
            data-sales="${book.soldQuantity}"
            data-quantity="${book.quantity}"
            data-price="${book.price}"
            data-image="${book.image}"
          >
          <img src="${book.image}" alt="${book.title}">
          <div class="product-info">
            <strong>${book.title}</strong>
            <div class="pb-1">(${book.author})</div>
            <div>Đã bán: ${book.soldQuantity}</div>
            <div>Số lượng: ${book.quantity}</div>
            <div class="product-price">${Number(book.price).toLocaleString()} $</div>
          </div>
        </div>
        `;

        row.appendChild(col);
        grid.appendChild(row);
    
    } else {
        row.className = 'row gy-3 justify-content-center';

        for (let j = 0; j < 2; j++) {
        const book = pageItems[i + j];
        const col = document.createElement('div');
        col.className = 'col-md-6';

        col.innerHTML = `
        <div class="product-box mb-2 book-item"
            data-id="${book._id}"
            data-title="${book.title}"
            data-author="${book.author}"
            data-soldQuantity = "${book.soldQuantity}"
            data-quantity="${book.quantity}"
            data-price="${book.price}"
            data-image="${book.image}"
          >
          <img src="${book.image}" alt="${book.title}">
          <div class="product-info">
            <div class="book-title"><strong>${book.title}</strong></div>
            <div class="pb-1">(${book.author})</div>
            <div>Số lượng: ${book.quantity}</div>
            <div>Đã bán: ${book.soldQuantity}</div>
            <div class="product-price">${Number(book.price).toLocaleString()} $</div>
          </div>
        </div>
        `;
        row.appendChild(col);
        }
    }
      grid.appendChild(row);
    }

  // GẮN SỰ KIỆN CLICK SAU KHI RENDER
  document.querySelectorAll('.book-item').forEach(item => {
    item.addEventListener('click', () => {
      const book = {
        _id: item.dataset.id,
        name: item.dataset.title,
        price: parseFloat(item.dataset.price),
        quantity: parseInt(item.dataset.quantity)
      };
      addToInvoice(book);
    });
  });
  
  // Ẩn/hiện nút mũi tên
  const prevBtn = document.querySelector('button[onclick="prevPage()"]');
  const nextBtn = document.querySelector('button[onclick="nextPage()"]');

  prevBtn.style.visibility = currentPage === 0 ? 'hidden' : 'visible';
  nextBtn.style.visibility = (currentPage + 1) * itemsPerPage >= filteredBooks.length ? 'hidden' : 'visible';
}

// Mũi tên bên phải
function nextPage() {
  if ((currentPage + 1) * itemsPerPage < filteredBooks.length) {
    currentPage++;
    renderPage();
  }
}

// Mũi tên bên trái
function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    renderPage();
  }
}

// Xử lý tìm kiếm
function handleSearch(event) {
  const keyword = event.target.value.toLowerCase().trim();
  filteredBooks = booksData.filter(book =>
    book.title.toLowerCase().includes(keyword)
  );
  currentPage = 0;
  renderPage();
}

// Gọi API khi trang tải
document.addEventListener("DOMContentLoaded", async function () {
  let totalPages = 1;
  let totalBooks = 0;
  let limitbe = 0;

  try {
    const response = await fetch(`http://localhost:3000/api/books?page=1`);
    const result = await response.json();

    if (result.success) {
      totalBooks = result.data.total;
      limitbe = result.data.limit;
      booksData.push(result.data.books);

      totalPages = Math.ceil(totalBooks / limitbe);
    } else {
      console.error("Không lấy được dữ liệu trang 1");
      return;
    }

    for (let i = 2; i <= totalPages; i++) {
      const res = await fetch(`http://localhost:3000/api/books?page=${i}`);
      const data = await res.json();

      if (data.success) {
        booksData.push(data.data.books);
      } else {
        console.warn(`Không lấy được trang ${i}`);
      }
    }

    booksData = booksData.flat();
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
  }
  
  filteredBooks = booksData;
  renderPage();

  // Bắt sự kiện gõ vào ô tìm kiếm
  document.getElementById('search-input-books').addEventListener('input', handleSearch);

  //Thêm sự kiện cho staff-code ở đây
  const staffInput = document.getElementById('staff-code');
  const continueBtn = document.getElementById('continue-btn');

  staffInput.addEventListener('keydown', async (event) => {
    let code;
    if (event.key === 'Enter'){
      code = staffInput.value.trim();
      if (code === ''){
        continueBtn.classList.remove('valid-continue-btn');
        continueBtn.classList.add('disabled-link');
        return;
      }

      if (isCheckingStaff) return;
      isCheckingStaff=true;

      try{
        const response = await fetch(`http://localhost:3000/api/staff/check-staff-exist/${code}`);
        if (!response.ok){
          throw new Error("Sai mã nhân viên");
        }
        checkStaffId = true;
      } catch (error){
        showModalError("LỖI TẠO HÓA ĐƠN", 'Mã nhân viên không tồn tại. Hãy nhập đúng mã nhân viên của bạn!');
        checkStaffId = false;
      }
      isCheckingStaff=false
      canDisabledButton(invoiceItems, checkStaffId);
    }
  });
  // Kiểm tra lại khi người dùng rời khỏi ô nhập
  staffInput.addEventListener('blur', async () => {
    const code = staffInput.value.trim();
    if (code === '') {
      checkStaffId = false;
      canDisabledButton(invoiceItems, checkStaffId);
      return;
    }

    if (isCheckingStaff) return;
    isCheckingStaff = true;

    try {
      const response = await fetch(`http://localhost:3000/api/staff/check-staff-exist/${code}`);
      if (!response.ok) {
        throw new Error("Sai mã nhân viên");
      }
      checkStaffId = true;
    } catch (error) {
      showModalError("LỖI TẠO HÓA ĐƠN", 'Mã nhân viên không tồn tại. Hãy nhập đúng mã nhân viên của bạn!');
      checkStaffId = false;
    }
    isCheckingStaff = false;
    canDisabledButton(invoiceItems, checkStaffId);
  });


  // Ngăn chặn chuyển trang nếu chưa nhập mã
  continueBtn.addEventListener('click', (e) => {
    const code = staffInput.value.trim();
    if (code === '') {
      e.preventDefault();
    }

    //Lưu mã nhân viên vào localStorage
    localStorage.setItem('staffCode', code);

    // Chuẩn bị dữ liệu hóa đơn
    const invoiceData = [];
    for (const id in invoiceItems) {
      const item = invoiceItems[id];
      invoiceData.push({
        title: item.book.name,
        price: item.book.price,
        quantity: item.quantity,
        total: item.book.price * item.quantity
      });
    }

    // Tổng số lượng và tổng tiền
    const totalQty = invoiceData.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = invoiceData.reduce((sum, item) => sum + item.total, 0);

    // Lưu vào localStorage
    localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
    localStorage.setItem('totalQty', totalQty);
    localStorage.setItem('totalPrice', totalPrice);
  });
});

// Gắn vào window để HTML có thể gọi
window.nextPage = nextPage;
window.prevPage = prevPage;

// ==========================================BẢNG 2: CHI TIẾT==============================================
  
function formatCurrency(number) {
  return Number(number).toLocaleString('vi-VN');
}

function addToInvoice(book) {
  // console.log("Thêm sách với ID:", book);
  if (invoiceItems[book._id]) {
    showModalError("LỖI TẠO HÓA ĐƠN", `Sách <b>${book.name}</b> đã được chọn.`);
    return; // tránh trùng sách
  }

  const container = document.getElementById('invoice-items');

  const row = document.createElement('div');
  row.className = 'invoice-item w-100 mb-2';
  row.dataset.bookId = book._id;

  row.innerHTML = `
    <div class="invoice-row d-grid align-items-center w-100"
        style="grid-template-columns: 40px 1fr 100px 80px; gap: 10px;">
        <button class="btn btn-sm remove-item">X</button>
        <span class="book-title">${book.name}</span>
        <input type="text" class="form-control text-end price" value="${book.price}" disabled />
        <input type="number" class="form-control text-end quantity" value="1" min="1" max="${book.quantity}" />
    </div>
    <div class="error-msg text-danger small" style="display: none; grid-column: span 4; padding-left: 50px;">
        Vượt quá số lượng tồn kho (${book.quantity})
    </div>
  `;

  container.appendChild(row);
  invoiceItems[book._id] = { book, quantity: 1 };

  updateTotals();

  // Xử lý xóa
  row.querySelector('.remove-item').onclick = () => {
    delete invoiceItems[book._id];
    row.remove();
    updateTotals();
    canDisabledButton(invoiceItems, checkStaffId);
  };

  // Xử lý nhập số lượng
  const qtyInput = row.querySelector('.quantity');
  const errorMsg = row.querySelector('.error-msg');

  qtyInput.addEventListener('input', () => {
    const val = parseInt(qtyInput.value);
    if (isNaN(val) || val < 1) {
      qtyInput.value = 1;
      errorMsg.style.display = 'none';
    } else if (val > book.quantity) {
      errorMsg.style.display = 'block';
      invoiceItems[book._id].quantity = val
    } else {
      errorMsg.style.display = 'none';
      invoiceItems[book._id].quantity = val;
      updateTotals();
    }

    canDisabledButton(invoiceItems, checkStaffId);
  });
}

function updateTotals() {
  let totalQty = 0, subtotal = 0;
  for (const id in invoiceItems) {
    const item = invoiceItems[id];
    totalQty += parseInt(item.quantity);
    subtotal += item.quantity * item.book.price;
  }
  document.getElementById('total-quantity').innerText = totalQty;
  document.getElementById('subtotal').innerText = formatCurrency(subtotal);
}

function canDisabledButton(invoiceItems, checkStaffId){
  const continueBtn = document.getElementById('continue-btn');
  if (Object.keys(invoiceItems).length === 0 || !checkStaffId){
    continueBtn.classList.remove('valid-continue-btn');
    continueBtn.classList.add('disabled-link');
    return;
  }
  checkErrorQuantity = Object.values(invoiceItems).some(book => {
    return book.quantity > book.book.quantity;
  });
  // const continueBtn = document.getElementById('continue-btn');
  if (checkErrorQuantity) {
    continueBtn.classList.remove('valid-continue-btn');
    continueBtn.classList.add('disabled-link');
  } else {
    continueBtn.classList.remove('disabled-link');
    continueBtn.classList.add('valid-continue-btn');
  }
}