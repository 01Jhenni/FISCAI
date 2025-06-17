# 📊 FiscAI – Sistema Inteligente de Gestão Fiscal

**FiscAI** é um sistema web que centraliza e automatiza o envio, armazenamento e controle de arquivos fiscais, integrando-se a plataformas como **SIEG** e **Domínio Contábil**, visando eliminar retrabalhos manuais e garantir conformidade fiscal para empresas e escritórios de contabilidade.

---

## 📌 Objetivo

Automatizar o processo de recepção, organização e importação de documentos fiscais, eliminando a dependência de uploads manuais e aumentando a eficiência e rastreabilidade das rotinas contábeis.

---

## 🧩 Estrutura Funcional

### 🔐 Acesso Seguro
- Login por usuário e senha.
- Vinculação de empresas a cada cliente.

### 🗂️ Tipos de Arquivos Suportados
- **NFE (XML)**
- **NFC-e (XML)**
- **CT-e Entrada (XML)**
- **CT-e Saída (XML)**
- **SPED Fiscal (TXT)**
- **NFS-e Prestados (XML)**
- **NFS-e Tomados (PDF e XML)**

---

## ⚙️ Funcionamento Geral

### 1. Upload Inteligente
- Cliente escolhe a empresa e o tipo de arquivo para envio.
- Upload via web.
- Armazenamento na **Google Cloud Storage**.

### 2. Roteamento Automatizado

| Tipo de Arquivo     | Destino                              | Observações                                          |
|---------------------|---------------------------------------|------------------------------------------------------|
| NFE, NFC-e, CT-e    | API do Cofre da **SIEG**              | Envio via API. Exibe quantidade de notas enviadas.   |
| SPED Fiscal         | Pasta na Nuvem (Google Cloud)         | Nome da pasta: `codigo-nome_empresa/`                |
| NFS-e Tomados       | API externa de leitura e extração     | Retorna planilha `.csv`, salva na nuvem              |

### 3. Visualização e Relatórios
- Visualização dos arquivos já enviados.
- Relatórios por tipo, empresa e período.
- Histórico completo de uploads.

---

## 🔄 Integrações

- **SIEG**: Envio automatizado via API de XMLs fiscais.
- **Domínio**:
  - Rotina automática importa XMLs da SIEG.
  - SPEDs e CSVs direcionados para pastas específicas.
- **API externa NFS-e**: Extrai dados dos arquivos PDF/XML e retorna `.csv`.

---

## 🛠️ Melhorias Implementadas

| Anterior                        | FiscAI Solução                             |
|--------------------------------|--------------------------------------------|
| FTP e uploads manuais          | API + Interface Web + Armazenamento Cloud |
| Supabase para arquivos         | Google Cloud Storage                       |
| Falta de rastreabilidade       | Logs e histórico de envios                 |
| Conferência manual de importações | Planejamento de agente inteligente       |

---

## 🚧 Melhorias Futuras

- 🔎 **Agente de Validação Automatizada**
  - Lê os relatórios de importação da Domínio.
  - Sinaliza erros e advertências automaticamente.

- 📈 **Dashboard Gerencial**
  - Relatórios por cliente, empresa, tipo de nota.
  - Monitoramento de pendências e status de envios.

- 🧾 **Geração de Relatórios Inteligentes**
  - Exportação de relatórios por período.
  - Filtros por empresa, tipo e status do envio.

---

## 🧱 Stack Tecnológica

| Camada         | Tecnologia                             |
|----------------|----------------------------------------|
| Frontend       | React.js ou Next.js                    |
| Backend        | Node.js + Express                      |
| Armazenamento  | Google Cloud Storage + Firestore       |
| Autenticação   | Firebase Auth / IAM Google             |
| Integrações    | SIEG API, API externa NFS-e, Domínio   |

---

## 📞 Contato

> Sistema em desenvolvimento por **Jhennifer Ferreira Nascimento**  
> Analista e Desenvolvedora de Sistemas  
> GitHub: [github.com/01Jhenni](https://github.com/01Jhenni)
