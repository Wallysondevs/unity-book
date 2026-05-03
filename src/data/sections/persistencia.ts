import type { Chapter } from "../types";

export const chapters: Chapter[] = [
  {
    slug: "playerprefs",
    section: "persistencia",
    title: "PlayerPrefs: o caderninho de anotações do Unity",
    difficulty: "iniciante",
    subtitle: "Salve preferências simples (volume, nome, último nível) com uma única linha de código.",
    intro: `Imagine que o seu jogo é um console de videogame antigo. Quando você desliga, tudo o que está na memória RAM evapora: vidas, pontuação, posição do jogador. Para não perder nada, é preciso anotar essas informações em algum lugar persistente, que sobreviva ao fechamento do programa. O PlayerPrefs é o caderninho de anotações mais simples que o Unity oferece: um sistema de chave e valor parecido com um dicionário, em que você guarda strings, ints e floats associados a um nome.

Por baixo dos panos, o PlayerPrefs grava esses valores em locais específicos do sistema operacional. No Windows, ele entra direto no Registro do Windows (em HKEY_CURRENT_USER\\Software\\NomeDaEmpresa\\NomeDoJogo). No macOS, vira um arquivo .plist dentro de ~/Library/Preferences. No Linux, fica em ~/.config/unity3d/. Em mobile, o iOS usa NSUserDefaults e o Android usa SharedPreferences. Você não precisa decorar isso, mas precisa entender uma consequência crítica: o PlayerPrefs é um lugar PÚBLICO e SEM CRIPTOGRAFIA. Qualquer pessoa com acesso ao computador consegue abrir e editar.

Por isso, a regra de ouro é: PlayerPrefs serve para configurações de usuário (volume da música, idioma escolhido, sensibilidade do mouse) e progresso casual (último nível desbloqueado, recordes locais). Ele NÃO serve para dados sensíveis (moedas premium, conquistas competitivas, anti-cheat). Se o seu jogo tem economia ou compras, o servidor é quem manda.

Outra limitação importante: PlayerPrefs só guarda três tipos primitivos. Não dá para salvar uma classe inteira, uma lista de inimigos ou a posição de um Vector3 diretamente. Você até consegue contornar (separando em três floats x, y, z), mas a partir do segundo dado complexo já vale migrar para JSON. Pense no PlayerPrefs como uma porta de entrada: simples, rápido, perfeito para os primeiros dois ou três valores. Quando começar a doer, é sinal de que o jogo cresceu e merece um sistema de save de verdade.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// Script simples que salva e carrega o volume da música.
// Coloque em qualquer GameObject de uma cena de menu.
public class VolumeSettings : MonoBehaviour
{
    // A chave precisa ser uma string única dentro do jogo.
    // Use prefixos para evitar colisão (ex.: "audio.musicVolume").
    private const string KEY_VOLUME = "audio.musicVolume";

    private void Start()
    {
        // HasKey verifica se aquela chave já foi gravada antes.
        // Sem isso, GetFloat usa o default e você nunca sabe se é a primeira vez.
        if (PlayerPrefs.HasKey(KEY_VOLUME))
        {
            float salvo = PlayerPrefs.GetFloat(KEY_VOLUME);
            AudioListener.volume = salvo;
            Debug.Log($"Volume carregado: {salvo}");
        }
        else
        {
            AudioListener.volume = 0.8f; // valor padrão na primeira vez
        }
    }

    // Chame este método de um Slider de UI (evento OnValueChanged).
    public void SetVolume(float novoVolume)
    {
        AudioListener.volume = novoVolume;
        PlayerPrefs.SetFloat(KEY_VOLUME, novoVolume);

        // IMPORTANTE: Save() força a gravação no disco imediatamente.
        // Sem chamar Save(), o Unity grava apenas quando o app fecha
        // graciosamente — e em mobile, isso quase nunca acontece.
        PlayerPrefs.Save();
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// PlayerPrefs só guarda int, float e string.
// Para tipos compostos (Vector3, bool, Color), você precisa converter.
public static class PlayerPrefsExtras
{
    // bool não existe nativamente: usamos int 0/1.
    public static void SetBool(string chave, bool valor)
    {
        PlayerPrefs.SetInt(chave, valor ? 1 : 0);
    }

    public static bool GetBool(string chave, bool padrao = false)
    {
        // GetInt aceita um segundo parâmetro: o valor padrão.
        return PlayerPrefs.GetInt(chave, padrao ? 1 : 0) == 1;
    }

    // Vector3 vira três floats com sufixos.
    public static void SetVector3(string chave, Vector3 v)
    {
        PlayerPrefs.SetFloat(chave + ".x", v.x);
        PlayerPrefs.SetFloat(chave + ".y", v.y);
        PlayerPrefs.SetFloat(chave + ".z", v.z);
    }

    public static Vector3 GetVector3(string chave, Vector3 padrao = default)
    {
        // Se a chave não existir, usamos os componentes do default.
        return new Vector3(
            PlayerPrefs.GetFloat(chave + ".x", padrao.x),
            PlayerPrefs.GetFloat(chave + ".y", padrao.y),
            PlayerPrefs.GetFloat(chave + ".z", padrao.z)
        );
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Limpando dados durante desenvolvimento.
// Útil quando você muda o formato de dados e quer resetar.
public class DevTools : MonoBehaviour
{
    private void Update()
    {
        // F12 apaga TUDO do PlayerPrefs (não use em build de produção!).
        if (Input.GetKeyDown(KeyCode.F12))
        {
            PlayerPrefs.DeleteAll();
            PlayerPrefs.Save();
            Debug.LogWarning("PlayerPrefs zerado.");
        }

        // F11 apaga apenas uma chave específica.
        if (Input.GetKeyDown(KeyCode.F11))
        {
            PlayerPrefs.DeleteKey("audio.musicVolume");
            PlayerPrefs.Save();
        }
    }
}`,
      },
    ],
    points: [
      "PlayerPrefs guarda apenas int, float e string — nada de classes ou listas.",
      "Os dados ficam sem criptografia no Registro (Windows) ou em arquivos abertos.",
      "Sempre chame PlayerPrefs.Save() depois de gravar; em mobile o app pode ser morto sem aviso.",
      "Use prefixos nas chaves (audio., video., player.) para evitar colisão e facilitar limpeza.",
      "Use HasKey para detectar 'primeira execução' e aplicar valores padrão sensatos.",
      "Para bool, salve int 0/1; para Vector3, salve três floats com sufixos.",
      "Nunca guarde moedas, gemas premium, conquistas online ou qualquer coisa que mexa em economia.",
    ],
    alerts: [
      {
        type: "danger",
        content: "PlayerPrefs NÃO É CRIPTOGRAFADO. Qualquer jogador edita sua pontuação no Notepad em 5 segundos. Para dados que importam, use servidor ou no mínimo binário com hash de validação.",
      },
      {
        type: "warning",
        content: "No Android e iOS, fechar o app pelo gerenciador de tarefas pula o OnApplicationQuit. Se você não chamou Save() na hora da gravação, perde o dado. Sempre force Save() em settings críticos.",
      },
      {
        type: "tip",
        content: "Em desenvolvimento, mudar a Company Name ou Product Name do Player Settings cria uma nova entrada no Registro e seus PlayerPrefs antigos somem. Não é bug, é por design.",
      },
    ],
  },
  {
    slug: "json-utility",
    section: "persistencia",
    title: "JsonUtility: salvando classes inteiras como texto",
    difficulty: "intermediario",
    subtitle: "Transforme objetos C# em JSON legível e vice-versa, direto do Unity sem dependências externas.",
    intro: `Quando você precisa salvar mais que um número solto — por exemplo, o estado completo de um personagem, com nome, vida, posição, inventário — o PlayerPrefs vira uma colher de chá tentando esvaziar uma piscina. A solução natural é serializar: pegar um objeto C# em memória, transformar em texto, gravar em arquivo, e depois fazer o caminho inverso. O formato mais usado para isso é o JSON, porque é legível por humanos, suportado por toda linguagem moderna e fácil de inspecionar quando algo dá errado.

O Unity vem com uma classe chamada JsonUtility que faz esse trabalho. Ela é simples, rápida e não precisa de pacote externo. Mas ela tem regras: só serializa o que é marcado como [Serializable] (uma classe ou struct), só enxerga campos públicos OU campos privados marcados com [SerializeField], e não suporta dicionários, polimorfismo ou propriedades com get/set. Se isso parece restrição demais, é porque é mesmo. Para casos sofisticados, gente da indústria usa Newtonsoft.Json (instalável via Package Manager pelo nome com.unity.nuget.newtonsoft-json). Para 90% dos saves de jogo, JsonUtility já dá conta.

Pense no fluxo assim: você cria uma classe SaveData com todos os campos que importam, popula com os dados atuais do jogo (vida, posição, inventário), chama JsonUtility.ToJson para virar string e grava num arquivo dentro de Application.persistentDataPath. Para carregar, você lê o arquivo, chama JsonUtility.FromJson e o Unity reconstrói a classe inteira. É elegante, leva poucas linhas e o arquivo resultante pode ser aberto no editor de texto para você debugar.

Uma armadilha clássica: muita gente tenta serializar diretamente um MonoBehaviour ou um GameObject. Não funciona. JsonUtility só lida com classes simples (POCO — Plain Old C# Object). A boa prática é criar uma classe espelho, chamada DTO (Data Transfer Object), que contém só os dados que você quer salvar. Essa separação tem outro benefício: amanhã você muda o MonoBehaviour de lugar, refatora componentes, mas o DTO continua estável. O save antigo continua carregando.`,
    codes: [
      {
        lang: "csharp",
        code: `using System;
using UnityEngine;

// [Serializable] é OBRIGATÓRIO. Sem isso, o JsonUtility gera "{}".
[Serializable]
public class PlayerSaveData
{
    // Campos públicos são serializados por padrão.
    public string playerName;
    public int level;
    public float health;

    // Vector3 já é serializável nativamente pelo Unity.
    public Vector3 position;

    // Listas funcionam, desde que o tipo dentro também seja serializável.
    public string[] inventory;

    // Construtor opcional só para facilitar a criação.
    public PlayerSaveData() { }

    public PlayerSaveData(string nome, int nivel, float vida, Vector3 pos)
    {
        playerName = nome;
        level = nivel;
        health = vida;
        position = pos;
        inventory = new string[0];
    }
}`,
      },
      {
        lang: "csharp",
        code: `using System.IO;
using UnityEngine;

public class SaveLoadJson : MonoBehaviour
{
    // Application.persistentDataPath é o ÚNICO caminho seguro para escrita
    // em todas as plataformas (Windows, Mac, iOS, Android, console).
    private string CaminhoSave => Path.Combine(Application.persistentDataPath, "save.json");

    public void SalvarJogo(PlayerSaveData dados)
    {
        // ToJson converte objeto -> string JSON.
        // O segundo parâmetro (true) ativa indentação para ler melhor.
        string json = JsonUtility.ToJson(dados, true);

        // File.WriteAllText cria ou sobrescreve o arquivo.
        File.WriteAllText(CaminhoSave, json);
        Debug.Log($"Salvo em: {CaminhoSave}");
    }

    public PlayerSaveData CarregarJogo()
    {
        if (!File.Exists(CaminhoSave))
        {
            Debug.LogWarning("Nenhum save encontrado. Retornando dados padrão.");
            return new PlayerSaveData("Novo Jogador", 1, 100f, Vector3.zero);
        }

        string json = File.ReadAllText(CaminhoSave);

        // FromJson reconstrói o objeto a partir da string.
        // Se o JSON estiver corrompido, lança exceção — trate em produção.
        return JsonUtility.FromJson<PlayerSaveData>(json);
    }
}`,
      },
      {
        lang: "json",
        code: `{
    "playerName": "Aragorn",
    "level": 12,
    "health": 87.5,
    "position": {
        "x": 14.2,
        "y": 0.0,
        "z": -33.7
    },
    "inventory": [
        "espada_longa",
        "pocao_vida",
        "chave_dourada"
    ]
}`,
      },
      {
        lang: "csharp",
        code: `using System;
using System.Collections.Generic;
using UnityEngine;

// JsonUtility NÃO serializa Dictionary diretamente.
// Truque clássico: duas listas paralelas de chaves e valores.
[Serializable]
public class SerializableDictionary
{
    public List<string> chaves = new List<string>();
    public List<int> valores = new List<int>();

    public void FromDictionary(Dictionary<string, int> dicionario)
    {
        chaves.Clear();
        valores.Clear();
        foreach (var par in dicionario)
        {
            chaves.Add(par.Key);
            valores.Add(par.Value);
        }
    }

    public Dictionary<string, int> ToDictionary()
    {
        var resultado = new Dictionary<string, int>();
        for (int i = 0; i < chaves.Count; i++)
        {
            resultado[chaves[i]] = valores[i];
        }
        return resultado;
    }
}`,
      },
    ],
    points: [
      "JsonUtility só funciona com classes/structs marcadas [Serializable].",
      "Apenas campos públicos ou [SerializeField] são serializados; propriedades com get/set são ignoradas.",
      "Vector2, Vector3, Quaternion e Color já são serializáveis nativamente.",
      "Dicionários e tipos polimórficos exigem workaround ou Newtonsoft.Json.",
      "Sempre grave em Application.persistentDataPath; outros caminhos quebram em mobile.",
      "Crie uma classe DTO separada do MonoBehaviour para isolar mudanças de código.",
      "JSON indentado é ouro para debugar; em produção, salve sem indentação para reduzir tamanho.",
    ],
    alerts: [
      {
        type: "info",
        content: "JsonUtility é cerca de 10x mais rápido que Newtonsoft.Json para tipos simples, porque ele compartilha o serializador interno do Unity. Mas perde em flexibilidade. Avalie caso a caso.",
      },
      {
        type: "warning",
        content: "Trocar o NOME de um campo na classe quebra todos os saves antigos do usuário. Use [FormerlySerializedAs(\"nomeAntigo\")] do Unity para migrar sem perder dados.",
      },
      {
        type: "tip",
        content: "Adicione um campo public int saveVersion = 1; no DTO desde o primeiro dia. Quando precisar mudar o formato, você incrementa e roda código de migração baseado nesse número.",
      },
    ],
  },
  {
    slug: "binary-save",
    section: "persistencia",
    title: "Save binário: rápido, compacto e (quase sempre) uma cilada",
    difficulty: "intermediario",
    subtitle: "Como funciona o BinaryFormatter, por que ele já foi padrão e por que você deve evitá-lo hoje.",
    intro: `Por muito tempo, a forma 'profissional' de salvar dados em jogos Unity foi usar serialização binária com BinaryFormatter, da biblioteca System.Runtime.Serialization.Formatters.Binary. A ideia era boa: em vez de gerar texto como o JSON faz, você grava os bytes direto, em um formato compacto e mais rápido de ler. O arquivo resultante é ilegível para humanos, o que dava uma falsa sensação de segurança contra cheaters de fim de semana.

Acontece que o tempo passou e a comunidade .NET descobriu coisas feias sobre o BinaryFormatter. Ele permite executar código arbitrário durante a desserialização: se um atacante consegue trocar o seu arquivo de save por um binário malicioso, ele literalmente roda comandos no computador da vítima. A Microsoft marcou a classe como obsoleta no .NET 5 e prometeu remover em versões futuras. O Unity ainda suporta, mas você verá warnings cada vez mais agressivos a cada upgrade da engine.

Então por que estudar isso? Por três motivos. Primeiro: existem milhares de jogos publicados que usam esse padrão e você vai esbarrar em código legado. Segundo: entender o conceito ajuda a apreciar alternativas modernas. Terceiro: para casos muito específicos (dados temporários do jogador, em arquivos que nunca saem do computador dele e nunca são compartilhados), ainda funciona — desde que você esteja consciente do risco. A regra prática hoje é: para saves novos, prefira JSON (debug fácil) ou MessagePack/Protobuf (binário moderno e seguro). BinaryFormatter só em código já estabelecido e isolado.

Existe uma alternativa segura e mais moderna no Unity: o System.Text.Json (a partir do .NET Standard 2.1) e bibliotecas como MessagePack-CSharp, que dão velocidade binária sem a brecha de execução de código. Você instala via Package Manager ou NuGet for Unity e usa de forma quase idêntica ao JsonUtility. Para o iniciante, a recomendação é direta: aprenda o conceito de binário, mas em jogos novos comece com JSON e migre se a performance virar gargalo medido (não suposto).`,
    codes: [
      {
        lang: "csharp",
        code: `using System;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;
using UnityEngine;

// Atenção: este código gera warning de obsoleto a partir do Unity 2022+.
// Mostra apenas o conceito. Em produção, prefira JSON ou MessagePack.

[Serializable]
public class GameStateBinary
{
    public int gold;
    public int experience;
    public string[] unlockedSkills;
}

public class BinarySaveExample : MonoBehaviour
{
    private string Caminho => Path.Combine(Application.persistentDataPath, "save.dat");

    public void SalvarBinario(GameStateBinary dados)
    {
        // BinaryFormatter ainda existe, mas a Microsoft pediu para parar de usar.
        BinaryFormatter formatter = new BinaryFormatter();

        // FileStream abre o arquivo para escrita; using garante o fechamento.
        using (FileStream stream = File.Create(Caminho))
        {
            #pragma warning disable SYSLIB0011 // suprime o aviso de obsoleto
            formatter.Serialize(stream, dados);
            #pragma warning restore SYSLIB0011
        }

        Debug.Log("Save binário gravado em " + Caminho);
    }

    public GameStateBinary CarregarBinario()
    {
        if (!File.Exists(Caminho)) return null;

        BinaryFormatter formatter = new BinaryFormatter();
        using (FileStream stream = File.OpenRead(Caminho))
        {
            #pragma warning disable SYSLIB0011
            // PERIGO: se o arquivo foi adulterado, isto pode rodar código malicioso.
            return (GameStateBinary)formatter.Deserialize(stream);
            #pragma warning restore SYSLIB0011
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using System.IO;
using System.Text;
using System.Security.Cryptography;
using UnityEngine;

// Alternativa MUITO mais segura: JSON + ofuscação por XOR + hash de integridade.
// Não é criptografia forte, mas resolve cheaters casuais sem expor o jogo a RCE.
public static class SafeBinarySave
{
    private const string CHAVE_XOR = "chave_secreta_do_jogo_v1";

    public static void Salvar<T>(T objeto, string caminho)
    {
        string json = JsonUtility.ToJson(objeto);

        // Calcula um hash do conteúdo original; gravamos junto.
        string hash = CalcularHash(json);
        string payload = hash + "|" + json;

        // Aplica XOR simples para o conteúdo não ser legível em editor de texto.
        byte[] bytes = Encoding.UTF8.GetBytes(payload);
        for (int i = 0; i < bytes.Length; i++)
        {
            bytes[i] ^= (byte)CHAVE_XOR[i % CHAVE_XOR.Length];
        }

        File.WriteAllBytes(caminho, bytes);
    }

    public static T Carregar<T>(string caminho) where T : class
    {
        if (!File.Exists(caminho)) return null;

        byte[] bytes = File.ReadAllBytes(caminho);
        for (int i = 0; i < bytes.Length; i++)
        {
            bytes[i] ^= (byte)CHAVE_XOR[i % CHAVE_XOR.Length];
        }

        string payload = Encoding.UTF8.GetString(bytes);
        int sep = payload.IndexOf('|');
        if (sep < 0) return null;

        string hashGravado = payload.Substring(0, sep);
        string json = payload.Substring(sep + 1);

        // Verifica se ninguém editou o JSON manualmente.
        if (CalcularHash(json) != hashGravado)
        {
            Debug.LogError("Save adulterado! Hash não bate.");
            return null;
        }

        return JsonUtility.FromJson<T>(json);
    }

    private static string CalcularHash(string texto)
    {
        using (var sha = SHA256.Create())
        {
            byte[] h = sha.ComputeHash(Encoding.UTF8.GetBytes(texto + "sal_unico_aqui"));
            return System.Convert.ToBase64String(h);
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `// Como migrar saves antigos (binário) para o novo formato (JSON+hash):
using System.IO;
using UnityEngine;

public class MigracaoSave : MonoBehaviour
{
    private void Start()
    {
        string velho = Path.Combine(Application.persistentDataPath, "save.dat");
        string novo = Path.Combine(Application.persistentDataPath, "save.json");

        // Se já existe o novo, não precisa migrar.
        if (File.Exists(novo)) return;
        if (!File.Exists(velho)) return;

        // 1) Carrega no formato antigo (com try/catch porque pode falhar).
        try
        {
            var bin = new BinarySaveExample();
            var dados = bin.CarregarBinario();
            if (dados == null) return;

            // 2) Converte para o DTO novo e grava.
            // (aqui você mapeia campo a campo do velho para o novo)
            string json = JsonUtility.ToJson(dados, true);
            File.WriteAllText(novo, json);

            // 3) Apaga o antigo só depois de confirmar gravação.
            File.Delete(velho);
            Debug.Log("Save migrado com sucesso para JSON.");
        }
        catch (System.Exception e)
        {
            Debug.LogError("Falha na migração: " + e.Message);
        }
    }
}`,
      },
    ],
    points: [
      "BinaryFormatter está oficialmente obsoleto desde .NET 5 por permitir execução remota de código.",
      "Arquivos binários NÃO são criptografia: são apenas ilegíveis a olho nu.",
      "Para velocidade binária moderna e segura, use MessagePack-CSharp ou Protobuf.",
      "JSON com XOR + hash SHA256 cobre 90% dos casos de proteção contra cheaters casuais.",
      "Sempre planeje migração de formato: o jogador instalado não pode perder progresso na atualização.",
      "Em casos de dados realmente sensíveis (compras, ranking online), confie só no servidor.",
      "Code de produção deve sempre envolver Deserialize em try/catch — arquivos podem estar corrompidos.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Não desserialize binário de fontes externas (download, peer-to-peer, save compartilhado). É um vetor real de ataque, com casos documentados em jogos famosos como Civilization e Stardew Valley.",
      },
      {
        type: "warning",
        content: "BinaryFormatter pode ser removido completamente em versões futuras do Unity (provavelmente quando subirem para .NET 8). Código novo já não deve depender dele.",
      },
      {
        type: "tip",
        content: "Se sua única motivação para 'binário' era evitar que o jogador edite o save, JSON com hash de integridade entrega o mesmo resultado prático sem os perigos. E você consegue debugar abrindo no VS Code.",
      },
    ],
  },
  {
    slug: "save-system",
    section: "persistencia",
    title: "Construindo um Save System robusto e versionado",
    difficulty: "avancado",
    subtitle: "Arquitetura de DTO, slots de save, versionamento e tratamento de corrupção de arquivo.",
    intro: `Um save system de verdade não é uma função 'salvar' colada no menu de pause. É uma camada do jogo, com responsabilidades claras: empacotar o estado atual, persistir no disco com segurança, validar ao carregar, migrar de versões antigas e expor uma API limpa para o resto do código. Pequenos jogos sobrevivem com gambiarra; jogos que vão para Steam, console ou mobile precisam disso pronto antes do primeiro patch, porque ninguém quer telefonar para o jogador pedindo desculpa por ter quebrado o save.

A primeira decisão importante é separar o ESTADO DO JOGO em runtime (componentes, prefabs, MonoBehaviours) do MODELO DE PERSISTÊNCIA (classes simples, planas, marcadas como [Serializable]). Esse modelo é o DTO. Ele tem só os campos que precisam sobreviver entre execuções: progresso, posição, inventário, configurações. O resto da arquitetura do jogo pode mudar, refatorar, virar de cabeça para baixo, e o save continua compatível porque o DTO segue estável.

A segunda decisão é o caminho. Sempre Application.persistentDataPath. Em Windows ele aponta para %userprofile%\\AppData\\LocalLow\\Empresa\\Jogo, em macOS para ~/Library/Application Support, em iOS dentro da sandbox do app, em Android para o data folder do APK. É o único lugar com permissão de escrita garantida em todas as plataformas. Application.dataPath é só leitura em build (aponta para dentro do APK!), então gravar lá funciona no editor mas falha no celular.

A terceira é versionamento. Adicione um campo int saveVersion no seu SaveData. Toda vez que você muda o formato (adiciona campo, remove, renomeia), incrementa o número e escreve uma função de migração que pega a versão antiga e converte para a nova. Sem isso, qualquer atualização vai quebrar saves de quem instalou seu jogo. Estúdios sérios mantêm migrações desde a versão 1, ainda hoje. A quarta é segurança contra corrupção: grave em arquivo temporário, valide hash, e só então renomeie para o nome final. Se o jogo cair no meio da gravação (queda de luz, crash), o save antigo ainda está intacto.`,
    codes: [
      {
        lang: "csharp",
        code: `using System;
using System.Collections.Generic;
using UnityEngine;

// O DTO único do jogo. Tudo o que precisa sobreviver passa por aqui.
[Serializable]
public class SaveData
{
    // Versão SEMPRE primeiro. Comece em 1.
    public int saveVersion = CURRENT_VERSION;
    public const int CURRENT_VERSION = 3;

    // Metadados úteis para o menu de "selecionar save".
    public string saveName = "Slot 1";
    public string timestamp = ""; // ISO 8601, ex: "2024-05-12T14:30:00Z"
    public float playTimeSeconds = 0f;
    public int sceneIndex = 0;

    // Dados do jogador.
    public PlayerDTO player = new PlayerDTO();

    // Listas de coisas mutáveis no mundo.
    public List<EnemyDTO> defeatedEnemies = new List<EnemyDTO>();
    public List<string> collectedItems = new List<string>();
}

[Serializable]
public class PlayerDTO
{
    public Vector3 position;
    public Quaternion rotation;
    public float health = 100f;
    public int gold = 0;
    public string[] equipped = new string[0];
}

[Serializable]
public class EnemyDTO
{
    public string id;       // ID único definido no prefab
    public bool isDead;
}`,
      },
      {
        lang: "csharp",
        code: `using System;
using System.IO;
using UnityEngine;

// Service que empacota toda a lógica de I/O.
// Use como Singleton ou injete via ScriptableObject.
public class SaveService
{
    private string Pasta => Path.Combine(Application.persistentDataPath, "saves");

    public string CaminhoSlot(int slot) =>
        Path.Combine(Pasta, $"save_{slot}.json");

    public string CaminhoTemp(int slot) =>
        Path.Combine(Pasta, $"save_{slot}.tmp");

    public bool ExisteSlot(int slot) => File.Exists(CaminhoSlot(slot));

    public void Salvar(SaveData dados, int slot)
    {
        // 1) Garante que a pasta existe.
        if (!Directory.Exists(Pasta)) Directory.CreateDirectory(Pasta);

        // 2) Atualiza metadados antes de gravar.
        dados.timestamp = DateTime.UtcNow.ToString("o");
        dados.saveVersion = SaveData.CURRENT_VERSION;

        // 3) Serializa.
        string json = JsonUtility.ToJson(dados, true);

        // 4) Grava em arquivo TEMPORÁRIO. Se cair luz aqui, o save anterior sobrevive.
        File.WriteAllText(CaminhoTemp(slot), json);

        // 5) Substitui o arquivo final de forma atômica.
        // File.Replace falha se o destino não existir; tratamos antes.
        if (File.Exists(CaminhoSlot(slot)))
            File.Replace(CaminhoTemp(slot), CaminhoSlot(slot), null);
        else
            File.Move(CaminhoTemp(slot), CaminhoSlot(slot));

        Debug.Log($"Slot {slot} salvo: {CaminhoSlot(slot)}");
    }

    public SaveData Carregar(int slot)
    {
        if (!ExisteSlot(slot)) return null;

        try
        {
            string json = File.ReadAllText(CaminhoSlot(slot));
            SaveData dados = JsonUtility.FromJson<SaveData>(json);

            // Migração se for de versão antiga.
            if (dados.saveVersion < SaveData.CURRENT_VERSION)
                dados = SaveMigrator.Migrar(dados);

            return dados;
        }
        catch (Exception e)
        {
            Debug.LogError($"Save do slot {slot} corrompido: {e.Message}");
            return null;
        }
    }

    public void Apagar(int slot)
    {
        if (File.Exists(CaminhoSlot(slot))) File.Delete(CaminhoSlot(slot));
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Migrador: traduz saves antigos para o formato atual.
// Mantenha funções de migração para SEMPRE (jogador pode pular várias versões).
public static class SaveMigrator
{
    public static SaveData Migrar(SaveData dados)
    {
        if (dados.saveVersion < 2) MigrarV1ParaV2(dados);
        if (dados.saveVersion < 3) MigrarV2ParaV3(dados);

        dados.saveVersion = SaveData.CURRENT_VERSION;
        return dados;
    }

    private static void MigrarV1ParaV2(SaveData d)
    {
        // Exemplo: na v2 adicionamos o campo playTimeSeconds.
        // Saves v1 vinham sem ele, então definimos um padrão razoável.
        if (d.playTimeSeconds <= 0f) d.playTimeSeconds = 60f;

        // Talvez antes "gold" estava em outra estrutura; já estamos no formato novo.
        Debug.Log("Save migrado de v1 para v2");
    }

    private static void MigrarV2ParaV3(SaveData d)
    {
        // Exemplo: na v3 renomeamos "items" para "collectedItems".
        // Como estamos em C#, não tem como recuperar o nome antigo aqui sem JSON cru.
        // O ideal é usar [FormerlySerializedAs] ou parsear o JSON manualmente.
        Debug.Log("Save migrado de v2 para v3");
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Ponto de entrada chamado pela UI. Coordena coleta, salvamento e feedback.
public class SaveCoordinator : MonoBehaviour
{
    private readonly SaveService service = new SaveService();

    public void SalvarAgora(int slot)
    {
        SaveData dados = ColetarEstadoAtual();
        service.Salvar(dados, slot);
    }

    public bool CarregarSlot(int slot)
    {
        SaveData dados = service.Carregar(slot);
        if (dados == null) return false;

        AplicarEstado(dados);
        return true;
    }

    // ColetarEstadoAtual percorre os sistemas (Player, Inventory, World)
    // e empacota tudo no DTO. Cada sistema expõe um método 'Capture()'.
    private SaveData ColetarEstadoAtual()
    {
        var dados = new SaveData
        {
            sceneIndex = UnityEngine.SceneManagement.SceneManager.GetActiveScene().buildIndex,
            playTimeSeconds = Time.realtimeSinceStartup,
        };
        // dados.player = PlayerController.Instance.Capture();
        // dados.collectedItems = Inventory.Instance.GetCollectedIds();
        return dados;
    }

    private void AplicarEstado(SaveData dados)
    {
        // Carrega a cena correta antes de aplicar dados de mundo.
        // PlayerController.Instance.Apply(dados.player);
        // Inventory.Instance.Restore(dados.collectedItems);
    }
}`,
      },
    ],
    points: [
      "Sempre separe DTO (dado puro) de MonoBehaviour (lógica). DTO sobrevive a refatorações.",
      "Application.persistentDataPath é o ÚNICO caminho seguro para escrita em build.",
      "Inclua int saveVersion desde o primeiro release; vai te salvar nos próximos patches.",
      "Grave em arquivo .tmp e use File.Replace para evitar corrupção em caso de crash.",
      "Mantenha funções de migração indefinidamente; jogadores pulam versões.",
      "Use multiplos slots (save_0.json, save_1.json) e exponha thumbnails/timestamps na UI.",
      "Sempre envolva a leitura em try/catch — disco corrompido e arquivo editado existem.",
      "Para saves grandes, considere salvar em background com Task.Run para não travar a UI.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Salvar dentro de OnApplicationQuit é ARRISCADO em mobile: o iOS pode matar o app antes da função terminar. Salve em momentos previsíveis (checkpoint, menu de pause) e marque dirty=true no resto.",
      },
      {
        type: "tip",
        content: "Para jogos com cloud save (Steam Cloud, iCloud, Google Play), use a mesma estrutura local e configure o serviço para sincronizar a pasta inteira de Application.persistentDataPath. Não reescreva a lógica.",
      },
      {
        type: "info",
        content: "Em jogos com mundo aberto, salvar TUDO toda vez fica caro. Padrão de produção: dividir em SaveData (essencial, salvo sempre) e ChunkData (regiões, salvas sob demanda).",
      },
    ],
  },
  {
    slug: "addressables",
    section: "persistencia",
    title: "Addressables: carregando assets sob demanda",
    difficulty: "avancado",
    subtitle: "Reduza o tamanho do build, atualize conteúdo sem republicar e gerencie memória de verdade.",
    intro: `Conforme o seu jogo cresce, um problema bate na porta: cada prefab, cada textura, cada som referenciado direto em um campo público de MonoBehaviour é carregado em memória junto com a cena. Você abre uma cena pequena e o Unity carrega todo o cosmos. Em mobile, isso é a diferença entre rodar e crashar com OutOfMemory. Em consoles, é a diferença entre passar e falhar na certificação. O sistema Addressables, mantido pela Unity, resolve esse problema com elegância.

A ideia é simples: em vez de referenciar o asset diretamente (e forçar carregamento), você o marca como 'addressable' e referencia por um endereço (string ou AssetReference). No momento que precisa, pede ao sistema para carregar; quando termina, pede para liberar. O Unity também separa esses assets do build principal em pacotes (.bundle) que podem ser hospedados localmente OU em um servidor remoto. Isso significa duas coisas poderosas: builds menores e atualização de conteúdo sem republicar na loja.

Para começar, você instala o pacote pelo Package Manager (com.unity.addressables), abre Window > Asset Management > Addressables > Groups e marca os assets que quer transformar em endereçáveis. Cada um ganha um endereço (geralmente o caminho do arquivo, mas pode renomear). No código, você usa Addressables.LoadAssetAsync<GameObject>('endereco') que devolve uma AsyncOperationHandle. Quando termina, você instancia, usa, e quando não precisa mais, chama Addressables.Release.

A pegadinha grande é gestão de memória. Diferente do Resources.Load (que mantém tudo em cache até o fim), Addressables exige que você libere o que carregou. Esquecer isso vira vazamento de memória que cresce silenciosamente. A regra: para todo Load, um Release. Para AsyncOperationHandle armazenada, sempre verifique IsValid antes de usar. Ferramentas como o Memory Profiler ajudam a ver quem segurou o asset por engano.

Addressables também substitui de vez a pasta Resources, que era o modo antigo de carregar por string. A Unity desencoraja Resources oficialmente desde 2017: ele aumenta o tempo de inicialização (precisa indexar tudo) e não permite gestão por bundle. Em projetos novos, comece com Addressables direto. Em projetos legados, migre gradualmente.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

// Carregamento básico por string (endereço).
public class SpawnInimigoAddressable : MonoBehaviour
{
    // Endereço definido na janela Addressables Groups.
    private const string ENDERECO_INIMIGO = "Prefabs/Goblin";

    private GameObject instanciaCarregada;
    private AsyncOperationHandle<GameObject> handle;

    public async void Spawn(Vector3 posicao)
    {
        // LoadAssetAsync devolve um Handle assíncrono.
        handle = Addressables.LoadAssetAsync<GameObject>(ENDERECO_INIMIGO);

        // await espera carregar SEM travar a thread principal.
        GameObject prefab = await handle.Task;

        if (handle.Status != AsyncOperationStatus.Succeeded)
        {
            Debug.LogError("Falha ao carregar " + ENDERECO_INIMIGO);
            return;
        }

        instanciaCarregada = Instantiate(prefab, posicao, Quaternion.identity);
    }

    private void OnDestroy()
    {
        // SEMPRE libere. Sem isso, o asset fica preso na memória.
        if (handle.IsValid()) Addressables.Release(handle);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.AddressableAssets;

// Forma mais segura: AssetReference em vez de string.
// Você arrasta o asset no Inspector; o Unity te avisa se renomeou.
public class ArmaSpawner : MonoBehaviour
{
    // No Inspector, vai aparecer um campo "Object" para arrastar o prefab.
    public AssetReferenceGameObject armaReference;

    private GameObject instancia;

    public void Equipar()
    {
        // InstantiateAsync já carrega + instancia em uma chamada.
        armaReference.InstantiateAsync(transform).Completed += op =>
        {
            if (op.Status == UnityEngine.ResourceManagement.AsyncOperations.AsyncOperationStatus.Succeeded)
            {
                instancia = op.Result;
            }
        };
    }

    public void Desequipar()
    {
        // ReleaseInstance libera tanto a instância quanto a referência interna.
        if (instancia != null)
        {
            armaReference.ReleaseInstance(instancia);
            instancia = null;
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using System.Collections.Generic;
using UnityEngine;
using UnityEngine.AddressableAssets;
using UnityEngine.ResourceManagement.AsyncOperations;

// Carregar VÁRIOS assets por label (tag).
// Defina labels na janela Addressables (ex.: "boss-fase-1", "audio-tutorial").
public class CarregadorPorLabel : MonoBehaviour
{
    private AsyncOperationHandle<IList<GameObject>> handle;
    private List<GameObject> bossesCarregados = new List<GameObject>();

    public async void CarregarBosses()
    {
        // LoadAssetsAsync com label retorna lista de tudo que tem aquela tag.
        handle = Addressables.LoadAssetsAsync<GameObject>(
            "boss-fase-1",
            (prefab) => Debug.Log("Carregado: " + prefab.name)
        );

        IList<GameObject> resultado = await handle.Task;
        bossesCarregados.AddRange(resultado);
    }

    private void OnDestroy()
    {
        if (handle.IsValid()) Addressables.Release(handle);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;
using UnityEngine.AddressableAssets;

// Atualização de conteúdo remoto (sem republicar na Steam/Play Store).
public class AtualizadorDeConteudo : MonoBehaviour
{
    private async void Start()
    {
        // 1) Verifica catálogo remoto por novidades.
        var checkHandle = Addressables.CheckForCatalogUpdates(false);
        var catalogos = await checkHandle.Task;

        if (catalogos.Count > 0)
        {
            Debug.Log($"Existem {catalogos.Count} catálogos novos no servidor.");

            // 2) Aplica os catálogos atualizados.
            var updateHandle = Addressables.UpdateCatalogs(catalogos, false);
            await updateHandle.Task;

            // 3) Pré-baixa novos bundles para evitar lag em jogo.
            var downloadHandle = Addressables.DownloadDependenciesAsync("conteudo-dlc-1");
            await downloadHandle.Task;

            Debug.Log("Conteúdo atualizado!");
            Addressables.Release(downloadHandle);
        }

        Addressables.Release(checkHandle);
    }
}`,
      },
    ],
    points: [
      "Addressables substitui Resources e AssetBundles em projetos novos.",
      "Cada asset endereçável tem um endereço (string) e/ou pode ser referenciado por AssetReference.",
      "Para todo LoadAssetAsync deve haver um Release; sem isso, vazamento de memória.",
      "AssetReference é mais seguro que string: o Inspector avisa se você apaga ou renomeia o asset.",
      "Builds ficam menores quando os bundles são hospedados remotamente em CDN.",
      "Use labels para carregar grupos de assets relacionados de uma só vez.",
      "CheckForCatalogUpdates + UpdateCatalogs permite atualizar conteúdo sem nova versão na loja.",
      "Use InstantiateAsync + ReleaseInstance para evitar gerenciar handle e instância separadamente.",
    ],
    alerts: [
      {
        type: "info",
        content: "Em build local (Local Hosting), o Unity coloca os bundles dentro de StreamingAssets. Em build remoto (Remote Hosting), você precisa de um servidor (S3, Cloudflare, Azure) e ter cuidado com CORS.",
      },
      {
        type: "warning",
        content: "Cuidado com Addressables.LoadSceneAsync: ele NÃO descarrega cenas adicivas automaticamente. Use UnloadSceneAsync e libere o handle, ou a cena fica residente na memória.",
      },
      {
        type: "tip",
        content: "Ative 'Send Profiler Events' nas Addressables Settings durante desenvolvimento. A janela Addressables Profiler mostra exatamente quais bundles estão carregados e quem segura cada referência.",
      },
    ],
  },
  {
    slug: "asset-bundles",
    section: "persistencia",
    title: "AssetBundles: o sistema legado que ainda aparece",
    difficulty: "avancado",
    subtitle: "Como funcionavam, por que foram substituídos e quando você ainda vai precisar mexer neles.",
    intro: `Antes do Addressables existir, o jeito de empacotar assets para download remoto ou redução de build era o AssetBundle. Você marca cada asset com um nome de bundle no Inspector, roda BuildPipeline.BuildAssetBundles e o Unity gera arquivos binários que podem ser hospedados em servidor e baixados em runtime. Por mais de uma década foi a única opção, e até hoje muito código de produção (especialmente em jogos chineses, projetos de empresa e MMOs antigos) depende disso.

O problema do AssetBundle puro é que ele te deixa na mão para várias decisões: gestão de dependências entre bundles, cache local, versionamento, identificação por hash, descarga em background. Você precisa programar tudo isso na unha. Falar para um iniciante 'use AssetBundles' é como entregar uma chave de fenda e dizer 'monte um motor'. Funciona, mas dá muito trabalho. O Addressables veio justamente para encapsular tudo isso e expor uma API simples por cima.

Mesmo assim, há motivos legítimos para conhecer AssetBundles. Primeiro, código legado: se você entrar em um projeto com 4 anos de Unity, vai esbarrar. Segundo, quando você precisa de controle absoluto (uma plataforma específica, um pipeline customizado, integração com uma CDN exótica), pode valer a pena descer ao nível baixo. Terceiro, certos middlewares e mods de jogos (como o sistema de mods de Stardew Valley ou Cities Skylines) usam AssetBundles porque podem ser construídos isoladamente fora do projeto principal.

A regra prática: para projeto novo, vá direto de Addressables. Para projeto antigo, mantenha o que está funcionando e migre incrementalmente. NUNCA misture os dois sistemas para o mesmo conteúdo, porque a gestão de cache e dependência conflita. Se o seu objetivo é DLC ou mod paid, considere também as ferramentas oficiais da Steam (Workshop) ou da plataforma alvo, que têm integração nativa.`,
    codes: [
      {
        lang: "csharp",
        code: `#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using System.IO;

// Script de Editor que constrói os AssetBundles.
// Coloque na pasta Assets/Editor.
public class BuildAssetBundles
{
    [MenuItem("Build/AssetBundles - Windows")]
    public static void BuildAllWindows()
    {
        string outputPath = "AssetBundles/Windows";

        // Garante que a pasta exista.
        if (!Directory.Exists(outputPath))
            Directory.CreateDirectory(outputPath);

        // BuildPipeline gera os bundles a partir das tags definidas no Inspector.
        BuildPipeline.BuildAssetBundles(
            outputPath,
            BuildAssetBundleOptions.None,        // ou ChunkBasedCompression para LZ4
            BuildTarget.StandaloneWindows64
        );

        Debug.Log("AssetBundles construídos em " + outputPath);
    }
}
#endif`,
      },
      {
        lang: "csharp",
        code: `using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

// Carregando um bundle remoto via UnityWebRequest.
public class LoaderBundleRemoto : MonoBehaviour
{
    private const string URL = "https://meu-cdn.com/bundles/personagens";
    private AssetBundle bundle;

    private IEnumerator Start()
    {
        // UnityWebRequestAssetBundle baixa e cacheia automaticamente.
        UnityWebRequest request = UnityWebRequestAssetBundle.GetAssetBundle(URL, 0);
        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError("Erro: " + request.error);
            yield break;
        }

        // Extrai o bundle do request.
        bundle = DownloadHandlerAssetBundle.GetContent(request);

        // LoadAsset puxa um asset específico por nome.
        GameObject prefab = bundle.LoadAsset<GameObject>("Hero");
        Instantiate(prefab);
    }

    private void OnDestroy()
    {
        // Sempre descarregue o bundle quando não precisar mais.
        // Parâmetro true também destrói as instâncias carregadas dele.
        if (bundle != null) bundle.Unload(false);
    }
}`,
      },
      {
        lang: "csharp",
        code: `using System.Collections;
using UnityEngine;

// Carregando um bundle local (de StreamingAssets, por exemplo).
public class LoaderBundleLocal : MonoBehaviour
{
    private AssetBundle bundle;

    private IEnumerator Start()
    {
        // StreamingAssets é incluído no build mas só lido em runtime.
        string caminho = System.IO.Path.Combine(
            Application.streamingAssetsPath,
            "personagens"
        );

        // LoadFromFileAsync lê do disco sem travar.
        AssetBundleCreateRequest request = AssetBundle.LoadFromFileAsync(caminho);
        yield return request;

        bundle = request.assetBundle;
        if (bundle == null)
        {
            Debug.LogError("Falhou ao carregar bundle local.");
            yield break;
        }

        // Lista todos os assets do bundle (útil para debug).
        foreach (string nome in bundle.GetAllAssetNames())
        {
            Debug.Log("Bundle contém: " + nome);
        }

        // Carrega o manifesto de dependências, se houver.
        AssetBundleManifest manifest = bundle.LoadAsset<AssetBundleManifest>(
            "AssetBundleManifest"
        );
        if (manifest != null)
        {
            string[] depends = manifest.GetAllDependencies("personagens");
            foreach (string dep in depends)
                Debug.Log("Depende de: " + dep);
        }
    }
}`,
      },
    ],
    points: [
      "AssetBundles é o sistema antigo de empacotamento; Addressables é o substituto recomendado.",
      "Você marca o bundle no Inspector (canto inferior direito do asset).",
      "BuildPipeline.BuildAssetBundles gera os arquivos por plataforma — cada SO tem seu pacote.",
      "Carregue com AssetBundle.LoadFromFile (local) ou UnityWebRequestAssetBundle (remoto).",
      "Sempre chame bundle.Unload(false) para liberar memória quando terminar.",
      "Você precisa gerenciar dependências, cache, versionamento e hash manualmente.",
      "Para projetos novos, prefira Addressables; AssetBundle só por compatibilidade ou caso especial.",
    ],
    alerts: [
      {
        type: "warning",
        content: "Cada plataforma precisa do seu próprio build de AssetBundle. Não dá para usar um bundle de Windows em iOS, por exemplo. Tenha pipelines separados ou use Addressables que abstrai isso.",
      },
      {
        type: "info",
        content: "AssetBundle.Unload(true) destrói TUDO que veio dele, inclusive instâncias na cena. Use false se quiser apenas liberar a referência ao bundle mas manter os assets vivos.",
      },
      {
        type: "tip",
        content: "Para mods de jogadores (UGC), AssetBundles ainda é uma opção válida porque pode ser construído fora do seu projeto principal usando um Unity Editor 'mod kit'.",
      },
    ],
  },
  {
    slug: "scriptable-saves",
    section: "persistencia",
    title: "Salvando com ScriptableObject: o que funciona e o que parece funcionar",
    difficulty: "intermediario",
    subtitle: "Por que ScriptableObject é ótimo no Editor para autoria, mas péssimo como armazenamento em build.",
    intro: `ScriptableObject é uma das ferramentas mais elegantes do Unity. Você cria uma classe que herda de ScriptableObject, marca com [CreateAssetMenu] e ganha a possibilidade de criar instâncias daquela classe direto no Inspector como assets do projeto. É perfeito para configuração: dados de itens, balanceamento, listas de fases, perfis de inimigos. Tudo editável visualmente, sem código, com versionamento via Git porque cada SO é um arquivo na pasta Assets.

Aí surge a tentação. Já que ele guarda dados de forma persistente, será que dá para usar como save game? Eu altero a vida do jogador no SO em runtime, e o Unity grava sozinho, certo? ERRADO — e essa é uma das pegadinhas mais doloridas para iniciantes. No Editor, sim, alterações em ScriptableObject persistem entre execuções, porque o Unity escreve no arquivo .asset do projeto. Mas em BUILD, todos os ScriptableObjects são empacotados como recursos somente leitura. Qualquer alteração em runtime fica em memória e some quando o jogo fecha. É um falso positivo brutal: funciona perfeitamente no Play Mode e quebra silenciosamente quando você publica.

Então qual o uso correto? Como SOURCE OF TRUTH para dados de design (catálogo de itens, configurações de fases, valores de balanceamento). Você cria um SO ItemDatabase com a lista de todos os itens possíveis. No save de runtime, você só guarda os IDs dos itens que o jogador tem. Na hora de carregar, faz lookup no SO. Vantagens: você atualiza o catálogo sem mexer no código, designers editam tudo no Inspector, e o save fica pequeno (só IDs).

Outra técnica útil é o 'SO de runtime': um ScriptableObject que serve como holder de estado durante a sessão (vida atual do jogador, score, flag de modo difícil) e é compartilhado entre vários scripts SEM necessidade de Singleton. No fim da sessão, você serializa esse SO em JSON e grava em arquivo. No início, faz o caminho inverso. Combina o melhor dos dois mundos: design limpo via SO no Editor, persistência real via arquivo em build. Vamos ver os dois padrões em código.`,
    codes: [
      {
        lang: "csharp",
        code: `using UnityEngine;

// SO usado como SOURCE OF TRUTH (catálogo).
// CreateAssetMenu permite criar via clique direito > Create > Game > Item.
[CreateAssetMenu(menuName = "Game/Item")]
public class ItemSO : ScriptableObject
{
    public string itemId;            // ID único, ex: "espada_longa"
    public string displayName;       // Nome exibido na UI
    public Sprite icon;              // Ícone para inventário
    public int maxStack = 1;         // Quantos cabem em um slot
    public int basePrice = 0;        // Preço de venda base
}`,
      },
      {
        lang: "csharp",
        code: `using System.Collections.Generic;
using UnityEngine;

// Database que junta TODOS os ItemSO do jogo em um lugar.
[CreateAssetMenu(menuName = "Game/Item Database")]
public class ItemDatabase : ScriptableObject
{
    public List<ItemSO> allItems = new List<ItemSO>();

    // Cache para lookup rápido. Construído uma vez quando carregado.
    private Dictionary<string, ItemSO> lookup;

    public ItemSO GetById(string id)
    {
        if (lookup == null)
        {
            lookup = new Dictionary<string, ItemSO>();
            foreach (var item in allItems)
            {
                if (item != null && !string.IsNullOrEmpty(item.itemId))
                    lookup[item.itemId] = item;
            }
        }

        return lookup.TryGetValue(id, out var found) ? found : null;
    }
}`,
      },
      {
        lang: "csharp",
        code: `using UnityEngine;

// Como o save fica MUITO pequeno usando a database.
// O save guarda só IDs; a database (asset) tem o resto.
[System.Serializable]
public class InventorySaveData
{
    public string[] itemIds; // ex: ["espada_longa", "pocao_vida", "chave_dourada"]
}

public class Inventario : MonoBehaviour
{
    public ItemDatabase database; // arrastado no Inspector

    private System.Collections.Generic.List<ItemSO> itensAtuais
        = new System.Collections.Generic.List<ItemSO>();

    public InventorySaveData ParaSave()
    {
        var ids = new string[itensAtuais.Count];
        for (int i = 0; i < itensAtuais.Count; i++)
            ids[i] = itensAtuais[i].itemId;
        return new InventorySaveData { itemIds = ids };
    }

    public void DoSave(InventorySaveData dados)
    {
        itensAtuais.Clear();
        foreach (string id in dados.itemIds)
        {
            ItemSO item = database.GetById(id);
            if (item != null) itensAtuais.Add(item);
            else Debug.LogWarning($"Item '{id}' não existe na database.");
        }
    }
}`,
      },
      {
        lang: "csharp",
        code: `using System.IO;
using UnityEngine;

// Padrão "SO de runtime" + persistência em arquivo.
// O SO guarda o estado vivo na sessão; o arquivo guarda entre sessões.
[CreateAssetMenu(menuName = "Game/Player Runtime")]
public class PlayerRuntimeSO : ScriptableObject
{
    public float health = 100f;
    public int gold = 0;
    public Vector3 lastCheckpoint;

    // Reset chamado ao começar nova partida.
    public void Reset()
    {
        health = 100f;
        gold = 0;
        lastCheckpoint = Vector3.zero;
    }
}

public class PlayerRuntimePersistor : MonoBehaviour
{
    public PlayerRuntimeSO data;
    private string Caminho => Path.Combine(Application.persistentDataPath, "player.json");

    public void Salvar()
    {
        // Não serialize o SO inteiro: só os campos relevantes via JsonUtility.
        // ATENÇÃO: ScriptableObject NÃO pode ser passado direto pro JsonUtility
        // em todos os contextos. O seguro é copiar para uma struct/classe DTO.
        string json = JsonUtility.ToJson(new PlayerRuntimeDTO
        {
            health = data.health,
            gold = data.gold,
            lastCheckpoint = data.lastCheckpoint,
        }, true);
        File.WriteAllText(Caminho, json);
    }

    public void Carregar()
    {
        if (!File.Exists(Caminho)) return;
        var dto = JsonUtility.FromJson<PlayerRuntimeDTO>(File.ReadAllText(Caminho));
        data.health = dto.health;
        data.gold = dto.gold;
        data.lastCheckpoint = dto.lastCheckpoint;
    }

    [System.Serializable]
    private class PlayerRuntimeDTO
    {
        public float health;
        public int gold;
        public Vector3 lastCheckpoint;
    }
}`,
      },
    ],
    points: [
      "ScriptableObject é PERFEITO para dados de design e configuração editáveis no Inspector.",
      "Mudanças em SO em RUNTIME persistem no Editor mas SOMEM em build — falso positivo clássico.",
      "Use SO como source of truth (catálogo) e salve apenas IDs no arquivo de save.",
      "O padrão 'Runtime SO' compartilha estado entre scripts sem Singleton, e você sincroniza com arquivo.",
      "Sempre extraia os campos do SO para um DTO simples antes de chamar JsonUtility.ToJson.",
      "SO permite que designers editem balanceamento sem tocar em código — abrace isso.",
      "[CreateAssetMenu] é o que faz aparecer no menu Create do Project Window.",
    ],
    alerts: [
      {
        type: "danger",
        content: "Nunca confie em ScriptableObject para PERSISTIR estado de jogador entre sessões em build. Funciona no Editor e quebra em produção. Use sempre arquivo separado em persistentDataPath.",
      },
      {
        type: "tip",
        content: "Para resetar SO ao sair do Play Mode (no Editor), implemente OnEnable/OnDisable que zera campos voláteis. Isso evita que valores 'vazem' entre testes e te confundam.",
      },
      {
        type: "info",
        content: "Em projetos com muitos SO, considere usar pacotes como Odin Inspector ou ScriptableObject Architecture do Ryan Hipple para padrões mais sofisticados (eventos, variáveis compartilhadas).",
      },
    ],
  },
];
