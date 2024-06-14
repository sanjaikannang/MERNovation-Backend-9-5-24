import nodemailer from 'nodemailer';

// Configure your email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sanjaikannang@gmail.com',
    pass: 'rmop fyel onrs kykk',
  },
});

// Function to send an email to the winning bidder
export const sendWinningBidEmail = async (winningBidderEmail, product) => {
  try {
    // Check if the winningBidderEmail is defined
    if (!winningBidderEmail) {
      // console.error('No recipient email address defined');
      return;
    }

    // const totalAmount = product.quantity * product.highestBid.amount;
    const totalBidAmount = product.quantity * product.startingPrice;
    const productPageUrl = `https://peaceful-cupcake-a7b594.netlify.app/buyer-product-details/${product.id}`;
    console.log("Pay Now Link :", productPageUrl);

    // Construct HTML email content
    const htmlContent = `
    <html>
      <head>
        <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }

          body, html {
              height: 100%;
              font-family: 'Sans-serif';
              background-color: #f7f7f7;
          }

          .app {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 2rem;
          }

          .mail__wrapper {
              max-width: 600px;
              width: 100%;
          }

          .mail__content {
              background-color: white;
              padding: 2rem;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
          }

          .content__header {
              text-align: center;
              border-bottom: 1px solid #eee;
          }

          .header__logo {
              color: #66BB6A;
              font-size: 1.5rem;
              font-weight: bold;
          }

          .header__title {
              font-size: 1.875rem;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 6rem;
          }

          .content__body {
              padding: 2rem 0;
              border-bottom: 1px solid #eee;
          }

          .content__body p {
              margin-bottom: 1rem;
          }

          .product-details {
              margin-top: 1rem;
          }

          .product-details th, .product-details td {
              padding: 0.5rem;
              text-align: left;
          }

          .invoice {
              margin: 2rem 0;
              padding: 1rem;
              background-color: #defadf;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .invoice h3 {
              margin-bottom: 1rem;
              text-align: center;
              font-size: 1.25rem;
              color: #333;
          }

          .invoice table {
              width: 100%;
              border-collapse: collapse;
          }

          .invoice th, .invoice td {
              padding: 0.75rem;
              text-align: left;
              border-bottom: 1px solid #ddd;
          }

          .invoice th {
              width: 50%;
          }

          .invoice td {
              width: 50%;
          }

          .confirm-button {
              width: 100%;
              padding: 1rem;
              background-color: #66BB6A;
              color: white;
              font-size: 0.875rem;
              text-transform: uppercase;
              border: none;
              border-radius: 0.25rem;
              cursor: pointer;
              margin-top: 2rem;
          }

          .closing-text {
              font-size: 0.875rem;
          }

          .content__footer {
              text-align: center;
              margin-top: 2rem;
          }

          .content__footer h3 {
              font-size: 1rem;
              margin-bottom: 1rem;
          }

          .content__footer p {
              font-size: 0.875rem;
          }

          .mail__meta {
              text-align: center;
              font-size: 0.875rem;
              color: #555;
              margin-top: 2rem;
          }

          .meta__social {
              display: flex;
              justify-content: center;
              margin-bottom: 1rem;
          }

          .social-link {
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: black;
              color: white;
              width: 2rem;
              height: 2rem;
              border-radius: 50%;
              text-decoration: none;
              margin-right: 0.5rem;
          }

          .social-link:last-child {
              margin-right: 0;
          }

          .meta__help a {
              color: #333;
              text-decoration: none;
          }

          .meta__help a:hover {
              text-decoration: underline;
          }

          /* Responsive Design */
          @media (max-width: 600px) {
              .header__title {
                  font-size: 1.5rem;
                  height: 5rem;
              }

              .confirm-button {
                  padding: 0.75rem;
                  font-size: 0.75rem;
              }

              .content__footer h3 {
                  font-size: 0.875rem;
              }
          }
        </style>
      </head>
      <body>
        <div class="app">
          <div class="mail__wrapper">
            <div class="mail__content">
              <div class="content__header">
                <div class="header__logo">HARVEST HUB</div>
                <h1 class="header__title">Congratulations! You Won the Bidding!</h1>
              </div>

              <div class="content__body">
                <p>
                  Dear, ${winningBidderEmail} <br /><br />
                  Congratulations! You won the bidding for the product
                  <strong>${product.name}</strong> on HarvestHub.
                </p>
                <div class="product-details">
                  <table>
                    <tr>
                      <th>Product Name:</th>
                      <td>${product.name}</td>
                    </tr>
                    <tr>
                      <th>Description:</th>
                      <td>${product.description}</td>
                    </tr>
                    <tr>
                      <th>Quantity:</th>
                      <td>${product.quantity}</td>
                    </tr>
                     <tr>
                      <th>Starting Price :</th>
                      <td>${product.startingPrice}</td>
                    </tr>
                    <tr>
                      <th>Your Bid Amount:</th>
                      <td>${product.highestBid.amount}</td>
                    </tr>
                  </table>
                </div>
                <div class="invoice">
                  <h3>Invoice</h3>
                  <table>
                    <tr>
                      <th>Product Quantity:</th>
                      <td>${product.quantity}</td>
                    </tr>                          
                    <tr>
                      <th>Total Bid Amount:</th>
                      <td>
  ( Quantity * Starting Price ) = ${totalBidAmount}
                      </td>
                    </tr>
                    <tr>
                      <th>Your Bid Amount: </th>
                      <td>${product.highestBid.amount}</td>
                    </tr>     
                  </table>
                </div>
                <p>Please make the payment for this product By Clicking the Pay Now Button Below or else Go to the HarverstHub Website and then Pay the Amount for the Product !</p>                
                <a href="${productPageUrl}" class="confirm-button">PAY NOW</a>
              </div>
              <div class="content__footer">
                <h3>Thanks for using HarvestHub!</h3>
                <p>www.harvesthub.io</p>
              </div>
            </div>

            <div class="mail__meta">
              <div class="meta__help">
                <p>
                  Questions or concerns?
                  <a href="mailto:harvesthub@gmail.com">harvesthub@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;

    // Set mail options
    const mailOptions = {
      from: 'HarvestHub <harvesthub@gmail.com>',
      to: winningBidderEmail,
      subject: 'Congratulations ! You Won The Bidding on HarvestHub!',
      html: htmlContent,
    };

    // console.log('Sending email to winning bidder...');

    // Send email
    await transporter.sendMail(mailOptions);
    // console.log('Email sent to winning bidder:', winningBidderEmail);
  } catch (error) {
    // console.error('Error sending email:', error);
  }
};
