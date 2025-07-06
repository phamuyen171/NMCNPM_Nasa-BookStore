const urlParams = new URLSearchParams(window.location.search);
const invoiceID = urlParams.get('invoiceID');

// Gọi API theo invoiceID
console.log('Đang load chi tiết hóa đơn:', invoiceID);

let invoice_fetch;

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const rule = await getRule();
    invoice_fetch = await getInvoice(invoiceID);

    // Thông tin hóa đơn chung
    document.getElementById('ma-hoa-don').innerText = invoice_fetch.invoiceID;
    document.getElementById('ngay-tao').innerText = formatDate(invoice_fetch.createdAt);
    document.getElementById('nhan-vien').innerText = invoice_fetch.createdBy;
    if (invoice_fetch.customerPhone) {
      document.getElementById('sdt-khach-hang').innerText = invoice_fetch.customerPhone;
      try {
        const res = await fetch(`http://localhost:3000/api/customers/phone/${invoice_fetch.customerPhone}`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        }); // Thay URL API thật
        if (!res.ok) throw new Error('Không tìm thấy khách hàng');
        const data = await res.json();
        document.getElementById('ten-khach-hang').innerText = data.data.name;
      } catch (error) {
        console.warn('Không tìm thấy khách hàng:', error);
      }
    } else {
      document.getElementById('sdt-khach-hang').innerText = "Không có";
      document.getElementById('ten-khach-hang').innerText = "Không có";
    }

    const productList = await getDetailedInvoice(invoice_fetch);

    // Bảng sản phẩm
    const tbody = document.querySelector('#invoice-table tbody');
    tbody.innerHTML = '';
    let totalQty = 0;
    productList.forEach((product, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${product.bookTitle}</td>
        <td>${convertMoney(product.pricePerUnit)}</td>
        <td>${product.quantity}</td>
        <td>${convertMoney(product.subtotal)}</td>
        `;
      tbody.appendChild(row);
      totalQty += product.quantity;
    });

    // Tổng số lượng và tạm tính
    document.getElementById('total-qty').innerText = totalQty;
    document.getElementById('total-price').innerText = convertMoney(invoice_fetch.subtotal);

    // Giảm giá
    if (invoice_fetch.totalDiscount > 0) {
      document.getElementById('discount-row').classList.remove('d-none');
      document.getElementById('discount-amount').innerText = convertMoney(invoice_fetch.totalDiscount);
    }
    document.getElementById('discount-separator').classList.remove('d-none');
    document.getElementById('final-price-row').classList.remove('d-none');
    document.getElementById('final-price').innerText = convertMoney(invoice_fetch.total);

    // Điểm tích lũy
    if (document.getElementById('sdt-khach-hang').value === "Không có") {
      // const totalPoints = invoice.previousPoints + invoice.earnedPoints - invoice.usedPoints;
      document.getElementById('earned-points').innerText = `+${parseInt(invoice_fetch.total / rule.point.cashToPoint)} điểm`;
      // document.getElementById('total-points').innerText = `${totalPoints} điểm`;
    } else {
      document.getElementById('diem-tich-luy').style.display = "none";
      // document.getElementById('tong-tich-luy').style.display = "none";
    }

    // // Hiển thị trạng thái thành công
    // document.getElementById('success').classList.remove('d-none');
    // document.getElementById('success').classList.add('d-flex');

  } catch (error) {
    showModalError("LỖI LẤY HÓA ĐƠN", error.message);
  }

  //==== NÚT XOÁ HÓA ĐƠN ====
  document.getElementById('delete-bill').addEventListener('click', () => {
    showModalDelete(
      "XÓA HOÁ ĐƠN",
      invoice_fetch.invoiceID, // Phần nội dung xác thực là mã hoá đơn
      async () => {
        fetch(`http://localhost:3000/api/invoices/${invoice_fetch.invoiceID}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
        })
          .then(async response => {
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.message);
            }
            return data;
          })
          .then(data => {
            if (data.success) {
              showSuccessModal(
                'XÓA HOÁ ĐƠN',
                `Xoá hoá đơn <b>${invoice_fetch.invoiceID}</b> thành công!`,
                [
                  {
                    text: 'Xem danh sách',
                    link: 'listBill.html'
                  }
                ]
              );
            } else {
              showModalError('XÓA HOÁ ĐƠN', data.message);
            }
          })
          .catch(error => {
            showModalError('XÓA HOÁ ĐƠN', error.message);
          });
      },
      () => showModalError(
        "XÓA HOÁ ĐƠN",
        `Nhập đúng <b>${invoice_fetch.invoiceID}</b> để xác thực.`
      )
    );
  });
});
