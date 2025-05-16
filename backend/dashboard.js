// Load gallery images
// const backendBaseUrl = "https://henna-art.onrender.com";
const backendBaseUrl = "http://localhost:3000";

function loadDashboardGallery() {
    const galleryGrid = document.getElementById("gallery-grid");
    if (!galleryGrid) {
      console.error("Gallery grid element not found");
      return;
    }
  
    galleryGrid.innerHTML = '<p>Loading gallery images...</p>';
  
    fetch(`${backendBaseUrl}/get-gallery`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        galleryGrid.innerHTML = "";
        if (data.images && data.images.length > 0) {
          data.images.forEach((image) => {
            const div = document.createElement("div");
            div.className = "image-container";
  
            const img = document.createElement("img");
            img.src = `${backendBaseUrl}/uploads/${image}?t=${Date.now()}`; // Cache-busting
            img.alt = "Gallery Image";
            img.className = "gallery-image";
  
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteImage(image);
  
            div.appendChild(img);
            div.appendChild(deleteBtn);
            galleryGrid.appendChild(div);
          });
        } else {
          galleryGrid.innerHTML = "<p>No images available.</p>";
        }
      })
      .catch((error) => {
        console.error("Error loading gallery:", error);
        galleryGrid.innerHTML = "<p>Failed to load gallery.</p>";
      });
  }
  
  // Handle image upload form submission
  function handleImageUpload(event) {
    event.preventDefault();
    console.log("Form submission triggered"); // Debug
    const form = event.target;
    const formData = new FormData(form);
    const messageDiv = document.getElementById("upload-message");
  
    fetch(`${backendBaseUrl}/upload-image`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        console.log("Response received:", response.status); // Debug
        return response.json();
      })
      .then((data) => {
        console.log("Server response:", data); // Debug
        messageDiv.className = `message ${data.success ? "success" : "error"}`;
        messageDiv.textContent = data.message;
        if (data.success) {
          form.reset();
          loadDashboardGallery(); // Refresh gallery
        }
      })
      .catch((error) => {
        console.error("Upload error:", error);
        messageDiv.className = "message error";
        messageDiv.textContent = "Error uploading image: " + error.message;
      });
  }
  
  // Delete an image
  function deleteImage(filename) {
    if (confirm("Are you sure you want to delete this image?")) {
      fetch(`${backendBaseUrl}/delete-image/${encodeURIComponent(filename)}`, { method: "DELETE" })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            loadDashboardGallery(); // Refresh gallery
          } else {
            alert("Error: " + data.message);
          }
        })
        .catch((error) => alert("Error deleting image: " + error.message));
    }
  }
  
  // Initialize
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard.js loaded"); // Debug
    const uploadForm = document.getElementById("upload-form");
    if (uploadForm) {
      uploadForm.addEventListener("submit", handleImageUpload);
    } else {
      console.error("Upload form not found");
    }
    loadDashboardGallery();
  });