// Initialize the script
console.log("Enhanced image detection script initializing...");

// Create a MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      mutation.addedNodes.forEach((node) => {
        // Check if the added node is an image
        if (node.nodeName === 'IMG') {
          handleImage(node);
        }
        // Check for images within added nodes (e.g., div containers)
        if (node.querySelectorAll) {
          node.querySelectorAll('img').forEach(handleImage);
        }
      });
    }
  });
});

// Configuration for the observer
const observerConfig = {
  childList: true,  // Watch for children being added/removed
  subtree: true,    // Watch all descendants, not just direct children
  attributes: true, // Watch for attribute changes (like src)
  attributeFilter: ['src']  // Only watch src attribute changes
};

// Function to handle individual images
function handleImage(img) {
  // Check if we've already processed this image
  if (img.dataset.processed) return;
  
  console.log(`Processing image: ${img.src}`);
  
  // Mark the image as processed
  img.dataset.processed = 'true';
  
  // Only fetch if we have a valid src
  if (img.src) {
    fetch(img.src)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.blob();
      })
      .then(blob => {
        console.log(`Successfully downloaded image blob:`, blob);
        // Your additional image processing logic here
      })
      .catch(error => {
        console.error(`Error processing image ${img.src}:`, error);
      });
  }
}

// Function to initialize file input handling
function initializeFileInput() {
  const fileInput = document.getElementById('fileInput');
  const preview = document.getElementById('preview');
  
  if (!fileInput || !preview) {
    console.error('Required elements not found. Ensure fileInput and preview elements exist.');
    return;
  }

  fileInput.addEventListener('change', (event) => {
    Array.from(event.target.files).forEach((file) => {
      console.log(`File selected: ${file.name}`);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '200px';
        img.style.margin = '10px';
        preview.appendChild(img);
        // The MutationObserver will automatically detect this new image
      };
      reader.readAsDataURL(file);
    });
  });
}

// Main initialization function
function initialize() {
  console.log("Initializing image detection system...");
  
  // Process existing images
  document.querySelectorAll('img').forEach(handleImage);
  
  // Start observing the whole document for changes
  observer.observe(document.documentElement, observerConfig);
  
  // Initialize file input handling
  initializeFileInput();
  
  console.log("Image detection system initialized successfully");
}

// Set up the initial load handler
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
