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
    
  const confirmBtn = document.getElementById('confirmActionBtn');
  const cancelBtn = document.getElementById('cancelActionBtn');
  
  // // Xóa event listener cũ
  // confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  // cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  
  // // Thêm event listener mới
  // document.getElementById('confirmActionBtn').onclick = () => {
  //       // hideModal('confirmationModal');
  //       modal.style.display = "none";
  //       onConfirm();
  //   };
    
  //   document.getElementById('cancelActionBtn').onclick = () => {
  //       // hideModal('confirmationModal');
  //       modal.style.display = "none";
  //   };
  // Gỡ sự kiện cũ
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.replaceWith(newConfirmBtn);

  const newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.replaceWith(newCancelBtn);

  // Gán lại sự kiện mới
  newConfirmBtn.onclick = () => {
    modal.style.display = "none";
    onConfirm();
  };

  newCancelBtn.onclick = () => {
    modal.style.display = "none";
  };

}
