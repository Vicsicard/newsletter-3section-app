import type { NewsletterSection } from './newsletter';

export function generateEmailHTML(
  companyName: string,
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
          padding: 20px 0;
          border-bottom: 2px solid #eee;
        }
        .section {
          margin: 30px 0;
          padding: 20px;
          border-radius: 5px;
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section-title {
          color: #333;
          font-size: 24px;
          margin-bottom: 15px;
          font-weight: bold;
        }
        .section-content {
          color: #555;
          font-size: 16px;
          margin-bottom: 15px;
        }
        .section-image {
          width: 100%;
          max-width: 500px;
          height: auto;
          margin: 15px 0;
          border-radius: 5px;
        }
        .bullet-points {
          margin: 15px 0;
          padding-left: 20px;
        }
        .bullet-points li {
          margin-bottom: 8px;
          color: #555;
        }
        .takeaway {
          background-color: #f8f9fa;
          padding: 15px;
          margin-top: 15px;
          border-left: 4px solid #007bff;
          font-style: italic;
        }
        @media only screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .section {
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${companyName} Newsletter</h1>
        </div>
        ${sections.map((section, index) => {
          const content = section.content.split('\n').map(line => line.trim()).filter(Boolean);
          const sectionTypes = ['Pain Point Analysis', 'Common Mistakes', 'Company Solutions'];
          
          return `
            <div class="section">
              <h2 class="section-title">${section.title}</h2>
              ${section.imageUrl ? `<img src="${section.imageUrl}" alt="${section.title}" class="section-image">` : ''}
              <div class="section-content">
                ${content.map(paragraph => {
                  if (paragraph.startsWith('-')) {
                    // Handle bullet points
                    const bullets = content.filter(line => line.startsWith('-'));
                    return `
                      <ul class="bullet-points">
                        ${bullets.map(bullet => `<li>${bullet.substring(1).trim()}</li>`).join('')}
                      </ul>
                    `;
                  } else if (paragraph.toLowerCase().includes('takeaway')) {
                    // Handle takeaway section
                    return `<div class="takeaway">${paragraph}</div>`;
                  } else {
                    // Regular paragraph
                    return `<p>${paragraph}</p>`;
                  }
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </body>
    </html>
  `;
}

export function generatePlainText(
  companyName: string,
  sections: NewsletterSection[]
): string {
  return `
${companyName} Newsletter

${sections.map((section, index) => {
  return `
${section.title}
${section.content}

`;
}).join('\n')}
`;
}
