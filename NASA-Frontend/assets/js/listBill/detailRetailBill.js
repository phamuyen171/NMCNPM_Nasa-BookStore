const urlParams = new URLSearchParams(window.location.search);
const invoiceID = urlParams.get('invoiceID');

// Gọi API theo invoiceID
console.log('Đang load chi tiết hóa đơn:', invoiceID);

const invoice = {
  invoiceID: "00001",
  createdAt: "2025-06-28 10:30:00",
  staffCode: "EMP001",
  customerName: "John Doe",
  customerPhone: "123456789",
  totalQty: 6,
  subTotal: 230.55,
  discount: 10.00,
  finalTotal: 220.55,
  earnedPoints: 15,
  usedPoints: 5,
  previousPoints: 20, // Số điểm trước đây, backend gửi luôn
  isCustomer: true,    // Có phải khách hàng thân thiết không
  productList: [
    {
      title: "Book A",
      price: 45.68,
      quantity: 2,
      total: 91.36
    },
    {
      title: "Book B",
      price: 39.99,
      quantity: 1,
      total: 39.99
    },
    {
      title: "Book C",
      price: 33.07,
      quantity: 3,
      total: 99.20
    }
  ]
};


window.addEventListener('DOMContentLoaded', () => {
  try {
    // // GỌI API LẤY HÓA ĐƠN
    // const res = await fetch("http://localhost:3000/api/invoices/finalInvoice");
    // if (!res.ok) throw new Error("Không thể lấy dữ liệu từ server");

    // const invoice = await res.json();

    // // KIỂM TRA XEM CÓ DỮ LIỆU KHÔNG
    // if (!invoice || !invoice.invoiceID) {
    //   showModalError("LỖI", "Dữ liệu hóa đơn không hợp lệ.");
    //   return;
    // }
    // Thông tin hóa đơn chung
    document.getElementById('ma-hoa-don').innerText = invoice.invoiceID;
    document.getElementById('ngay-tao').innerText = invoice.createdAt;
    document.getElementById('nhan-vien').innerText = invoice.staffCode;
    document.getElementById('ten-khach-hang').innerText = invoice.customerName || 'Không có';
    document.getElementById('sdt-khach-hang').innerText = invoice.customerPhone || 'Không có';

    // Bảng sản phẩm
    const tbody = document.querySelector('#invoice-table tbody');
    tbody.innerHTML = '';
    invoice.productList.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${index + 1}</td>
        <td>${product.title}</td>
        <td>${product.price.toFixed(2)}</td>
        <td>${product.quantity}</td>
        <td>${product.total.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });

    // Tổng số lượng và tạm tính
    document.getElementById('total-qty').innerText = invoice.totalQty;
    document.getElementById('total-price').innerText = invoice.subTotal.toFixed(2);

    // Giảm giá
    if (invoice.discount > 0) {
        document.getElementById('discount-row').classList.remove('d-none');
        document.getElementById('discount-amount').innerText = invoice.discount.toFixed(2);
    }
    document.getElementById('discount-separator').classList.remove('d-none');
    document.getElementById('final-price-row').classList.remove('d-none');
    document.getElementById('final-price').innerText = invoice.finalTotal.toFixed(2);

    // Điểm tích lũy
    if (invoice.isCustomer) {
        const totalPoints = invoice.previousPoints + invoice.earnedPoints - invoice.usedPoints;
        document.getElementById('earned-points').innerText = `+${invoice.earnedPoints} điểm`;
        document.getElementById('total-points').innerText = `${totalPoints} điểm`;
    } else {
        document.getElementById('diem-tich-luy').style.display = "none";
        document.getElementById('tong-tich-luy').style.display = "none";
    }

    // Hiển thị trạng thái thành công
    document.getElementById('success').classList.remove('d-none');
    document.getElementById('success').classList.add('d-flex');

  } catch (error) {
    showModalError("LỖI LẤY HÓA ĐƠN", error.message);
  }

   //==== NÚT XOÁ HÓA ĐƠN ====
   document.getElementById('delete-bill').addEventListener('click', () => {
    showModalDelete(
        "XÓA HOÁ ĐƠN",
        invoice.invoiceID, // Phần nội dung xác thực là mã hoá đơn
        async () => {
        fetch(`http://localhost:3000/api/invoices/${invoice.invoiceID}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
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
                `Xoá hoá đơn <b>${invoice.invoiceID}</b> thành công!`,
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
        `Nhập đúng <b>${invoice.invoiceID}</b> để xác thực.`
        )
    );
  });
});
