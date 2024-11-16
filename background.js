
chrome.action.onClicked.addListener((tab) => {
  const filter = {
    urls: ["<all_urls>"], // You can narrow this down to specific file types or domains
    tabId: tab.id
  };

  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      console.log("File request detected:", details);
    },
    filter,
    []
  );

  console.log(`Monitoring requests for tab: ${tab.id}`);
});


