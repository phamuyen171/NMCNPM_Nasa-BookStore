window.addEventListener("DOMContentLoaded", () => {
  const modalSrc = document.body.getAttribute('data-modal-success-src');
  fetch(modalSrc)
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);
    });
});

function showSuccessModal(title = 'THÀNH CÔNG', message = '', buttons = []) {
  const modal = document.getElementById('successModal');
  const titleElem = document.getElementById('modalSuccessTitle');
  const msgElem = document.getElementById('successModalMessage');
  const btnContainer = document.getElementById('successModalButtons');

  titleElem.innerHTML = `<i class="fa fa-check-circle" style="color:rgb(33, 43, 233);"></i> ${title}`;
  const pattern = /<[^>]+>/;
  if (!pattern.test(message)) msgElem.textContent = message; else msgElem.innerHTML = message;
  btnContainer.innerHTML = ''; // Xóa các nút cũ

  btnContainer.className = 'modal-footer d-flex justify-content-center gap-2';

  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn.text;
    button.className = 'btn btn-secondary';
    if (btn.link) {
      button.onclick = () => window.location.href = btn.link;
    } else if (typeof btn.onClick === 'function') {
      button.onclick = btn.onClick;
    }
    btnContainer.appendChild(button);
  });

  // Hiển thị modal
  modal.style.display = 'flex';
}
