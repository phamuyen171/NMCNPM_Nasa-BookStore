document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".board-body");
  const addButton = document.querySelector(".btn-add-customer");
  const taxCodeInput = document.getElementById("tax-code");

  // Tạo map để dễ xử lý
  const fields = {
    "company-name": "Tên đơn vị mua hàng",
    "tax-code": "Mã số thuế",
    "address": "Địa chỉ",
    "represent-name": "Tên người đại diện",
    "phone": "SĐT người đại diện",
    "discount": "Mức chiết khấu"
  };

  function showError(input, message) {
    const parent = input.parentElement;

    // Xoá lỗi cũ
    const existing = parent.querySelector(".error-text");
        if (existing) existing.remove();

        // Tạo lỗi mới
        const small = document.createElement("small");
        small.classList.add("error-text", "text-danger", "fst-italic");
        small.innerText = message;

        // Gắn dưới ô input
        parent.appendChild(small);
    }

  function clearErrors() {
    document.querySelectorAll(".error-text").forEach(e => e.remove());
  }

  // Kiểm tra trống & hợp lệ
  function validateInputs() {
    let isValid = true;
    clearErrors();

    for (const [id, label] of Object.entries(fields)) {
      const input = document.getElementById(id);
      if (!input.value.trim()) {
        showError(input, `${label} không được để trống`);
        isValid = false;
      }
    }

    return isValid;
  }

  // Kiểm tra trùng mã số thuế
  const fakeTaxCodes = ["123456789", "987654321", "065486256"]; // Mã số thuế đã tồn tại (giả lập)
  async function checkTaxCodeExists(taxCode) {
    // try {
    //   const response = await fetch(`/api/check-tax-code?code=${encodeURIComponent(taxCode)}`);
    //   const result = await response.json();
    //   return result.exists; // server trả về { exists: true } nếu trùng
    // } catch (error) {
    //   console.error("Lỗi kiểm tra mã số thuế:", error);
    //   return false; // phòng lỗi kết nối
    // }
    // Giả lập delay API và kiểm tra
    return new Promise(resolve => {
      setTimeout(() => {
      const exists = fakeTaxCodes.includes(taxCode);
      resolve(exists);
      }, 300); // Giả lập chờ 300ms
    });
  }

  //Kiểm tra ngay khi người dùng rời ô input mã số thuế
  taxCodeInput.addEventListener("blur", async () => {
    const value = taxCodeInput.value.trim();
    if (!value) {
      showError(taxCodeInput, "Mã số thuế không được để trống");
      return;
    }

    const exists = await checkTaxCodeExists(value);
    if (exists) {
      showError(taxCodeInput, "Mã số thuế đã tồn tại");
    } else {
      clearErrors(taxCodeInput);
    }
  });

  // ===========================xử lý ô discount============================
  const discountInput = document.getElementById("discount");
  // Cờ: đang focus hay không
  let isFocusingDiscount = false;

  // Lấy chỉ phần số (dành cho xử lý)
  function extractNumber(value) {
    return value.replace(/[^0-9.]/g, '');
  }

  // Khi focus: hiển thị số thuần (xoá %)
  discountInput.addEventListener("focus", () => {
    isFocusingDiscount = true;
    discountInput.value = extractNumber(discountInput.value);
  });
  // Khi blur: tự thêm %
  discountInput.addEventListener("blur", () => {
    isFocusingDiscount = false;
    const val = extractNumber(discountInput.value);
    if (val) {
      discountInput.value = val + "%";
    } else {
      discountInput.value = "";
    }
  });
  // Khi nhập: chỉ cho phép số và dấu .
  discountInput.addEventListener("input", () => {
    let val = extractNumber(discountInput.value);

    // Chỉ cho 1 dấu chấm
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }

    if (isFocusingDiscount) {
      discountInput.value = val;
    } else {
      discountInput.value = val ? val + "%" : "";
    }
  });


  // Gửi dữ liệu khi hợp lệ
  async function handleSubmit() {
    const isValid = validateInputs();
    if (!isValid) return;

    const taxCode = taxCodeInput.value.trim();
    const isDuplicate = await checkTaxCodeExists(taxCode);

    if (isDuplicate) {
      const taxCodeInput = document.getElementById("tax-code");
      showError(taxCodeInput, "Mã số thuế đã tồn tại");
      return;
    }

    // Nếu hợp lệ, lấy toàn bộ dữ liệu và gửi về backend
    const data = {
      companyName: document.getElementById("company-name").value.trim(),
      taxCode: taxCode,
      address: document.getElementById("address").value.trim(),
      representName: document.getElementById("represent-name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      discount: document.getElementById("discount").value.replace("%", "").trim()
    };

    try {
      const response = await fetch("/api/add-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert("Thêm khách hàng thành công!");
        form.reset();
        clearErrors();
      } else {
        const res = await response.json();
        alert("Thêm thất bại: " + res.message || "Lỗi không rõ.");
      }
    } catch (error) {
      console.error("Lỗi gửi dữ liệu:", error);
      alert("Đã xảy ra lỗi khi gửi dữ liệu.");
    }
  }

  // Bắt sự kiện nhấn nút
  addButton.addEventListener("click", handleSubmit);
});
