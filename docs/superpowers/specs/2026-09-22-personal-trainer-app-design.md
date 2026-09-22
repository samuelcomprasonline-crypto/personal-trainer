# Personal Trainer App — Design (MVP)

Data: 2026-09-22
Status: aprovado em brainstorm, aguardando revisão da spec

## 1. Visão

Plataforma B2B2C de consultoria esportiva que funciona como extensão de luxo da marca do personal trainer. Um único app (iOS + Android) para treinador e aluno; o treinador vê abas e ações a mais.

**Público inicial:** treinador híbrido (presencial + online), 15–200 alunos, ticket médio-alto.

**Slogan:** "A tecnologia por trás do seu estúdio."

**USP:** "Seu método, sua marca, em escala. O app que devolve 10 horas por semana ao treinador e faz o aluno sentir que tem um personal no bolso."

1. A marca do treinador vem na frente (logo, cor, nome); a nossa não aparece para o aluno.
2. Periodização em minutos: monta uma vez, aplica a muitos, o app sugere a progressão.
3. O aluno não desiste: substituição inteligente e calendário sem culpa reduzem o cancelamento.

## 2. Restrições

- **Custo zero no desenvolvimento.** Usar só camadas gratuitas (Expo, EAS Build free, Supabase free).
- Custos inevitáveis só na publicação: Apple Developer US$ 99/ano, Google Play US$ 25 uma vez. Fora do MVP.
- **Sem integração com WhatsApp.** Toda comunicação acontece dentro do app.
- Prévia sem publicar: Expo Go no celular (QR code), simuladores e web.

## 3. Escopo do MVP

### Dentro
- Login com perfil treinador ou aluno; o treinador convida o aluno.
- Biblioteca de exercícios com marcações (padrão de movimento, músculo principal, equipamento).
- Modelos de periodização aplicados a vários alunos, com progressão planejada por semana.
- Progressão automática de carga (dupla progressão) com fila semanal de aprovação.
- Radar do treinador (vídeos pendentes em Kanban, aderência caindo, cargas estagnadas, RPE alto).
- Check-in rápido ao final do treino (RPE + humor).
- Treino do dia para o aluno, com registro de séries offline.
- Botão "Aparelho ocupado" (substituição).
- Semana fluida (fila de sessões).
- Vídeo de execução + devolutiva do treinador (áudio + desenho sobre o quadro).
- Tema com a cor e o logo do treinador.

### Fora
Pagamentos (fase final, ver seção 10), WhatsApp, IA, painel web, app próprio na loja por treinador, relatórios avançados.

## 4. Features

### Treinador
1. **Modelos de periodização.** Macrociclo → mesociclos → semanas → sessões → itens (exercício, séries, faixa de repetições, descanso). O treinador monta **uma semana** e define `weeks` (ex.: 4) e, por item, um incremento semanal planejado (ex.: +2 kg). O app gera as semanas seguintes: carga planejada da semana n = carga base do aluno + (n − 1) × incremento. "Aplicar a alunos" cria uma cópia por aluno (`assignment`). Editar o modelo propaga para as cópias, exceto nos itens que o treinador ajustou naquele aluno (item marcado `overridden = true`).
2. **Progressão de carga.** Regra do MVP: dupla progressão. Se todas as séries da última sessão atingiram o topo da faixa, sugerir carga + incremento do exercício (padrão 2,5 kg; configurável por exercício); senão manter a carga. As sugestões entram numa fila; o treinador aprova em lote ou edita. Sem aprovação, a sessão usa a carga planejada da semana. Uma sugestão aprovada substitui a carga planejada daquele item a partir da sessão seguinte.
3. **Radar.** Lista única ordenada por prioridade:
   1. vídeos sem devolutiva;
   2. alunos com consistência de 4 semanas abaixo de 50%;
   3. exercícios sem aumento de carga em 3 sessões seguidas;
   4. alunos com RPE ≥ 9 em 3 sessões seguidas.
   Os vídeos também têm uma visão Kanban (A fazer · Avaliado). Cada item abre direto a ação (responder, mandar mensagem, ajustar treino).

### Aluno
1. **Aparelho ocupado.** Mostra até 3 alternativas. Ordem de critérios: (a) alternativas que o treinador aprovou para aquele exercício; (b) mesmo padrão de movimento + mesmo músculo principal; (c) mesmo músculo principal. Em todos os casos, filtrar pelo equipamento que o aluno tem disponível. Cada alternativa mostra a última carga que o aluno usou nela; sem histórico, o campo fica em branco (não há conversão automática de carga entre exercícios). A troca é registrada na sessão e fica visível para o treinador.
2. **Semana fluida.** As sessões da cópia formam uma fila ordenada. "Treino de hoje" = próxima sessão não concluída, desde que respeite o descanso mínimo (padrão 24 h desde a última sessão concluída; se não respeitar, sugerir descanso, sem bloquear). Faltar não gera atraso nem cor vermelha. Indicador exibido: consistência das últimas 4 semanas = sessões concluídas ÷ sessões planejadas por semana × 4 (máx. 100%).
3. **Execução com devolutiva.** Botão de gravar dentro do exercício; o vídeo fica ligado à série (exercício + carga + repetições). A devolutiva do treinador aparece no mesmo lugar e gera notificação.
4. **Check-in rápido.** Ao concluir o treino, duas ações: RPE da sessão (controle deslizante 1–10) e humor (um toque entre 3 opções). Opcional; pular não bloqueia nada.

## 5. UX/UI

- **Abas do aluno:** Hoje · Progresso · Treinador.
- **Abas do treinador:** Radar · Alunos · Biblioteca (+ acesso ao próprio "Hoje" se ele também treina — fora do MVP).
- **Cores:** fundo `#F7F5F2`, texto `#141414`, cinzas neutros; uma única cor de destaque, vinda do treinador (padrão `#8C6A4F` se ele não definir).
- **Tipografia:** Fraunces nos títulos, Inter no texto.
- **Linguagem visual:** muito espaço em branco, mídia em tela cheia, cards grandes, sem medalhas coloridas.
- **Modo escuro** disponível em todo o app, com o acento do treinador.
- **Durante o treino:** modo escuro "estúdio", vibração leve ao concluir série, animações curtas.
- **Marca:** logo do treinador na tela de abertura e no cabeçalho do aluno.

## 6. Arquitetura técnica

- **App:** Expo (React Native, TypeScript), expo-router, um único projeto. As abas são escolhidas pelo `role` do perfil.
- **Backend:** Supabase — Auth, Postgres com Row Level Security, Storage (vídeos/áudios), Realtime (devolutivas).
- **Lógica pura (em `src/domain/`, sem dependência de UI ou rede):**
  - `progression.ts` — sugere a próxima carga.
  - `schedule.ts` — escolhe o treino de hoje e calcula a consistência.
  - `substitution.ts` — ordena as alternativas.
  - `radar.ts` — monta e ordena os itens do Radar.
- **Offline:** os registros de séries vão para uma fila local (AsyncStorage) e são enviados quando a conexão volta. Cada registro tem um `id` gerado no celular, então reenviar não duplica.

### Modelo de dados (tabelas principais)

| Tabela | Campos-chave |
|---|---|
| `profiles` | id, role (`trainer`/`student`), name, trainer_id (aluno), brand_color, logo_url |
| `exercises` | id, trainer_id, name, movement_pattern, primary_muscle, equipment, load_increment, video_url |
| `exercise_alternatives` | exercise_id, alternative_id |
| `templates` | id, trainer_id, name, weeks |
| `template_sessions` | id, template_id, position, name |
| `template_items` | id, session_id, exercise_id, position, sets, rep_min, rep_max, rest_s, weekly_increment_kg |
| `assignments` | id, template_id, student_id, started_at |
| `assignment_items` | id, assignment_id, template_item_id, base_load_kg, overrides (json), overridden (bool) |
| `session_logs` | id, assignment_id, template_session_id, week_n, completed_at, rpe, mood |
| `set_logs` | id, session_log_id, exercise_id, set_n, reps, load_kg, substituted_from |
| `load_suggestions` | id, assignment_item_id, suggested_kg, status (`pending`/`approved`/`edited`) |
| `videos` | id, set_log_id, student_id, storage_path, created_at |
| `feedback` | id, video_id, trainer_id, audio_path, drawing (json), text |

Row Level Security: o aluno lê e escreve só os próprios dados; o treinador lê e escreve os dados dos seus alunos.

### Vídeo
- Máximo de 60 s, comprimido no celular antes do envio.
- Apagado após 90 dias (pg_cron + função de limpeza).
- Limite do plano grátis: 1 GB (~100–150 vídeos ao mesmo tempo). Suficiente para testes; operar com clientes exige plano pago.

## 7. Erros e casos-limite

- Sem internet durante o treino: o app funciona e sincroniza depois; aviso discreto de "pendente de envio".
- Falha no envio do vídeo: fica na fila local e tenta de novo; o aluno pode cancelar.
- Nenhuma alternativa encontrada: mostrar "Sem substituto disponível — pule ou aguarde" e registrar para o Radar.
- Aluno sem cópia de treino ativa: a aba Hoje mostra "Seu treinador está preparando seu plano".
- Conflito entre o modelo e o ajuste individual: o ajuste individual sempre vence.

## 8. Testes

- Testes unitários (Jest) para todo o código em `src/domain/`: progressão (planejada + dupla), fila/consistência, substituição, Radar.
- Políticas RLS verificadas com um script SQL de testes (aluno A não lê dados do aluno B).
- Verificação manual no Expo Go em iPhone e Android a cada entrega.

## 9. Monetização (hipótese)

Assinatura fixa por treinador, alunos ilimitados; o aluno não paga pela plataforma.

| Plano | Preço | Inclui |
|---|---|---|
| Solo | R$ 149/mês | Núcleo completo + marca do treinador |
| Pro | R$ 299/mês | Progressão avançada, relatórios, modelos ilimitados |
| Estúdio | R$ 299 + R$ 99/treinador extra | Metodologia compartilhada |

Anual com 2 meses grátis. Único limite: armazenamento de vídeo (retenção de 90 dias).

Receita complementar: **pagamentos integrados opcionais** (seção 10), com margem pequena (~1%) sobre o custo do gateway, retida via split. Futuro: app próprio na loja com taxa de implantação. Validar preços com 5–10 treinadores.

## 10. Fase final — Pagamentos (Asaas)

Implementada **depois** do app de treino rodando. Desenvolvida e testada no sandbox gratuito do Asaas.

- **Subconta por treinador**, criada via API; o treinador recebe direto.
- **Assinatura recorrente** do aluno (Pix, boleto, cartão) com **split**: a parte da plataforma cai automaticamente na nossa conta.
- **Segurança:** a chave de API fica só em Supabase Edge Functions; o app nunca a vê.
- **Webhooks** (confirmado, atrasado, estornado) → Edge Function → atualiza `payment_status` do aluno.
- O treinador vê o status (em dia / pendente / atrasado) no perfil do aluno e no Radar. O aluno recebe só um lembrete neutro, sem vermelho.
- Verificar antes de lançar: exigências cadastrais do Asaas para subcontas/split (provável CNPJ), taxas atuais e as regras da Apple para pagamento externo em serviços pessoa a pessoa (diretriz 3.1.3(d)).
