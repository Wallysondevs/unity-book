import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "render-pipelines",
    section: "graficos-luz",
    title: "Render Pipelines: Built-in, URP e HDRP",
    difficulty: "intermediario",
    subtitle: "Entenda o que é uma pipeline de renderização e qual escolher para seu projeto.",
    intro: `Imagine que você é o diretor de fotografia de um filme. Antes de qualquer cena ser gravada, você precisa decidir o tipo de câmera, as lentes, a iluminação, como as cores serão tratadas, se vai ter película ou digital. Cada escolha afeta o resultado final e o orçamento. No Unity, essa decisão se chama Render Pipeline. É o conjunto de regras e passos que a engine usa para transformar seus modelos 3D, luzes e materiais em pixels na tela.

Por anos, Unity ofereceu apenas uma pipeline, hoje chamada de Built-in Render Pipeline (BRP). Ela é flexível, funciona em quase tudo e tem uma quantidade enorme de tutoriais antigos. O problema é que ela é difícil de modificar e foi pensada numa época em que celulares mal rodavam jogos 3D. Para resolver isso, Unity criou as Scriptable Render Pipelines (SRP), que são duas: a Universal Render Pipeline (URP), focada em performance ampla (mobile, console, PC, VR) e a High Definition Render Pipeline (HDRP), focada em fidelidade visual de ponta para PC e console de alto desempenho.

A regra prática é: se você está começando um projeto novo hoje, escolha URP para a maioria dos casos. Ela é o futuro do Unity, recebe atualizações constantes e suporta Shader Graph, VFX Graph e os recursos modernos. Use HDRP só se seu jogo é AAA realista, roda em PC top ou PS5/Xbox Series, e você tem uma equipe técnica para lidar com a complexidade. Use Built-in apenas se você está mantendo um projeto antigo ou usando um asset crítico que ainda não migrou.

A pegadinha mais comum de iniciante é começar um projeto em Built-in, baixar shaders gratuitos para URP, e ficar com tudo rosa fluorescente sem entender por quê. Trocar de pipeline no meio do projeto é trabalhoso, então decida cedo. Outra coisa importante: cada pipeline tem seus próprios shaders. Um material feito para Built-in não funciona em URP sem conversão, e vice-versa.`,
    codes: [
      {
        lang: "csharp",
        code: `// Você pode descobrir em runtime qual pipeline está ativa.
// Isso é útil para diagnosticar problemas de shader em equipe.
using UnityEngine;
using UnityEngine.Rendering;

public class DetectorDePipeline : MonoBehaviour
{
    void Start()
    {
        // GraphicsSettings.currentRenderPipeline é null quando se usa Built-in.
        var pipeline = GraphicsSettings.currentRenderPipeline;

        if (pipeline == null)
        {
            Debug.Log("Pipeline ativa: Built-in Render Pipeline");
        }
        else
        {
            // O nome do tipo identifica URP ou HDRP.
            Debug.Log("Pipeline ativa: " + pipeline.GetType().Name);
        }
    }
}`,
      },
      {
        lang: "bash",
        code: `# Para criar um projeto novo já configurado com URP via linha de comando
# (ou pelo Unity Hub: New Project > 3D (URP) Core).
# O template URP vem com Shader Graph, Post-Processing v3 e materiais de exemplo.

# Os pacotes que aparecem no Package Manager para uma pipeline SRP:
# com.unity.render-pipelines.universal      -> URP
# com.unity.render-pipelines.high-definition -> HDRP
# com.unity.render-pipelines.core           -> base comum`,
      },
      {
        lang: "csharp",
        code: `// Trocar a pipeline ativa em runtime (raro, mas existe).
// Útil para um menu de "qualidade gráfica" que carrega assets diferentes.
using UnityEngine;
using UnityEngine.Rendering;

public class GerenciadorDeQualidade : MonoBehaviour
{
    [SerializeField] private RenderPipelineAsset pipelineAlta;
    [SerializeField] private RenderPipelineAsset pipelineBaixa;

    public void AplicarQualidade(bool alta)
    {
        // GraphicsSettings.defaultRenderPipeline troca para o frame seguinte.
        GraphicsSettings.defaultRenderPipeline = alta ? pipelineAlta : pipelineBaixa;
        Debug.Log("Pipeline trocada para: " +
            GraphicsSettings.defaultRenderPipeline.name);
    }
}`,
      },
    ],
    points: [
      "Render Pipeline é o caminho que a engine usa para desenhar o frame.",
      "Built-in é a pipeline antiga: estável, mas em manutenção.",
      "URP é a escolha padrão moderna: roda em mobile, PC, console e VR.",
      "HDRP é para gráficos AAA realistas em hardware potente, custa mais a aprender.",
      "Cada pipeline tem seus próprios shaders e não são intercambiáveis.",
      "Decida a pipeline no início do projeto; migrar depois é caro e arriscado.",
      "Se um material aparece rosa, quase sempre é shader incompatível com a pipeline.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Material rosa fluorescente é o sinal universal de shader incompatível. Antes de pesquisar bug obscuro, confirme se o shader do material casa com a pipeline ativa em Project Settings > Graphics.",
      },
      {
        type: "tip",
        content: "Use o template '3D (URP) Core' do Unity Hub para projetos novos. Ele já vem com Post-Processing, Shader Graph e exemplos prontos, poupando horas de configuração.",
      },
      {
        type: "info",
        content: "Não existe migração automática perfeita entre pipelines. Existe um Render Pipeline Converter no menu Window que ajuda, mas materiais customizados quase sempre precisam de retrabalho manual.",
      },
    ],
  },
  {
    slug: "materiais-shader-intro",
    section: "graficos-luz",
    title: "Materiais e Shaders: Albedo, Normal, Metallic e Smoothness",
    difficulty: "iniciante",
    subtitle: "O que é um material, o que é um shader e como controlar a aparência das superfícies.",
    intro: `Pensa numa parede de tijolos. O que faz seu cérebro reconhecer aquilo como tijolo, e não como plástico, são detalhes muito específicos: a cor avermelhada, a rugosidade da superfície, as pequenas saliências entre um tijolo e outro, o jeito como a luz se reflete fosca em vez de brilhante. No mundo real, isso vem da matéria de que o objeto é feito. No Unity, a gente recria essa percepção combinando duas coisas: um Shader e um Material.

O Shader é o programa que roda na placa de vídeo e descreve, matematicamente, como a luz interage com aquela superfície. O Material é a configuração concreta desse shader: qual textura de cor usar, quanto brilhante a superfície é, qual textura de relevo aplicar. Pense no shader como uma receita de bolo e no material como o bolo específico que você assou seguindo a receita, com os ingredientes que você escolheu. Um mesmo shader pode gerar centenas de materiais diferentes (madeira, metal, pele, gelo) só mudando os valores de entrada.

Quase todo material PBR (Physically Based Rendering, o padrão atual) usa quatro entradas principais: Albedo é a cor base sem nenhuma luz; Normal Map é uma textura azulada que finge relevo na superfície sem aumentar a quantidade de polígonos; Metallic diz se o material é metal (1) ou não (0); Smoothness controla quão polida a superfície é, indo de fosca (0) a espelhada (1). Com esses quatro mapas você consegue representar quase qualquer material do mundo real de forma convincente.

Um erro comum de quem começa é misturar conceitos: tentar deixar madeira mais brilhante aumentando o Metallic, quando na verdade madeira não é metal — o ajuste correto é só aumentar Smoothness. Outro erro é importar normal maps sem marcar a opção 'Normal map' no Inspector da textura, e ficar se perguntando por que a iluminação parece estranha. Vamos ver na prática como criar e controlar materiais via código.`,
    codes: [
      {
        lang: "csharp",
        code: `// Trocar a cor (Albedo) de um material em runtime.
// IMPORTANTE: usar .material cria uma cópia (instância) por objeto.
// Se você quer alterar TODOS os objetos que usam o material, use .sharedMaterial.
using UnityEngine;

public class TrocarCor : MonoBehaviour
{
    [SerializeField] private Color novaCor = Color.red;

    void Start()
    {
        var renderer = GetComponent<Renderer>();

        // No URP, a propriedade da cor base se chama "_BaseColor".
        // No Built-in (Standard shader), se chama "_Color".
        renderer.material.SetColor("_BaseColor", novaCor);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Configurando um material PBR completo via código.
// Útil para sistemas que geram materiais procedurais (level editors, mods).
using UnityEngine;

public class CriadorDeMaterial : MonoBehaviour
{
    [SerializeField] private Texture2D albedoTex;
    [SerializeField] private Texture2D normalTex;
    [SerializeField] private float metallic = 0f;
    [SerializeField] private float smoothness = 0.5f;

    void Start()
    {
        // Cria um material novo a partir do shader URP/Lit.
        var shader = Shader.Find("Universal Render Pipeline/Lit");
        var mat = new Material(shader);

        mat.SetTexture("_BaseMap", albedoTex);     // textura de cor
        mat.SetTexture("_BumpMap", normalTex);     // normal map (relevo falso)
        mat.SetFloat("_Metallic", metallic);       // 0 = não-metal, 1 = metal
        mat.SetFloat("_Smoothness", smoothness);   // 0 = fosco, 1 = espelho

        GetComponent<Renderer>().material = mat;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// MaterialPropertyBlock: a forma performática de mudar propriedades
// por instância sem quebrar o batching da GPU.
// Use isso quando você tem MUITOS objetos com cores diferentes.
using UnityEngine;

public class CorPorInstancia : MonoBehaviour
{
    void Start()
    {
        var renderer = GetComponent<Renderer>();
        var props = new MaterialPropertyBlock();

        // Pega as propriedades atuais (se houver) sem criar material novo.
        renderer.GetPropertyBlock(props);

        // Cor aleatória para esta instância apenas.
        props.SetColor("_BaseColor", Random.ColorHSV());

        renderer.SetPropertyBlock(props);
    }
}`,
      },
      {
        lang: "shaderlab",
        code: `// Estrutura mínima de um shader ShaderLab que aceita as propriedades padrão.
// Esta declaração é o que o Inspector do Material usa para mostrar os campos.
Shader "Exemplo/MeuMaterial"
{
    Properties
    {
        _BaseColor ("Cor Base (Albedo)", Color) = (1,1,1,1)
        _BaseMap ("Textura Albedo", 2D) = "white" {}
        _BumpMap ("Normal Map", 2D) = "bump" {}
        _Metallic ("Metallic", Range(0,1)) = 0
        _Smoothness ("Smoothness", Range(0,1)) = 0.5
    }
    SubShader
    {
        // O corpo real do shader (passes) viria aqui.
        // Em URP, o ideal é usar Shader Graph em vez de escrever HLSL na mão.
    }
}`,
      },
    ],
    points: [
      "Shader é a receita; Material é o prato pronto com ingredientes definidos.",
      "Albedo é a cor pura, sem influência de luz nem reflexo.",
      "Normal map finge relevo de superfície sem custar polígonos.",
      "Metallic é binário na prática: ou é metal (1) ou não é (0).",
      "Smoothness vai de fosco a espelhado e é o que mais muda a percepção visual.",
      "Use .sharedMaterial para alterar todos; .material para criar cópia por objeto.",
      "MaterialPropertyBlock evita criar materiais duplicados e mantém batching ativo.",
      "Em URP a propriedade de cor é '_BaseColor'; em Built-in é '_Color'.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Acessar renderer.material em Update cria um vazamento de memória: cada chamada gera um material novo na memória. Faça o cache em Start ou use MaterialPropertyBlock.",
      },
      {
        type: "tip",
        content: "Sempre que importar uma textura de Normal Map, abra o Inspector e marque Texture Type como 'Normal map'. Sem isso, a iluminação parece errada e o Unity nem sempre avisa.",
      },
      {
        type: "info",
        content: "Madeira, plástico, pele, tecido: todos têm Metallic = 0. Só ouro, prata, ferro, alumínio e similares devem ter Metallic = 1. Valores intermediários quase nunca representam um material real.",
      },
    ],
  },
  {
    slug: "shader-graph",
    section: "graficos-luz",
    title: "Shader Graph: Criando Shaders Visualmente",
    difficulty: "intermediario",
    subtitle: "Editor visual de shaders por nós, com exemplo prático de holograma.",
    intro: `Escrever shaders na mão, em HLSL ou ShaderLab, é uma das atividades mais difíceis do desenvolvimento de jogos. Você precisa entender matemática vetorial, espaços de coordenadas, comportamento da GPU e ainda lidar com diferenças entre plataformas. Por décadas, isso afastou artistas e iniciantes do mundo dos shaders. O Shader Graph foi a resposta da Unity para esse problema: é um editor visual onde você conecta nós como se fosse um diagrama, e o Unity gera o código HLSL nos bastidores.

A analogia mais útil é com cozinha modular. Em vez de escrever a receita do zero, você combina blocos prontos: 'pegar uma textura', 'multiplicar duas cores', 'gerar ruído', 'amostrar tempo'. Cada nó tem entradas e saídas, e você puxa fios entre eles. O resultado final é conectado a um Master Stack, que define se o shader é Lit (responde a luz) ou Unlit (sempre brilha igual), opaco ou transparente, e por aí vai. Esse fluxo abre as portas para artistas criarem efeitos sofisticados sem aprender HLSL.

Shader Graph só está disponível em URP e HDRP — não funciona na Built-in Pipeline. Isso é um motivo extra para escolher URP em projetos novos. Os shaders gerados são otimizados pela própria engine, então não há penalidade significativa de performance comparado a escrever na mão. A limitação principal é que efeitos muito específicos (raymarching, screen-space exclusivos) ainda exigem código, mas para 90% das necessidades de produção, Shader Graph resolve.

Vamos exemplificar com um efeito clássico: um shader de holograma. Ele combina cor emissiva, transparência, linhas horizontais que se movem (scanlines) e um efeito de borda brilhante (Fresnel, que destaca onde a superfície fica de lado para a câmera). Esse mesmo padrão de combinação serve para shields, escudos, fantasmas e efeitos sci-fi em geral. O código abaixo mostra como controlar parâmetros do shader graph via C#.`,
    codes: [
      {
        lang: "csharp",
        code: `// Controlando propriedades expostas de um Shader Graph via código.
// Cada propriedade marcada como 'Exposed' no editor de Shader Graph
// fica disponível como SetFloat, SetColor, SetVector etc.
using UnityEngine;

public class ControleHolograma : MonoBehaviour
{
    [SerializeField] private Color corHolograma = Color.cyan;
    [SerializeField] private float velocidadeScanline = 2f;
    [SerializeField] private float intensidadeFresnel = 3f;

    private Material mat;

    void Start()
    {
        // Cache do material para não criar instâncias a cada frame.
        mat = GetComponent<Renderer>().material;
    }

    void Update()
    {
        // Os nomes precisam casar com o 'Reference' das propriedades
        // do Shader Graph (geralmente prefixados com underscore).
        mat.SetColor("_HoloColor", corHolograma);
        mat.SetFloat("_ScanlineSpeed", velocidadeScanline);
        mat.SetFloat("_FresnelPower", intensidadeFresnel);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Animar a opacidade de um shader graph para simular
// um holograma "ligando" e "desligando" suavemente.
using UnityEngine;
using System.Collections;

public class HologramaFadeIn : MonoBehaviour
{
    [SerializeField] private float duracao = 1.5f;
    private Material mat;

    void Awake() => mat = GetComponent<Renderer>().material;

    public void Ligar() => StartCoroutine(Fade(0f, 1f));
    public void Desligar() => StartCoroutine(Fade(1f, 0f));

    IEnumerator Fade(float de, float para)
    {
        float tempo = 0f;
        while (tempo < duracao)
        {
            tempo += Time.deltaTime;
            float t = tempo / duracao;
            // Lerp interpola linearmente entre 'de' e 'para'.
            mat.SetFloat("_Alpha", Mathf.Lerp(de, para, t));
            yield return null;
        }
    }
}`,
      },
      {
        lang: "hlsl",
        code: `// Trecho HLSL gerado por um Shader Graph para o efeito de scanline.
// Você não precisa escrever isso na mão, mas ajuda entender o que sai.
// (Conceito: usar a coordenada Y do mundo + tempo para criar linhas que sobem.)
float ScanlineEffect(float worldY, float speed, float density)
{
    // _Time.y é o tempo em segundos desde o início do jogo.
    float onda = sin((worldY + _Time.y * speed) * density);
    // step retorna 1 se onda > 0.5, senão 0 (cria linhas duras).
    return step(0.5, onda);
}`,
      },
      {
        lang: "csharp",
        code: `// Aplicar um Shader Graph diferente em runtime trocando o shader inteiro.
// Útil para variar entre "estado normal" e "estado de holograma".
using UnityEngine;

public class TrocarParaHolograma : MonoBehaviour
{
    [SerializeField] private Material materialNormal;
    [SerializeField] private Material materialHolograma;

    private Renderer rend;

    void Awake() => rend = GetComponent<Renderer>();

    public void AtivarHolograma(bool ativo)
    {
        // Trocar o material inteiro é mais barato que mudar shader em runtime.
        rend.sharedMaterial = ativo ? materialHolograma : materialNormal;
    }
}`,
      },
    ],
    points: [
      "Shader Graph é editor visual de shaders, sem precisar escrever HLSL.",
      "Disponível somente em URP e HDRP, não funciona na Built-in.",
      "Você combina nós prontos como blocos de cozinha modular.",
      "O Master Stack define se o shader é Lit/Unlit, Opaco/Transparente.",
      "Propriedades 'Exposed' viram parâmetros acessíveis via SetFloat/SetColor.",
      "Fresnel é o nó mágico para criar bordas brilhantes (escudos, hologramas).",
      "Performance é equivalente a HLSL escrito à mão; não há penalidade.",
      "Para efeitos avançados (raymarching), ainda precisa de código manual.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Sempre clique no botão 'Save Asset' no canto superior esquerdo do Shader Graph após editar. Salvar a cena ou o projeto não salva o shader, e isso confunde quem está começando.",
      },
      {
        type: "warning",
        content: "Os nomes das propriedades no SetFloat precisam bater com o 'Reference' (não o display name). No Inspector do Shader Graph clique no engrenagem ao lado da propriedade para ver e editar o Reference.",
      },
      {
        type: "info",
        content: "A diferença entre Lit e Unlit é gigante: Unlit ignora luz da cena, sendo perfeito para hologramas, fogo, UI 3D e efeitos sci-fi. Lit reage a luzes, sombras e reflection probes.",
      },
    ],
  },
  {
    slug: "iluminacao-tipos",
    section: "graficos-luz",
    title: "Tipos de Luzes: Directional, Point, Spot e Area",
    difficulty: "iniciante",
    subtitle: "Como funciona cada tipo de luz e quando usar cada um.",
    intro: `Iluminar uma cena 3D é como ser o iluminador de um teatro. Você tem várias lâmpadas com características distintas: a luz do sol que entra pela janela atinge tudo na mesma direção; a lâmpada do abajur ilumina em todas as direções a partir de um ponto; o foco do palco aponta para um lugar específico em formato de cone. No Unity, esses comportamentos correspondem a três tipos clássicos de luz, mais um quarto especial. Entender as diferenças muda completamente o impacto visual do seu jogo.

A Directional Light simula o sol ou a lua: luz que vem de uma direção fixa, infinitamente distante, atingindo toda a cena igualmente. Não importa onde você posiciona o GameObject da luz, só importa a rotação. Toda cena externa precisa de uma directional light, e toda cena nova do Unity já vem com uma. A Point Light é uma lâmpada nua: emite luz em todas as direções a partir de um ponto, com alcance finito. Use para tochas, lampadinhas, faíscas. A Spot Light é o foco de um holofote ou lanterna: emite luz num cone, com ângulo configurável. Use para faróis de carro, lanternas de mão, holofotes de vigilância.

A Area Light é especial: representa uma superfície que emite luz, como uma janela difusa, um painel de luz de estúdio ou uma TV brilhando num quarto escuro. Ela só funciona em iluminação 'baked' (pré-calculada), não em tempo real, porque o cálculo de luz vinda de uma área é caríssimo para a GPU. Quando você precisar de iluminação suave realista, área light é a melhor amiga.

Cada luz tem propriedades importantes: Intensity (quão forte), Color (cor), Range (alcance, exceto na directional), Mode (Realtime, Mixed, Baked). Iniciantes costumam exagerar na Intensity achando que vai ficar mais bonito, e o resultado é uma cena 'estourada' com regiões brancas sem detalhe. Use luzes na intensidade certa e deixe o tone mapping cuidar do resto. Outro erro é usar muitas point lights em tempo real num jogo mobile — cada luz custa performance, e mais de 4-8 luzes simultâneas começa a derrubar o frame rate.`,
    codes: [
      {
        lang: "csharp",
        code: `// Criar e configurar uma luz direcional via código.
// Útil para sistemas de ciclo dia/noite.
using UnityEngine;

public class CicloDiaNoite : MonoBehaviour
{
    [SerializeField] private Light sol;
    [SerializeField] private float duracaoDoDiaSegundos = 120f;

    void Update()
    {
        // Calcula o ângulo do sol baseado no tempo decorrido.
        float angulo = (Time.time / duracaoDoDiaSegundos) * 360f;

        // Rotação no eixo X faz o sol subir e descer no horizonte.
        sol.transform.rotation = Quaternion.Euler(angulo, 30f, 0f);

        // Quando o sol está abaixo do horizonte, diminuímos a intensidade.
        float seno = Mathf.Sin(angulo * Mathf.Deg2Rad);
        sol.intensity = Mathf.Clamp01(seno) * 1.2f;

        // Cor mais alaranjada no nascer/pôr do sol, branca no meio do dia.
        sol.color = Color.Lerp(new Color(1f, 0.6f, 0.4f), Color.white, seno);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Controle de uma lanterna (Spot Light) que liga e desliga.
// O cone se mexe junto com o personagem que carrega a lanterna.
using UnityEngine;

public class Lanterna : MonoBehaviour
{
    [SerializeField] private Light spotLight;
    [SerializeField] private float bateriaMax = 100f;
    [SerializeField] private float consumoPorSegundo = 2f;

    private float bateria;

    void Awake()
    {
        bateria = bateriaMax;
        spotLight.type = LightType.Spot;
        spotLight.spotAngle = 45f;     // ângulo de abertura do cone
        spotLight.range = 15f;         // distância máxima do feixe
        spotLight.intensity = 2f;
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.F))
            spotLight.enabled = !spotLight.enabled;

        if (spotLight.enabled && bateria > 0)
        {
            bateria -= consumoPorSegundo * Time.deltaTime;
            // Pisca quando a bateria está acabando.
            spotLight.intensity = bateria < 20f
                ? 2f * Mathf.PingPong(Time.time * 4f, 1f)
                : 2f;
        }
        else if (bateria <= 0)
        {
            spotLight.enabled = false;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Spawn dinâmico de Point Lights em runtime.
// Exemplo: faíscas que iluminam brevemente o ambiente.
using UnityEngine;
using System.Collections;

public class FaiscaIluminada : MonoBehaviour
{
    public void Faiscar(Vector3 posicao)
    {
        var go = new GameObject("FaiscaLuz");
        go.transform.position = posicao;

        var luz = go.AddComponent<Light>();
        luz.type = LightType.Point;
        luz.color = new Color(1f, 0.85f, 0.4f);  // amarelado
        luz.range = 3f;
        luz.intensity = 5f;

        StartCoroutine(EsmaecerEDestruir(luz, 0.3f));
    }

    IEnumerator EsmaecerEDestruir(Light luz, float duracao)
    {
        float t = 0f;
        float intensidadeInicial = luz.intensity;
        while (t < duracao)
        {
            t += Time.deltaTime;
            luz.intensity = Mathf.Lerp(intensidadeInicial, 0f, t / duracao);
            yield return null;
        }
        Destroy(luz.gameObject);
    }
}`,
      },
    ],
    points: [
      "Directional Light é o sol; só a rotação importa, posição é ignorada.",
      "Point Light é lâmpada nua: emite em todas as direções com alcance limitado.",
      "Spot Light é cone de holofote ou lanterna; ajuste angle e range.",
      "Area Light é superfície luminosa, mas só funciona em iluminação Baked.",
      "Mode controla o custo: Realtime é caro, Baked é grátis em runtime mas estático.",
      "Em mobile, mantenha menos de 4 luzes realtime simultâneas para boa performance.",
      "Intensity exagerado 'estoura' a cena e tira detalhe; menos costuma ser mais.",
      "Toda cena nova já vem com uma Directional Light chamada Sun.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Cada luz realtime que afeta um objeto adiciona um draw call extra naquele objeto. Vinte point lights numa sala podem virar centenas de draw calls invisíveis matando o FPS.",
      },
      {
        type: "tip",
        content: "Para luzes que não precisam se mover (como tochas em paredes), marque Mode como Baked. O custo em runtime cai praticamente a zero e o resultado é mais bonito que realtime.",
      },
      {
        type: "info",
        content: "Em URP, Area Lights emitem luz em uma direção (frente do plano). Em HDRP, existem variações como Tube e Disc, mais flexíveis. A geometria da luz importa para o realismo.",
      },
    ],
  },
  {
    slug: "lightmap-baking",
    section: "graficos-luz",
    title: "Lightmap Baking e Reflection Probes",
    difficulty: "intermediario",
    subtitle: "Pré-calcule iluminação para ter qualidade de filme com performance de mobile.",
    intro: `Calcular como cada raio de luz se reflete em cada superfície da cena, em tempo real, é uma tarefa absurdamente cara para a GPU. É o motivo pelo qual jogos antigos usavam corredores escuros: era impossível iluminar tudo dinamicamente. A solução engenhosa, criada lá nos anos 90 e ainda usada hoje, é o lightmap baking. A ideia é simples: você calcula uma vez, com calma, como a luz se comporta em cada cantinho da cena, salva isso numa textura especial chamada lightmap, e usa essa textura em runtime como se fosse pintura na superfície dos objetos.

A analogia perfeita é uma fotografia da iluminação. Imagine que você ilumina perfeitamente um quarto, fotografa cada parede e cola essas fotos sobre as paredes virtuais. Em runtime, a engine só precisa multiplicar a cor da textura de difuso (albedo) pela cor do lightmap. Isso é praticamente grátis para a GPU. A desvantagem é óbvia: nada pode se mover. Se a parede mudasse de lugar, a foto ficaria errada. Por isso lightmaps são usados para geometria estática (cenário, prédios, terreno), enquanto personagens e objetos móveis usam técnicas diferentes (Light Probes).

O processo de baking no Unity tem três modos: Realtime calcula tudo em tempo real (caro mas dinâmico), Baked pré-calcula tudo (rápido mas estático), e Mixed mistura os dois (sombras dinâmicas em superfícies estáticas). A escolha depende do jogo: shooter mobile usa muito Baked; jogo com ciclo dia/noite usa Realtime ou Mixed; cinematic linear usa Baked com qualidade alta. Marcar objetos como 'Static' (no canto superior direito do Inspector) é o pré-requisito para o baking funcionar nesses objetos.

Reflection Probes resolvem outro problema: superfícies reflexivas precisam saber 'o que' refletir. Sem probes, um carro espelhado refletiria apenas a skybox, mesmo num garagem fechado. Uma reflection probe captura a vizinhança em forma de cubemap e fornece esses dados para os materiais por perto. Coloque uma probe por sala ou por área distinta. Esqueça desse detalhe e seus reflexos parecem totalmente errados.`,
    codes: [
      {
        lang: "csharp",
        code: `// Marcar GameObjects como estáticos via código (raro, mas existe).
// Em geral, isso é feito no Inspector marcando 'Static' no canto superior.
using UnityEngine;

public class MarcadorEstatico : MonoBehaviour
{
    void Reset()
    {
        // GameObjectUtility só existe em editor; este código é para tooling.
#if UNITY_EDITOR
        UnityEditor.GameObjectUtility.SetStaticEditorFlags(
            gameObject,
            UnityEditor.StaticEditorFlags.ContributeGI |
            UnityEditor.StaticEditorFlags.BatchingStatic |
            UnityEditor.StaticEditorFlags.OccludeeStatic
        );
#endif
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Disparar um bake de iluminação por código (somente no editor).
// Útil para automação de pipeline de build em projetos grandes.
using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;

public class BakeAutomatico
{
    [MenuItem("Ferramentas/Bake Iluminacao")]
    public static void Bake()
    {
        // Configura o bake: qualidade, indireto, ambient occlusion etc.
        Lightmapping.giWorkflowMode = Lightmapping.GIWorkflowMode.OnDemand;

        Debug.Log("Iniciando bake...");
        Lightmapping.BakeAsync();
    }

    [MenuItem("Ferramentas/Limpar Lightmaps")]
    public static void Limpar()
    {
        Lightmapping.Clear();
        Debug.Log("Lightmaps limpos.");
    }
}
#endif`,
      },
      {
        lang: "csharp",
        code: `// Forçar um objeto dinamico a usar uma Reflection Probe especifica
// em vez da mais próxima (útil quando o algoritmo automático erra).
using UnityEngine;

public class FixarReflectionProbe : MonoBehaviour
{
    [SerializeField] private ReflectionProbe probeAlvo;

    void Start()
    {
        var rend = GetComponent<Renderer>();

        // ReflectionProbeUsage controla como o objeto consome probes.
        rend.reflectionProbeUsage = UnityEngine.Rendering.ReflectionProbeUsage.Simple;

        // probeAnchor força a engine a usar a probe que escolhemos.
        rend.probeAnchor = probeAlvo.transform;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Atualizar uma Reflection Probe em runtime
// (por exemplo, se uma porta abre e revela um novo ambiente).
using UnityEngine;

public class AtualizarProbe : MonoBehaviour
{
    [SerializeField] private ReflectionProbe probe;

    public void RefazerCaptura()
    {
        // Type Realtime + RefreshMode ViaScripting permite controle manual.
        probe.mode = UnityEngine.Rendering.ReflectionProbeMode.Realtime;
        probe.refreshMode = UnityEngine.Rendering.ReflectionProbeRefreshMode.ViaScripting;
        probe.RenderProbe();

        Debug.Log("Probe recapturada.");
    }
}`,
      },
    ],
    points: [
      "Lightmap baking pré-calcula iluminação e a salva como textura.",
      "Performance em runtime é praticamente grátis após o bake.",
      "Objetos precisam ser marcados como Static para participar do bake.",
      "Realtime, Baked e Mixed: cada modo serve a um cenário diferente.",
      "Light Probes iluminam objetos dinâmicos com base em pontos da cena.",
      "Reflection Probes capturam o ambiente para superfícies reflexivas.",
      "Coloque uma reflection probe por sala ou área visualmente distinta.",
      "Bakes podem demorar horas; em projetos grandes, faça incrementalmente.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Esquecer de marcar geometria como Static é o erro mais comum. Sem essa flag, o objeto não recebe lightmap e fica com sombreamento gritante diferente do resto da cena.",
      },
      {
        type: "tip",
        content: "Comece com bake em qualidade baixa (Lightmap Resolution 10-20) durante desenvolvimento. Só aumente para 40+ na build final, senão você gasta horas a cada teste de luz.",
      },
      {
        type: "info",
        content: "Personagens e itens móveis nunca recebem lightmap. Eles dependem de Light Probes (uma grade invisível na cena) para receber iluminação compatível com o ambiente baked.",
      },
    ],
  },
  {
    slug: "post-processing",
    section: "graficos-luz",
    title: "Post-Processing: Bloom, Tonemapping, Vignette e Color Grading",
    difficulty: "intermediario",
    subtitle: "Efeitos de tela inteira que transformam um jogo comum em algo cinematográfico.",
    intro: `Quando você assiste um filme moderno, raramente está vendo a imagem 'bruta' que saiu da câmera. Tem uma equipe inteira de pós-produção colorindo, ajustando contraste, adicionando glow nos pontos brilhantes, escurecendo as bordas para focar o olhar. Esse mesmo processo é replicado nos jogos via Post-Processing. São efeitos aplicados na imagem final, depois que toda a cena foi renderizada, para refinar o resultado visual sem mexer em modelo, textura ou luz.

No URP, post-processing é gerenciado por um sistema de Volumes. Você cria um GameObject vazio, adiciona o componente Volume e atribui um Profile (asset .asset que guarda os efeitos). Volumes podem ser Globais (afetam a cena toda) ou Locais com Box Collider (só afetam quando a câmera entra dentro do trigger). Isso permite efeitos transicionais: a câmera entra num quarto e a saturação cai, sai e volta ao normal. É o mesmo conceito que o Unity Engine usa para HDRP, com pequenas diferenças.

Os efeitos mais comuns e impactantes são: Bloom (faz pontos muito brilhantes derramarem luz para os pixels vizinhos, simula o flare de câmeras reais); Tonemapping (mapeia cores HDR de alta faixa dinâmica para os tons que seu monitor consegue mostrar — sem isso a cena fica branca estourada); Vignette (escurece os cantos da tela para focar a atenção no centro); Color Grading (ajusta cor, contraste, saturação, sombras e altas-luzes). Combinados com competência, esses quatro elevam dramaticamente a qualidade visual.

A pegadinha clássica é exagerar. Bloom em excesso vira uma neblina branca que tira detalhe. Saturação no máximo deixa tudo parecendo desenho animado raivoso. Vignette pesada faz o jogador pensar que a tela está suja. Use post-processing como sal na comida: o suficiente para realçar, nunca o suficiente para mascarar. E sempre teste em monitores diferentes — efeitos que parecem perfeitos no seu OLED podem ficar feios num laptop comum.`,
    codes: [
      {
        lang: "csharp",
        code: `// Acessar e modificar parâmetros de Post-Processing em runtime (URP).
// Útil para efeito de "ferida" no jogador, ou flash de explosão.
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

public class ControlePostProcessing : MonoBehaviour
{
    [SerializeField] private Volume volume;

    private Vignette vignette;
    private Bloom bloom;

    void Start()
    {
        // TryGet pega o efeito do profile sem causar exceção se não existir.
        volume.profile.TryGet(out vignette);
        volume.profile.TryGet(out bloom);
    }

    public void EfeitoDeDano(float intensidade)
    {
        if (vignette != null)
        {
            vignette.intensity.value = Mathf.Clamp01(intensidade);
            vignette.color.value = Color.red;
        }
    }

    public void FlashDeExplosao()
    {
        if (bloom != null)
        {
            bloom.intensity.value = 30f;
            // Suaviza de volta para o normal em 1 segundo.
            Invoke(nameof(NormalizarBloom), 1f);
        }
    }

    void NormalizarBloom()
    {
        if (bloom != null) bloom.intensity.value = 1f;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Trocar entre profiles de pos-processing para criar "humores" diferentes.
// Exemplo: cena normal vs flashback (preto e branco com vignette pesada).
using UnityEngine;
using UnityEngine.Rendering;

public class SeletorDeHumor : MonoBehaviour
{
    [SerializeField] private Volume volume;
    [SerializeField] private VolumeProfile humorNormal;
    [SerializeField] private VolumeProfile humorFlashback;

    public void EntrarFlashback()
    {
        volume.profile = humorFlashback;
    }

    public void VoltarAoNormal()
    {
        volume.profile = humorNormal;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Animar a saturação para zero ao morrer (efeito comum em jogos AAA).
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using System.Collections;

public class FadeParaPretoEBranco : MonoBehaviour
{
    [SerializeField] private Volume volume;
    [SerializeField] private float duracao = 2f;

    public void Morrer()
    {
        if (volume.profile.TryGet<ColorAdjustments>(out var color))
        {
            StartCoroutine(DessaturarAoLongoDoTempo(color));
        }
    }

    IEnumerator DessaturarAoLongoDoTempo(ColorAdjustments color)
    {
        float t = 0f;
        float satInicial = color.saturation.value;
        while (t < duracao)
        {
            t += Time.deltaTime;
            // -100 = totalmente preto e branco; 0 = saturação normal.
            color.saturation.value = Mathf.Lerp(satInicial, -100f, t / duracao);
            yield return null;
        }
    }
}`,
      },
    ],
    points: [
      "Post-processing são efeitos aplicados na imagem final do frame.",
      "URP usa o sistema Volume + Profile, com escopo global ou local.",
      "Bloom faz pixels brilhantes derramarem luz nos vizinhos.",
      "Tonemapping converte HDR para SDR; quase obrigatório em cenas modernas.",
      "Vignette escurece bordas para focar o olho do jogador.",
      "Color Grading ajusta cor, contraste, sombras e altas-luzes.",
      "Volumes locais com trigger permitem mudança suave entre ambientes.",
      "Exagerar tira detalhe e cansa o olho; menos costuma ser mais.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Sempre adicione Tonemapping (modo ACES ou Neutral) ao seu profile. Sem ele, qualquer luz com intensidade acima de 1 estoura para branco puro e sua cena fica horrível.",
      },
      {
        type: "warning",
        content: "Post-processing custa performance, principalmente em mobile. Bloom é particularmente caro. Em jogos para celular, mantenha o profile enxuto: Tonemapping + Color Grading básico já entrega muito.",
      },
      {
        type: "info",
        content: "A câmera precisa ter 'Post Processing' ativado nas configurações (no Universal Additional Camera Data). Se o profile parece não funcionar, é provável que esse checkbox esteja desligado.",
      },
    ],
  },
  {
    slug: "particle-system",
    section: "graficos-luz",
    title: "Particle System (Shuriken): Emissão, Forma e Cor ao Longo do Tempo",
    difficulty: "iniciante",
    subtitle: "Fogo, fumaça, faíscas, magia: o sistema clássico de partículas do Unity.",
    intro: `Praticamente tudo que se mexe e brilha num jogo — chuva, neve, fogo, magia, fumaça, faísca, poeira, sangue — é feito com partículas. Uma partícula é, no fundo, um quad pequeno (dois triângulos formando um quadrado) com uma textura, que nasce em algum lugar, vive por alguns segundos, se move, muda de cor e tamanho, e então desaparece. O Particle System do Unity, codinome Shuriken, é o módulo que gerencia milhares dessas partículas de uma vez, na CPU.

A genialidade do Shuriken está em ser modular. Cada aspecto das partículas é controlado por um módulo separado: o módulo Emission decide quantas partículas nascem e quando; Shape define onde elas nascem (esfera, cone, círculo, mesh); Velocity over Lifetime controla movimento; Color over Lifetime muda a cor durante a vida; Size over Lifetime muda o tamanho. Você liga e desliga módulos como blocos de Lego. Para uma fogueira, ative Color over Lifetime indo de amarelo para vermelho transparente e Size over Lifetime crescendo. Pronto, fogo.

A diferença entre fazer partículas mediocres e partículas que dão vida ao jogo está no overlap. Uma única chama é fraca; chama com fumaça atrás, faíscas saindo e brasas caindo no chão é convincente. Sempre que precisar de um efeito impactante, combine três ou quatro Particle Systems diferentes no mesmo GameObject (como filhos), cada um cuidando de uma camada do efeito.

Atenção a duas coisas que sempre confundem iniciantes. Primeiro: as partículas usam materiais com shader específico para partículas (Sprites/Default, Particles/Standard Unlit no Built-in, ou Universal Render Pipeline/Particles/Unlit no URP). Usar um shader normal de objeto 3D causa bugs visuais. Segundo: Shuriken roda na CPU, então gerar dezenas de milhares de partículas derruba o desempenho. Para volumes massivos (chuva intensa, multidão de fagulhas) o caminho é VFX Graph, que veremos no próximo capítulo.`,
    codes: [
      {
        lang: "csharp",
        code: `// Configurar um Particle System de fogueira via código.
// Mostra como acessar os módulos para edição programática.
using UnityEngine;

public class GeradorDeFogueira : MonoBehaviour
{
    void Start()
    {
        var ps = GetComponent<ParticleSystem>();

        // Main module: configurações gerais (lifetime, speed, gravity).
        var main = ps.main;
        main.startLifetime = 1.5f;        // cada partícula vive 1.5 segundos
        main.startSpeed = 1.2f;            // velocidade inicial para cima
        main.startSize = 0.5f;
        main.startColor = new Color(1f, 0.7f, 0.2f);
        main.gravityModifier = -0.1f;      // sobe (gravidade negativa)

        // Emission: 30 partículas por segundo.
        var emission = ps.emission;
        emission.rateOverTime = 30f;

        // Shape: cone apontando para cima.
        var shape = ps.shape;
        shape.shapeType = ParticleSystemShapeType.Cone;
        shape.angle = 15f;
        shape.radius = 0.3f;

        // Color over Lifetime: amarelo -> vermelho -> transparente.
        var col = ps.colorOverLifetime;
        col.enabled = true;
        var grad = new Gradient();
        grad.SetKeys(
            new GradientColorKey[] {
                new GradientColorKey(Color.yellow, 0f),
                new GradientColorKey(Color.red, 1f),
            },
            new GradientAlphaKey[] {
                new GradientAlphaKey(1f, 0f),
                new GradientAlphaKey(0f, 1f),
            }
        );
        col.color = grad;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Disparar um Particle System uma única vez (efeito de impacto).
// Chamado de "burst" — todas as partículas nascem juntas, depois para.
using UnityEngine;

public class EfeitoDeImpacto : MonoBehaviour
{
    [SerializeField] private ParticleSystem particulasPrefab;

    public void TocarNoLocal(Vector3 posicao, Vector3 normal)
    {
        // Instancia já rotacionado pela direção da superfície atingida.
        var instancia = Instantiate(particulasPrefab, posicao,
            Quaternion.LookRotation(normal));

        instancia.Play();

        // Auto-destruir quando todas as partículas desaparecerem.
        float tempoTotal = instancia.main.duration +
                           instancia.main.startLifetime.constantMax;
        Destroy(instancia.gameObject, tempoTotal);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Reagir a colisões de partículas (gotas de chuva atingindo personagem).
// Requer 'Collision' module ativado e 'Send Collision Messages' marcado.
using UnityEngine;

public class ReceptorDeColisaoDeParticulas : MonoBehaviour
{
    void OnParticleCollision(GameObject emissor)
    {
        // Chamado uma vez por frame, agrupando todas as partículas
        // do mesmo emissor que colidiram com este objeto.
        Debug.Log("Atingido por particulas de " + emissor.name);

        // Se quiser detalhes (posição, velocidade) de cada particula:
        var ps = emissor.GetComponent<ParticleSystem>();
        var colisoes = new ParticleCollisionEvent[16];
        int total = ps.GetCollisionEvents(gameObject, colisoes);

        for (int i = 0; i < total; i++)
        {
            Debug.DrawRay(colisoes[i].intersection,
                          colisoes[i].normal * 0.5f, Color.cyan, 0.5f);
        }
    }
}`,
      },
    ],
    points: [
      "Shuriken é o sistema clássico de partículas, roda na CPU.",
      "Cada efeito é a soma de módulos: Emission, Shape, Velocity, Color.",
      "Combine vários Particle Systems para criar efeitos convincentes em camadas.",
      "Materiais de partícula usam shaders específicos (Particles/Unlit em URP).",
      "Burst gera muitas partículas de uma vez (impactos, explosões).",
      "Color over Lifetime e Size over Lifetime são os módulos mais usados.",
      "Para milhares de partículas use VFX Graph; Shuriken não escala tão bem.",
      "Lembre de destruir a instância após tocar para não vazar memória.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Antes de criar partículas do zero, abra o asset 'Particle Pack' grátis na Asset Store. Ele tem 50+ efeitos prontos com módulos bem configurados, ótimo material de estudo.",
      },
      {
        type: "warning",
        content: "Particle System dentro de Canvas UI não funciona direto. Para efeitos em HUD, use o componente 'UI Particle' (asset terceiro) ou renderize em uma Render Texture.",
      },
      {
        type: "info",
        content: "A janela do editor mostra preview animado, mas só com a cena tocando ou com a janela 'Particle Effect' aberta (botão Open Editor no Inspector). Sem isso, o efeito parece congelado.",
      },
    ],
  },
  {
    slug: "vfx-graph",
    section: "graficos-luz",
    title: "VFX Graph: Partículas em GPU para Efeitos Massivos",
    difficulty: "avancado",
    subtitle: "Quando você precisa de milhões de partículas, Shuriken não dá conta. VFX Graph dá.",
    intro: `Imagine uma tempestade de areia com cinco milhões de grãos voando. Ou uma explosão nuclear com fagulhas, fumaça, detritos e cinzas todos juntos. Ou uma magia que convoca dez mil estrelas que orbitam o mago. Para esses efeitos espetaculares, o Shuriken simplesmente não consegue: ele roda na CPU, e cada partícula gasta tempo de processamento que poderia estar fazendo outras coisas. A solução da Unity para isso é o VFX Graph, um sistema de partículas que roda inteiramente na GPU usando compute shaders.

A diferença prática é absurda. Onde Shuriken começa a engasgar com 10 mil partículas, VFX Graph rola tranquilo com 100 mil ou mais, dependendo do hardware. Isso porque a GPU foi feita para processar bilhões de operações em paralelo, enquanto a CPU processa uma de cada vez (com truques de paralelismo limitado). Cada partícula no VFX Graph é apenas alguns bytes na memória da GPU, e os cálculos acontecem todos juntos.

VFX Graph tem editor visual parecido com Shader Graph: blocos conectados por fios. Você organiza os efeitos em quatro contextos principais: Spawn (quando nascem partículas), Initialize (estado inicial — posição, velocidade, cor), Update (o que acontece a cada frame — gravidade, turbulência, atração), e Output (como são desenhadas — quad, mesh, line). Essa estrutura permite expressar comportamentos complexos de forma visual.

A limitação principal é que VFX Graph não funciona em Built-in Render Pipeline e tem suporte parcial em URP (versões recentes melhoraram muito). Em HDRP é onde brilha de verdade. Outra coisa: por rodar na GPU, é difícil reagir ao mundo via física tradicional. Detecção de colisão usa SDF (signed distance fields) ou planos, não os colliders normais. Para efeitos puramente visuais, isso não é problema. Para partículas que precisam interagir muito com o jogo, Shuriken ainda é melhor escolha.`,
    codes: [
      {
        lang: "csharp",
        code: `// Controlar um VFX Graph em runtime: parâmetros expostos viram propriedades.
using UnityEngine;
using UnityEngine.VFX;

public class ControleDeMagia : MonoBehaviour
{
    [SerializeField] private VisualEffect vfx;
    [SerializeField] private Transform alvo;

    void Update()
    {
        // SetVector3 escreve numa propriedade exposta no VFX Graph.
        // O nome bate com o "Property" name no inspector do graph.
        vfx.SetVector3("AlvoMundo", alvo.position);

        // Aumenta a quantidade de partículas conforme o jogador segura botão.
        if (Input.GetKey(KeyCode.Space))
            vfx.SetFloat("TaxaSpawn", 5000f);
        else
            vfx.SetFloat("TaxaSpawn", 100f);
    }

    public void Disparar()
    {
        // SendEvent dispara um evento no Spawn context do VFX Graph.
        // Útil para "burst" sob demanda em vez de fluxo contínuo.
        vfx.SendEvent("OnExplosao");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Pausar e reiniciar um VFX Graph (útil para menus, timing de cutscenes).
using UnityEngine;
using UnityEngine.VFX;

public class GerenciadorVFX : MonoBehaviour
{
    [SerializeField] private VisualEffect vfx;

    public void Pausar() => vfx.pause = true;
    public void Continuar() => vfx.pause = false;

    public void Reiniciar()
    {
        // Reinit limpa todas as partículas existentes e zera o tempo.
        vfx.Reinit();
        vfx.Play();
    }

    public void DefinirSeed(uint seed)
    {
        // Permite reproducibilidade (mesma seed = mesmo padrão de aleatório).
        vfx.startSeed = seed;
        vfx.resetSeedOnPlay = false;
        vfx.Reinit();
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Trocar a textura usada pelo VFX em runtime.
// Exemplo: efeito de magia muda o sprite conforme o elemento (fogo, gelo, raio).
using UnityEngine;
using UnityEngine.VFX;

public class TrocadorDeElemento : MonoBehaviour
{
    [SerializeField] private VisualEffect vfx;
    [SerializeField] private Texture texturaFogo;
    [SerializeField] private Texture texturaGelo;
    [SerializeField] private Texture texturaRaio;

    public enum Elemento { Fogo, Gelo, Raio }

    public void Trocar(Elemento e)
    {
        Texture t = e switch
        {
            Elemento.Fogo => texturaFogo,
            Elemento.Gelo => texturaGelo,
            _ => texturaRaio
        };

        // SetTexture funciona com qualquer property exposta do tipo Texture2D.
        vfx.SetTexture("TexturaPartícula", t);
    }
}`,
      },
    ],
    points: [
      "VFX Graph roda em GPU; suporta milhões de partículas.",
      "Editor visual com contextos: Spawn, Initialize, Update, Output.",
      "Funciona em URP (recente) e HDRP; não funciona em Built-in.",
      "Properties expostas viram parâmetros acessíveis via SetFloat, SetVector3.",
      "SendEvent dispara bursts ou eventos definidos dentro do graph.",
      "Reinit() reinicia tudo do zero; útil entre cenas ou cutscenes.",
      "Detecção de colisão funciona via SDFs ou planos, não colliders normais.",
      "Para poucos efeitos com lógica do jogo, Shuriken ainda é mais simples.",
    ],
    alerts: [
      {
        type: "tip",
        content: "O Visual Effect Graph Samples na Asset Store traz dezenas de efeitos prontos (fogo, magia, fluido, fumaça volumétrica). Estudar e desmontar esses é a forma mais rápida de aprender VFX Graph.",
      },
      {
        type: "warning",
        content: "VFX Graph exige GPU compatível com compute shaders. Aparelhos Android antigos podem não suportar. Sempre teste em hardware mínimo se for distribuir mobile.",
      },
      {
        type: "info",
        content: "Os contextos do VFX Graph rodam em ordem fixa: primeiro Spawn, depois Initialize (na criação), depois Update (todo frame), depois Output. Essa ordem importa quando você projetar o gráfico.",
      },
    ],
  },
  {
    slug: "sombras",
    section: "graficos-luz",
    title: "Sombras: Hard, Soft e Cascades",
    difficulty: "intermediario",
    subtitle: "Como sombras são calculadas, configuradas e otimizadas em tempo real.",
    intro: `Sombras são parte fundamental da percepção visual. Sem sombras, objetos parecem flutuar sem peso, e o cérebro estranha imediatamente. O problema é que sombras realistas são caríssimas para calcular em tempo real. Toda solução nos jogos atuais é uma aproximação engenhosa, com várias técnicas para enganar o olho enquanto a GPU não derrete. Entender essas aproximações ajuda a evitar artefatos visuais comuns e a otimizar o jogo.

A técnica padrão hoje se chama Shadow Mapping. A engine renderiza a cena uma vez do ponto de vista da luz, salvando apenas a profundidade (distância) numa textura especial chamada shadow map. Depois, ao desenhar a cena para o jogador, cada pixel pergunta: 'eu estou mais longe da luz do que o que está nesse shadow map?'. Se sim, está em sombra. Esse mecanismo é elegante mas tem custos: cada luz que projeta sombra renderiza a cena inteira mais uma vez. Quatro luzes com sombra dobram aproximadamente o custo de renderização.

Existem dois tipos visuais de sombra: Hard (borda dura, pixelizada) e Soft (borda suavizada com PCF — Percentage Closer Filtering). Soft é muito mais bonito mas mais caro. Para directional lights (sol), o Unity usa Cascaded Shadow Maps: divide o frustum da câmera em fatias (geralmente 2 ou 4 cascades), cada uma com seu próprio shadow map em resolução proporcional à distância. Coisas perto têm sombras nítidas; coisas longe usam mapas menores e ficam aceitáveis.

Os artefatos clássicos são: Shadow Acne (faixas escuras tremulando na superfície, causadas por imprecisão de float — corrige com bias); Peter Panning (a sombra se separa do objeto e parece flutuar — causada por bias exagerado, é um trade-off); Shadow Flickering (sombras tremem no movimento — relacionado a resolução baixa do mapa). Ajustar esses parâmetros é parte importante de polir um jogo, mas é trabalho que ninguém percebe quando bem feito.`,
    codes: [
      {
        lang: "csharp",
        code: `// Configurar sombras de uma luz via código.
using UnityEngine;

public class ConfigurarSombras : MonoBehaviour
{
    void Start()
    {
        var luz = GetComponent<Light>();

        // Soft Shadows tem qualidade visual muito superior, mas custa mais GPU.
        luz.shadows = LightShadows.Soft;

        // Strength controla o quão escura a sombra fica (0 = sem sombra, 1 = preta).
        luz.shadowStrength = 0.85f;

        // Bias evita o "shadow acne". Valores típicos: 0.05 a 0.2.
        luz.shadowBias = 0.1f;
        luz.shadowNormalBias = 0.4f;

        // Resolution determina quantos pixels o shadow map terá.
        luz.shadowResolution = UnityEngine.Rendering.LightShadowResolution.High;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Trocar qualidade de sombras conforme distância
// (cascades configurados na URP Asset, mas o ScriptableRendererData expõe).
using UnityEngine;
using UnityEngine.Rendering.Universal;

public class QualidadeSombras : MonoBehaviour
{
    [SerializeField] private UniversalRenderPipelineAsset urpAsset;

    public void DefinirAlcanceSombras(float distancia)
    {
        // Distância máxima em que sombras são desenhadas; tudo além disso, sem.
        urpAsset.shadowDistance = distancia;
    }

    public void DefinirCascadeCount(int cascades)
    {
        // 1 cascade = barato, mas qualidade inconsistente.
        // 4 cascades = melhor qualidade, mais GPU.
        urpAsset.shadowCascadeCount = Mathf.Clamp(cascades, 1, 4);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Controlar quais objetos projetam ou recebem sombra.
// Otimização clássica: objetos pequenos não precisam projetar sombra.
using UnityEngine;
using UnityEngine.Rendering;

public class ConfigurarSombrasObjeto : MonoBehaviour
{
    void Start()
    {
        var rend = GetComponent<Renderer>();

        // ShadowCastingMode.Off poupa muito desempenho em objetos pequenos.
        rend.shadowCastingMode = ShadowCastingMode.Off;

        // ShadowsOnly faz o objeto invisivel mas ainda projetar sombra.
        // Útil para "proxy" simples representando um modelo complexo.
        // rend.shadowCastingMode = ShadowCastingMode.ShadowsOnly;

        // Receber sombra (a sombra de outros pousa neste objeto).
        rend.receiveShadows = true;
    }
}`,
      },
    ],
    points: [
      "Sombras em tempo real usam Shadow Mapping — renderiza cena por luz.",
      "Hard shadows são baratas e pixelizadas; Soft são bonitas e caras.",
      "Cascades dividem o frustum em fatias de qualidade diferente.",
      "Cada luz com sombra dobra (aproximadamente) o custo de renderização.",
      "Shadow Bias evita acne mas exagerar causa Peter Panning.",
      "ShadowCastingMode.Off em objetos pequenos é otimização gratuita.",
      "Aumente ShadowDistance só o necessário; valor padrão costuma ser exagerado.",
      "Sombras de point lights são especialmente caras (renderizam 6 lados).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Em mobile, prefira sombras só na luz principal (sol). Cada luz adicional com shadow é custosa, e em cenas grandes pode derrubar de 60 para 20 FPS sem você perceber a causa.",
      },
      {
        type: "tip",
        content: "Para objetos estáticos, considere desativar receive shadows e usar sombras baked. O resultado visual é melhor e o custo em runtime cai praticamente a zero.",
      },
      {
        type: "info",
        content: "Em cenas com muitos detalhes pequenos próximos da câmera, aumentar shadow resolution para Very High no main light vale mais que tentar sombras suaves em luzes secundárias.",
      },
    ],
  },
  {
    slug: "urp-vs-hdrp",
    section: "graficos-luz",
    title: "URP vs HDRP: Comparativo Final",
    difficulty: "avancado",
    subtitle: "Quando escolher cada uma das duas pipelines modernas do Unity.",
    intro: `No início desta seção, falamos brevemente das pipelines. Agora, com você já conhecendo materiais, luzes, post-processing e VFX, conseguimos comparar URP e HDRP com profundidade real. Essa decisão técnica afeta tudo: que assets você compra, que tutoriais você segue, em quais plataformas seu jogo roda, quanto tempo leva para iterar, e até quem você consegue contratar. Não é uma escolha que dá pra adiar.

A URP (Universal Render Pipeline) é otimizada para alcance: roda do iPhone mais simples até o PC top. Tem renderização single-pass forward (uma passagem por frame para todas as luzes), o que a torna eficiente em hardware fraco e em VR. Suporta praticamente tudo o que jogos comerciais precisam: shadow cascades, post-processing, SSAO, decal projector, refração simples, transparências corretas. Alguns recursos avançados (como volumetric fog real, Screen Space Reflections de alta qualidade, ray tracing) ou não existem ou têm versão simplificada.

A HDRP (High Definition Render Pipeline) é o oposto: foca em fidelidade absoluta para PC moderno e console current-gen (PS5, Xbox Series). Usa renderização deferred com physically based lighting completo, materiais com propriedades como anisotropy, clearcoat, subsurface scattering. Suporta volumetric lighting, SSGI, SSR, ray tracing real (em GPUs RTX), iridescent materials. O preço: requer hardware potente, projetos demoram mais para configurar, e shaders custom são mais complexos. Não roda em mobile e não é destinada a isso.

A regra prática: jogos casuais, mobile, indies, jogos com estilo estilizado/cartoon, VR, multiplayer competitivo, projetos com prazo apertado — vá de URP. Jogos AAA realistas, simulações arquitetônicas fotorrealistas, automotive visualization, projetos onde fidelidade visual é diferencial competitivo, equipes técnicas experientes — vá de HDRP. E se está em dúvida: provavelmente é URP. A maioria dos projetos indies que escolhem HDRP por ambição acaba refazendo em URP no meio do caminho.`,
    codes: [
      {
        lang: "csharp",
        code: `// Identificar a pipeline ativa de forma robusta para código condicional.
using UnityEngine;
using UnityEngine.Rendering;

public static class PipelineUtils
{
    public enum Pipeline { Builtin, URP, HDRP, Outra }

    public static Pipeline DetectarPipeline()
    {
        var asset = GraphicsSettings.currentRenderPipeline;
        if (asset == null) return Pipeline.Builtin;

        string nome = asset.GetType().Name;
        if (nome.Contains("Universal")) return Pipeline.URP;
        if (nome.Contains("HDRender") || nome.Contains("HighDefinition"))
            return Pipeline.HDRP;

        return Pipeline.Outra;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Carregar shaders diferentes conforme pipeline ativa.
// Padrão útil para assets que querem rodar em URP e HDRP.
using UnityEngine;

public class CarregadorDeMateriaisAdaptativo : MonoBehaviour
{
    [SerializeField] private Material materialURP;
    [SerializeField] private Material materialHDRP;

    void Start()
    {
        var pipe = PipelineUtils.DetectarPipeline();
        var rend = GetComponent<Renderer>();

        rend.sharedMaterial = pipe switch
        {
            PipelineUtils.Pipeline.URP => materialURP,
            PipelineUtils.Pipeline.HDRP => materialHDRP,
            _ => materialURP // fallback razoável
        };
    }
}`,
      },
      {
        lang: "json",
        code: `{
  "comparativo": {
    "urp": {
      "publicoAlvo": "mobile, console, PC, VR",
      "renderizacao": "forward (single-pass)",
      "performance": "alta em hardware fraco",
      "configuracaoMaterial": "simples (Lit, Unlit, Particles)",
      "volumetricos": "limitados",
      "rayTracing": "nao",
      "tempoDeBuild": "rapido",
      "ideal_para": "indie, mobile, jogos cartoon, VR, prototipos"
    },
    "hdrp": {
      "publicoAlvo": "PC moderno, PS5, Xbox Series",
      "renderizacao": "deferred fisica completa",
      "performance": "exige GPU robusta",
      "configuracaoMaterial": "rico (Lit Stack, Hair, Eye, Fabric)",
      "volumetricos": "completos com fog, god rays",
      "rayTracing": "sim em GPUs RTX",
      "tempoDeBuild": "longo, lightmaps demoram",
      "ideal_para": "AAA realista, archviz, automotive, cinematics"
    }
  }
}`,
      },
      {
        lang: "bash",
        code: `# Pacotes oficiais que indicam qual pipeline está em uso.
# Você os encontra em Window > Package Manager.

# URP:
com.unity.render-pipelines.universal

# HDRP:
com.unity.render-pipelines.high-definition

# Comum a ambas (instalado automaticamente como dependência):
com.unity.render-pipelines.core
com.unity.shadergraph
com.unity.visualeffectgraph

# Atenção: você nao deve ter URP e HDRP instalados ao mesmo tempo.
# Causa conflitos sutis em material e Shader Graph.`,
      },
    ],
    points: [
      "URP é a escolha padrão da Unity para a maioria dos projetos hoje.",
      "HDRP é para fidelidade AAA em hardware moderno; não para mobile.",
      "URP usa forward rendering single-pass; HDRP usa deferred físico.",
      "HDRP suporta ray tracing, volumetric lighting e materiais avançados.",
      "URP suporta praticamente tudo que jogos comerciais precisam, mais leve.",
      "Não use URP e HDRP no mesmo projeto; escolha uma.",
      "Migrar de URP para HDRP (ou vice-versa) é praticamente refazer materiais.",
      "Em dúvida, comece com URP. Refazer um indie em URP é mais comum que o contrário.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Não escolha HDRP só porque os screenshots de demos são mais bonitos. Demos rodam em RTX 4090 com cenas pequenas e otimizadas. Seu jogo real, em PC médio, talvez nem chegue a 30 FPS.",
      },
      {
        type: "tip",
        content: "Se o time técnico tem menos de 3 pessoas com experiência em pipeline gráfica, evite HDRP. A complexidade de configuração consome tempo desproporcional ao benefício visual.",
      },
      {
        type: "info",
        content: "URP recebeu atualizações enormes nas versões 2022.3 LTS e 2023.x: agora suporta Decals, SSAO, Light Cookies e Render Graph. Em muitos casos, supera HDRP em razão custo-benefício.",
      },
    ],
  },
];
