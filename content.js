console.log("Enhanced image detection script initializing...");

// Open or create the IndexedDB database
const dbRequest = indexedDB.open("MyExtensionDB", 1);

let db;
dbRequest.onupgradeneeded = (event) => {
  db = event.target.result;
  if (!db.objectStoreNames.contains("images")) {
    db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
  }
};

dbRequest.onsuccess = (event) => {
  db = event.target.result;
  console.log("IndexedDB initialized successfully.");
};

dbRequest.onerror = (error) => {
  console.error("Error initializing IndexedDB:", error);
};

// Function to store the image blob in IndexedDB
function storeImageInIndexedDB(blob) {
  if (!db) {
    console.error("Database not initialized yet.");
    return;
  }

  const transaction = db.transaction("images", "readwrite");
  const store = transaction.objectStore("images");

  const record = { image: blob, timestamp: new Date() };
  const request = store.add(record);

  request.onsuccess = () => {
    console.log("Image stored in IndexedDB successfully.");
  };

  request.onerror = (error) => {
    console.error("Error storing image in IndexedDB:", error);
  };
}

// Create a MutationObserver to watch for DOM changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      mutation.addedNodes.forEach((node) => {
        // Check if the added node is an image
        if (node.nodeName === "IMG") {
          handleImage(node);
        }
        // Check for images within added nodes (e.g., div containers)
        if (node.querySelectorAll) {
          node.querySelectorAll("img").forEach(handleImage);
        }
      });
    }
  });
});

// Configuration for the observer
const observerConfig = {
  childList: true, // Watch for children being added/removed
  subtree: true, // Watch all descendants, not just direct children
  attributes: true, // Watch for attribute changes (like src)
  attributeFilter: ["src"], // Only watch src attribute changes
};

// Function to handle individual images
function handleImage(img) {
  // Check if we've already processed this image
  if (img.dataset.processed) return;

  // Only process images with a `blob:` URL
  if (!img.src.startsWith("blob:")) {
    console.log(`Skipping non-blob image: ${img.src}`);
    return;
  }

  console.log(`Processing image: ${img.src}`);

  // Mark the image as processed
  img.dataset.processed = "true";

  // Fetch the blob URL
  fetch(img.src)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.blob(); // Get the image as a Blob
    })
    .then((blob) => {
      console.log(`Successfully downloaded image blob:`, blob);

      // Store the image blob in IndexedDB
      storeImageInIndexedDB(blob);

      // Optional: Trigger download for the user
      const downloadLink = document.createElement("a");
      const url = URL.createObjectURL(blob); // Create a blob URL
      downloadLink.href = url; // Set the blob URL as the href
      downloadLink.download = "downloaded-image"; // Set the file name
      downloadLink.click(); // Trigger the download

      // Clean up by revoking the object URL
      URL.revokeObjectURL(url);
      retrieveImagesFromIndexedDB();
    })
    .catch((error) => {
      console.error(`Error processing image ${img.src}:`, error);
    });
}

function cleanUpDb() {}

// Function to initialize file input handling
function initializeFileInput() {
  const fileInput = document.getElementById("fileInput");
  const preview = document.getElementById("preview");

  if (!fileInput || !preview) {
    console.error(
      "Required elements not found. Ensure fileInput and preview elements exist."
    );
    return;
  }

  fileInput.addEventListener("change", (event) => {
    Array.from(event.target.files).forEach((file) => {
      console.log(`File selected: ${file.name}`);

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.width = "200px";
        img.style.margin = "10px";
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
  document.querySelectorAll("img").forEach(handleImage);

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

async function retrieveImagesFromIndexedDB() {
  if (!db) {
    console.error("Database not initialized yet.");
    return;
  }

  const transaction = db.transaction("images", "readwrite");
  const store = transaction.objectStore("images");

  const request = store.getAll(); // Fetch all stored images

  request.onsuccess = async (event) => {
    const images = event.target.result;
    console.log("Retrieved images from IndexedDB:", images);
    let toUpload = images[images.length - 1];
    console.log(toUpload);

    try {
      const formData = new FormData();
      formData.append("file", toUpload.image); // Assuming the image is in Blob format

      // Send the POST request to the server
      const response = await fetch(
        "https://039e-36-252-119-58.ngrok-free.app/extension",
        {
          method: "POST",
          body: formData,
        }
      );

      // Handle server response
      if (response.ok) {
        console.log("Image sent successfully!");
      } else {
        console.error("Failed to send image:", response.statusText);
      }

      // Delete the image from IndexedDB after sending it
      const deleteRequest = store.delete(record.id); 
      deleteRequest.onsuccess = () => {
        console.log(`Image with ID ${record.id} deleted from IndexedDB.`);
      };
      deleteRequest.onerror = (error) => {
        console.error(`Error deleting image with ID ${record.id}:`, error);
      };
    } catch (error) {
      console.error("Error sending image to server:", error);
    }
  };
}

request.onerror = (error) => {
  console.error("Error retrieving images from IndexedDB:", error);
};

// Function to send the image to the server
async function sendImageToServer(imageBlob) {
  console.log("called");
  try {
    const formData = new FormData();
    formData.append("image", imageBlob, "image.jpg"); // Append the image blob to the form data

    const response = await fetch(
      "https://039e-36-252-119-58.ngrok-free.app/extension",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send image to server");
    }

    return response.json(); // Return the server's response
  } catch (error) {
    console.error("Error sending image to server:", error);
    throw error; // Rethrow the error to be caught by the caller
  }
}
