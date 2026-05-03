import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "canvas-ui",
    section: "ui",
    title: "Canvas: a tela onde a UI vive",
    difficulty: "iniciante",
    subtitle: "Entenda o Canvas, os três Render Modes e quando usar cada um.",
    intro: `Imagine que você está montando uma vitrine de loja. A vitrine é um vidro grande na frente da loja, e tudo o que você quer mostrar para quem passa na rua precisa ser colado ali. No Unity, esse vidro se chama Canvas. Toda interface (botões, barras de vida, menus, textos, ícones) precisa estar dentro de um Canvas, porque é ele que sabe como desenhar elementos 2D na tela e como o mouse, o toque ou o controle interagem com eles.

O Canvas existe porque desenhar UI é completamente diferente de desenhar um cubo no mundo. UI precisa lidar com pixels exatos, escalas de tela, ordem de renderização (quem fica na frente de quem), e eventos de clique. Se você tentasse posicionar um botão como se fosse um GameObject 3D comum, perderia uma série de garantias: ele ficaria do tamanho errado em telas diferentes, sumiria atrás de objetos da cena e não receberia cliques. O Canvas resolve tudo isso de uma vez só.

Existem três modos de renderização, e escolher o certo é uma das primeiras decisões importantes da sua interface. O ScreenSpace-Overlay desenha a UI por cima de tudo, ignorando câmeras e mundo 3D — é o padrão e o mais usado para HUDs e menus. O ScreenSpace-Camera amarra o Canvas a uma câmera específica, o que permite usar efeitos de pós-processamento e shaders na UI. Já o WorldSpace coloca o Canvas dentro do mundo 3D, como se fosse uma placa flutuando ao lado de um inimigo, ideal para barras de vida sobre personagens ou painéis em VR.

Quando você cria um Canvas pelo menu (GameObject > UI > Canvas), o Unity automaticamente cria também um EventSystem na cena. Esse parceiro silencioso é quem traduz cliques do mouse, toques no celular e botões do controle em eventos para a UI. Sem EventSystem, nenhum botão funciona — esse é provavelmente o erro mais comum de quem começa.

Neste capítulo você vai criar Canvas dos três tipos por código, entender o GraphicRaycaster e ver como a hierarquia da Hierarchy define a ordem de desenho. Vai parecer detalhe agora, mas dominar esses fundamentos vai poupar dezenas de horas de "por que esse botão não clica?" no futuro.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;

// Cria um Canvas do tipo ScreenSpace-Overlay por código.
// Útil para entender o que o menu GameObject > UI > Canvas faz por baixo.
public class CriaCanvasOverlay : MonoBehaviour
{
    void Start()
    {
        // 1. GameObject que vai segurar o Canvas
        GameObject go = new GameObject("MeuCanvas");

        // 2. Componente Canvas: o "vidro da vitrine"
        Canvas canvas = go.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay; // padrão e mais comum

        // 3. CanvasScaler: faz a UI escalar entre celular pequeno e monitor 4K
        CanvasScaler scaler = go.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1920, 1080);

        // 4. GraphicRaycaster: sem ele, nenhum clique chega na UI
        go.AddComponent<GraphicRaycaster>();
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;

// Cria um Canvas WorldSpace, que vive dentro do mundo 3D.
// Perfeito para barras de vida em cima de inimigos ou placas em VR.
public class CriaCanvasWorld : MonoBehaviour
{
    [SerializeField] private Transform alvo; // o personagem que segue
    private Canvas canvas;

    void Start()
    {
        GameObject go = new GameObject("HUDInimigo");
        canvas = go.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.WorldSpace;

        // No WorldSpace o Canvas tem tamanho real em metros.
        // Reduzimos para parecer um painel pequeno (1m x 0.3m).
        RectTransform rt = canvas.GetComponent<RectTransform>();
        rt.sizeDelta = new Vector2(100, 30);
        rt.localScale = Vector3.one * 0.01f; // 1cm por unidade

        go.AddComponent<GraphicRaycaster>();
    }

    void LateUpdate()
    {
        if (alvo == null || canvas == null) return;
        // Mantém o painel sempre acima do alvo e virado para a câmera (billboard).
        canvas.transform.position = alvo.position + Vector3.up * 2f;
        canvas.transform.forward = Camera.main.transform.forward;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Demonstra a diferença entre os três Render Modes em runtime.
// Coloque este script em qualquer GameObject e troque pelo Inspector.
public class TrocaRenderMode : MonoBehaviour
{
    [SerializeField] private Canvas canvas;
    [SerializeField] private Camera cameraUI;

    public void UsarOverlay()
    {
        // Desenha por cima de tudo, ignora câmera. Mais barato.
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
    }

    public void UsarCamera()
    {
        // Desenha através de uma câmera. Permite pós-processamento e shaders 3D na UI.
        canvas.renderMode = RenderMode.ScreenSpaceCamera;
        canvas.worldCamera = cameraUI;
        canvas.planeDistance = 1f; // distância do plano da UI à câmera
    }

    public void UsarWorld()
    {
        // Vira um objeto no mundo. Perde resolução de pixel mas ganha integração 3D.
        canvas.renderMode = RenderMode.WorldSpace;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;

// A ordem de renderização da UI segue a ordem na Hierarchy:
// quem está EMBAIXO na lista aparece NA FRENTE na tela.
// Este script demonstra isso movendo um elemento para o topo do desenho.
public class TrazerParaFrente : MonoBehaviour
{
    [SerializeField] private RectTransform painel;

    public void TrazerNaFrente()
    {
        // SetAsLastSibling joga o transform para o final da lista de filhos,
        // ou seja, ele passa a ser desenhado por cima dos irmãos.
        painel.SetAsLastSibling();
    }

    public void MandarParaTras()
    {
        // SetAsFirstSibling faz o oposto: vai para o início e fica atrás.
        painel.SetAsFirstSibling();
    }
}`,
      },
    ],
    points: [
      "Toda UI no Unity precisa estar dentro de um Canvas, sempre.",
      "ScreenSpace-Overlay é o padrão: rápido, simples e ignora câmeras.",
      "ScreenSpace-Camera permite efeitos de shader e pós-processamento na UI.",
      "WorldSpace transforma o Canvas em um objeto 3D do mundo (ideal para VR e barras de vida).",
      "Sem EventSystem na cena, nenhum botão recebe clique.",
      "GraphicRaycaster é obrigatório no Canvas para detectar interação do mouse/toque.",
      "A ordem na Hierarchy define a ordem de desenho: filho mais embaixo aparece na frente.",
      "Erro clássico do iniciante: deletar o EventSystem por engano e ficar caçando bug por horas.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Se você apagar o EventSystem da cena, todos os botões param de funcionar silenciosamente. Não há erro no console. Sempre que um clique não responder, abra a Hierarchy e procure por EventSystem.",
      },
      {
        type: "tip",
        content: "Para barras de vida acima de personagens, prefira WorldSpace com billboard (sempre virado para a câmera). É mais natural do que tentar projetar coordenadas 3D para 2D toda hora.",
      },
      {
        type: "info",
        content: "ScreenSpace-Overlay desenha a UI depois de toda a cena, então ela ignora pós-processamento. Se você quer um blur na UI ao abrir um menu de pausa, vai precisar de ScreenSpace-Camera ou de uma câmera dedicada com Render Texture.",
      },
    ],
  },
  {
    slug: "anchors-pivot",
    section: "ui",
    title: "Anchors e Pivot: o segredo da UI responsiva",
    difficulty: "iniciante",
    subtitle: "Por que sua UI quebra em telas diferentes e como resolver com âncoras e pivot.",
    intro: `Você já abriu um jogo no celular e viu o botão de pause cortado pela borda da tela? Ou um menu que ficava perfeito no editor mas no aparelho real estava deslocado? Quase sempre o culpado é o mesmo: anchors e pivot mal configurados. Esses dois conceitos são, de longe, o que mais confunde quem começa com UI no Unity, mas também é o que separa interfaces amadoras de interfaces que funcionam em qualquer tela.

Pense em uma moldura de quadro pendurada na parede. O pivot é o pregador onde o quadro está pendurado dentro da moldura: se você gira o quadro, ele gira em torno desse ponto. Já as âncoras (anchors) são os pregos na parede: elas dizem em quais cantos da parede a moldura está fixada. Se você fixa o quadro pelos quatro cantos da parede, ele estica quando a parede aumenta. Se você fixa só pelo canto superior esquerdo, ele fica do mesmo tamanho mas se desloca conforme a parede cresce.

No Unity, "parede" é o pai do RectTransform (geralmente o Canvas, mas pode ser qualquer outro RectTransform). As âncoras são quatro pontos que você posiciona em qualquer lugar dentro do retângulo do pai, e o filho se relaciona com esses pontos. Se você juntar as quatro âncoras em um ponto só (canto superior direito, por exemplo), o filho vai manter um tamanho fixo e seguir aquele canto. Se você espalhar as âncoras nos quatro cantos do pai, o filho vai esticar junto com o pai. Esse é o segredo da UI que se adapta sem código.

O pivot, separado disso, é onde "está a alça" do filho — o ponto em torno do qual ele rotaciona, escala e é posicionado. Pivot (0,0) é canto inferior esquerdo, (1,1) é canto superior direito, e (0.5, 0.5) é o centro (padrão). Trocar o pivot muda completamente onde o RectTransform aparece quando você muda position, então mudar pivot depois do layout pronto costuma bagunçar tudo. Por isso a regra é: defina pivot ANTES de posicionar.

A combinação de anchors e pivot resolve quase todos os problemas de layout sem precisar de código. Cabeçalho que estica horizontalmente mas tem altura fixa? Âncoras esticadas em X, juntas em Y. Botão flutuante no canto inferior direito que sempre fica a 20px da borda? Âncoras juntas em (1,0). Painel central que ocupa metade da tela em qualquer resolução? Âncoras esticadas em ambos os eixos com offset. Vamos ver isso na prática.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Configura um RectTransform para ficar SEMPRE no canto inferior direito,
// com tamanho fixo de 200x80, a 20 pixels da borda.
// Padrão "botão flutuante" tipo o de pause em um jogo mobile.
public class AnclaCantoInferiorDireito : MonoBehaviour
{
    void Start()
    {
        RectTransform rt = GetComponent<RectTransform>();

        // Âncoras juntas no canto inferior direito do pai (1, 0).
        rt.anchorMin = new Vector2(1f, 0f);
        rt.anchorMax = new Vector2(1f, 0f);

        // Pivot também no canto inferior direito do PRÓPRIO retângulo.
        rt.pivot = new Vector2(1f, 0f);

        // Tamanho fixo (não estica)
        rt.sizeDelta = new Vector2(200f, 80f);

        // Offset em relação à âncora: 20px à esquerda e 20px acima.
        rt.anchoredPosition = new Vector2(-20f, 20f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Faz um cabeçalho ESTICAR horizontalmente com altura fixa de 60px.
// Funciona em qualquer resolução: 720p, 1080p, ultrawide, celular.
public class CabecalhoEsticado : MonoBehaviour
{
    void Start()
    {
        RectTransform rt = GetComponent<RectTransform>();

        // Âncoras esticadas em X (de 0 a 1) e juntas em Y no topo (1, 1).
        rt.anchorMin = new Vector2(0f, 1f);
        rt.anchorMax = new Vector2(1f, 1f);

        // Pivot no topo central — facilita posicionar pelo Y do topo.
        rt.pivot = new Vector2(0.5f, 1f);

        // Quando a âncora estica, sizeDelta vira "diferença em relação à âncora".
        // X = 0 significa "do lado esquerdo ao direito do pai".
        // Y = 60 significa "60 pixels de altura".
        rt.sizeDelta = new Vector2(0f, 60f);

        // Cola no topo (anchoredPosition.y = 0 porque pivot e âncora coincidem em Y).
        rt.anchoredPosition = Vector2.zero;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Painel central que sempre ocupa 80% da tela com 10% de margem em cada lado.
// As âncoras esticadas em ambos os eixos com sizeDelta zero fazem isso.
public class PainelCentralResponsivo : MonoBehaviour
{
    void Start()
    {
        RectTransform rt = GetComponent<RectTransform>();

        // Âncoras esticadas mas com 10% de margem dos cantos.
        rt.anchorMin = new Vector2(0.1f, 0.1f);
        rt.anchorMax = new Vector2(0.9f, 0.9f);

        rt.pivot = new Vector2(0.5f, 0.5f);

        // sizeDelta = 0 faz o retângulo coincidir EXATAMENTE com as âncoras.
        rt.sizeDelta = Vector2.zero;
        rt.anchoredPosition = Vector2.zero;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Demonstra como o PIVOT muda o ponto em volta do qual a UI escala/rotaciona.
// Útil para animações: girar um botão a partir do canto, escalar a partir da base.
public class GiraPorPivot : MonoBehaviour
{
    [SerializeField] private RectTransform alvo;

    void Update()
    {
        // Mude o pivot no Inspector e veja a rotação acontecer em volta dele.
        // Pivot (0,0) -> gira em torno do canto inferior esquerdo.
        // Pivot (1,1) -> gira em torno do canto superior direito.
        // Pivot (0.5, 0.5) -> gira em torno do centro (padrão).
        alvo.Rotate(0f, 0f, 30f * Time.deltaTime);
    }
}`,
      },
    ],
    points: [
      "Anchors definem como o filho se posiciona/estica em relação ao pai.",
      "Pivot define o ponto interno do filho usado para posição, rotação e escala.",
      "Âncoras juntas = tamanho fixo; âncoras separadas = estica com o pai.",
      "Para botão flutuante em canto, junte âncoras e pivot no mesmo canto.",
      "Para cabeçalho/rodapé, estique X e junte Y; sizeDelta.x = 0 fica largura total.",
      "Mude o pivot ANTES de posicionar — depois bagunça o layout.",
      "Erro comum: ancorar tudo no centro e ver a UI se descolar em telas diferentes.",
      "Quando em dúvida, abra o jogo em várias resoluções no Game View para validar.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Segure Alt ao clicar no botão de presets de âncora (canto superior esquerdo do RectTransform no Inspector) para que o Unity já posicione o elemento no preset escolhido. Segure Shift ao mesmo tempo para mover o pivot junto.",
      },
      {
        type: "warning",
        content: "Mudar pivot depois que o layout está montado vai deslocar visualmente o elemento, mesmo sem você mexer em position. Sempre defina pivot na criação e não toque mais.",
      },
      {
        type: "info",
        content: "Quando as âncoras estão esticadas (anchorMin diferente de anchorMax), o sizeDelta deixa de significar 'tamanho absoluto' e passa a significar 'diferença em relação às âncoras'. Por isso sizeDelta = 0 faz o filho ocupar o tamanho exato definido pelas âncoras.",
      },
    ],
  },
  {
    slug: "ui-elementos",
    section: "ui",
    title: "Elementos UGUI: Image, Button, Slider, Toggle e amigos",
    difficulty: "iniciante",
    subtitle: "Os blocos de construção da UI clássica do Unity, com exemplos práticos.",
    intro: `Se o Canvas é a vitrine e os anchors são os ganchos, os elementos UGUI são os produtos que você coloca dentro. Image, RawImage, Text, Button, Slider, Toggle, ScrollRect e InputField são os componentes prontos que cobrem 95% das interfaces que você vai precisar fazer. Eles existem desde o Unity 4.6 e formam o sistema chamado uGUI (Unity GUI), que ainda é o padrão da maioria dos projetos comerciais.

A escolha desses componentes não é aleatória. Cada um resolve um problema clássico de interface: Image mostra um sprite com cor, máscara e fill (perfeito para barras de vida); Text exibe texto simples (mas hoje preferimos o TextMeshPro); Button é um Image que dispara um evento ao receber clique; Slider é uma barra com valor entre min e max; Toggle é uma caixa de marcar/desmarcar; ScrollRect cria áreas roláveis para conteúdo grande; InputField recebe digitação. Saber qual usar em cada situação economiza muito código.

Algo que não fica óbvio no começo é que todos esses elementos compartilham uma base chamada Graphic. Isso significa que eles têm propriedades em comum: cor, material, raycast target. O raycast target é a propriedade que decide se o elemento bloqueia ou não o clique. Se você tem uma Image grande de fundo e ela está marcada como raycast target, ela vai engolir o clique antes de chegar nos botões por baixo. Desmarcar essa opção em decorações (que não precisam interagir) é uma das otimizações mais simples e efetivas que existem.

Outro ponto importante: o Button do uGUI funciona em conjunto com um Image (o gráfico que ele exibe) e responde a transições visuais (Color Tint, Sprite Swap, Animation). Você não precisa programar mudança de cor ao passar o mouse — o Button faz isso por você se você configurar Highlighted Color. O OnClick é uma UnityEvent serializável, o que significa que você pode ligar funções pelo Inspector sem escrever uma linha de código. Mas neste livro vamos ver as duas formas: pelo Inspector e por código, porque cada uma tem seu lugar.

Vamos construir, neste capítulo, exemplos reais: um botão que muda texto ao clicar, uma barra de vida com Image preenchida, um slider de volume, um toggle de configuração e um InputField de nome. Cada um com código pronto para colar e testar.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;
using TMPro;

// Botão que muda o texto a cada clique.
// Mostra como ligar um listener por código (sem usar o Inspector).
[RequireComponent(typeof(Button))]
public class BotaoContador : MonoBehaviour
{
    [SerializeField] private TMP_Text label;
    private int cliques = 0;

    void Awake()
    {
        Button botao = GetComponent<Button>();
        // AddListener registra a função para ser chamada no OnClick.
        botao.onClick.AddListener(AoClicar);
    }

    void AoClicar()
    {
        cliques++;
        label.text = $"Você clicou {cliques} vez(es)";
    }

    void OnDestroy()
    {
        // Boa prática: remover listeners ao destruir para evitar referências mortas.
        GetComponent<Button>().onClick.RemoveListener(AoClicar);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;

// Barra de vida usando uma Image com Image Type = Filled.
// O fillAmount vai de 0 (vazio) a 1 (cheio) e a Image preenche proporcionalmente.
public class BarraDeVida : MonoBehaviour
{
    [SerializeField] private Image preenchimento; // Image Type = Filled, Method = Horizontal
    [SerializeField] private float vidaMaxima = 100f;
    private float vidaAtual;

    void Start()
    {
        vidaAtual = vidaMaxima;
        Atualizar();
    }

    public void Dano(float valor)
    {
        vidaAtual = Mathf.Max(0f, vidaAtual - valor);
        Atualizar();
    }

    public void Curar(float valor)
    {
        vidaAtual = Mathf.Min(vidaMaxima, vidaAtual + valor);
        Atualizar();
    }

    void Atualizar()
    {
        // fillAmount sempre entre 0 e 1
        preenchimento.fillAmount = vidaAtual / vidaMaxima;

        // Cor muda de verde para vermelho conforme a vida cai (interpolação linear).
        preenchimento.color = Color.Lerp(Color.red, Color.green, preenchimento.fillAmount);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;
using TMPro;

// Slider de volume que atualiza um label e salva no PlayerPrefs.
// Padrão para tela de configurações de áudio.
public class SliderVolume : MonoBehaviour
{
    [SerializeField] private Slider slider;
    [SerializeField] private TMP_Text labelPercentual;
    [SerializeField] private AudioSource audioSource;
    private const string CHAVE = "volume";

    void Start()
    {
        // Carrega valor salvo (1f = 100% por padrão na primeira vez).
        slider.value = PlayerPrefs.GetFloat(CHAVE, 1f);
        AoMudar(slider.value);

        // O Slider expõe um UnityEvent<float> chamado onValueChanged.
        slider.onValueChanged.AddListener(AoMudar);
    }

    void AoMudar(float valor)
    {
        audioSource.volume = valor;
        labelPercentual.text = $"{Mathf.RoundToInt(valor * 100f)}%";
        PlayerPrefs.SetFloat(CHAVE, valor);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;
using TMPro;

// Toggle de "modo escuro" + InputField para nome do jogador.
// Demonstra dois componentes que iniciantes confundem com botão.
public class ConfiguracoesBasicas : MonoBehaviour
{
    [SerializeField] private Toggle modoEscuro;
    [SerializeField] private TMP_InputField campoNome;
    [SerializeField] private TMP_Text saudacao;

    void Start()
    {
        // Toggle dispara onValueChanged com bool quando alguém clica.
        modoEscuro.onValueChanged.AddListener(AoTrocarTema);

        // InputField dispara onValueChanged a cada tecla; onEndEdit ao sair do campo.
        campoNome.onEndEdit.AddListener(AoConfirmarNome);
    }

    void AoTrocarTema(bool escuro)
    {
        Camera.main.backgroundColor = escuro ? Color.black : Color.white;
    }

    void AoConfirmarNome(string nome)
    {
        // Validação simples: ignora vazio.
        if (string.IsNullOrWhiteSpace(nome)) return;
        saudacao.text = $"Olá, {nome.Trim()}!";
    }
}`,
      },
    ],
    points: [
      "Image é o componente mais usado: cor, sprite, máscara e fill em um só.",
      "Button é só um Image com lógica de clique e estados visuais (normal/hover/pressed).",
      "Slider tem onValueChanged(float); Toggle tem onValueChanged(bool); InputField tem onEndEdit(string).",
      "Desmarque Raycast Target em decorações para ganhar performance e evitar bloqueio de cliques.",
      "Image Type = Filled é o jeito padrão de fazer barra de vida ou progresso.",
      "Sempre prefira TMP_Text e TMP_InputField (TextMeshPro) ao Text/InputField legados.",
      "Use AddListener por código quando o botão é instanciado dinamicamente (loja, inventário).",
      "Use OnClick pelo Inspector quando o botão é estático na cena (menus simples).",
    ],
    alerts: [
      {
        type: "tip",
        content: "Para criar uma 'lista de itens' (inventário, loja), faça um único prefab de item com Button e instancie ele com Instantiate dentro de um pai com VerticalLayoutGroup. Ligue o listener por código passando o índice ou o item correspondente.",
      },
      {
        type: "warning",
        content: "Image com Raycast Target ligado e cobrindo a tela inteira é a causa número um de 'meu botão não clica'. Sempre confira se há uma Image invisível ou um painel de fundo bloqueando os cliques.",
      },
      {
        type: "info",
        content: "O componente Text legado ainda existe por compatibilidade, mas todo projeto novo deve usar TextMeshPro. A diferença de qualidade visual e performance é gritante, especialmente em telas de alta densidade.",
      },
    ],
  },
  {
    slug: "eventos-ui",
    section: "ui",
    title: "EventSystem, GraphicRaycaster e o fluxo do clique",
    difficulty: "intermediario",
    subtitle: "Entenda como um clique do mouse vira uma chamada do seu OnClick.",
    intro: `Quando você clica em um botão dentro do jogo, o que acontece? À primeira vista parece mágica: o cursor toca um pixel e o método registrado no OnClick é executado. Mas existe uma cadeia bem definida de componentes responsáveis por essa tradução, e entender essa cadeia é o que vai permitir você resolver bugs sutis como "o botão não clica em algumas posições" ou "o clique passa por dois botões ao mesmo tempo".

Tudo começa com o EventSystem, um GameObject solitário que o Unity cria automaticamente quando você adiciona o primeiro Canvas. Ele tem dois componentes principais: o EventSystem em si (que coordena tudo) e um Input Module (Standalone Input Module no Input legado, ou InputSystemUIInputModule se você usa o novo Input System). O Input Module fica monitorando mouse, toque e teclado e gera eventos abstratos como "ponteiro pressionado em (x, y)".

Esses eventos chegam então nos Raycasters. O GraphicRaycaster (que vive em cada Canvas) traduz a posição do ponteiro em uma lista ordenada de elementos UI atingidos. Existe também o Physics Raycaster (para objetos 3D com colliders) e o Physics2DRaycaster. O Event System pega o resultado dos raycasters, ordena pelo "topmost" (o que está visualmente na frente) e dispara o evento apropriado: pointer enter, pointer down, pointer click, drag, drop, etc.

Cada elemento UI que quer receber esses eventos implementa interfaces como IPointerClickHandler, IDragHandler, IPointerEnterHandler. O Button implementa internamente IPointerClickHandler e dispara o UnityEvent onClick. Você pode escrever os seus próprios componentes implementando essas interfaces para criar comportamentos customizados — um item arrastável de inventário, por exemplo, implementa IBeginDragHandler, IDragHandler e IEndDragHandler.

Saber esse fluxo desbloqueia o uso do EventTrigger (componente que expõe os eventos no Inspector) e do método EventSystem.RaycastAll (que retorna todos os elementos sob o ponteiro, útil para tooltips e debug). Também explica por que múltiplos canvas ou um GraphicRaycaster ausente quebra a interação. Vamos ver tudo isso com código.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.EventSystems;

// Componente que reage a hover, clique e arrasto.
// Implementa as interfaces direto, sem depender do Button ou EventTrigger.
public class CartaInterativa : MonoBehaviour,
    IPointerEnterHandler, IPointerExitHandler,
    IPointerClickHandler, IBeginDragHandler, IDragHandler
{
    private Vector3 escalaOriginal;
    private RectTransform rt;
    private Vector2 offsetArrasto;

    void Awake()
    {
        rt = GetComponent<RectTransform>();
        escalaOriginal = rt.localScale;
    }

    public void OnPointerEnter(PointerEventData e)
    {
        // Aumenta levemente quando o mouse passa por cima.
        rt.localScale = escalaOriginal * 1.1f;
    }

    public void OnPointerExit(PointerEventData e)
    {
        rt.localScale = escalaOriginal;
    }

    public void OnPointerClick(PointerEventData e)
    {
        Debug.Log($"Clique detectado em {name} com botão {e.button}");
    }

    public void OnBeginDrag(PointerEventData e)
    {
        // Guarda a diferença entre o ponteiro e o canto da carta para arrastar suavemente.
        offsetArrasto = (Vector2)rt.position - e.position;
    }

    public void OnDrag(PointerEventData e)
    {
        rt.position = e.position + offsetArrasto;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections.Generic;

// Pergunta ao EventSystem: o que está debaixo do ponteiro neste exato momento?
// Útil para tooltips, debug e para evitar que o jogador clique no mundo
// quando a UI está em cima do mouse.
public class ChecaPonteiro : MonoBehaviour
{
    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            // Se há QUALQUER elemento de UI sob o mouse, ignore o clique no mundo.
            if (EventSystem.current.IsPointerOverGameObject())
            {
                Debug.Log("Clique foi na UI, não propagar ao mundo.");
                return;
            }

            // Se quiser saber QUAIS elementos estão sob o mouse:
            PointerEventData ped = new PointerEventData(EventSystem.current);
            ped.position = Input.mousePosition;

            List<RaycastResult> resultados = new List<RaycastResult>();
            EventSystem.current.RaycastAll(ped, resultados);

            foreach (var r in resultados)
            {
                Debug.Log($"Elemento sob o mouse: {r.gameObject.name}");
            }
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

// Garante que a cena tenha EventSystem mesmo se você esqueceu de criar.
// Útil em prefabs de UI que precisam funcionar carregados em cenas vazias.
public static class GarantiaEventSystem
{
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void Garante()
    {
        if (EventSystem.current != null) return;

        GameObject go = new GameObject("EventSystem");
        go.AddComponent<EventSystem>();
        // No Input System novo, troque a linha abaixo por InputSystemUIInputModule.
        go.AddComponent<StandaloneInputModule>();
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;

// Demonstra o Raycast Target: por que um Image grande pode 'engolir' cliques.
// Coloque este script em uma Image que cobre a tela e desabilite o raycast
// quando o jogo estiver rodando, para deixar os botões abaixo funcionarem.
[RequireComponent(typeof(Image))]
public class FundoNaoBloqueador : MonoBehaviour
{
    void Awake()
    {
        // Decoração nunca precisa receber clique. Sempre desligue.
        GetComponent<Image>().raycastTarget = false;
    }
}`,
      },
    ],
    points: [
      "EventSystem é o coordenador; sem ele, nenhuma UI responde a input.",
      "GraphicRaycaster é o tradutor de pixel para elemento UI dentro de um Canvas.",
      "Input Module (Standalone ou InputSystemUI) lê mouse/toque/teclado e gera eventos.",
      "Implemente interfaces (IPointerClickHandler, IDragHandler) para comportamentos customizados.",
      "EventSystem.IsPointerOverGameObject() evita propagar cliques da UI para o mundo 3D.",
      "RaycastAll retorna todos os elementos sob o ponteiro, ordenados pelo mais 'na frente'.",
      "Raycast Target em Image deve estar desligado em decorações (performance + evita bloqueio).",
      "Pegadinha: dois Canvas com mesmo Sort Order podem brigar pelo clique imprevisivelmente.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Se você migrou para o novo Input System mas o EventSystem ainda tem StandaloneInputModule, os cliques não chegam. Troque para InputSystemUIInputModule (botão aparece direto no Inspector do EventSystem).",
      },
      {
        type: "tip",
        content: "Para tooltips, em vez de criar EventTriggers em cada item, faça um único componente IPointerEnterHandler/IPointerExitHandler no prefab e centralize a lógica de mostrar/esconder o tooltip num TooltipManager.",
      },
      {
        type: "info",
        content: "EventTrigger é prático mas tem custo: ele bloqueia outras interfaces na hierarquia. Para casos performáticos prefira implementar IPointerClickHandler diretamente no script do componente.",
      },
    ],
  },
  {
    slug: "ugui-vs-toolkit",
    section: "ui",
    title: "uGUI vs UI Toolkit: qual escolher em 2024+",
    difficulty: "intermediario",
    subtitle: "Comparativo honesto entre o sistema clássico e o novo, com critérios práticos.",
    intro: `O Unity hoje tem dois sistemas oficiais de UI que coexistem, e essa é uma das maiores fontes de confusão para quem está começando ou iniciando um projeto novo. O sistema antigo se chama uGUI (também chamado de Unity UI), introduzido em 2014 com o Unity 4.6 e baseado em GameObjects, RectTransform, Canvas e componentes como Image, Button, Text. O sistema novo se chama UI Toolkit (antigo UIElements), inicialmente lançado para o editor e em 2021 disponibilizado também para runtime, baseado em arquivos UXML (estrutura) e USS (estilos), inspirado em HTML e CSS da web.

Antes de escolher, é importante entender por que a Unity criou um segundo sistema. O uGUI foi feito quando dispositivos eram mais simples e quando a Unity ainda apostava em "tudo é GameObject". Com o tempo, ficaram claros os limites: cada elemento UI é um GameObject pesado, layouts complexos exigem muitos Layout Groups aninhados (o que custa caro), e o estilo precisa ser configurado elemento por elemento. Para uma loja com 200 itens, isso vira problema de performance.

O UI Toolkit nasceu para resolver isso. Ele renderiza tudo em um único draw call (na maioria dos casos), separa estrutura (UXML) de aparência (USS) como na web, e tem sistema de layout flex (igual ao Flexbox do CSS) embutido. Isso significa que uma loja com 1000 itens roda muito mais leve, e que designers podem mexer na aparência sem editar prefabs. A contrapartida é que UI Toolkit ainda é mais novo, tem menos tutoriais, suporta menos efeitos visuais avançados (gradientes complexos, materiais customizados) e a integração com animação ainda é menos madura.

A regra prática que funciona em produção hoje (2024 em diante): para HUDs de jogo, telas com efeitos visuais ricos (partículas, shaders), VR/AR e qualquer UI que precise de interação 3D — use uGUI. Para menus, telas de configuração, ferramentas de editor, debug interno e listas grandes — use UI Toolkit. E sim, você pode usar os dois no mesmo projeto sem problema. Não é um casamento; é uma caixa de ferramentas.

Neste capítulo vamos comparar lado a lado o mesmo elemento (um botão "Iniciar Jogo") nos dois sistemas, mostrando o código equivalente. Isso vai te dar critério para a próxima decisão de projeto.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;
using TMPro;

// Botão "Iniciar Jogo" em uGUI.
// Você precisa criar um GameObject com Image+Button+TMP_Text na cena (ou prefab).
public class BotaoIniciaruGUI : MonoBehaviour
{
    [SerializeField] private Button botao;
    [SerializeField] private TMP_Text label;

    void Awake()
    {
        label.text = "Iniciar Jogo";
        botao.onClick.AddListener(IniciarJogo);
    }

    void IniciarJogo()
    {
        Debug.Log("uGUI: jogo iniciado");
    }
}`,
      },
      {
        lang: "uxml",
        code: `<!-- TelaInicial.uxml: o equivalente em UI Toolkit -->
<!-- Estrutura declarativa, parecida com HTML. -->
<ui:UXML xmlns:ui="UnityEngine.UIElements">
    <ui:VisualElement name="raiz" class="container">
        <ui:Label text="Meu Jogo" class="titulo"/>
        <ui:Button name="btn-iniciar" text="Iniciar Jogo" class="botao-primario"/>
    </ui:VisualElement>
</ui:UXML>`,
      },
      {
        lang: "uss",
        code: `/* TelaInicial.uss: estilos separados, parecidos com CSS */
.container {
    flex-grow: 1;
    align-items: center;
    justify-content: center;
    background-color: rgb(20, 20, 30);
}

.titulo {
    font-size: 48px;
    color: white;
    margin-bottom: 30px;
}

.botao-primario {
    width: 240px;
    height: 60px;
    background-color: rgb(100, 150, 255);
    color: white;
    font-size: 20px;
    border-radius: 8px;
}

.botao-primario:hover {
    background-color: rgb(130, 180, 255);
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UIElements;

// Botão "Iniciar Jogo" em UI Toolkit.
// Coloque este script em um GameObject com UIDocument e arraste TelaInicial.uxml/uss.
public class BotaoIniciarToolkit : MonoBehaviour
{
    [SerializeField] private UIDocument documento;

    void OnEnable()
    {
        // rootVisualElement é a 'view' raiz do UXML carregado.
        VisualElement raiz = documento.rootVisualElement;

        // Q<Button> procura o primeiro Button com aquele name (igual querySelector na web).
        Button botao = raiz.Q<Button>("btn-iniciar");
        botao.clicked += IniciarJogo;
    }

    void IniciarJogo()
    {
        Debug.Log("UI Toolkit: jogo iniciado");
    }
}`,
      },
    ],
    points: [
      "uGUI: maduro, fácil para HUD com efeitos visuais e integração 3D.",
      "UI Toolkit: moderno, separa estrutura (UXML) e estilo (USS), mais leve para listas grandes.",
      "uGUI usa GameObjects e RectTransform; UI Toolkit usa VisualElement e flex layout.",
      "Para menus complexos com muitos itens, UI Toolkit ganha em performance.",
      "Para HUD com partículas, shaders e world space, uGUI ganha em flexibilidade visual.",
      "Você pode usar os dois sistemas no mesmo projeto sem conflito.",
      "UI Toolkit ainda tem menos tutoriais e plugins de terceiros que uGUI.",
      "Editor tools customizadas no Unity moderno são feitas em UI Toolkit (e só nele).",
    ],
    alerts: [
      {
        type: "info",
        content: "Toda interface NOVA do Unity Editor (a partir do 2022 LTS) é feita em UI Toolkit. Aprender UI Toolkit é obrigatório se você for fazer ferramentas de editor para o seu time.",
      },
      {
        type: "warning",
        content: "UI Toolkit em runtime ainda não suporta materiais customizados nem shaders nos elementos da mesma forma que uGUI. Se sua UI depende de efeitos shader-heavy (distorção, chromatic aberration por elemento), uGUI continua sendo a escolha.",
      },
      {
        type: "tip",
        content: "Comece projetos novos definindo a regra clara: 'menus e configurações em UI Toolkit, HUD de jogo em uGUI'. Misturar tudo sem critério leva a um projeto bagunçado e a refatorações dolorosas.",
      },
    ],
  },
  {
    slug: "ui-toolkit",
    section: "ui",
    title: "UI Toolkit em runtime: UXML, USS e VisualElement",
    difficulty: "avancado",
    subtitle: "Crie interfaces declarativas inspiradas em HTML/CSS, com data binding e queries.",
    intro: `Se você já mexeu com HTML e CSS, vai se sentir em casa no UI Toolkit. A ideia é exatamente a mesma: estrutura em uma linguagem de marcação (UXML, equivalente ao HTML), aparência em uma folha de estilo (USS, equivalente ao CSS), e lógica em C# manipulando uma árvore de elementos (VisualElement, equivalente ao DOM). Essa separação de preocupações é a maior força do sistema, porque permite que designer mexa em UXML/USS e programador mexa em C# sem pisar no pé um do outro.

O coração do UI Toolkit em runtime é o componente UIDocument. Você adiciona ele em um GameObject, atribui um arquivo UXML chamado de Source Asset e, opcionalmente, um Theme Style Sheet com USS. Quando a cena carrega, o UIDocument lê o UXML, monta a árvore de VisualElement em memória e renderiza tudo em uma textura única. Isso é radicalmente diferente do uGUI, onde cada elemento é um GameObject e cada Image é um draw call (se não estiverem em batches).

Outra mudança grande é o sistema de layout. Em uGUI, você posiciona elementos com RectTransform, anchors e pivot. Em UI Toolkit, você usa Flexbox: cada container distribui filhos com flex-direction (row ou column), align-items, justify-content, e os filhos podem ter flex-grow, flex-shrink, flex-basis. Para quem vem da web, é o mesmo modelo. Para quem vem só do Unity, é uma curva de aprendizado, mas o resultado vale: layouts responsivos saem naturalmente.

Para selecionar elementos por código, você usa o método Q (de Query) que funciona como o querySelector da web: raiz.Q<Button>("nome") busca por nome, raiz.Query<Label>(className: "destaque").ToList() busca por classe USS. Eventos são registrados com RegisterCallback ou com APIs específicas como botao.clicked += handler. Existe também data binding nativo (com SerializedObject e PropertyField), o que torna ferramentas de editor extremamente produtivas.

Vamos construir um painel de inventário simples em UI Toolkit, com lista de itens, scroll, hover effect e clique. Isso te dá uma base sólida para qualquer menu de jogo moderno.`,
    codes: [
      {
        lang: "uxml",
        code: `<!-- Inventario.uxml -->
<ui:UXML xmlns:ui="UnityEngine.UIElements" xmlns:uie="UnityEditor.UIElements">
    <ui:VisualElement name="painel" class="painel-inventario">
        <ui:Label text="Inventário" class="titulo"/>

        <!-- ScrollView gera scroll automaticamente quando o conteúdo passa do tamanho. -->
        <ui:ScrollView name="lista" class="lista">
            <!-- Itens serão adicionados por código. -->
        </ui:ScrollView>

        <ui:Button name="btn-fechar" text="Fechar" class="botao"/>
    </ui:VisualElement>
</ui:UXML>`,
      },
      {
        lang: "uss",
        code: `/* Inventario.uss */
.painel-inventario {
    width: 400px;
    height: 500px;
    background-color: rgba(0, 0, 0, 0.85);
    border-radius: 12px;
    padding: 16px;
    align-self: center;
    margin-top: 50px;
}

.titulo {
    font-size: 24px;
    color: white;
    margin-bottom: 12px;
    -unity-font-style: bold;
}

.lista {
    flex-grow: 1;
}

.item {
    flex-direction: row;
    align-items: center;
    padding: 8px;
    margin-bottom: 4px;
    background-color: rgb(40, 40, 50);
    border-radius: 6px;
}

.item:hover {
    background-color: rgb(60, 80, 120);
}

.item .icone {
    width: 32px;
    height: 32px;
    margin-right: 12px;
}

.item .nome {
    color: white;
    font-size: 16px;
}

.botao {
    height: 40px;
    margin-top: 12px;
    background-color: rgb(180, 60, 60);
    color: white;
    border-radius: 6px;
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UIElements;
using System.Collections.Generic;

// Popula o ScrollView do UXML com itens criados por código.
// Padrão idêntico ao que você faria no DOM com appendChild.
public class InventarioUI : MonoBehaviour
{
    [System.Serializable]
    public class Item
    {
        public string nome;
        public Sprite icone;
    }

    [SerializeField] private UIDocument doc;
    [SerializeField] private List<Item> itens;

    void OnEnable()
    {
        VisualElement raiz = doc.rootVisualElement;

        // Pega o ScrollView pelo name (igual a querySelector('#lista') da web).
        ScrollView lista = raiz.Q<ScrollView>("lista");

        // Cria um VisualElement por item.
        foreach (var item in itens)
        {
            VisualElement linha = new VisualElement();
            linha.AddToClassList("item"); // aplica a classe USS .item

            VisualElement icone = new VisualElement();
            icone.AddToClassList("icone");
            icone.style.backgroundImage = new StyleBackground(item.icone);
            linha.Add(icone);

            Label nome = new Label(item.nome);
            nome.AddToClassList("nome");
            linha.Add(nome);

            // Click no item inteiro
            linha.RegisterCallback<ClickEvent>(evt =>
            {
                Debug.Log($"Selecionou {item.nome}");
            });

            lista.Add(linha);
        }

        // Botão fechar
        raiz.Q<Button>("btn-fechar").clicked += () =>
        {
            raiz.style.display = DisplayStyle.None;
        };
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UIElements;

// Animação simples em UI Toolkit usando schedule (timeline interno do UIElements).
// Evita corrotinas ou Update para tarefas de UI.
public class FadeInPainel : MonoBehaviour
{
    [SerializeField] private UIDocument doc;

    void OnEnable()
    {
        VisualElement painel = doc.rootVisualElement.Q<VisualElement>("painel");
        painel.style.opacity = 0f;

        // schedule.Execute roda uma vez. Para repetir, use .Every(ms).
        painel.schedule.Execute(() =>
        {
            // Loop manual de fade durante 500ms.
            float duracao = 0.5f;
            float inicio = Time.unscaledTime;

            painel.schedule.Execute(() =>
            {
                float t = Mathf.Clamp01((Time.unscaledTime - inicio) / duracao);
                painel.style.opacity = t;
            }).Every(16).Until(() => Time.unscaledTime - inicio >= duracao);
        });
    }
}`,
      },
    ],
    points: [
      "UXML estrutura, USS estiliza, C# controla — separação inspirada na web.",
      "UIDocument é o componente que carrega um UXML e o renderiza em runtime.",
      "Layout é Flexbox: flex-direction, align-items, justify-content, flex-grow.",
      "Q<T>(\"name\") seleciona elementos por name; Query por className para listas.",
      "Eventos usam RegisterCallback<EvtType> ou APIs específicas (button.clicked).",
      "ScrollView gera scroll automaticamente quando o conteúdo excede o tamanho.",
      "Pseudo-classes USS como :hover funcionam igual à web.",
      "Para animar em UI Toolkit, use schedule.Execute().Every().Until() em vez de Update.",
    ],
    alerts: [
      {
        type: "info",
        content: "O UI Builder (Window > UI Toolkit > UI Builder) é uma ferramenta visual no editor onde você monta UXML/USS arrastando elementos. Recomendo aprender ele junto com o código — é o equivalente do dev tools do navegador.",
      },
      {
        type: "warning",
        content: "Em runtime, UI Toolkit ainda não suporta todas as features do editor. World space rendering, por exemplo, só virou estável a partir do Unity 6. Confira a documentação da sua versão antes de prometer features.",
      },
      {
        type: "tip",
        content: "Use Theme Style Sheets (.tss) para definir um conjunto de variáveis (cores primárias, fontes) e reutilizar em todos os UXMLs do projeto. Mudar de tema vira trocar um arquivo só.",
      },
    ],
  },
  {
    slug: "tmp-text",
    section: "ui",
    title: "TextMeshPro: texto bonito com SDF",
    difficulty: "intermediario",
    subtitle: "Por que TMP substitui o Text legado e como aproveitar o melhor dele.",
    intro: `O componente Text legado do uGUI tem um problema visual sério: ele renderiza fontes em bitmap, o que significa que escalar o texto resulta em bordas serrilhadas e perda de nitidez. Em telas modernas (4K, retina, celulares de alta densidade), isso fica gritante. Para resolver, a Unity adquiriu em 2017 o asset TextMeshPro e o tornou parte oficial da engine. Hoje, todo projeto sério usa TextMeshPro (TMP) para texto, e o Text antigo só sobrevive por compatibilidade.

A diferença técnica está em como cada um desenha as letras. O Text legado usa textura bitmap: cada tamanho de fonte vira um conjunto de pixels específico. O TMP usa SDF (Signed Distance Field), uma técnica em que cada pixel guarda a distância até a borda mais próxima da letra. Com isso, um único atlas de tamanho médio (geralmente 64px) consegue ser escalado para qualquer tamanho mantendo bordas suaves, e ainda permite efeitos como contorno, sombra, glow e brilho diretamente no shader, sem custo extra.

Além da qualidade, TMP tem features que o Text não tem: rich text completo (cores inline, fontes diferentes no meio do texto, ícones inline via sprite assets), suporte nativo a múltiplos idiomas via Font Asset, controle fino de espaçamento (kerning, leading), gradientes, máscaras, e InputField com validação melhor. O preço é que você precisa gerar um Font Asset a partir do .ttf (um processo de um clique no Window > TextMeshPro > Font Asset Creator) e que algumas configurações iniciais confundem quem está chegando agora.

A estrutura mental é: TMP_FontAsset é a "fonte processada" (com atlas SDF e dados de glifo); TMP_Text é o componente que mostra texto na UI; TextMeshPro (sem o _) é a versão para world space. Você pode ter vários Font Assets compartilhando a mesma .ttf com configurações diferentes (um para texto normal, outro para títulos com tamanho maior). Isso vai ditar a qualidade visual do texto.

Vamos ver como criar um Font Asset, animar texto, usar rich text para destacar palavras e como o TMP se integra com sistemas de localização. Tudo com código que você roda no Unity.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;
using TMPro;

// Atualiza um texto com rich text inline.
// TMP suporta tags como <color>, <b>, <size>, <sprite> diretamente na string.
public class TextoComRichText : MonoBehaviour
{
    [SerializeField] private TMP_Text label;

    void Start()
    {
        // Tags rich text funcionam direto, sem componente extra.
        label.text =
            "Você ganhou <b><color=#FFD700>500 moedas</color></b>!\\n" +
            "Sua vida está em <color=#FF6060>baixa</color>: <b>23%</b>\\n" +
            "Próximo nível em <size=140%><color=#80FFFF>1200 XP</color></size>";
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using TMPro;
using System.Collections;

// Efeito 'typewriter': digita o texto letra por letra, comum em diálogos de RPG.
// Usa o maxVisibleCharacters do TMP, que é mais rápido que mudar a string toda hora.
public class EfeitoTypewriter : MonoBehaviour
{
    [SerializeField] private TMP_Text label;
    [SerializeField] private float velocidade = 30f; // caracteres por segundo

    public void Mostrar(string texto)
    {
        StopAllCoroutines();
        label.text = texto;
        label.maxVisibleCharacters = 0;
        StartCoroutine(Digitar());
    }

    IEnumerator Digitar()
    {
        // ForceMeshUpdate garante que textInfo tenha o número correto de caracteres.
        label.ForceMeshUpdate();
        int total = label.textInfo.characterCount;
        float intervalo = 1f / velocidade;

        for (int i = 1; i <= total; i++)
        {
            label.maxVisibleCharacters = i;
            yield return new WaitForSeconds(intervalo);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using TMPro;

// Configura efeitos visuais do TMP por código: outline, sombra, gradiente.
// Esses parâmetros vivem no MATERIAL do TMP, não no componente em si.
public class EfeitosTMP : MonoBehaviour
{
    [SerializeField] private TMP_Text label;

    void Start()
    {
        // O material precisa ser instanciado para não afetar outros textos.
        Material mat = Instantiate(label.fontMaterial);
        label.fontMaterial = mat;

        // Outline: precisa de outline width > 0 e a face precisa estar visível.
        mat.SetColor(ShaderUtilities.ID_OutlineColor, Color.black);
        mat.SetFloat(ShaderUtilities.ID_OutlineWidth, 0.2f);

        // Underlay (sombra)
        mat.EnableKeyword(ShaderUtilities.Keyword_Underlay);
        mat.SetColor(ShaderUtilities.ID_UnderlayColor, new Color(0, 0, 0, 0.7f));
        mat.SetFloat(ShaderUtilities.ID_UnderlayOffsetX, 0.5f);
        mat.SetFloat(ShaderUtilities.ID_UnderlayOffsetY, -0.5f);
        mat.SetFloat(ShaderUtilities.ID_UnderlaySoftness, 0.3f);

        // Marca o texto para regerar o mesh com o novo material.
        label.UpdateMeshPadding();
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using TMPro;

// Troca de Font Asset em runtime para suportar idiomas com glifos diferentes
// (ex: japonês, árabe, cirílico) sem carregar uma fonte gigante para todos.
public class TrocaFonteIdioma : MonoBehaviour
{
    [SerializeField] private TMP_Text label;
    [SerializeField] private TMP_FontAsset fontePadrao;     // latim
    [SerializeField] private TMP_FontAsset fonteJaponesa;   // kanji + hiragana

    public void DefinirIdioma(string idioma)
    {
        switch (idioma)
        {
            case "ja":
                label.font = fonteJaponesa;
                label.text = "ようこそ";
                break;
            default:
                label.font = fontePadrao;
                label.text = "Bem-vindo";
                break;
        }
    }
}`,
      },
    ],
    points: [
      "TMP usa SDF: texto fica nítido em qualquer escala, ao contrário do Text bitmap.",
      "Sempre gere um Font Asset (Window > TextMeshPro > Font Asset Creator) a partir do .ttf.",
      "Rich text inline funciona com tags tipo <b>, <color>, <size>, <sprite>.",
      "Para typewriter, mude maxVisibleCharacters em vez de regerar a string.",
      "Efeitos como outline e sombra vivem no material; instancie para não afetar outros textos.",
      "Para idiomas com muitos glifos (japonês, chinês), use Font Asset com Dynamic SDF.",
      "TMP_InputField substitui o InputField legado com mais opções e validação melhor.",
      "Pegadinha: textInfo só está atualizado depois de ForceMeshUpdate ou no frame seguinte.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Nunca edite diretamente o material padrão de um Font Asset (LiberationSans SDF Material, por exemplo). Sempre instancie um material novo, senão você vai mudar a aparência de todos os textos do projeto.",
      },
      {
        type: "tip",
        content: "Para suporte a emojis ou ícones inline, crie um Sprite Asset (TMP > Sprite Asset) e referencie ele no Font Asset. No texto, use <sprite=\"NomeAtlas\" name=\"coracao\"/> e o emoji aparece na linha.",
      },
      {
        type: "info",
        content: "Em projetos que precisam de muitos idiomas com glifos diferentes (CJK), use Font Asset com Atlas Population Mode = Dynamic. O Unity vai adicionar glifos ao atlas conforme o texto pede, sem você ter que pré-gerar tudo.",
      },
    ],
  },
  {
    slug: "ui-mobile",
    section: "ui",
    title: "UI mobile: safe area, CanvasScaler e densidade",
    difficulty: "avancado",
    subtitle: "Por que sua UI quebra em iPhones com notch e como fazer ela funcionar em qualquer celular.",
    intro: `Fazer UI mobile parece simples até você plugar o build em um iPhone real e ver o botão de pause atrás do notch, ou em um celular com aspect ratio 21:9 onde o menu fica espremido em uma faixa do meio. Mobile é o ambiente mais hostil para UI: existem milhares de combinações de tamanho de tela, densidade de pixel, notches, ilhas dinâmicas, gestos de borda do sistema, e barras de status que entram e saem. Não dá para deixar para validar isso no fim do projeto.

A primeira ferramenta que você precisa entender é o CanvasScaler. Ele fica anexado ao Canvas e decide como elementos UI escalam quando a tela muda de tamanho. O modo Constant Pixel Size deixa tudo do mesmo tamanho em pixels (péssimo para mobile). O modo Scale With Screen Size é o que você quer: você define uma resolução de referência (geralmente 1080x1920 ou 1080x2400 para mobile vertical) e tudo escala proporcionalmente. O parâmetro Match (0 a 1) controla se a escala segue a largura (0), altura (1) ou um meio-termo. Para jogos verticais, Match = 0 (largura) costuma ser melhor; para horizontais, Match = 1 (altura).

A segunda ferramenta é o Screen.safeArea. Esse Rect te diz a região da tela que está livre de notch, ilha dinâmica, indicador de gestos do iOS e barra de status do Android. Você lê esse Rect e ajusta o RectTransform do seu painel principal para caber dentro dele. Sem isso, em iPhones a partir do X, o canto superior fica atrás do notch e parte da UI pode ficar inacessível ao toque (a região do notch não recebe input).

Outro detalhe crucial é a área de toque mínima. Especificações do iOS pedem 44x44 pontos e do Android 48x48 dp. Em escala de Unity (1080p), isso é aproximadamente 88 a 96 pixels. Botões menores que isso são frustrantes, especialmente para crianças e idosos. Use sempre uma Image transparente maior que o gráfico do botão como área de toque se o seu design pede ícones pequenos.

Vamos cobrir também o suporte a múltiplas densidades (DPI), orientação dinâmica (landscape e portrait no mesmo app), e como fazer testes rápidos no editor sem buildar toda hora.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Aplica o Screen.safeArea ao RectTransform do painel principal.
// Coloque este script no painel raiz da sua UI mobile.
[RequireComponent(typeof(RectTransform))]
public class AplicaSafeArea : MonoBehaviour
{
    private RectTransform rt;
    private Rect ultimaSafeArea;
    private Vector2Int ultimaResolucao;
    private ScreenOrientation ultimaOrientacao;

    void Awake()
    {
        rt = GetComponent<RectTransform>();
        Aplicar();
    }

    void Update()
    {
        // Reaplica se algo mudar (rotação de tela, splitscreen, etc).
        if (Screen.safeArea != ultimaSafeArea
            || Screen.width != ultimaResolucao.x
            || Screen.height != ultimaResolucao.y
            || Screen.orientation != ultimaOrientacao)
        {
            Aplicar();
        }
    }

    void Aplicar()
    {
        Rect safe = Screen.safeArea;
        ultimaSafeArea = safe;
        ultimaResolucao = new Vector2Int(Screen.width, Screen.height);
        ultimaOrientacao = Screen.orientation;

        // Converte os limites do safeArea (em pixels) para anchors normalizados (0..1).
        Vector2 anchorMin = safe.position;
        Vector2 anchorMax = safe.position + safe.size;
        anchorMin.x /= Screen.width;
        anchorMin.y /= Screen.height;
        anchorMax.x /= Screen.width;
        anchorMax.y /= Screen.height;

        rt.anchorMin = anchorMin;
        rt.anchorMax = anchorMax;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;

// Configura o CanvasScaler de forma adequada para mobile vertical.
// Coloque uma vez no Canvas raiz; isso evita configuração manual no Inspector.
[RequireComponent(typeof(CanvasScaler))]
public class ConfiguraCanvasMobile : MonoBehaviour
{
    [SerializeField] private bool ehJogoHorizontal = false;

    void Awake()
    {
        CanvasScaler scaler = GetComponent<CanvasScaler>();

        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;

        // Resolução de referência: o que você desenha pensando.
        // Para vertical: 1080x1920 é um bom alvo (16:9 base, escalando para 19.5:9 e 21:9).
        // Para horizontal: 1920x1080.
        scaler.referenceResolution = ehJogoHorizontal
            ? new Vector2(1920, 1080)
            : new Vector2(1080, 1920);

        // Match: 0 segue largura, 1 segue altura.
        // Mobile vertical: prefira largura para textos não esticarem demais em telas longas.
        scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
        scaler.matchWidthOrHeight = ehJogoHorizontal ? 1f : 0f;

        // Pixel density mínima para fontes ficarem nítidas.
        scaler.referencePixelsPerUnit = 100f;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;

// Garante área de toque mínima de 96x96 pixels (≈48dp) em qualquer botão.
// Adiciona uma Image transparente como área de hit se o gráfico for menor.
[RequireComponent(typeof(Button))]
public class AreaDeToqueMinima : MonoBehaviour
{
    [SerializeField] private float minimoPixels = 96f;

    void Awake()
    {
        RectTransform rt = (RectTransform)transform;
        Vector2 tamanho = rt.rect.size;

        if (tamanho.x < minimoPixels || tamanho.y < minimoPixels)
        {
            // Cria uma área invisível centralizada com o tamanho mínimo.
            GameObject hit = new GameObject("AreaHit", typeof(Image));
            hit.transform.SetParent(transform, false);
            hit.transform.SetAsFirstSibling(); // atrás do gráfico para não cobrir

            RectTransform hitRT = hit.GetComponent<RectTransform>();
            hitRT.anchorMin = new Vector2(0.5f, 0.5f);
            hitRT.anchorMax = new Vector2(0.5f, 0.5f);
            hitRT.pivot = new Vector2(0.5f, 0.5f);
            hitRT.sizeDelta = new Vector2(
                Mathf.Max(tamanho.x, minimoPixels),
                Mathf.Max(tamanho.y, minimoPixels)
            );

            Image img = hit.GetComponent<Image>();
            img.color = new Color(0, 0, 0, 0); // totalmente transparente
            img.raycastTarget = true;          // mas continua recebendo toque
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.UI;

// Layout que reorganiza filhos quando a tela muda de orientação.
// Útil para apps que suportam landscape e portrait no mesmo build.
public class LayoutResponsivoOrientacao : MonoBehaviour
{
    [SerializeField] private HorizontalOrVerticalLayoutGroup layout;
    private bool ultimoEhPaisagem;

    void Update()
    {
        bool paisagem = Screen.width > Screen.height;
        if (paisagem == ultimoEhPaisagem) return;
        ultimoEhPaisagem = paisagem;

        // Em paisagem, distribui em linha (HorizontalLayoutGroup).
        // Em retrato, distribui em coluna (VerticalLayoutGroup).
        // Aqui ajustamos só os parâmetros do layout existente.
        if (layout is HorizontalLayoutGroup h)
        {
            h.childForceExpandWidth = paisagem;
            h.childForceExpandHeight = !paisagem;
        }
        else if (layout is VerticalLayoutGroup v)
        {
            v.childForceExpandHeight = !paisagem;
            v.childForceExpandWidth = paisagem;
        }

        // Força recálculo do layout neste frame.
        LayoutRebuilder.ForceRebuildLayoutImmediate(layout.GetComponent<RectTransform>());
    }
}`,
      },
    ],
    points: [
      "CanvasScaler em modo Scale With Screen Size é obrigatório para mobile.",
      "Resolução de referência: 1080x1920 vertical, 1920x1080 horizontal.",
      "Match = 0 (largura) para vertical; Match = 1 (altura) para horizontal.",
      "Sempre aplique Screen.safeArea no painel raiz para evitar notch e ilha dinâmica.",
      "Área de toque mínima: 96 pixels (em referência 1080) ou 44pt iOS / 48dp Android.",
      "Teste no Game View com presets de iPhone X, iPhone 14 Pro Max e telas 21:9.",
      "Reaplique safeArea quando Screen.orientation ou Screen.width mudarem.",
      "Pegadinha: Screen.safeArea no editor sempre é a tela inteira; só funciona em build real.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Screen.safeArea no editor retorna a tela inteira (sem notch). Use o Device Simulator (Window > General > Device Simulator) para simular dispositivos reais com notch antes de buildar.",
      },
      {
        type: "tip",
        content: "Crie no Game View presets para iPhone SE (tela pequena), iPhone 14 Pro (notch + ilha dinâmica), Galaxy S22 (sem notch) e tablet 4:3. Alterne entre eles enquanto desenvolve, não só no fim.",
      },
      {
        type: "danger",
        content: "Em iOS, a região do notch é completamente cega para toques. Botões posicionados ali não funcionam de verdade no aparelho, mesmo que o jogador veja o gráfico. Validar com safeArea não é estética, é funcionalidade.",
      },
    ],
  },
];
