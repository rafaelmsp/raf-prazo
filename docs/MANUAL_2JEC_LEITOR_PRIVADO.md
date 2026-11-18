# RAF-PRAZO — Manual Operacional do 2º JEC | edição protegida

## Documento e classificação

- Manual Operacional do Estagiário na Serventia — 2º Juizado Especial Cível de Duque de Caxias/RJ.
- Edição 10/11/2026, 113 páginas, autoria declarada Rafael MS Passos.
- Na página 2 consta **USO RESTRITO · CONTROLE INDIVIDUAL**.

## Distribuição solicitada — PDF criptografado

Atendendo à solicitação explícita do responsável, o repositório **público** distribui **somente o arquivo PDF criptografado com AES-256** em:

`docs/Manual_Operacional_2JEC_113p_Protegido_por_Senha.pdf`

A área **Manual do 2º JEC** do RAF-PRAZO (`#manual`) oferece dois botões: **Abrir PDF protegido** e **Baixar PDF protegido**. O botão Abrir carrega o arquivo em uma nova aba, onde o leitor do navegador normalmente solicitará a senha. O botão Baixar oferece a cópia criptografada.

**Atenção:** qualquer pessoa pode baixar o PDF criptografado pela URL pública e tentar adivinhar sua senha. A proteção não é equivalente a autenticação de usuário, controle de acesso, revogação, expiração nem registro de acessos. Arquivos PDF não oferecem um campo separado de login; a senha de leitura **não fica no código** nem em um teste público. A distribuição pública de documentos operacionais restritos exige autorização e avaliação do conteúdo pelo responsável antes de divulgar a senha.

## Leitor local opcional

Além dos links diretos, o RAF-PRAZO mantém a opção de selecionar um PDF já salvo no dispositivo para visualizá-lo em um `iframe` por meio de URL `blob:`. Essa opção não envia o arquivo ao servidor, não o armazena e permite remover a visualização.

O PDF hospedado é outra coisa: seu arquivo criptografado é transferido ao navegador somente quando o usuário escolhe abrir ou baixar.

## Verificação e regressão

- O repositório deve conter apenas a **versão criptografada** do manual, não a versão original sem senha.
- `tests/test_manual_2jec.cjs` verifica assinatura PDF, tamanho e parâmetros de criptografia AES-256 (/V 5 e /R 6) sem armazenar a senha.
- `tests/browser_manual_2jec.py` verifica os links públicos por requisição HEAD e mantém testes de leitura local e de download do PDF sintético.
- A calculadora, os feriados, as 18 certidões, a categoria Pauta e o Balcão Virtual permanecem inalterados.
- O PDF possui aproximadamente 69 MB: pode consumir dados móveis; não o carregar automaticamente.

## Reversão

Para interromper a distribuição, remova o PDF publicado do repositório e dos links da aplicação. **Excluir somente o arquivo do branch atual não apaga cópias já baixadas nem o histórico de commits**; consulte o procedimento do GitHub para remoção de objetos sensíveis do histórico, quando aplicável.
