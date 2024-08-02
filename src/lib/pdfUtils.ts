import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportToPDF = (elementId: string, fileName: string) => {
  const input = document.getElementById(elementId);
  if (input) {
    html2canvas(input, { scale: 2 }).then((canvas) => { // Increase scale for higher resolution
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "p", // Portrait orientation
        unit: "mm",
        format: "a4", // A4 format
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 20; // Leave some margin
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 10; // Starting position on the first page

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20; // Reduce the height of one page worth of content

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10; // Adjust the position
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(fileName);
    });
  }
};
