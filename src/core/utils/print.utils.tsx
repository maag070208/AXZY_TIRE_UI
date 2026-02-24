import React from "react";
import { createRoot } from "react-dom/client";

export const printComponent = (
  component: React.ReactNode,
  title = "Ticket de Compra"
) => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.write(`
    <html>
      <head>
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page { margin: 0; size: 80mm auto; }
          body { 
             margin: 0; 
             padding: 0; 
             background: #fff; 
             color: #000; 
             font-family: 'Courier New', Courier, monospace; 
             font-size: 11px; 
             display: flex;
             justify-content: center;
          }
          .ticket { 
             width: 80mm; 
             padding: 4mm;
             box-sizing: border-box;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .text-lg { font-size: 14px; }
          .text-xl { font-size: 16px; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
          .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; vertical-align: top; padding: 2px 0; }
          th { border-bottom: 1px solid #000; padding-bottom: 4px; }
        </style>
      </head>
      <body>
        <div id="print-root"></div>
      </body>
    </html>
  `);
  iframeDoc.close();

  // Copy stylesheets to respect basic Tailwind if needed (though inline styles above are safer for thermal printers)
  const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
  styles.forEach((style) => {
    iframeDoc.head.appendChild(style.cloneNode(true));
  });

  const rootEl = iframeDoc.getElementById("print-root");
  if (rootEl) {
    const root = createRoot(rootEl);
    root.render(component);

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
};
