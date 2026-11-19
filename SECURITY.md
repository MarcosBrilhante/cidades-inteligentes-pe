# Verificação de segurança — versão 1.0

Ambiente: desenvolvimento local Windows, Node.js, Vite, Edge/Playwright. Inspeção em 17/11/2026. Aplicação estática com dados agregados públicos; não recebe uploads, credenciais, pagamentos ou dados pessoais. Preferências de tema/filtros ficam no navegador.

| Fronteira | Controle e evidência | Estado |
| --- | --- | --- |
| Dados e renderização | Validação de schema, anos inteiros, IDs municipais, valores e denominadores; textos dinâmicos escapados; links de fontes limitados a HTTPS nos hosts oficiais. Testes rejeitam JSON inválido e preferências manipuladas. | Verificado no escopo local |
| Preferências | Valores persistidos passam por listas de municípios, anos e modos permitidos; JSON inválido cai nos padrões. Nenhum valor do storage é usado como código. | Verificado |
| Coleta | Importadores Node usam URLs oficiais definidas no código, timeout e validações estruturais; o parser SDS também limita o tamanho do PDF. Não há endpoint público para buscar URLs arbitrárias. Apenas dados agregados entram nos snapshots locais. | Inspeção e execução |
| URL e exportações | Parâmetros compartilhados passam por listas permitidas; CSV neutraliza células interpretáveis como fórmulas. PDF e PNG são gerados no navegador, sem envio dos filtros para serviços externos. Testes exercitam URL inválida e downloads reais. | Verificado localmente |
| Mapa e fontes | GeoJSON oficial servido localmente; sem localização do visitante ou mapas externos. Links de participação levam a páginas oficiais e não enviam manifestações automaticamente. | Inspeção e teste de navegação |
| Dependências de produção | `npm audit --omit=dev`: zero vulnerabilidades conhecidas. Chart.js e fontes locais; sem scripts de CDN. | Verificado na data |
| Dependências de desenvolvimento | Atualizados Vite para 8.3.8, Vitest para 5.1.0 e pdfjs-dist para 6.5.438. Removidos os alertas anteriores do leitor de PDF e pool de testes. Permanece o aviso descrito abaixo. | Pendência documentada |
| Servidor de desenvolvimento | Escuta em 127.0.0.1, sem exposição deliberada à rede. Não é servidor de produção. | Verificado |
| Autenticação, autorização, CSRF, pagamentos | Recursos ausentes nesta versão estática; nenhuma operação privilegiada pública. | Não aplicável |
| HTTPS, CSP, framing e headers do host | `public/_headers` prepara CSP, bloqueio de framing, nosniff e permissões para hosts compatíveis. Não existe implantação pública nesta entrega: aplicação efetiva dos headers e HTTPS precisam ser verificados no provedor. | Configuração preparada; produção não verificada |

## Aviso restante nas ferramentas

A auditoria completa retorna cinco entradas de severidade alta derivadas de **picomatch**, instalado na cadeia de Vite/Vitest (fdir/tinyglobby). [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) descreve ReDoS por padrões extglob maliciosos. A versão mais recente consultada foi 4.0.7, ainda abrangida pelo aviso. Não foi aplicado downgrade automático ou correção forçada que reintroduzisse outros alertas.

O projeto usa padrões de teste fixos, não oferece entrada de glob ao visitante e não inclui essas dependências no bundle do navegador. Não foi demonstrada uma exposição explorável na aplicação entregue. Mantenha o servidor de desenvolvimento local, não processe padrões arbitrários de terceiros nessas ferramentas e atualize a cadeia quando houver correção compatível. Reexecute build, testes e auditoria após atualizar.

## Limites

Não houve teste intrusivo contra SDS, IBGE ou outros domínios. A validação local e uma auditoria sem alertas de produção não garantem ausência de vulnerabilidades. Uma futura API, autenticação ou hospedagem exigirá revisão das novas fronteiras. Não há atestado de conformidade ou certificação de segurança.
