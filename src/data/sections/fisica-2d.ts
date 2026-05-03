import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "rigidbody2d",
    section: "fisica-2d",
    title: "Rigidbody2D: dando peso ao seu sprite",
    difficulty: "iniciante",
    subtitle: "O componente que faz seu sprite obedecer à gravidade e às forças do mundo 2D.",
    intro: `Imagine que você desenhou um personagem no papel e o colou na tela do computador. Sem nenhum sistema de física, esse personagem é só uma figura: ele não cai, não é empurrado, não responde a nada. Foi exatamente para resolver esse problema que existe o Rigidbody2D. Ele é o componente que diz para a Unity: "esse objeto aqui tem massa, sente gravidade e pode colidir com o mundo de verdade".

A grande diferença em relação ao mundo 3D é que o motor de física 2D da Unity é o Box2D, um motor especializado e muito mais leve. Ele trabalha em duas dimensões (X e Y) e ignora o eixo Z para os cálculos. Isso significa que tudo é mais previsível, mais rápido e mais barato em termos de performance, mas também que você não pode misturar Rigidbody (3D) com Rigidbody2D no mesmo objeto. São mundos paralelos: ou você está fazendo um jogo 2D e usa toda a stack 2D, ou está fazendo 3D. Misturar gera bugs silenciosos onde nada colide.

O Rigidbody2D tem três modos de corpo (Body Type) que você precisa entender desde o primeiro dia. O Dynamic é o padrão: cai com a gravidade, sofre forças, colide com tudo. É o que você usa para o player, inimigos, caixas que podem ser empurradas. O Kinematic ignora gravidade e forças, mas ainda colide; é perfeito para plataformas móveis controladas via script ou para inimigos cujo movimento você dita manualmente. O Static é imóvel para sempre, otimizado para chão, paredes, cenário fixo. Escolher o tipo errado é a fonte número um de bugs em iniciantes.

Outra propriedade central é o gravityScale. No mundo 3D, a gravidade é global e você quase nunca mexe nela. No 2D, cada Rigidbody tem seu próprio multiplicador de gravidade. Um balão pode ter gravityScale 0.1 e um martelo gravityScale 5. Isso te dá controle artístico fino e é um dos motivos pelos quais jogos 2D parecem ter "peso" diferente entre objetos. Vamos ver na prática como configurar tudo isso.`,
    codes: [
      {
        lang: "csharp",
        code: `// Script básico para mover um Rigidbody2D pelo teclado.
// Cole em um GameObject que tenha SpriteRenderer + Rigidbody2D + Collider2D.
using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class MovimentoBasico2D : MonoBehaviour
{
    [SerializeField] private float velocidade = 5f;

    private Rigidbody2D rb;

    private void Awake()
    {
        // Pegamos a referência uma única vez. GetComponent é caro se chamado todo frame.
        rb = GetComponent<Rigidbody2D>();
    }

    private void FixedUpdate()
    {
        // Toda alteração de física DEVE acontecer em FixedUpdate, nunca em Update.
        // FixedUpdate roda em intervalos fixos (0.02s por padrão), em sincronia com o motor de física.
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");

        // linearVelocity substituiu velocity nas versões mais novas da Unity (2023.3+).
        // Em projetos mais antigos, troque por rb.velocity.
        rb.linearVelocity = new Vector2(h * velocidade, rb.linearVelocity.y);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Demonstrando os três Body Types e quando usar cada um.
using UnityEngine;

public class ExemploBodyTypes : MonoBehaviour
{
    public Rigidbody2D player;     // Dynamic: sofre gravidade e forças
    public Rigidbody2D plataforma; // Kinematic: você controla via script
    public Rigidbody2D parede;     // Static: nunca se move

    private void Start()
    {
        // Garantindo na unha (normalmente isso é configurado no Inspector).
        player.bodyType = RigidbodyType2D.Dynamic;
        plataforma.bodyType = RigidbodyType2D.Kinematic;
        parede.bodyType = RigidbodyType2D.Static;

        // Cada Rigidbody2D tem seu PRÓPRIO gravityScale.
        // Aumentar deixa o objeto mais "pesado" na queda; valor 0 ignora gravidade.
        player.gravityScale = 3f;        // cai mais rápido que o normal
        plataforma.gravityScale = 0f;    // Kinematic já ignora, mas deixar 0 é boa prática
    }

    private void FixedUpdate()
    {
        // Mover Kinematic: use MovePosition, nunca altere transform.position diretamente
        // porque transform pula a detecção de colisão e gera tunneling.
        Vector2 destino = plataforma.position + Vector2.right * Mathf.Sin(Time.time) * 0.05f;
        plataforma.MovePosition(destino);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Aplicando forças e impulsos: a forma "correta" de fazer física.
using UnityEngine;

public class ForcasEImpulsos : MonoBehaviour
{
    private Rigidbody2D rb;
    [SerializeField] private float forcaPulo = 8f;
    [SerializeField] private float forcaContinua = 20f;

    private void Awake() => rb = GetComponent<Rigidbody2D>();

    private void Update()
    {
        // Detectar input em Update (preciso por frame), mas APLICAR no FixedUpdate.
        if (Input.GetKeyDown(KeyCode.Space))
        {
            // Impulse: empurrão instantâneo, ignora a massa parcialmente. Ótimo para pulo.
            rb.AddForce(Vector2.up * forcaPulo, ForceMode2D.Impulse);
        }
    }

    private void FixedUpdate()
    {
        if (Input.GetKey(KeyCode.RightArrow))
        {
            // Force: aplicado de forma contínua a cada FixedUpdate.
            // Útil para naves, vento, propulsão constante.
            rb.AddForce(Vector2.right * forcaContinua, ForceMode2D.Force);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Configurando travas e amortecimento (drag) para evitar comportamentos estranhos.
using UnityEngine;

public class AjustesUteisRb2D : MonoBehaviour
{
    private Rigidbody2D rb;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();

        // freezeRotation evita que o personagem caia tombado depois de uma colisão.
        // Em jogos 2D top-down ou plataforma, quase sempre você quer isso ligado.
        rb.freezeRotation = true;

        // linearDamping (antigo "drag") simula resistência do ar: quanto maior, mais cedo o objeto para.
        rb.linearDamping = 0.5f;

        // angularDamping faz o mesmo para rotação.
        rb.angularDamping = 0.05f;

        // Interpolation suaviza o movimento visual entre frames de física.
        // Use Interpolate no objeto que a câmera segue para evitar tremida.
        rb.interpolation = RigidbodyInterpolation2D.Interpolate;

        // CollisionDetection: Continuous evita atravessar paredes em alta velocidade (tunneling),
        // mas custa mais CPU. Use só onde precisa (player, projéteis rápidos).
        rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
    }
}`,
      },
    ],
    points: [
      "Rigidbody2D usa o motor Box2D, separado e incompatível com Rigidbody 3D.",
      "Dynamic sofre gravidade e forças; Kinematic é controlado por script; Static nunca se move.",
      "Cada Rigidbody2D tem seu próprio gravityScale, dando peso individual a cada objeto.",
      "Mexa em física apenas dentro de FixedUpdate, nunca em Update.",
      "Para mover Kinematic, use MovePosition em vez de alterar transform.position.",
      "Use ForceMode2D.Impulse para empurrões instantâneos (pulo) e Force para algo contínuo.",
      "freezeRotation evita o personagem cair tombado depois de bater em algo.",
      "Interpolate suaviza o movimento visual entre frames de física, ótimo para o player.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Em Unity 2023.3+ a propriedade velocity foi renomeada para linearVelocity. Tutoriais antigos usam .velocity e geram warnings ou erros nas versões novas. Confira sua versão antes de copiar código.",
      },
      {
        type: "tip",
        content: "Se seu personagem 'gruda' nas paredes ao apertar a direção contra elas, geralmente é atrito do Collider2D, não do Rigidbody. Crie um Physics Material 2D com friction 0 e aplique no collider do player.",
      },
      {
        type: "danger",
        content: "Nunca misture Rigidbody (3D) e Rigidbody2D no mesmo GameObject ou no mesmo projeto sem necessidade. Os dois sistemas de física não se enxergam, e colliders de mundos diferentes simplesmente atravessam um ao outro sem disparar nada.",
      },
    ],
  },
  {
    slug: "colliders-2d",
    section: "fisica-2d",
    title: "Colliders 2D: a forma física do seu sprite",
    difficulty: "iniciante",
    subtitle: "Box, Circle, Capsule, Polygon, Edge, Composite e Tilemap — cada um tem seu papel.",
    intro: `Um sprite, sozinho, é apenas uma imagem desenhada na tela. Ele não tem corpo. Quando você quer que dois objetos saibam que se tocaram, é o Collider2D que define o "contorno físico" daquele sprite. É como se você desenhasse um molde transparente em volta da figura, e a Unity passasse a usar esse molde, e não os pixels da imagem, para detectar contato. Essa separação entre imagem e forma física é proposital: imagens podem ter pixels transparentes, sombras, brilho, e tudo isso confundiria a física se ela tentasse adivinhar o contorno automaticamente.

A escolha do collider certo afeta diretamente a performance e a sensação do jogo. O BoxCollider2D é o mais barato e funciona bem para caixas, plataformas e cenários retangulares. O CircleCollider2D é igualmente rápido e perfeito para bolas, moedas e para a base inferior arredondada de personagens (evita o famoso "trava em cantos de plataforma"). O CapsuleCollider2D combina o melhor dos dois: é uma cápsula vertical ou horizontal, ideal para personagens humanóides porque desliza suave em rampas e não engancha em quinas.

Quando a forma é mais complexa, entram o PolygonCollider2D e o EdgeCollider2D. O Polygon traça um contorno fechado em volta de qualquer sprite (a Unity tenta gerar automaticamente a partir da imagem, mas você pode editar vértice por vértice). O Edge é uma linha aberta, ótima para chão de cenário, plataformas finas ou bordas onde só um lado importa. Já o CompositeCollider2D é uma ferramenta avançada: ele junta vários colliders filhos em uma única forma, eliminando "costuras" invisíveis entre tiles que fazem o personagem tropeçar.

Por fim, o TilemapCollider2D é gerado automaticamente quando você desenha um Tilemap. Cada tile vira um pequeno collider, e isso pode ficar pesado em mapas grandes. É exatamente para esse caso que o Composite existe: combinado com TilemapCollider2D, ele transforma centenas de quadradinhos numa única forma contínua. Saber qual collider escolher em cada situação é o que separa um jogo 2D que roda liso de um que engasga sem motivo aparente.`,
    codes: [
      {
        lang: "csharp",
        code: `// Como escolher e configurar Colliders 2D via código.
// Normalmente você adiciona pelo Inspector, mas é útil entender o que cada propriedade faz.
using UnityEngine;

public class SetupColliders : MonoBehaviour
{
    private void Start()
    {
        // BoxCollider2D: o mais barato. Use para caixas, paredes, plataformas retangulares.
        BoxCollider2D box = gameObject.AddComponent<BoxCollider2D>();
        box.size = new Vector2(1f, 2f);     // largura 1, altura 2 (em unidades de mundo)
        box.offset = new Vector2(0f, 1f);   // centro deslocado 1 unidade para cima

        // edgeRadius arredonda os cantos: ajuda o personagem a não 'travar' em quinas.
        box.edgeRadius = 0.02f;

        // isTrigger = false significa colisão sólida (vai bater e parar).
        // Veremos isTrigger = true no próximo capítulo (gatilhos).
        box.isTrigger = false;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Comparando os colliders mais comuns lado a lado.
using UnityEngine;

public class GaleriaDeColliders : MonoBehaviour
{
    public GameObject prefabSprite;

    private void Start()
    {
        // Caixa: cenário, paredes, blocos quadrados.
        Criar("Caixa", typeof(BoxCollider2D), new Vector3(-3, 0, 0));

        // Círculo: moedas, bolas, base de personagem que precisa subir rampa suave.
        Criar("Bola", typeof(CircleCollider2D), new Vector3(-1, 0, 0));

        // Cápsula: corpo de personagem humanoide. Lisa em rampas e quinas.
        Criar("Personagem", typeof(CapsuleCollider2D), new Vector3(1, 0, 0));

        // Polígono: gerado a partir do sprite. Ótimo para formas irregulares (rochas, árvores).
        Criar("Rocha", typeof(PolygonCollider2D), new Vector3(3, 0, 0));
    }

    private void Criar(string nome, System.Type tipoCollider, Vector3 pos)
    {
        GameObject go = Instantiate(prefabSprite, pos, Quaternion.identity);
        go.name = nome;
        go.AddComponent(tipoCollider);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Aplicando Physics Material 2D: controla atrito e quique.
// Crie via menu: Assets > Create > 2D > Physics Material 2D.
using UnityEngine;

public class MateriaisFisica : MonoBehaviour
{
    public PhysicsMaterial2D materialEscorregadio; // friction = 0
    public PhysicsMaterial2D materialQuicar;       // bounciness = 1

    private void Start()
    {
        // Pegando o collider do jogador e zerando o atrito.
        // Sem isso, o personagem 'gruda' nas paredes quando você empurra contra elas.
        var colliderPlayer = GetComponent<Collider2D>();
        colliderPlayer.sharedMaterial = materialEscorregadio;

        // Em uma bola que deve quicar:
        var bola = GameObject.Find("Bola");
        if (bola != null)
        {
            bola.GetComponent<Collider2D>().sharedMaterial = materialQuicar;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Usando CompositeCollider2D para juntar vários colliders em um só.
// Reduz drasticamente o custo de cenários grandes e elimina costuras entre tiles.
using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(CompositeCollider2D))]
public class CenarioOtimizado : MonoBehaviour
{
    private void Awake()
    {
        // O Composite EXIGE um Rigidbody2D no mesmo GameObject.
        // Como é cenário fixo, marcamos como Static.
        Rigidbody2D rb = GetComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Static;

        CompositeCollider2D comp = GetComponent<CompositeCollider2D>();

        // Outline gera o contorno final como linhas (mais leve).
        // Polygons gera como polígonos preenchidos (preciso para colisões internas).
        comp.geometryType = CompositeCollider2D.GeometryType.Outline;

        // Para que um collider filho seja absorvido pelo Composite,
        // marque "Used By Composite" como true em cada BoxCollider2D filho no Inspector.
    }
}`,
      },
    ],
    points: [
      "Sprites são imagens; Colliders2D definem a forma física que detecta contato.",
      "Box, Circle e Capsule são os mais baratos; prefira-os sempre que possível.",
      "PolygonCollider2D é gerado a partir do sprite, mas você pode editar manualmente.",
      "EdgeCollider2D é uma linha aberta, ideal para chão e bordas de plataformas.",
      "CompositeCollider2D junta vários colliders em uma forma só, otimizando cenários.",
      "TilemapCollider2D + CompositeCollider2D é a combinação padrão para mapas grandes.",
      "Use CapsuleCollider2D vertical no player para deslizar suave em rampas e quinas.",
      "Physics Material 2D controla atrito (friction) e quique (bounciness) sem código.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Se seu personagem trava em quinas entre dois tiles do chão, o problema quase nunca é o personagem; é a costura entre os colliders dos tiles. Coloque CompositeCollider2D no Tilemap e ative 'Used By Composite' nos tiles.",
      },
      {
        type: "warning",
        content: "PolygonCollider2D com muitos vértices é caro. Se você gerou a partir de um sprite complexo e a Unity criou 80 pontos, simplifique manualmente para 8-10. A diferença em jogos com muitos inimigos é gigante.",
      },
      {
        type: "info",
        content: "Para que dois colliders detectem contato, pelo menos um dos GameObjects precisa ter Rigidbody2D (mesmo que Kinematic). Sem nenhum Rigidbody, os colliders são considerados 'cenário estático' otimizado e não disparam eventos um contra o outro.",
      },
    ],
  },
  {
    slug: "triggers-2d",
    section: "fisica-2d",
    title: "Triggers 2D: detectar sem colidir",
    difficulty: "iniciante",
    subtitle: "Como saber que algo entrou em uma área sem que ele bata fisicamente.",
    intro: `Até agora vimos colliders sólidos: dois objetos que batem e param um no outro. Mas em jogos, com muita frequência, você quer detectar contato sem bloqueio físico. Pensa numa moeda: o player passa por cima e ela some, sem fazer o player tropeçar. Pensa numa porta automática que abre quando você se aproxima, ou numa zona de dano que machuca todo mundo que entra nela. Em todos esses casos, você não quer colisão sólida, você quer um gatilho. É exatamente isso que o "Is Trigger" do Collider2D faz.

Quando você marca a caixinha "Is Trigger" no Inspector de qualquer Collider2D, aquela forma deixa de bloquear o movimento e passa a apenas avisar que algo a atravessou. Esse aviso vem em forma de três eventos especiais que a Unity chama no seu script: OnTriggerEnter2D quando algo entra, OnTriggerStay2D enquanto o objeto continua dentro, e OnTriggerExit2D quando ele sai. São métodos com assinatura fixa que a Unity reconhece automaticamente — você não precisa "registrar" nada, basta escrever a função certa.

Para um trigger funcionar, lembre da regra de ouro do capítulo anterior: pelo menos um dos dois objetos envolvidos precisa ter um Rigidbody2D. Se você tem uma moeda parada com BoxCollider2D marcado como trigger, e o player passa por ela, o player precisa ter Rigidbody2D para que o Box2D registre o contato. Esse é provavelmente o erro mais comum em iniciantes: criam o trigger, escrevem o método, jogam, nada acontece, perdem uma hora até descobrirem que faltou um Rigidbody2D em alguém.

Triggers são também a maneira "barata" de detectar áreas. Eles não calculam resposta de colisão (não precisam decidir para onde empurrar), então custam menos que colliders sólidos. Por isso são usados para: zonas de checkpoint, áreas de aviso para inimigos, gatilhos de cutscene, sensores de chão (como o do nosso mini-projeto no fim da seção), portais entre cenas. Quando NÃO usar trigger: quando você quer que o objeto realmente bloqueie o movimento (paredes, chão, plataformas). Aí o collider precisa ser sólido.`,
    codes: [
      {
        lang: "csharp",
        code: `// Moeda colecionável: trigger clássico.
// No GameObject: SpriteRenderer + CircleCollider2D (com Is Trigger marcado).
// Nem precisa de Rigidbody2D porque o player vai trazer o dele.
using UnityEngine;

public class Moeda : MonoBehaviour
{
    [SerializeField] private int valor = 1;
    [SerializeField] private AudioClip somColeta;

    // Chamado automaticamente pela Unity quando outro Collider2D entra nesta área.
    private void OnTriggerEnter2D(Collider2D outro)
    {
        // Verifica se quem entrou foi o player (usando Tag definida no Inspector).
        if (!outro.CompareTag("Player")) return;

        // CompareTag é mais rápido que outro.tag == "Player" porque evita
        // alocar string nova a cada chamada.

        Pontuacao.Adicionar(valor);

        if (somColeta != null)
            AudioSource.PlayClipAtPoint(somColeta, transform.position);

        Destroy(gameObject);
    }
}

public static class Pontuacao
{
    public static int Total { get; private set; }
    public static void Adicionar(int valor) => Total += valor;
}`,
      },
      {
        lang: "csharp",
        code: `// Zona de dano: usa OnTriggerStay2D para causar dano contínuo enquanto o player está dentro.
using UnityEngine;

public class ZonaDeDano : MonoBehaviour
{
    [SerializeField] private float danoPorSegundo = 10f;

    // OnTriggerStay2D é chamado a cada FixedUpdate enquanto outro collider permanece dentro.
    private void OnTriggerStay2D(Collider2D outro)
    {
        // TryGetComponent é a forma moderna e segura: retorna false se não tiver o componente.
        if (outro.TryGetComponent<Vida>(out var vida))
        {
            // Time.fixedDeltaTime garante dano proporcional ao tempo, não à taxa de frames.
            vida.Receber(danoPorSegundo * Time.fixedDeltaTime);
        }
    }

    private void OnTriggerEnter2D(Collider2D outro)
    {
        Debug.Log($"{outro.name} entrou na zona de dano");
    }

    private void OnTriggerExit2D(Collider2D outro)
    {
        Debug.Log($"{outro.name} saiu da zona de dano");
    }
}

public class Vida : MonoBehaviour
{
    public float HP = 100f;
    public void Receber(float dano) => HP = Mathf.Max(0, HP - dano);
}`,
      },
      {
        lang: "csharp",
        code: `// Porta automática: detecta proximidade do player com um trigger e abre/fecha.
using UnityEngine;

public class PortaAutomatica : MonoBehaviour
{
    [SerializeField] private Transform porta;
    [SerializeField] private float deslocamento = 2f;

    private Vector3 posFechada;
    private Vector3 posAberta;
    private bool aberta;

    private void Start()
    {
        posFechada = porta.position;
        posAberta = posFechada + Vector3.up * deslocamento;
    }

    private void Update()
    {
        // Lerp suave para abrir/fechar visualmente.
        Vector3 alvo = aberta ? posAberta : posFechada;
        porta.position = Vector3.Lerp(porta.position, alvo, Time.deltaTime * 5f);
    }

    private void OnTriggerEnter2D(Collider2D outro)
    {
        if (outro.CompareTag("Player")) aberta = true;
    }

    private void OnTriggerExit2D(Collider2D outro)
    {
        if (outro.CompareTag("Player")) aberta = false;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Detectar várias coisas dentro de uma área SEM esperar evento:
// OverlapBox/OverlapCircle/OverlapArea são consultas instantâneas.
using UnityEngine;

public class ExplosaoEmArea : MonoBehaviour
{
    [SerializeField] private float raio = 3f;
    [SerializeField] private LayerMask camadasAfetadas;
    [SerializeField] private float danoBase = 50f;

    public void Explodir()
    {
        // OverlapCircleAll devolve TODOS os colliders dentro do raio que estão nas layers escolhidas.
        Collider2D[] atingidos = Physics2D.OverlapCircleAll(transform.position, raio, camadasAfetadas);

        foreach (Collider2D alvo in atingidos)
        {
            if (alvo.TryGetComponent<Vida>(out var vida))
            {
                // Quanto mais perto do centro, mais dano.
                float distancia = Vector2.Distance(transform.position, alvo.transform.position);
                float fator = 1f - Mathf.Clamp01(distancia / raio);
                vida.Receber(danoBase * fator);
            }
        }
    }

    // Desenha o raio na Scene View para você visualizar a área de efeito.
    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, raio);
    }
}`,
      },
    ],
    points: [
      "Marcar 'Is Trigger' transforma um Collider2D em sensor sem bloqueio físico.",
      "Pelo menos um dos dois objetos envolvidos precisa ter Rigidbody2D para o trigger disparar.",
      "OnTriggerEnter2D, OnTriggerStay2D e OnTriggerExit2D são reconhecidos automaticamente.",
      "Use CompareTag em vez de comparação direta de string para performance.",
      "OverlapBox/Circle/Area fazem detecção pontual sem precisar de evento contínuo.",
      "TryGetComponent é a forma segura e rápida de verificar componentes em runtime.",
      "Triggers são mais baratos que colisões sólidas; use para áreas de detecção.",
      "Use LayerMask nos Overlap para filtrar e evitar testar contra todo o cenário.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Se seu trigger não dispara, 99% das vezes é falta de Rigidbody2D em um dos lados ou as Layers dos dois objetos estão desativadas na matriz Edit > Project Settings > Physics 2D > Layer Collision Matrix.",
      },
      {
        type: "tip",
        content: "Para detectar chão (ground check), prefira OverlapCircle ou OverlapBox abaixo do player em vez de criar um GameObject filho com trigger. É mais barato, mais previsível e roda dentro do FixedUpdate.",
      },
      {
        type: "info",
        content: "OnTriggerStay2D é chamado em todo FixedUpdate (50x por segundo por padrão). Se você fizer trabalho pesado lá dentro, vai consumir CPU rápido. Cache resultados ou use um cooldown se precisar de algo custoso.",
      },
    ],
  },
  {
    slug: "raycast-2d",
    section: "fisica-2d",
    title: "Raycast 2D: enxergando o mundo com linhas invisíveis",
    difficulty: "intermediario",
    subtitle: "Detecção de chão, mira de armas, linha de visão de inimigos — tudo começa com Physics2D.Raycast.",
    intro: `Imagine que você é um inimigo num jogo 2D e quer saber se o player está na sua frente. Você não tem olhos físicos; precisa de uma forma matemática de "olhar". A solução clássica em jogos é o raycast: você dispara uma linha invisível de um ponto, em uma direção, e pergunta para o motor de física "essa linha bateu em alguma coisa? Em que? A que distância?". O motor devolve essa informação na hora, e você reage. É exatamente assim que se faz mira de tiro, sensor de chão, linha de visão, detecção de borda de plataforma, "click no mundo" com mouse, escolha de tile sob o cursor, e dezenas de outras coisas.

Em 2D, a função principal é Physics2D.Raycast. Ela recebe três coisas obrigatórias: um ponto de origem (Vector2), uma direção (Vector2 normalizado, ou seja, com magnitude 1) e uma distância máxima. Ela devolve um RaycastHit2D, que é uma estrutura com várias informações: se bateu em algo (hit.collider != null), em que ponto bateu (hit.point), qual a normal da superfície atingida (hit.normal), e qual GameObject foi atingido (hit.collider.gameObject). Esse pacote te dá tudo que precisa para tomar decisões.

A grande pegadinha é o LayerMask. Se você fizer um raycast sem filtro, ele vai bater em qualquer coisa: o próprio player, partículas, decoração, tudo. Para resolver isso, você cria layers nomeadas (Edit > Project Settings > Tags and Layers), atribui cada GameObject a uma layer apropriada, e passa um LayerMask na chamada do raycast para filtrar só o que importa. É a diferença entre um sistema que funciona e um que dispara em fantasmas.

Existem variações importantes: Physics2D.RaycastAll devolve TODOS os colliders atingidos pelo raio, não só o primeiro. Physics2D.OverlapBox e OverlapCircle fazem a mesma ideia mas em forma de área, não linha. Physics2D.BoxCast e CircleCast deslizam uma forma pelo espaço, perfeito para projéteis grossos ou para detectar se um espaço está livre antes de teleportar o player. Cada uma tem seu uso, e dominar essas ferramentas é um marco que separa o iniciante do programador 2D competente na Unity.`,
    codes: [
      {
        lang: "csharp",
        code: `// Ground check: o uso mais comum de Raycast2D em jogos de plataforma.
using UnityEngine;

public class GroundCheckRaycast : MonoBehaviour
{
    [SerializeField] private float distanciaCheck = 0.6f;
    [SerializeField] private LayerMask layerChao;   // configurar no Inspector

    private bool noChao;

    private void FixedUpdate()
    {
        // Disparamos um raio do centro do player para baixo.
        // Em jogos com personagem capsulado, normalmente origem = pés.
        Vector2 origem = transform.position;
        RaycastHit2D hit = Physics2D.Raycast(origem, Vector2.down, distanciaCheck, layerChao);

        // hit.collider != null significa que o raio bateu em algo na layer escolhida.
        noChao = hit.collider != null;
    }

    // OnDrawGizmos te dá um feedback visual no editor: vermelho = no ar, verde = no chão.
    private void OnDrawGizmos()
    {
        Gizmos.color = noChao ? Color.green : Color.red;
        Gizmos.DrawLine(transform.position, transform.position + Vector3.down * distanciaCheck);
    }

    public bool EstaNoChao() => noChao;
}`,
      },
      {
        lang: "csharp",
        code: `// Linha de visão: inimigo enxerga o player se nada bloquear o raio.
using UnityEngine;

public class LinhaDeVisao : MonoBehaviour
{
    [SerializeField] private Transform player;
    [SerializeField] private float alcance = 10f;
    [SerializeField] private LayerMask obstaculos;   // paredes que bloqueiam visão

    private bool vendoPlayer;

    private void Update()
    {
        if (player == null) return;

        Vector2 origem = transform.position;
        Vector2 direcao = (player.position - transform.position).normalized;
        float distancia = Vector2.Distance(transform.position, player.position);

        if (distancia > alcance) { vendoPlayer = false; return; }

        // Disparamos o raio só até o player; se algo bloquear no meio, hit.collider será uma parede.
        RaycastHit2D hit = Physics2D.Raycast(origem, direcao, distancia, obstaculos);

        // Se nada bloqueou (hit.collider == null), o caminho está livre.
        vendoPlayer = hit.collider == null;

        // Debug.DrawRay aparece na Scene View durante o Play (não desenha em build).
        Debug.DrawRay(origem, direcao * distancia, vendoPlayer ? Color.green : Color.red);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Mira de tiro: clicar com o mouse e disparar um raio até o ponto clicado.
using UnityEngine;

public class TiroComMouse : MonoBehaviour
{
    [SerializeField] private float alcance = 20f;
    [SerializeField] private LayerMask alvosValidos;
    [SerializeField] private float dano = 25f;

    private Camera cam;

    private void Awake() => cam = Camera.main;

    private void Update()
    {
        if (!Input.GetMouseButtonDown(0)) return;

        // Converte a posição do mouse (em pixels da tela) para coordenadas do mundo 2D.
        Vector2 mundoMouse = cam.ScreenToWorldPoint(Input.mousePosition);

        Vector2 origem = transform.position;
        Vector2 direcao = (mundoMouse - origem).normalized;

        RaycastHit2D hit = Physics2D.Raycast(origem, direcao, alcance, alvosValidos);

        if (hit.collider != null)
        {
            // hit.point: onde exatamente o raio bateu (perfeito para spawn de partícula).
            // hit.normal: vetor perpendicular à superfície (perfeito para refletir tiros).
            Debug.Log($"Acertou {hit.collider.name} no ponto {hit.point}");

            if (hit.collider.TryGetComponent<Vida>(out var vida))
                vida.Receber(dano);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// BoxCast: 'desliza' uma caixa pelo espaço. Útil para detectar borda de plataforma.
using UnityEngine;

public class DetectorDeBorda : MonoBehaviour
{
    [SerializeField] private Vector2 tamanhoCaixa = new Vector2(0.2f, 0.2f);
    [SerializeField] private float distanciaFrente = 0.5f;
    [SerializeField] private float distanciaAbaixo = 1f;
    [SerializeField] private LayerMask layerChao;
    [SerializeField] private bool olhandoDireita = true;

    public bool TemChaoNaFrente()
    {
        // Origem deslocada para a frente do personagem.
        Vector2 dir = olhandoDireita ? Vector2.right : Vector2.left;
        Vector2 origem = (Vector2)transform.position + dir * distanciaFrente;

        // BoxCast joga uma caixa para baixo verificando se ela bate no chão.
        RaycastHit2D hit = Physics2D.BoxCast(origem, tamanhoCaixa, 0f, Vector2.down, distanciaAbaixo, layerChao);

        return hit.collider != null;
    }

    private void OnDrawGizmosSelected()
    {
        Vector2 dir = olhandoDireita ? Vector2.right : Vector2.left;
        Vector2 origem = (Vector2)transform.position + dir * distanciaFrente;
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireCube(origem + Vector2.down * distanciaAbaixo, tamanhoCaixa);
    }
}`,
      },
    ],
    points: [
      "Physics2D.Raycast dispara uma linha invisível e devolve o que ela atingiu.",
      "Sempre filtre com LayerMask para evitar bater no próprio player ou em decoração.",
      "RaycastHit2D contém collider, point, normal e distance — use cada um conforme a necessidade.",
      "Use Debug.DrawRay e Gizmos para visualizar raios no editor durante o desenvolvimento.",
      "OverlapCircle/OverlapBox são versões em área; prefira para ground check largo.",
      "BoxCast e CircleCast 'deslizam' formas pelo espaço, ótimos para projéteis grossos.",
      "Ground check com raycast dentro do FixedUpdate é o padrão para jogos de plataforma.",
      "ScreenToWorldPoint converte coordenadas do mouse para o mundo do jogo em 2D.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Se o raycast atinge o próprio collider do player, ou está sempre 'no chão' mesmo no ar, falta filtrar com LayerMask. Crie uma layer 'Ground' separada e selecione apenas ela na máscara.",
      },
      {
        type: "tip",
        content: "Para ground check robusto em personagens com pés largos, dispare DOIS raios (esquerda e direita do colisor) ou use OverlapBox achatado abaixo do player. Um raio único falha quando o personagem está na beirada da plataforma.",
      },
      {
        type: "info",
        content: "Physics2D.queriesStartInColliders (em Project Settings > Physics 2D) controla se o raycast considera o ponto de origem dentro de um collider. Em ground check com origem dentro do player, talvez você precise desligar essa opção ou começar o raio um pouco abaixo.",
      },
    ],
  },
  {
    slug: "joints-2d",
    section: "fisica-2d",
    title: "Joints 2D: conectando objetos com física",
    difficulty: "intermediario",
    subtitle: "Hinge, Distance, Spring, Slider e Fixed — peças que se prendem como no mundo real.",
    intro: `Em jogos 2D, com frequência você precisa que dois objetos físicos fiquem conectados de alguma forma. Pensa numa porta com dobradiça, num pêndulo balançando, num caixote pendurado por uma corda, num veículo com rodas que giram, num gancho elástico tipo Worms. Você poderia tentar simular isso na unha movimentando objetos via script, mas o resultado fica artificial e quebra na primeira colisão inesperada. A solução elegante é usar Joints 2D: componentes que dizem para o motor de física "esses dois Rigidbody2D estão presos um ao outro segundo essa regra".

A Unity oferece vários tipos de joints 2D, cada um modelando um tipo de conexão. O HingeJoint2D simula uma dobradiça: dois objetos compartilham um ponto de pivô e podem girar livremente em volta dele (ou dentro de limites de ângulo). É o que você usa para portas, balanços, braços de robô. O DistanceJoint2D mantém uma distância fixa entre dois pontos, como uma barra rígida invisível. Útil para correntes de pingente, satélites em órbita, pesos amarrados.

O SpringJoint2D é uma mola: tenta manter uma distância, mas com elasticidade. Você ajusta frequência (rigidez) e damping (amortecimento) e consegue desde uma mola dura até uma corda elástica fofa. O SliderJoint2D é um trilho: dois objetos só podem se mover ao longo de uma linha, como um elevador ou uma porta deslizante. O FixedJoint2D cola dois corpos rigidamente, útil para construir composições que ainda assim podem ser quebradas em runtime se você destruir o joint.

A grande sacada é que joints 2D rodam dentro do motor Box2D e respeitam massa, gravidade, atrito e tudo mais. Você não precisa programar a "matemática da dobradiça"; configura os parâmetros no Inspector ou via código e deixa a física fazer o trabalho. Isso libera você para projetar mecânicas complexas — um boss com tentáculos que oscilam, uma plataforma pendurada que balança quando o player pousa, um veículo com suspensão — sem escrever cálculos físicos. Vamos ver os dois mais usados em ação.`,
    codes: [
      {
        lang: "csharp",
        code: `// Pêndulo com HingeJoint2D: balança preso por um ponto fixo no topo.
// Cena: GameObject 'PontoFixo' (Rigidbody2D Static) + GameObject 'Peso' (Rigidbody2D Dynamic).
using UnityEngine;

public class CriarPendulo : MonoBehaviour
{
    public Rigidbody2D pontoFixo;   // âncora (Static)
    public Rigidbody2D peso;        // o objeto que balança (Dynamic)

    private void Start()
    {
        // Adiciona o joint no PESO. A Unity pede que o joint fique no objeto que se move.
        HingeJoint2D dobradica = peso.gameObject.AddComponent<HingeJoint2D>();

        // connectedBody: o outro corpo da conexão.
        dobradica.connectedBody = pontoFixo;

        // Auto Configure Connected Anchor = false dá controle preciso sobre onde o pivô está.
        dobradica.autoConfigureConnectedAnchor = false;
        dobradica.anchor = Vector2.zero;                  // ponto no peso (o topo dele)
        dobradica.connectedAnchor = pontoFixo.position;   // ponto no mundo

        // Limites de ângulo: pêndulo não gira 360 graus, oscila entre -45 e +45.
        dobradica.useLimits = true;
        JointAngleLimits2D limites = new JointAngleLimits2D { min = -45f, max = 45f };
        dobradica.limits = limites;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Caixa pendurada por corda usando DistanceJoint2D.
using UnityEngine;

public class CaixaPendurada : MonoBehaviour
{
    public Rigidbody2D ancora;   // ponto fixo no teto
    public Rigidbody2D caixa;    // a caixa que vai pendurar
    [SerializeField] private float comprimento = 3f;

    private void Start()
    {
        DistanceJoint2D corda = caixa.gameObject.AddComponent<DistanceJoint2D>();
        corda.connectedBody = ancora;

        // distance define o tamanho da 'corda invisível'.
        corda.autoConfigureDistance = false;
        corda.distance = comprimento;

        // maxDistanceOnly: comporta como corda real (só puxa quando estica), em vez de barra rígida.
        corda.maxDistanceOnly = true;

        // O resto da física faz o trabalho: a caixa cai pela gravidade até a corda esticar.
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Mola amortecedora com SpringJoint2D: ideal para gancho elástico ou suspensão.
using UnityEngine;

public class GanchoElastico : MonoBehaviour
{
    public Rigidbody2D player;
    public Rigidbody2D pontoDestino;

    public void DispararGancho()
    {
        SpringJoint2D mola = player.gameObject.AddComponent<SpringJoint2D>();
        mola.connectedBody = pontoDestino;

        // distance: comprimento de repouso da mola.
        mola.autoConfigureDistance = false;
        mola.distance = 0.5f;

        // frequency: quão rígida a mola é (Hz). 0 = rígida como barra. 5 = média. 1 = bem mole.
        mola.frequency = 2f;

        // dampingRatio (0 a 1): quanto de amortecimento. 0 = oscila para sempre. 1 = para no primeiro ciclo.
        mola.dampingRatio = 0.5f;
    }

    public void SoltarGancho()
    {
        SpringJoint2D mola = player.GetComponent<SpringJoint2D>();
        if (mola != null) Destroy(mola);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Porta deslizante com SliderJoint2D + motor.
using UnityEngine;

public class PortaDeslizante : MonoBehaviour
{
    public Rigidbody2D porta;
    public Rigidbody2D parede;       // âncora estática

    private SliderJoint2D trilho;

    private void Start()
    {
        trilho = porta.gameObject.AddComponent<SliderJoint2D>();
        trilho.connectedBody = parede;

        // angle: direção do trilho em graus. 0 = horizontal, 90 = vertical.
        trilho.angle = 0f;

        // Limites: a porta só desliza entre 0 e 3 unidades.
        trilho.useLimits = true;
        trilho.limits = new JointTranslationLimits2D { min = 0f, max = 3f };
    }

    public void Abrir()
    {
        // Motor: faz a porta deslizar sozinha em uma velocidade alvo.
        trilho.useMotor = true;
        trilho.motor = new JointMotor2D { motorSpeed = 2f, maxMotorTorque = 1000f };
    }

    public void Fechar()
    {
        trilho.motor = new JointMotor2D { motorSpeed = -2f, maxMotorTorque = 1000f };
    }
}`,
      },
    ],
    points: [
      "Joints 2D conectam dois Rigidbody2D segundo regras físicas pré-prontas.",
      "HingeJoint2D modela dobradiças: porta, balanço, braço de robô.",
      "DistanceJoint2D mantém distância fixa; útil para correntes e cordas (com maxDistanceOnly).",
      "SpringJoint2D é uma mola elástica configurável (frequency e dampingRatio).",
      "SliderJoint2D restringe movimento a uma linha; combinado com motor vira porta automática.",
      "FixedJoint2D cola dois corpos rigidamente, podendo ser destruído em runtime.",
      "Sempre desligue 'Auto Configure Connected Anchor' quando precisar de pivôs precisos.",
      "Joints respeitam massa: corpos muito leves ligados a muito pesados ficam instáveis.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Conectar um Rigidbody Dynamic a um Static via joint só funciona bem se o Static não se mover. Se você precisar mover a âncora, use Kinematic e atualize via MovePosition, nunca via transform.",
      },
      {
        type: "tip",
        content: "Para 'cordas' realistas, em vez de um único DistanceJoint2D, crie vários elos pequenos com HingeJoint2D em cadeia. Fica mais lento, mas dobra de verdade. Use só onde a estética exige.",
      },
      {
        type: "info",
        content: "Quando dois objetos conectados por joint colidem entre si e tremem, ative 'Enable Collision' do joint para false. Isso impede que o motor calcule colisões internas entre eles, removendo o jitter.",
      },
    ],
  },
  {
    slug: "plataforma-2d",
    section: "fisica-2d",
    title: "Mini-projeto: player de plataforma 2D",
    difficulty: "intermediario",
    subtitle: "Juntando Rigidbody2D, Collider2D, Raycast e input em um personagem que anda, pula e flipa.",
    intro: `Chegou a hora de juntar tudo que vimos nesta seção em um mini-projeto que você pode realmente colocar em um jogo. Vamos construir o controle de um personagem de plataforma 2D do zero, com movimentação horizontal pelo teclado, pulo com detecção de chão (ground check via OverlapCircle), e flip do sprite na direção do movimento. É a base de Mario, Hollow Knight, Celeste, Limbo — qualquer jogo 2D de plataforma começa por aqui. Entender cada decisão deste código é entender 80% do que faz um controle 2D parecer bom de jogar.

A primeira decisão importante é separar input de física. Captamos o input no Update (toda mexida no teclado precisa ser detectada por frame, senão você perde inputs rápidos como apertar e soltar Espaço dentro de um único frame de física), mas só APLICAMOS o movimento no FixedUpdate. Isso evita comportamentos errados em monitores de 144 Hz e garante simulação consistente. É um padrão clássico que muitos tutoriais ignoram, e o resultado fica esquisito.

A segunda decisão é o ground check. Em vez de confiar em OnCollisionEnter2D (que falha quando o player escorrega na lateral de uma plataforma), usamos Physics2D.OverlapCircle bem na altura dos pés. Esse círculo testa em todo FixedUpdate se há algo na layer Ground tocando os pés. É barato, robusto e explícito: se está tocando, você pode pular; se não, é porque está no ar.

A terceira decisão é o flip do sprite. Em vez de ter dois sprites (um virado para cada lado), mantemos um e usamos transform.localScale.x = -1 para espelhar quando o personagem anda para a esquerda. Isso preserva animações, evita carregar o dobro de imagens e é a forma padrão da indústria. Cuidado: se o player tiver filhos (como uma arma), eles também serão espelhados, o que às vezes é desejado e às vezes não.

Por último, vamos adicionar pequenos detalhes profissionais que fazem TODA a diferença na sensação de jogo: coyote time (perdoar pulo se você acabou de sair da plataforma), jump buffer (perdoar se você apertou pulo um instante antes de pousar) e variable jump height (segurar Espaço pula mais alto). Esses três truques são o que separa "joga ok" de "joga gostoso", e quase nenhum tutorial básico mostra. Aqui você vai sair com tudo.`,
    codes: [
      {
        lang: "csharp",
        code: `// PlayerControlador2D: o coração do mini-projeto.
// Configuração: Sprite + Rigidbody2D (Dynamic, freezeRotation = true) + CapsuleCollider2D.
// Crie uma layer 'Ground' e atribua ao chão e plataformas.
using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class PlayerControlador2D : MonoBehaviour
{
    [Header("Movimento")]
    [SerializeField] private float velocidade = 7f;
    [SerializeField] private float forcaPulo = 12f;

    [Header("Ground Check")]
    [SerializeField] private Transform pesos;            // ponto vazio na altura dos pés
    [SerializeField] private float raioCheck = 0.15f;
    [SerializeField] private LayerMask layerChao;

    [Header("Polimento")]
    [SerializeField] private float tempoCoyote = 0.1f;   // janela após sair do chão
    [SerializeField] private float bufferPulo = 0.1f;    // janela antes de pousar
    [SerializeField] private float multiplicadorPuloCurto = 2f;

    private Rigidbody2D rb;
    private SpriteRenderer sprite;

    private float inputHorizontal;
    private bool noChao;
    private float contadorCoyote;
    private float contadorBuffer;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        sprite = GetComponent<SpriteRenderer>();
        rb.freezeRotation = true;
    }

    private void Update()
    {
        // Captura de input: SEMPRE no Update para não perder frames rápidos.
        inputHorizontal = Input.GetAxisRaw("Horizontal");

        // Jump buffer: se apertou pulo, anota por bufferPulo segundos.
        if (Input.GetButtonDown("Jump")) contadorBuffer = bufferPulo;
        else contadorBuffer -= Time.deltaTime;

        // Variable jump height: se soltou Espaço subindo, corta o pulo (pulo curto).
        if (Input.GetButtonUp("Jump") && rb.linearVelocity.y > 0f)
        {
            rb.linearVelocity = new Vector2(rb.linearVelocity.x, rb.linearVelocity.y / multiplicadorPuloCurto);
        }

        // Flip do sprite olhando a direção do input.
        if (inputHorizontal > 0.01f) sprite.flipX = false;
        else if (inputHorizontal < -0.01f) sprite.flipX = true;
    }

    private void FixedUpdate()
    {
        // Ground check: testa círculo nos pés contra a layer Ground.
        noChao = Physics2D.OverlapCircle(pesos.position, raioCheck, layerChao);

        // Coyote time: enquanto está no chão, recarrega o contador.
        if (noChao) contadorCoyote = tempoCoyote;
        else contadorCoyote -= Time.fixedDeltaTime;

        // Movimento horizontal preserva a velocidade vertical (gravidade/pulo).
        rb.linearVelocity = new Vector2(inputHorizontal * velocidade, rb.linearVelocity.y);

        // Pulo combinando coyote + buffer: se ambos estão dentro da janela, pula.
        if (contadorCoyote > 0f && contadorBuffer > 0f)
        {
            rb.linearVelocity = new Vector2(rb.linearVelocity.x, forcaPulo);
            contadorCoyote = 0f;
            contadorBuffer = 0f;
        }
    }

    // Visualização do ground check para debug no editor.
    private void OnDrawGizmosSelected()
    {
        if (pesos == null) return;
        Gizmos.color = noChao ? Color.green : Color.red;
        Gizmos.DrawWireSphere(pesos.position, raioCheck);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Camera 2D simples que segue o player com suavização.
// Cole na Main Camera. Configure 'alvo' arrastando o player no Inspector.
using UnityEngine;

public class CameraSegue2D : MonoBehaviour
{
    [SerializeField] private Transform alvo;
    [SerializeField] private float suavizacao = 0.15f;
    [SerializeField] private Vector2 offset = new Vector2(0f, 1f);

    private Vector3 velocidadeRef = Vector3.zero;

    // LateUpdate roda DEPOIS de Update e FixedUpdate, garantindo que o player
    // já se moveu naquele frame antes da câmera reagir. Sem isso, dá tremida.
    private void LateUpdate()
    {
        if (alvo == null) return;

        Vector3 destino = new Vector3(alvo.position.x + offset.x,
                                      alvo.position.y + offset.y,
                                      transform.position.z);

        // SmoothDamp dá uma suavização agradável, melhor que Lerp para câmera.
        transform.position = Vector3.SmoothDamp(transform.position, destino, ref velocidadeRef, suavizacao);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Plataforma móvel: kinematic que vai e volta entre dois pontos.
// O player fica em cima e é levado junto sem precisar de parenting.
using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class PlataformaMovel : MonoBehaviour
{
    [SerializeField] private Vector2 pontoA;
    [SerializeField] private Vector2 pontoB;
    [SerializeField] private float velocidade = 2f;

    private Rigidbody2D rb;
    private float t;
    private bool indoParaB = true;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
    }

    private void FixedUpdate()
    {
        // Lerp manual entre A e B, alternando direção.
        Vector2 origem = indoParaB ? pontoA : pontoB;
        Vector2 destino = indoParaB ? pontoB : pontoA;

        t += Time.fixedDeltaTime * velocidade / Vector2.Distance(pontoA, pontoB);
        Vector2 nova = Vector2.Lerp(origem, destino, t);

        rb.MovePosition(nova);

        if (t >= 1f) { t = 0f; indoParaB = !indoParaB; }
    }

    private void OnDrawGizmos()
    {
        Gizmos.color = Color.cyan;
        Gizmos.DrawWireSphere(pontoA, 0.2f);
        Gizmos.DrawWireSphere(pontoB, 0.2f);
        Gizmos.DrawLine(pontoA, pontoB);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Coletor de moedas para o player: trigger simples conectado a um sistema de pontos.
using UnityEngine;
using UnityEngine.UI;

public class HUDPontos : MonoBehaviour
{
    public static HUDPontos Instancia;

    [SerializeField] private Text textoPontos;
    private int pontos;

    private void Awake() => Instancia = this;

    public void Adicionar(int v)
    {
        pontos += v;
        if (textoPontos != null) textoPontos.text = $"Pontos: {pontos}";
    }
}

public class MoedaSimples : MonoBehaviour
{
    [SerializeField] private int valor = 1;

    // Player tem Rigidbody2D, então o trigger dispara mesmo a moeda sendo só BoxCollider2D + isTrigger.
    private void OnTriggerEnter2D(Collider2D outro)
    {
        if (!outro.CompareTag("Player")) return;
        HUDPontos.Instancia?.Adicionar(valor);
        Destroy(gameObject);
    }
}`,
      },
    ],
    points: [
      "Capture input em Update e aplique física em FixedUpdate — sempre.",
      "Ground check via OverlapCircle nos pés é mais robusto que detectar via colisão.",
      "Coyote time perdoa pulo se o jogador acabou de sair da plataforma.",
      "Jump buffer perdoa pulo apertado um instante antes de pousar.",
      "Variable jump height: cortar y/2 ao soltar Espaço dá controle fino do salto.",
      "Flip por sprite.flipX preserva animações sem precisar de dois sprites.",
      "Câmera deve seguir o player no LateUpdate para evitar tremida visual.",
      "Plataformas móveis devem ser Kinematic e usar MovePosition em FixedUpdate.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Coyote time, jump buffer e variable jump são as três features mais simples que mais aumentam a sensação de polimento. Implemente desde o protótipo, não deixe para depois.",
      },
      {
        type: "warning",
        content: "Se o player gruda em paredes durante o pulo, é atrito do CapsuleCollider2D contra a parede. Crie um Physics Material 2D com friction = 0 e bounciness = 0 e aplique no collider do player. Problema clássico que confunde até gente experiente.",
      },
      {
        type: "info",
        content: "Para jogos profissionais, considere o pacote Cinemachine para câmera 2D: ele oferece dead zone, look ahead e composer 2D prontos. O CameraSegue2D acima é didático; em produção, prefira Cinemachine.",
      },
    ],
  },
];
