/*
 * Copyright 2019 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. If you have received this file from a source other than Adobe,
 * then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 */
const fs = require('fs');
const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
const AdmZip = require('adm-zip');
/**
 * This sample illustrates how to extract Text Information from PDF.
 * <p>
 * Refer to README.md for instructions on how to run the samples & understand output zip file.
 */
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

    // Create an ExecutionContext using credentials
    const executionContext = PDFServicesSdk.ExecutionContext.create(credentialsInstance);

    // Build extractPDF options
    const options = new PDFServicesSdk.ExtractPDF.options.ExtractPdfOptions.Builder()
        .addElementsToExtract(PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT)
        .build()

    // Create a new operation instance.
    const fileName = "1709767859468"
    const extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew(),
        input = PDFServicesSdk.FileRef.createFromLocalFile(
            '../resources/' + fileName + '.pdf',
            PDFServicesSdk.ExtractPDF.SupportedSourceFormat.pdf
        );

    // Set operation input from a source file.
    extractPDFOperation.setInput(input);

    // Set options
    extractPDFOperation.setOptions(options);

    //Generating a file name
    let outputFilePath = createOutputFilePath();

    extractPDFOperation.execute(executionContext)
        .then(result => result.saveAsFile(outputFilePath))
        .then(() => {
            let zip = new AdmZip(outputFilePath);
            let jsonString = zip.readAsText('structuredData.json');
            // fs.writeFileSync("output/" + fileName + "2.json", jsonString);
            let data = JSON.parse(jsonString).elements
                .filter(element => element.Page === 0 && element.Text)
                .map(element => element.Text)
                .join('|');

            fs.writeFileSync("output/" + fileName + ".json", JSON.stringify(data));
            fs.unlinkSync(outputFilePath);
        })
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
        return ("output/" + fileName + ".zip");
    }

} catch (err) {
    console.log('Exception encountered while executing operation', err);
}
