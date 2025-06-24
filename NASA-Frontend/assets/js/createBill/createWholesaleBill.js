async function getCustomerData(name, companyName, taxId, phone) {
    try{
        const res = await fetch("http://localhost:3000/api/customers/check-representative", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({companyName, taxId, name, phone})
        });
        const data = await res.json();
        if (!data.success){
            throw new Error(data.message);
        }
        return data.data;
    }
    catch (error){
        // showModalError("LỖI LẤY THÔNG TIN ĐƠN VỊ BÁN SỈ", error.message);
        console.error("Lỗi lấy thông tin đơn vị bán sỉ:", error);
        return null;
    }
}

async function createBillWholesale(fetchData){
    try {
        const res = await fetch("http://localhost:3000/api/invoices/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fetchData)
        });
        const data = await res.json();

        if(!data.success){
          throw new Error(data.message);
        }
        window.location.href = 'finalWholesaleBill.html';
    } catch (error){
      showModalError("LỖI TẠO HÓA ĐƠN BÁN SỈ", error.message);
    }

}

document.addEventListener("DOMContentLoaded", async () => {
  const rule = await getRule();
  // Lấy dữ liệu từ localStorage
  const createdDate = localStorage.getItem('createdDate') || '';
  const invoiceId = localStorage.getItem('invoiceId') || '';
  const buyerName = localStorage.getItem('buyerName') || '';
  const companyName = localStorage.getItem('companyName') || '';
  const taxId = localStorage.getItem('taxId') || '';
  const address = localStorage.getItem('address') || '';
  const invoiceData = JSON.parse(localStorage.getItem('invoiceData') || '[]');
  const totalQty = localStorage.getItem('totalQty') || 0;
  const totalPrice = localStorage.getItem('totalPrice') || 0;

  // Đưa thông tin vào tiêu đề hoá đơn
  document.getElementById('so-hoa-don').innerText = invoiceId;
  document.getElementById('mau-so').innerText = '01GTKT0/001'; // Gắn mã mẫu hoá đơn nếu có
  document.querySelector('.invoice-title p.text-center').innerText = `Ngày lập: ${createdDate}`;

  // Tạo bảng sản phẩm
  const tbody = document.querySelector('#invoice-table tbody');
  tbody.innerHTML = '';
  invoiceData.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.title}</td>
      <td>${item.quantity}</td>
      <td>${Number(item.price).toLocaleString('vi-VN')}</td>
      <td>${Number(item.total).toLocaleString('vi-VN')}</td>
    `;
    tbody.appendChild(row);
  });

  // Thêm thông tin người mua hàng phía trên bảng
  const invoiceBox = document.querySelector('.invoice-box');
  const buyerInfoDiv = document.createElement('div');
  buyerInfoDiv.classList.add('ms-4', 'mb-3');
  buyerInfoDiv.innerHTML = `
    <p><strong>Họ tên người mua:</strong> ${buyerName}</p>
    <p><strong>Tên đơn vị:</strong> ${companyName}</p>
    <p><strong>Mã số thuế:</strong> ${taxId}</p>
    <p><strong>Địa chỉ:</strong> ${address}</p>
  `;
  invoiceBox.insertBefore(buyerInfoDiv, document.getElementById('invoice-table'));

  // Tạm tính
  const subtotalRow = document.createElement('tr');
  subtotalRow.innerHTML = `
  <td colspan="4" class="text-end fw-bold">Tạm tính</td>
  <td class="fw-bold">${Number(totalPrice).toLocaleString('vi-VN')}</td>
  `;

  const customer = await getCustomerData(buyerName, companyName, taxId, localStorage.getItem('buyerPhone'));
  // console.log("Customer data:", customer);

  // Chiết khấu 
  const discountRate = customer ? customer.discountPercentage / 100 : 0; 
  const discountAmount = totalPrice * discountRate;

  const discountRow = document.createElement('tr');
  discountRow.innerHTML = `
  <td colspan="4" class="text-end fw-bold">Chiết khấu</td>
  <td class="fw-bold">${customer.discountPercentage}%</td>
  `;

  // Thành tiền sau chiết khấu
  const finalAmount = totalPrice - discountAmount;

  const finalPriceRow = document.createElement('tr');
  finalPriceRow.innerHTML = `
  <td colspan="4" class="text-end fw-bold">Thành tiền</td>
  <td class="fw-bold">${Number(finalAmount).toLocaleString('vi-VN')}</td>
  `;

  // Thêm các dòng này vào bảng
  tbody.appendChild(subtotalRow);
  tbody.appendChild(discountRow);
  tbody.appendChild(finalPriceRow);
  let fetchData = {
    companyName: companyName,
    invoiceID: invoiceId,
    createdBy: localStorage.getItem('staffCode'),
    invoiceFormNumber: '01GTKT0/001',
    date: new Date(),
    dueDate: null,
    paidAt: null, 
    subtotal: totalPrice,
    totalDiscount: discountAmount,
    discountPercentage: customer ? customer.discountPercentage : 0,
    total: finalAmount,
    status: 'paid',
    customerPhone: localStorage.getItem('buyerPhone'),
    customerType: 'wholesale',
    paymentMethod: 'cash',
    isDeleted: false,
    productList: invoiceData,
  }

  // console.log("Fetch data for creating bill:", fetchData);

  const btnPayNow = document.querySelector('.btn-thanh-toan-ngay');
  const btnDebt = document.querySelector('.btn-ghi-no');

  if (btnPayNow && btnDebt) {
    btnPayNow.addEventListener('click', async () => {
      localStorage.setItem('statusPay', 'Đã thanh toán');
      // tạo hóa đơn thanh toán thành công
      fetchData.paidAt = new Date();
      // gọi hàm fetch để tạo hóa đơn

      await createBillWholesale(fetchData);
      // window.location.href = 'finalWholesaleBill.html';
    });

    // kiểm tra ghi nợ
    const newDebt = parseFloat(customer.currentDebt) + finalAmount;
    if (newDebt > customer.debtLimit) {
      btnDebt.disabled = true;
      document.getElementById('cannot-debt-title').classList.remove('d-none');
      document.getElementById('cannot-debt-title').classList.add('d-flex');
    } else {
      btnDebt.disabled = false;
      document.getElementById('cannot-debt-title').classList.remove('d-flex');
      document.getElementById('cannot-debt-title').classList.add('d-none');
    }

    btnDebt.addEventListener('click', async () => {
      localStorage.setItem('statusPay', 'Ghi nợ');
      // tạo hóa đơn ghi nợ
      fetchData.paidAt = null; // Không có ngày thanh toán
      const limitDebtDate = newDebt <= rule.debt.maxLowDebt ? rule.debt.timeLowDebt : rule.debt.timeHighDebt;
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + limitDebtDate);
      fetchData.dueDate = dueDate.toISOString();
      fetchData.status = 'debt';
      fetchData.paymentMethod = 'debt';

      // gọi hàm fetch để tạo hóa đơn ghi nợ
      await createBillWholesale(fetchData);

      // window.location.href = 'finalWholesaleBill.html';
    });
  }

});

const statusEl = document.getElementById('status-pay');
if (statusEl) {
  const statusPay = localStorage.getItem('statusPay') || 'Chưa xác định';
  statusEl.innerText = ' ' + statusPay;

  // Reset class trước khi gán lại
  statusEl.classList.remove('text-primary', 'text-danger', 'fw-bold');

  // Font đậm và lớn
  statusEl.classList.add('fw-bold');
  statusEl.style.fontSize = '1.2rem'; // hoặc 'large'

  // Gán màu theo trạng thái
  if (statusPay === 'Đã thanh toán') {
    statusEl.style.color = '#1a3a9c';
  } else if (statusPay === 'Ghi nợ') {
    statusEl.classList.add('text-danger'); // màu đỏ
  }
}
