# Direção visual — Cidades Inteligentes PE

Premissa: sair de uma pergunta simples sobre a cidade para uma comparação verificável. A primeira tela apresenta território e propósito; depois os filtros, quatro medidas, gráficos, interpretações e fontes. O cenário de prédios é uma ilustração abstrata em CSS, sem representar geometria ou valores reais.

As referências fornecidas orientam a navegação e a hierarquia do PulseMetrics, as cores frias e composição territorial do Fetadify, a comparação do Page Speed Test e a profundidade sutil dos painéis do RevenuePulse. Não foram incorporadas suas marcas ou imagens de dados. A arquitetura recomendada de landing page da pesquisa UI/UX não se aplicava; foi descartada. Mantidas a direção de dashboard e as exigências do usuário.

Tokens de cor estão em `src/styles/tokens.css`: fundo #0B1220, sidebar #101827, painéis #141E30, bordas #263247, primária #19C6B5, texto #F8FAFC. O texto secundário foi ligeiramente clareado para legibilidade. Tema claro com fundo #F6F8FC e verde mais escuro para contraste.

Inter local, títulos de 29–44 px, números tabulares e valores destacados. Cores fixas por município: Recife verde-azulado, Olinda azul e Paulista lilás. Diferenças não recebem vermelho/verde de forma automática. Valores e nomes complementam a codificação por cores; a segunda série usa linha tracejada.

Mobile: filtros empilhados, cartões em uma coluna nos menores tamanhos e duas quando há espaço; gráficos de largura completa. Desktop: sidebar fixa, filtros horizontais, quatro cartões e gráficos lado a lado. Menu móvel com Escape, contenção/restauração de foco e conteúdo externo inerte.

Movimento: transições de cor de 180 ms, abertura do menu em 200 ms, atualização de gráficos em 220 ms. Servem para dar feedback. `prefers-reduced-motion` remove transições, shimmer e animação de gráficos. Não há parallax, cursor especial ou efeitos dependentes de hover para acessar informações.

Metas: sem rolagem horizontal da página em 320 px, controles principais de 44 px, campos rotulados, foco visível, canvas acompanhado por tabela e estados explícitos para dados ausentes. Verificação local em Edge não substitui teste em aparelhos físicos.

## Refinamento editorial — 18/11/2026

A direção existente foi preservada. Após os gráficos, o bloco “Por trás do indicador” apresenta conceito, unidade, periodicidade e um exemplo aplicado ao filtro ativo. Três detalhes nativos separam método, limitações e perguntas, mantendo resumos visíveis e interação por toque/teclado. Metodologia ganha tabela de cobertura, percurso numerado e glossário; mapa, histórico e relatórios recebem guias próprios. Textos de leitura usam 14 px com entrelinha de 1,8, colunas apenas quando há espaço e superfícies já definidas nos tokens.

As buscas locais UI/UX por divulgação progressiva não retornaram orientação específica adequada; os resultados genéricos não foram tratados como evidência. A escolha de detalhes nativos e tabela com região de rolagem focável foi uma decisão de implementação, validada em navegador. As definições adicionais foram consultadas em SDS, INEP e metadados IBGE; os dados estatísticos não foram alterados.

## Aparência e motion — versão 1.2, 18/11/2026

Premissa: um painel de observação urbana. Azul profundo e verde-água permanecem; superfícies têm translucidez sutil, borda superior iluminada e sombras contidas. A cidade anterior em CSS foi substituída por uma ilustração vetorial isométrica, sem representação de dados. O tema claro usa superfícies quase opacas para preservar contraste. A composição do hero cresce em duas colunas a partir de 800 px, mantendo uma ilustração compacta no celular.

| Movimento | Gatilho e duração | Finalidade |
| --- | --- | --- |
| Título e seções | Navegação; 560–700 ms, defasagem de 70 ms por grupo visível | Orientar a entrada do conteúdo |
| Cidade e conexões | Navegação; construção em 1 s, traçado em 2,4 s, sinal em três ciclos de 1,5 s | Reforçar a identidade urbana; termina sem loop contínuo |
| Valores | Atualização dos filtros; 420 ms, valores finais preservados | Evidenciar o resultado atualizado |
| Gráficos | Criação/atualização; 650 ms | Apresentar a comparação |
| Detalhes | Abertura; 260 ms | Acompanhar a expansão do conteúdo |
| Hover e toque | 180–320 ms; elevação discreta, estados de pressão | Feedback dos controles e cartões |

O controle de motion usa preferência local e respeita mudanças de prefers-reduced-motion em tempo real. Desativar cancela efeitos em andamento e finaliza gráficos. Entrada por teclado finaliza o movimento do bloco focado. Seções não recebem ocultação prévia em CSS; o caminho sem animação continua legível. Sem alteração do scroll, parallax ou dependência de hover.

Implementação com CSS e APIs nativas, sem dependência adicional: [Element.animate](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate) e [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). A pesquisa UI/UX local corroborou duração por contexto, movimento reduzido e evitar excesso de elementos animados.
