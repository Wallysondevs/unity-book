import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "bem-vindo",
    section: "boas-vindas",
    title: "Bem-vindo ao Unity",
    difficulty: "iniciante",
    subtitle: "O que esperar deste livro e como tirar o máximo proveito da jornada com a engine.",
    intro: `Imagine que você decidiu construir uma casa. Você poderia começar literalmente do zero: cortar a madeira, fundir os pregos, fabricar as telhas. Levaria anos. Ou você poderia ir até uma loja, comprar tudo já pronto e focar no que realmente importa: o projeto da casa, a decoração, onde vai ficar a janela. O Unity é exatamente isso para quem quer fazer jogos. Ele é uma "engine" — em português, um motor — e isso significa que ele já vem com tudo o que é repetitivo e técnico resolvido: renderização gráfica, física, som, entrada do teclado, sistema de janelas. Você foca em desenhar o seu mundo, não em reinventar o tijolo.

A grande novidade para quem nunca abriu uma engine é que o Unity não é só uma "biblioteca de programação". Ele é um programa que você abre, com janelas, botões, uma cena 3D que você arrasta com o mouse, um Inspector cheio de propriedades. Isso assusta no começo, porque parece um Photoshop misturado com Visual Studio misturado com Blender. A boa notícia é que você não precisa entender tudo de uma vez. Vamos do "abrir o Unity Hub" até temas avançados como shaders customizados, multiplayer e otimização de mobile, sempre com exemplos prontos para você quebrar.

Este livro foi escrito assumindo que você nunca fez um jogo, nunca programou em C#, nunca abriu uma engine. Se já fez, ótimo, pule trechos. Se não fez, vamos com calma, com analogias, repetindo conceitos quantas vezes for preciso até virar natural. A regra do jogo é uma só: abra o Unity em uma janela, este livro em outra, e refaça cada exemplo com as suas próprias mãos. Ler é metade do aprendizado, mexer é a outra metade. No próximo capítulo, você vai entender por que tanta gente, do estudante de colégio à AAA da indústria, escolheu o Unity como ferramenta de trabalho.`,
    codes: [
      {
        lang: "csharp",
        code: `// Seu primeiro script em Unity. Crie um GameObject vazio na cena,
// arraste este script para ele e aperte Play.
using UnityEngine;

public class OlaUnity : MonoBehaviour
{
    // Start é chamado uma vez, no primeiro frame em que o objeto existe.
    void Start()
    {
        // Debug.Log escreve uma mensagem na janela "Console" do Unity.
        Debug.Log("Ola! Bem-vindo ao Unity.");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Variaveis publicas aparecem automaticamente no Inspector,
// permitindo configurar valores sem mexer no codigo.
using UnityEngine;

public class BoasVindasConfiguravel : MonoBehaviour
{
    // O atributo [SerializeField] expoe a variavel no Inspector
    // mesmo quando ela e privada (boa pratica de encapsulamento).
    [SerializeField] private string nomeDoJogador = "Aventureiro";
    [SerializeField] private int nivelInicial = 1;

    void Start()
    {
        // Concatenamos texto e numero usando interpolacao com $""
        Debug.Log($"Boas-vindas, {nomeDoJogador}! Voce comeca no nivel {nivelInicial}.");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Update roda uma vez por frame. Se o jogo roda a 60 FPS,
// este metodo executa 60 vezes por segundo.
using UnityEngine;

public class MeuPrimeiroMovimento : MonoBehaviour
{
    [SerializeField] private float velocidade = 5f;

    void Update()
    {
        // Input.GetAxis devolve um numero entre -1 e 1 conforme a tecla pressionada.
        // "Horizontal" responde a setas esquerda/direita e teclas A/D por padrao.
        float horizontal = Input.GetAxis("Horizontal");

        // Multiplicar por Time.deltaTime garante movimento suave
        // independente da taxa de quadros do computador do jogador.
        transform.Translate(Vector3.right * horizontal * velocidade * Time.deltaTime);
    }
}`,
      },
      {
        lang: "bash",
        code: `# Antes de abrir o Unity, instale o Unity Hub.
# Ele e o gerenciador oficial que controla qual versao do editor voce usa.

# Windows: baixe em https://unity.com/download
# macOS:   mesmo link, instalador .dmg
# Linux:   AppImage no mesmo site

# Dentro do Hub, instale uma versao LTS (Long Term Support) recente,
# por exemplo a 2022 LTS ou a 6 LTS, e adicione modulos para suas plataformas alvo.`,
      },
    ],
    points: [
      "Unity e um motor de jogo: ele resolve o trabalho repetitivo e libera voce para criar.",
      "O editor parece complexo no inicio, mas voce aprende navegando, nao decorando.",
      "Refaca todos os exemplos no seu Unity, nao apenas leia o livro.",
      "Scripts em Unity sao classes C# que herdam de MonoBehaviour.",
      "Variaveis com [SerializeField] aparecem no Inspector e podem ser ajustadas sem recompilar.",
      "Errar e parte do processo: cada erro no Console traz uma pista do que ajustar.",
      "Iniciante comum: tentar dominar todas as janelas antes de criar o primeiro objeto.",
      "Iniciante comum: copiar scripts sem digitar manualmente, perdendo a memoria muscular.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Mantenha um documento ou Notion so para anotar erros que voce viu no Console e como resolveu. Em poucas semanas vira seu manual pessoal mais valioso que qualquer tutorial.",
      },
      {
        type: "info",
        content: "Sempre instale uma versao LTS (Long Term Support) do Unity. Versoes Tech Stream sao mais novas, mas mudam APIs sem aviso e quebram tutoriais com frequencia.",
      },
      {
        type: "warning",
        content: "Nao abra o mesmo projeto em duas versoes diferentes do Unity sem fazer backup. A engine reescreve arquivos internos no primeiro Open e voce pode perder a possibilidade de voltar.",
      },
    ],
  },
  {
    slug: "por-que-unity",
    section: "boas-vindas",
    title: "Por que aprender Unity?",
    difficulty: "iniciante",
    subtitle: "Vantagens reais, ecossistema gigante e oportunidades de carreira em jogos e alem.",
    intro: `Existem dezenas de motores de jogo no mercado, alguns muito poderosos: Unreal Engine, Godot, GameMaker, Construct, Cocos. Por que tanta gente, do desenvolvedor solo ao estudio AAA, escolhe o Unity? A resposta tem tres pilares: produtividade, alcance e comunidade. Voce produz rapido, publica em quase qualquer lugar, e quando trava, tem um oceano de gente disposta a te responder.

A produtividade vem do casamento entre o editor visual e a linguagem C#. Voce arrasta um modelo 3D para a cena, cai no chao, anexa um script, programa o comportamento, aperta Play e ja esta jogando. Esse ciclo "muda, aperta Play, ve o resultado" leva segundos, nao minutos. Em motores que exigem compilar o jogo inteiro a cada teste, voce perde horas por dia esperando. No Unity, o feedback e quase instantaneo, e isso muda completamente a forma como voce experimenta ideias.

O alcance e o segundo pilar. O mesmo projeto que voce roda no seu PC pode ser exportado para Windows, macOS, Linux, Android, iOS, WebGL, PlayStation, Xbox, Nintendo Switch, Meta Quest, Apple Vision Pro e por ai vai. Existem jogos como "Hollow Knight", "Cuphead", "Among Us", "Pokemon Go", "Cities: Skylines" e "Genshin Impact" feitos em Unity. Mas ele nao serve so para games: arquitetos usam Unity para tours virtuais, medicos usam para treinamento, montadoras como BMW e Audi usam para configuradores 3D, e cinemas como o de "The Mandalorian" usam para cenarios virtuais em tempo real.

O terceiro pilar e a comunidade. A documentacao oficial e enorme, ha dezenas de milhares de pacotes na Asset Store, cursos gratuitos no Unity Learn, forums, Discord, YouTube. Quando voce buscar uma duvida, raramente sera o primeiro a ter aquele problema. No mercado de trabalho, Unity aparece em vagas para desenvolvedor de jogos, XR (realidade virtual e aumentada), simulacao automotiva, arquitetura, treinamentos corporativos e ate twin digital industrial. Aprender Unity e investir em uma ferramenta que rende em multiplas industrias.`,
    codes: [
      {
        lang: "csharp",
        code: `// Demonstracao do "ciclo rapido": mudar uma variavel no Inspector
// enquanto o jogo esta rodando. Anexe a um cubo qualquer da cena.
using UnityEngine;

public class GiraCubo : MonoBehaviour
{
    // Voce pode editar este valor durante o Play e ver o efeito ao vivo.
    [SerializeField] private float velocidadeRotacao = 90f;

    void Update()
    {
        // Rotaciona em torno do eixo Y, em graus por segundo.
        transform.Rotate(Vector3.up, velocidadeRotacao * Time.deltaTime);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Mesmo codigo C# roda em PC, mobile, console e WebGL.
// O Unity oferece APIs unicas que se adaptam a cada plataforma.
using UnityEngine;

public class DetectaPlataforma : MonoBehaviour
{
    void Start()
    {
        // Application.platform devolve um enum com a plataforma atual.
        Debug.Log($"Estou rodando em: {Application.platform}");

        // SystemInfo traz informacoes do hardware do jogador.
        Debug.Log($"GPU: {SystemInfo.graphicsDeviceName}");
        Debug.Log($"Memoria do sistema: {SystemInfo.systemMemorySize} MB");

        // Util para ajustar qualidade automaticamente em celulares fracos.
        if (SystemInfo.systemMemorySize < 3000)
        {
            QualitySettings.SetQualityLevel(0); // qualidade baixa
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// O ecossistema rico permite resolver problemas complexos com poucas linhas.
// Aqui usamos o sistema de fisica embutido para detectar uma colisao.
using UnityEngine;

public class DetectaColisao : MonoBehaviour
{
    // OnCollisionEnter e chamado automaticamente quando este objeto
    // colide com outro que tambem tem um Collider e Rigidbody.
    void OnCollisionEnter(Collision colisao)
    {
        // colisao.gameObject e o "outro" objeto envolvido na batida.
        Debug.Log($"Bati em: {colisao.gameObject.name}");

        // contacts[0].point e a posicao exata do impacto no espaco 3D,
        // util para spawnar particulas, sons, etc.
        Vector3 ponto = colisao.contacts[0].point;
        Debug.Log($"Ponto da colisao: {ponto}");
    }
}`,
      },
      {
        lang: "bash",
        code: `# Para ver o tamanho do ecossistema, vale conhecer:
# - Unity Asset Store: milhares de modelos, scripts e shaders gratis e pagos
# - Unity Package Manager: pacotes oficiais (URP, HDRP, Input System, Cinemachine)
# - GitHub: bibliotecas open source como UniTask, DOTween, Zenject, MessagePipe

# Exemplo: instalar o Cinemachine via Package Manager
# Window > Package Manager > Unity Registry > Cinemachine > Install`,
      },
    ],
    points: [
      "Ciclo rapido de iteracao: aperte Play e veja resultado em segundos.",
      "Mesmo codigo roda em PC, mobile, console, WebGL, VR e AR.",
      "Asset Store e Package Manager economizam meses de trabalho repetido.",
      "Comunidade gigante: tutoriais, forums, Discord e respostas para quase tudo.",
      "Mercado alem de jogos: arquitetura, automotivo, simulacao, cinema, treinamento.",
      "Linguagem oficial e C#, com tooling profissional e tipos fortes.",
      "Armadilha: ficar so na Asset Store sem entender o que cada asset faz.",
      "Armadilha: pular fundamentos da engine e quebrar a cara em otimizacao depois.",
    ],
    alerts: [
      {
        type: "success",
        content: "Jogos como Hollow Knight, Cuphead, Among Us, Cities: Skylines, Genshin Impact e Pokemon Go foram feitos em Unity. Voce esta aprendendo uma ferramenta usada de verdade no mercado.",
      },
      {
        type: "info",
        content: "Unity nao e a engine com a melhor renderizacao por padrao (esse posto vai para Unreal com Lumen e Nanite), mas costuma ser a mais produtiva para times pequenos e medios e a mais ampla em plataformas suportadas.",
      },
      {
        type: "tip",
        content: "Escolha cedo um nicho que te empolga (jogos 2D mobile, VR, simulacao, narrativos) e use Unity como ferramenta para esse nicho. Aprender com proposito acelera muito mais do que tutorial generico.",
      },
      {
        type: "warning",
        content: "Em 2023 a Unity tentou cobrar uma taxa por instalacao (Runtime Fee) e gerou crise de confianca. A politica foi revogada em 2024, mas leia sempre os termos atuais antes de comecar um projeto comercial grande.",
      },
    ],
  },
  {
    slug: "historia-unity",
    section: "boas-vindas",
    title: "A historia do Unity",
    difficulty: "iniciante",
    subtitle: "De um jogo dinamarques esquecido a maior plataforma de criacao 3D do mundo.",
    intro: `Toda ferramenta carrega marcas da sua historia, e entender de onde o Unity veio te ajuda a entender por que ele e do jeito que e: o nome das janelas, a obsessao por multiplataforma, a abertura para hobistas. A historia comeca em 2002 em Copenhague, na Dinamarca, com tres amigos: David Helgason, Joachim Ante e Nicholas Francis. Eles fizeram um jogo chamado "GooBall" para Mac. O jogo foi um fracasso comercial, mas o motor que eles construiram para fazer o jogo era surpreendentemente bom. A virada de chave foi perceber que ninguem mais alem deles teria acesso a esse motor se nao o tornassem um produto.

Em 2005, eles lancaram o Unity 1.0 como uma engine para Mac OS X, com a missao explicita de "democratizar o desenvolvimento de jogos". Naquela epoca, fazer um jogo 3D exigia comprar licencas de motores que custavam centenas de milhares de dolares ou escrever tudo do zero em C++. O Unity entrou cobrando barato (e tendo uma versao gratuita), mirando estudantes e desenvolvedores indie. Por anos foi visto como "engine de hobista".

A explosao veio com o iPhone, em 2008. A Apple lancou a App Store e, de repente, qualquer pessoa podia vender jogos para milhoes de pessoas. O Unity ja tinha suporte para iOS pronto, e foi a engine que muitos estudios pequenos escolheram. Jogos como "Temple Run" e "Tiny Wings" colocaram o Unity no mapa. Em 2010, veio suporte para Android. Em 2011, para Windows e consoles. A cada ano, mais plataformas, mais usuarios, mais investimento. Em 2020, a Unity Technologies abriu capital na bolsa de Nova York.

Hoje, o Unity e usado em mais da metade dos jogos mobile do mundo, em filmes da Disney, em treinamentos da NASA e em simulacoes industriais da Mercedes. A versao atual no momento desta escrita e a "Unity 6", lancada em 2024, mas a empresa mantem as versoes LTS (Long Term Support) anteriores recebendo correcoes por anos. Saber dessa trajetoria te ajuda a interpretar tutoriais antigos, escolher a versao certa para o seu projeto, e entender debates da comunidade quando alguem fala em "Built-in vs URP" ou "antes do novo Input System".`,
    codes: [
      {
        lang: "csharp",
        code: `// Voce pode descobrir qual versao de Unity esta rodando dentro do proprio editor.
using UnityEngine;

public class MostraVersaoUnity : MonoBehaviour
{
    void Start()
    {
        // Application.unityVersion devolve a versao em texto.
        Debug.Log($"Versao do Unity: {Application.unityVersion}");
        // Exemplo de saida: 6000.0.23f1   ou   2022.3.45f1
    }
}`,
      },
      {
        lang: "bash",
        code: `# No Unity Hub voce ve todas as versoes instaladas e gerencia elas.
# Cada projeto fica "amarrado" a uma versao especifica gravada em
# ProjectSettings/ProjectVersion.txt

# Para descobrir a versao usada por um projeto sem abrir o Unity:
cat MeuProjeto/ProjectSettings/ProjectVersion.txt
# Saida tipica:
# m_EditorVersion: 2022.3.45f1
# m_EditorVersionWithRevision: 2022.3.45f1 (abc1234def56)`,
      },
      {
        lang: "csharp",
        code: `// Marcos da historia do Unity organizados em um dicionario,
// so para visualizar a evolucao.
using System.Collections.Generic;
using UnityEngine;

public class HistoriaUnity : MonoBehaviour
{
    void Start()
    {
        var marcos = new Dictionary<int, string>
        {
            { 2005, "Unity 1.0 lancado, exclusivo para Mac OS X" },
            { 2008, "Suporte para iPhone, alavancado pela App Store" },
            { 2010, "Suporte para Android e versao gratuita ampliada" },
            { 2017, "Lancamento do URP/HDRP (Scriptable Render Pipeline)" },
            { 2018, "Sistema de pacotes (Package Manager) e DOTS anunciado" },
            { 2020, "IPO na bolsa de Nova York; Unity 2020 LTS" },
            { 2023, "Polemica do Runtime Fee; CEO substituido" },
            { 2024, "Unity 6 lancada com foco em performance e multiplataforma" },
        };

        foreach (var par in marcos)
        {
            Debug.Log($"{par.Key} -> {par.Value}");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Curiosidade: o Unity originalmente usava a linguagem JavaScript
// (chamada "UnityScript") alem de C# e Boo. Hoje so C# e suportado.
// Se voce ver tutoriais com sintaxe parecida com JS dentro do Unity,
// e codigo antigo (anterior a 2017) e nao funciona mais.

using UnityEngine;

public class ApenasCSharpHoje : MonoBehaviour
{
    void Start()
    {
        // C# moderno suporta tipos var, string interpolation, LINQ,
        // async/await e muitas outras facilidades.
        var saudacao = "Unity hoje so fala C#";
        Debug.Log(saudacao);
    }
}`,
      },
    ],
    points: [
      "Criada em 2005 em Copenhague por David Helgason, Joachim Ante e Nicholas Francis.",
      "Originalmente exclusiva do Mac OS X; multiplataforma veio aos poucos.",
      "Explosao com a App Store do iPhone a partir de 2008.",
      "Versoes LTS (Long Term Support) sao mantidas por anos com correcoes.",
      "Versao atual relevante: Unity 6 (2024); LTS anteriores ainda muito usadas.",
      "Suporte historico a UnityScript e Boo foi removido; hoje so C#.",
      "Armadilha: seguir tutoriais de UnityScript de 2014 que nao compilam mais.",
      "Armadilha: misturar codigo Built-in com URP/HDRP sem perceber as diferencas.",
    ],
    alerts: [
      {
        type: "info",
        content: "A polemica do Runtime Fee em 2023 levou a saida do entao CEO John Riccitiello e a uma reformulacao da politica de licenciamento em 2024. Sempre confira as condicoes de licenca atuais no site oficial antes de iniciar um projeto comercial.",
      },
      {
        type: "tip",
        content: "Quando pesquisar duvidas no Google, sempre adicione o ano ou a versao do Unity (por exemplo: 'unity 2022 input system'). Resultados de 2015 podem mostrar APIs ja removidas e te confundir por horas.",
      },
      {
        type: "success",
        content: "A documentacao oficial em https://docs.unity3d.com permite voce escolher a versao no canto superior direito. Use sempre a mesma versao do seu projeto para evitar frustracao com APIs diferentes.",
      },
    ],
  },
  {
    slug: "motores-comparados",
    section: "boas-vindas",
    title: "Unity vs Unreal vs Godot",
    difficulty: "iniciante",
    subtitle: "Como o Unity se posiciona ao lado dos outros grandes motores de jogo.",
    intro: `Antes de mergulhar no Unity, vale entender o cenario completo. Voce vai ouvir nomes como Unreal Engine, Godot, GameMaker, Construct, Defold, e e justo se perguntar: "Estou escolhendo a ferramenta certa?". A resposta honesta e que nao existe motor "melhor" no absoluto. Existe o motor mais adequado para o tipo de jogo, o tamanho do time, o orcamento, a plataforma alvo e o seu estilo de pensar. Este capitulo te da o vocabulario para essa conversa, sem fanatismo.

A Unreal Engine, da Epic Games (a mesma de Fortnite), e a referencia em renderizacao realista. Se voce abrir um trailer cinematografico de jogo AAA com graficos foto-realistas, ha uma boa chance de ser Unreal. Ela usa C++ como linguagem principal e Blueprints (um sistema visual de nos) para programacao sem codigo. E poderosissima, mas o ciclo de iteracao e mais lento, o tamanho do build e maior e o aprendizado e mais ingreme. Em times pequenos sem programador C++ experiente, costuma ser excessiva.

A Godot e a queridinha do mundo open source. Ela e gratuita, leve (o editor inteiro tem cerca de 50 MB), usa uma linguagem propria chamada GDScript (parecida com Python) e tem uma filosofia de "tudo e uma cena". E excelente para jogos 2D, prototipos rapidos e quem nao quer depender de uma empresa. Em 3D pesado e em plataformas como console, ainda esta atras de Unity e Unreal, mas evolui rapido. Se a polemica do Runtime Fee da Unity te assustou em 2023, voce nao foi o unico: muita gente migrou para Godot naquele ano.

O Unity ocupa o meio termo. Renderiza menos bonito por padrao que Unreal, e mais "pesado" que Godot, mas tem o melhor equilibrio entre produtividade, plataformas suportadas, ecossistema de assets e disponibilidade de profissionais no mercado. Para mobile, ele e dominante. Para VR/AR, e dominante. Para indie 3D de medio porte, e a escolha mais segura. E quando voce aprende Unity, transferir conhecimento para outros motores depois fica facil, porque os conceitos (cena, GameObject, componente, fisica, render pipeline) sao semelhantes em todos.`,
    codes: [
      {
        lang: "csharp",
        code: `// Unity: linguagem oficial e C#, com tipos fortes e tooling moderno.
// Esta classe seria praticamente identica em qualquer projeto Unity.
using UnityEngine;

public class ExemploUnity : MonoBehaviour
{
    [SerializeField] private float velocidade = 5f;

    void Update()
    {
        // API consistente entre versoes e plataformas
        transform.position += Vector3.right * velocidade * Time.deltaTime;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Unreal Engine, em C++, faz a mesma coisa de forma mais verbosa.
// (Este codigo NAO roda no Unity. E so para comparacao visual.)
//
// void AMyActor::Tick(float DeltaTime)
// {
//     Super::Tick(DeltaTime);
//     FVector Location = GetActorLocation();
//     Location.X += Velocidade * DeltaTime;
//     SetActorLocation(Location);
// }
//
// Unreal tambem oferece Blueprints (programacao visual com nos),
// que substitui codigo em muitos casos.

// Conclusao: Unity privilegia codigo C# direto e enxuto.`,
      },
      {
        lang: "csharp",
        code: `// Godot, em GDScript (parece Python), faria assim:
// (Tambem nao roda no Unity, e ilustracao.)
//
// extends Node3D
// var velocidade = 5
// func _process(delta):
//     position.x += velocidade * delta
//
// Nota: Godot tambem suporta C# como segunda linguagem oficial
// desde a versao 3.0, mas a maioria dos tutoriais usa GDScript.

// Conclusao: cada motor tem sintaxe propria,
// mas os conceitos (process loop, posicao, delta time) se repetem.`,
      },
      {
        lang: "json",
        code: `{
  "comparativo": {
    "unity": {
      "linguagem": "C#",
      "forte_em": ["mobile", "VR/AR", "indie 3D", "multiplataforma"],
      "fraco_em": ["renderizacao foto-realista pronta de fabrica"],
      "preco": "Gratis ate certa receita anual; planos pagos acima"
    },
    "unreal": {
      "linguagem": "C++ + Blueprints",
      "forte_em": ["graficos AAA", "cinematica", "open world"],
      "fraco_em": ["mobile leve", "iteracao rapida em times pequenos"],
      "preco": "Gratis; royalty de 5% acima de US$ 1 milhao por jogo"
    },
    "godot": {
      "linguagem": "GDScript (e C#)",
      "forte_em": ["2D", "prototipos", "open source", "leveza"],
      "fraco_em": ["3D AAA", "consoles (suporte limitado)"],
      "preco": "100% gratis e open source (MIT)"
    }
  }
}`,
      },
      {
        lang: "bash",
        code: `# Tamanho aproximado do editor instalado em disco
# (numeros variam por versao e modulos):

# Godot:        ~80 MB
# Unity Editor: ~5 GB (com modulos comuns)
# Unreal Engine: ~40 GB (com source e templates)

# Tamanho de um build "Hello World" 3D vazio:
# Godot:  ~25 MB
# Unity:  ~80 MB (URP) ou ~50 MB (Built-in)
# Unreal: ~200 MB`,
      },
    ],
    points: [
      "Unreal: graficos AAA, C++/Blueprints, ciclo lento, builds grandes.",
      "Godot: leveza e open source, otima em 2D, ainda fraca em 3D pesado.",
      "Unity: meio termo equilibrado, dominante em mobile, VR/AR e indie 3D.",
      "Conceitos centrais (cena, ator, componente, delta time) sao parecidos em todos.",
      "Aprender um motor facilita muito migrar para outro depois.",
      "Escolha pela plataforma alvo, time, orcamento e estilo de jogo, nao por hype.",
      "Armadilha: trocar de motor toda semana em vez de finalizar um projeto.",
      "Armadilha: escolher Unreal so pelos graficos e abandonar por nao conseguir publicar em mobile.",
    ],
    alerts: [
      {
        type: "info",
        content: "Os tres motores tem versoes gratuitas para comecar. Voce pode instalar Unity Hub, Unreal Engine via Epic Games Launcher e Godot pelo site oficial e brincar com os tres antes de decidir.",
      },
      {
        type: "tip",
        content: "Se voce esta em duvida entre Unity e Godot para um jogo 2D pequeno, escolha Godot pela leveza. Para qualquer projeto 3D que precise rodar em mobile ou VR, Unity costuma ser a escolha mais pragmatica em 2025.",
      },
      {
        type: "warning",
        content: "Cuidado com o royalty de 5% da Unreal acima de US$ 1 milhao de receita por jogo. Para indie isso quase nunca importa, mas para jogos que viram hit pode pesar muito mais que a antiga taxa Unity.",
      },
    ],
  },
  {
    slug: "onde-unity-roda",
    section: "boas-vindas",
    title: "Onde o Unity roda",
    difficulty: "iniciante",
    subtitle: "Plataformas, dispositivos e situacoes onde a engine esta presente.",
    intro: `Uma das maiores forcas do Unity e o alcance: o mesmo projeto que voce monta no seu notebook em casa pode virar um jogo no celular do seu primo, uma aplicacao VR no Meta Quest, um simulador rodando num PlayStation 5 ou ate uma experiencia que abre direto no navegador. Isso se chama "build target" (alvo de build), e e uma caracteristica intencional do projeto desde o comeco. O Unity nao gera um executavel para uma plataforma so: ele consegue empacotar a mesma cena para mais de vinte plataformas diferentes, cada uma com suas regras.

Como funciona por baixo dos panos? Voce escreve C#, que o Unity compila para uma representacao intermediaria (IL). Em algumas plataformas isso roda direto sobre o Mono, um runtime parecido com o do .NET. Em outras, principalmente as mais restritivas como iOS e consoles, o Unity faz um passo extra chamado IL2CPP, que converte seu codigo para C++ e dali para o codigo nativo da maquina alvo. O resultado e que voce nao precisa reescrever nada para mudar de plataforma: voce instala o "modulo" daquela plataforma no Unity Hub, escolhe ela como build target, aperta "Build" e sai um pacote pronto.

Mas atencao: rodar nao e o mesmo que rodar bem. Um celular tem 10 vezes menos memoria e GPU que um PC gamer. Um Quest 2 precisa renderizar dois olhos a 90 quadros por segundo, dobrando o trabalho. WebGL nao tem acesso ao sistema de arquivos do usuario. Cada plataforma tem suas pegadinhas. Saber onde Unity roda nao e so colecionar plataformas: e entender as restricoes de cada uma para tomar decisoes inteligentes desde o inicio do projeto, como escolher a render pipeline (URP para mobile e VR, HDRP para PC e console high-end, Built-in legado), o sistema de input, o tamanho dos texturas e ate o estilo visual.

Saber onde Unity roda tambem te abre portas profissionais: muitos desenvolvedores hoje nao trabalham com jogos. Trabalham com configuradores 3D para industrias automobilisticas, aplicacoes XR para treinamento medico, visualizacao arquitetonica para construtoras, simulacao militar, twin digital de fabricas. Tudo isso e Unity. O que muda e o publico, nao a engine.`,
    codes: [
      {
        lang: "csharp",
        code: `// Unity descobre sozinho em qual plataforma esta rodando.
using UnityEngine;

public class DescobreOnde : MonoBehaviour
{
    void Start()
    {
        // Application.platform devolve um enum com a plataforma de execucao.
        Debug.Log($"Plataforma: {Application.platform}");
        // Exemplos: WindowsPlayer, OSXPlayer, Android, IPhonePlayer, WebGLPlayer

        // SystemInfo da informacoes detalhadas do hardware.
        Debug.Log($"GPU: {SystemInfo.graphicsDeviceName}");
        Debug.Log($"RAM: {SystemInfo.systemMemorySize} MB");
        Debug.Log($"Processador: {SystemInfo.processorType}");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Diretivas de pre-processador permitem compilar codigo diferente
// para cada plataforma. Util para usar APIs especificas sem quebrar build.
using UnityEngine;

public class CodigoCondicional : MonoBehaviour
{
    void Start()
    {
#if UNITY_EDITOR
        Debug.Log("Rodando dentro do editor do Unity.");
#elif UNITY_ANDROID
        Debug.Log("Rodando em um aparelho Android.");
#elif UNITY_IOS
        Debug.Log("Rodando em um iPhone ou iPad.");
#elif UNITY_WEBGL
        Debug.Log("Rodando em WebGL no navegador.");
#elif UNITY_STANDALONE_WIN
        Debug.Log("Rodando em Windows desktop.");
#else
        Debug.Log("Outra plataforma.");
#endif
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Ajustar qualidade automaticamente conforme o hardware do jogador.
// Boa pratica em jogos mobile com publico variado.
using UnityEngine;

public class QualidadeAdaptativa : MonoBehaviour
{
    void Start()
    {
        int memoria = SystemInfo.systemMemorySize;

        // QualitySettings tem niveis pre-configurados em Edit > Project Settings > Quality.
        if (memoria < 2000)
        {
            QualitySettings.SetQualityLevel(0); // Very Low
            Application.targetFrameRate = 30;
        }
        else if (memoria < 4000)
        {
            QualitySettings.SetQualityLevel(2); // Medium
            Application.targetFrameRate = 60;
        }
        else
        {
            QualitySettings.SetQualityLevel(5); // Ultra
            Application.targetFrameRate = 60;
        }

        Debug.Log($"Qualidade ajustada para nivel {QualitySettings.GetQualityLevel()}");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Caminhos de arquivo mudam radicalmente entre plataformas.
// Use Application.persistentDataPath em vez de caminhos fixos.
using System.IO;
using UnityEngine;

public class CaminhosPortaveis : MonoBehaviour
{
    void Start()
    {
        // persistentDataPath e o unico lugar onde voce pode salvar arquivos
        // em qualquer plataforma (PC, mobile, console).
        string caminho = Path.Combine(Application.persistentDataPath, "save.json");
        Debug.Log($"Vou salvar em: {caminho}");

        // Exemplos do que persistentDataPath devolve:
        // Windows: C:/Users/Voce/AppData/LocalLow/Empresa/Jogo
        // macOS:   ~/Library/Application Support/Empresa/Jogo
        // Android: /storage/emulated/0/Android/data/com.empresa.jogo/files
        // iOS:     /var/mobile/Containers/Data/Application/.../Documents
    }
}`,
      },
      {
        lang: "bash",
        code: `# No Unity Hub, em Installs > Add Modules, voce escolhe quais plataformas
# quer empacotar. Cada modulo tem cerca de 1 a 5 GB.

# Plataformas comuns e seus modulos:
# - Windows Build Support (IL2CPP / Mono)
# - macOS Build Support
# - Linux Build Support
# - Android Build Support (inclui SDK, NDK e JDK)
# - iOS Build Support (so funciona macOS para gerar .ipa)
# - WebGL Build Support
# - Universal Windows Platform (Xbox, HoloLens)

# Para consoles (PlayStation, Switch) e necessario cadastro como
# desenvolvedor licenciado junto a Sony, Microsoft ou Nintendo.`,
      },
    ],
    points: [
      "Unity exporta para mais de 20 plataformas: PC, mobile, console, web, VR e AR.",
      "O mesmo projeto C# se adapta a cada alvo via Mono ou IL2CPP.",
      "Cada plataforma tem restricoes proprias (memoria, GPU, sistema de arquivos).",
      "Use Application.persistentDataPath em vez de caminhos fixos para salvar arquivos.",
      "Diretivas #if UNITY_ANDROID permitem codigo especifico por plataforma.",
      "Modulos de build sao instalados pelo Unity Hub, um por plataforma.",
      "Consoles exigem licenca formal junto a fabricante (Sony, Microsoft, Nintendo).",
      "Armadilha: testar so no editor e descobrir bugs so depois do build em mobile.",
      "Armadilha: usar APIs de PC (System.IO direto em paths absolutos) em mobile.",
    ],
    alerts: [
      {
        type: "info",
        content: "Para empacotar para iOS voce precisa obrigatoriamente de um Mac com Xcode instalado. O Unity gera um projeto Xcode que so compila no ecossistema da Apple. Nao tem como gerar .ipa direto do Windows.",
      },
      {
        type: "tip",
        content: "Faca builds para a plataforma alvo (mobile, WebGL, VR) com frequencia desde o comeco do projeto. Bugs especificos de plataforma sao muito mais caros de corrigir quando descobertos perto do lancamento.",
      },
      {
        type: "warning",
        content: "WebGL no Unity NAO suporta threads, alguns recursos de audio e tem limites de memoria do navegador. Se o seu jogo depende muito de multithreading ou de assets pesados, evite WebGL como alvo principal.",
      },
      {
        type: "success",
        content: "Aprender Unity uma vez te permite trabalhar com jogos mobile, VR/AR, simulacao industrial, configuradores automotivos e cinema virtual. Poucas ferramentas no mundo entregam essa amplitude profissional.",
      },
    ],
  },
];
