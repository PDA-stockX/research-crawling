import PDFServicesSdk from '@adobe/pdfservices-node-sdk';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import downloadPDF from './downloadPDF.js'

const splittedPDF = async (url) => {
    const tempPath = './temp.pdf'
    await downloadPDF(url, tempPath);

    try {
        // Initial setup, create credentials instance.
        const credentials = PDFServicesSdk.Credentials
            .servicePrincipalCredentialsBuilder()
            .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
            .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
            .build();

        //Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
            splitPDFOperation = PDFServicesSdk.SplitPDF.Operation.createNew();

        // Set operation input from a source file.
        const input = PDFServicesSdk.FileRef.createFromLocalFile(tempPath);
        splitPDFOperation.setInput(input);

        // Provide any custom configuration options for the operation.
        splitPDFOperation.setPageCount(2);

        //Generating a file name
        let splittedPdfPath = './splitted.pdf';

        // Execute the operation and Save the result to the specified location.
        splitPDFOperation.execute(executionContext)
            .then(result => result.saveAsFile(splittedPdfPath))
            .catch(err => {
                if (err instanceof PDFServicesSdk.Error.ServiceApiError
                    || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
                    console.log('Exception encountered while executing operation', err);
                } else {
                    console.log('Exception encountered while executing operation', err);
                }
            });
    } catch (err) {
        console.log('Exception encountered while executing operation', err);
    }

    // fs.unlink(pdfPath);
}
splittedPDF("https://ssl.pstatic.net/imgstock/upload/research/company/1711067985855.pdf") // 미래에셋

const ocr = async (url) => {
    try {
        // Initial setup, create credentials instance.
        const credentials = PDFServicesSdk.Credentials
            .servicePrincipalCredentialsBuilder()
            .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
            .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
            .build();

        //Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
            ocrOperation = PDFServicesSdk.OCR.Operation.createNew();

        // Set operation input from a source file.
        const input = PDFServicesSdk.FileRef.createFromLocalFile("");
        ocrOperation.setInput(input);

        // Provide any custom configuration options for the operation.
        const options = new PDFServicesSdk.OCR.options.OCROptions.Builder()
            .withOcrType(PDFServicesSdk.OCR.options.OCRSupportedType.SEARCHABLE_IMAGE_EXACT)
            .withOcrLang(PDFServicesSdk.OCR.options.OCRSupportedLocale.KO_KR)
            .build();
        ocrOperation.setOptions(options);

        //Generating a file name
        let outputFilePath = createOutputFilePath();

        // Execute the operation and Save the result to the specified location.
        ocrOperation.execute(executionContext)
            .then(result => result.saveAsFile(outputFilePath))
            .catch(err => {
                if (err instanceof PDFServicesSdk.Error.ServiceApiError
                    || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
                    console.log('Exception encountered while executing operation', err);
                } else {
                    console.log('Exception encountered while executing operation', err);
                }
            });

        //Generates a string containing a directory structure and file name for the output file.
        function createOutputFilePath() {
            let date = new Date();
            let dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
                ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + "-" +
                ("0" + date.getMinutes()).slice(-2) + "-" + ("0" + date.getSeconds()).slice(-2);
            return ("output/OCRPDFWithOptions/ocr" + dateString + ".pdf");
        }

    } catch (err) {
        console.log('Exception encountered while executing operation', err);
    }
}

// export default ocr;