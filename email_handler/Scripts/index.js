// JavaScript to handle form submission and show notification
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const notification = document.getElementById("notification");
    const select = document.getElementById("cryptocurrency");
    const currentPrice = document.getElementById("current-price");
    const cryptoLogo = document.getElementById("crypto-logo");
  
    // The API code to fetch cryptocurrency data
    const url = "https://li.quest/v1/tokens";
    const options = { method: "GET", headers: { accept: "application/json" } };
  
    fetch(url, options)
      .then((res) => res.json())
      .then((json) => {
        const tokens = json.tokens["1"];
  
        // Populate the dropdown options with cryptocurrency symbols
        tokens.forEach((token) => {
          const option = document.createElement("option");
          option.value = token.symbol;
          option.innerText = `${token.name} (${token.symbol})`;
          select.appendChild(option);
        });
  
        // Add event listener to the dropdown
        select.addEventListener("change", () => {
          const selectedSymbol = select.value;
          const selectedToken = tokens.find(
            (token) => token.symbol === selectedSymbol
          );
  
          // Display the logo
          cryptoLogo.src = selectedToken.logoURI;
          cryptoLogo.alt = `${selectedToken.name} Logo`;
  
          // Display the current price
          currentPrice.innerText = `Current Price: $${selectedToken.priceUSD}`;
        });
      })
      .catch((err) => console.error("error:" + err));
  
    // Add form submission event listener
    form.addEventListener("submit", function (event) {
      event.preventDefault();
  
      // Display notification
      notification.style.display = "block";
  
      setTimeout(function () {
        notification.style.display = "none";
      }, 3000);
    });
  });
  
  // installed : npm install express body-parser nodemailer nodemailer-sendgrid-transport