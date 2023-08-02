// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
const port = 5500;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB (Replace 'mydatabase' with your database name)
mongoose.connect("mongodb://localhost:27017/mydatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB!");
});

// Define the schema for user subscription
const subscriptionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  cryptocurrency: { type: String, required: true },
  targetPrice: { type: Number, required: true },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

// Route for handling form submissions
app.post("/subscribe", (req, res) => {
  const { email, cryptocurrency, targetPrice } = req.body;

  // Create a new Subscription document using the model
  const newSubscription = new Subscription({
    email: email,
    cryptocurrency: cryptocurrency,
    targetPrice: targetPrice,
  });

  // Save the new subscription document to the database
  newSubscription.save((err, savedSubscription) => {
    if (err) {
      console.error("Error saving subscription:", err);
      return res
        .status(500)
        .send("An error occurred while processing your request.");
    }

    console.log("Subscription details saved to MongoDB!");

    // Send the "Thank you" email using Nodemailer
    sendEmailConfirmation(email, cryptocurrency, targetPrice)
      .then(() => {
        console.log("Email sent successfully!");
        res.send(
          "Thank you for subscribing! Check your email for confirmation."
        );
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        res
          .status(500)
          .send("An error occurred while processing your request.");
      });
  });
});

// Function to send email confirmation
async function sendEmailConfirmation(email, cryptocurrency, targetPrice) {
  // Read the "Thank you" email template (Replace 'thankyou.html' with your email template file)
  const thankYouEmailTemplate = require("fs").readFileSync(
    "thankyou.html",
    "utf-8"
  );

  // Fetch the current price of the chosen cryptocurrency (You can replace this with your own API if needed)
  const { data: currentPriceData } = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${cryptocurrency}&vs_currencies=usd`
  );
  const currentPrice = currentPriceData[cryptocurrency].usd;

  // Prepare the email content using the template
  const emailContent = thankYouEmailTemplate
    .replace("{{ name }}", "Subscriber") // Replace with the user's name if you have it
    .replace("{{ cryptocurrency }}", cryptocurrency)
    .replace("{{ priceAtSubscription }}", currentPrice)
    .replace("{{ targetPrice }}", targetPrice);

  // Create a Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: "yourcompany@example.com", // Replace with your company's email address
      pass: "your_email_password", // Replace with your email password
    },
  });

  // Send the "Thank you" email using Nodemailer
  await transporter.sendMail({
    from: "yourcompany@example.com", // Replace with your company's email address
    to: email,
    subject: "Thank You for Subscribing!",
    html: emailContent,
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});