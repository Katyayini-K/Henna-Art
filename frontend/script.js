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

    fetch("http://localhost:3000/upload-image", {
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

  fetch("http://localhost:3000/get-gallery")
    .then((response) => response.json())
    .then((data) => {
      galleryGrid.innerHTML = "";
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          console.log(image);
          const imgElement = document.createElement("img");
          imgElement.src = `http://localhost:3000/uploads/${image}`;
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
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;
  const formMessage = document.getElementById("form-message");

  if (!formMessage) {
    console.error("Form message element not found");
    return;
  }

  if (name && email && message) {
    fetch("http://localhost:3000/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
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
        console.log("Response Data:", data);
        if (data.success) {
          formMessage.classList.remove("hidden", "text-red-600");
          formMessage.classList.add("text-green-600");
          formMessage.textContent =
            "Message sent successfully! We will get back to you soon.";
          const contactForm = document.getElementById("contact-form");
          if (contactForm && contactForm.tagName.toLowerCase() === "form") {
            contactForm.reset();
          }
        } else {
          formMessage.classList.remove("hidden", "text-green-600");
          formMessage.classList.add("text-red-600");
          formMessage.textContent =
            "Failed to send message: " +
            (data.message || "Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        formMessage.classList.remove("hidden", "text-green-600");
        formMessage.classList.add("text-red-600");
        formMessage.textContent = "An error occurred: " + error.message;
      });
  } else {
    formMessage.classList.remove("hidden", "text-green-600");
    formMessage.classList.add("text-red-600");
    formMessage.textContent = "Please fill out all required fields.";
  }
}

// Booking Form Submission
const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
  bookingForm.addEventListener("submit", submitBookingForm);
}

function submitBookingForm(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const date = document.getElementById("date").value;
  const service = document.getElementById("service").value;
  const notes = document.getElementById("notes").value;

  if (name && email && date && service) {
    fetch("http://localhost:3000/submit-booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, date, service, notes }),
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
          alert(
            "Booking submitted successfully! We will confirm your appointment soon."
          );
          const bookingForm = document.getElementById("booking-form");
          if (bookingForm && bookingForm.tagName.toLowerCase() === "form") {
            bookingForm.reset();
          }
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((error) => {
        alert("There was an error submitting your booking: " + error.message);
        console.error("Booking error:", error);
      });
  } else {
    alert("Please fill out all required fields.");
  }
}
