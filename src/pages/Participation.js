import { categories } from "../services/catalog.js";
import { escapeHTML as e } from "../utils/formatters.js";
import { icon } from "../components/icons.js";
const areas = [
  {
    id: "security",
    problem:
      "Indicadores de violência ajudam a acompanhar problemas coletivos, mas não identificam sozinhos suas causas.",
    measures: [
      "Acompanhar indicadores e solicitar informações sobre políticas de prevenção.",
      "Participar de espaços públicos de discussão e acompanhar a prestação de contas.",
    ],
    title: "Pronasci · Segurança Pública com Cidadania",
    url: "https://www.gov.br/mj/pt-br/acesso-a-informacao/acoes-e-programas/pronasci",
    description:
      "Programa federal que articula segurança e cidadania. Consulte iniciativas e execução territorial na fonte oficial.",
  },
  {
    id: "education",
    problem:
      "Resultados educacionais precisam ser lidos por etapa escolar e rede, junto com o contexto local.",
    measures: [
      "Acompanhar planos de alfabetização e resultados por etapa.",
      "Buscar informações sobre participação da comunidade escolar.",
    ],
    title: "Compromisso Nacional Criança Alfabetizada",
    url: "https://www.gov.br/mec/pt-br/crianca-alfabetizada",
    description:
      "Iniciativa federal voltada à alfabetização e recuperação de aprendizagens; consultar implementação e critérios no canal oficial.",
  },
  {
    id: "sanitation",
    problem:
      "Acesso a esgotamento não equivale a tratamento de esgoto nem a cobertura de todos os serviços de saneamento.",
    measures: [
      "Consultar planos municipais e cronogramas de expansão das redes.",
      "Registrar solicitações e acompanhar respostas dos órgãos responsáveis.",
    ],
    title: "Programas e base institucional do saneamento",
    url: "https://www.gov.br/cidades/pt-br/acesso-a-informacao/institucional/base-juridica/secretaria-nacional-de-saneamento-ambiental",
    description:
      "Referências oficiais, incluindo o Programa Saneamento para Todos. A disponibilidade local deve ser consultada ao órgão responsável.",
  },
  {
    id: "health",
    problem:
      "Mortalidade infantil é um indicador populacional e deve ser interpretada com contexto e qualidade do registro.",
    measures: [
      "Conhecer a organização da atenção primária no território.",
      "Acompanhar políticas e participar dos canais de escuta do serviço público.",
    ],
    title: "Estratégia Saúde da Família",
    url: "https://www.gov.br/saude/pt-br/composicao/saps/esf",
    description:
      "Organização da atenção primária orientada às pessoas, famílias e territórios. Consulte os serviços locais para informações de atendimento.",
  },
];
const questions = {
  security:
    "Quais ações de prevenção estão previstas para o município, quais territórios abrangem e onde posso consultar seus indicadores de acompanhamento?",
  education:
    "Onde posso consultar os resultados de aprovação e aprendizagem da rede pública, na mesma etapa escolar, e as ações previstas para acompanhá-los?",
  sanitation:
    "Quais áreas estão incluídas no plano de expansão do esgotamento e onde encontro informações separadas sobre cobertura da rede e tratamento?",
  health:
    "Onde posso consultar a série municipal de óbitos infantis e nascidos vivos, suas revisões e os indicadores de acompanhamento da atenção à gestante e à criança?",
};
function participationGuide() {
  return `<section class="panel context-panel"><span class="eyebrow">PARTICIPAÇÃO COM CONTEXTO</span><h2>Transforme uma leitura em uma pergunta clara.</h2><ol class="process-steps"><li><strong>Delimite o assunto</strong><p>Anote município, indicador, ano e fonte. Descreva o que deseja saber, sem presumir a causa da diferença.</p></li><li><strong>Identifique o órgão</strong><p>Consulte quem responde pela política ou serviço. Um canal estadual não substitui automaticamente o canal da prefeitura ou do prestador.</p></li><li><strong>Formule o pedido</strong><p>Prefira perguntas específicas sobre documentos, planos, dados ou critérios. Use os exemplos de cada área como ponto de partida.</p></li><li><strong>Acompanhe a resposta</strong><p>Guarde o protocolo e a data, quando fornecidos. Compare a resposta com o recorte original e registre dúvidas que permanecerem.</p></li></ol><p class="context-footnote">Você pode consultar as referências e preparar a pergunta aqui. O envio acontece exclusivamente no canal oficial escolhido; o projeto não coleta relatos nem dados pessoais.</p></section>`;
}
export async function participation() {
  return `<div class="page-heading"><span class="eyebrow">DADOS QUE ABREM CONVERSAS</span><h1>Conheça o problema.<br>Explore caminhos para melhorar.</h1><p>Informação para participar, perguntar e acompanhar políticas públicas.</p></div><div class="notice"><p>As medidas abaixo são caminhos de participação, sem garantia de resultado. A existência de um programa nacional não comprova sua execução em cada município. Os links abrem canais externos; este site não recebe manifestações.</p></div>${participationGuide()}<div class="participation-grid">${areas.map((a) => `<article class="panel prose participation-card"><span class="eyebrow">${e(categories[a.id])}</span><h2>${e(categories[a.id])} e cidadania</h2><p>${e(a.problem)}</p><a href="#${a.id}" class="text-link">Ver indicadores relacionados ${icon("ArrowUpRight")}</a><div class="context-details"><details><summary>Uma pergunta para levar ao órgão</summary><div><p class="question-example">${e(questions[a.id])}</p><p>Adapte a pergunta com o município, o período e a fonte da sua análise. Este é um exemplo de redação, não uma solicitação enviada.</p></div></details></div><h3>Caminhos possíveis</h3><ul>${a.measures.map((m) => `<li>${e(m)}</li>`).join("")}</ul><a class="source-link" href="${a.url}" target="_blank" rel="noopener noreferrer"><div><strong>${e(a.title)}</strong><small>${e(a.description)}</small></div>${icon("ExternalLink")}</a><a class="source-link" href="https://www.ouvidoria.pe.gov.br/" target="_blank" rel="noopener noreferrer"><div><strong>Ouvidoria-Geral de Pernambuco</strong><small>Consulte a rede de ouvidorias, manifeste-se ou solicite informações ao órgão competente.</small></div>${icon("ExternalLink")}</a></article>`).join("")}</div><p class="footnote">Páginas oficiais consultadas em 17/11/2026. Não foram enviadas mensagens ou solicitações em nome do usuário.</p>`;
}
