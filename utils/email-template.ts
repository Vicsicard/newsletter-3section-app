import type { NewsletterSection } from './newsletter';

export function generateEmailHTML(
  companyName: string,
  industrySummary: string,
  sections: NewsletterSection[]
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${companyName} Newsletter</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #e9ecef;
          border-radius: 5px;
        }
        .section-title {
          color: #333;
          font-size: 24px;
          margin-bottom: 15px;
        }
        .section-content {
          color: #555;
          font-size: 16px;
        }
        .section-image {
          width: 100%;
          max-width: 550px;
          height: auto;
          margin: 15px 0;
          border-radius: 5px;
        }
        .summary {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 5px;
          margin-bottom: 30px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #f8f9fa;
          color: #666;
          font-size: 14px;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .section-title {
            font-size: 20px;
          }
          .section-content {
            font-size: 14px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${companyName}</h1>
        </div>

        <div class="summary">
          <h2>Industry Insights</h2>
          ${industrySummary.split('\n').map(p => `<p>${p}</p>`).join('')}
        </div>

        ${sections.map((section, index) => `
          <div class="section">
            <h2 class="section-title">${section.title}</h2>
            ${section.imageUrl ? `
              <img 
                src="${section.imageUrl}" 
                alt="${section.title}" 
                class="section-image"
              />
            ` : ''}
            <div class="section-content">
              ${section.content.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
          </div>
        `).join('')}

        <div class="footer">
          <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          <p>You received this email because you subscribed to our newsletter.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Function to create a plain text version for email clients that don't support HTML
export function generatePlainText(
  companyName: string,
  industrySummary: string,
  sections: NewsletterSection[]
) {
  return `
${companyName} Newsletter

Industry Insights
----------------
${industrySummary}

${sections.map(section => `
${section.title}
${'-'.repeat(section.title.length)}
${section.content}

`).join('\n')}

© ${new Date().getFullYear()} ${companyName}. All rights reserved.
You received this email because you subscribed to our newsletter.
  `.trim();
}
