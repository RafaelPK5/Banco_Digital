import express from 'express'
import fs from 'fs'
import PDFDocument from 'pdfkit'

const app = express();

app.post('/comprovante', async (req, res) => {
  // Obter as informações necessárias da requisição, como conta de origem, conta de destino e valor

  try {
    // Criar o comprovante em PDF
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream('comprovante.pdf');
    
    doc.pipe(writeStream);

    doc.text('COMPROVANTE DE TRANSFERÊNCIA', { align: 'center' });
    doc.moveDown();
    doc.text(`Conta de origem: ${contaOrigem}`, { indent: 20 });
    doc.text(`Conta de destino: ${contaDestino}`, { indent: 20 });
    doc.text(`Valor transferido: R$ ${valor.toFixed(2)}`, { indent: 20 });
    doc.moveDown();

    doc.end();

    // Enviar o comprovante em PDF como resposta da requisição
    writeStream.on('finish', () => {
      res.contentType('application/pdf');
      fs.createReadStream('comprovante.pdf').pipe(res);
    });
  } catch (error) {
    throw new error
  }
});

export default app
