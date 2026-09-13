try {
    const pdfParse = require('pdf-parse');
    console.log('Type of export:', typeof pdfParse);
    console.log('Value:', pdfParse);
} catch (e) {
    console.error('Error requiring pdf-parse:', e.message);
}
