import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "animator",
    section: "animacao",
    title: "Animator Controller: a máquina de estados visual",
    difficulty: "intermediario",
    subtitle: "Entenda o cérebro que decide qual animação tocar a cada momento.",
    intro: `Imagine que você é o diretor de um pequeno teatro de marionetes. Cada marionete tem várias poses ensaiadas: parada, andando, correndo, pulando, caindo. O seu trabalho não é desenhar essas poses, é decidir QUANDO mudar de uma para outra. Se a marionete está parada e o jogador aperta a tecla para andar, você precisa fazer a transição suave entre essas duas animações. Multiplique isso por dezenas de personagens e dezenas de ações, e fica claro que você precisa de um sistema organizado para tomar essas decisões. No Unity, esse sistema se chama Animator Controller.

O Animator Controller (também conhecido como Mecanim, nome do sistema interno desde o Unity 4) é um arquivo .controller que você cria no projeto e abre numa janela visual chamada Animator Window. Dentro dela você vê caixinhas (estados), setas (transições) e um painel de parâmetros. Cada caixinha representa uma animação que pode estar tocando. Cada seta diz "se essa condição acontecer, mude desta animação para aquela outra". É literalmente uma máquina de estados desenhada com o mouse, sem precisar escrever uma linha de if/else para a maior parte do trabalho.

A grande sacada é que o Animator Controller separa duas responsabilidades que antes ficavam misturadas no script: "qual animação tocar" e "como o personagem se comporta". O seu script de gameplay fica responsável só por dizer "agora a velocidade do personagem é 5" ou "agora o jogador apertou pular". O Animator olha esses parâmetros e decide qual clip de animação tocar e como fazer a transição. Isso vale ouro quando o personagem cresce: adicionar uma nova animação vira um trabalho de 30 segundos no editor, sem mexer em código.

Para usar, você precisa de três coisas: um GameObject com o componente Animator anexado, um arquivo Animator Controller atribuído ao campo Controller desse componente, e um Avatar (no caso de modelos humanoides). Sem isso, nenhuma animação toca. Iniciantes esquecem o Animator Controller no slot e ficam horas tentando descobrir por que o personagem está parado feito estátua. Vamos ver como criar tudo isso no editor e como acessar pelo código.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Script básico que controla o Animator de um personagem.
// Coloque este script no mesmo GameObject que tem o componente Animator.
[RequireComponent(typeof(Animator))]
public class ControlePersonagem : MonoBehaviour
{
    // Referência ao Animator. Vamos buscar no Awake para evitar GetComponent toda hora.
    private Animator animator;

    // Velocidade atual do personagem (vai alimentar o parâmetro do Animator).
    private float velocidadeAtual;

    private void Awake()
    {
        // GetComponent é caro se chamado todo frame. Faça uma vez só, no Awake.
        animator = GetComponent<Animator>();
    }

    private void Update()
    {
        // Lê o input horizontal e vertical (WASD ou setas).
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        velocidadeAtual = new Vector2(h, v).magnitude;

        // Envia a velocidade para o Animator. Lá dentro, um BlendTree
        // vai decidir se toca Idle, Walk ou Run com base nesse valor.
        animator.SetFloat("Velocidade", velocidadeAtual);

        // Pulo: dispara um trigger no Animator quando o jogador aperta espaço.
        if (Input.GetKeyDown(KeyCode.Space))
        {
            animator.SetTrigger("Pular");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Como inspecionar o estado atual do Animator em tempo real.
// Útil para debug quando uma transição parece travada.
public class DebugAnimator : MonoBehaviour
{
    [SerializeField] private Animator animator;

    private void Update()
    {
        // O Animator tem várias 'layers'. A layer 0 é a principal.
        AnimatorStateInfo info = animator.GetCurrentAnimatorStateInfo(0);

        // normalizedTime vai de 0 a 1 conforme a animação avança.
        // Acima de 1 significa que ela já repetiu (loop).
        float progresso = info.normalizedTime % 1f;

        // Você pode comparar o estado atual usando hashes, que são mais rápidos
        // do que comparar nomes em string. O hash é gerado uma vez e reaproveitado.
        int hashCorrer = Animator.StringToHash("Run");
        bool estaCorrendo = info.shortNameHash == hashCorrer;

        Debug.Log($"Progresso: {progresso:F2} | Correndo: {estaCorrendo}");
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Animator também aceita controle por código sem usar parâmetros,
// chamando estados pelo nome diretamente. Útil para casos especiais
// como cinemáticas ou scripts que querem forçar um estado exato.
public class ForcarEstado : MonoBehaviour
{
    [SerializeField] private Animator animator;

    public void TocarMorte()
    {
        // Play recebe o nome do estado (não do clip!) e a layer.
        // O segundo parâmetro -1 significa 'use a layer base padrão'.
        // O terceiro parâmetro 0f reinicia a animação do começo.
        animator.Play("Morte", 0, 0f);
    }

    public void Pausar()
    {
        // speed = 0 congela todas as animações sem mudar de estado.
        animator.speed = 0f;
    }

    public void Retomar()
    {
        animator.speed = 1f;
    }
}`,
      },
    ],
    points: [
      "Animator Controller é uma máquina de estados visual: estados são animações, setas são transições.",
      "O componente Animator no GameObject precisa de um Controller atribuído para qualquer animação tocar.",
      "Scripts de gameplay devem alimentar parâmetros (SetFloat, SetBool, SetTrigger) e nunca chamar animações diretamente, na maioria dos casos.",
      "Cache o resultado de GetComponent<Animator>() no Awake; chamar todo frame custa caro.",
      "Use Animator.StringToHash para comparar nomes de estado: hashes são muito mais rápidos que strings.",
      "animator.Play() força um estado específico, ignorando transições. Bom para cinemáticas, ruim para gameplay normal.",
      "Iniciante comum: esquecer de marcar Apply Root Motion e o personagem não se move como esperado.",
      "Iniciante comum: deixar o slot Controller vazio e gastar 30 minutos achando que o problema é no script.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Abra a janela Animator (Window > Animation > Animator) com o GameObject selecionado. O estado destacado em azul é o que está tocando agora — ótima ferramenta de debug visual.",
      },
      {
        type: "warning",
        content: "Animator com Update Mode em Animate Physics roda no FixedUpdate. Se o seu personagem usa Rigidbody, prefira esse modo para evitar tremidos. Se é só visual, deixe em Normal.",
      },
      {
        type: "info",
        content: "Existe também o Animation Component (legado, sem o C). Não confunda: o legado é para projetos antigos. Para novos projetos, sempre use o Animator (Mecanim).",
      },
    ],
  },
  {
    slug: "animation-clips",
    section: "animacao",
    title: "Animation Clips: os blocos de movimento",
    difficulty: "intermediario",
    subtitle: "Entenda o que são clips, de onde eles vêm e como criar os seus próprios dentro do Unity.",
    intro: `Se o Animator Controller é o diretor, os Animation Clips são os atores ensaiando suas falas. Cada clip é um arquivo que guarda uma sequência de mudanças ao longo do tempo: a posição do braço no quadro 0, a posição no quadro 30, a rotação da cabeça, a cor de um sprite, o valor de um parâmetro de material. Tudo isso é guardado em curvas. Quando o clip toca, o Unity interpola entre os keyframes e aplica os valores nas propriedades do GameObject.

Existem dois caminhos para ter clips no seu projeto. O primeiro é importar de fora: um animador faz a animação no Blender, Maya ou 3ds Max, exporta em FBX, e o Unity lê esse arquivo extraindo os clips automaticamente. Você vê eles como sub-assets dentro do FBX, com um ícone de triângulo de play. Esse é o fluxo padrão para personagens humanoides com esqueleto. O segundo caminho é criar dentro do próprio Unity, usando a janela Animation (Ctrl+6 ou Window > Animation > Animation). Isso é perfeito para animar coisas que não vêm de fora: uma porta abrindo, uma plataforma se mexendo, um botão de UI piscando, a cor de um Light mudando.

Cada clip tem propriedades importantes que você precisa entender. Loop Time faz o clip repetir indefinidamente, ideal para Idle e Walk. Sample Rate define quantos frames por segundo a animação foi gravada (geralmente 30 ou 60). Events são funções marcadas em frames específicos que disparam métodos no script (veremos isso depois). Curves permitem expor valores customizados que outros sistemas podem ler.

Um detalhe que confunde muito iniciante: clips importados de FBX são read-only. Você não pode editar diretamente a curva de um clip vindo do Blender. Se precisar ajustar (cortar, mudar loop, mudar root motion), você duplica o clip (Ctrl+D) e edita a cópia. Outro ponto: clips humanoides usam o Avatar para fazer retargeting — a mesma animação serve para vários personagens diferentes desde que ambos tenham um Avatar humanoide configurado. Isso é poderosíssimo: você compra um pacote de animações na Asset Store e aplica em qualquer personagem do seu jogo.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Lendo informações de um AnimationClip por código.
// Útil para sincronizar efeitos com a duração da animação.
public class InfoClip : MonoBehaviour
{
    [SerializeField] private Animator animator;
    [SerializeField] private string nomeEstado = "Attack";

    private void Start()
    {
        // Pega o controlador atual e procura o clip pelo nome.
        AnimatorClipInfo[] clips = animator.GetCurrentAnimatorClipInfo(0);

        foreach (AnimatorClipInfo info in clips)
        {
            AnimationClip clip = info.clip;
            Debug.Log($"Clip: {clip.name}");
            Debug.Log($"Duração: {clip.length} segundos");
            Debug.Log($"Frame rate: {clip.frameRate} fps");
            Debug.Log($"Loop: {clip.isLooping}");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using System.Collections;

// Esperar o término de uma animação antes de fazer outra coisa.
// Padrão muito comum para combos de ataque ou diálogos.
public class EsperarFimDoAtaque : MonoBehaviour
{
    [SerializeField] private Animator animator;

    public void Atacar()
    {
        animator.SetTrigger("Atacar");
        StartCoroutine(EsperarFimDoClip());
    }

    private IEnumerator EsperarFimDoClip()
    {
        // Espera um frame para o Animator processar o trigger.
        yield return null;

        // Agora pegamos a duração do estado atual.
        AnimatorStateInfo state = animator.GetCurrentAnimatorStateInfo(0);
        float duracao = state.length;

        // Espera o tempo exato da animação.
        yield return new WaitForSeconds(duracao);

        Debug.Log("Ataque terminou! Pode atacar de novo.");
    }
}`,
      },
      {
        lang: "csharp",
        code: `#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;

// Script de editor: cria um AnimationClip simples por código.
// Coloque este arquivo dentro de uma pasta chamada Editor.
public class CriadorDeClip
{
    [MenuItem("Tools/Criar Clip de Pulsar")]
    public static void Criar()
    {
        // Cria um clip novo e configura.
        AnimationClip clip = new AnimationClip();
        clip.frameRate = 30;
        clip.wrapMode = WrapMode.Loop;

        // Cria uma curva animando a escala em Y de 1 a 1.2 e volta.
        AnimationCurve curva = AnimationCurve.EaseInOut(0f, 1f, 1f, 1.2f);
        curva.AddKey(2f, 1f);

        // Aplica a curva à propriedade localScale.y do Transform.
        clip.SetCurve("", typeof(Transform), "localScale.y", curva);

        // Salva no projeto.
        AssetDatabase.CreateAsset(clip, "Assets/PulsarClip.anim");
        AssetDatabase.SaveAssets();

        Debug.Log("Clip criado em Assets/PulsarClip.anim");
    }
}
#endif`,
      },
    ],
    points: [
      "Animation Clip é o arquivo que guarda as curvas de movimento ao longo do tempo.",
      "Você pode importar clips via FBX (workflow padrão para personagens) ou criar dentro do Unity (ideal para objetos de cena).",
      "Clips importados são read-only; duplique (Ctrl+D) antes de tentar editar.",
      "Loop Time precisa estar ligado em animações cíclicas como Idle, Walk e Run.",
      "Sample Rate define a precisão temporal da gravação; geralmente 30 ou 60 fps.",
      "Animações humanoides usam Avatar para retargeting entre personagens diferentes.",
      "Use clip.length para sincronizar lógica com o término da animação.",
      "Iniciante comum: gravar uma animação no objeto errado e ver tudo se mexendo onde não devia.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Ao gravar uma animação na janela Animation, o Unity entra em modo de gravação (botão vermelho). Qualquer mudança que você fizer no Inspector vira keyframe. Saia do modo antes de mexer em outras coisas para não criar keyframes acidentais.",
      },
      {
        type: "tip",
        content: "Animações humanoides do Mixamo são gratuitas e funcionam direto no Unity com o avatar humanoide. Boa fonte para protótipos antes de contratar um animador.",
      },
      {
        type: "info",
        content: "Clips Generic (não humanoides) usam os nomes literais dos ossos e não fazem retargeting. Bom para animais, monstros únicos e personagens estilizados que não cabem no rig humanoide.",
      },
    ],
  },
  {
    slug: "blend-trees",
    section: "animacao",
    title: "Blend Trees: misturando animações suavemente",
    difficulty: "intermediario",
    subtitle: "Como combinar Idle, Walk e Run em uma única transição contínua dirigida por um número.",
    intro: `Imagine que você gravou três animações separadas: o personagem parado, o personagem andando devagar e o personagem correndo rápido. Sem Blend Tree, você teria três estados no Animator com transições entre eles, e o resultado seria sempre um pop visível: o personagem para, troca de animação, começa a andar. Pior ainda: andar e correr são animações cíclicas com cadências diferentes, e cortar no meio fica feio. A solução elegante é misturar os três clips ao mesmo tempo, em proporções que dependem da velocidade real do personagem. Isso é exatamente o que um Blend Tree faz.

Um Blend Tree é um tipo especial de estado dentro do Animator. Em vez de tocar um clip só, ele toca vários clips ao mesmo tempo e mistura seus pesos com base em um ou mais parâmetros. Quando a velocidade está em 0, o peso do Idle é 100% e os outros estão em zero. Quando passa para 0.5, o Walk começa a ganhar peso e o Idle perde. Em 1.0, o Walk é 100%. E assim por diante. O resultado é uma transição contínua, sem corte, que se parece com como o corpo humano realmente acelera.

Existem variações: Blend Tree 1D usa um parâmetro só (geralmente velocidade) e é o mais comum para locomoção. Blend Tree 2D usa dois parâmetros, perfeito para movimento livre em todas as direções (X = strafe esquerda/direita, Y = frente/trás). Existem três modos 2D: Simple Directional, Freeform Directional e Freeform Cartesian. Pra começar, use 2D Freeform Cartesian, que é o mais previsível para grids cartesianos típicos de jogos top-down e third person.

A regra de ouro do Blend Tree é que todos os clips dentro dele precisam ter o mesmo tipo de movimento (todos animações de loop de locomoção, por exemplo). Não tente misturar Idle com Attack: o resultado vai ser um Frankenstein. Para mudanças bruscas (atacar, pular, levar dano), use estados separados com transições. Blend Tree é só para variações contínuas de uma mesma ação.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Controller de movimento que alimenta um Blend Tree 1D.
// O Blend Tree dentro do Animator deve ter parâmetro 'Velocidade'.
public class MovimentoComBlend1D : MonoBehaviour
{
    [SerializeField] private Animator animator;
    [SerializeField] private float velocidadeMax = 5f;
    [SerializeField] private float aceleracao = 8f;

    private float velocidadeSuave;

    private void Update()
    {
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");
        float alvo = new Vector2(h, v).magnitude;

        // Suaviza a transição da velocidade para evitar pulos no Blend Tree.
        // Sem isso, soltar o W de uma vez faz o personagem parar instantaneamente.
        velocidadeSuave = Mathf.MoveTowards(velocidadeSuave, alvo, aceleracao * Time.deltaTime);

        // Envia a velocidade normalizada (0 a 1) para o Blend Tree.
        animator.SetFloat("Velocidade", velocidadeSuave);

        // Move o transform de fato.
        Vector3 dir = new Vector3(h, 0, v).normalized;
        transform.position += dir * velocidadeSuave * velocidadeMax * Time.deltaTime;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Movimento direcional com Blend Tree 2D Freeform Cartesian.
// O Blend Tree precisa ter dois parâmetros: 'VelX' e 'VelZ'.
// Posicione os clips no grid: Idle no centro (0,0),
// Walk Forward em (0,1), Strafe Left em (-1,0), etc.
public class MovimentoComBlend2D : MonoBehaviour
{
    [SerializeField] private Animator animator;
    [SerializeField] private float suavizacao = 10f;

    private Vector2 velocidadeAtual;

    private void Update()
    {
        Vector2 inputAlvo = new Vector2(
            Input.GetAxisRaw("Horizontal"),
            Input.GetAxisRaw("Vertical")
        );

        // Lerp suave para o input alvo. Sem isso, o blend fica robótico.
        velocidadeAtual = Vector2.Lerp(
            velocidadeAtual,
            inputAlvo,
            suavizacao * Time.deltaTime
        );

        // O parâmetro Damp do Animator faz isso internamente também,
        // mas controlar manualmente dá mais previsibilidade.
        animator.SetFloat("VelX", velocidadeAtual.x);
        animator.SetFloat("VelZ", velocidadeAtual.y);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// SetFloat tem overload com damping interno. Útil quando você não quer
// gerenciar a suavização manualmente.
public class MovimentoComDamping : MonoBehaviour
{
    [SerializeField] private Animator animator;

    // Tempo (em segundos) que o valor leva para atingir o alvo.
    [SerializeField] private float dampTime = 0.15f;

    private void Update()
    {
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");
        float vel = new Vector2(h, v).magnitude;

        // Esta versão de SetFloat aplica suavização automaticamente.
        // Argumentos: nome, valor alvo, dampTime, deltaTime.
        animator.SetFloat("Velocidade", vel, dampTime, Time.deltaTime);
    }
}`,
      },
    ],
    points: [
      "Blend Tree mistura múltiplos clips simultaneamente, em vez de tocar um só por vez.",
      "Use 1D para locomoção linear (Idle/Walk/Run) e 2D para movimento direcional completo.",
      "Todos os clips dentro do Blend Tree devem ter o mesmo tipo de ação (não misture loop com one-shot).",
      "Suavize o parâmetro de entrada (Mathf.MoveTowards ou SetFloat com damping) para evitar pops.",
      "2D Freeform Cartesian é o modo mais previsível para grids X/Y comuns.",
      "Compute Thresholds (no Inspector do Blend Tree) ajusta automaticamente os limiares pelos clips.",
      "Iniciante comum: posicionar todos os clips no centro do grid 2D e o blend não funcionar.",
      "Iniciante comum: animações com velocidades de pé diferentes geram footskate (pés deslizando).",
    ],
    alerts: [
      {
        type: "tip",
        content: "Use Foot IK no Animator e ative Match Speed nos clips do Blend Tree. Isso evita que os pés deslizem quando o blend mistura animações com cadências diferentes.",
      },
      {
        type: "warning",
        content: "Blend Tree 2D consome mais CPU que 1D porque amostra vários clips por frame. Em mobile com muitos personagens, prefira 1D quando der.",
      },
      {
        type: "info",
        content: "Você pode aninhar Blend Trees: um Blend Tree pode ter outro Blend Tree como filho. Útil para 'Walk/Run' direcional onde a velocidade muda o conjunto inteiro de clips.",
      },
    ],
  },
  {
    slug: "parametros-animator",
    section: "animacao",
    title: "Parâmetros do Animator: a ponte entre código e animação",
    difficulty: "intermediario",
    subtitle: "Float, Int, Bool e Trigger — quando usar cada um e por quê.",
    intro: `O Animator Controller é uma máquina de estados, mas alguém precisa dizer pra ela quando mudar de estado. Esse alguém são os parâmetros. Pense neles como variáveis públicas que ficam no Animator e que tanto seu código quanto as transições podem ler. Quando você define no painel Parameters da janela Animator, você está criando um contrato: o seu script promete escrever nesse parâmetro, e as transições prometem reagir ao valor dele.

Existem quatro tipos, cada um com um propósito específico, e usar o tipo errado é uma das fontes mais comuns de bugs em animação. Float é para valores contínuos, como velocidade, intensidade, ângulo. É o tipo que alimenta Blend Trees e que aceita comparações como Greater Than e Less Than nas transições. Int é para valores discretos, como o índice de um combo de ataque (1, 2, 3) ou o tipo de arma equipada. Bool é para estados ligado/desligado que precisam ser mantidos: agachado, mirando, no chão. Você liga, ele fica ligado até alguém desligar. Trigger é o tipo mais especial: ele é um Bool que se desliga sozinho assim que uma transição o consome. Ideal para ações instantâneas como pular, atacar, rolar.

A diferença entre Bool e Trigger é onde mais gente tropeça. Se você usa Bool para pular (animator.SetBool("Pular", true)), o personagem pula uma vez, mas a transição de saída não vai disparar até alguém setar de volta para false. Se você esquece, ele fica preso no estado de pulo eternamente. Já o Trigger é "fire and forget": animator.SetTrigger("Pular") e pronto, o Animator se vira. Por outro lado, se você usar Trigger para algo que precisa ser mantido (como agachar), o personagem agacha e levanta no mesmo frame, porque o trigger se consumiu na primeira transição.

Outra dica de produção: nunca compare strings em loops. Cada chamada animator.SetFloat("Velocidade", v) faz uma busca por nome internamente. Se você chama todo Update, isso vira gargalo. Use Animator.StringToHash uma vez e guarde o int. Aí passa o hash em vez da string. Em jogos com 100 inimigos, essa otimização faz diferença mensurável no profiler.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Demonstração dos quatro tipos de parâmetros do Animator.
public class TodosOsParametros : MonoBehaviour
{
    [SerializeField] private Animator animator;

    // Hashes pre-calculados para performance.
    private static readonly int hashVelocidade = Animator.StringToHash("Velocidade");
    private static readonly int hashComboIndex = Animator.StringToHash("ComboIndex");
    private static readonly int hashAgachado = Animator.StringToHash("Agachado");
    private static readonly int hashAtacar = Animator.StringToHash("Atacar");

    private void Update()
    {
        // FLOAT: valor contínuo, ideal para Blend Trees e comparações > <.
        float vel = new Vector2(
            Input.GetAxis("Horizontal"),
            Input.GetAxis("Vertical")
        ).magnitude;
        animator.SetFloat(hashVelocidade, vel);

        // INT: valor discreto, bom para máquinas de combo ou estados numerados.
        if (Input.GetMouseButtonDown(0))
        {
            int proximoCombo = animator.GetInteger(hashComboIndex) + 1;
            if (proximoCombo > 3) proximoCombo = 1;
            animator.SetInteger(hashComboIndex, proximoCombo);
        }

        // BOOL: estado mantido, fica ligado até você desligar.
        // Perfeito para 'agachado', 'mirando', 'no chão'.
        animator.SetBool(hashAgachado, Input.GetKey(KeyCode.LeftControl));

        // TRIGGER: ação instantânea, se consome sozinho.
        // Use para 'pular', 'atacar', 'morrer'.
        if (Input.GetKeyDown(KeyCode.Mouse1))
        {
            animator.SetTrigger(hashAtacar);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Como resetar um Trigger preso. Acontece quando o Animator
// está numa transição e o trigger fica enfileirado para o próximo estado,
// causando um ataque fantasma que dispara sem o jogador apertar.
public class GerenciadorDeTrigger : MonoBehaviour
{
    [SerializeField] private Animator animator;

    public void TocarAtaqueLimpo()
    {
        // Reseta antes de setar para garantir que não há trigger pendente.
        animator.ResetTrigger("Atacar");
        animator.SetTrigger("Atacar");
    }

    public void CancelarTodosOsTriggers()
    {
        // Útil quando o personagem morre ou entra em cutscene.
        animator.ResetTrigger("Atacar");
        animator.ResetTrigger("Pular");
        animator.ResetTrigger("Rolar");
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Verificando se um parâmetro existe antes de setar.
// Importante quando você troca o RuntimeAnimatorController dinamicamente
// (por exemplo, mudando de arma e o controller novo não tem todos os parâmetros).
public class ParametroSeguro : MonoBehaviour
{
    [SerializeField] private Animator animator;

    public void SetarVelocidadeSegura(float valor)
    {
        if (TemParametro("Velocidade", AnimatorControllerParameterType.Float))
        {
            animator.SetFloat("Velocidade", valor);
        }
        else
        {
            Debug.LogWarning("Animator atual não tem parâmetro Velocidade.");
        }
    }

    private bool TemParametro(string nome, AnimatorControllerParameterType tipo)
    {
        // Percorre os parâmetros declarados no Controller.
        foreach (var p in animator.parameters)
        {
            if (p.name == nome && p.type == tipo) return true;
        }
        return false;
    }
}`,
      },
    ],
    points: [
      "Float é para valores contínuos: alimenta Blend Trees e comparações > <.",
      "Int é para valores discretos: índice de combo, tipo de arma, fase do boss.",
      "Bool é para estados mantidos: agachado, mirando, no chão. Você liga e desliga manualmente.",
      "Trigger é para ações instantâneas: pular, atacar, rolar. Auto-consome após disparar transição.",
      "Cache os hashes com Animator.StringToHash; chamar por string em Update vira gargalo de CPU.",
      "ResetTrigger antes de SetTrigger evita o bug do 'ataque fantasma' quando há trigger pendente.",
      "Iniciante comum: usar Bool para pular e o personagem ficar preso no ar.",
      "Iniciante comum: usar Trigger para agachar e o personagem levantar instantaneamente.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Triggers podem ficar enfileirados se você os seta durante uma transição em andamento. Use animator.ResetTrigger antes do SetTrigger em ações que não toleram disparos duplos.",
      },
      {
        type: "tip",
        content: "No painel Parameters da janela Animator, clique no ícone de olho para mostrar/esconder parâmetros. Em controllers grandes (50+ parâmetros), isso ajuda a focar no que está debugando.",
      },
      {
        type: "info",
        content: "Animator parameters são serializados por nome. Renomear um parâmetro quebra todas as transições que o usavam. Use Find References (botão direito no parâmetro) antes de renomear.",
      },
    ],
  },
  {
    slug: "transicoes-animator",
    section: "animacao",
    title: "Transições: como mudar de estado sem cortes feios",
    difficulty: "intermediario",
    subtitle: "Conditions, Has Exit Time, Transition Duration e Interruption Source explicados de verdade.",
    intro: `As setas que ligam um estado ao outro no Animator são as transições. Cada transição é um pequeno contrato: 'quando esta condição for verdadeira, mude deste estado para aquele, durante este tempo, com este tipo de blend'. Parece simples, mas cada uma das opções no Inspector da transição esconde um comportamento que pode salvar ou destruir a sensação do seu jogo.

A primeira opção que você precisa entender é Has Exit Time. Quando ligada, o Unity vai esperar o estado atual chegar a uma porcentagem específica de seu tempo de execução antes de aceitar a transição. Por exemplo, com Has Exit Time = 0.9, a transição só dispara depois que 90% da animação atual já tocou. Isso é ideal para combos de ataque, onde você quer que o golpe termine antes de partir para o próximo. Quando desligada, a transição pode disparar a qualquer momento que as conditions forem verdade. É o que você quer para reações imediatas como pular ou levar dano.

A segunda é Transition Duration. Esse é o tempo, geralmente em segundos, durante o qual os dois estados tocam ao mesmo tempo enquanto fazem o blend. Em locomoção, valores entre 0.1 e 0.25 dão uma transição suave sem parecer lenta. Em ações cortadas como tomar dano ou morrer, use 0 ou 0.05 para parecer instantâneo. Iniciantes costumam deixar 0.25 padrão em tudo, e ataques ficam parecendo manteiga derretida.

Conditions é a lista de regras que precisam ser TODAS verdade ao mesmo tempo (AND lógico). Você pode usar Greater Than, Less Than, Equals, NotEquals para Float/Int, e True/False para Bool, e simplesmente o nome para Trigger. Se você precisa de OR (esta condição OU aquela), crie duas transições paralelas com conditions diferentes. E o último ponto crítico: Interruption Source. Por padrão é None, o que significa que uma transição em andamento bloqueia outras. Se você quer que o jogador possa pular cancelando uma animação de andar, configure como Current State ou Next State. Sem isso, o jogo parece travado e mal responde aos comandos.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Padrão de combo de ataque com 3 estados encadeados.
// Cada transição usa Has Exit Time alto para o golpe completar,
// e um trigger 'ProximoGolpe' para encadear se o jogador apertou de novo.
public class SistemaDeCombo : MonoBehaviour
{
    [SerializeField] private Animator animator;
    [SerializeField] private float janelaCombo = 0.5f;

    private float tempoUltimoGolpe;

    private void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            // Se passou da janela, reinicia o combo.
            if (Time.time - tempoUltimoGolpe > janelaCombo)
            {
                animator.ResetTrigger("ProximoGolpe");
                animator.SetTrigger("Atacar");
            }
            else
            {
                // Dentro da janela: encadeia.
                animator.SetTrigger("ProximoGolpe");
            }

            tempoUltimoGolpe = Time.time;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Detecta quando uma transição está em andamento.
// Útil para travar inputs durante animações que não podem ser canceladas.
public class DetectorDeTransicao : MonoBehaviour
{
    [SerializeField] private Animator animator;

    public bool EstaEmTransicao()
    {
        // IsInTransition checa se a layer está blendando entre estados.
        return animator.IsInTransition(0);
    }

    public void TentarAtacar()
    {
        // Bloqueia novo ataque se ainda estamos blendando.
        if (EstaEmTransicao())
        {
            Debug.Log("Aguarde, transição em andamento.");
            return;
        }

        animator.SetTrigger("Atacar");
    }

    private void Update()
    {
        if (animator.IsInTransition(0))
        {
            AnimatorTransitionInfo t = animator.GetAnimatorTransitionInfo(0);
            // normalizedTime vai de 0 a 1 ao longo da duração da transição.
            Debug.Log($"Blendando: {t.normalizedTime * 100f:F0}%");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Crossfade manual: faz uma transição direto, sem precisar configurar
// no editor. Útil para casos especiais como cinemáticas ou mudanças
// dinâmicas de moveset.
public class CrossfadePorCodigo : MonoBehaviour
{
    [SerializeField] private Animator animator;

    public void TocarMorteSuave()
    {
        // CrossFade(estado, duração da transição em segundos normalizados,
        // layer, tempo normalizado de início no estado novo).
        animator.CrossFade("Morte", 0.25f, 0, 0f);
    }

    public void TocarMorteEmTempoFixo()
    {
        // CrossFadeInFixedTime usa segundos absolutos em vez de normalizados.
        // Mais previsível quando a duração do clip varia.
        animator.CrossFadeInFixedTime("Morte", 0.5f, 0, 0f);
    }
}`,
      },
    ],
    points: [
      "Has Exit Time ON: espera a animação terminar antes de transicionar (use em combos).",
      "Has Exit Time OFF: transição imediata quando conditions forem verdade (use em reações).",
      "Transition Duration controla o tempo de blend; 0.1-0.25 para locomoção, 0 para cortes secos.",
      "Conditions são AND. Para OR, crie transições paralelas com conditions diferentes.",
      "Interruption Source = None bloqueia novas transições durante o blend; mude para Current State para gameplay responsivo.",
      "animator.IsInTransition(0) detecta se a layer está blendando agora.",
      "CrossFade e CrossFadeInFixedTime forçam transições por código, ignorando o grafo.",
      "Iniciante comum: deixar Transition Duration alto e o jogo ficar com sensação molenga.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Transições em cascata (várias seguidas em pouco tempo) podem parecer travar o personagem porque o Animator espera cada blend terminar. Configure Interruption Source = Current State para permitir cancelamentos.",
      },
      {
        type: "tip",
        content: "Use 'Solo' e 'Mute' nas transições durante o debug. Solo isola uma transição para você testar; Mute desliga ela temporariamente. Ambos os botões ficam no Inspector da seta.",
      },
      {
        type: "info",
        content: "AnyState transitions disparam de qualquer estado. Ótimas para reações universais (morte, dano grande, cutscene), mas cuidado: se a condition fica verdade por mais de um frame, a transição re-dispara em loop.",
      },
    ],
  },
  {
    slug: "timeline",
    section: "animacao",
    title: "Timeline: cinemáticas e sequências de eventos",
    difficulty: "avancado",
    subtitle: "Como orquestrar câmera, animação, áudio e gameplay em uma linha do tempo visual.",
    intro: `Animator Controller é ótimo para reagir a inputs do jogador em tempo real, mas é péssimo para orquestrar uma cena cinematográfica complexa. Se você quer que o personagem caminhe até a porta, abra ela, a câmera faça um close, um diálogo dispare, uma luz acenda, uma música toque, tudo coreografado segundo a segundo, você não quer fazer isso com triggers e estados. Você quer um editor de linha do tempo, igual aos que existem em programas de vídeo. É exatamente isso que o Unity Timeline oferece.

Timeline é um pacote oficial (instalável via Package Manager, geralmente já incluso) que adiciona um asset chamado Timeline Asset e uma janela de edição. Você arrasta GameObjects da cena para faixas (tracks) na linha do tempo. Cada faixa controla um aspecto: Animation Track move um personagem, Audio Track toca um som, Cinemachine Track controla câmeras virtuais, Activation Track liga e desliga objetos, Signal Track dispara eventos para scripts. Você arrasta blocos (clips) dentro das faixas e ajusta seus tempos arrastando com o mouse. O resultado é uma cena montada como um vídeo, com playhead e tudo.

A peça que conecta a Timeline ao mundo é o componente Playable Director. Ele fica num GameObject da cena e referencia o Timeline Asset. Quando você dá Play, o Director executa a timeline. Você pode iniciar e pausar via código, fazer ela tocar uma vez ou em loop, e até trocar a timeline sendo executada dinamicamente. É comum ter um Director por cinemática, com gatilhos espalhados pela cena que disparam uma ou outra.

Quando NÃO usar Timeline: para sistemas de combate em tempo real, locomoção, sistemas reativos. Timeline é caro de iniciar (alguns ms de overhead) e foi feito para sequências planejadas, não para responder a input do jogador. A regra geral é: se a cena tem início, meio e fim definidos pelo designer, use Timeline. Se a cena reage continuamente ao jogador, use Animator com talvez algumas Signals ou ScriptableObjects coordenando.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.Playables;

// Controlador básico de uma Timeline.
// Coloque no GameObject que tem o componente Playable Director.
[RequireComponent(typeof(PlayableDirector))]
public class GerenciadorCinematica : MonoBehaviour
{
    private PlayableDirector director;

    private void Awake()
    {
        director = GetComponent<PlayableDirector>();

        // Se inscreve no evento que dispara quando a timeline termina.
        director.stopped += AoTerminarCinematica;
    }

    public void TocarCinematica()
    {
        // Reinicia do começo e toca.
        director.time = 0;
        director.Play();
    }

    public void Pausar()
    {
        director.Pause();
    }

    public void Pular()
    {
        // Define o tempo final para pular para o fim.
        director.time = director.duration;
        director.Evaluate();
        director.Stop();
    }

    private void AoTerminarCinematica(PlayableDirector d)
    {
        Debug.Log("Cinemática terminou. Devolvendo controle ao jogador.");
        // Reativa controles do jogador, fade in, etc.
    }

    private void OnDestroy()
    {
        if (director != null) director.stopped -= AoTerminarCinematica;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Receptor de Signal Track. Cada SignalEmitter na timeline pode disparar
// um SignalAsset, que aciona métodos neste componente via SignalReceiver.
public class GatilhosDaCinematica : MonoBehaviour
{
    [SerializeField] private GameObject explosaoPrefab;
    [SerializeField] private AudioSource musica;

    // Métodos públicos que o SignalReceiver pode chamar.
    public void DispararExplosao()
    {
        Instantiate(explosaoPrefab, transform.position, Quaternion.identity);
        Debug.Log("BOOM!");
    }

    public void IniciarMusica()
    {
        musica.Play();
    }

    public void TremerCamera(float intensidade)
    {
        // Use uma referência ao seu Cinemachine Impulse Source aqui, por exemplo.
        Debug.Log($"Tremor de câmera: {intensidade}");
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.Playables;
using UnityEngine.Timeline;

// Trocar uma faixa de áudio dinamicamente.
// Útil quando a mesma cinemática precisa de versões em idiomas diferentes.
public class TrocadorDeAudioTimeline : MonoBehaviour
{
    [SerializeField] private PlayableDirector director;
    [SerializeField] private TimelineAsset timeline;
    [SerializeField] private AudioClip vozPortugues;
    [SerializeField] private AudioClip vozIngles;

    public void TocarComIdioma(bool ingles)
    {
        AudioClip vozEscolhida = ingles ? vozIngles : vozPortugues;

        // Percorre as faixas procurando por uma com nome 'VozNarrador'.
        foreach (var track in timeline.GetOutputTracks())
        {
            if (track.name == "VozNarrador" && track is AudioTrack audioTrack)
            {
                foreach (var clip in audioTrack.GetClips())
                {
                    if (clip.asset is AudioPlayableAsset audioAsset)
                    {
                        audioAsset.clip = vozEscolhida;
                    }
                }
            }
        }

        // Recompila as bindings da timeline.
        director.RebuildGraph();
        director.Play();
    }
}`,
      },
    ],
    points: [
      "Timeline orquestra animação, áudio, câmera e eventos numa linha do tempo visual.",
      "PlayableDirector é o componente que executa um Timeline Asset numa cena.",
      "Use Animation Track para movimento, Audio Track para som, Cinemachine Track para câmera, Signal Track para eventos.",
      "Signal Receiver permite disparar métodos C# em pontos exatos da timeline.",
      "Não use Timeline para gameplay reativo; ele foi feito para sequências planejadas.",
      "director.stopped é o evento mais útil: dispara quando a timeline termina, ideal para devolver controle ao jogador.",
      "Bindings (referências de objetos da cena) são salvas no PlayableDirector, não no Timeline Asset, permitindo reusar a timeline em cenas diferentes.",
      "Iniciante comum: editar a timeline com a cena fechada e perder os bindings dos objetos.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Combine Timeline com Cinemachine Virtual Cameras para obter cinemáticas profissionais. Cada CM Track corresponde a uma câmera, e os blends são suaves automaticamente.",
      },
      {
        type: "warning",
        content: "Timeline em modo Game Object Recording grava no objeto da cena, não no clip. Saia do modo de gravação antes de fechar a janela ou pode perder mudanças.",
      },
      {
        type: "info",
        content: "Para previews em scripts de editor, use TimelineEditor.refreshReason. Em runtime, prefira director.Evaluate() depois de mudar director.time para forçar o estado visual.",
      },
    ],
  },
  {
    slug: "root-motion",
    section: "animacao",
    title: "Root Motion: deixe a animação dirigir o movimento",
    difficulty: "avancado",
    subtitle: "Quando o personagem se move pela animação em vez do script, e por que isso muda tudo.",
    intro: `Existem dois jeitos fundamentais de mover um personagem no Unity. O primeiro é o que a maioria dos iniciantes aprende: o script soma uma velocidade à posição do transform a cada frame, e a animação só faz o personagem 'fingir' que está andando, com os pés se mexendo no lugar. O segundo é deixar a própria animação carregar a posição: o animador, lá no Blender ou Maya, animou o esqueleto inteiro avançando de fato, e o Unity replica esse deslocamento no transform. Esse segundo método se chama Root Motion.

Por que isso importa? Porque Root Motion garante que os pés do personagem nunca deslizam. Se o animador desenhou um passo de 80cm a cada segundo, o personagem se move exatamente 80cm por segundo, sincronizado com a pisada. O resultado é uma sensação de peso e realismo que script-driven nunca consegue. É por isso que jogos como Dark Souls, God of War e Assassin's Creed usam Root Motion para a maior parte do gameplay. Inversamente, jogos arcade rápidos como plataformas 2D ou shooters em primeira pessoa preferem script-driven, porque controle responsivo importa mais que peso visual.

Para usar Root Motion, você precisa de três coisas. Primeiro, marcar Apply Root Motion no componente Animator. Segundo, garantir que os clips importados têm Root Motion configurado corretamente no painel Animation do FBX (Bake Into Pose vs Root Transform Position). Terceiro, no caso de personagem com Rigidbody ou CharacterController, sobrescrever o método OnAnimatorMove no script para aplicar manualmente o deltaPosition no controller, em vez de deixar o Animator escrever direto no transform (que ignora colisão).

Onde Root Motion atrapalha? Em movimento livre baseado em input contínuo. Se o jogador segura W, ele espera que o personagem acelere até a velocidade máxima e ande indefinidamente. Mas se a animação 'Run' tem 30 frames e desloca 5 metros, o Animator vai loopar 5 metros a cada loop, sem se importar com o input. A solução costuma ser híbrida: Root Motion para ações específicas (atacar, rolar, subir escada), script-driven para locomoção geral. Esse é o padrão da maioria dos AAA modernos.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Root Motion puro: o Animator move o transform diretamente.
// Útil para personagens com Animator + Animator marcado com Apply Root Motion,
// sem Rigidbody nem CharacterController.
public class PersonagemRootMotionPuro : MonoBehaviour
{
    [SerializeField] private Animator animator;

    private void Update()
    {
        // Apenas envia parâmetros. O Animator faz o resto.
        float vel = Input.GetAxis("Vertical");
        animator.SetFloat("Velocidade", Mathf.Abs(vel));

        // Rotaciona o personagem para olhar onde está indo.
        float h = Input.GetAxis("Horizontal");
        transform.Rotate(0, h * 180f * Time.deltaTime, 0);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Root Motion combinado com CharacterController.
// O Animator calcula o deltaPosition, e nós aplicamos manualmente
// para que a colisão funcione.
[RequireComponent(typeof(CharacterController), typeof(Animator))]
public class PersonagemRootMotionComCC : MonoBehaviour
{
    private CharacterController cc;
    private Animator animator;

    private Vector3 velocidadeY;

    private void Awake()
    {
        cc = GetComponent<CharacterController>();
        animator = GetComponent<Animator>();
    }

    private void Update()
    {
        float v = Input.GetAxis("Vertical");
        animator.SetFloat("Velocidade", Mathf.Abs(v));

        // Gravidade aplicada manualmente (Root Motion não cuida de Y).
        if (cc.isGrounded) velocidadeY.y = -2f;
        else velocidadeY.y += Physics.gravity.y * Time.deltaTime;
    }

    // Método especial: chamado pelo Animator todo frame quando há Root Motion.
    private void OnAnimatorMove()
    {
        // Pega o deslocamento que o Animator quer aplicar.
        Vector3 movimento = animator.deltaPosition;

        // Aplica gravidade junto.
        movimento += velocidadeY * Time.deltaTime;

        // Move pelo CharacterController (respeita colisão).
        cc.Move(movimento);

        // Aplica também a rotação que veio da animação.
        transform.rotation *= animator.deltaRotation;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Root Motion seletivo: usa para ações específicas (ataque, rolar)
// e desliga durante locomoção normal.
public class RootMotionSeletivo : MonoBehaviour
{
    [SerializeField] private Animator animator;

    private void Update()
    {
        // Pega o estado atual.
        AnimatorStateInfo info = animator.GetCurrentAnimatorStateInfo(0);

        // Liga Root Motion só durante ataques e rolamentos.
        bool ehAtaqueOuRolamento =
            info.IsTag("Attack") || info.IsTag("Dodge");

        animator.applyRootMotion = ehAtaqueOuRolamento;
    }
}`,
      },
    ],
    points: [
      "Root Motion deixa a animação dirigir o transform, garantindo que os pés não deslizem.",
      "Marque Apply Root Motion no componente Animator para ativar.",
      "Use Root Motion em jogos com peso e realismo (Souls-like, hack-n-slash).",
      "Use script-driven em jogos arcade rápidos (plataforma, shooter, top-down).",
      "Sobrescreva OnAnimatorMove para combinar Root Motion com CharacterController ou Rigidbody.",
      "applyRootMotion pode ser ligado/desligado em runtime para o padrão 'híbrido'.",
      "animator.deltaPosition e animator.deltaRotation expõem o que o Animator quer aplicar no frame.",
      "Iniciante comum: marcar Root Motion sem configurar Bake Into Pose corretamente, e o personagem voa.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Root Motion ignora gravidade. Se seu personagem fica flutuando, você precisa aplicar gravidade manualmente em OnAnimatorMove ou usar 'Bake Into Pose Y' nos clips.",
      },
      {
        type: "tip",
        content: "Use Tags nos estados do Animator (campo Tag no Inspector do estado) e teste com info.IsTag para ligar/desligar Root Motion por categoria, sem listar estados um por um.",
      },
      {
        type: "info",
        content: "Animações do Mixamo vêm com Root Motion no quadril, não no root. Use o opção 'In Place' do Mixamo para baixar versões adequadas, ou ajuste Root Transform Position no Unity.",
      },
    ],
  },
  {
    slug: "animation-events",
    section: "animacao",
    title: "Animation Events: chamando código nos keyframes certos",
    difficulty: "intermediario",
    subtitle: "Como sincronizar tiros, sons e dano no exato frame do golpe.",
    intro: `Imagine um ataque com espada que dura 1 segundo. O dano não pode ser aplicado quando o jogador clica (cedo demais, antes da espada se mover) nem quando a animação termina (tarde demais, depois que o golpe já passou). O dano precisa ser aplicado no frame exato em que a espada cruza pela frente do personagem, talvez no quadro 18 de 30 da animação. Como o seu script descobre quando isso acontece sem fazer um Coroutine com WaitForSeconds(0.6f) que vai dessincronizar se você ajustar a animação? Resposta: Animation Events.

Animation Event é um marcador que você posiciona em um frame específico de um Animation Clip, dentro da janela Animation. Quando o playhead cruzar aquele marcador, o Unity automaticamente chama um método público em qualquer script no GameObject (ou em um filho dele, com o Animator). É a ponte mais elegante entre a linguagem do animador (frames, tempo) e a linguagem do programador (callbacks). E como o evento mora dentro do clip, se o animador refinar a animação e mudar o frame do golpe, o evento se move junto, sem precisar tocar em nenhum código.

A forma de criar é simples: abra a janela Animation com o GameObject selecionado, escolha o clip, posicione a barrinha do tempo no frame desejado e clique no botão de adicionar evento (parecido com um marcador). O Inspector mostra um campo onde você digita o nome de um método público qualquer que exista em algum script do GameObject. Você pode passar um parâmetro: float, int, string, AnimationCurve ou um Object. Restrição importante: só um parâmetro por evento. Se precisar de mais, use uma struct/classe simples e passe via referência de Object.

Onde Animation Event ajuda muito: aplicar dano no meio do golpe, soltar projétil quando a mão atinge a posição certa, tocar som de pisada quando o pé encosta no chão, ativar partículas em frames precisos, mudar de fase de um boss em momentos coreografados. Onde tropeçam: esquecer que Animation Events de clips importados de FBX são read-only (precisa duplicar) e nomear métodos errados, gerando warnings 'method not found' que aparecem no Console mas não quebram nada (e por isso passam despercebidos).`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Script com métodos chamados por Animation Events.
// Coloque no mesmo GameObject que tem o Animator.
public class GerenciadorDeAtaque : MonoBehaviour
{
    [SerializeField] private Collider colliderEspada;
    [SerializeField] private AudioSource audioFonte;
    [SerializeField] private AudioClip somDeImpacto;
    [SerializeField] private GameObject prefabFaisca;

    // Método chamado pelo Animation Event no frame em que a espada começa a cortar.
    public void AtivarColliderEspada()
    {
        colliderEspada.enabled = true;
    }

    // Chamado no frame em que o golpe termina.
    public void DesativarColliderEspada()
    {
        colliderEspada.enabled = false;
    }

    // Chamado no frame de impacto (parâmetro: intensidade do som).
    public void TocarSomImpacto(float volume)
    {
        audioFonte.PlayOneShot(somDeImpacto, volume);
    }

    // Chamado no frame em que um efeito visual deve aparecer.
    public void MostrarFaisca()
    {
        Vector3 pos = colliderEspada.transform.position;
        Instantiate(prefabFaisca, pos, Quaternion.identity);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Eventos de pisada para som de passos.
// O animador coloca um AnimationEvent em cada frame em que um pé toca o chão,
// chamando 'TocarPisada' com um int indicando qual pé (0 = esquerdo, 1 = direito).
public class SomDePassos : MonoBehaviour
{
    [SerializeField] private AudioSource audioFonte;
    [SerializeField] private AudioClip[] sonsConcreto;
    [SerializeField] private AudioClip[] sonsGrama;

    private bool emGrama;

    public void TocarPisada(int peEsquerdo)
    {
        // Escolhe o conjunto de sons baseado na superfície atual.
        AudioClip[] sons = emGrama ? sonsGrama : sonsConcreto;
        if (sons.Length == 0) return;

        // Sorteia para variar e não ficar repetitivo.
        AudioClip clip = sons[Random.Range(0, sons.Length)];

        // Pequena variação de pitch para dar vida.
        audioFonte.pitch = Random.Range(0.95f, 1.05f);
        audioFonte.PlayOneShot(clip);
    }
}`,
      },
      {
        lang: "csharp",
        code: `#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;

// Adiciona um Animation Event por código (somente editor).
// Útil quando você precisa popular dezenas de clips automaticamente.
public class AdicionadorDeEventos
{
    [MenuItem("Tools/Adicionar Evento de Pisada no Frame 15")]
    public static void Adicionar()
    {
        AnimationClip clip = Selection.activeObject as AnimationClip;
        if (clip == null)
        {
            Debug.LogError("Selecione um AnimationClip antes.");
            return;
        }

        AnimationEvent evento = new AnimationEvent
        {
            time = 15f / clip.frameRate,
            functionName = "TocarPisada",
            intParameter = 0,
        };

        // Pega os eventos atuais e adiciona o novo.
        AnimationEvent[] atuais = AnimationUtility.GetAnimationEvents(clip);
        var lista = new System.Collections.Generic.List<AnimationEvent>(atuais);
        lista.Add(evento);

        AnimationUtility.SetAnimationEvents(clip, lista.ToArray());
        Debug.Log($"Evento adicionado em {clip.name}");
    }
}
#endif`,
      },
    ],
    points: [
      "Animation Event chama um método C# em frame específico de um clip.",
      "O método precisa ser público e estar num script do GameObject que tem o Animator.",
      "Permite passar um parâmetro: float, int, string, AnimationCurve ou Object.",
      "Eventos em clips de FBX são read-only; duplique o clip para editar.",
      "Use para dano no meio do golpe, som de pisada, soltar projétil, ativar partícula.",
      "Se o método não existir, o Console mostra warning mas o jogo continua rodando.",
      "Eventos disparados por animator.Play em modo manual respeitam a posição do tempo.",
      "Iniciante comum: nomear método errado e ficar caçando bug que não existe (é só ler o Console).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Animation Events disparam só no thread principal e contam como overhead. Em mobile com 50 inimigos animando, dezenas de eventos por segundo somam. Prefira eventos esparsos, não a cada frame.",
      },
      {
        type: "tip",
        content: "Crie um script central 'AnimationEventDispatcher' com métodos genéricos como FireEvent(string id) e use UnityEvents para conectar no Inspector. Evita ter dezenas de métodos espalhados pelos componentes.",
      },
      {
        type: "info",
        content: "Eventos em clips loopados disparam toda volta do loop. Se você quer disparar uma vez só, use trigger/bool no Animator em vez de Animation Event, ou adicione lógica de guarda no método receptor.",
      },
    ],
  },
];
