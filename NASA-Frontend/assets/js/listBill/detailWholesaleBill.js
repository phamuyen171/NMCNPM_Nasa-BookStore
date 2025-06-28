const urlParams = new URLSearchParams(window.location.search);
const invoiceID = urlParams.get('invoiceID');

// Gọi API theo invoiceID
console.log('Đang load chi tiết hóa đơn:', invoiceID);

async function getBillDetailMock() {
  return {
    companyName: "CÔNG TY TNHH ABC",
    invoiceID: "HD00123",
    createdBy: "NV001",
    invoiceFormNumber: "01GTKT0/001",
    date: "2025-06-28T10:00:00Z",
    dueDate: null,
    paidAt: "2025-06-28T12:00:00Z",
    subtotal: "2.824,960",
    totalDiscount: "282,496",
    discountPercentage: 10,
    total: "2.452,964",
    status: "debt", // hoặc "debt"
    customerPhone: "0912345678",
    customerType: "wholesale",
    paymentMethod: "cash",
    isDeleted: false,
    productList: [
      { title: "Lập Trình Python Cơ Bản", quantity: 26, price: 58.72},
      { title: "Giải Thuật Và Lập Trình", quantity: 12, price: 48.37 },
      { title: "Cấu Trúc Dữ Liệu", quantity: 20, price: 35.89 }
    ],
    buyerName: "Nguyễn Văn A",
    taxId: "123456789",
    address: "12 Đường ABC, Quận 1, TP.HCM"
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await getBillDetailMock();

  // Render số hóa đơn, ngày tạo
  document.getElementById('so-hoa-don').innerText = data.invoiceID;
  document.getElementById('mau-so').innerText = data.invoiceFormNumber;
  document.querySelector('.invoice-title p.text-center').innerText = `Ngày lập: ${new Date(data.date).toLocaleDateString('vi-VN')}`;

  // Thông tin người mua
  const invoiceBox = document.querySelector('.invoice-box');
  const buyerInfoDiv = document.createElement('div');
  buyerInfoDiv.classList.add('ms-4', 'mb-3');
  buyerInfoDiv.innerHTML = `
    <p><strong>Họ tên người mua:</strong> ${data.buyerName}</p>
    <p><strong>Tên đơn vị:</strong> ${data.companyName}</p>
    <p><strong>Mã số thuế:</strong> ${data.taxId}</p>
    <p><strong>Địa chỉ:</strong> ${data.address}</p>
  `;
  invoiceBox.insertBefore(buyerInfoDiv, document.getElementById('invoice-table'));

  // Render sản phẩm
  const tbody = document.querySelector('#invoice-table tbody');
  tbody.innerHTML = '';
  data.productList.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.title}</td>
      <td>${item.quantity}</td>
      <td>${Number(item.price).toLocaleString('vi-VN')}</td>
      <td>${Number(item.quantity * item.price).toLocaleString('vi-VN')}</td>
    `;
    tbody.appendChild(row);
  });

  // Tạm tính
  const subtotalRow = document.createElement('tr');
  subtotalRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Tạm tính</td>
    <td class="fw-bold">${data.subtotal}</td>
  `;
  tbody.appendChild(subtotalRow);

  // Chiết khấu
  const discountRow = document.createElement('tr');
  discountRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Chiết khấu</td>
    <td class="fw-bold">${data.discountPercentage}%</td>
  `;
  tbody.appendChild(discountRow);

  // Thành tiền sau chiết khấu
  const finalPriceRow = document.createElement('tr');
  finalPriceRow.innerHTML = `
    <td colspan="4" class="text-end fw-bold">Thành tiền</td>
    <td class="fw-bold">${data.total}</td>
  `;
  tbody.appendChild(finalPriceRow);

  // Tình trạng thanh toán
  const billStatus = document.getElementById('bill-status');
  if (data.status === 'paid') {
    billStatus.innerHTML = '<strong>Đã Thanh Toán</strong>';
    billStatus.style.color = '#1a3a9c';
    billStatus.style.backgroundColor = '#c1c4f4';
  } else if (data.status === 'debt') {
    billStatus.innerHTML = '<strong>Ghi Nợ</strong>';
    billStatus.style.color = '#ff0000';
    billStatus.style.backgroundColor = '#fdcdcd';
  }
});