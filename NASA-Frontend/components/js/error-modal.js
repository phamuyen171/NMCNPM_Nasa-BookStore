 window.addEventListener("DOMContentLoaded", () => {
    const modalSrc = document.body.getAttribute('data-modal-error-src');
    fetch(modalSrc)
      .then(res => res.text())
      .then(html => {
        document.body.insertAdjacentHTML("beforeend", html);
      });
  });
  
function showModalError(title = "Lỗi", message = "Đã xảy ra lỗi!", link_icon="", is_div=false) {
  const modal = document.getElementById("errorModal");
  const msgEl = document.getElementById("modalErrorMessage");
  const titleEl = document.getElementById("modalErrorTitle");

  if (msgEl) {
    if (!is_div) {
      msgEl.textContent = message;
    }
    else {
      msgEl.innerHTML = message;
    }
  }
  if (modal) modal.style.display = "flex";
  if (titleEl) titleEl.textContent = title;

  if (link_icon !== "") {
    const iconEl = document.getElementById("linkIcon");
    if (iconEl) {
      iconEl.src = link_icon + 'components/images/warning-icon.svg';
      iconEl.style.display = "block"; // Hiển thị icon nếu có
    }
  }
}

function closeModal() {
  const modal = document.getElementById("errorModal");
  if (modal) modal.style.display = "none";
}
