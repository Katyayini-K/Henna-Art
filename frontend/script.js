// Gallery Lightbox
function setupGalleryLightbox() {
  document.querySelectorAll(".gallery-img").forEach((img) => {
    img.addEventListener("click", () => {
      const lightbox = document.getElementById("lightbox");
      const lightboxImg = document.getElementById("lightbox-img");
      if (lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightbox.classList.remove("hidden");
      }
    });
  });
}

const closeLightboxBtn = document.getElementById("close-lightbox");
if (closeLightboxBtn) {
  closeLightboxBtn.addEventListener("click", () => {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
      lightbox.classList.add("hidden");
    }
  });
}

// Dynamic Gallery with User Uploads
const uploadForm = document.getElementById("upload-form");
if (uploadForm) {
  uploadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(uploadForm);
    const uploadMessage = document.getElementById("upload-message");

    if (!uploadMessage) {
      console.error("Upload message element not found");
      return;
    }

    fetch("https://henna-art-nhus.onrender.com/upload-image", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        console.log("Response Status:", response.status);
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Server error: ${response.status} - ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          uploadMessage.classList.remove("hidden", "text-red-600");
          uploadMessage.classList.add("text-green-600");
          uploadMessage.textContent = "Image uploaded successfully!";
          uploadForm.reset();
          loadGallery();
        } else {
          uploadMessage.classList.remove("hidden", "text-green-600");
          uploadMessage.classList.add("text-red-600");
          uploadMessage.textContent =
            data.message || "Failed to upload image. Please try again.";
        }
      })
      .catch((error) => {
        console.error("Upload Error:", error);
        uploadMessage.classList.remove("hidden", "text-green-600");
        uploadMessage.classList.add("text-red-600");
        uploadMessage.textContent = "An error occurred: " + error.message;
      });
  });
}

// Load Gallery Images
function loadGallery() {
  const galleryGrid = document.getElementById("gallery-grid");
  if (!galleryGrid) {
    console.error("Gallery grid element not found");
    return;
  }

  fetch("https://henna-art-nhus.onrender.com/get-gallery")
    .then((response) => response.json())
    .then((data) => {
      galleryGrid.innerHTML = "";
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          console.log(image);
          const imgElement = document.createElement("img");
          imgElement.src = `https://henna-art-nhus.onrender.com/uploads/${image}?t=${Date.now()}`;
          imgElement.alt = "User Uploaded Image";
          imgElement.classList.add(
            "w-full",
            "h-64",
            "object-cover",
            "rounded-lg",
            "cursor-pointer",
            "gallery-img"
          );
          galleryGrid.appendChild(imgElement);
        });
        setupGalleryLightbox();
      } else {
        galleryGrid.innerHTML =
          '<p class="text-center text-gray-600">No images available. Upload some images to get started!</p>';
      }
    })
    .catch((error) => {
      console.error("Fetch Gallery Error:", error);
      galleryGrid.innerHTML =
        '<p class="text-center text-red-600">Failed to load gallery. Please try again later.</p>';
    });
}

// Load the gallery when the page loads (for gallery.html)
if (document.getElementById("gallery-grid")) {
  document.addEventListener("DOMContentLoaded", loadGallery);
}

// Contact Form Submission
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", submitContactForm);
}
function submitContactForm(event) {
  event.preventDefault();
  console.log("Submitting contact form");
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;
  console.log("Contact form data:", { name, email, message });
  
  const formMessage = document.getElementById("form-message");
  if (!formMessage) {
    console.error("Form message element not found");
    return;
  }

  if (!name || !email || !message) {
    formMessage.classList.remove("hidden", "text-green-600", "text-blue-600");
    formMessage.classList.add("text-red-600");
    formMessage.textContent = "Please fill out all required fields.";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    formMessage.classList.remove("hidden", "text-green-600", "text-blue-600");
    formMessage.classList.add("text-red-600");
    formMessage.textContent = "Please enter a valid email address.";
    return;
  }

  formMessage.classList.remove("hidden", "text-red-600", "text-green-600");
  formMessage.classList.add("text-blue-600");
  formMessage.textContent = "Sending your message...";

  fetch("https://henna-art-nhus.onrender.com/send-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, message }),
  })
    .then((response) => {
      console.log("Contact form response status:", response.status); // Fixed line
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Server error: ${response.status} - ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Contact form response data:", data);
      formMessage.classList.remove("hidden", "text-red-600", "text-blue-600");
      if (data.success) {
        formMessage.classList.add("text-green-600");
        formMessage.textContent = "Message sent successfully! We will get back to you soon.";
        document.getElementById("contact-form").reset();
      } else {
        formMessage.classList.add("text-red-600");
        formMessage.textContent = "Failed to send message: " + (data.message || "Please try again later.");
      }
    })
    .catch((error) => {
      console.error("Contact form error:", error);
      formMessage.classList.remove("hidden", "text-green-600", "text-blue-600");
      formMessage.classList.add("text-red-600");
      formMessage.textContent = "An error occurred: " + error.message;
    });
}


// Booking Form Submission
const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
  bookingForm.addEventListener("submit", submitBookingForm);
}

function submitBookingForm(event) {
  event.preventDefault();
  console.log("Submitting booking form");
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const date = document.getElementById("date").value;
  const service = document.getElementById("service").value;
  const notes = document.getElementById("notes").value;
  console.log("Booking form data:", { name, email, date, service, notes });
  
  let bookingMessageElement = document.getElementById("booking-message");
  if (!bookingMessageElement) {
    bookingMessageElement = document.createElement("div");
    bookingMessageElement.id = "booking-message";
    bookingMessageElement.classList.add("mt-4", "p-3", "rounded");
    document.getElementById("booking-form").appendChild(bookingMessageElement);
  }

  if (!name || !email || !date || !service) {
    bookingMessageElement.classList.remove("bg-blue-100", "text-blue-700", "bg-green-100", "text-green-700");
    bookingMessageElement.classList.add("bg-red-100", "text-red-700");
    bookingMessageElement.textContent = "Please fill out all required fields.";
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    bookingMessageElement.classList.remove("bg-blue-100", "text-blue-700", "bg-green-100", "text-green-700");
    bookingMessageElement.classList.add("bg-red-100", "text-red-700");
    bookingMessageElement.textContent = "Please enter a valid email address.";
    return;
  }

  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    bookingMessageElement.classList.remove("bg-blue-100", "text-blue-700", "bg-green-100", "text-green-700");
    bookingMessageElement.classList.add("bg-red-100", "text-red-700");
    bookingMessageElement.textContent = "Please select a future date for your booking.";
    return;
  }

  bookingMessageElement.classList.remove("hidden", "bg-red-100", "text-red-700", "bg-green-100", "text-green-700");
  bookingMessageElement.classList.add("bg-blue-100", "text-blue-700");
  bookingMessageElement.textContent = "Submitting your booking...";

  fetch("https://henna-art-nhus.onrender.com/submit-booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, date, service, notes }),
  })
    .then((response) => {
      console.log("Booking form response status:", response.status);
      if (!response.ok) {
        return response.text().then((text) => {
          throw new Error(`Server error: ${response.status} - ${text}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      console.log("Booking form response data:", data);
      bookingMessageElement.classList.remove("bg-blue-100", "text-blue-700", "bg-red-100", "text-red-700");
      if (data.success) {
        bookingMessageElement.classList.add("bg-green-100", "text-green-700");
        bookingMessageElement.textContent = "Booking submitted successfully! We will confirm your appointment soon.";
        document.getElementById("booking-form").reset();
      } else {
        bookingMessageElement.classList.add("bg-red-100", "text-red-700");
        bookingMessageElement.textContent = "Error: " + (data.message || "Failed to submit booking. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Booking form error:", error);
      bookingMessageElement.classList.remove("bg-blue-100", "text-blue-700", "bg-green-100", "text-green-700");
      bookingMessageElement.classList.add("bg-red-100", "text-red-700");
      bookingMessageElement.textContent = "There was an error submitting your booking: " + error.message;
    });
}