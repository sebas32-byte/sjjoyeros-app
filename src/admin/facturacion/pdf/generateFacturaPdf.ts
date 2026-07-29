import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { createIcons, icons } from "lucide";

interface GenerateFacturaPdfOptions {
  element: HTMLElement;
  fileName?: string;
}

export async function generateFacturaPdf({
  element,
  fileName = "factura-sj-joyeros.pdf",
}: GenerateFacturaPdfOptions): Promise<void> {
  const previousInlineWidth = element.style.width;
  const previousInlineMaxWidth = element.style.maxWidth;
  const previousInlineMargin = element.style.margin;
  const previousInlineTransform = element.style.transform;
  const previousInlineOverflow = element.style.overflow;
  const previousInlineBoxSizing = element.style.boxSizing;
  const paymentModal = element.querySelector<HTMLElement>("#payment-modal");
  const previousPaymentModalDisplay = paymentModal?.style.display;

  try {
    element.style.width = "800px";
    element.style.maxWidth = "800px";
    element.style.margin = "0";
    element.style.transform = "none";
    element.style.overflow = "visible";
    element.style.boxSizing = "border-box";

    if (paymentModal) {
      paymentModal.style.display = "none";
    }

    createIcons({ icons });

    if (typeof document !== "undefined" && "fonts" in document) {
      await Promise.race([
        document.fonts.ready,
        new Promise<void>((resolve) => {
          window.setTimeout(() => resolve(), 2500);
        }),
      ]);
    }

    await Promise.race([
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
      new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 300);
      }),
    ]);

    const bounds = element.getBoundingClientRect();
    const captureWidth = Math.max(800, Math.ceil(bounds.width));
    const captureHeight = Math.max(Math.ceil(bounds.height), element.scrollHeight);

    const canvas = await html2canvas(element, {
      // Higher raster density prevents tiny 8px badge labels from disappearing after PDF scaling.
      scale: 4,
      useCORS: true,
      backgroundColor: "#e5e0d8",
      windowWidth: captureWidth,
      windowHeight: captureHeight,
      width: captureWidth,
      height: captureHeight,
      // Tailwind v4 can emit oklab/oklch tokens; foreignObject mode avoids parser limitations.
      foreignObjectRendering: true,
      imageTimeout: 15000,
      removeContainer: true,
      logging: false,
    });

    const imageData = canvas.toDataURL("image/png", 1);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const imgRatio = imgWidth / imgHeight;

    let renderWidth = pageWidth;
    let renderHeight = renderWidth / imgRatio;

    if (renderHeight > pageHeight) {
      renderHeight = pageHeight;
      renderWidth = renderHeight * imgRatio;
    }

    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;

    // MEDIUM compression keeps tiny badge text (8px) legible in the final PDF.
    pdf.addImage(imageData, "PNG", x, y, renderWidth, renderHeight, undefined, "MEDIUM");
    pdf.save(fileName);
  } finally {
    if (paymentModal) {
      paymentModal.style.display = previousPaymentModalDisplay ?? "";
    }

    element.style.width = previousInlineWidth;
    element.style.maxWidth = previousInlineMaxWidth;
    element.style.margin = previousInlineMargin;
    element.style.transform = previousInlineTransform;
    element.style.overflow = previousInlineOverflow;
    element.style.boxSizing = previousInlineBoxSizing;
  }
}
