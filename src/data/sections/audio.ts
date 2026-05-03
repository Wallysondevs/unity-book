import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "audio-source-listener",
    section: "audio",
    title: "AudioSource e AudioListener",
    difficulty: "intermediario",
    subtitle: "A dupla que faz o som existir no Unity: quem toca e quem escuta.",
    intro: `Pense numa peça de teatro. Os atores no palco têm bocas que produzem som (são as fontes), e o público na plateia tem ouvidos que captam esse som (são os ouvintes). Se ninguém estiver na plateia, a peça acontece, mas ninguém ouve nada. Se houver mil atores falando ao mesmo tempo e nenhum ouvinte, o teatro fica em silêncio do ponto de vista do espectador. O Unity funciona exatamente assim: existem dois componentes obrigatórios para que qualquer som chegue aos seus alto-falantes — o AudioSource e o AudioListener.

O AudioSource é o componente que você adiciona em qualquer GameObject que precisa emitir som: um inimigo que grita, uma porta que range, uma música de fundo, um tiro, uma explosão. Ele segura uma referência a um AudioClip (o arquivo de áudio importado) e tem todas as configurações de como reproduzir aquele som: volume, pitch (afinação), loop, prioridade, mute, e se é 2D ou 3D. Já o AudioListener é o microfone da cena. Por padrão, o Unity coloca um AudioListener no Main Camera quando você cria uma cena nova, e você quase nunca precisa pensar nele — exceto por uma regra de ouro: deve existir exatamente UM AudioListener ativo na cena. Dois ou mais geram um warning chato e podem causar comportamento estranho na espacialização.

Para tocar um som, você tem três caminhos diferentes, e a escolha entre eles é uma das primeiras coisas que separam um iniciante de alguém que sabe o que está fazendo. O método Play() reproduz o clip atualmente atribuído ao AudioSource e interrompe qualquer som que ele já estivesse tocando — perfeito para música ou para sons que precisam de controle (pause, stop, loop). O PlayOneShot(clip) toca um clip por cima do que já estiver tocando, sem interromper, e é ideal para efeitos sonoros curtos disparados em sequência (passos, tiros, cliques de UI). Já o estático AudioSource.PlayClipAtPoint(clip, posição) cria um AudioSource temporário no mundo, toca o som e se autodestrói — útil para sons de objetos que vão sumir antes do som terminar (uma bomba que explode e some).

Volume vai de 0 a 1, pitch vai de -3 a 3 (1 é normal, 2 é o dobro de velocidade e uma oitava acima, valores negativos tocam ao contrário). O loop é um booleano simples: ativado, o som reinicia eternamente quando termina. Esses três parâmetros, combinados com pequenas variações aleatórias, são o segredo para um jogo não soar repetitivo. O mesmo som de passo, tocado 200 vezes seguidas com o mesmo volume e pitch, vira tortura auditiva em dois minutos. Variar levemente é mágica.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Script básico que toca um som ao apertar Espaço.
// Coloque este script em qualquer GameObject e arraste um AudioClip no Inspector.
[RequireComponent(typeof(AudioSource))]
public class TocadorSimples : MonoBehaviour
{
    [SerializeField] private AudioClip clipParaTocar;

    // O AudioSource é pego automaticamente do mesmo GameObject.
    private AudioSource fonte;

    void Awake()
    {
        // GetComponent busca o AudioSource já anexado ao objeto.
        fonte = GetComponent<AudioSource>();
        // Atribuímos o clip via código (poderia ser feito direto no Inspector).
        fonte.clip = clipParaTocar;
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            // Play() interrompe qualquer som tocando neste AudioSource e começa do zero.
            fonte.Play();
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// PlayOneShot é o jeito certo de tocar efeitos sonoros curtos em sequência.
// Diferente de Play(), ele NÃO interrompe sons anteriores — eles se sobrepõem.
public class TocadorDeTiros : MonoBehaviour
{
    [SerializeField] private AudioClip somDeTiro;
    [SerializeField] private AudioSource fonte;

    // Variação aleatória deixa o som menos repetitivo.
    [SerializeField] private float pitchMinimo = 0.9f;
    [SerializeField] private float pitchMaximo = 1.1f;

    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            // Variar o pitch a cada disparo evita aquela sensação de 'metralhadora robotizada'.
            fonte.pitch = Random.Range(pitchMinimo, pitchMaximo);

            // PlayOneShot recebe o clip e um volumeScale opcional (multiplica o volume base).
            fonte.PlayOneShot(somDeTiro, 0.8f);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Tocar som de um objeto que vai ser destruído imediatamente.
// PlayClipAtPoint cria um AudioSource temporário, toca e se autodestrói.
public class Explosivo : MonoBehaviour
{
    [SerializeField] private AudioClip somExplosao;
    [SerializeField] private float volume = 1f;

    public void Explodir()
    {
        // Importante: passamos a posição no mundo para o som ser espacializado corretamente.
        // Se passássemos transform.position e destruíssemos o objeto, o som ainda toca,
        // porque o Unity cria internamente outro GameObject só para o áudio.
        AudioSource.PlayClipAtPoint(somExplosao, transform.position, volume);

        Destroy(gameObject);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Demonstração rápida das propriedades mais usadas em runtime.
public class ControleDeMusica : MonoBehaviour
{
    [SerializeField] private AudioSource musica;

    void Start()
    {
        musica.loop = true;          // a musica reinicia sozinha quando termina
        musica.volume = 0.5f;        // metade do volume
        musica.pitch = 1f;           // velocidade normal
        musica.playOnAwake = false;  // melhor controlar via codigo do que tocar sozinha
        musica.Play();
    }

    public void PausarOuRetomar()
    {
        // isPlaying diz se o AudioSource esta reproduzindo neste instante.
        if (musica.isPlaying) musica.Pause();
        else musica.UnPause();
    }

    public void Parar()
    {
        // Stop zera a posicao de leitura. UnPause continua de onde parou.
        musica.Stop();
    }
}`,
      },
    ],
    points: [
      "Toda cena precisa de exatamente um AudioListener ativo, geralmente na Main Camera.",
      "Use Play() para sons que você precisa controlar (música, loops, pause/stop).",
      "Use PlayOneShot() para efeitos curtos que podem se sobrepor (tiros, passos, UI).",
      "Use AudioSource.PlayClipAtPoint() quando o objeto que emite o som vai ser destruído.",
      "Variar pitch e volume aleatoriamente evita a fadiga auditiva da repetição.",
      "playOnAwake ativado faz o som tocar sozinho ao instanciar — desligue para ter controle.",
      "pitch negativo toca o áudio ao contrário; pitch 2 dobra a velocidade e sobe uma oitava.",
      "AudioSource e AudioListener são obrigatórios juntos: sem ouvinte, ninguém escuta nada.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Dois AudioListeners ativos na mesma cena geram um warning constante no console e fazem a espacialização 3D ficar imprevisível. Desative o da câmera secundária ou tenha um único listener pendurado no jogador.",
      },
      {
        type: "tip",
        content: "PlayOneShot ignora o clip atribuído no AudioSource — ele toca o clip que você passa como parâmetro. Isso permite usar um único AudioSource para disparar dezenas de SFX diferentes sem criar um componente novo para cada um.",
      },
      {
        type: "danger",
        content: "Se você destruir um GameObject que está tocando um AudioSource normal, o som corta no meio. Para 'one-shots' de objetos efêmeros (explosões, projéteis), use PlayClipAtPoint ou desanexe o AudioSource antes de destruir.",
      },
    ],
  },
  {
    slug: "audio-mixer",
    section: "audio",
    title: "AudioMixer: o estúdio de mixagem do Unity",
    difficulty: "intermediario",
    subtitle: "Roteie todos os sons por grupos e controle volumes globais como um profissional.",
    intro: `Imagine uma mesa de som de um estúdio de gravação. Cada microfone do palco entra em um canal, vários canais são agrupados (todos os microfones da bateria viram um grupo 'Drums', todos os vocais viram um grupo 'Vocals'), e o engenheiro de som controla o volume desses grupos com fadinhos grandes em vez de mexer canal por canal. O AudioMixer do Unity é exatamente essa mesa, traduzida para o motor de jogo. Antes dele (Unity 5 trouxe o AudioMixer), todo controle de volume era manual: para baixar o volume da música mas não dos efeitos, você tinha que iterar por cada AudioSource de música na cena. Era horrível.

O fluxo é simples: você cria um asset do tipo Audio Mixer (botão direito > Create > Audio Mixer), ele já vem com um grupo Master, e você adiciona grupos filhos como Music, SFX, Ambient, UI, Voice. Cada AudioSource na cena tem um campo 'Output' onde você arrasta o grupo desejado. A partir desse momento, o som daquele AudioSource passa pelo grupo antes de chegar no Master, e do Master para os alto-falantes. Se você baixar o volume do grupo SFX em -10dB, todos os AudioSources roteados para SFX baixam juntos, sem precisar tocar em nenhum deles individualmente.

A grande sacada é o conceito de Exposed Parameters. Por padrão, os volumes do mixer são editados só dentro do editor. Para que o jogador ajuste o volume da música pelo menu de opções, você precisa expor esse parâmetro: clique com botão direito no campo 'Volume' do grupo no Mixer, escolha 'Expose to script', dê um nome (por exemplo 'MusicVolume') e pronto. Agora você consegue chamar mixer.SetFloat('MusicVolume', valor) do C# e o slider de UI funciona. Cuidado com uma pegadinha clássica: o volume do mixer é em decibéis (dB), uma escala logarítmica que vai de -80dB (silêncio total) até 0dB (volume cheio). Um slider de UI normalmente é linear de 0 a 1. Você precisa converter, e a fórmula correta é Mathf.Log10(valor) * 20. Quem mapeia o slider direto em dB acaba com 80% do range do slider sem efeito audível.

O AudioMixer também aceita efeitos por grupo (reverb, lowpass, highpass, compressor, distortion). Você adiciona o efeito clicando em 'Add...' no canal do grupo. Isso permite, por exemplo, aplicar um lowpass filter quando o jogador entra debaixo da água, sem mexer em nenhum AudioSource: o efeito está no grupo, todos que tocarem por ali ganham o filtro. É elegante, performático e separa responsabilidades de jeito limpo.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.Audio;
using UnityEngine.UI;

// Liga um Slider da UI ao volume de um grupo do AudioMixer.
// Lembre-se de expor o parametro no Mixer (clique direito > Expose to script).
public class ControleDeVolume : MonoBehaviour
{
    [SerializeField] private AudioMixer mixer;
    [SerializeField] private Slider slider;

    // Nome exato do parametro exposto. Diferencia maiusculas/minusculas.
    [SerializeField] private string parametroExposto = "MusicVolume";

    void Start()
    {
        // Recupera o valor salvo (ou usa 0.75 como padrao).
        float valorInicial = PlayerPrefs.GetFloat(parametroExposto, 0.75f);
        slider.value = valorInicial;
        AplicarVolume(valorInicial);

        // Conecta o slider ao callback de mudanca.
        slider.onValueChanged.AddListener(AplicarVolume);
    }

    void AplicarVolume(float valorLinear)
    {
        // Cuidado: o slider vai de 0 a 1, mas o mixer trabalha em decibeis.
        // A formula correta para conversao logaritmica e 20 * log10(x).
        // Evitamos log10(0) usando um piso minimo.
        float dB = (valorLinear <= 0.0001f) ? -80f : Mathf.Log10(valorLinear) * 20f;

        mixer.SetFloat(parametroExposto, dB);

        // Persistimos para que o jogador nao precise reajustar a cada sessao.
        PlayerPrefs.SetFloat(parametroExposto, valorLinear);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.Audio;

// Roteamento programatico: forca um AudioSource a sair em um grupo especifico.
// Util quando voce instancia sons de codigo (pool de SFX, por exemplo).
public class RoteadorDeSom : MonoBehaviour
{
    [SerializeField] private AudioMixerGroup grupoSFX;
    [SerializeField] private AudioMixerGroup grupoMusica;

    public AudioSource CriarFonteDeMusica(AudioClip clip)
    {
        var go = new GameObject("MusicaTemp");
        var src = go.AddComponent<AudioSource>();
        src.clip = clip;
        src.loop = true;

        // Aqui amarramos o AudioSource ao grupo do Mixer.
        // A partir daqui o som passa pelos efeitos e volume daquele grupo.
        src.outputAudioMixerGroup = grupoMusica;

        src.Play();
        return src;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.Audio;

// Le o valor atual de um parametro exposto do mixer.
// Util para sincronizar UI quando voce abre o menu de opcoes.
public class LeitorDeVolume : MonoBehaviour
{
    [SerializeField] private AudioMixer mixer;

    public float ObterVolumeLinear(string parametro)
    {
        // GetFloat devolve o valor em dB.
        if (mixer.GetFloat(parametro, out float dB))
        {
            // Conversao inversa: de dB para linear (0..1).
            return Mathf.Pow(10f, dB / 20f);
        }
        // Se o parametro nao existe (digitou o nome errado), retornamos 1 (volume cheio).
        return 1f;
    }
}`,
      },
    ],
    points: [
      "AudioMixer agrupa AudioSources em canais (Music, SFX, UI) controlados por um único fader.",
      "Toda cena de produção tem ao menos os grupos Master, Music e SFX.",
      "Para mexer em volumes via código, exponha o parâmetro no Mixer (Expose to script).",
      "Volumes do Mixer são em decibéis (-80 a 0), não em valores lineares de slider.",
      "Converta slider linear para dB com Mathf.Log10(valor) * 20 para curva natural ao ouvido.",
      "Efeitos como reverb e lowpass aplicados no grupo afetam todos os sons que passam por ali.",
      "outputAudioMixerGroup é a propriedade que conecta um AudioSource a um grupo do Mixer.",
      "Salve preferências de volume com PlayerPrefs para persistir entre sessões.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Mapear um slider de UI diretamente em dB (de 0 a -80) faz a percepção de volume ficar quebrada: o som muda muito pouco no início e cai abruptamente no fim. Use sempre a conversão logarítmica.",
      },
      {
        type: "info",
        content: "Os parâmetros expostos só aparecem para o C# se você marcar explicitamente. Se mixer.SetFloat retorna false, é quase sempre porque o nome digitado não bate (case-sensitive) ou você esqueceu de expor.",
      },
      {
        type: "tip",
        content: "Crie pelo menos quatro grupos: Master, Music, SFX e UI. UI separada permite que sons de menu (cliques, navegação) toquem mesmo quando o jogador silencia tudo no pause — uma cortesia que poucos jogos lembram de implementar.",
      },
    ],
  },
  {
    slug: "3d-sound",
    section: "audio",
    title: "Som 3D: espacialização, rolloff e Doppler",
    difficulty: "intermediario",
    subtitle: "Faça o som vir da direção certa, atenuar com a distância e dar a sensação de movimento.",
    intro: `Quando uma moto passa por você na rua, três coisas acontecem ao seu ouvido ao mesmo tempo: o som começa baixo (ela está longe), cresce até ficar muito alto (ela passou ao seu lado), cai de novo (ela se afasta), parece vir do lado esquerdo, depois do direito conforme ela passa, e o tom muda — fica mais agudo enquanto ela se aproxima e mais grave depois que passa. Esse último efeito é o famoso efeito Doppler, e ele acontece porque as ondas sonoras se comprimem quando a fonte se aproxima e se esticam quando se afasta. O Unity simula tudo isso quando você marca um AudioSource como 3D.

A propriedade que controla isso se chama Spatial Blend, um slider de 0 a 1. Em 0, o som é totalmente 2D — toca igual nos dois alto-falantes, sem importar onde a fonte está no mundo. É o que você quer para música, narração e UI. Em 1, o som é totalmente 3D — sua posição no mundo importa, ele atenua com a distância, vem do lado correto e responde ao Doppler. É o que você quer para tiros, passos, vozes de inimigos, ambientes. Valores intermediários misturam os dois efeitos, e existem casos legítimos de uso (uma música 'diegética' que sai de um rádio dentro do mundo do jogo pode ter spatial blend 0.7, dando direção mas mantendo presença forte).

Outras três propriedades importantes ficam dentro do bloco '3D Sound Settings' do AudioSource. A Min Distance é o raio onde o som está no volume máximo (dentro dela ele não atenua). A Max Distance é onde ele para de tocar (ou onde atenua o máximo, dependendo do modo). E o Rolloff define a curva de atenuação entre essas duas distâncias. Você tem três opções: Logarithmic Rolloff (padrão, simula bem a vida real, mas a queda é íngreme — fora da min distance o som cai rápido), Linear Rolloff (queda reta, fácil de prever, ótimo para jogos arcade) e Custom Rolloff (você desenha a curva no editor, controle total). O Doppler Level controla a intensidade do efeito Doppler — 0 desliga, 1 é realista, valores maiores exageram. Em jogos rápidos demais (corrida arcade), o Doppler real soa estranho, então é comum baixar para 0.3 ou desativar.

Uma observação importante de produção: som 3D depende da posição do AudioListener. Se ele está na câmera (padrão) e a câmera está atrás do jogador em terceira pessoa, o som vem do ponto de vista da câmera, não do personagem. Isso pode dar a sensação errada de profundidade. Em jogos de terceira pessoa é comum mover o AudioListener para o personagem ou criar um GameObject 'AudioListener' separado, posicionado entre câmera e personagem, para um meio-termo agradável.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Configura um AudioSource como 3D em codigo, com curva customizada.
// Util para configurar muitos sons via prefab/codigo de forma consistente.
[RequireComponent(typeof(AudioSource))]
public class Som3DConfig : MonoBehaviour
{
    [SerializeField] private float distanciaMinima = 2f;
    [SerializeField] private float distanciaMaxima = 25f;
    [SerializeField, Range(0f, 5f)] private float doppler = 1f;

    void Awake()
    {
        var src = GetComponent<AudioSource>();

        // 1 = totalmente 3D. O Unity vai espacializar pela posicao do transform.
        src.spatialBlend = 1f;

        src.minDistance = distanciaMinima;
        src.maxDistance = distanciaMaxima;
        src.dopplerLevel = doppler;

        // Logarithmic e o padrao realista. Linear e mais previsivel para gameplay.
        src.rolloffMode = AudioRolloffMode.Linear;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Movimenta um objeto que emite som para voce ouvir o efeito Doppler.
// Anexe a um GameObject com AudioSource em loop.
public class FonteEmMovimento : MonoBehaviour
{
    [SerializeField] private float velocidade = 15f;
    [SerializeField] private float distancia = 30f;

    private Vector3 origem;

    void Start()
    {
        origem = transform.position;
    }

    void Update()
    {
        // Movimento de vai-e-vem no eixo X passando pelo player/camera no centro.
        float x = Mathf.PingPong(Time.time * velocidade, distancia * 2f) - distancia;
        transform.position = origem + new Vector3(x, 0f, 0f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Pool simples de AudioSources 3D para tocar muitos sons sem alocar/destruir GameObjects.
// Pooling e a tecnica padrao para SFX em alta frequencia (tiros, passos, impactos).
public class PoolDeSons3D : MonoBehaviour
{
    [SerializeField] private int tamanhoPool = 16;
    [SerializeField] private AudioSource prefabFonte;

    private AudioSource[] pool;
    private int proximoIndice;

    void Awake()
    {
        pool = new AudioSource[tamanhoPool];
        for (int i = 0; i < tamanhoPool; i++)
        {
            pool[i] = Instantiate(prefabFonte, transform);
            pool[i].playOnAwake = false;
        }
    }

    public void Tocar(AudioClip clip, Vector3 posicao, float volume = 1f)
    {
        // Round-robin: usamos a proxima fonte da lista, mesmo que ainda esteja tocando.
        // Para SFX curtos isso e aceitavel; quem precisar de prioridade real usa virtualizacao.
        var src = pool[proximoIndice];
        proximoIndice = (proximoIndice + 1) % tamanhoPool;

        src.transform.position = posicao;
        src.spatialBlend = 1f;
        src.volume = volume;
        src.PlayOneShot(clip);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Em jogos 3D em terceira pessoa, e comum mover o AudioListener
// do MainCamera para um ponto entre a camera e o personagem.
// Aqui posicionamos o listener no personagem, mas voltado para a camera.
[RequireComponent(typeof(AudioListener))]
public class ListenerNoPersonagem : MonoBehaviour
{
    [SerializeField] private Transform camera;

    void LateUpdate()
    {
        // Mantemos a posicao do personagem (ouvimos do ponto de vista dele)
        // mas a 'orientacao' da camera para os sons virem do lado correto na tela.
        if (camera != null)
        {
            transform.rotation = camera.rotation;
        }
    }
}`,
      },
    ],
    points: [
      "Spatial Blend 0 = 2D (música, UI), Spatial Blend 1 = 3D (mundo).",
      "Min Distance é o raio sem atenuação; Max Distance é onde o som silencia.",
      "Logarithmic Rolloff é realista; Linear é previsível; Custom dá controle total via curva.",
      "Doppler Level 1 simula realismo; 0 desliga; valores menores suavizam jogos rápidos.",
      "AudioListener fica geralmente na câmera, mas pode migrar para o personagem em 3ª pessoa.",
      "Pool de AudioSources evita alocação contínua quando há muitos SFX por segundo.",
      "Som 3D respeita a posição do transform — mover o GameObject move a fonte do som.",
      "Spread, em graus, controla quão 'largo' o som soa nos canais (0 = pontual, 360 = totalmente espalhado).",
    ],
    alerts: [
      {
        type: "tip",
        content: "Comece todos os SFX 3D com Min Distance pequena (1-3) e Max Distance proporcional ao tamanho da arena. Min Distance grande demais faz o som ficar 'gritando' mesmo de longe; pequena demais faz ele sumir do nada quando o jogador encosta.",
      },
      {
        type: "warning",
        content: "Se você usa Cinemachine ou troca de câmera dinamicamente, o AudioListener pode ficar desativado em uma câmera e ativado em outra, criando saltos bruscos no áudio. Centralize o listener em um GameObject único independente das câmeras.",
      },
      {
        type: "info",
        content: "O efeito Doppler usa a velocidade do AudioSource e do AudioListener calculada por frame. Se você teleportar um objeto (mudar position direto sem física), o Unity pode calcular uma velocidade gigantesca em um único frame e produzir um 'glitch' sonoro audível.",
      },
    ],
  },
  {
    slug: "snapshots-audio",
    section: "audio",
    title: "Snapshots: estados de áudio que se transitam suavemente",
    difficulty: "intermediario",
    subtitle: "Mude toda a mixagem do jogo entre combate, exploração, pause e debaixo d'água com uma linha.",
    intro: `Pense no que acontece com o áudio quando você abre o menu de pause em um jogo bem feito: a música abafa, os sons do mundo silenciam, talvez um leve eco aparece, e a música do menu sobe limpa. Quando você fecha o pause, tudo volta ao normal numa transição suave de meio segundo. Esse efeito não é mágica nem é dezenas de Tweens em volumes — é um Snapshot do AudioMixer. Snapshots são 'fotografias' de toda a configuração do mixer (volumes, pitchs, parâmetros de efeitos) que você pode salvar com um nome e transitar entre elas em runtime, com uma única chamada de método.

Cada AudioMixer começa com um snapshot chamado Snapshot (esse é o estado padrão). Você pode adicionar quantos quiser: ExplorationSnapshot, CombatSnapshot, PauseSnapshot, UnderwaterSnapshot, BossSnapshot. Para criar, basta clicar no '+' na coluna de Snapshots no Mixer, dar nome, e ajustar os volumes/efeitos como quiser que aquele estado fique. Para usar via código, você chama snapshot.TransitionTo(tempoEmSegundos) e o Unity interpola TODOS os valores do mixer atual até os valores do snapshot alvo durante esse tempo. Você pode também combinar dois snapshots com pesos diferentes usando AudioMixer.TransitionToSnapshots(arr, pesos, tempo) para criar estados intermediários dinamicamente.

A grande vantagem do snapshot é desacoplar 'design de áudio' de 'lógica de jogo'. O programador escreve uma linha quando o estado muda (snapshotCombate.TransitionTo(0.4f)) e o sound designer ajusta livremente como o combate deve soar — quanto a música sobe, quanto o ambiente abafa, se entra um lowpass, se o reverb aumenta. Sem snapshots, cada um desses ajustes vira um campo no Inspector e cresce sem controle. Com snapshots, é tudo no Mixer, num lugar só, visualmente editável.

Use snapshots para: estados de gameplay (exploração vs combate vs pause), efeitos ambientais (debaixo d'água, dentro de uma caverna, capacete fechado), narrativa (cena cinemática que abafa o resto), feedbacks (jogador morrendo com tudo abafando). Não use snapshots para: variações pequenas de volume de um único som (use o volume do AudioSource), efeitos que só duram milissegundos (overhead da transição não compensa), e nem para silenciar sons de um único objeto (use mute no AudioSource ou em um grupo dedicado).`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.Audio;

// Gerenciador simples de snapshots de gameplay.
// Coloque os snapshots configurados no Mixer e arraste no Inspector.
public class GerenteDeAtmosfera : MonoBehaviour
{
    [SerializeField] private AudioMixerSnapshot snapshotExploracao;
    [SerializeField] private AudioMixerSnapshot snapshotCombate;
    [SerializeField] private AudioMixerSnapshot snapshotPause;

    [SerializeField] private float tempoTransicao = 0.5f;

    void Start()
    {
        // Estado inicial do jogo.
        snapshotExploracao.TransitionTo(tempoTransicao);
    }

    public void EntrarCombate()
    {
        // Transicao mais rapida: combate precisa de impacto.
        snapshotCombate.TransitionTo(0.2f);
    }

    public void SairCombate()
    {
        // Volta mais devagar para nao ficar abrupto.
        snapshotExploracao.TransitionTo(1.5f);
    }

    public void Pausar()
    {
        // Pausa quase instantanea para feedback imediato ao apertar Esc.
        snapshotPause.TransitionTo(0.1f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.Audio;

// Mistura de dois snapshots com pesos. Util para transicoes graduais
// baseadas em um valor continuo (ex: profundidade na agua, intensidade de tensao).
public class MisturaSnapshots : MonoBehaviour
{
    [SerializeField] private AudioMixer mixer;
    [SerializeField] private AudioMixerSnapshot snapshotSeco;
    [SerializeField] private AudioMixerSnapshot snapshotMolhado;

    [SerializeField, Range(0f, 1f)] private float profundidade = 0f;

    void Update()
    {
        // Quanto maior a profundidade, mais peso ganha o snapshot 'molhado'.
        var snapshots = new AudioMixerSnapshot[] { snapshotSeco, snapshotMolhado };
        var pesos = new float[] { 1f - profundidade, profundidade };

        // O ultimo parametro (0) significa transicao instantanea.
        // Como chamamos por frame, o blend ja e suave por construcao.
        mixer.TransitionToSnapshots(snapshots, pesos, 0f);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.Audio;

// Trigger de zona: ao entrar num collider, transitamos para o snapshot da zona.
[RequireComponent(typeof(Collider))]
public class ZonaDeAtmosfera : MonoBehaviour
{
    [SerializeField] private AudioMixerSnapshot snapshotDaZona;
    [SerializeField] private AudioMixerSnapshot snapshotPadrao;
    [SerializeField] private float tempoEntrada = 1.5f;
    [SerializeField] private float tempoSaida = 2f;
    [SerializeField] private string tagJogador = "Player";

    void Reset()
    {
        // Garante que o collider e trigger ao adicionar o componente.
        GetComponent<Collider>().isTrigger = true;
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag(tagJogador))
            snapshotDaZona.TransitionTo(tempoEntrada);
    }

    void OnTriggerExit(Collider other)
    {
        if (other.CompareTag(tagJogador))
            snapshotPadrao.TransitionTo(tempoSaida);
    }
}`,
      },
    ],
    points: [
      "Snapshot é uma fotografia de todos os volumes e efeitos do AudioMixer.",
      "TransitionTo(tempo) interpola suavemente do estado atual até o snapshot alvo.",
      "Use snapshots para estados de jogo (exploração, combate, pause, água).",
      "TransitionToSnapshots permite misturar dois snapshots com pesos contínuos.",
      "Tempos típicos: 0.1s para feedback imediato, 0.5s para mudanças de gameplay, 2s+ para climas.",
      "Snapshots desacoplam decisões de design de áudio do código de gameplay.",
      "Triggers em colliders são ideais para amarrar snapshots a zonas físicas no mundo.",
      "Não use snapshots para variações pontuais de um único som — para isso use o AudioSource direto.",
    ],
    alerts: [
      {
        type: "tip",
        content: "Crie um snapshot 'Default' que representa o estado normal do jogo. Sempre que sair de um estado especial (combate, pause, água), volte para Default em vez de tentar reverter as mudanças manualmente. Mantém o código simples e o sound designer no controle.",
      },
      {
        type: "warning",
        content: "TransitionTo é uma operação assíncrona — ela inicia a transição mas não bloqueia. Se você chamar dois TransitionTo seguidos em snapshots diferentes, o Unity cancela a primeira e começa a nova. Não tente sequenciar fades com Coroutines manuais; deixe o sistema fazer.",
      },
    ],
  },
  {
    slug: "importacao-audio",
    section: "audio",
    title: "Importação de áudio: formato, compressão e Load Type",
    difficulty: "intermediario",
    subtitle: "As escolhas no Inspector que decidem se seu jogo come 50MB ou 500MB de RAM.",
    intro: `Áudio importado mal configurado é um dos pecados mais comuns em projetos Unity, e um dos que mais dói no produto final. Um arquivo WAV de 30 segundos de música pode ocupar 5MB no disco, mas, se você importar com as opções erradas, pode ficar gastando 50MB de RAM permanentemente, mesmo que a música não esteja tocando. Multiplique isso por dezenas de músicas e centenas de SFX e seu jogo vira um devorador de memória sem motivo. As decisões de importação são feitas no Inspector quando você clica num arquivo de áudio dentro de Assets, e elas combinam três coisas: formato no disco, formato em memória, e quando carregar.

A primeira escolha é o Load Type, que define como o clip vai parar na memória do jogo. As opções são: Decompress On Load (descomprime tudo para PCM cru ao carregar — toca instantâneo, gasta MUITA RAM, ideal só para SFX MUITO curtos como cliques), Compressed In Memory (mantém comprimido na RAM e descomprime durante a reprodução — equilíbrio para a maioria dos SFX e jingles curtos) e Streaming (não carrega na RAM, lê do disco em pedaços enquanto toca — obrigatório para músicas longas e diálogos, mas só pode ter um clip em streaming por vez de forma confiável). Errar isso é o erro número um: pessoas marcam Decompress On Load para uma trilha sonora de 4 minutos e ficam com 80MB ocupados pra sempre.

A segunda escolha é o Compression Format, que define o algoritmo de compressão. PCM é cru, sem compressão, qualidade máxima e tamanho máximo (não use exceto para SFX ultracurtos). ADPCM é uma compressão simples e rápida, ótima para sons percussivos curtos com muita aleatoriedade (passos, impactos). Vorbis (a opção mais usada) é uma compressão de boa qualidade ajustável por um slider de Quality (0 a 100, padrão 70 já é ótimo) e é ideal para música, ambientes e a maioria dos SFX. Em plataformas mobile, há também o MP3 e o HEVAG/AAC dependendo do alvo. Os defaults do Unity costumam ser razoáveis, mas vale revisar para cada categoria de som.

A terceira parte é Force To Mono e Sample Rate. Force To Mono converte estéreo para mono — economiza 50% do tamanho e é o que você quer para QUASE todos os SFX 3D (eles são espacializados de qualquer jeito, então o estéreo do arquivo é desperdiçado). Sample Rate Setting permite reduzir a taxa de amostragem (44100Hz é qualidade CD; 22050Hz é metade do tamanho e quase imperceptível em SFX curtos; 11025Hz é radio). Combinar Force To Mono + Vorbis Quality 50 + Optimize Sample Rate em um SFX 3D pode reduzir o arquivo de 200KB para 15KB sem perda audível pelo jogador. Faça isso para todos os efeitos do jogo e a economia se acumula em megabytes preciosos no build final, especialmente em mobile.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEditor;
using UnityEngine;

// AudioImporter customizado: aplica configuracoes consistentes em massa.
// Coloque este script em uma pasta chamada Editor.
// Selecione os audios no Project e use o menu Tools > Audio > Configurar SFX.
#if UNITY_EDITOR
public static class ConfiguradorDeAudio
{
    [MenuItem("Tools/Audio/Configurar SFX selecionados")]
    public static void ConfigurarSFX()
    {
        foreach (var guid in Selection.assetGUIDs)
        {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            var importer = AssetImporter.GetAtPath(path) as AudioImporter;
            if (importer == null) continue;

            // Mono economiza metade do tamanho e e ideal para SFX 3D.
            importer.forceToMono = true;

            var settings = importer.defaultSampleSettings;
            settings.loadType = AudioClipLoadType.CompressedInMemory;
            settings.compressionFormat = AudioCompressionFormat.Vorbis;
            settings.quality = 0.5f; // 0..1, equivale a Quality 50 no Inspector.
            settings.sampleRateSetting = AudioSampleRateSetting.OptimizeSampleRate;

            importer.defaultSampleSettings = settings;
            importer.SaveAndReimport();
        }
    }

    [MenuItem("Tools/Audio/Configurar Musica selecionada")]
    public static void ConfigurarMusica()
    {
        foreach (var guid in Selection.assetGUIDs)
        {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            var importer = AssetImporter.GetAtPath(path) as AudioImporter;
            if (importer == null) continue;

            // Musica longa NAO deve forcar mono (perde a espacializacao estereo).
            importer.forceToMono = false;

            var settings = importer.defaultSampleSettings;
            // Streaming: nao ocupa RAM, le do disco enquanto toca.
            settings.loadType = AudioClipLoadType.Streaming;
            settings.compressionFormat = AudioCompressionFormat.Vorbis;
            settings.quality = 0.7f;

            importer.defaultSampleSettings = settings;
            importer.SaveAndReimport();
        }
    }
}
#endif`,
      },
      {
        lang: "csharp",
        code: `using System.Collections;
using UnityEngine;

// Carregamento sob demanda usando Resources/Addressables.
// AudioClips em Streaming nao precisam de pre-load, mas Compressed In Memory podem
// se beneficiar de um pre-warm para evitar hitch no primeiro Play.
public class PrecarregadorDeAudio : MonoBehaviour
{
    [SerializeField] private AudioClip[] clipsParaAquecer;

    IEnumerator Start()
    {
        foreach (var clip in clipsParaAquecer)
        {
            // LoadAudioData forca o clip a sair de 'descarregado' para a memoria.
            // Sem isso, o primeiro Play pode causar um stutter perceptivel.
            if (clip.loadState == AudioDataLoadState.Unloaded)
            {
                clip.LoadAudioData();
                // Esperamos a carga terminar para nao sobrecarregar o frame.
                while (clip.loadState == AudioDataLoadState.Loading)
                    yield return null;
            }
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Demonstra como verificar e liberar memoria de audio em runtime.
// UnloadAudioData libera os bytes descomprimidos da RAM (util ao mudar de cena).
public class GestorDeMemoriaAudio : MonoBehaviour
{
    [SerializeField] private AudioClip[] clipsDoNivel;

    void OnDestroy()
    {
        // Ao sair do nivel, descarregamos os audios desse nivel para liberar RAM.
        // O clip continua existindo como asset, so libera os dados de PCM em memoria.
        foreach (var clip in clipsDoNivel)
        {
            if (clip != null && clip.loadState == AudioDataLoadState.Loaded)
                clip.UnloadAudioData();
        }
    }
}`,
      },
      {
        lang: "json",
        code: `{
  "guia_de_referencia_para_importacao": {
    "musica_longa": {
      "loadType": "Streaming",
      "compression": "Vorbis",
      "quality": 0.7,
      "forceToMono": false,
      "obs": "Musicas de 1 minuto ou mais. Streaming evita estouro de RAM."
    },
    "sfx_curto_2d_ui": {
      "loadType": "DecompressOnLoad",
      "compression": "PCM ou ADPCM",
      "quality": 1.0,
      "forceToMono": true,
      "obs": "Cliques, beeps. Latencia zero, ocupacao minima por serem curtos."
    },
    "sfx_3d_mundo": {
      "loadType": "CompressedInMemory",
      "compression": "Vorbis",
      "quality": 0.5,
      "forceToMono": true,
      "obs": "Tiros, passos, impactos. Mono porque a espacializacao 3D ignora estereo."
    },
    "ambientes_loop_longo": {
      "loadType": "Streaming",
      "compression": "Vorbis",
      "quality": 0.6,
      "forceToMono": false,
      "obs": "Vento, chuva, multidao. Loops longos cabem em streaming sem custo de RAM."
    }
  }
}`,
      },
    ],
    points: [
      "Load Type Decompress On Load = só para SFX MUITO curtos; gasta muita RAM.",
      "Load Type Compressed In Memory = padrão para a maioria dos SFX e jingles.",
      "Load Type Streaming = obrigatório para músicas e diálogos longos.",
      "Vorbis com Quality 50-70 cobre 90% dos casos com ótima qualidade.",
      "Force To Mono em SFX 3D economiza 50% sem perda perceptível (são espacializados).",
      "Optimize Sample Rate corta frequências inaudíveis e reduz tamanho automaticamente.",
      "Apenas um clip Streaming pode tocar simultaneamente de forma estável — evite vários.",
      "Use AudioImporter via script para padronizar configurações em massa por categoria.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Importar uma música de 4 minutos como Decompress On Load enche a RAM com dezenas de megabytes de PCM cru, MESMO sem tocar. Esse é o erro mais comum em projetos Unity e o primeiro lugar a olhar quando o build mobile estoura memória.",
      },
      {
        type: "warning",
        content: "Streaming faz o Unity ler do disco enquanto toca. Em dispositivos com armazenamento lento (HDDs antigos, cartões SD baratos em mobile) você pode ouvir engasgos. Para esses casos, prefira Compressed In Memory mesmo para clipes de 30s.",
      },
      {
        type: "tip",
        content: "Crie um script de Editor com presets de importação por pasta (Assets/Audio/Music, Assets/Audio/SFX, Assets/Audio/Ambient) e chame ele no AssetPostprocessor para aplicar automaticamente. Garante consistência sem depender da memória dos colegas de equipe.",
      },
    ],
  },
];
