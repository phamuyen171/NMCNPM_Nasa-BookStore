window.addEventListener("DOMContentLoaded", () => {
  const modalSrc = document.body.getAttribute('data-modal-delete-src');
  fetch(modalSrc)
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);
    });
});

function showModalDelete(title = "XÓA SÁCH", textConfirm = "", onConfirm = () => {}, failConfirm = () => {}) {
    const modal = document.getElementById("deletionModal");
    const textEl = document.getElementById("text-confirm");
    const titleEl = document.getElementById("deletionModalTitle");

    if(textEl) textEl.textContent = textConfirm;
    if (modal) modal.style.display = "flex";
    if (titleEl) titleEl.textContent = `XÁC NHẬN ${title}`;

    const oldConfirmBtn = document.getElementById('confirmActionBtn');
    const oldCancelBtn = document.getElementById('cancelActionBtn');
    oldConfirmBtn.replaceWith(oldConfirmBtn.cloneNode(true));
    oldCancelBtn.replaceWith(oldCancelBtn.cloneNode(true));

    const newConfirmBtn = document.getElementById('confirmActionBtn');
    const newCancelBtn = document.getElementById('cancelActionBtn');

    const input = document.getElementById('confirmInput');
    input.addEventListener('input', function (event) {
        const value = event.target.value;
        if (value !== ''){
            newConfirmBtn.disabled = false;
        }
        else {
            newConfirmBtn.disabled = true;
        }

        // Lắng nghe nút xác nhận
        newConfirmBtn.onclick = () => {
            const inputConfirm = value.trim();

            if (inputConfirm === textConfirm) {
                modal.style.display = "none";
                onConfirm();
            } else {
                // Giữ modal, gọi failConfirm
                if (typeof failConfirm === "function") failConfirm();
            }
        };

        
    });

    // Nút hủy
    newCancelBtn.onclick = () => {
        modal.style.display = "none";
    };
}
