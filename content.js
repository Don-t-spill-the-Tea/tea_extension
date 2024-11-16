// // content.js - This can directly access DOM
// document.querySelector(".my-class");
// const idwala = document.getElementById("my-id");

// // Listen for DOM changes
// const observer = new MutationObserver((mutations) => {
//   mutations.forEach((mutation) => {
//     console.log(mutation)
//   });
// });

// // observer.observe(document.body, {
// //   childList: true,
// //   subtree: true,
// // });

document.addEventListener("DOMContentLoaded", () => {
  console.log("Log something");
  // Initialize observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          console.log("New element added:", node);
        }
      });
    });
  });

  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }
});
