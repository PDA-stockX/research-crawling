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
const fs = require('fs');
const AdmZip = require('adm-zip');

const OUTPUT_ZIP = './ExtractTextInfoFromPDF.zip';

//Remove if the output already exists.
if (fs.existsSync(OUTPUT_ZIP)) fs.unlinkSync(OUTPUT_ZIP);


// JSON 파일 읽기
const pj_dir = '/Users/dabinkim/workspace/pda/2024/front-pj/project_front'
const credentialsData = fs.readFileSync(pj_dir + '/pdfservices-api-credentials.json', 'utf8');
const credentials_data = JSON.parse(credentialsData);

// 자격 증명 설정
const client_id = credentials_data.client_credentials.client_id;
const client_secret = credentials_data.client_credentials.client_secret;

const credentials = PDFServicesSdk.Credentials
    .servicePrincipalCredentialsBuilder()
    .withClientId(client_id)
    .withClientSecret(client_secret)
    .build();

// Create an ExecutionContext using credentials
const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

// Create a new operation instance.
const fileName = "1709769143260"
const extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew(),
    input = PDFServicesSdk.FileRef.createFromLocalFile(
        pj_dir + '/resources/' + fileName + '.pdf',
        PDFServicesSdk.ExtractPDF.SupportedSourceFormat.pdf
    );

// Build extractPDF options
const options = new PDFServicesSdk.ExtractPDF.options.ExtractPdfOptions.Builder()
    .addElementsToExtract(PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT).build()


extractPDFOperation.setInput(input);
extractPDFOperation.setOptions(options);

// Execute the operation
extractPDFOperation.execute(executionContext)
    .then(result => result.saveAsFile(OUTPUT_ZIP))
    .then(() => {
        console.log('Successfully extracted information from PDF. Printing H1 Headers:\n');
        let zip = new AdmZip(OUTPUT_ZIP);
        let jsondata = zip.readAsText('structuredData.json');
        let data = JSON.parse(jsondata);
        data.elements.forEach(element => {
            if (element.Path.endsWith('/H1')) {
                console.log(element.Text);
            }
        });

    })
    .catch(err => console.log(err));