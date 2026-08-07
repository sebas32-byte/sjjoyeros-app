import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { createIcons, icons } from "lucide";

interface GenerateFacturaPdfOptions {
  element: HTMLElement;
  fileName?: string;
}

async function waitForTwoAnimationFrames(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function waitForImagesLoaded(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) {
        return;
      }

      if (typeof img.decode === "function") {
        try {
          await img.decode();
          return;
        } catch {
          // Fallback to load/error events below.
        }
      }

      await new Promise<void>((resolve) => {
        const done = () => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
          resolve();
        };

        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    })
  );
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
  const previousInlinePosition = element.style.position;
  const previousInlineLeft = element.style.left;
  const previousInlineTop = element.style.top;
  const previousInlineZIndex = element.style.zIndex;
  const previousInlinePointerEvents = element.style.pointerEvents;
  const paymentModal = element.querySelector<HTMLElement>("#payment-modal");
  const previousPaymentModalDisplay = paymentModal?.style.display;

  try {
    element.style.width = "800px";
    element.style.maxWidth = "800px";
    element.style.margin = "0";
    element.style.transform = "none";
    element.style.overflow = "visible";
    element.style.boxSizing = "border-box";
    element.style.position = "fixed";
    element.style.left = "0";
    element.style.top = "0";
    element.style.zIndex = "-1";
    element.style.pointerEvents = "none";

    if (paymentModal) {
      paymentModal.style.display = "none";
    }

    createIcons({ icons });

    if (typeof document !== "undefined" && "fonts" in document) {
      await document.fonts.ready;
    }

    await waitForTwoAnimationFrames();
    await waitForImagesLoaded(element);
    await waitForTwoAnimationFrames();

    const bounds = element.getBoundingClientRect();
    const captureWidth = Math.max(800, Math.ceil(bounds.width));
    const captureHeight = Math.max(Math.ceil(bounds.height), element.scrollHeight);

    const target = element;
    const targetRect = target.getBoundingClientRect();
    const targetStyle = getComputedStyle(target);
    const targetRootNode = target.getRootNode();
    const inShadowRoot = targetRootNode instanceof ShadowRoot;
    const inIframe = target.ownerDocument.defaultView !== window;
    const isDetached = !target.isConnected;
    const isInAriaHiddenTree = !!target.closest('[aria-hidden="true"]');
    const modalAncestor = target.closest('[role="dialog"], .modal, #payment-modal');
    const allInvoiceNodes = Array.from(document.querySelectorAll<HTMLElement>(".invoice-outer-border"));
    const firstVisibleInvoice = allInvoiceNodes.find((node) => !node.closest('[aria-hidden="true"]')) ?? null;
    const appearsOnScreen = targetRect.bottom > 0 && targetRect.right > 0 && targetRect.left < window.innerWidth && targetRect.top < window.innerHeight;

    console.log("[PDF_DEBUG] 1) before html2canvas", {
      target,
      targetOuterHtmlSnippet: target.outerHTML.slice(0, 1000),
      targetBoundingClientRect: {
        x: targetRect.x,
        y: targetRect.y,
        width: targetRect.width,
        height: targetRect.height,
        top: targetRect.top,
        right: targetRect.right,
        bottom: targetRect.bottom,
        left: targetRect.left,
      },
      targetOffsetWidth: target.offsetWidth,
      targetOffsetHeight: target.offsetHeight,
      targetScrollWidth: target.scrollWidth,
      targetScrollHeight: target.scrollHeight,
      computedDisplay: targetStyle.display,
      computedVisibility: targetStyle.visibility,
      computedOpacity: targetStyle.opacity,
      verification: {
        isVisibleInvoiceOnScreen: appearsOnScreen,
        targetMatchesFirstVisibleInvoice: firstVisibleInvoice ? target === firstVisibleInvoice : false,
        invoiceInstanceCount: allInvoiceNodes.length,
        targetInstanceIndex: allInvoiceNodes.indexOf(target),
        isInAriaHiddenTree,
        isInPortalLikeTree: !target.closest("#root"),
        hasModalAncestor: !!modalAncestor,
        inShadowRoot,
        inIframe,
        isDetached,
      },
    });
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#e5e0d8",
      windowWidth: captureWidth,
      windowHeight: captureHeight,
      width: captureWidth,
      height: captureHeight,
      foreignObjectRendering: true,
      imageTimeout: 15000,
      removeContainer: true,
      logging: false,
    });
    console.log("[PDF_DEBUG] 2) after html2canvas", {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });

    // Temporary debugging step: inspect html2canvas output before jsPDF.
    console.log("[PDF_DEBUG] 3) before canvas.toDataURL");
    const dataUrl = canvas.toDataURL("image/png");
    console.log("[PDF_DEBUG] 3) after canvas.toDataURL", {
      dataUrlLength: dataUrl.length,
    });
    console.log("[PDF_DEBUG] 4) immediately before window.open");
    const openedWindow = window.open(dataUrl, "_blank");
    console.log("[PDF_DEBUG] 5) immediately after window.open", {
      openedWindow,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      dataUrlLength: dataUrl.length,
    });
    return;

    const imageData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgRatio = canvas.width / canvas.height;

    let renderWidth = pageWidth;
    let renderHeight = renderWidth / imgRatio;

    if (renderHeight > pageHeight) {
      renderHeight = pageHeight;
      renderWidth = renderHeight * imgRatio;
    }

    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;
    pdf.addImage(imageData, "JPEG", x, y, renderWidth, renderHeight, undefined, "MEDIUM");
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
    element.style.position = previousInlinePosition;
    element.style.left = previousInlineLeft;
    element.style.top = previousInlineTop;
    element.style.zIndex = previousInlineZIndex;
    element.style.pointerEvents = previousInlinePointerEvents;
  }
}
