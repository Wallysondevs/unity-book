import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "rigidbody",
    section: "fisica-3d",
    title: "Rigidbody: dando vida física aos objetos",
    difficulty: "intermediario",
    subtitle: "Como Unity transforma um modelo estático em um corpo que cai, empurra e bate.",
    intro: `Imagine que você colocou uma bola dentro de uma cena 3D do Unity. Sem nenhum componente físico, essa bola flutua no ar, ignora a gravidade e atravessa o chão. Para o motor de física, ela simplesmente não existe. O componente Rigidbody é o que diz para a engine: "este objeto faz parte do mundo físico, simule ele". A partir do momento que você adiciona um Rigidbody, o Unity passa a integrar forças, gravidade, atrito e colisões nesse objeto a cada FixedUpdate.

Pense no Rigidbody como a "alma física" de um GameObject. Ele guarda massa, velocidade linear, velocidade angular, arrasto (drag), arrasto angular e flags como useGravity e isKinematic. A massa não define se o objeto cai mais rápido (gravidade ignora massa, exatamente como na física real), mas define como ele reage a empurrões: uma caixa de 1 kg recua muito quando atingida por uma bola de 50 kg. O drag é como o atrito do ar — quanto maior, mais rápido o objeto perde velocidade no vácuo. Iniciantes costumam aumentar drag para "frear" o objeto, mas o uso correto envolve entender que drag não é freio instantâneo, é amortecimento contínuo.

Existem três modos de mover um Rigidbody, e essa é a maior fonte de bugs de iniciante. Você pode (1) deixar a física mover, aplicando forças com AddForce; (2) controlar manualmente movimentos cinemáticos com MovePosition e MoveRotation, quando isKinematic está ligado; ou (3) cair na armadilha de mexer no transform.position direto, o que quebra a interpolação física e gera tunneling em colisões. A regra de ouro: se tem Rigidbody, mova com a API do Rigidbody, nunca pelo Transform.

Outro ponto crítico é onde escrever o código de física. Toda lógica que aplica força, lê velocidade ou move o corpo deve estar em FixedUpdate, que roda em passo fixo (por padrão 50 vezes por segundo) sincronizado com a simulação. Update roda no framerate da tela, e misturar os dois gera trepidação. Quando esses três conceitos — quem move, com qual API e em qual update — estão claros, metade dos bugs de física some.`,
    codes: [
      {
        lang: "csharp",
        code: `// Empurrando uma bola com forca. Anexe este script a um GameObject
// que tenha um componente Rigidbody (clique em Add Component > Rigidbody).
using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class EmpurrarBola : MonoBehaviour
{
    // Forca aplicada ao apertar espaco, em Newtons.
    public float forca = 500f;

    // Cache do Rigidbody para evitar GetComponent toda hora (performance).
    private Rigidbody rb;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        rb.mass = 1f;          // 1 kg
        rb.linearDamping = 0.1f; // pequeno arrasto do ar (Unity 6: linearDamping; antes: drag)
        rb.useGravity = true;
    }

    void FixedUpdate()
    {
        // Toda forca fisica vai em FixedUpdate, nao em Update.
        if (Input.GetKey(KeyCode.Space))
        {
            // ForceMode.Force aplica forca contínua respeitando massa e dt.
            rb.AddForce(Vector3.forward * forca, ForceMode.Force);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Diferenca pratica entre os 4 ForceMode. Cada um interpreta o vetor
// de forma diferente, e errar isso e a fonte numero 1 de "por que meu
// pulo esta fraco demais?".
using UnityEngine;

public class ExemploForceMode : MonoBehaviour
{
    private Rigidbody rb;
    void Awake() => rb = GetComponent<Rigidbody>();

    void Update()
    {
        // Force: forca continua, multiplicada por massa e Time.fixedDeltaTime.
        // Use para vento, propulsao continua.
        if (Input.GetKey(KeyCode.Alpha1))
            rb.AddForce(Vector3.up * 10f, ForceMode.Force);

        // Acceleration: ignora massa. Bom para gravidade customizada.
        if (Input.GetKey(KeyCode.Alpha2))
            rb.AddForce(Vector3.up * 10f, ForceMode.Acceleration);

        // Impulse: pancada instantanea, respeita massa. Use para pulo, tiro.
        if (Input.GetKeyDown(KeyCode.Alpha3))
            rb.AddForce(Vector3.up * 5f, ForceMode.Impulse);

        // VelocityChange: pancada instantanea, ignora massa. Pulo consistente
        // independente da massa do personagem.
        if (Input.GetKeyDown(KeyCode.Alpha4))
            rb.AddForce(Vector3.up * 5f, ForceMode.VelocityChange);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Rigidbody cinematico: voce controla a posicao manualmente, mas o
// motor de fisica ainda calcula colisoes contra ele. Otimo para
// plataformas moveis, portas, elevadores.
using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class PlataformaMovel : MonoBehaviour
{
    public Vector3 destino;
    public float velocidade = 2f;

    private Rigidbody rb;
    private Vector3 origem;
    private float t;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        rb.isKinematic = true;          // nao reage a forcas, voce manda
        rb.useGravity = false;
        rb.interpolation = RigidbodyInterpolation.Interpolate; // suaviza visual
        origem = rb.position;
    }

    void FixedUpdate()
    {
        // Movimento ping-pong entre origem e destino.
        t += Time.fixedDeltaTime * velocidade;
        Vector3 alvo = Vector3.Lerp(origem, destino, Mathf.PingPong(t, 1f));

        // MovePosition respeita o motor de fisica e empurra outros corpos.
        // NUNCA use transform.position aqui, isso faz objetos atravessarem.
        rb.MovePosition(alvo);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Ler velocidade e travar eixos. Util para personagens 2.5D ou
// para impedir que uma caixa tombe quando empurrada.
using UnityEngine;

public class TravarEixos : MonoBehaviour
{
    private Rigidbody rb;

    void Start()
    {
        rb = GetComponent<Rigidbody>();

        // Trava rotacao em X e Z. Objeto so gira no eixo Y (yaw).
        rb.constraints = RigidbodyConstraints.FreezeRotationX
                       | RigidbodyConstraints.FreezeRotationZ;
    }

    void FixedUpdate()
    {
        // linearVelocity (Unity 6) ou velocity (Unity 2022 e antigos).
        Vector3 v = rb.linearVelocity;

        // Limita velocidade horizontal a 10 m/s sem mexer na vertical.
        Vector3 horizontal = new Vector3(v.x, 0f, v.z);
        if (horizontal.magnitude > 10f)
        {
            horizontal = horizontal.normalized * 10f;
            rb.linearVelocity = new Vector3(horizontal.x, v.y, horizontal.z);
        }
    }
}`,
      },
    ],
    points: [
      "Rigidbody e o que faz o objeto existir para o motor de fisica do Unity.",
      "Massa nao afeta velocidade de queda, mas afeta como o objeto reage a forcas.",
      "Toda chamada de fisica (AddForce, MovePosition) deve estar em FixedUpdate.",
      "Use isKinematic + MovePosition para plataformas e portas, nunca transform.position.",
      "ForceMode.Impulse para pulos e tiros; ForceMode.Force para vento e propulsao.",
      "RigidbodyConstraints trava eixos sem precisar de codigo extra.",
      "Ative Interpolate em corpos visiveis ao jogador para suavizar entre FixedUpdates.",
      "No Unity 6, drag virou linearDamping e velocity virou linearVelocity.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Mover um GameObject com Rigidbody atraves de transform.position quebra a deteccao de colisao e causa tunneling (objetos atravessando paredes). Sempre use rb.MovePosition ou aplique forcas.",
      },
      {
        type: "tip",
        content: "Se seu personagem treme ou parece arrastado em telas de 144Hz, ative Rigidbody.interpolation = Interpolate. Para inimigos longe da camera, deixe None para economizar CPU.",
      },
      {
        type: "info",
        content: "A partir do Unity 6 a API mudou nomes: rb.velocity virou rb.linearVelocity e rb.drag virou rb.linearDamping. Tutoriais antigos ainda funcionam mas geram warnings de deprecation.",
      },
    ],
  },
  {
    slug: "colliders-3d",
    section: "fisica-3d",
    title: "Colliders 3D: a forma fisica do objeto",
    difficulty: "intermediario",
    subtitle: "Box, Sphere, Capsule, Mesh e a regra do convex que ninguem te conta.",
    intro: `O Rigidbody resolve "este objeto se mexe na fisica", mas nao diz qual e o formato dele para colidir. Quem faz isso e o Collider. Pense no modelo 3D (mesh) como uma roupa visual e no Collider como o esqueleto invisivel que o motor de fisica realmente usa para checar contato. Voce pode ter um carro com modelo super detalhado (200 mil triangulos) e um BoxCollider simples por baixo. Para a fisica, ele e uma caixa. Para os olhos, e um carro. Esse truque de separar visual de colisao e o segredo de games rodarem a 60 FPS.

Existem cinco colliders 3D principais: BoxCollider (caixa), SphereCollider (esfera), CapsuleCollider (capsula, tipo um comprimido — ideal para personagens humanoides), MeshCollider (a propria malha 3D, vertice por vertice) e TerrainCollider (gerado automaticamente pelo Unity Terrain). Os quatro primeiros sao colliders primitivos e sao baratissimos: a engine resolve colisao com formula matematica direta. O MeshCollider e poderoso, mas caro, e tem uma regra de ouro que confunde todo iniciante: para que um MeshCollider colida com outro objeto que tambem se mexe, ele precisa estar marcado como Convex. Sem Convex, MeshCollider so funciona em objetos estaticos (chao, paredes complexas).

Convex significa que a engine vai "embrulhar" sua malha numa forma simplificada sem concavidades — imagine pegar um saco plastico e encolher em volta da estatua. O resultado tem no maximo 255 triangulos e perde detalhes finos. Essa simplificacao existe porque colisao convexa-vs-convexa tem algoritmo rapido e estavel; colisao concava-vs-concava e instavel e cara. Por isso voce nao consegue ter dois MeshColliders nao-convex se batendo: a engine simplesmente nao sabe resolver isso de forma confiavel.

Um collider sem Rigidbody e chamado de "static collider". O Unity assume que ele nunca se move e otimiza pesadamente uma estrutura de aceleracao chamada AABB tree. Se voce mover um collider estatico via transform.position, o Unity recalcula essa estrutura inteira, gerando picos de lag. A regra: se algo se move, mesmo que seja so abrir uma porta, adicione um Rigidbody (pode ser kinematic) para a engine tratar como dinamico.`,
    codes: [
      {
        lang: "csharp",
        code: `// Adicionando colliders por codigo (geralmente voce faz no Inspector,
// mas saber por codigo ajuda em geracao procedural).
using UnityEngine;

public class CriarColliders : MonoBehaviour
{
    void Start()
    {
        // BoxCollider: barato, ideal para caixas, paredes, plataformas.
        var box = gameObject.AddComponent<BoxCollider>();
        box.size = new Vector3(2f, 1f, 2f);
        box.center = Vector3.zero;

        // SphereCollider: o mais barato de todos, ideal para projeteis,
        // bolas, areas de detecao circular.
        // var sphere = gameObject.AddComponent<SphereCollider>();
        // sphere.radius = 0.5f;

        // CapsuleCollider: padrao para personagens. Direction:
        // 0 = X, 1 = Y (em pe), 2 = Z.
        // var cap = gameObject.AddComponent<CapsuleCollider>();
        // cap.height = 2f; cap.radius = 0.5f; cap.direction = 1;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// MeshCollider para um cenario complexo (estatico) e a regra do Convex.
using UnityEngine;

[RequireComponent(typeof(MeshFilter))]
public class ConfigurarMeshCollider : MonoBehaviour
{
    public bool seraDinamico = false;

    void Start()
    {
        var mc = gameObject.AddComponent<MeshCollider>();

        // Pega a mesh do MeshFilter visivel.
        mc.sharedMesh = GetComponent<MeshFilter>().sharedMesh;

        if (seraDinamico)
        {
            // Convex = obrigatorio para MeshCollider em objeto com Rigidbody
            // ou que precisa colidir com outro MeshCollider.
            // Limite duro: 255 triangulos no resultado convexo.
            mc.convex = true;

            // Sem Rigidbody, mesmo convex e tratado como estatico.
            // Adicionamos um Rigidbody kinematic para virar collider dinamico.
            var rb = gameObject.AddComponent<Rigidbody>();
            rb.isKinematic = true;
        }
        else
        {
            // Cenario estatico: convex desligado, malha completa funciona.
            mc.convex = false;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Compound Collider: combinar varios primitivos para aproximar uma forma
// complexa SEM usar MeshCollider. Tecnica padrao em jogos AAA.
using UnityEngine;

public class CarroCompound : MonoBehaviour
{
    void Start()
    {
        // Imagine um carro: chassi + 4 rodas. Em vez de MeshCollider pesado,
        // criamos filhos com BoxCollider e SphereCollider.

        // Chassi como Box.
        var chassi = new GameObject("Chassi");
        chassi.transform.SetParent(transform, false);
        var box = chassi.AddComponent<BoxCollider>();
        box.size = new Vector3(2f, 0.8f, 4f);

        // 4 rodas como Sphere.
        Vector3[] posicoes = {
            new Vector3( 1.0f, -0.4f,  1.5f),
            new Vector3(-1.0f, -0.4f,  1.5f),
            new Vector3( 1.0f, -0.4f, -1.5f),
            new Vector3(-1.0f, -0.4f, -1.5f),
        };
        foreach (var p in posicoes)
        {
            var roda = new GameObject("Roda");
            roda.transform.SetParent(transform, false);
            roda.transform.localPosition = p;
            var s = roda.AddComponent<SphereCollider>();
            s.radius = 0.4f;
        }

        // Um unico Rigidbody no pai junta tudo num so corpo fisico.
        gameObject.AddComponent<Rigidbody>();
    }
}`,
      },
    ],
    points: [
      "Collider define a forma fisica; pode ser totalmente diferente do modelo visual.",
      "Box, Sphere e Capsule sao baratissimos e suficientes para 90 por cento dos casos.",
      "MeshCollider sem Convex so funciona em objetos estaticos (sem Rigidbody).",
      "Convex tem limite de 255 triangulos e suaviza detalhes finos da malha.",
      "Compound colliders (varios primitivos como filhos) substituem MeshCollider pesado.",
      "Mover um collider estatico (sem Rigidbody) gera picos de lag por recalculo da AABB tree.",
      "Use CapsuleCollider para personagens; e o que melhor desliza por escadas e cantos.",
      "Sempre desative o renderer de colliders auxiliares; eles sao apenas geometria fisica.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Erro classico: adicionar MeshCollider em uma porta com Rigidbody e esquecer de marcar Convex. A porta cai pelo chao porque o motor nao consegue resolver colisao concava-vs-concava.",
      },
      {
        type: "tip",
        content: "Para personagens, evite MeshCollider mesmo com Convex. Use CapsuleCollider, sempre. Ele desliza melhor em escadas, sobe rampas e tem custo proximo de zero.",
      },
      {
        type: "info",
        content: "O Physics Debugger (Window > Analysis > Physics Debugger) mostra todos os colliders coloridos na cena. Ative quando algo passa atraves de paredes para descobrir collider faltando.",
      },
    ],
  },
  {
    slug: "triggers-3d",
    section: "fisica-3d",
    title: "Triggers: zonas de detecao sem colisao",
    difficulty: "intermediario",
    subtitle: "OnTriggerEnter, OnCollisionEnter e a confusao classica entre os dois.",
    intro: `Todo iniciante em Unity, mais cedo ou mais tarde, faz a mesma pergunta: "criei um cubo para o jogador entrar e disparar um evento, mas ele bate no cubo em vez de atravessar". A resposta esta em uma checkbox pequena no Inspector chamada "Is Trigger". Quando ela esta desligada (padrao), o collider e solido — bate, empurra, recebe forca. Quando esta ligada, o collider vira uma "zona" — atravessa, mas avisa o codigo quem entrou, ficou ou saiu. Essa diferenca entre collider solido e trigger e fundamental para entender Unity.

Pense num supermercado. A porta automatica nao te bloqueia (voce passa por ela), mas detecta sua presenca para abrir. Isso e um trigger. Ja a parede do supermercado bloqueia voce e seria simulada com colisao normal. No Unity, a porta automatica seria um BoxCollider com Is Trigger ativado, e a parede seria um BoxCollider normal. Triggers sao perfeitos para checkpoints, areas de dano (lava, agua), zonas de spawn, sensores de IA, gatilhos de cutscene e portas de transicao de nivel.

Os tres callbacks de trigger sao OnTriggerEnter (entrou na zona), OnTriggerStay (ainda esta dentro, chamado todo FixedUpdate enquanto la dentro) e OnTriggerExit (saiu). O paralelo solido sao OnCollisionEnter, OnCollisionStay e OnCollisionExit, que recebem um Collision com pontos de contato e impulsos. Para qualquer um desses callbacks ser chamado, pelo menos UM dos dois objetos envolvidos precisa ter Rigidbody. Esse detalhe quebra muito iniciante: voce coloca trigger no chao e personagem com CharacterController (sem Rigidbody) e nada acontece. Solucao: adicione Rigidbody kinematic no chao ou no personagem.

Outra confusao comum: OnTriggerStay nao e gratis. Ele dispara em FixedUpdate enquanto algo esta dentro, entao se voce tem 200 inimigos numa zona, sao 200 chamadas por frame. Use OnTriggerEnter/Exit para alternar estado e evite OnTriggerStay quando der. E lembre: se ambos os colliders sao triggers e nenhum tem Rigidbody, nada acontece. Se um e trigger e outro e solido, e ambos tem Rigidbody, voce ganha OnTriggerEnter no trigger e nada no solido (a fisica nao colide, so notifica).`,
    codes: [
      {
        lang: "csharp",
        code: `// Zona de checkpoint classica. Coloque em um GameObject com BoxCollider
// configurado como Is Trigger. O jogador precisa ter tag "Player".
using UnityEngine;

public class Checkpoint : MonoBehaviour
{
    public Transform pontoRespawn;
    private bool jaAtivado = false;

    void OnTriggerEnter(Collider other)
    {
        // Filtra so o jogador. Comparar tag e mais rapido que GetComponent.
        if (jaAtivado || !other.CompareTag("Player")) return;

        jaAtivado = true;
        GameManager.PontoRespawn = pontoRespawn.position;
        Debug.Log("Checkpoint salvo!");
    }
}

// GameManager simples so para o exemplo compilar.
public static class GameManager
{
    public static Vector3 PontoRespawn;
}`,
      },
      {
        lang: "csharp",
        code: `// Diferenca pratica entre OnCollision e OnTrigger.
// Anexe a um Rigidbody com BoxCollider. Teste com Is Trigger ligado e desligado.
using UnityEngine;

public class ComparaColisaoTrigger : MonoBehaviour
{
    // SOLIDO: voce sabe ONDE bateu, com QUE forca, em quais pontos.
    void OnCollisionEnter(Collision colisao)
    {
        // colisao tras pontos de contato e velocidade relativa.
        ContactPoint p = colisao.GetContact(0);
        float impacto = colisao.relativeVelocity.magnitude;
        Debug.Log($"Bati em {colisao.gameObject.name} com {impacto:F2} m/s no ponto {p.point}");

        // Som proporcional ao impacto, por exemplo.
        if (impacto > 5f) Debug.Log("Som forte!");
    }

    // TRIGGER: voce so sabe QUEM atravessou, sem fisica.
    void OnTriggerEnter(Collider other)
    {
        Debug.Log($"{other.name} entrou na minha area");
    }

    void OnTriggerExit(Collider other)
    {
        Debug.Log($"{other.name} saiu da minha area");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Zona de dano contínuo (lava). Usa OnTriggerStay com cooldown
// para nao estourar performance e nao matar o jogador num frame.
using UnityEngine;
using System.Collections.Generic;

[RequireComponent(typeof(Collider))]
public class ZonaDeDano : MonoBehaviour
{
    public float danoPorSegundo = 20f;

    // Cache de quem esta dentro, para tickar com timer proprio.
    private readonly Dictionary<Collider, float> dentro = new();

    void Reset()
    {
        // Garante que o collider e trigger ao adicionar o script.
        GetComponent<Collider>().isTrigger = true;
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player")) dentro[other] = 0f;
    }

    void OnTriggerExit(Collider other)
    {
        dentro.Remove(other);
    }

    void FixedUpdate()
    {
        // Em vez de OnTriggerStay (que pode ser caro), iteramos so quem importa.
        foreach (var kv in dentro)
        {
            // Aplica dano contínuo (exemplo: chame um VidaComponent.Aplicar).
            Debug.Log($"{kv.Key.name} sofre {danoPorSegundo * Time.fixedDeltaTime:F1} de dano");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Ditado classico do Unity: trigger nao notifica se ambos forem
// estaticos (sem Rigidbody). Este script garante o setup correto.
using UnityEngine;

[RequireComponent(typeof(Collider))]
public class GarantirTriggerFunciona : MonoBehaviour
{
    void Awake()
    {
        var col = GetComponent<Collider>();
        col.isTrigger = true;

        // Se nao houver Rigidbody na zona nem no objeto que vai entrar,
        // o trigger nao dispara. Adicionamos um kinematic para a zona
        // virar "dynamic" do ponto de vista da engine.
        if (!TryGetComponent<Rigidbody>(out var rb))
        {
            rb = gameObject.AddComponent<Rigidbody>();
            rb.isKinematic = true;
            rb.useGravity = false;
        }
    }
}`,
      },
    ],
    points: [
      "Is Trigger transforma um collider de solido em zona de detecao.",
      "OnTriggerEnter/Stay/Exit so disparam se ao menos um lado tem Rigidbody.",
      "OnCollisionEnter recebe Collision com pontos de contato e velocidade relativa.",
      "OnTriggerStay dispara em FixedUpdate e pode pesar com muitos objetos.",
      "Use CompareTag em vez de == para comparar tags (mais rapido e seguro).",
      "Para checkpoints, dano contínuo, cutscenes e detecao de IA, use triggers.",
      "Para batidas, projeteis solidos e pisos, use colisao normal sem trigger.",
      "Adicione Rigidbody kinematic na zona se o personagem usa CharacterController.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Se OnTriggerEnter nao dispara, 99 por cento das vezes e porque nenhum dos dois objetos tem Rigidbody. Adicione um kinematic em qualquer um dos lados.",
      },
      {
        type: "tip",
        content: "Prefira OnTriggerEnter/Exit + estado proprio em vez de OnTriggerStay. Voce ganha controle de timing e elimina chamadas redundantes em FixedUpdate.",
      },
      {
        type: "info",
        content: "Triggers sao ignorados por Raycast por padrao. Se quiser que o raycast detecte zonas, passe QueryTriggerInteraction.Collide na chamada de Physics.Raycast.",
      },
    ],
  },
  {
    slug: "materiais-fisicos",
    section: "fisica-3d",
    title: "Physic Materials: atrito e quique",
    difficulty: "intermediario",
    subtitle: "Por que sua bola nao quica e seu personagem desliza no chao.",
    intro: `Imagine duas superficies do mundo real: gelo e borracha. O gelo e quase sem atrito (voce escorrega) e nao quica (cai e fica parado). A borracha tem atrito alto (voce gruda) e quica bastante. No Unity, todo Collider tem um campo chamado Material, que recebe um asset chamado Physic Material. Esse asset diz para o motor de fisica como duas superficies devem se comportar quando se tocam: o quanto deslizam e o quanto quicam. Sem Physic Material, todo collider usa o material padrao (atrito 0.6, quique 0), que e razoavel mas generico.

Os quatro parametros principais do Physic Material sao Dynamic Friction (atrito quando ja esta deslizando), Static Friction (atrito para comecar a deslizar do parado), Bounciness (quanto da velocidade e devolvida na colisao, 0 = nao quica, 1 = quica eternamente) e os dois Combine modes (Friction Combine e Bounce Combine). Os Combine modes resolvem um dilema: quando uma bola de borracha (bounce 0.9) toca um chao de cimento (bounce 0.1), qual valor ganha? Voce escolhe entre Average (media), Minimum (menor), Maximum (maior) ou Multiply (multiplicacao). A regra padrao do Unity e Average para friccao e Average para bounce, mas Maximum em bounce e o que faz uma bola super quicar mesmo em chao duro.

A grande pegadinha dos Physic Materials e: mudancas em runtime (via codigo) muitas vezes nao se aplicam ao collider corretamente porque colliders cacheiam o material. Se voce trocar o sharedMaterial em runtime, lembre de chamar uma reativacao do collider ou aceitar que so vai valer no proximo contato. Outra pegadinha: bounce 1.0 com gravidade ligada ainda perde energia ao longo do tempo por causa de tolerancias internas, entao para "quicar para sempre" voce precisa adicionar codigo que mantenha a velocidade.

Quando NAO usar Physic Material? Para personagens controlados manualmente. Se voce esta movendo um Rigidbody humanoide com forca ou MovePosition, atrito alto vai te "agarrar" no chao em descidas e atrito zero vai te fazer escorregar mesmo parado. A solucao classica para personagens e usar atrito ZERO no collider do personagem e gerenciar movimento e parada via codigo. Para o cenario, mantenha atrito normal. Esse truque resolve 90 por cento dos bugs de personagem que "gruda na rampa" ou "desliza eterno".`,
    codes: [
      {
        lang: "csharp",
        code: `// Criando Physic Materials por codigo. No fluxo normal voce cria
// pelo menu Assets > Create > Physic Material e arrasta no collider.
using UnityEngine;

public class CriarMateriais : MonoBehaviour
{
    void Start()
    {
        var col = GetComponent<Collider>();

        // Material de gelo: desliza muito, nao quica.
        var gelo = new PhysicsMaterial("Gelo")
        {
            dynamicFriction = 0.05f,
            staticFriction  = 0.05f,
            bounciness      = 0f,
            frictionCombine = PhysicsMaterialCombine.Minimum,
            bounceCombine   = PhysicsMaterialCombine.Average,
        };

        // Material de bola de borracha: atrito normal, quique alto.
        var borracha = new PhysicsMaterial("Borracha")
        {
            dynamicFriction = 0.6f,
            staticFriction  = 0.6f,
            bounciness      = 0.85f,
            frictionCombine = PhysicsMaterialCombine.Average,
            bounceCombine   = PhysicsMaterialCombine.Maximum,
        };

        // Atribui ao collider deste objeto.
        col.material = gelo;

        // Para reaplicar em runtime (truque do toggle):
        col.enabled = false;
        col.enabled = true;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Truque do "personagem sem atrito": collider zero atrito + codigo
// que aplica drag manual quando solta tecla. Resolve "grudar na rampa".
using UnityEngine;

[RequireComponent(typeof(Rigidbody), typeof(Collider))]
public class PersonagemSemAtrito : MonoBehaviour
{
    public float velocidadeMax = 6f;
    public float aceleracao = 30f;
    public float desaceleracao = 25f;

    private Rigidbody rb;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();

        // Material com atrito zero para o collider do personagem.
        var semAtrito = new PhysicsMaterial("SemAtrito")
        {
            dynamicFriction = 0f,
            staticFriction = 0f,
            frictionCombine = PhysicsMaterialCombine.Minimum,
        };
        GetComponent<Collider>().material = semAtrito;
    }

    void FixedUpdate()
    {
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");
        Vector3 input = new Vector3(h, 0f, v).normalized;

        Vector3 vel = rb.linearVelocity;
        Vector3 horizontal = new Vector3(vel.x, 0f, vel.z);

        if (input.sqrMagnitude > 0.01f)
        {
            // Acelera ate velocidade max.
            Vector3 alvo = input * velocidadeMax;
            horizontal = Vector3.MoveTowards(horizontal, alvo, aceleracao * Time.fixedDeltaTime);
        }
        else
        {
            // Sem input, desacelera manualmente (substitui o atrito do material).
            horizontal = Vector3.MoveTowards(horizontal, Vector3.zero, desaceleracao * Time.fixedDeltaTime);
        }

        rb.linearVelocity = new Vector3(horizontal.x, vel.y, horizontal.z);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Bola super quicante. Mostre a diferenca entre Combine modes.
using UnityEngine;

public class BolaQuicante : MonoBehaviour
{
    void Start()
    {
        var col = GetComponent<SphereCollider>();
        var mat = new PhysicsMaterial("SuperQuique")
        {
            dynamicFriction = 0.4f,
            staticFriction = 0.4f,
            bounciness = 0.9f,
            // Maximum garante que mesmo em chao com bounce 0 a bola quica.
            bounceCombine = PhysicsMaterialCombine.Maximum,
        };
        col.material = mat;

        // Garantir Rigidbody com pouco arrasto para nao matar o quique cedo.
        var rb = GetComponent<Rigidbody>();
        rb.linearDamping = 0f;
        rb.angularDamping = 0.05f;
    }
}`,
      },
    ],
    points: [
      "Physic Material define friccao e quique entre dois colliders em contato.",
      "Friction Combine resolve o conflito de valores quando dois materiais se tocam.",
      "Use Maximum em Bounce Combine para garantir que objetos quicantes quiquem em qualquer chao.",
      "Personagens com Rigidbody devem ter material de atrito zero e desacelerar via codigo.",
      "Bounciness 1.0 ainda perde energia com o tempo por tolerancias internas do PhysX.",
      "Cenarios geralmente usam um material padrao com atrito 0.6 e bounce 0.",
      "Mude o material em runtime e toggle col.enabled para garantir aplicacao imediata.",
      "PhysicMaterial virou PhysicsMaterial (com s) no Unity 6 — script antigo gera warning.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Personagem que 'gruda na rampa' ou 'escorrega no plano' quase sempre e atrito errado. Coloque um material com friccao zero no collider do personagem e gerencie velocidade no script.",
      },
      {
        type: "warning",
        content: "Bounciness acima de 1.0 e instavel: a bola pode ganhar energia do nada e disparar pela cena. Mantenha entre 0 e 0.95 para comportamento previsivel.",
      },
      {
        type: "info",
        content: "No Unity 6 a classe se chama PhysicsMaterial (com s no final) e PhysicMaterialCombine virou PhysicsMaterialCombine. Codigo antigo ainda compila mas gera deprecation warning.",
      },
    ],
  },
  {
    slug: "raycast",
    section: "fisica-3d",
    title: "Raycast: o canivete suico da fisica",
    difficulty: "intermediario",
    subtitle: "Como detectar o que tem na frente, no chao ou no mouse sem usar colisao real.",
    intro: `Raycast e provavelmente a ferramenta de fisica mais usada em jogos. A ideia e simples: voce dispara um raio invisivel saindo de um ponto, numa direcao, com um comprimento maximo, e o motor de fisica te diz "bati em tal collider, em tal ponto, com tal normal de superficie". E como soltar uma flecha matematicamente perfeita e perguntar onde ela parou. Sem mover nada, sem simular nada, voce ganha informacao de cena instantanea. Por isso raycast aparece em quase todo sistema: tiro de arma (bala instantanea), detecao de chao (estou no chao?), interacao com objetos (clique do mouse na cena 3D), IA enxergando o jogador, e ate em selecao de itens.

Pense num radar laser. Voce manda o feixe e ele te traz de volta uma RaycastHit, uma estrutura com point (onde bateu), normal (vetor perpendicular a superficie no ponto de impacto), distance (a quantos metros do origem), collider (qual collider foi atingido) e transform (o GameObject dono). A normal e ouro: e ela que te diz se voce esta numa rampa, em parede, ou no teto. Se a normal aponta para cima (Vector3.up), voce esta num chao plano. Se aponta para o lado, voce bateu numa parede.

Existem variacoes importantes: Physics.Raycast simples retorna bool e preenche um RaycastHit; Physics.RaycastAll retorna todos os hits ao longo do raio (uma flecha que atravessa); Physics.SphereCast e CapsuleCast disparam volumes em vez de linha (uteis para detectar inimigos numa "espessura"); e Physics.OverlapSphere retorna todos os colliders dentro de uma esfera (sem disparar raio, so consulta volume). Cada um tem seu uso. Raycast simples e o mais rapido. SphereCast e melhor para checar chao em personagens (evita falhar em quina). OverlapSphere e ideal para "tudo num raio de 10m".

Dois parametros sao critic os e iniciantes ignoram: layerMask e QueryTriggerInteraction. LayerMask filtra em quais layers o raio bate — disparar so contra "Inimigos" e ignorar "Vegetation", por exemplo, e fundamental para performance e logica. QueryTriggerInteraction decide se triggers sao detectados (Collide), ignorados (Ignore), ou seguem a configuracao global (UseGlobal). Por padrao, raycast IGNORA triggers. Se voce esta tentando detectar uma zona com raycast e nao funciona, e porque voce esqueceu de passar QueryTriggerInteraction.Collide.`,
    codes: [
      {
        lang: "csharp",
        code: `// Tiro instantaneo de arma com Raycast. O classico hitscan.
using UnityEngine;

public class ArmaHitscan : MonoBehaviour
{
    public float alcance = 100f;
    public int dano = 25;
    public LayerMask camadasAlvo;   // configure no Inspector: Default + Inimigos
    public Camera cam;

    void Update()
    {
        if (!Input.GetButtonDown("Fire1")) return;

        // Raio sai do centro da camera (mira), na direcao do olhar.
        Ray ray = new Ray(cam.transform.position, cam.transform.forward);
        RaycastHit hit;

        // Physics.Raycast retorna true se acertou algo dentro do alcance e do mask.
        if (Physics.Raycast(ray, out hit, alcance, camadasAlvo, QueryTriggerInteraction.Ignore))
        {
            Debug.Log($"Acertei {hit.collider.name} a {hit.distance:F1} m");

            // Tente pegar um componente de vida no objeto atingido.
            if (hit.collider.TryGetComponent<Vida>(out var v))
                v.TomarDano(dano);

            // Aplica forca no ponto de impacto (efeito visual, empurrar corpo).
            if (hit.rigidbody != null)
                hit.rigidbody.AddForceAtPosition(ray.direction * 200f, hit.point);
        }
    }
}

public class Vida : MonoBehaviour
{
    public int hp = 100;
    public void TomarDano(int d) { hp -= d; if (hp <= 0) Destroy(gameObject); }
}`,
      },
      {
        lang: "csharp",
        code: `// Detecao de chao com SphereCast. Mais robusto que Raycast em quinas
// e melhor que checar OnCollisionStay para saber se pode pular.
using UnityEngine;

[RequireComponent(typeof(CapsuleCollider))]
public class CheckarChao : MonoBehaviour
{
    public LayerMask camadasChao;
    public float raioEsfera = 0.4f;
    public float distanciaExtra = 0.1f;

    private CapsuleCollider cap;
    public bool NoChao { get; private set; }
    public Vector3 NormalChao { get; private set; }

    void Awake() => cap = GetComponent<CapsuleCollider>();

    void FixedUpdate()
    {
        // Origem: pe do collider menos um pouquinho.
        Vector3 origem = transform.position + Vector3.up * raioEsfera;
        float distancia = (cap.height * 0.5f) - raioEsfera + distanciaExtra;

        // SphereCast = raio com volume. Detecta chao mesmo em quina.
        if (Physics.SphereCast(origem, raioEsfera, Vector3.down, out var hit,
                               distancia, camadasChao, QueryTriggerInteraction.Ignore))
        {
            NoChao = true;
            NormalChao = hit.normal;
        }
        else
        {
            NoChao = false;
            NormalChao = Vector3.up;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Clique do mouse na cena 3D. Padrao em jogos de estrategia, point-and-click.
using UnityEngine;

public class CliqueNaCena : MonoBehaviour
{
    public Camera cam;
    public LayerMask camadasClicaveis;

    void Update()
    {
        if (!Input.GetMouseButtonDown(0)) return;

        // ScreenPointToRay converte pixel da tela em raio no mundo.
        Ray ray = cam.ScreenPointToRay(Input.mousePosition);

        // Por padrao raycast IGNORA triggers. Aqui aceitamos triggers tambem.
        if (Physics.Raycast(ray, out var hit, Mathf.Infinity,
                            camadasClicaveis, QueryTriggerInteraction.Collide))
        {
            Debug.Log($"Cliquei em {hit.collider.name} no ponto {hit.point}");
            Debug.DrawLine(ray.origin, hit.point, Color.green, 1f);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// OverlapSphere: pega todos os inimigos num raio. Perfeito para granadas,
// auras de cura, alerta sonoro de IA.
using UnityEngine;

public class Granada : MonoBehaviour
{
    public float raioExplosao = 5f;
    public int dano = 100;
    public LayerMask camadasAlvo;

    public void Explodir()
    {
        // OverlapSphere nao precisa de direcao. Retorna todos os colliders
        // dentro do raio que estejam nas layers permitidas.
        Collider[] atingidos = Physics.OverlapSphere(transform.position, raioExplosao, camadasAlvo);

        foreach (var c in atingidos)
        {
            if (c.TryGetComponent<Vida>(out var v))
            {
                // Dano cai com a distancia (linear, simples).
                float dist = Vector3.Distance(transform.position, c.transform.position);
                int d = Mathf.RoundToInt(dano * (1f - dist / raioExplosao));
                v.TomarDano(d);
            }

            if (c.attachedRigidbody != null)
            {
                // Empurra fisicamente o corpo. ForceMode.Impulse = pancada.
                Vector3 dir = (c.transform.position - transform.position).normalized;
                c.attachedRigidbody.AddForce(dir * 800f, ForceMode.Impulse);
            }
        }

        Destroy(gameObject);
    }
}`,
      },
    ],
    points: [
      "Raycast detecta o que esta numa direcao sem mover nem simular fisica.",
      "RaycastHit tras point, normal, distance, collider, rigidbody e transform.",
      "Use SphereCast para detecao de chao mais confiavel que Raycast em quinas.",
      "OverlapSphere e ideal para 'tudo num raio' sem precisar de direcao.",
      "Sempre passe LayerMask: filtra resultados e melhora performance.",
      "Por padrao raycast IGNORA triggers; passe QueryTriggerInteraction.Collide para incluir.",
      "Use Debug.DrawRay e Debug.DrawLine para visualizar raios na Scene view.",
      "Em codigo de IA chamado todo frame, prefira NonAlloc (RaycastNonAlloc, OverlapSphereNonAlloc).",
    ],
    alerts: [
      {
        type: "warning",
        content: "Triggers sao ignorados por raycast por padrao. Se sua zona de checkpoint nao detecta clique, passe QueryTriggerInteraction.Collide na chamada.",
      },
      {
        type: "tip",
        content: "Em codigo chamado todo frame, use OverlapSphereNonAlloc com array pre-alocado em vez de OverlapSphere. Voce evita gerar lixo para o Garbage Collector.",
      },
      {
        type: "info",
        content: "Para visualizar raycast durante debug: Debug.DrawRay(origem, direcao * distancia, Color.red, 2f) desenha o raio na Scene view por 2 segundos.",
      },
    ],
  },
  {
    slug: "layers-fisica",
    section: "fisica-3d",
    title: "Layers e Collision Matrix",
    difficulty: "intermediario",
    subtitle: "Como dizer ao Unity 'isso nunca colide com aquilo' sem escrever codigo.",
    intro: `Em qualquer projeto que cresce, voce comeca a precisar de regras como "balas do jogador nao machucam o jogador", "inimigos nao colidem entre si", "agua nao bloqueia raycast", "particulas atravessam tudo". Voce poderia resolver isso checando tags em OnCollisionEnter, mas isso e caro: o motor de fisica calculou a colisao, alocou contatos, te chamou no callback, e voce simplesmente ignora. Tempo perdido. A maneira certa e dizer para o motor "essas duas categorias NUNCA colidem", e ele para de calcular antes de comecar. Isso e feito atraves de Layers e da Layer Collision Matrix.

Layer e uma categoria que voce atribui a um GameObject. Unity tem 32 layers (8 reservadas, 24 livres) e voce define os nomes em Edit > Project Settings > Tags and Layers. Exemplos comuns: Player, Enemy, EnemyProjectile, PlayerProjectile, Pickup, Water, Ground, IgnoreRaycast. Atribuir uma layer e um clique no Inspector. Depois disso, em Edit > Project Settings > Physics, voce ve a Layer Collision Matrix: uma grade onde cada celula e um par de layers. Marcado = colide. Desmarcado = ignora completamente. Essa decisao e feita ANTES da simulacao, custa zero CPU em runtime.

LayerMask em codigo aparece em todo lugar (Raycast, OverlapSphere, Physics.IgnoreLayerCollision). Confusao numero um do iniciante: LayerMask e um bitmask, nao um numero de layer. Se sua layer "Enemy" e a 8, o LayerMask para essa layer e (1 << 8) = 256. Para combinar duas layers, voce faz (1 << 8) | (1 << 9). No Inspector aparece como dropdown amigavel; em codigo voce manipula bits. Tem um padrao classico: para "tudo menos Player (layer 6)", use ~(1 << 6).

Quando usar Tags e quando usar Layers? Tag e um rotulo de identificacao logica usado no codigo (CompareTag("Player")). Layer e categoria fisica/render usada pelo motor para colisao, raycast e camera (Culling Mask da camera tambem usa layer). Iniciantes confundem e tentam filtrar raycast por tag — nao da, raycast so entende layer. Como regra: use Tag para "que tipo de objeto e esse" no codigo; use Layer para "como ele participa do sistema de fisica/render".`,
    codes: [
      {
        lang: "csharp",
        code: `// Configurar via codigo: ignorar colisao entre duas layers.
// Geralmente voce faz isso no menu Project Settings > Physics.
using UnityEngine;

public class ConfigurarLayersRuntime : MonoBehaviour
{
    void Awake()
    {
        // LayerMask.NameToLayer pega o numero a partir do nome.
        int layerInimigo  = LayerMask.NameToLayer("Enemy");
        int layerProjetil = LayerMask.NameToLayer("EnemyProjectile");

        // Inimigos ignoram seus proprios projeteis.
        Physics.IgnoreLayerCollision(layerInimigo, layerProjetil, true);

        // Para reverter: passe false. Persiste durante a sessao.
    }
}`,
      },
      {
        lang: "csharp",
        code: `// LayerMask como campo serializado. No Inspector aparece dropdown.
using UnityEngine;

public class IAVisao : MonoBehaviour
{
    // No Inspector marque as layers que bloqueiam visao (Wall, Ground).
    public LayerMask camadasObstaculo;

    public Transform jogador;
    public float alcanceVisao = 20f;

    void Update()
    {
        if (jogador == null) return;

        Vector3 direcao = jogador.position - transform.position;
        float distancia = direcao.magnitude;
        if (distancia > alcanceVisao) return;

        // Lanca raio em direcao ao jogador. Se bater em obstaculo antes,
        // jogador esta escondido.
        Ray ray = new Ray(transform.position, direcao.normalized);
        if (Physics.Raycast(ray, distancia, camadasObstaculo))
        {
            Debug.Log("Jogador escondido atras de obstaculo");
        }
        else
        {
            Debug.Log("Vejo o jogador!");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Manipulacao de bits explicita. Util quando voce monta layermask
// dinamicamente em codigo.
using UnityEngine;

public class LayerMaskBits : MonoBehaviour
{
    void Start()
    {
        // Construir mask para layers 6 (Player) e 8 (Enemy).
        int mask = (1 << 6) | (1 << 8);

        // Tudo menos Water (layer 4): use NOT.
        int layerWater = LayerMask.NameToLayer("Water");
        int tudoMenosAgua = ~(1 << layerWater);

        // Atalho amigavel: GetMask aceita nomes.
        int atalho = LayerMask.GetMask("Player", "Enemy");

        Debug.Log($"mask manual = {mask}, atalho = {atalho}");

        // Mover este objeto para a layer Pickup.
        gameObject.layer = LayerMask.NameToLayer("Pickup");
    }

    // Checar se um objeto pertence a um mask:
    bool EstaNoMask(GameObject obj, LayerMask mask)
    {
        return (mask.value & (1 << obj.layer)) != 0;
    }
}`,
      },
    ],
    points: [
      "Use Layers para regras gerais 'X nao colide com Y' (configure na Collision Matrix).",
      "Use Tags para identificar tipos de objetos no codigo (CompareTag).",
      "Layer Collision Matrix decide colisoes ANTES da simulacao, custo zero em runtime.",
      "LayerMask em codigo e um bitmask: (1 << numeroDaLayer).",
      "LayerMask.GetMask('A', 'B') gera mask combinada por nomes (mais legivel).",
      "Para 'todas menos X' use o operador NOT: ~(1 << layer).",
      "Camera.cullingMask tambem usa LayerMask para decidir o que renderizar.",
      "Layer 2 (Ignore Raycast) ja vem pronta para objetos que raycast deve ignorar.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Antes de filtrar colisao com if (other.tag == ...) em OnCollisionEnter, considere desmarcar o par na Collision Matrix. Performance subir notavelmente em cenas com muitos objetos.",
      },
      {
        type: "warning",
        content: "LayerMask.NameToLayer retorna -1 se a layer nao existe. Se voce passa -1 num shift, vira undefined behavior. Sempre confira > 0 ou use GetMask que ja trata isso.",
      },
      {
        type: "info",
        content: "Voce so tem 32 layers. Em projetos grandes esse limite aperta — planeje desde o comeco e considere reaproveitar layers entre features que nunca aparecem na mesma cena.",
      },
    ],
  },
  {
    slug: "joints-3d",
    section: "fisica-3d",
    title: "Joints: conectando corpos com fisica",
    difficulty: "avancado",
    subtitle: "Hinge, Spring, Fixed e Configurable para portas, correntes, ponte e ragdolls.",
    intro: `Joints sao componentes que prendem dois Rigidbodies um ao outro com regras fisicas. Pense numa dobradica de porta real: ela conecta a porta ao batente e permite rotacao em um eixo so. No Unity, a HingeJoint faz exatamente isso. Pense num cabo de aco que segura um lustre: ele permite balancar mas mantem a distancia. SpringJoint cobre esse caso. Pense em um ragdoll: cada osso conectado ao proximo com limite de angulo. CharacterJoint resolve. Pense em duas pecas soldadas: FixedJoint as gruda. E quando nada disso serve, ConfigurableJoint te da todos os 6 graus de liberdade (3 de translacao, 3 de rotacao) com locks e limites individuais.

A regra basica de qualquer joint: ele e adicionado em UM dos dois Rigidbodies envolvidos, e voce arrasta o outro Rigidbody no campo "Connected Body". Se Connected Body fica vazio, o joint te conecta ao "mundo" (um ponto fixo no espaco). Por exemplo, uma porta tem HingeJoint nela mesma, conectada ao mundo no ponto da dobradica. Uma corrente de elos tem SpringJoint em cada elo conectando ao elo anterior.

Cada tipo de joint resolve um padrao diferente. HingeJoint da rotacao em torno de um eixo, com limites opcionais (porta abre 0 a 90 graus) e motor opcional (forca para abrir/fechar sozinha). FixedJoint cola dois corpos, util para grudar carga em veiculo ou objetos quebraveis (com break force). SpringJoint mantem distancia com elasticidade — corda, lustre, jogos de pendulo. CharacterJoint e um cone com twist, padrao para juntas humanoides. ConfigurableJoint e o canivete suico: voce escolhe quais eixos travar (Locked), limitar (Limited) ou liberar (Free), e configura drives (motores) em cada eixo. Tudo o que os outros joints fazem da para emular com Configurable.

A maior pegadinha de joints e a estabilidade. Joints sao iterativos — o motor faz N iteracoes de solucao por passo de fisica para chegar perto da resposta certa. Cadeias longas (10+ elos), massas muito diferentes (1 kg ligado a 1000 kg) e forcas extremas geram tremedeira ou explosao. Boas praticas: mantenha massas dentro de uma ordem de magnitude (entre 1 e 50 kg, por exemplo); aumente Solver Iterations no Project Settings > Physics se precisar; use connectedMassScale para "esconder" diferenca de massa do solver; e teste com Time.fixedDeltaTime mais baixo (passo mais curto) se algo balanca demais.`,
    codes: [
      {
        lang: "csharp",
        code: `// HingeJoint para uma porta. A porta tem Rigidbody, BoxCollider,
// e a dobradica fica no eixo Y da extremidade.
using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class PortaHinge : MonoBehaviour
{
    void Start()
    {
        var rb = GetComponent<Rigidbody>();
        rb.mass = 20f;
        rb.linearDamping = 1f;       // amortece para nao balancar eterno

        var hinge = gameObject.AddComponent<HingeJoint>();

        // Eixo de rotacao: Y (vertical), padrao de porta.
        hinge.axis = Vector3.up;

        // Anchor: ponto LOCAL da porta onde fica a dobradica
        // (extremidade lateral, nao o centro).
        hinge.anchor = new Vector3(-0.5f, 0f, 0f);

        // Limites: porta abre 0 a 110 graus, nao gira para tras.
        hinge.useLimits = true;
        hinge.limits = new JointLimits { min = 0f, max = 110f, bounciness = 0.1f };

        // Spring de retorno: porta fecha sozinha lentamente.
        hinge.useSpring = true;
        hinge.spring = new JointSpring { spring = 5f, damper = 1f, targetPosition = 0f };
    }
}`,
      },
      {
        lang: "csharp",
        code: `// FixedJoint para grudar caixa em veiculo. O caminhao puxa a caixa
// com fisica realista. Break force opcional faz o joint quebrar
// se a forca exceder limite.
using UnityEngine;

public class GrudarCarga : MonoBehaviour
{
    public Rigidbody veiculo;

    void Start()
    {
        var rb = GetComponent<Rigidbody>();
        rb.mass = 50f;

        var fixedJoint = gameObject.AddComponent<FixedJoint>();
        fixedJoint.connectedBody = veiculo;

        // Break force: forca em Newtons para quebrar o joint.
        // Infinity = nunca quebra. 5000 = estilo amarra que cede em batida forte.
        fixedJoint.breakForce = 5000f;
        fixedJoint.breakTorque = 5000f;
    }

    // Callback chamado quando o joint quebra.
    void OnJointBreak(float forcaQueQuebrou)
    {
        Debug.Log($"Carga soltou! Forca: {forcaQueQuebrou:F0} N");
    }
}`,
      },
      {
        lang: "csharp",
        code: `// SpringJoint para um lustre/pendulo. Conectado ao 'mundo' (sem
// connectedBody), age como se preso ao teto.
using UnityEngine;

public class Lustre : MonoBehaviour
{
    public Vector3 pontoTeto = new Vector3(0f, 5f, 0f);

    void Start()
    {
        var rb = GetComponent<Rigidbody>();
        rb.mass = 5f;

        var spring = gameObject.AddComponent<SpringJoint>();

        // Sem connectedBody = preso ao espaco no ponto connectedAnchor.
        spring.autoConfigureConnectedAnchor = false;
        spring.connectedAnchor = pontoTeto;

        // Quao rigida e a mola.
        spring.spring = 50f;
        // Quanto amortece (1 = amortecimento bom).
        spring.damper = 2f;
        // Distancia natural entre os ancores (comprimento do cabo).
        spring.minDistance = 0f;
        spring.maxDistance = 0f; // 0 = mantem distancia inicial
    }
}`,
      },
      {
        lang: "csharp",
        code: `// ConfigurableJoint para um plataforma elevador: livre em Y, travada
// em X e Z e em todas rotacoes. Mostra o poder do Configurable.
using UnityEngine;

public class ElevadorConfigurable : MonoBehaviour
{
    void Start()
    {
        var rb = GetComponent<Rigidbody>();
        rb.mass = 200f;
        rb.linearDamping = 0.5f;

        var cj = gameObject.AddComponent<ConfigurableJoint>();
        cj.connectedBody = null; // preso ao mundo

        // Translacao: Y livre, X e Z travados.
        cj.xMotion = ConfigurableJointMotion.Locked;
        cj.yMotion = ConfigurableJointMotion.Free;
        cj.zMotion = ConfigurableJointMotion.Locked;

        // Rotacao: tudo travado.
        cj.angularXMotion = ConfigurableJointMotion.Locked;
        cj.angularYMotion = ConfigurableJointMotion.Locked;
        cj.angularZMotion = ConfigurableJointMotion.Locked;

        // Drive (motor) no eixo Y para subir/descer com forca controlada.
        var drive = new JointDrive
        {
            positionSpring = 200f,
            positionDamper = 20f,
            maximumForce = float.PositiveInfinity,
        };
        cj.yDrive = drive;

        // Mover o elevador alterando targetPosition do joint.
        // (eixo invertido: targetPosition negativo = sobe)
        cj.targetPosition = new Vector3(0f, -3f, 0f);
    }
}`,
      },
    ],
    points: [
      "Joints conectam dois Rigidbodies (ou um Rigidbody ao mundo) com regras fisicas.",
      "HingeJoint: rotacao em um eixo. Ideal para portas, alavancas, bracos articulados.",
      "FixedJoint: cola dois corpos. Use breakForce para amarra que pode arrebentar.",
      "SpringJoint: distancia elastica. Cordas, lustres, granchos de gancho.",
      "ConfigurableJoint: 6 graus de liberdade individuais. Substitui qualquer outro.",
      "Mantenha massas conectadas dentro de uma ordem de magnitude para evitar tremedeira.",
      "Cadeias longas exigem mais Solver Iterations em Project Settings > Physics.",
      "OnJointBreak e chamado quando breakForce/breakTorque sao excedidos.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Joints conectando massas muito diferentes (1 kg em 1000 kg) explodem ou tremem. Use connectedMassScale e massScale para 'mentir' para o solver e estabilizar.",
      },
      {
        type: "tip",
        content: "Para correntes de mais de 8 elos, aumente Default Solver Iterations para 10-15 em Project Settings > Physics. O custo extra vale a estabilidade.",
      },
      {
        type: "info",
        content: "ConfigurableJoint pode emular HingeJoint, FixedJoint e SpringJoint com a configuracao certa. Aprenda Configurable a fundo e voce raramente precisa dos outros.",
      },
    ],
  },
  {
    slug: "character-controller",
    section: "fisica-3d",
    title: "CharacterController vs Rigidbody",
    difficulty: "avancado",
    subtitle: "A escolha que define o sentido do movimento do seu personagem.",
    intro: `Quando voce vai criar o personagem do jogador, Unity te oferece dois caminhos completamente diferentes: usar um Rigidbody com Capsule Collider (movimento fisico real) ou usar o componente CharacterController (movimento cinematico controlado). Eles parecem fazer a mesma coisa — mover personagem, detectar chao, lidar com escadas — mas filosoficamente sao opostos. Entender quando usar cada um economiza semanas de retrabalho.

CharacterController e uma capsula que voce move chamando Move(deltaPosicao). Ele detecta colisao com geometria de cena, desliza por paredes, sobe degraus de altura ate stepOffset e respeita inclinacoes ate slopeLimit. Tudo isso sem o motor de fisica simular forca alguma. Voce diz "mova 1 metro para frente" e ele tenta, parando se bater em parede. Voce e responsavel por gravidade (somar -9.81 ao seu vetor velocidade Y a cada frame). E controlado, previsivel, "game-feel" classico de FPS. NAO funciona bem com forcas externas (uma explosao nao te empurra), nao tem rotacao (sempre em pe), nao colide com outros Rigidbodies como esperado (ele nao tem massa real).

Rigidbody com Capsule e o oposto: o personagem e um corpo fisico real. Voce aplica forca, ele acelera. Bate num inimigo, empurra. Cai numa rampa, escorrega. Explosao manda ele voando. Realismo maior, mas controle menor: parar instantaneo e rampa de subida ficam dificeis. Voce precisa de codigo cuidadoso para "se sentir bem". A maioria dos jogos modernos AAA usa Rigidbody com codigo customizado por causa da flexibilidade — Sekiro, Dark Souls, Half-Life Alyx. A maioria dos jogos arcade ou FPS classico usa CharacterController por causa da resposta — Doom 2016 (custom solution proxima), muitos Unity demos.

A regra de bolso: se o jogo precisa que personagem seja empurrado por fisica do mundo (explosoes, vento, esteiras, plataformas instaveis), va de Rigidbody. Se o jogo precisa de controle pixel-perfect com pulo previsivel e sem surpresas (FPS arcade, plataformer 3D, MOBA), va de CharacterController. Se voce esta no meio do caminho, escolha CharacterController para prototipar (mais rapido) e migre se realmente precisar de fisica. Voltar de Rigidbody para CharacterController e mais doloroso.`,
    codes: [
      {
        lang: "csharp",
        code: `// CharacterController classico estilo FPS. Inclui gravidade manual,
// pulo, e detecao de chao via isGrounded. Cole em um GameObject com
// CharacterController (Add Component > Character Controller).
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class JogadorCharController : MonoBehaviour
{
    public float velocidade = 6f;
    public float forcaPulo = 5f;
    public float gravidade = -9.81f;

    private CharacterController cc;
    private Vector3 velocidadeY; // so o componente vertical, somado a parte horizontal

    void Awake() => cc = GetComponent<CharacterController>();

    void Update()
    {
        // 1. Direcao horizontal vinda do input.
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");
        Vector3 dir = transform.right * h + transform.forward * v;
        if (dir.sqrMagnitude > 1f) dir.Normalize();
        Vector3 movHorizontal = dir * velocidade;

        // 2. Gravidade aplicada manualmente (CharacterController nao faz sozinho).
        if (cc.isGrounded && velocidadeY.y < 0f)
            velocidadeY.y = -2f; // gruda no chao em rampas
        velocidadeY.y += gravidade * Time.deltaTime;

        // 3. Pulo: apenas se isGrounded.
        if (cc.isGrounded && Input.GetButtonDown("Jump"))
            velocidadeY.y = Mathf.Sqrt(forcaPulo * -2f * gravidade);

        // 4. Move recebe deslocamento por frame (multiplicado por dt).
        Vector3 mov = (movHorizontal + velocidadeY) * Time.deltaTime;
        cc.Move(mov);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Rigidbody-based character. Mais flexivel mas exige cuidado.
// Use FixedUpdate para movimento e cheque chao com SphereCast.
using UnityEngine;

[RequireComponent(typeof(Rigidbody), typeof(CapsuleCollider))]
public class JogadorRigidbody : MonoBehaviour
{
    public float velocidadeMax = 6f;
    public float aceleracao = 50f;
    public float forcaPulo = 6f;
    public LayerMask camadasChao;

    private Rigidbody rb;
    private CapsuleCollider cap;
    private bool noChao;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        cap = GetComponent<CapsuleCollider>();

        // Trava rotacao para personagem nao tombar.
        rb.constraints = RigidbodyConstraints.FreezeRotationX
                       | RigidbodyConstraints.FreezeRotationZ;
        rb.interpolation = RigidbodyInterpolation.Interpolate;
        rb.collisionDetectionMode = CollisionDetectionMode.Continuous;
    }

    void FixedUpdate()
    {
        // Detecao de chao com SphereCast no pe da capsula.
        Vector3 origem = transform.position + Vector3.up * cap.radius;
        float dist = (cap.height * 0.5f) - cap.radius + 0.05f;
        noChao = Physics.SphereCast(origem, cap.radius * 0.95f, Vector3.down,
                                    out _, dist, camadasChao);

        // Input -> velocidade alvo horizontal.
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");
        Vector3 alvoHor = (transform.right * h + transform.forward * v).normalized * velocidadeMax;

        // Aplica forca para chegar na velocidade alvo (controle preciso).
        Vector3 vel = rb.linearVelocity;
        Vector3 deltaH = alvoHor - new Vector3(vel.x, 0f, vel.z);
        rb.AddForce(deltaH * aceleracao, ForceMode.Acceleration);

        // Pulo: impulso vertical instantaneo.
        if (noChao && Input.GetButton("Jump"))
            rb.linearVelocity = new Vector3(vel.x, forcaPulo, vel.z);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Truque: empurrar Rigidbodies com CharacterController. Por padrao
// o CC nao empurra ninguem. Implemente OnControllerColliderHit.
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class CCEmpurraCorpos : MonoBehaviour
{
    public float forcaEmpurrao = 2f;

    void OnControllerColliderHit(ControllerColliderHit hit)
    {
        Rigidbody alvo = hit.collider.attachedRigidbody;

        // Filtra: nao tem rb, e kinematic, ou esta acima (eu pulei na cabeca).
        if (alvo == null || alvo.isKinematic) return;
        if (hit.moveDirection.y < -0.3f) return;

        // Empurra so na horizontal, com forca proporcional.
        Vector3 dir = new Vector3(hit.moveDirection.x, 0f, hit.moveDirection.z);
        alvo.linearVelocity = dir * forcaEmpurrao;
    }
}`,
      },
    ],
    points: [
      "CharacterController = movimento controlado, sem fisica real, ideal para FPS arcade.",
      "Rigidbody character = fisica real, reage a forcas externas, ideal para sandbox.",
      "CharacterController nao tem gravidade automatica; voce aplica manualmente.",
      "isGrounded do CC e verdadeiro depois de chamar Move com componente vertical negativo.",
      "Rigidbody character precisa de FreezeRotationX e Z para nao tombar.",
      "Para empurrar objetos com CC, implemente OnControllerColliderHit manualmente.",
      "Rigidbody character tem detecao continua de colisao, evita atravessar paredes em alta velocidade.",
      "Plataforma movel? CharacterController exige codigo extra para 'andar junto'; Rigidbody segue de graca.",
    ],
    alerts: [
      {
        type: "warning",
        content: "CharacterController IGNORA outros Rigidbodies por padrao. Se voce empurra uma caixa e nao acontece nada, e isso. Implemente OnControllerColliderHit ou troque para Rigidbody.",
      },
      {
        type: "tip",
        content: "Em CharacterController, antes de aplicar gravidade, force velocidadeY = -2 quando isGrounded. Isso 'gruda' o personagem no chao em rampas e evita 'pulinhos' na descida.",
      },
      {
        type: "info",
        content: "Para personagem AAA com fisica complexa (ragdoll, plataforma instavel, vento), Rigidbody e quase obrigatorio. Para arcade simples, CharacterController economiza dias de tuning.",
      },
    ],
  },
  {
    slug: "deteccao-colisao",
    section: "fisica-3d",
    title: "Detecao continua e tunneling",
    difficulty: "avancado",
    subtitle: "Por que sua bala atravessa a parede e como o CCD resolve.",
    intro: `Imagine uma bala viajando a 200 m/s. O Unity simula fisica em passos discretos, por padrao 50 vezes por segundo (FixedUpdate a cada 0.02s). Em um passo, a bala anda 200 * 0.02 = 4 metros. Se a parede a frente tem 0.1m de espessura, no instante T a bala esta antes da parede e no instante T+0.02 ela esta depois. A engine nunca viu o momento de contato. Ela "atravessa" sem disparar OnCollisionEnter. Esse fenomeno se chama tunneling, e e a fonte numero 1 de bugs de "minha bala/projetil/personagem em alta velocidade passa atraves de coisas".

A solucao tradicional do PhysX e o modo de detecao de colisao do Rigidbody, controlado pela propriedade collisionDetectionMode. Existem quatro modos: Discrete (padrao, rapido, sofre tunneling), Continuous (CCD basico contra colliders estaticos), ContinuousDynamic (CCD contra estaticos E outros corpos com Continuous/ContinuousDynamic) e ContinuousSpeculative (CCD baseado em previsao, mais novo, lida com rotacao melhor). Quanto mais robusto, mais caro. A regra: ative CCD apenas em corpos rapidos (projeteis, veiculos rapidos, jogador em queda extrema). Para 100 inimigos lentos, deixe Discrete.

O passo de fisica (Time.fixedDeltaTime) tambem afeta. Diminuir para 0.01 (100 Hz) reduz tunneling pela metade, mas dobra o custo de CPU. Voce ajusta isso em Project Settings > Time > Fixed Timestep. Bom valor para jogos modernos esta entre 0.0166 (60 Hz) e 0.0083 (120 Hz). Cuidado: se algum codigo seu em FixedUpdate e pesado, baixar fixedDeltaTime pode estourar o budget e gerar spiral of death (fisica fica para tras, tenta compensar, fica mais para tras).

Por fim, ha truques manuais para evitar tunneling sem CCD. O classico e disparar um Raycast do ponto anterior ate o ponto atual a cada FixedUpdate; se acertar algo, simule a colisao manualmente. Bullet Hell games usam isso porque tem 1000+ projeteis e CCD seria custoso. Outro truque: em vez de mover o projetil em um passo, mova em N sub-passos por frame. E uma forma manual de aumentar a frequencia de simulacao so para aquele objeto.`,
    codes: [
      {
        lang: "csharp",
        code: `// Configurando CCD para uma bala. Ative ContinuousDynamic se a bala
// pode bater em outros corpos dinamicos (inimigos com Rigidbody).
using UnityEngine;

[RequireComponent(typeof(Rigidbody))]
public class BalaCCD : MonoBehaviour
{
    void Awake()
    {
        var rb = GetComponent<Rigidbody>();

        // Continuous: CCD contra colliders estaticos (paredes, chao).
        // ContinuousDynamic: CCD contra estaticos E outros corpos CCD.
        // ContinuousSpeculative: previsao, lida bem com rotacao mas pode dar falsos positivos.
        rb.collisionDetectionMode = CollisionDetectionMode.ContinuousDynamic;

        // Interpolacao para visual suave.
        rb.interpolation = RigidbodyInterpolation.Interpolate;

        // Sem gravidade, sem arrasto: bala segue reto.
        rb.useGravity = false;
        rb.linearDamping = 0f;

        // Velocidade inicial alta.
        rb.linearVelocity = transform.forward * 200f;

        // Auto-destruir apos 2 segundos.
        Destroy(gameObject, 2f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Anti-tunneling manual com Raycast. Padrao em bullet hell, projeteis
// muito rapidos, ou quando voce nao quer custo de CCD em centenas de objetos.
using UnityEngine;

public class ProjetilRaycast : MonoBehaviour
{
    public float velocidade = 100f;
    public LayerMask camadasAlvo;

    private Vector3 posAnterior;

    void Start()
    {
        posAnterior = transform.position;
    }

    void Update()
    {
        // Avanca posicao manualmente (sem Rigidbody, sem fisica).
        Vector3 deslocamento = transform.forward * velocidade * Time.deltaTime;
        Vector3 novaPos = transform.position + deslocamento;

        // Raycast da posicao anterior ate a nova. Se acertar, "colide" no ponto.
        Vector3 dir = novaPos - posAnterior;
        float distancia = dir.magnitude;

        if (Physics.Raycast(posAnterior, dir.normalized, out var hit, distancia, camadasAlvo))
        {
            Debug.Log($"Projetil acertou {hit.collider.name} no ponto {hit.point}");
            transform.position = hit.point;
            Destroy(gameObject);
            return;
        }

        transform.position = novaPos;
        posAnterior = novaPos;
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Configurando o passo de fisica em runtime. Use com moderacao:
// alterar fixedDeltaTime impacta TODA a simulacao.
using UnityEngine;

public class TunarFisica : MonoBehaviour
{
    void Start()
    {
        // Padrao: 0.02 (50 Hz). Para acao mais responsiva: 0.0166 (60 Hz).
        // Para fisica de alta precisao (corrida): 0.01 (100 Hz).
        Time.fixedDeltaTime = 0.0166f;

        // maximumDeltaTime evita 'spiral of death': se um frame demora muito,
        // a fisica nao tenta processar todos os passos atrasados.
        Time.maximumDeltaTime = 0.1f;

        // Aumentar Solver Iterations melhora joints e empilhamento de caixas.
        Physics.defaultSolverIterations = 8;          // padrao 6
        Physics.defaultSolverVelocityIterations = 2;  // padrao 1
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Subdividir movimento manualmente. Util para um unico projetil onde
// voce quer maxima precisao sem mexer na fisica global.
using UnityEngine;

public class ProjetilSubpasso : MonoBehaviour
{
    public float velocidade = 300f;
    public int subPassos = 4;
    public LayerMask camadasAlvo;

    void Update()
    {
        Vector3 deslocamentoTotal = transform.forward * velocidade * Time.deltaTime;
        Vector3 passo = deslocamentoTotal / subPassos;

        for (int i = 0; i < subPassos; i++)
        {
            // Raycast do ponto atual para o proximo subpasso.
            if (Physics.Raycast(transform.position, passo.normalized, out var hit,
                                passo.magnitude, camadasAlvo))
            {
                transform.position = hit.point;
                Debug.Log($"Acertou {hit.collider.name} no subpasso {i}");
                Destroy(gameObject);
                return;
            }
            transform.position += passo;
        }
    }
}`,
      },
    ],
    points: [
      "Tunneling acontece quando um corpo viaja mais que sua espessura em um passo de fisica.",
      "Discrete e o padrao e mais barato; sofre tunneling em altas velocidades.",
      "Continuous habilita CCD contra colliders estaticos (paredes do cenario).",
      "ContinuousDynamic adiciona CCD contra outros corpos dinamicos (inimigos).",
      "ContinuousSpeculative usa previsao e lida bem com rotacao em alta velocidade.",
      "CCD e mais caro: ative SO em corpos rapidos, deixe Discrete no resto.",
      "Diminuir Time.fixedDeltaTime ajuda mas dobra custo de CPU; cuidado com spiral of death.",
      "Para muitos projeteis, prefira Raycast manual em vez de CCD em todos eles.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Bala que atravessa parede e quase sempre tunneling. Antes de pesquisar bug, ative collisionDetectionMode = ContinuousDynamic no Rigidbody do projetil e veja se some.",
      },
      {
        type: "tip",
        content: "Para projeteis em massa (bullet hell, arma metralhadora), implemente movimento por Raycast em vez de Rigidbody com CCD. CCD em 500 balas mata o framerate; raycast nao.",
      },
      {
        type: "info",
        content: "ContinuousSpeculative e o modo mais novo (Unity 2020+) e funciona contra qualquer collider, incluindo dinamicos sem CCD. Custo similar a Continuous, com tradeoff de raros falsos positivos.",
      },
    ],
  },
];
