document.addEventListener('DOMContentLoaded', function() {
  initMembershipForm();
  initContactForm();
});

// ==========================================
// 1. MEMBERSHIP FORM LOGIC
// ==========================================
function initMembershipForm() {
  var form = document.getElementById('membershipForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault(); 
    
    var fullName = document.getElementById('fullName').value.trim();
    var email = document.getElementById('email').value.trim();
    var telephone = document.getElementById('telephone').value.trim();
    var country = document.getElementById('country').value.trim();
    var residence = document.getElementById('residence').value.trim();

    var submitBtn = document.getElementById('submitBtn');
    var msgBox = form.querySelector('.form-message');

    if (!fullName || !email || !telephone || !country || !residence) {
      showMessage(msgBox, 'error', 'Please fill in all required fields marked with *');
      return;
    }

    if (!validateEmail(email)) {
      showMessage(msgBox, 'error', 'Please enter a valid email address.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    msgBox.style.display = 'none';

    // Simulate Server Request
    setTimeout(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Enquiry';
      showMessage(
        msgBox, 
        'success', 
        'Thank you, ' + fullName + '. Your enquiry has been received. The RUMYU-UG executive will contact you soon. (Note: You are not yet an official member until confirmed).'
      );
      form.reset(); 
    }, 1500); 
  });
}

// ==========================================
// 2. CONTACT FORM LOGIC
// ==========================================
function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var message = document.getElementById('message').value.trim();

    var submitBtn = document.getElementById('contactSubmitBtn');
    var msgBox = form.querySelector('.form-message');

    if (!name || !email || !message) {
      showMessage(msgBox, 'error', 'Please fill in your name, email, and message.');
      return;
    }

    if (!validateEmail(email)) {
      showMessage(msgBox, 'error', 'Please enter a valid email address.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    msgBox.style.display = 'none';

    // Simulate Server Request
    setTimeout(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      showMessage(
        msgBox, 
        'success', 
        'Thank you, ' + name + '. Your message has been sent successfully. We will get back to you shortly.'
      );
      form.reset(); 
    }, 1500); 
  });
}

// ==========================================
// Helper Functions
// ==========================================
function validateEmail(email) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showMessage(element, type, text) {
  element.className = 'form-message ' + type;
  element.textContent = text;
  element.style.display = 'block';
}