import PDFServicesSdk from '@adobe/pdfservices-node-sdk';
import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import downloadPDF from './downloadPDF.js'

const splittedPDF = async (url) => {
    const tempPath = './temp.pdf'

    //Generating a file name
    const pdfPath = './splitted.pdf';

    try {
        // Initial setup, create credentials instance.
        const credentials = PDFServicesSdk.Credentials
            .servicePrincipalCredentialsBuilder()
            .withClientId(process.env.PDF_SERVICES_CLIENT_ID)
            .withClientSecret(process.env.PDF_SERVICES_CLIENT_SECRET)
            .build();

        //Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
            SplitPDF = PDFServicesSdk.SplitPDF,
            splitPDFOperation = SplitPDF.Operation.createNew();

        // Set operation input from a source file.
        const input = PDFServicesSdk.FileRef.createFromLocalFile(
            tempPath,
            PDFServicesSdk.SplitPDF.SupportedSourceFormat.pdf
        );
        splitPDFOperation.setInput(input);

        // Provide any custom configuration options for the operation.
        splitPDFOperation.setPageCount(4);

        await downloadPDF(url, tempPath);

        // Execute the operation and Save the result to the specified location.
        await splitPDFOperation.execute(executionContext)
            .then(async result => {
                let saveFilesPromises = [];
                for (let i = 0; i < result.length; i++) {
                    saveFilesPromises.push(result[i].saveAsFile(pdfPath));
                }
                await Promise.all(saveFilesPromises);
            })
            .catch(err => {
                if (err instanceof PDFServicesSdk.Error.ServiceApiError
                    || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
                    console.log('Exception encountered while executing operation', err);
                } else {
                    console.log('Exception encountered while executing operation', err);
                }
            });

        return pdfPath;
    } catch (err) {
        console.log('Exception encountered while executing operation', err);
    } finally {
        await fs.unlink(tempPath);
    }
}

const ocr = async (url) => {
    const pdfPath = await splittedPDF(url);

    //Generating a file name
    const outputFilePath = './searchable.pdf';

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
        const input = PDFServicesSdk.FileRef.createFromLocalFile(pdfPath);
        ocrOperation.setInput(input);

        // Provide any custom configuration options for the operation.
        const options = new PDFServicesSdk.OCR.options.OCROptions.Builder()
            .withOcrType(PDFServicesSdk.OCR.options.OCRSupportedType.SEARCHABLE_IMAGE_EXACT)
            .withOcrLang(PDFServicesSdk.OCR.options.OCRSupportedLocale.KO_KR)
            .build();
        ocrOperation.setOptions(options);

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

        return outputFilePath;
    } catch (err) {
        console.log('Exception encountered while executing operation', err);
    } finally {
        await fs.unlink(pdfPath);
    }
}
const result = ocr("https://ssl.pstatic.net/imgstock/upload/research/company/1711067985855.pdf") // 미래에셋
// const result2 = ocr("https://ssl.pstatic.net/imgstock/upload/research/company/1711928403013.pdf") // 유안타증권

// export default ocr;