import fs from 'fs';
import PDFServicesSdk from '@adobe/pdfservices-node-sdk';
import AdmZip from 'adm-zip';
import iconv from 'iconv-lite';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import getPDF from './getPDF.js';

async function useOcr(url) {
    try {
        // 자격 증명 설정
        const client_id = process.env.CLIENT_ID;
        const client_secret = process.env.CLIENT_SECRET;

        // Initial setup, create credentials instance.
        const credentials = PDFServicesSdk.Credentials
            .servicePrincipalCredentialsBuilder()
            .withClientId(client_id)
            .withClientSecret(client_secret)
            .build();

        // Create an ExecutionContext using credentials
        const executionContext = PDFServicesSdk.ExecutionContext.create(credentials);

        // Split first page
        const SplitPDF = PDFServicesSdk.SplitPDF;
        const splitPDFOperation = SplitPDF.Operation.createNew();

        const result = await getPDF(url);
        splitPDFOperation.setInput(PDFServicesSdk.FileRef.createFromStream(
            result.data,
            SplitPDF.SupportedSourceFormat.pdf,
            result.mediaType
        ));
        splitPDFOperation.setPageCount(1);

        // Build extractPDF options
        const options = new PDFServicesSdk.ExtractPDF.options.ExtractPdfOptions.Builder()
            .addElementsToExtract(PDFServicesSdk.ExtractPDF.options.ExtractElementType.TEXT)
            .build();

        // Create a new operation instance.
        const extractPDFOperation = PDFServicesSdk.ExtractPDF.Operation.createNew();

        // Set operation input from a source file.
        await splitPDFOperation.execute(executionContext)
            .then(result => {
                extractPDFOperation.setInput(result[0]);
            })
            .catch(err => console.log(err));

        // Set options
        extractPDFOperation.setOptions(options);

        // Execute the operation and save the result to a temporary file
        const outputFilePath = './temp2.zip';;
        await extractPDFOperation.execute(executionContext)
            .then(result => result.saveAsFile(outputFilePath));

        // Extract text data from the temporary zip file and return it
        // const zip = new AdmZip(outputFilePath);
        // const jsonString = zip.readAsText('structuredData.json');
        // const data = JSON.parse(jsonString).elements
        //     .filter(element => element.Text)
        //     .map(element => element.Text)
        //     .join(' ');
        const zip = new AdmZip(outputFilePath);
        const zipEntries = zip.getEntries(); // zip 파일 내의 모든 파일 항목

        // 'structuredData.json' 파일을 찾아서 그 내용을 읽어옴
        let jsonString;
        zipEntries.forEach((entry) => {
            if (entry.entryName === 'structuredData.json') {
                const contentBuffer = entry.getData(); // Buffer 형태로 데이터 읽어옴
                // iconv-lite를 사용하여 'euc-kr'로 디코딩
                jsonString = iconv.decode(contentBuffer, 'CP949');
            }
        });

        const data = JSON.parse(jsonString).elements
            .filter(element => element.Text)
            .map(element => element.Text)
            .join(' ');

        // Delete the temporary zip file
        fs.unlink(outputFilePath, (err) => {
            if (err) {
                console.error('Error deleting temporary file:', err);
            } else {
                console.log('Temporary file deleted successfully');
            }
        });

        console.log(data);
        return data;
    } catch (err) {
        console.log('Exception encountered while executing operation', err);
    }
}
useOcr("https://ssl.pstatic.net/imgstock/upload/research/company/1711067985855.pdf")
// export default useOcr;
