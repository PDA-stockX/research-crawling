const fs = require('fs');
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

try {
    // JSON 파일 읽기
    const credentialsData = fs.readFileSync('../pdfservices-api-credentials.json', 'utf8');
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

    // Create an ExecutionContext using credentials and create a new operation instance.
    const executionContext = PDFServicesSdk.ExecutionContext.create(credentialsInstance),
        exportPDF = PDFServicesSdk.ExportPDF,
        exportPDFOperation = exportPDF.Operation.createNew(exportPDF.SupportedTargetFormats.DOCX);

    // Set operation input from a source file.
    const fileName = "1709769143260"
    const input = PDFServicesSdk.FileRef.createFromLocalFile('../resources/' + fileName + '.pdf');
    exportPDFOperation.setInput(input);

    // Create a new ExportPDFOptions instance from the specified OCR locale and set it into the operation.
    const options = new exportPDF.options.ExportPDFOptions(exportPDF.options.ExportPDFOptions.OCRSupportedLocale.EN_US);
    exportPDFOperation.setOptions(options);

    //Generating a file name
    let outputFilePath = createOutputFilePath();

    // Execute the operation and Save the result to the specified location.
    exportPDFOperation.execute(executionContext)
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
        return ("output/" + fileName + ".docx");
    }

} catch (err) {
    console.log('Exception encountered while executing operation', err);
}
