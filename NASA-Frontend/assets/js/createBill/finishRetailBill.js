
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
    //============================== API TT khách hàng ====================================
  const discountRow = document.getElementById('discount-row');
  const finalPriceRow = document.getElementById('final-price-row');
  const discountSeparator = document.getElementById('discount-separator');
  const discountAmount = document.getElementById('discount-amount');
  const finalPrice = document.getElementById('final-price');
  const rewardMessage = document.getElementById('reward-message');
  const cannotRewardMessage = document.getElementById('not-enough-point-message');
  const notUsingReward = document.getElementById('not-using-reward');
  const orderNotEnoughTotal = document.getElementById('order-not-enough-total');
  // const continueBtn = document.querySelector('.btn-continue');

  //========================== Xử lý Tạo mới và Bỏ qua ===============================================
  let isCreatingNewCustomer = false;
  let isCustomer = false;

  const customerBox = document.getElementById('customer-info');
  const skipMsg = document.getElementById('skip-message');
  const infoFields = document.getElementById('info-fields');
  let phoneInput = document.getElementById('phone-number');
  let nameInput = document.getElementById('name');
  let pointsInput = document.getElementById('points');
  const continueBtn = document.querySelector('.btn-continue');
  
  // Hàm kiểm tra và bật/tắt nút "TẠO HÓA ĐƠN"
  function updateContinueButtonState() {
    if (!isCreatingNewCustomer) return;
    const phoneFilled = phoneInput.value.trim() !== '';
    const nameFilled = nameInput.value.trim() !== '';
    if (phoneFilled && nameFilled) {
      continueBtn.classList.remove('btn-disabled');
      continueBtn.classList.add('btn-primary');
    } else {
      continueBtn.classList.add('btn-disabled');
      continueBtn.classList.remove('btn-primary');
    }
  }

  // Lắng nghe sự kiện nhập liệu
  phoneInput.addEventListener('input', updateContinueButtonState);
  nameInput.addEventListener('input', updateContinueButtonState);

  // Xử lý khi nhấn nút "TẠO MỚI"
  document.getElementById('btn-tao-moi').addEventListener('click', () => {
    isCreatingNewCustomer = true;
    isCustomer = true;
    customerBox.style.backgroundColor = '';
    skipMsg.style.display = 'none';
    infoFields.style.display = 'block';

    phoneInput.disabled = false;
    nameInput.disabled = false;
    pointsInput.disabled = true;

    phoneInput.value = '';
    nameInput.value = '';
    pointsInput.value = 0;

    nameInput.placeholder = 'Nhập tên khách hàng...';

    rewardMessage.classList.add('d-none');
    notUsingReward.classList.add('d-none');
    cannotRewardMessage.classList.add('d-none');
    orderNotEnoughTotal.classList.add('d-none');

    discountRow.classList.add('d-none');
    discountSeparator.classList.remove('d-none');
    finalPriceRow.classList.remove('d-none');

    continueBtn.innerText = 'TẠO HÓA ĐƠN';
    continueBtn.classList.add('btn-disabled');
    continueBtn.classList.remove('btn-primary');
  
    // const finalPrice = document.getElementById('final-price');
    // const finalPriceRow = document.getElementById('final-price-row');
    // const discountSeparator = document.getElementById('discount-separator');
    finalPrice.innerText = totalPrice + '$'; 
    finalPriceRow.classList.remove('d-none');
    discountSeparator.classList.remove('d-none');
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
    if (continueBtn) {
      continueBtn.innerText = 'TẠO HÓA ĐƠN';
      continueBtn.classList.remove('btn-disabled');
      continueBtn.classList.add('btn-primary');
    }

    // const finalPrice = document.getElementById('final-price');
    // const finalPriceRow = document.getElementById('final-price-row');
    // const discountSeparator = document.getElementById('discount-separator');
    finalPrice.innerText = totalPrice + '$'; 
    finalPriceRow.classList.remove('d-none');
    discountSeparator.classList.remove('d-none');
    
    document.getElementById('discount-row').classList.add('d-none');
    isCustomer = false;

  });

  const rules = await getRule();
  let points = 0;

  let timeout = null;

  phoneInput.addEventListener('input', () => {
    isCustomer = true;
    if (isCreatingNewCustomer) return;
    isCreatingNewCustomer = false;
    const final = parseFloat(totalPrice);
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

          points = parseInt(pointsInput.value);

          if (!isNaN(points) && points >= rules.point.minPointToUse && final >= rules.point.minBillValue) {
            rewardMessage.classList.remove('d-none');
            notUsingReward.classList.add('d-none');
            cannotRewardMessage.classList.add('d-none');
            orderNotEnoughTotal.classList.add('d-none');
          } else if (!isNaN(points)) {
            rewardMessage.classList.add('d-none');
            cannotRewardMessage.classList.remove('d-none');
            notUsingReward.classList.add('d-none');

             // Hiển thị dòng tương ứng
            if (points < rules.point.minPointToUse) {
              cannotRewardMessage.classList.remove('d-none');
              orderNotEnoughTotal.classList.add('d-none');

              continueBtn.classList.remove('btn-disabled');
              continueBtn.classList.add('btn-primary');

            } else if (final < rules.point.minBillValue) {
              document.getElementById("minValue").innerText = rules.point.minBillValue + "$";
              cannotRewardMessage.classList.add('d-none');
              orderNotEnoughTotal.classList.remove('d-none');
            }

            // Không giảm giá, nhưng vẫn hiển thị Thành tiền = Tạm tính
            discountRow.classList.add('d-none');
            discountSeparator.classList.remove('d-none');
            finalPriceRow.classList.remove('d-none');
            finalPrice.innerText = final.toLocaleString() + '$';
            if (continueBtn) continueBtn.innerText = 'TẠO HÓA ĐƠN';
            
          } else {
            // Nếu người dùng xoá hết thì ẩn hết
            rewardMessage.classList.add('d-none');
            cannotRewardMessage.classList.add('d-none');
            notUsingReward.classList.add('d-none');

            discountRow.classList.add('d-none');
            discountSeparator.classList.add('d-none');
            finalPriceRow.classList.add('d-none');
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

  // Sử dụng điểm
  let usedPoints = 0;
  document.getElementById('btn-use-points').addEventListener('click', () => {
    const continueBtn = document.querySelector('.btn-continue');

    const rawTotal = parseFloat(totalPrice);
    usedPoints = (Math.floor(points/rules.point.minUsedLevel)) * rules.point.minUsedLevel;
    const discount = usedPoints * rules.point.pointToCash;
    const final = Math.max(0, rawTotal - discount);

    discountAmount.innerText = discount + '$';
    finalPrice.innerText = final.toLocaleString() + '$';

    discountRow.classList.remove('d-none');
    finalPriceRow.classList.remove('d-none');
    discountSeparator.classList.remove('d-none');

    rewardMessage.classList.add('d-none');
    notUsingReward.classList.add('d-none');

    if (continueBtn) {
      continueBtn.innerText = 'TẠO HÓA ĐƠN';
      continueBtn.classList.remove('btn-disabled');
      continueBtn.classList.add('btn-primary');
    }
  });

  // Khong sử dụng điểm
  document.getElementById('btn-not-use-points').addEventListener('click', () => {
    const continueBtn = document.querySelector('.btn-continue');

    const rawTotal = parseFloat(totalPrice);
    rewardMessage.classList.add('d-none');
    notUsingReward.classList.remove('d-none');

    // Ẩn phần giảm giá nhưng vẫn hiện "Thành tiền"
    discountRow.classList.add('d-none');          // Ẩn dòng "Giảm giá"
    finalPriceRow.classList.remove('d-none');     // ✨ HIỆN "Thành tiền"

    // ✨ Gán lại giá trị "Thành tiền" bằng "Tạm tính"
    discountSeparator.classList.remove('d-none');
    const final = rawTotal;
    finalPrice.innerText = final.toLocaleString() + '$';

    if (continueBtn) {
      continueBtn.innerText = 'TẠO HÓA ĐƠN';
      continueBtn.classList.remove('btn-disabled');
      continueBtn.classList.add('btn-primary');
    }

    usedPoints = 0;
  });

  // Đem DL qua createRetailBill
  continueBtn.addEventListener('click', () => {
    if (continueBtn.innerText !== 'TẠO HÓA ĐƠN') return;

    // Thu thập dữ liệu
    const invoiceID = document.getElementById('ma-hoa-don').innerText;
    const createdAt = document.getElementById('ngay-tao').innerText;
    const staff = document.getElementById('nhan-vien').innerText;
    let customerPhone = phoneInput.value.trim();
    let customerName = nameInput.value.trim();
    const productList = JSON.parse(localStorage.getItem('invoiceData')) || [];
    const totalQty = localStorage.getItem('totalQty') || 0;
    const subTotal = localStorage.getItem('totalPrice') || 0;

    let discount = document.getElementById('discount-amount')?.innerText?.replace('$', '') || 0;

    const finalTotal = document.getElementById('final-price')?.innerText?.replace('$', '') || subTotal;

    const earnedPoints = Math.floor(parseFloat(finalTotal)/rules.point.cashToPoint);

    if (!isCustomer){
      customerPhone = "";
      customerName = "";
      discount = 0;
    }
    if (isCreatingNewCustomer){
      usedPoints = 0;
    }
    // Lưu dữ liệu hóa đơn
    const finalBill = {
      isCreatingNewCustomer,
      isCustomer,
      invoiceID,
      createdAt,
      staffCode,
      customerPhone,
      customerName,
      productList,
      totalQty,
      subTotal,
      discount,
      finalTotal,
      earnedPoints,
      usedPoints
    };

    localStorage.setItem('finalInvoice', JSON.stringify(finalBill));

    // (Tuỳ chọn) Lưu tổng điểm tích lũy hiện tại
    const previous = parseInt(pointsInput.value) || 0;
    localStorage.setItem('previousPoints', previous);

    // Chuyển sang trang hiển thị hóa đơn
    window.location.href = 'createRetailBill.html';
  });

});
