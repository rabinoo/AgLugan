function showPaymentForm() {
    const paymentMethod = document.getElementById("payment-method").value;
    const cashSection = document.getElementById("cash-section");
    const gcashSection = document.getElementById("gcash-section");
    const mayaSection = document.getElementById("maya-section");

  // Hide all sections first
  cashSection.classList.remove('active');
  gcashSection.classList.remove('active');
  mayaSection.classList.remove('active');

  // Show the selected section
  if (paymentMethod === "gcash") {
    gcashSection.classList.add('active');
    populateDate("gcash-date"); // Populate date for GCash
  } else if (paymentMethod === "maya") {
    mayaSection.classList.add('active');
    populateDate("maya-date"); // Populate date for Maya
  } else {
    cashSection.classList.add('active');
  }
}

function populateDate(fieldId) {
    const today = new Date();
    const dateField = document.getElementById(fieldId);
    const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    dateField.value = formattedDate;
}

const modal = document.getElementById("terms-modal");
const btnOpen = document.getElementById("open-modal");
const btnOpenMaya = document.getElementById("open-maya-modal");
const spanClose = document.getElementsByClassName("close")[0];
const gcashTerms = document.getElementById("gcash-terms");
const gcashSubmit = document.getElementById("gcash-submit");
const mayaTerms = document.getElementById("maya-terms");
const mayaSubmit = document.getElementById("maya-submit");

btnOpen.onclick = function () {
  modal.style.display = "block";
}

btnOpenMaya.onclick = function () {
  modal.style.display = "block";
}

spanClose.onclick = function () {
  modal.style.display = "none";
  gcashTerms.disabled = false;
  mayaTerms.disabled = false;
}

gcashTerms.addEventListener('change', function () {
  gcashSubmit.disabled = !this.checked;
});

mayaTerms.addEventListener('change', function () {
  mayaSubmit.disabled = !this.checked;
});

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
    gcashTerms.disabled = false;
    mayaTerms.disabled = false;
  }
}

// Initialize with Cash payment as default
document.addEventListener("DOMContentLoaded", function () {
  showPaymentForm(); // Show the default form on page load
});
