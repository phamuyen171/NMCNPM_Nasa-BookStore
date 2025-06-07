// assets/js/addStaff.js
document.addEventListener("DOMContentLoaded", function () {
  const imageUrlInput = document.getElementById("image-url");
  const previewImage = document.getElementById("preview-image");
  const placeholder = document.getElementById("placeholder");

  imageUrlInput.addEventListener("input", function () {
    const url = imageUrlInput.value.trim();

    if (url) {
      previewImage.src = url;
      previewImage.style.display = "block";
      placeholder.style.display = "none";
    } else {
      previewImage.style.display = "none";
      placeholder.style.display = "block";
    }
  });
});
