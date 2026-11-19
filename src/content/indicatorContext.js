const education = {
  title: "Aprendizagem e trajetória escolar, juntas.",
  summary:
    "O IDEB reúne aprovação escolar e desempenho no Saeb. A leitura faz mais sentido quando a etapa, a rede e o ano são os mesmos.",
  measures:
    "Índice de 0 a 10 calculado a partir do fluxo escolar, obtido no Censo Escolar, e do desempenho nas avaliações do Saeb. Os resultados aqui representam a rede pública no município.",
  reading:
    "Um resultado mais alto indica um IDEB maior naquele recorte. Para entender a mudança, é preciso examinar os componentes de aprovação e aprendizagem; o índice sozinho não mostra qual deles mudou.",
  limits: [
    "A média municipal não descreve cada escola ou estudante.",
    "Anos iniciais e finais são etapas diferentes: não use a diferença entre elas como evolução da mesma turma.",
    "A série é bienal. Um intervalo entre edições não representa queda, zero ou dado perdido.",
  ],
  questions: [
    "Como variaram a aprovação e o desempenho no Saeb na mesma etapa?",
    "Os resultados são semelhantes entre as escolas da rede?",
    "Quais ações e metas estão previstas para essa etapa escolar?",
  ],
  formula:
    "Fluxo escolar (aprovação) e desempenho no Saeb, em escala de 0 a 10",
  frequency: "Edições bienais",
  sourceLabel: "INEP · Como o IDEB é calculado",
  source:
    "https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb",
};

export const contexts = {
  mvi: {
    title: "Entender a letalidade exige olhar além do total.",
    summary:
      "O total dimensiona vítimas registradas. A taxa relaciona esse número ao tamanho da população, permitindo outra leitura da comparação.",
    measures:
      "Vítimas de mortes violentas intencionais registradas pela SDS. A definição reúne diferentes categorias de crimes e inclui mortes por intervenção legal de agentes do Estado. Uma ocorrência pode envolver mais de uma vítima.",
    reading:
      "Compare o total para conhecer o volume registrado e a taxa por 100 mil habitantes para considerar o tamanho da população. Uma redução descreve a série; não identifica, por si só, a política ou o fator responsável.",
    limits: [
      "MVI não representa todos os crimes e não equivale ao indicador CVLI.",
      "A média municipal não informa a situação de um bairro, horário ou pessoa.",
      "Sem população compatível com o ano, esta plataforma não calcula a taxa. A ausência não significa que não houve vítimas.",
    ],
    questions: [
      "A diferença entre os municípios permanece ao comparar taxas?",
      "A mudança aparece em vários anos ou em apenas um período?",
      "Quais ações de prevenção foram previstas e quais resultados estão documentados?",
    ],
    formula: "Vítimas ÷ população estimada do mesmo ano × 100.000",
    frequency: "Anos completos · janeiro a dezembro",
    sourceLabel: "SDS/PE · Definição de MVI",
    source:
      "https://www.sds.pe.gov.br/estatisticas/indicadores-criminais/mortes-violentas-intencionais-mvi",
  },
  "ideb-initial": { ...education, stage: "Anos iniciais · rede pública" },
  "ideb-final": { ...education, stage: "Anos finais · rede pública" },
  sewer: {
    title: "A conexão ao esgotamento é uma parte da história.",
    summary:
      "Este recorte do Censo descreve a forma de esgotamento dos domicílios. Ele ajuda a observar a cobertura, mas não informa o tratamento do esgoto.",
    measures:
      "Percentual da população residente em domicílios particulares permanentes com rede geral, rede pluvial ou fossa séptica ligada à rede, segundo o Censo 2022. A unidade é população, e não quantidade de domicílios.",
    reading:
      "Um percentual maior significa maior participação da população na categoria medida. Ao comparar duas cidades, a distância entre os percentuais é expressa em pontos percentuais.",
    limits: [
      "O indicador não informa volume tratado, continuidade ou qualidade do serviço.",
      "O restante da população pode utilizar outras soluções; não pode ser classificado automaticamente como sem qualquer esgotamento.",
      "A definição de 2010 é diferente. Mantemos somente 2022, sem construir uma tendência artificial.",
    ],
    questions: [
      "Quais formas de esgotamento atendem o restante da população?",
      "Há informações separadas sobre coleta e tratamento?",
      "Quais territórios e etapas estão previstos nos planos de expansão?",
    ],
    formula:
      "População na categoria medida ÷ população do universo domiciliar × 100",
    frequency: "Recorte censitário · 2022",
    sourceLabel: "IBGE · Definição e universo do indicador",
    source:
      "https://servicodados.ibge.gov.br/api/v1/pesquisas/indicadores/60030",
  },
  "infant-mortality": {
    title: "Uma taxa populacional para acompanhar a primeira infância.",
    summary:
      "A mortalidade infantil relaciona óbitos de menores de um ano e nascidos vivos. O denominador é diferente do usado na segurança pública.",
    measures:
      "Número de óbitos infantis segundo o município de residência do falecido, dividido pelos nascidos vivos segundo a residência da mãe, multiplicado por mil. A fonte é o DATASUS, republicada pelo IBGE.",
    reading:
      "Uma taxa menor representa menos óbitos em relação aos nascidos vivos naquele período. Para interpretar a evolução, consulte também os números que formam a taxa e a qualidade dos registros.",
    limits: [
      "Não é uma porcentagem nem uma taxa por mil habitantes.",
      "A oscilação de uma taxa não explica suas causas e não avalia isoladamente um serviço de saúde.",
      "Os dados são agregados: não permitem estimar o risco de uma criança ou orientar um atendimento individual.",
    ],
    questions: [
      "Como variaram os óbitos e os nascidos vivos no mesmo intervalo?",
      "Há mudanças ou revisões na cobertura dos registros?",
      "Quais informações adicionais existem sobre a atenção à gestante e à criança no município?",
    ],
    formula: "Óbitos de menores de um ano ÷ nascidos vivos × 1.000",
    frequency: "Série anual",
    sourceLabel: "IBGE / DATASUS · Definição da taxa",
    source:
      "https://servicodados.ibge.gov.br/api/v1/pesquisas/indicadores/30279",
  },
};

export const pageIntroductions = {
  dashboard:
    "Escolha uma pergunta, compare dois municípios e acompanhe o que mudou. As fontes e as explicações ajudam a transformar os números em uma leitura informada.",
  compare:
    "Veja o mesmo indicador, no mesmo período, para duas cidades. Observe a unidade, o tamanho da população e a evolução antes de tirar conclusões.",
  security:
    "Acompanhe vítimas de mortes violentas intencionais e taxas por população. Entenda a dimensão do registro e os limites de uma comparação territorial.",
  education:
    "Explore o IDEB da rede pública por etapa escolar. Conecte a leitura do índice às dimensões de aprendizagem e aprovação.",
  sanitation:
    "Observe a cobertura de esgotamento no Censo 2022 e conheça o que esse percentual revela sobre o acesso da população.",
  health:
    "Compare a mortalidade infantil e sua evolução. Leia a taxa junto de sua definição, do período e da qualidade dos registros.",
  reports:
    "Leve uma comparação verificável para seu trabalho, apresentação ou debate. Cada formato atende a um tipo de uso e preserva o contexto dos dados.",
};

export const glossary = [
  [
    "Valor absoluto",
    "Quantidade registrada, como o número de vítimas. Não considera sozinho o tamanho da população.",
  ],
  [
    "Taxa",
    "Relação entre um evento e uma população de referência. Confira sempre o denominador: habitantes e nascidos vivos não são equivalentes.",
  ],
  [
    "Pontos percentuais",
    "Diferença entre duas porcentagens. Exemplo didático: de 40% para 50% são +10 pontos percentuais e +25% de variação relativa.",
  ],
  [
    "Índice",
    "Medida construída a partir de componentes. O IDEB combina fluxo e desempenho em uma escala de 0 a 10; não é uma porcentagem.",
  ],
  [
    "Recorte e comparabilidade",
    "Município, ano, etapa, rede e definição determinam o que está sendo comparado. Mudar uma dessas dimensões pode mudar o significado do resultado.",
  ],
  [
    "Associação e causa",
    "Duas mudanças podem ocorrer juntas sem que uma cause a outra. Demonstrar causalidade exige investigação além de uma comparação de indicadores.",
  ],
  [
    "Referência e coleta",
    "Referência é o período descrito pelo indicador. Coleta é quando a plataforma obteve o arquivo. Uma coleta recente não torna o ano de referência mais recente.",
  ],
];
