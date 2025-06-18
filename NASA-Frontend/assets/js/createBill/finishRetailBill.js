// Xử lý dữ liệu phẩn hoá đơn
window.addEventListener('DOMContentLoaded', async () => {
  // IN Thời gian hiện tại
  const now = new Date();

  // Format: dd-mm-yyyy hh:mm:ss
  const pad = num => String(num).padStart(2, '0');
  const formattedDate = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ` +
                        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  document.getElementById('ngay-tao').innerText = formattedDate;


  const staffCode = localStorage.getItem('staffCode') || '';
  // Lấy mã hóa đơn
  try {
    const resInvoice = await fetch(`http://localhost:3000/api/invoices/create-invoice-id/retail`, {
      method: "POST"
    }); // Gọi API tạo mã hoá đơn mới
    const invoiceData = await resInvoice.json();
    if (!invoiceData.success){
      console.error('Không thể tạo mã hóa đơn mới');
      return;
    }
    document.getElementById('ma-hoa-don').innerText = invoiceData.invoiceID;
  } catch (error) {
    console.error('Lỗi khi lấy mã hoá đơn:', error);
    document.getElementById('ma-hoa-don').innerText = 'Lỗi tải mã';
  }

  // Lấy thông tin nhân viên theo staffCode
  if (staffCode) {
    try {
      const resStaff = await fetch(`http://localhost:3000/api/staff/check-staff-exist/${staffCode}`); // Gọi API lấy nhân viên
      const staffData = await resStaff.json();
      if (!staffData){
        console.error('Lỗi không tìm thấy nhân viên');
        return;
      }
      document.getElementById('nhan-vien').innerText = `${staffData.data.fullName} - ${staffData.data.username}`;
    } catch (error) {
      console.error('Lỗi khi lấy nhân viên:', error);
      document.getElementById('nhan-vien').innerText = `Không xác định - ${staffCode}`;
    }
  } else {
    document.getElementById('nhan-vien').innerText = 'Không có mã nhân viên';
  }

  //================= In ra danh sách sản phẩm =================================
  const invoiceData = JSON.parse(localStorage.getItem('invoiceData')) || [];
  const totalQty = localStorage.getItem('totalQty') || 0;
  const totalPrice = localStorage.getItem('totalPrice') || 0;

  const tbody = document.querySelector('#invoice-table tbody');
  invoiceData.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.title}</td>
      <td>${item.price.toLocaleString()}$</td>
      <td>${item.quantity}</td>
      <td>${item.total.toLocaleString()}$</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('total-qty').innerText = totalQty;
  document.getElementById('total-price').innerText = totalPrice.toLocaleString() + '$';

  //========================== Xử lý Tạo mới và Bỏ qua ===============================================
  const customerBox = document.getElementById('customer-info');
  const skipMsg = document.getElementById('skip-message');
  const infoFields = document.getElementById('info-fields');
  let phoneInput = document.getElementById('phone-number');
  let nameInput = document.getElementById('name');
  let pointsInput = document.getElementById('points');

  document.getElementById('btn-tao-moi').addEventListener('click', () => {
    // Reset giao diện về trạng thái nhập tay
    customerBox.style.backgroundColor = '';
    skipMsg.style.display = 'none';
    infoFields.style.display = 'block';

    // Cho phép người dùng nhập tên & SĐT
    phoneInput.disabled = false;
    nameInput.disabled = false;
    pointsInput.disabled = true; // vẫn để điểm là 0 mặc định

    // Reset nội dung các ô
    phoneInput.value = '';
    nameInput.value = '';
    pointsInput.value = 0;
  });

  document.getElementById('btn-bo-qua').addEventListener('click', () => {
    const infoFields = document.getElementById('info-fields');
    const skipMsg = document.getElementById('skip-message');
    const skipSection = document.getElementById('skip-section');
    const customerBox = document.getElementById('customer-info');
    const continueBtn = document.querySelector('.btn-continue');

    if (infoFields) infoFields.classList.add('d-none');
    if (skipSection) skipSection.classList.add('d-none');
    if (skipMsg) skipMsg.classList.remove('d-none');
    customerBox.style.backgroundColor = '#d9d9d9';
    if (continueBtn) continueBtn.innerText = 'TẠO HÓA ĐƠN';
    document.getElementById('loyalty-used-msg').style.display = 'none';

  });

  //============================== API TT khách hàng ====================================
  const data = {
    "tenKhachHang": "Nguyễn Văn A",
    "diemTichLuy": 123
  }

  
  let timeout = null;

  phoneInput.addEventListener('input', () => {
    const phone = phoneInput.value.trim();

    // Xoá delay cũ (nếu có)
    if (timeout) clearTimeout(timeout);

    // Đợi 500ms sau khi ngừng gõ mới gửi API
    timeout = setTimeout(async () => {
      if (phone.length == 10) { // Chỉ gọi nếu số điện thoại đủ độ dài
        try {
          const res = await fetch(`http://localhost:3000/api/customers/phone/${phone}`); // Thay URL API thật
          if (!res.ok) throw new Error('Không tìm thấy khách hàng');
          const data = await res.json();

          // Gán dữ liệu vào ô nhập
          nameInput.value = data.data.name || '';
          pointsInput.value = data.data.points ?? 0;
          // Nếu đủ điểm thì hiện nút "SỬ DỤNG"
          const loyaltySection = document.getElementById('loyalty-section');
          loyaltySection.innerHTML = ''; // reset
          if ((data.data.points ?? 0) >= 30) {
            loyaltySection.innerHTML = `
              <button class="btn btn-primary fw-bold btn-sm en" data-bs-toggle="modal" data-bs-target="#pointModal">
                SỬ DỤNG
              </button>
            `;
            window.maxPoints = data.data.points; // lưu vào biến toàn cục
          }


        } catch (error) {
          // console.warn('Không tìm thấy khách hàng:', error);
          showModalError("LỖI TẠO ĐƠN HÀNG", error.message);
          nameInput.value = '';
          pointsInput.value = '';
        }
      } else {
        // Nếu xoá hết hoặc nhập quá ngắn, reset
        nameInput.value = '';
        pointsInput.value = '';
      }
    }, 500);
  });
});
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('confirmUsePoints')?.addEventListener('click', () => {
    const input = document.getElementById('pointsToUse');
    const points = parseInt(input.value);

    if (isNaN(points) || points < 1 || points > (window.maxPoints || 0)) {
      alert(`Vui lòng nhập số điểm từ 1 đến ${window.maxPoints}`);
      return;
    }

    const discount = points * 1000;
    const rawTotal = parseInt(localStorage.getItem('totalPrice')) || 0;
    const finalTotal = Math.max(0, rawTotal - discount);

    localStorage.setItem('usedPoints', points);
    localStorage.setItem('finalPriceAfterPoints', finalTotal);

    document.getElementById('total-price').innerText = `${finalTotal.toLocaleString()}₫`;
    const loyaltyMsg = document.getElementById('loyalty-used-msg');
    loyaltyMsg.classList.remove('d-none');
    loyaltyMsg.textContent = 'Đã sử dụng điểm tích lũy cho hóa đơn này';
    loyaltyMsg.style.color = 'red';
// Ngắt sự kiện sử dụng điểm  
    const useBtn = document.querySelector('#loyalty-section button');
    if (useBtn)
      useBtn.disabled = true;
      useBtn.classList.add('btn-secondary');
      useBtn.classList.remove('btn-primary');
    const skipSection = document.getElementById('skip-section');
    if (skipSection) skipSection.classList.add('d-none');
    const modal = bootstrap.Modal.getInstance(document.getElementById('pointModal'));
    modal.hide();
  });
});
document.querySelector('.btn-continue')?.addEventListener('click', () => {
  const usedPoints = localStorage.getItem('usedPoints');
  const loyaltySection = document.getElementById('loyalty-section');
  const loyaltyMsg = document.getElementById('loyalty-used-msg');

  if (!usedPoints && loyaltySection.innerHTML.includes('SỬ DỤNG')) {
    loyaltyMsg.textContent = 'Khách hàng không sử dụng điểm tích lũy';
    loyaltyMsg.style.color = 'gray';
    loyaltyMsg.style.display = 'block';
  }

  document.querySelector('.btn-continue').innerText = 'TẠO HÓA ĐƠN';
});







