document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("buttonDownload");

  if (button) {
    button.addEventListener("click", async () => {
      let response = await fetch(
        "https://039e-36-252-119-58.ngrok-free.app/extension",
        {
          method: "POST",
        }
      );
    });
  } else {
    console.error("Button not found in the popup!");
  }
});
