const pad = (value: number) => String(value).padStart(2, '0');

export const createBridgeExportFilename = (
  presetId: string,
  date = new Date()
) => {
  const timestamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

  return `bridge-${presetId}-${timestamp}.png`;
};

const triggerDownload = (href: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
};

export const downloadCanvasPng = (
  canvas: HTMLCanvasElement,
  presetId: string,
  date = new Date()
) => {
  const fileName = createBridgeExportFilename(presetId, date);

  if (typeof canvas.toBlob === 'function') {
    canvas.toBlob((blob) => {
      if (!blob) {
        triggerDownload(canvas.toDataURL('image/png'), fileName);
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, fileName);
      queueMicrotask(() => URL.revokeObjectURL(objectUrl));
    }, 'image/png');
    return;
  }

  triggerDownload(canvas.toDataURL('image/png'), fileName);
};
