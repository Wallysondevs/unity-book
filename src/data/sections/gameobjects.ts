import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "gameobject-intro",
    section: "gameobjects",
    title: "GameObject: o tijolo de tudo na Unity",
    difficulty: "iniciante",
    subtitle: "Entenda por que tudo na cena é um GameObject e por que ele sozinho não faz nada.",
    intro: `Imagine que você está montando um boneco de Lego. A peça base, aquela plaquinha verde onde você encaixa as outras peças, não tem cor de roupa, não tem cabelo, não tem espada na mão. Ela é só um suporte. Tudo o que faz o boneco ser um pirata, um mago ou um cavaleiro são as peças que você encaixa por cima. Na Unity, o GameObject é exatamente essa plaquinha: um container vazio que existe na cena, ocupa um lugar no espaço e serve para receber comportamentos.

Essa é a primeira ideia que precisa entrar de verdade na sua cabeça antes de qualquer linha de código: um GameObject puro não desenha nada na tela, não colide com nada, não emite som e não responde a input. Se você criar um GameObject vazio (menu GameObject > Create Empty) e apertar Play, absolutamente nada acontece. Ele está lá, tem nome, tem posição, mas é invisível e inerte. Quem dá vida a ele são os Components, as peças de Lego que você encaixa: um MeshRenderer para aparecer, um Collider para colidir, um AudioSource para tocar som, um script seu para reagir ao jogador.

Esse desenho é proposital. A Unity é construída em cima de um padrão chamado Entity-Component, em que um objeto não herda comportamento de uma classe gigante (como em motores antigos onde você fazia "class Inimigo extends Personagem extends Entidade"), e sim ganha comportamento por composição. Quer um inimigo voador que atira? Você pega um GameObject, adiciona um Rigidbody, um Collider, um script de movimentação, um script de tiro. Quer um item colecionável? Mesmo GameObject, mas com Trigger Collider e um script diferente. A flexibilidade vem dessa montagem, não de hierarquia rígida de classes.

Saber disso muda como você pensa o jogo. Em vez de procurar "qual classe de personagem eu uso", você pergunta "que componentes esse personagem precisa?". Cada componente é independente, testável, removível. Se um inimigo está atravessando o chão, você não reescreve o inimigo: você confere o Collider. Se ele não aparece, confere o MeshRenderer e o material. Esse jeito de raciocinar economiza horas de debug e é o que separa quem briga com a Unity de quem flui com ela.`,
    codes: [
      {
        lang: "csharp",
        code: `// Criando um GameObject por código e adicionando componentes nele.
// Cole este script em um GameObject qualquer da cena e aperte Play.
using UnityEngine;

public class CriarGameObject : MonoBehaviour
{
    void Start()
    {
        // 1) Cria um GameObject vazio. Ele aparece na Hierarchy mas é invisivel.
        GameObject vazio = new GameObject("MeuVazio");

        // 2) Posiciona ele em algum lugar do mundo.
        vazio.transform.position = new Vector3(0f, 1f, 0f);

        // 3) Adiciona um componente para ele aparecer (uma esfera primitiva).
        //    AddComponent insere um componente em tempo de execucao.
        vazio.AddComponent<MeshFilter>().mesh =
            GameObject.CreatePrimitive(PrimitiveType.Sphere).GetComponent<MeshFilter>().sharedMesh;
        vazio.AddComponent<MeshRenderer>();

        Debug.Log("Criei o GameObject: " + vazio.name);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Acessando componentes de um GameObject ja existente.
// Anexe este script a um Cube criado pelo menu GameObject > 3D Object > Cube.
using UnityEngine;

public class InspecionarComponentes : MonoBehaviour
{
    void Start()
    {
        // GetComponent<T>() devolve o primeiro componente do tipo T anexado.
        // Se nao existir, devolve null. Sempre confira antes de usar.
        Renderer r = GetComponent<Renderer>();
        if (r != null)
        {
            // Mudando a cor do material instanciado deste objeto.
            r.material.color = Color.red;
        }

        // GetComponents<T>() devolve TODOS os componentes do tipo (em array).
        Component[] todos = GetComponents<Component>();
        foreach (var c in todos)
        {
            Debug.Log("Componente anexado: " + c.GetType().Name);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Ativando e desativando GameObjects e componentes.
// Diferenca importante: SetActive desliga o objeto inteiro;
// .enabled desliga apenas um componente especifico.
using UnityEngine;

public class LigarDesligar : MonoBehaviour
{
    public GameObject alvo;        // arraste outro objeto aqui no Inspector
    public Light luz;              // arraste uma Light aqui

    void Update()
    {
        // Tecla espaco: desliga o GameObject inteiro (some da cena).
        if (Input.GetKeyDown(KeyCode.Space))
        {
            alvo.SetActive(!alvo.activeSelf);
        }

        // Tecla L: desliga apenas o componente Light, o objeto continua existindo.
        if (Input.GetKeyDown(KeyCode.L))
        {
            luz.enabled = !luz.enabled;
        }
    }
}`,
      },
    ],
    points: [
      "GameObject sozinho nao faz nada: ele e um container que recebe Components.",
      "Componentes dao todo o comportamento: render, fisica, audio, scripts.",
      "Composicao supera heranca: monte objetos plugando pecas, nao herdando classes.",
      "AddComponent<T>() adiciona em runtime; GetComponent<T>() acessa o que ja existe.",
      "Sempre cheque se GetComponent retornou null antes de usar.",
      "SetActive(false) desliga o objeto inteiro; .enabled = false desliga so um componente.",
      "Pensar em 'que componentes eu preciso' acelera o debug e o design do jogo.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Se um objeto nao aparece na cena, abra o Inspector e confira se ele tem MeshFilter, MeshRenderer e um Material. Faltando qualquer um dos tres, o objeto fica invisivel. Esse e o erro numero um de quem comeca.",
      },
      {
        type: "warning",
        content: "GetComponent e relativamente custoso para chamar todo frame. Em scripts que rodam dentro de Update, faca o GetComponent uma vez no Awake ou Start, guarde numa variavel e reuse.",
      },
      {
        type: "info",
        content: "Os GameObjects 'vazios' sao tao uteis que voce vai cria-los aos montes: para agrupar objetos na hierarquia, marcar pontos de spawn, servir de pivot para rotacao. Nao e desperdicio, e organizacao.",
      },
    ],
  },
  {
    slug: "transform-component",
    section: "gameobjects",
    title: "Transform: posicao, rotacao e escala",
    difficulty: "iniciante",
    subtitle: "O componente que todo GameObject tem e que define onde ele esta no mundo.",
    intro: `Todo GameObject na Unity tem, obrigatoriamente, um componente chamado Transform. Voce nao consegue remover esse componente nem se quiser. A razao e simples: a Unity precisa saber onde cada coisa esta, para onde esta apontando e qual o tamanho dela. Sem essas tres informacoes, nao tem como desenhar nada na tela. O Transform guarda exatamente esse trio: position, rotation e scale.

Pense numa peca de teatro. Cada ator precisa estar em um lugar do palco (posicao), virado para uma direcao (rotacao) e com um tamanho de figurino que faz sentido para o personagem (escala). O Transform e a marcacao de palco do seu objeto. Alem disso, ele tambem guarda a relacao de pai e filho, ou seja, se um objeto esta 'preso' em outro. Isso permite que, ao mover uma nave, todos os canhoes presos nela se movam junto, sem voce precisar mover cada canhao manualmente.

A pegadinha que confunde quase todo iniciante e a diferenca entre coordenadas locais e coordenadas de mundo. position (com p maiusculo na propriedade pubica chamada position) e a posicao no mundo, em metros, a partir da origem (0, 0, 0). Ja localPosition e a posicao em relacao ao pai. Se um objeto nao tem pai, as duas sao iguais. Mas se ele e filho de outro, mover o pai muda a position do filho mesmo sem voce tocar no Transform do filho. Entender isso evita horas de "porque meu objeto pulou pra longe quando eu o coloquei dentro daquele outro?".

Outra coisa que parece simples mas tem armadilhas e a rotacao. No Inspector, voce ve angulos em graus (Euler), mas internamente a Unity guarda a rotacao como Quaternion, uma estrutura matematica de quatro numeros. Voce raramente vai escrever um Quaternion na mao. Vai usar Quaternion.Euler para converter de graus, ou Quaternion.LookRotation para apontar um objeto para outro. Ja a escala, finalmente, e simples: 1 e tamanho normal, 2 e dobro, 0.5 e metade. Mas escala negativa espelha o objeto e escala nao-uniforme (x diferente de y diferente de z) bagunca a fisica. Manter escala uniforme em (1, 1, 1) sempre que possivel evita dor de cabeca.`,
    codes: [
      {
        lang: "csharp",
        code: `// Movendo, rotacionando e escalando via codigo.
// Anexe a um Cube e veja ele andar, girar e mudar de tamanho.
using UnityEngine;

public class TransformBasico : MonoBehaviour
{
    public float velocidade = 3f;
    public float graus = 90f;

    void Update()
    {
        // Move 3 metros por segundo no eixo X global.
        // Time.deltaTime garante que a velocidade seja igual em qualquer FPS.
        transform.position += new Vector3(velocidade * Time.deltaTime, 0f, 0f);

        // Rotaciona 90 graus por segundo no eixo Y (vertical).
        transform.Rotate(0f, graus * Time.deltaTime, 0f);

        // Faz a escala oscilar entre 0.5 e 1.5 com seno.
        float fator = 1f + 0.5f * Mathf.Sin(Time.time);
        transform.localScale = new Vector3(fator, fator, fator);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Diferenca entre position e localPosition.
// Anexe a um objeto que tem PAI. Veja os dois valores no Console.
using UnityEngine;

public class PosicaoVsLocal : MonoBehaviour
{
    void Start()
    {
        // position: onde estou no mundo, em coordenadas globais.
        Debug.Log("Posicao no mundo: " + transform.position);

        // localPosition: onde estou em relacao ao meu pai.
        // Se nao tenho pai, e igual a position.
        Debug.Log("Posicao local (relativa ao pai): " + transform.localPosition);

        // O mesmo vale para rotacao e escala:
        // rotation x localRotation, lossyScale x localScale.
        Debug.Log("Escala local: " + transform.localScale);
        Debug.Log("Escala global aproximada: " + transform.lossyScale);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Apontando um objeto para outro com LookAt e Quaternion.
using UnityEngine;

public class OlharParaAlvo : MonoBehaviour
{
    public Transform alvo;          // arraste o alvo no Inspector
    public float velocidadeGiro = 5f;

    void Update()
    {
        if (alvo == null) return;

        // Jeito mais simples: olhar instantaneamente para o alvo.
        // transform.LookAt(alvo);

        // Jeito suave: rotacao gradual em direcao ao alvo.
        Vector3 direcao = alvo.position - transform.position;
        Quaternion alvoRot = Quaternion.LookRotation(direcao);
        transform.rotation = Quaternion.Slerp(
            transform.rotation,
            alvoRot,
            velocidadeGiro * Time.deltaTime
        );
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Transform.Translate e a diferenca entre Space.Self e Space.World.
using UnityEngine;

public class MoverEspacos : MonoBehaviour
{
    void Update()
    {
        float h = Input.GetAxis("Horizontal");   // A/D ou setas
        float v = Input.GetAxis("Vertical");     // W/S ou setas

        // Space.Self: move no eixo LOCAL do objeto. Se ele girar, anda na direcao para onde aponta.
        transform.Translate(new Vector3(h, 0f, v) * Time.deltaTime * 5f, Space.Self);

        // Space.World: ignora a rotacao do objeto, anda nos eixos do mundo.
        // transform.Translate(new Vector3(h, 0, v) * Time.deltaTime * 5f, Space.World);
    }
}`,
      },
    ],
    points: [
      "Todo GameObject tem um Transform e voce nao consegue remove-lo.",
      "position e em coordenadas de mundo; localPosition e relativa ao pai.",
      "Use Time.deltaTime ao mover por frame para ficar independente de FPS.",
      "Rotacao interna e Quaternion; use Quaternion.Euler ou LookRotation, nao mexa nos componentes a mao.",
      "Escala uniforme (1,1,1) evita problemas com fisica e iluminacao.",
      "Translate com Space.Self anda no eixo local; com Space.World anda no eixo global.",
      "lossyScale aproxima a escala global quando ha hierarquia com rotacao.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Escala nao-uniforme (por exemplo x=2, y=1, z=1) deforma colliders, prejudica iluminacao e e a maior fonte de bugs visuais. Se precisar achatar um objeto, achate na malha 3D no Blender, nao no Transform.",
      },
      {
        type: "tip",
        content: "Para mover personagens com fisica, evite mexer direto no transform.position. Use rb.MovePosition() no Rigidbody, senao voce atravessa paredes e quebra a deteccao de colisao.",
      },
      {
        type: "info",
        content: "Unity usa o sistema de mao esquerda: X para a direita, Y para cima, Z para frente. Se voce vem do Blender (mao direita, Z para cima), os eixos parecem trocados. Nao e bug, e convencao.",
      },
    ],
  },
  {
    slug: "hierarquia",
    section: "gameobjects",
    title: "A janela Hierarchy: organizando a cena",
    difficulty: "iniciante",
    subtitle: "Como pensar a estrutura da sua cena para nao virar bagunca em duas semanas.",
    intro: `A janela Hierarchy, geralmente do lado esquerdo do editor, lista todos os GameObjects que existem na sua cena atual. Pode parecer apenas uma lista, mas ela e na verdade uma arvore: um GameObject pode conter outros dentro dele, esses podem conter mais, e assim por diante. Essa estrutura em arvore nao e enfeite. Ela define quem se move com quem, quem herda transformacoes de quem e como voce vai encontrar as coisas semanas depois, quando a cena tiver duzentos objetos.

Pense numa cena como o set de um filme. Voce nao espalha lampadas, microfones, atores, moveis e cabos no chao misturados. Voce agrupa: tudo da iluminacao num lado, tudo do som em outro, atores em pe, cenografia montada. A hierarquia da Unity serve para isso. Um GameObject vazio chamado 'Iluminacao' pode conter todas as luzes da cena. Outro chamado 'Inimigos' agrupa cada inimigo. Outro 'UI' contem o canvas e tudo da interface. Esse cuidado parece chato no comeco, mas economiza horas de "onde eu coloquei aquele objeto?".

Alem da organizacao visual, a hierarquia tem efeito tecnico real. Quando voce torna um objeto filho de outro, mover o pai move todos os filhos juntos. Rotacionar o pai rotaciona os filhos em torno do pivot do pai. Desativar o pai com SetActive(false) desativa todos os filhos automaticamente. Isso e poderoso: um helicoptero com dez pecas separadas (corpo, rotor, cauda, trem de pouso) vira um objeto unico do ponto de vista de movimento se voce monta-lo como filhos de um GameObject 'Helicoptero'.

Mas tem cuidado. Hierarquias muito profundas (objetos dentro de objetos dentro de objetos por dez niveis) afetam performance, porque a Unity precisa recalcular as transformacoes do mundo subindo a arvore. Tambem evite agrupar coisas que nao tem relacao funcional so para 'arrumar', porque mover um pai sem querer arrasta tudo. Use pastas (GameObjects vazios) para grupos logicos, mas mantenha a arvore razoavelmente rasa, idealmente nao mais que 4 ou 5 niveis em jogos comuns.`,
    codes: [
      {
        lang: "csharp",
        code: `// Encontrando objetos na hierarquia por nome ou tag.
using UnityEngine;

public class EncontrarObjetos : MonoBehaviour
{
    void Start()
    {
        // Find percorre TODA a cena procurando por nome. E lento.
        // Use so em Start/Awake, nunca dentro de Update.
        GameObject jogador = GameObject.Find("Player");

        // FindWithTag e mais rapido que Find por nome.
        GameObject inimigo = GameObject.FindWithTag("Enemy");

        // FindGameObjectsWithTag retorna um array com todos.
        GameObject[] coletaveis = GameObject.FindGameObjectsWithTag("Coin");
        Debug.Log("Encontrei " + coletaveis.Length + " moedas na cena.");

        // Buscar dentro de um filho especifico, por caminho.
        Transform arma = transform.Find("Arma/Cano/Mira");
        if (arma != null) Debug.Log("Mira em: " + arma.position);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Iterando filhos de um GameObject.
// Util para aplicar algo em todos os pedacos de um objeto montado.
using UnityEngine;

public class PintarFilhos : MonoBehaviour
{
    public Color cor = Color.cyan;

    void Start()
    {
        // foreach em transform itera os filhos diretos.
        foreach (Transform filho in transform)
        {
            Renderer r = filho.GetComponent<Renderer>();
            if (r != null) r.material.color = cor;
        }

        // GetComponentsInChildren tambem encontra netos, bisnetos etc.
        Renderer[] todos = GetComponentsInChildren<Renderer>();
        Debug.Log("Total de Renderers na arvore: " + todos.Length);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Criando 'pastas' organizadoras por codigo.
// Util quando voce instancia muitos objetos em runtime e quer mante-los agrupados.
using UnityEngine;

public class OrganizadorDeSpawn : MonoBehaviour
{
    public GameObject prefab;
    private Transform pasta;

    void Start()
    {
        // Cria um GameObject vazio so para servir de pasta.
        pasta = new GameObject("InimigosSpawned").transform;

        for (int i = 0; i < 10; i++)
        {
            GameObject inst = Instantiate(prefab);
            inst.transform.position = new Vector3(i * 2f, 0f, 0f);
            // Coloca o instanciado dentro da pasta para nao poluir a Hierarchy.
            inst.transform.SetParent(pasta);
        }
    }
}`,
      },
    ],
    points: [
      "A Hierarchy e uma arvore: pais movem filhos, desativam filhos, rotacionam filhos.",
      "Use GameObjects vazios como 'pastas' para agrupar por funcao (Inimigos, UI, Luzes).",
      "Profundidade alta de hierarquia custa performance; tente manter ate 4 ou 5 niveis.",
      "GameObject.Find e lento; chame so em Awake/Start ou cacheie a referencia.",
      "FindWithTag e mais rapido que Find por nome.",
      "GetComponentsInChildren varre toda a subarvore, nao so filhos diretos.",
      "Instantiate sem parent joga na raiz da cena; sempre defina SetParent quando agrupar.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Nunca use GameObject.Find dentro de Update. Cada chamada percorre a cena inteira. Em cenas grandes isso destroi o FPS. Cacheie a referencia uma vez no Start.",
      },
      {
        type: "tip",
        content: "Crie uma convencao de nomes desde o primeiro dia: prefixos como 'UI_', 'ENV_', 'NPC_' fazem milagre. Sua Hierarchy buscavel agradece e o time tambem.",
      },
    ],
  },
  {
    slug: "prefabs",
    section: "gameobjects",
    title: "Prefabs: o blueprint reutilizavel",
    difficulty: "iniciante",
    subtitle: "Como salvar um GameObject configurado para usar centenas de vezes sem refazer tudo.",
    intro: `Imagine que voce passou duas horas montando um inimigo perfeito: malha 3D, animacao, colisor, script de IA, particulas de morte, som. Funciona lindo. Agora voce precisa colocar trinta desses inimigos em dez fases diferentes. Voce vai duplicar o objeto trinta vezes em cada fase? E quando descobrir um bug no script da IA, vai abrir cada uma das trezentas copias para corrigir? Obviamente nao. Para resolver esse problema, a Unity oferece os Prefabs.

Um Prefab e uma especie de molde, ou planta arquitetonica, de um GameObject. Voce monta o objeto uma vez, salva como Prefab arrastando da Hierarchy para a pasta Project, e a partir dali pode instanciar quantas copias quiser, em quantas cenas quiser. O detalhe que muda tudo: as copias mantem um vinculo com o Prefab original. Se voce edita o Prefab (mudando o dano do inimigo, por exemplo), todas as copias na cena recebem a alteracao automaticamente. E o ganho de produtividade que faz Unity ser viavel para projetos grandes.

A analogia perfeita e a de uma fabrica. O Prefab e o molde de injecao plastica; cada instancia e uma peca saida da fabrica. Voce pode pintar uma peca de azul (sobrescrevendo um valor naquela copia especifica), mas o molde continua sendo o original. Inclusive da pra fazer 'Apply Overrides' para promover uma alteracao da copia para o Prefab pai, ou 'Revert' para descartar mudancas locais e voltar ao padrao.

Use Prefabs para: inimigos, projeteis, itens coletaveis, pedacos de cenario que se repetem (arvores, caixotes, casas), botoes de UI, particulas de efeito, NPCs. Nao use Prefab para coisas verdadeiramente unicas como o terreno principal de uma fase ou a camera principal, embora mesmo essas as vezes virem Prefabs em projetos grandes para padronizar entre cenas. A regra simples: se voce ja se viu copiando e colando, vire Prefab.`,
    codes: [
      {
        lang: "csharp",
        code: `// Instanciando um Prefab via codigo.
// 1. Crie um GameObject configurado, arraste para a pasta Project para virar Prefab.
// 2. Anexe este script a um objeto vazio na cena.
// 3. Arraste o Prefab no campo 'projetil' do Inspector.
using UnityEngine;

public class AtirarProjetil : MonoBehaviour
{
    public GameObject projetilPrefab;   // arraste o Prefab aqui
    public float forcaTiro = 20f;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.F))
        {
            // Instantiate cria uma copia do Prefab na cena.
            // Parametros: prefab, posicao, rotacao.
            GameObject p = Instantiate(
                projetilPrefab,
                transform.position + transform.forward,
                transform.rotation
            );

            // Empurra o projetil para frente, se ele tiver Rigidbody.
            Rigidbody rb = p.GetComponent<Rigidbody>();
            if (rb != null) rb.AddForce(transform.forward * forcaTiro, ForceMode.Impulse);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Detectando se um objeto na cena e instancia de um Prefab (Editor only).
// Util para validar setup antes de buildar.
#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;

public class CheckPrefab : MonoBehaviour
{
    [ContextMenu("Verificar")]
    void Verificar()
    {
        // Em runtime as APIs de PrefabUtility nao existem;
        // por isso encapsulamos em UNITY_EDITOR.
        var status = PrefabUtility.GetPrefabAssetType(gameObject);
        Debug.Log("Tipo de Prefab: " + status);

        // GetCorrespondingObjectFromSource devolve o asset original do Prefab.
        Object original = PrefabUtility.GetCorrespondingObjectFromSource(gameObject);
        if (original != null)
            Debug.Log("Veio do Prefab: " + original.name);
        else
            Debug.Log("Este objeto NAO e instancia de Prefab.");
    }
}
#endif`,
      },
      {
        lang: "csharp",
        code: `// Pool simples de Prefabs: reutilizar instancias em vez de Instantiate/Destroy toda hora.
// Ideal para projeteis, particulas, qualquer coisa criada aos montes.
using System.Collections.Generic;
using UnityEngine;

public class PoolDeProjeteis : MonoBehaviour
{
    public GameObject prefab;
    public int tamanho = 20;
    private Queue<GameObject> pool = new Queue<GameObject>();

    void Awake()
    {
        // Cria as copias logo no comeco e desativa.
        for (int i = 0; i < tamanho; i++)
        {
            GameObject g = Instantiate(prefab);
            g.SetActive(false);
            pool.Enqueue(g);
        }
    }

    public GameObject Pegar(Vector3 pos, Quaternion rot)
    {
        // Pega da fila, posiciona, ativa.
        GameObject g = pool.Dequeue();
        g.transform.SetPositionAndRotation(pos, rot);
        g.SetActive(true);
        return g;
    }

    public void Devolver(GameObject g)
    {
        // Em vez de Destroy, desativa e volta para a fila.
        g.SetActive(false);
        pool.Enqueue(g);
    }
}`,
      },
    ],
    points: [
      "Prefab e o molde; cada instancia na cena mantem vinculo com o molde.",
      "Editou o Prefab, todas as instancias atualizam automaticamente.",
      "Sobrescritas locais (Override) personalizam uma instancia sem quebrar o vinculo.",
      "Apply promove a sobrescrita para o Prefab; Revert descarta a sobrescrita.",
      "Instantiate(prefab, pos, rot) cria uma copia na cena por codigo.",
      "Para coisas criadas aos montes (balas, particulas), use Object Pooling.",
      "Se voce ja copia-colou um GameObject mais de duas vezes, transforme em Prefab.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Nao confunda 'Prefab Asset' (o arquivo .prefab) com 'Prefab Instance' (a copia na cena). Mexer no asset altera todas as instancias; mexer numa instancia cria overrides locais.",
      },
      {
        type: "tip",
        content: "Use 'Open Prefab' (botao no topo do Inspector quando voce seleciona uma instancia) para editar o Prefab em modo isolado. Isso evita criar overrides sem querer.",
      },
      {
        type: "danger",
        content: "Instantiate e Destroy sao caros em loop. Em jogos com muitos projeteis ou particulas, sempre prefira Object Pooling. Senao seu jogo vai gaguejar quando o Garbage Collector rodar.",
      },
    ],
  },
  {
    slug: "prefab-variants",
    section: "gameobjects",
    title: "Prefab Variants: variacoes sem duplicar",
    difficulty: "intermediario",
    subtitle: "Como criar versoes especializadas de um Prefab base sem quebrar a heranca.",
    intro: `Suponha que voce tem um Prefab chamado Inimigo, com 100 HP, velocidade 5 e dano 10. Agora voce quer um InimigoElite com 300 HP, e um InimigoFraco com 50 HP. As outras coisas (mesh, colliders, IA) sao iguais. Voce poderia duplicar o Prefab tres vezes, mas ai perde a heranca: se um dia voce mudar o script de IA, vai ter que mudar nas tres copias, exatamente o problema que o Prefab veio resolver. A solucao da Unity para isso se chama Prefab Variant.

Um Prefab Variant e um Prefab que herda de outro Prefab. Pense em heranca de classes em programacao: a Variant e como uma subclasse, sobrescreve so o que e diferente e mantem ligacao com o Prefab pai. Se voce muda o pai (digamos, ajusta a velocidade base de 5 para 6), todas as Variants herdam a mudanca, exceto naqueles campos especificos que cada Variant decidiu sobrescrever.

Para criar uma Variant, basta arrastar um Prefab existente para dentro da pasta Project e escolher 'Prefab Variant' no menu que aparece. Voce ganha um novo asset que aparece com um icone azul claro (em vez do azul escuro do Prefab normal). Edite as propriedades que devem mudar e pronto: tudo que nao foi tocado continua linkado ao pai.

Use Variants quando: voce tem famílias de objetos parecidos (varios tipos de inimigo, varios tipos de carro, varias dificuldades de chefao, varias cores de power-up). Nao use Variant para coisas radicalmente diferentes que so compartilham o mesmo modelo 3D, porque acaba virando uma teia de overrides confusa. Quando comecar a sobrescrever mais de 60 ou 70 por cento dos campos, e sinal de que talvez seja melhor um Prefab independente.`,
    codes: [
      {
        lang: "csharp",
        code: `// Configurando dados de inimigo num MonoBehaviour para usar com Variants.
// O Prefab base define os valores padrao; cada Variant sobrescreve no Inspector.
using UnityEngine;

public class StatsInimigo : MonoBehaviour
{
    [Header("Atributos base")]
    public int hpMaximo = 100;
    public float velocidade = 5f;
    public int dano = 10;

    [Header("Visual")]
    public Color corCorpo = Color.white;

    private int hpAtual;

    void Start()
    {
        hpAtual = hpMaximo;

        // Aplica a cor no Renderer (cada Variant pode ter cor diferente).
        Renderer r = GetComponent<Renderer>();
        if (r != null) r.material.color = corCorpo;

        Debug.Log(name + " spawnou com " + hpMaximo + " HP.");
    }

    public void Receber(int dmg)
    {
        hpAtual -= dmg;
        if (hpAtual <= 0) Destroy(gameObject);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Spawner que escolhe entre varias Variants.
// Arraste no Inspector os tres Prefabs (base, Elite, Fraco).
using UnityEngine;

public class SpawnerInimigos : MonoBehaviour
{
    public GameObject inimigoNormal;     // Prefab base
    public GameObject inimigoElite;      // Variant 'Elite'
    public GameObject inimigoFraco;      // Variant 'Fraco'

    public Transform[] pontosSpawn;

    void Start()
    {
        // Spawn de tres tipos diferentes, cada um na sua posicao.
        Instantiate(inimigoNormal, pontosSpawn[0].position, Quaternion.identity);
        Instantiate(inimigoElite,  pontosSpawn[1].position, Quaternion.identity);
        Instantiate(inimigoFraco,  pontosSpawn[2].position, Quaternion.identity);

        // Como todos compartilham o mesmo script StatsInimigo,
        // o jogo trata todos da mesma forma, mas com valores diferentes.
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Detectando overrides em um Prefab Variant (Editor only).
#if UNITY_EDITOR
using UnityEngine;
using UnityEditor;

public class ListarOverrides : MonoBehaviour
{
    [ContextMenu("Listar overrides")]
    void Listar()
    {
        // Pega a lista de propriedades que esta instancia sobrescreve.
        var overrides = PrefabUtility.GetObjectOverrides(gameObject);
        Debug.Log("Overrides nesta instancia: " + overrides.Count);

        foreach (var ov in overrides)
        {
            Debug.Log("- Override em: " + ov.instanceObject.name);
        }
    }
}
#endif`,
      },
    ],
    points: [
      "Variant e um Prefab que herda de outro Prefab, como subclasse herda de superclasse.",
      "Crie arrastando um Prefab para dentro do Project e escolhendo 'Prefab Variant'.",
      "Edite so o que e diferente; o resto continua sincronizado com o pai.",
      "Mudancas no Prefab base se propagam para todas as Variants, exceto onde houve override.",
      "Use Variants para familias de objetos parecidos (tipos de inimigo, niveis de item).",
      "Variant com sobrescrita de 70%+ vira bagunca; nesse caso faca Prefab independente.",
      "O icone azul claro no Project diferencia Variants de Prefabs normais (azul escuro).",
    ],
    alerts: [
      {
        type: "tip",
        content: "Quando criar uma familia de inimigos, comece pelo Prefab base com valores 'medio'. Variants para forte e fraco sobrescrevem so HP, dano e velocidade. Mudancas de logica ficam num lugar so.",
      },
      {
        type: "warning",
        content: "Removendo um componente herdado do Prefab base numa Variant, voce cria um override do tipo 'Removed Component'. Isso confunde quando outra pessoa olha. Documente bem ou evite remover; prefira desativar.",
      },
    ],
  },
  {
    slug: "tags-layers",
    section: "gameobjects",
    title: "Tags e Layers: rotular para encontrar e filtrar",
    difficulty: "iniciante",
    subtitle: "Diferenca crucial: Tags sao rotulos para codigo; Layers afetam fisica e renderizacao.",
    intro: `No topo do Inspector, ao selecionar qualquer GameObject, voce ve dois campos pequenos que muita gente ignora: Tag e Layer. Os dois servem para 'classificar' objetos, mas tem propositos completamente diferentes, e confundir os dois e fonte classica de bugs em projetos iniciantes. Vamos separar bem o que e cada um.

Uma Tag e um rotulo de texto que voce coloca no objeto so para o seu codigo achar ele facilmente. Tags sao usadas em buscas tipo GameObject.FindWithTag('Player') ou em comparacoes tipo if (other.CompareTag('Enemy')). Voce pode criar quantas Tags quiser, com nomes que fazem sentido para o seu jogo. Tags nao afetam fisica, nao afetam renderizacao, nao afetam nada do motor. Sao puramente conveniencia para o seu codigo.

Layer ja e outra historia. Layer e um numero (de 0 a 31, no maximo 32 layers) que classifica o objeto para o motor decidir coisas tecnicas, principalmente: quem colide com quem (Physics > Layer Collision Matrix), quem e desenhado por qual camera (Culling Mask) e quem e iluminado por qual luz. Por exemplo, voce pode ter uma layer 'IgnoreRaycast' para projeteis nao acertarem o proprio atirador, ou uma layer 'UI' que so a Camera de UI desenha. Mexer em Layer afeta o jogo de verdade, no nivel da engine.

Erro comum: usar Tag para fazer fisica seletiva ('quero que essa caixa colida so com o player'). Isso e funcao de Layer, nao de Tag. Outro erro: usar Layer para identificar tipo de objeto no codigo. Funciona, mas voce esta gastando uma das 32 vagas preciosas com algo que uma Tag resolve. Regra: Tag para identificar no codigo, Layer para a engine fazer trabalho de fisica e camera.`,
    codes: [
      {
        lang: "csharp",
        code: `// Usando Tag para identificar quem colidiu.
// 1. No Inspector, mude a Tag do jogador para 'Player' (crie a Tag se nao existir).
// 2. Anexe este script a uma area com Trigger Collider.
using UnityEngine;

public class ZonaDeCura : MonoBehaviour
{
    void OnTriggerEnter(Collider other)
    {
        // CompareTag e mais rapido e seguro do que other.tag == "Player".
        // Tambem nao gera erro se a Tag nao existir.
        if (other.CompareTag("Player"))
        {
            Debug.Log("Player entrou na zona de cura.");
            // Aqui voce chamaria other.GetComponent<Saude>().Curar(20);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Usando Layer para Raycast seletivo.
// Imagine: voce quer um raio que so detecte inimigos, ignorando paredes e o proprio atirador.
using UnityEngine;

public class RaycastSeletivo : MonoBehaviour
{
    public float alcance = 100f;

    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            // LayerMask.GetMask aceita os nomes das layers (configuradas em Project Settings).
            int mascaraInimigos = LayerMask.GetMask("Enemy");

            RaycastHit hit;
            // O ultimo parametro e o LayerMask: so detecta colliders nessas layers.
            if (Physics.Raycast(transform.position, transform.forward, out hit, alcance, mascaraInimigos))
            {
                Debug.Log("Inimigo atingido: " + hit.collider.name);
            }
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Mudando a Layer de um objeto e de todos os seus filhos via codigo.
using UnityEngine;

public class TrocarLayer : MonoBehaviour
{
    public string novaLayer = "IgnoreRaycast";

    void Start()
    {
        // Layer e indexada por numero. Pegamos o numero pelo nome.
        int layerIndex = LayerMask.NameToLayer(novaLayer);
        if (layerIndex < 0)
        {
            Debug.LogWarning("Layer nao existe: " + novaLayer);
            return;
        }

        AplicarRecursivo(transform, layerIndex);
    }

    void AplicarRecursivo(Transform t, int layer)
    {
        t.gameObject.layer = layer;
        foreach (Transform filho in t)
        {
            AplicarRecursivo(filho, layer);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Camera com Culling Mask: desenhar so certas Layers.
// Util para minimapa, viseira de mira, ou separar UI.
using UnityEngine;

public class ConfigurarCamera : MonoBehaviour
{
    void Start()
    {
        Camera cam = GetComponent<Camera>();

        // Culling Mask e um bitmask das layers visiveis.
        // Aqui dizemos: SO desenhe a layer 'Minimap'.
        cam.cullingMask = 1 << LayerMask.NameToLayer("Minimap");

        // Para varias layers ao mesmo tempo, combine com OR (|):
        // cam.cullingMask = (1 << LayerMask.NameToLayer("Default"))
        //                 | (1 << LayerMask.NameToLayer("UI"));
    }
}`,
      },
    ],
    points: [
      "Tag = rotulo de texto para o seu codigo encontrar/comparar objetos.",
      "Layer = numero (0 a 31) usado pela engine para fisica, raycast e camera.",
      "Use CompareTag em vez de == \"X\" (mais rapido e seguro).",
      "Layer Collision Matrix em Project Settings define quais layers colidem entre si.",
      "Camera.cullingMask filtra quais layers aquela camera desenha.",
      "LayerMask em Raycast filtra contra quais layers o raio acerta.",
      "Mudar layer de um objeto NAO muda dos filhos automaticamente; faca recursivamente.",
      "Voce tem so 32 layers no projeto inteiro. Use com criterio.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Comparar com other.tag == \"Player\" gera lixo (alocacao de string) e quebra silenciosamente se a Tag nao existe. Sempre use CompareTag.",
      },
      {
        type: "info",
        content: "A Layer Collision Matrix fica em Edit > Project Settings > Physics. Desmarcar uma celula faz objetos das duas layers passarem um pelo outro como fantasma. Otimo para projetil ignorar o atirador.",
      },
      {
        type: "tip",
        content: "Reserve cedo as Layers 'Player', 'Enemy', 'Ground', 'UI' e 'IgnoreRaycast'. Esse conjunto basico cobre 90% dos jogos e evita refatoracoes chatas mais tarde.",
      },
    ],
  },
  {
    slug: "parent-child",
    section: "gameobjects",
    title: "Parent e Child: amarrando objetos",
    difficulty: "iniciante",
    subtitle: "Como mover, agrupar e desagrupar objetos em runtime sem quebrar a posicao.",
    intro: `A relacao de pai e filho na Unity e simples de visualizar mas tem detalhes finos que pegam todo iniciante. Quando um GameObject vira filho de outro, ele passa a 'andar junto' com o pai: se o pai mover dois metros para a direita, o filho vai junto. Se o pai girar, o filho gira em torno do pivot do pai. Se o pai for desativado, o filho some junto. Essa relacao se monta visualmente arrastando um objeto para cima de outro na Hierarchy, ou via codigo com SetParent.

Pense numa moto. O guidao, o tanque, o motor, as rodas, o assento sao pecas separadas, mas voce nao quer mover cada uma quando o jogador pilota. Voce monta tudo como filho de um GameObject 'Moto' e move so a Moto. As pecas seguem. Esse conceito e a base para construir personagens articulados, veiculos, qualquer coisa montada em pecas.

Aqui aparece a primeira pegadinha: ao mudar o pai de um objeto, a posicao 'visual' dele pode pular. Por que? Porque a position dele estava sendo calculada relativa ao pai antigo, e agora vai ser relativa ao novo pai. A Unity te oferece controle: SetParent(novoPai) muda o pai e mantem a posicao no mundo (pulo zero). SetParent(novoPai, false) muda o pai e mantem a posicao local (pode pular visualmente). Saber qual usar depende do que voce quer.

Outro ponto: tornar algo filho nao 'cola' fisicamente. Se os dois tem Rigidbody, um pode ainda atravessar o outro. Para juntar fisicamente use Joint (FixedJoint, HingeJoint). Parent serve para hierarquia logica e visual, nao para simular conexao mecanica. Em jogos de plataforma, e comum tornar o player filho da plataforma movel quando ele pousa nela, para ele andar junto sem escorregar. Ai voce solta no jump (SetParent(null)).`,
    codes: [
      {
        lang: "csharp",
        code: `// Mudando de pai por codigo.
using UnityEngine;

public class GrudarNoPai : MonoBehaviour
{
    public Transform novoPai;

    void Start()
    {
        // SetParent(novoPai) por padrao MANTEM a posicao no mundo.
        // O objeto nao 'pula' visualmente; localPosition e ajustada.
        transform.SetParent(novoPai);

        // Se quisesse zerar localPosition (alinhar com o novo pai), passaria false:
        // transform.SetParent(novoPai, false);
        // Atencao: isso pode fazer o objeto pular para a posicao do pai.
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Plataforma movel: gruda o player ao pousar, solta ao pular.
// Anexe este script a uma plataforma com Trigger Collider em cima.
using UnityEngine;

public class PlataformaMovel : MonoBehaviour
{
    void OnTriggerEnter(Collider other)
    {
        // Quando o player encosta em cima, vira filho da plataforma.
        if (other.CompareTag("Player"))
        {
            other.transform.SetParent(transform);
            Debug.Log("Player grudado na plataforma.");
        }
    }

    void OnTriggerExit(Collider other)
    {
        // Quando sai (pulou ou caiu), desvincula.
        if (other.CompareTag("Player"))
        {
            other.transform.SetParent(null);
            Debug.Log("Player solto da plataforma.");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Iterando filhos com seguranca, inclusive removendo.
using UnityEngine;

public class LimparFilhos : MonoBehaviour
{
    [ContextMenu("Destruir todos os filhos")]
    void DestruirTodos()
    {
        // CUIDADO: nao da pra destruir enquanto itera o foreach direto,
        // porque a lista muda no meio da iteracao.
        // Faca em loop reverso ou colete primeiro.

        for (int i = transform.childCount - 1; i >= 0; i--)
        {
            // Em runtime use Destroy. No Editor, use DestroyImmediate.
            Destroy(transform.GetChild(i).gameObject);
        }
    }

    [ContextMenu("Listar filhos")]
    void Listar()
    {
        Debug.Log("Tenho " + transform.childCount + " filhos diretos.");
        foreach (Transform filho in transform)
        {
            Debug.Log("- " + filho.name);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Acessando o pai e ancestrais.
using UnityEngine;

public class ConsultarPai : MonoBehaviour
{
    void Start()
    {
        // transform.parent e o pai direto (ou null se nao tem).
        if (transform.parent != null)
            Debug.Log("Meu pai: " + transform.parent.name);
        else
            Debug.Log("Sou raiz da hierarquia.");

        // root sobe ate o topo da arvore.
        Debug.Log("Raiz da hierarquia: " + transform.root.name);

        // GetComponentInParent procura na cadeia de pais.
        Rigidbody rbDoVeiculo = GetComponentInParent<Rigidbody>();
        if (rbDoVeiculo != null)
            Debug.Log("Estou anexado a um corpo fisico chamado " + rbDoVeiculo.name);
    }
}`,
      },
    ],
    points: [
      "Filho herda movimento, rotacao e ativacao do pai.",
      "SetParent(p) mantem posicao no mundo; SetParent(p, false) mantem posicao local.",
      "Hierarquia nao e conexao fisica: para juntar corpos use Joint.",
      "transform.parent e o pai direto; transform.root e o ancestral mais alto.",
      "GetComponentInParent sobe a arvore procurando o componente.",
      "Para destruir filhos em loop, percorra de tras para frente para nao quebrar a iteracao.",
      "Plataformas moveis funcionam grudando o player como filho temporario ao pousar.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Mudar pai de um objeto com Rigidbody pode bagunca a fisica, especialmente se a hierarquia tem escala nao-uniforme. Quando precisar mover fisica em uma plataforma, considere alternativas como velocity adicional em vez de virar filho.",
      },
      {
        type: "tip",
        content: "Evite virar pai/filho dentro de loops por frame. SetParent reorganiza buffers internos da Unity e custa mais que mover. Faca so em eventos discretos (entrar na plataforma, soltar).",
      },
    ],
  },
  {
    slug: "instanciar-destruir",
    section: "gameobjects",
    title: "Instantiate e Destroy: criando e removendo na hora",
    difficulty: "iniciante",
    subtitle: "Como spawnar objetos em runtime e por que destruir cedo demais e fonte de bugs.",
    intro: `Ate agora voce viu objetos que ja existem na cena ao apertar Play. Mas em quase todo jogo de verdade, objetos aparecem e desaparecem a todo momento: o jogador atira um projetil novo, um inimigo morre, uma moeda spawna, um item e coletado. Para isso a Unity oferece dois metodos centrais: Instantiate, que cria uma copia de algo (geralmente um Prefab); e Destroy, que remove um objeto da cena.

Instantiate parece simples na superficie: voce passa um Prefab e ele aparece. Mas tem nuances. Voce pode passar tambem posicao e rotacao iniciais. Pode passar um Transform pai para ja nascer dentro de uma 'pasta'. A copia recem-criada e um GameObject totalmente independente: alterar ela nao altera o Prefab original, e vice-versa. Cada Instantiate aloca memoria e roda os Awake/OnEnable dos componentes da copia, entao chamar Instantiate centenas de vezes por segundo afeta performance.

Destroy e a outra ponta. Quando voce chama Destroy(obj), o objeto nao some imediatamente. A Unity marca ele para destruicao e remove no fim do frame atual. Isso e proposital: se um script esta no meio de algo importante, derrubar o objeto na hora poderia gerar erro. Voce pode passar um delay (Destroy(obj, 2f)) para destruir depois de 2 segundos, util para projeteis que somem sozinhos. Para forcar destruicao imediata (raro, geralmente em editor), existe DestroyImmediate, mas ele e perigoso e nao deve ser usado em runtime.

A pegadinha classica: depois de Destroy, a referencia que voce tinha aponta para um 'objeto fantasma'. Em C#, ela parece ser != null, mas a Unity sobrecarrega o operador para te dizer que ja foi destruido. Sempre cheque if (obj != null) antes de mexer numa referencia que pode ter sido destruida. Outra armadilha: Destroy/Instantiate em loop apertado e o caminho mais rapido para gaguejar o jogo. Se voce cria e destroi muitas balas, vire para Object Pool.`,
    codes: [
      {
        lang: "csharp",
        code: `// Spawnando varias copias de um Prefab em volta da posicao do script.
using UnityEngine;

public class SpawnerSimples : MonoBehaviour
{
    public GameObject prefab;
    public int quantidade = 10;
    public float raio = 5f;

    void Start()
    {
        for (int i = 0; i < quantidade; i++)
        {
            // Posicao aleatoria dentro de um circulo no plano XZ.
            Vector2 ponto = Random.insideUnitCircle * raio;
            Vector3 pos = transform.position + new Vector3(ponto.x, 0f, ponto.y);

            // Rotacao aleatoria so no eixo Y.
            Quaternion rot = Quaternion.Euler(0f, Random.Range(0f, 360f), 0f);

            // Instancia e ja organiza como filho deste spawner.
            Instantiate(prefab, pos, rot, transform);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Projetil que se autodestroi depois de um tempo.
// Anexe a um Prefab de bala que tenha Rigidbody.
using UnityEngine;

public class ProjetilTimer : MonoBehaviour
{
    public float tempoVida = 3f;        // segundos ate desaparecer
    public int dano = 15;

    void Start()
    {
        // Marca este objeto para destruicao depois de N segundos.
        Destroy(gameObject, tempoVida);
    }

    void OnCollisionEnter(Collision col)
    {
        // Tenta encontrar o componente de saude no que foi atingido.
        var alvo = col.gameObject.GetComponent<StatsInimigo>();
        if (alvo != null)
        {
            alvo.Receber(dano);
        }
        // Bala e destruida ao acertar qualquer coisa.
        Destroy(gameObject);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Verificando se um objeto ainda existe antes de usa-lo.
using UnityEngine;

public class VerificarReferencia : MonoBehaviour
{
    public GameObject alvo;     // pode ser destruido por outro script

    void Update()
    {
        // Sempre cheque a referencia antes de acessar.
        // Se Destroy foi chamado, a Unity faz com que '== null' devolva true,
        // mesmo que tecnicamente o C# ainda guarde o ponteiro.
        if (alvo == null)
        {
            Debug.Log("O alvo ja foi destruido, parando aqui.");
            enabled = false;
            return;
        }

        // Aqui podemos usar alvo com seguranca.
        transform.LookAt(alvo.transform);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Spawnar com cooldown: cria um a cada X segundos.
using UnityEngine;

public class SpawnerComCooldown : MonoBehaviour
{
    public GameObject prefab;
    public float intervalo = 1.5f;

    private float proximoSpawn;

    void Update()
    {
        // Time.time conta segundos desde o inicio do jogo.
        if (Time.time >= proximoSpawn)
        {
            Instantiate(prefab, transform.position, Quaternion.identity);
            proximoSpawn = Time.time + intervalo;
        }
    }
}`,
      },
    ],
    points: [
      "Instantiate cria uma copia independente; o Prefab original nao muda.",
      "Sobrecargas aceitam posicao, rotacao e Transform pai opcionais.",
      "Destroy nao remove na hora: ele marca para remover no fim do frame.",
      "Destroy(obj, t) destroi depois de t segundos, otimo para projeteis.",
      "Apos Destroy, a referencia compara como == null mesmo que o ponteiro exista.",
      "Sempre cheque if (obj != null) antes de mexer em algo que pode ter sido destruido.",
      "Instantiate e Destroy em loop pesado causam stutter; troque por Object Pool.",
      "DestroyImmediate so em scripts de Editor; nunca em runtime de jogo.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Garbage Collector da Unity pausa o jogo por alguns milisegundos quando ha muito lixo. Cada Instantiate aloca memoria; cada Destroy gera lixo. Em jogos com muitos spawns, Pool nao e luxo, e necessidade.",
      },
      {
        type: "tip",
        content: "Quando um Prefab nao spawna, primeiro confira se a referencia no Inspector esta preenchida. Erro 'Object reference not set' aqui sempre e Prefab faltando arrastado, em 95% das vezes.",
      },
      {
        type: "info",
        content: "Awake do Prefab roda na hora do Instantiate, antes mesmo do Start. Se voce precisa configurar valores antes do Awake rodar, instancie desativado: Instantiate, configure, depois SetActive(true).",
      },
    ],
  },
  {
    slug: "scriptable-objects-intro",
    section: "gameobjects",
    title: "ScriptableObjects: dados que vivem fora da cena",
    difficulty: "intermediario",
    subtitle: "Por que guardar configuracao em assets reutilizaveis muda o jeito de pensar dados no jogo.",
    intro: `Ate aqui voce guardou tudo dentro de MonoBehaviours: o HP do inimigo, o dano da arma, a velocidade do carro. Funciona, mas tem um problema. Se voce tem 50 inimigos do mesmo tipo na cena, cada um carrega sua propria copia dos valores. Se quiser balancear o dano de todos, precisa editar 50 lugares. Pior: esses valores so existem enquanto o GameObject existe; nao da para reaproveitar entre cenas, entre projetos ou ate entre Prefabs facilmente. A solucao elegante da Unity para isso e o ScriptableObject.

Um ScriptableObject e uma classe que herda de ScriptableObject (em vez de MonoBehaviour) e gera um asset na pasta Project, igual a uma textura ou um material. Ele guarda dados, mas nao precisa estar em GameObject nenhum. Voce cria ele uma vez, edita os valores no Inspector, e referencia esse mesmo asset em quantos lugares quiser. Mudou o asset, todos os scripts que apontam para ele ja veem o novo valor instantaneamente, em runtime e fora dele.

Pense num cardapio de restaurante. Cada prato (objeto fisico) e diferente, mas a receita (dados: ingredientes, modo de fazer, preco) e uma so, escrita uma unica vez no caderno. Os GameObjects sao os pratos servidos; o ScriptableObject e a receita no caderno. Mudar a receita altera todos os pratos futuros sem voce ter que reescrever em cada cozinha.

Use ScriptableObjects para: configuracao de armas (dano, cadencia, alcance), tipos de inimigo (stats, behavior tree, drops), itens de inventario (icone, nome, descricao), niveis de dificuldade, configuracoes globais. Nao use para guardar ESTADO de jogo em runtime (HP atual de um inimigo especifico, posicao do player), porque o asset persiste entre sessoes e voce vai ter dados misturados. Use para dados de design, nao para estado dinamico. Esse padrao destrava arquitetura de jogos data-driven, em que designers editam comportamento sem tocar em codigo.`,
    codes: [
      {
        lang: "csharp",
        code: `// Definindo um ScriptableObject para dados de Arma.
// Cole este script em um arquivo ArmaData.cs dentro da pasta Scripts.
using UnityEngine;

// CreateAssetMenu adiciona uma entrada no menu Assets > Create > Jogo > Nova Arma.
[CreateAssetMenu(fileName = "NovaArma", menuName = "Jogo/Arma", order = 0)]
public class ArmaData : ScriptableObject
{
    [Header("Identidade")]
    public string nomeExibicao;
    public Sprite icone;

    [Header("Estatisticas")]
    public int dano = 10;
    public float cadencia = 0.5f;       // tiros por segundo
    public float alcance = 50f;
    public int municaoMaxima = 30;

    [Header("Audio e Efeito")]
    public AudioClip somDisparo;
    public GameObject prefabImpacto;
}`,
      },
      {
        lang: "csharp",
        code: `// Usando o ScriptableObject em um MonoBehaviour de jogador.
// Arraste o asset 'Pistola.asset' (criado pelo menu) no Inspector.
using UnityEngine;

public class JogadorAtira : MonoBehaviour
{
    public ArmaData armaAtual;          // referencia ao asset SO
    public Transform pontoTiro;

    private float proximoDisparo;

    void Update()
    {
        if (armaAtual == null) return;

        if (Input.GetButton("Fire1") && Time.time >= proximoDisparo)
        {
            Disparar();
            proximoDisparo = Time.time + armaAtual.cadencia;
        }
    }

    void Disparar()
    {
        Debug.Log("Atirando com " + armaAtual.nomeExibicao + " (dano=" + armaAtual.dano + ")");

        // Raycast usando o alcance definido no SO.
        if (Physics.Raycast(pontoTiro.position, pontoTiro.forward, out RaycastHit hit, armaAtual.alcance))
        {
            // Spawn de impacto vindo dos dados, nao hardcoded.
            if (armaAtual.prefabImpacto != null)
                Instantiate(armaAtual.prefabImpacto, hit.point, Quaternion.LookRotation(hit.normal));
        }

        // Som tambem vem dos dados.
        if (armaAtual.somDisparo != null)
            AudioSource.PlayClipAtPoint(armaAtual.somDisparo, pontoTiro.position);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Trocando de arma em runtime: e so reapontar a referencia.
using UnityEngine;

public class TrocadorDeArma : MonoBehaviour
{
    public JogadorAtira jogador;
    public ArmaData[] armasDisponiveis;     // arraste varios assets aqui

    private int indice;

    void Update()
    {
        // Tecla Q troca para a proxima arma do array.
        if (Input.GetKeyDown(KeyCode.Q))
        {
            indice = (indice + 1) % armasDisponiveis.Length;
            jogador.armaAtual = armasDisponiveis[indice];
            Debug.Log("Trocou para: " + jogador.armaAtual.nomeExibicao);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Cuidado importante: SO nao guarda estado individual.
// Para municao atual de cada arma, use uma struct/classe runtime separada.
using UnityEngine;

public class EstadoArmaRuntime : MonoBehaviour
{
    public ArmaData dados;          // dados imutaveis vindos do SO
    public int municaoAtual;        // estado runtime, nao mexe no SO

    void Start()
    {
        // Inicia a municao com o maximo definido no SO.
        municaoAtual = dados.municaoMaxima;
    }

    public bool TentarAtirar()
    {
        if (municaoAtual <= 0)
        {
            Debug.Log("Sem municao!");
            return false;
        }
        municaoAtual--;     // diminui no runtime, NAO no asset.
        return true;
    }
}`,
      },
    ],
    points: [
      "ScriptableObject e dados em asset, fora de GameObject e fora da cena.",
      "Crie com [CreateAssetMenu] e gere o asset por Assets > Create.",
      "Mesmo asset pode ser referenciado por dezenas de scripts; mudou um lugar, mudou tudo.",
      "Ideal para configuracao: armas, inimigos, itens, dificuldades.",
      "NAO use para guardar estado dinamico de runtime (HP atual, posicao).",
      "Permite design data-driven: designers editam valores sem tocar em codigo.",
      "Mudancas em SO durante Play persistem no asset no Editor; cuidado em build.",
      "Combina lindo com Prefabs: o Prefab carrega o GameObject, o SO carrega os dados.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Em build (jogo compilado), alteracoes em campos de ScriptableObject NAO persistem entre sessoes. No Editor parece persistir porque o asset esta em disco. Se quiser save game, use JSON ou PlayerPrefs.",
      },
      {
        type: "tip",
        content: "Quando um ScriptableObject precisa de varios sub-tipos (tipos de inimigo, escolas de magia), considere usar heranca de SO ou criar varios assets do mesmo tipo. Designers adoram listas de assets para escolher.",
      },
      {
        type: "info",
        content: "ScriptableObjects nao tem Update, OnCollisionEnter ou metodos de Unity por padrao. Eles sao puramente dados. Para reagir a eventos de jogo, combine com um MonoBehaviour que le os dados do SO.",
      },
    ],
  },
];
