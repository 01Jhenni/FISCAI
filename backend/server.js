const express = require('express');
const multer = require('multer');
const ftp = require('basic-ftp');
const cors = require('cors');
require('dotenv').config();
const { Readable } = require('stream');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

const allowedTypes = {
  sped: ['txt'],
  nfe: ['xml', 'zip'],
  'nfs-tomado': ['pdf', 'xml', 'zip'],
  'nfs-prestado': ['xml', 'zip'],
  nfce: ['xml', 'zip'],
  'cte-entrada': ['xml', 'zip'],
  'cte-saida': ['xml', 'zip'],
  'cte-cancelado': ['xml', 'zip'],
  planilha: ['csv', 'xlsx'],
};

const ftpConfigMap = {
  sped: {
    user: process.env.FTP_USER_SPED,
    pass: process.env.FTP_PASS_SPED,
  },
  nfe: {
    user: process.env.FTP_USER_NFE,
    pass: process.env.FTP_PASS_NFE,
  },
  'nfs-tomado': {
    user: process.env.FTP_USER_NFS_TOMADO,
    pass: process.env.FTP_PASS_NFS_TOMADO,
  },
  'nfs-prestado': {
    user: process.env.FTP_USER_NFS_PRESTADO,
    pass: process.env.FTP_PASS_NFS_PRESTADO,
  },
  nfce: {
    user: process.env.FTP_USER_NFCE,
    pass: process.env.FTP_PASS_NFCE,
  },
  'cte-entrada': {
    user: process.env.FTP_USER_CTE_ENTRADA,
    pass: process.env.FTP_PASS_CTE_ENTRADA,
  },
  'cte-saida': {
    user: process.env.FTP_USER_CTE_SAIDA,
    pass: process.env.FTP_PASS_CTE_SAIDA,
  },
  'cte-cancelado': {
    user: process.env.FTP_USER_CTE_CANCELADO,
    pass: process.env.FTP_PASS_CTE_CANCELADO,
  },
  planilha: {
    user: process.env.FTP_USER_PLANILHA,
    pass: process.env.FTP_PASS_PLANILHA,
  },
};

app.post('/upload/:tipoArquivo/:empresaId/:mes', upload.single('arquivo'), async (req, res) => {
  const file = req.file;
  const { tipoArquivo } = req.params;
  if (!file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });

  const config = ftpConfigMap[tipoArquivo];
  const allowedExts = allowedTypes[tipoArquivo];
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (!config || !allowedExts || !allowedExts.includes(ext)) {
    return res.status(400).json({ erro: 'Tipo de arquivo ou extensão não suportado' });
  }

  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.FTP_HOST,
      port: Number(process.env.FTP_PORT) || 21,
      user: config.user,
      password: config.pass,
      secure: process.env.FTP_SECURE === 'true',
      secureOptions: { rejectUnauthorized: false }
    });
    const stream = Readable.from(file.buffer);
    await client.uploadFrom(stream, file.originalname);
    res.json({ sucesso: true, mensagem: 'Arquivo enviado com sucesso!', remotePath: file.originalname });
  } catch (err) {
    console.error('Erro ao enviar para FTP:', err);
    res.status(500).json({ erro: 'Erro ao enviar para FTP: ' + err.message });
  }
  client.close();
});

app.listen(3001, () => console.log('Backend rodando na porta 3001'));