window.addEventListener("DOMContentLoaded", () => {
  const modalSrc = document.body.getAttribute('data-modal-confirm-src');
  fetch(modalSrc)
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);
    });
});

function showModalConfirm(title = "THÊM SÁCH", message = "thêm sách", link_icon="", onConfirm = () => {}) {
  const modal = document.getElementById("confirmationModal");
  const msgEl = document.getElementById("confirmationModalMessage");
  const titleEl = document.getElementById("confirmationModalTitle");

  const pattern = /<[^>]+>/;

  if (msgEl) {
    if (pattern.test(message)){
      msgEl.innerHTML = `Bạn có chắc muốn thực hiện hành động ${message} này?`
    }
    else{
      msgEl.textContent = `Bạn có chắc muốn thực hiện hành động ${message} này?`;
    }
  }
  if (modal) modal.style.display = "flex";
  if (titleEl) titleEl.textContent = `XÁC NHẬN ${title}`;

  // if (link_icon !== "") {
  //   const iconEl = document.getElementById("linkIcon");
  //   if (iconEl) {
  //     iconEl.src = link_icon + 'components/images/confirm-icon.svg';
  //     iconEl.style.display = "block"; // Hiển thị icon nếu có
  //   }
  // }
    
  const confirmBtn = document.getElementById('confirmActionBtn');
  const cancelBtn = document.getElementById('cancelActionBtn');
  
  // Xóa event listener cũ
  confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  
  // Thêm event listener mới
  document.getElementById('confirmActionBtn').onclick = () => {
        // hideModal('confirmationModal');
        modal.style.display = "none";
        onConfirm();
    };
    
    document.getElementById('cancelActionBtn').onclick = () => {
        // hideModal('confirmationModal');
        modal.style.display = "none";
    };
}
