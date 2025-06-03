window.addEventListener("DOMContentLoaded", () => {
  ["banner", "header" ,"footer"].forEach(id => {
    const el = document.getElementById(id);
    const url = el?.dataset?.url;

    if (el && url) {
      fetch(`${url}?_=${Date.now()}`) // tránh cache
        .then(res => res.text())
        .then(html => {
          el.innerHTML = html;
        })
        .catch(err => console.error(`Lỗi khi load ${id}:`, err));
    }
  });
});
