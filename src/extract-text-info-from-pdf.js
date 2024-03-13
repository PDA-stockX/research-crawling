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

const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');
/**
 * This sample illustrates how to extract Text Information from PDF.
 * <p>
 * Refer to README.md for instructions on how to run the samples & understand output zip file.
 */

class ExtractPDF {
    constructor(fileName) {
        const credentialsData = fs.readFile(path.resolve(__dirname, '../pdfservices-api-credentials.json'), 'utf8'); // 비동기 파일 읽기 사용
        const credentials_data = JSON.parse(credentialsData);
        const client_id = credentials_data.client_credentials.client_id;
        const client_secret = credentials_data.client_credentials.client_secret;

        this.credentials =  PDFServicesSdk.Credentials
        .servicePrincipalCredentialsBuilder()
        .withClientId(client_id)
        .withClientSecret(client_secret)
        .build();

        // Create an ExecutionContext using credentials
        this.executionContext = PDFServicesSdk.ExecutionContext.create(credentials);
        // Build extractPDF options
        const options = new PDFServicesSdk.ExtractPDF.options.ExtractPdfOptions.Builder()
            .addElementsToExtract(PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT).build()

        this.extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew(),
        input = PDFServicesSdk.FileRef.createFromLocalFile(
            path.resolve(__dirname, `../resources/${fileName}.pdf`),
            PDFServicesSdk.ExtractPDF.SupportedSourceFormat.pdf
        );
        this.extractPDFOperation.setInput(input);
        this.extractPDFOperation.setOptions(options);

        this.outputFilePath = createOutputFilePath(fileName);
    }
}


try {   
    //Generating a file name

    async function extract(filename) {
        const extractPDF = await new ExtractPDF(filename);
        return await extractPDF.extractPDFOperation.execute(executionContext)
        .then(result => result.saveAsFile(extractPDF.outputFilePath))
        .catch(err => {
            if(err instanceof PDFServicesSdk.Error.ServiceApiError
                || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
                console.log('Exception encountered while executing operation', err);
            } else {
                console.log('Exception encountered while executing operation', err);
            }
        });
    }

    async function combine() {
        const zip = new AdmZip(outputFilePath);
        const jsonString = zip.readAsText('structuredData.json');
        const data = JSON.parse(jsonString).elements
            .filter(element => element.Page === 0 && element.Text)
            .map(element => element.Text)
            .join('|');
        return data
    }


    //Generates a string containing a directory structure and file name for the output file.
    function createOutputFilePath(fileName) {
        let date = new Date();
        let dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + "-" +
            ("0" + date.getMinutes()).slice(-2) + "-" + ("0" + date.getSeconds()).slice(-2);
        return (path.resolve(__dirname, `./output/${fileName}.zip`));
    }

} catch (err) {
    console.log('Exception encountered while executing operation', err);
}

module.exports = {extract, combine}