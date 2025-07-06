const user = JSON.parse(localStorage.getItem("user"));
if (user.role === "staff"){
    document.getElementById("view-debt-btn").style.display = "none";
}