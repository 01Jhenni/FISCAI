const express = require('express');
const multer = require('multer');
const ftp = require('basic-ftp');
const cors = require('cors');
require('dotenv').config();
const { Readable } = require('stream');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
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

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function buscarEmpresaPorId(empresaId) {
  const { data, error } = await supabase
    .from('empresas')
    .select('nome')
    .eq('id', empresaId)
    .single();
  if (error) return null;
  return data;
}

app.post('/upload/:tipoArquivo/:empresaId/:mes', upload.single('arquivo'), async (req, res) => {
  const file = req.file;
  const { tipoArquivo, empresaId, mes } = req.params;
  if (!file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });

  const config = ftpConfigMap[tipoArquivo];
  const allowedExts = allowedTypes[tipoArquivo];
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (!config || !allowedExts || !allowedExts.includes(ext)) {
    return res.status(400).json({ erro: 'Tipo de arquivo ou extensão não suportado' });
  }

  // Buscar nome da empresa no Supabase
  const empresa = await buscarEmpresaPorId(empresaId);
  if (!empresa) {
    return res.status(400).json({ erro: 'Empresa não encontrada' });
  }
  let empresaNome = empresa.nome.normalize('NFD').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  empresaNome = empresaNome.replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  // Caminho sempre relativo à home do usuário FTP, sem barra no início
  const remoteDir = empresaNome;
  const remotePath = `${remoteDir}/${file.originalname}`;

  const client = new ftp.Client();
  try {
    console.log('Conectando ao FTP:', {
      host: process.env.FTP_HOST,
      port: process.env.FTP_PORT,
      user: config.user,
      remoteDir,
      remotePath
    });
    await client.access({
      host: process.env.FTP_HOST,
      port: Number(process.env.FTP_PORT) || 21,
      user: config.user,
      password: config.pass,
      secure: process.env.FTP_SECURE === 'true',
      secureOptions: { rejectUnauthorized: false }
    });
    // Garante que a pasta existe (relativa à home do usuário)
    await client.ensureDir(remoteDir);
    await new Promise(r => setTimeout(r, 500));
    const stream = Readable.from(file.buffer);
    console.log('Enviando para FTP:', file.originalname);
    await client.uploadFrom(stream, file.originalname);
    const userId = req.headers['x-user-id']; // ou obtenha do token/sessão
    // Salvar status de upload
    if (userId) {
      await supabase.from('uploads').insert([{
        usuario_id: userId,
        empresa_id: empresaId,
        tipo_arquivo: tipoArquivo,
        mes: mes
      }]);
    }
    res.json({ sucesso: true, mensagem: 'Arquivo enviado com sucesso!', remotePath: `${remoteDir}/${file.originalname}` });
  } catch (err) {
    console.error('Erro ao enviar para FTP:', err);
    res.status(500).json({ erro: 'Erro ao enviar para FTP: ' + err.message });
  }
  client.close();
});

app.get('/empresas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('id, nome, cnpj')
      .order('nome', { ascending: true });
    if (error) return res.status(500).json({ erro: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar empresas' });
  }
});

// Listar todos os usuários do Supabase Auth (requer service role key)
app.get('/usuarios', async (req, res) => {
  try {
    // Busca da tabela customizada:
    const { data, error } = await supabase.from('usuarios_custom').select('id, nome, email');
    if (error && error.code === '42P01') { // tabela não existe
      return res.json([]);
    }
    if (error) return res.status(500).json({ erro: error.message });
    res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuários' });
  }
});

// Criar novo usuário customizado
app.post('/usuarios', async (req, res) => {
  const { id, nome, email } = req.body;
  if (!id || !nome || !email) {
    return res.status(400).json({ erro: 'id, nome e email são obrigatórios' });
  }
  const { data, error } = await supabase.from('usuarios_custom').insert([{ id, nome, email }]);
  if (error) return res.status(500).json({ erro: error.message });
  res.status(201).json(data[0]);
});

// Editar nome do usuário
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  const { data, error } = await supabase
    .from('usuarios_custom')
    .upsert([{ id, nome }]);
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

// Listar empresas de um usuário
app.get('/usuarios/:id/empresas', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('usuarios_empresas')
    .select('empresa_id, empresas (id, nome, cnpj)')
    .eq('usuario_id', id);
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data.map(rel => rel.empresas));
});

// Atualizar empresas de um usuário
app.put('/usuarios/:id/empresas', async (req, res) => {
  const { id } = req.params;
  const { empresas } = req.body; // array de empresa_id
  // Remove todas as permissões antigas
  await supabase.from('usuarios_empresas').delete().eq('usuario_id', id);
  // Adiciona as novas permissões
  const inserts = empresas.map(empresa_id => ({ usuario_id: id, empresa_id }));
  const { data, error } = await supabase.from('usuarios_empresas').insert(inserts);
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

// Listar todos os usuários autenticados do Supabase Auth
app.get('/usuarios-auth', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) return res.status(500).json({ erro: error.message });
    res.json(data.users.map(u => ({ id: u.id, email: u.email })));
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuários autenticados' });
  }
});

// Endpoint para consultar uploads feitos
app.get('/uploads', async (req, res) => {
  const { usuario_id, empresa_id, mes } = req.query;
  const { data, error } = await supabase
    .from('uploads')
    .select('tipo_arquivo')
    .eq('usuario_id', usuario_id)
    .eq('empresa_id', empresa_id)
    .eq('mes', mes);
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

// Endpoint para buscar tipos de arquivos permitidos de uma empresa
app.get('/empresas/:id/tipos-arquivos', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('empresas_tipos_arquivos')
    .select('tipo_arquivo')
    .eq('empresa_id', id);
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data.map(d => d.tipo_arquivo));
});

// Endpoint para atualizar tipos de arquivos permitidos de uma empresa
app.put('/empresas/:id/tipos-arquivos', async (req, res) => {
  const { id } = req.params;
  const { tipos } = req.body; // array de strings
  console.log('Recebido para empresa', id, 'tipos:', tipos);
  // Remove antigos
  await supabase.from('empresas_tipos_arquivos').delete().eq('empresa_id', id);
  // Adiciona novos
  const inserts = (tipos || []).map(tipo => ({ empresa_id: id, tipo_arquivo: tipo }));
  console.log('Inserts:', inserts);
  const { data, error } = await supabase.from('empresas_tipos_arquivos').insert(inserts);
  if (error) {
    console.error('Erro ao inserir tipos permitidos:', error);
    return res.status(500).json({ erro: error.message });
  }
  res.json(data);
});

app.listen(3001, () => console.log('Backend rodando na porta 3001'));