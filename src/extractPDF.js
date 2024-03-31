const fs = require('fs').promises; // fs 모듈을 promise 기반으로 사용
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const AdmZip = require('adm-zip');
const path = require('path');

async function extractPDF(fileName) {
    try {
        // JSON 파일 읽기
        const credentialsData = await fs.readFile(path.resolve(__dirname, '../pdfservices-api-credentials.json'), 'utf8'); // 비동기 파일 읽기 사용
        const credentials = JSON.parse(credentialsData);

        // 자격 증명 설정
        const client_id = credentials.client_credentials.client_id;
        const client_secret = credentials.client_credentials.client_secret;

        // Initial setup, create credentials instance.
        const credentialsInstance = PDFServicesSdk.Credentials
            .servicePrincipalCredentialsBuilder()
            .withClientId(client_id)
            .withClientSecret(client_secret)
            .build();

        const configBuilderInstance = PDFServicesSdk.ClientConfig;

        const clientConfig = configBuilderInstance
            .clientConfigBuilder()
            .withConnectTimeout(1000 * 10) // 10 seconds
            .withReadTimeout(1000 * 60) // 1 minute
            .withProcessingTimeout(1000 * 60 * 10) // 10 minutes
            .build();

        // Create an ExecutionContext using credentials
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentialsInstance);

        // Build extractPDF options
        const options = new PDFServicesSdk.ExtractPDF.options.ExtractPdfOptions.Builder()
            .addElementsToExtract(PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT)
            .build();

        // Create a new operation instance.
        const extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew();
        const input = PDFServicesSdk.FileRef.createFromLocalFile(
            path.resolve(__dirname, `../resources/${fileName}.pdf`),
            PDFServicesSdk.ExtractPDF.SupportedSourceFormat.pdf
        );

        // Set operation input from a source file.
        extractPDFOperation.setInput(input);

        // Set options
        extractPDFOperation.setOptions(options);

        // Execute the operation and save the result to a temporary file
        const outputFilePath = path.resolve(__dirname, `./output/${fileName}.zip`);
        await extractPDFOperation.execute(executionContext)
            .then(result => result.saveAsFile(outputFilePath));

        // Extract text data from the temporary zip file and return it
        const zip = new AdmZip(outputFilePath);
        const jsonString = zip.readAsText('structuredData.json');
        const data = JSON.parse(jsonString).elements
            .filter(element => element.Page === 0 && element.Text)
            .map(element => element.Text)
            .join(' ');

        // Delete the temporary zip file
        await fs.unlink(outputFilePath); // 비동기 파일 삭제 사용

        return data;
    } catch (err) {
        console.log('Exception encountered while executing operation', err);
    }
}

module.exports = extractPDF;
