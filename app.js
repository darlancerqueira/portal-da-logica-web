(function () {
    const STORAGE_KEY = "portal-logica-web-v1";
    const META = window.GAME_DATA.meta;
    const PHASES = window.GAME_DATA.phases;
    const FOUNDATION_GUIDE = window.GAME_DATA.foundationGuide;
    const app = document.getElementById("app");

    let progress = loadProgress();
    let ui = {
        screen: hasStarted() ? "map" : "welcome",
        phaseIndex: 0,
        challengeIndex: 0,
        challengeResult: null,
        hintChallengeId: null,
        overlay: null,
        drafts: {},
        welcomeDraft: {
            playerName: progress.playerName || "",
            heroName: progress.heroName || "",
        },
        toast: "",
        toastTimer: null,
        pythonStatus: "loading",
        pythonMessage: "Preparando o laboratorio Python no navegador...",
        evaluatingCode: false,
    };

    const runner = new PythonRunner({
        onStatus(status, message) {
            ui.pythonStatus = status;
            ui.pythonMessage = message;
            render();
        },
    });

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("input", handleInput);

    render();

    Promise.resolve()
        .then(() => runner.prefetch())
        .catch(() => {
            // O status visual ja e atualizado dentro do runner.
        });

    // events
    function handleClick(event) {
        const trigger = event.target.closest("[data-action]");
        if (!trigger) {
            return;
        }

        const action = trigger.dataset.action;

        if (action === "open-phase") {
            const phaseIndex = Number(trigger.dataset.phaseIndex);
            if (getPhaseStatus(phaseIndex) === "Bloqueada") {
                showToast("Essa fase ainda esta bloqueada.");
                return;
            }
            ui.screen = "phase";
            ui.phaseIndex = phaseIndex;
            ui.challengeResult = null;
            render();
            return;
        }

        if (action === "open-map") {
            ui.screen = "map";
            ui.challengeResult = null;
            render();
            return;
        }

        if (action === "open-challenge") {
            ui.screen = "challenge";
            ui.phaseIndex = Number(trigger.dataset.phaseIndex);
            ui.challengeIndex = Number(trigger.dataset.challengeIndex);
            ui.challengeResult = null;
            ui.hintChallengeId = null;
            render();
            return;
        }

        if (action === "continue-phase") {
            const phaseIndex = Number(trigger.dataset.phaseIndex);
            const nextChallengeIndex = findNextIncompleteChallengeIndex(PHASES[phaseIndex]);
            ui.screen = "challenge";
            ui.phaseIndex = phaseIndex;
            ui.challengeIndex = nextChallengeIndex === -1 ? 0 : nextChallengeIndex;
            ui.challengeResult = null;
            render();
            return;
        }

        if (action === "show-overlay") {
            const overlayType = trigger.dataset.overlay;
            if (overlayType === "encyclopedia") {
                ui.overlay = {
                    type: "encyclopedia",
                    section: trigger.dataset.section || "guide",
                };
            }
            if (overlayType === "stats") {
                ui.overlay = { type: "stats" };
            }
            if (overlayType === "credits") {
                ui.overlay = { type: "credits" };
            }
            render();
            return;
        }

        if (action === "hide-overlay") {
            ui.overlay = null;
            render();
            return;
        }

        if (action === "select-encyclopedia-section") {
            ui.overlay = {
                type: "encyclopedia",
                section: trigger.dataset.section,
            };
            render();
            return;
        }

        if (action === "use-hint") {
            const challenge = getCurrentChallenge();
            if (!challenge) {
                return;
            }
            ui.hintChallengeId = challenge.id;
            if (!progress.hintedChallenges.includes(challenge.id)) {
                progress.hintedChallenges.push(challenge.id);
                persistProgress();
            }
            render();
            return;
        }

        if (action === "submit-quiz-choice") {
            const choiceIndex = Number(trigger.dataset.choiceIndex);
            const challenge = getCurrentChallenge();
            evaluateQuizAnswer(challenge, choiceIndex);
            return;
        }

        if (action === "advance-from-result") {
            advanceAfterResult();
            return;
        }

        if (action === "restart-progress") {
            const confirmed = window.confirm(
                "Deseja apagar o progresso desta aventura web e recomecar?"
            );
            if (!confirmed) {
                return;
            }
            localStorage.removeItem(STORAGE_KEY);
            progress = createEmptyProgress();
            ui = {
                ...ui,
                screen: "welcome",
                phaseIndex: 0,
                challengeIndex: 0,
                challengeResult: null,
                hintChallengeId: null,
                overlay: null,
                drafts: {},
                welcomeDraft: {
                    playerName: "",
                    heroName: "",
                },
            };
            render();
            return;
        }

        if (action === "copy-link") {
            copyShareLink();
        }
    }

    function handleSubmit(event) {
        const form = event.target;

        if (form.matches("[data-form='welcome']")) {
            event.preventDefault();
            const playerName = (ui.welcomeDraft.playerName || "").trim() || "Mentor";
            const heroName = (ui.welcomeDraft.heroName || "").trim() || "Lia";
            progress = createEmptyProgress();
            progress.playerName = playerName;
            progress.heroName = heroName;
            persistProgress();
            ui.screen = "map";
            ui.phaseIndex = 0;
            ui.challengeIndex = 0;
            ui.challengeResult = null;
            showToast("Nova jornada iniciada.");
            render();
            return;
        }

        if (form.matches("[data-form='output-answer']")) {
            event.preventDefault();
            const challenge = getCurrentChallenge();
            const answer = String(ui.drafts[challenge.id] || "");
            evaluateOutputAnswer(challenge, answer);
            return;
        }

        if (form.matches("[data-form='code-answer']")) {
            event.preventDefault();
            const challenge = getCurrentChallenge();
            const code = String(ui.drafts[challenge.id] || "");
            evaluateCodeAnswer(challenge, code);
        }
    }

    function handleInput(event) {
        const field = event.target;
        if (field.dataset.draft === "playerName") {
            ui.welcomeDraft.playerName = field.value;
            return;
        }
        if (field.dataset.draft === "heroName") {
            ui.welcomeDraft.heroName = field.value;
            return;
        }
        const challengeId = field.dataset.challengeDraft;
        if (challengeId) {
            ui.drafts[challengeId] = field.value;
        }
    }

    // evaluation
    async function evaluateCodeAnswer(challenge, code) {
        if (ui.evaluatingCode) {
            return;
        }

        ui.evaluatingCode = true;
        ui.challengeResult = {
            kind: "info",
            title: "Validando codigo",
            body: ui.pythonStatus === "ready"
                ? "Executando sua resposta no laboratorio Python do navegador..."
                : "Carregando o laboratorio Python e validando sua resposta...",
        };
        render();

        try {
            const result = await runner.run(code, challenge.checks || []);
            if (result.success) {
                registerChallengeSuccess(challenge, isChallengeCompleted(challenge.id));
            } else {
                ui.challengeResult = {
                    kind: "error",
                    title: "Ainda nao foi dessa vez",
                    body: result.message,
                };
            }
        } catch (error) {
            ui.challengeResult = {
                kind: "error",
                title: "Falha ao validar",
                body: error && error.message ? error.message : String(error),
            };
        } finally {
            ui.evaluatingCode = false;
            render();
        }
    }

    function evaluateQuizAnswer(challenge, choiceIndex) {
        const correct = choiceIndex === challenge.answerIndex;
        if (!correct) {
            const correctOption = challenge.choices[challenge.answerIndex];
            ui.challengeResult = {
                kind: "error",
                title: "Resposta incorreta",
                body: `A alternativa correta era: ${correctOption}`,
            };
            render();
            return;
        }
        registerChallengeSuccess(challenge, isChallengeCompleted(challenge.id));
    }

    function evaluateOutputAnswer(challenge, answer) {
        const expected = normalizeText(challenge.expectedOutput);
        const actual = normalizeText(answer);
        if (expected !== actual) {
            ui.challengeResult = {
                kind: "error",
                title: "Saida incorreta",
                body: `A saida correta era: ${challenge.expectedOutput}`,
            };
            render();
            return;
        }
        registerChallengeSuccess(challenge, isChallengeCompleted(challenge.id));
    }

    function registerChallengeSuccess(challenge, wasAlreadyCompleted) {
        const phase = getCurrentPhase();
        const successMessages = [
            interpolate(challenge.successText),
            challenge.explanation,
        ];

        let nextAction = { type: "next" };
        let nextLabel = "Proximo desafio";

        if (!wasAlreadyCompleted) {
            awardChallenge(challenge.id);
        }

        const phaseJustCompleted = maybeCompletePhase(phase);
        const endingJustUnlocked = maybeUnlockEnding();

        if (wasAlreadyCompleted) {
            nextAction = { type: "phase" };
            nextLabel = "Voltar para a fase";
        } else if (endingJustUnlocked) {
            successMessages.push(interpolate(META.ending));
            nextAction = { type: "ending" };
            nextLabel = "Ver final da campanha";
        } else if (phaseJustCompleted) {
            successMessages.push(interpolate(phase.completionText));
            nextAction = { type: "map" };
            nextLabel = "Voltar ao mapa";
        } else if (!hasNextChallengeInPhase()) {
            nextAction = { type: "phase" };
            nextLabel = "Voltar para a fase";
        }

        ui.challengeResult = {
            kind: "success",
            title: wasAlreadyCompleted ? "Desafio resolvido novamente" : "Desafio concluido",
            body: successMessages.join("\n\n"),
            nextAction,
            nextLabel,
        };
        persistProgress();
        render();
    }

    function advanceAfterResult() {
        if (!ui.challengeResult || !ui.challengeResult.nextAction) {
            return;
        }

        const action = ui.challengeResult.nextAction;
        ui.challengeResult = null;

        if (action.type === "ending") {
            ui.screen = "ending";
            render();
            return;
        }

        if (action.type === "map") {
            ui.screen = "map";
            render();
            return;
        }

        if (action.type === "phase") {
            ui.screen = "phase";
            render();
            return;
        }

        if (action.type === "next") {
            ui.challengeIndex += 1;
            render();
        }
    }

    function awardChallenge(challengeId) {
        if (progress.completedChallenges.includes(challengeId)) {
            return;
        }
        const bonus = progress.hintedChallenges.includes(challengeId) ? 10 : 12;
        progress.completedChallenges.push(challengeId);
        progress.score += bonus;
    }

    function maybeCompletePhase(phase) {
        if (progress.completedPhases.includes(phase.id)) {
            return false;
        }
        const allDone = phase.challenges.every((challenge) =>
            progress.completedChallenges.includes(challenge.id)
        );
        if (!allDone) {
            return false;
        }
        progress.completedPhases.push(phase.id);
        progress.score += 15;
        return true;
    }

    function maybeUnlockEnding() {
        if (progress.endingSeen) {
            return false;
        }
        const allCompleted = PHASES.every((phase) => progress.completedPhases.includes(phase.id));
        if (!allCompleted) {
            return false;
        }
        progress.endingSeen = true;
        progress.score += 25;
        return true;
    }

    // rendering
    function render() {
        app.classList.remove("app-loading");
        app.innerHTML = `
            <div class="shell">
                <aside class="sidebar">
                    ${renderSidebar()}
                </aside>
                <main class="main">
                    ${renderMain()}
                </main>
            </div>
            ${renderOverlay()}
            <div class="toast ${ui.toast ? "visible" : ""}">${escapeHtml(ui.toast || "")}</div>
        `;
    }

    function renderSidebar() {
        const started = hasStarted();
        const progressPercent = Math.round(
            (progress.completedChallenges.length / totalChallengeCount()) * 100
        );

        if (!started) {
            return `
                <section class="panel sidebar-card brand-card">
                    <p class="eyebrow">Edicao Web</p>
                    <h1>${escapeHtml(META.title)}</h1>
                    <p>${escapeHtml(META.subtitle)}</p>
                    <div class="tag-row">
                        <span class="tag">6 fases</span>
                        <span class="tag">19 desafios</span>
                        <span class="tag">${renderPythonStatusBadge()}</span>
                    </div>
                </section>
                <section class="panel sidebar-card">
                    <h3>O que voce vai praticar</h3>
                    <ul class="list-clean">
                        <li>Variaveis, print e operacoes</li>
                        <li>Condicoes e tomada de decisao</li>
                        <li>Lacos, funcoes e listas</li>
                        <li>Desafios de codigo Python no navegador</li>
                    </ul>
                </section>
            `;
        }

        return `
            <section class="panel sidebar-card brand-card">
                <p class="eyebrow">Mapa do mentor</p>
                <h1>${escapeHtml(META.title)}</h1>
                <p>${escapeHtml(META.subtitle)}</p>
                <div class="tag-row">
                    <span class="tag">Mentor: ${escapeHtml(progress.playerName)}</span>
                    <span class="tag">Heroi(a): ${escapeHtml(progress.heroName)}</span>
                </div>
            </section>
            <section class="panel sidebar-card">
                <div class="sidebar-grid">
                    <div class="metric-tile">
                        <span class="metric-label">Cristais</span>
                        <strong class="metric-value">${progress.score}</strong>
                    </div>
                    <div class="metric-tile">
                        <span class="metric-label">Fases</span>
                        <strong class="metric-value">${progress.completedPhases.length}/${PHASES.length}</strong>
                    </div>
                    <div class="metric-tile">
                        <span class="metric-label">Desafios</span>
                        <strong class="metric-value">${progress.completedChallenges.length}/${totalChallengeCount()}</strong>
                    </div>
                </div>
                <p class="microcopy">Progresso geral</p>
                <div class="meter"><span style="width:${progressPercent}%"></span></div>
                <div class="tag-row">
                    <span class="tag">${renderPythonStatusBadge()}</span>
                </div>
            </section>
            <section class="panel sidebar-card">
                <div class="button-row">
                    <button class="button button-secondary" data-action="open-map">Mapa</button>
                    <button class="button button-secondary" data-action="show-overlay" data-overlay="encyclopedia" data-section="guide">Enciclopedia</button>
                    <button class="button button-secondary" data-action="show-overlay" data-overlay="stats">Estatisticas</button>
                    <button class="button button-secondary" data-action="show-overlay" data-overlay="credits">Creditos</button>
                    <button class="button button-ghost" data-action="copy-link">Copiar link</button>
                    <button class="button button-danger" data-action="restart-progress">Recomecar</button>
                </div>
            </section>
        `;
    }

    function renderMain() {
        if (ui.screen === "welcome") {
            return renderWelcomeScreen();
        }
        if (ui.screen === "phase") {
            return renderPhaseScreen();
        }
        if (ui.screen === "challenge") {
            return renderChallengeScreen();
        }
        if (ui.screen === "ending") {
            return renderEndingScreen();
        }
        return renderMapScreen();
    }

    function renderWelcomeScreen() {
        return `
            <section class="panel main-card hero-banner">
                <div>
                    <p class="eyebrow">Comece por aqui</p>
                    <h2>Uma jornada guiada para aprender Python no navegador</h2>
                    <p>${escapeHtml(META.intro)}</p>
                    <div class="tag-row">
                        <span class="tag">Sem instalar bibliotecas</span>
                        <span class="tag">Desafios validos de Python</span>
                        <span class="tag">Pronto para publicar</span>
                    </div>
                </div>
                <div class="hero-stage" aria-hidden="true">
                    <span class="rune">print("portal")</span>
                    <span class="rune">if energia &gt;= 10:</span>
                    <span class="rune">for passo in jornada:</span>
                </div>
            </section>
            <section class="panel main-card">
                <div class="screen-header">
                    <p class="eyebrow">Novo jogo</p>
                    <h2>Escolha os nomes da sua aventura</h2>
                    <p>Esses nomes aparecem na narrativa e no seu progresso local.</p>
                </div>
                <form class="welcome-form" data-form="welcome">
                    <div class="form-grid">
                        <label>
                            <span class="field-label">Seu nome de mentor(a)</span>
                            <input
                                class="text-input"
                                type="text"
                                data-draft="playerName"
                                value="${escapeAttribute(ui.welcomeDraft.playerName)}"
                                placeholder="Ex.: Darlan"
                            >
                        </label>
                        <label>
                            <span class="field-label">Nome do personagem principal</span>
                            <input
                                class="text-input"
                                type="text"
                                data-draft="heroName"
                                value="${escapeAttribute(ui.welcomeDraft.heroName)}"
                                placeholder="Ex.: Lia"
                            >
                        </label>
                    </div>
                    <div class="welcome-actions">
                        <button class="button button-primary" type="submit">Iniciar jornada</button>
                        <button
                            class="button button-secondary"
                            type="button"
                            data-action="show-overlay"
                            data-overlay="encyclopedia"
                            data-section="guide"
                        >
                            Ver guia inicial
                        </button>
                    </div>
                </form>
            </section>
            ${renderRuntimeNotice()}
        `;
    }

    function renderMapScreen() {
        return `
            <section class="panel main-card hero-banner">
                <div>
                    <p class="eyebrow">Mapa da campanha</p>
                    <h2>${escapeHtml(progress.heroName)} precisa da sua logica para atravessar Pylandia</h2>
                    <p>${escapeHtml(interpolate(META.intro))}</p>
                    <div class="tag-row">
                        <span class="tag">Dicas opcionais</span>
                        <span class="tag">Salvar automatico no navegador</span>
                        <span class="tag">Compartilhavel por link</span>
                    </div>
                </div>
                <div class="hero-stage" aria-hidden="true">
                    <span class="rune">nome = "${escapeHtml(progress.heroName)}"</span>
                    <span class="rune">return total</span>
                    <span class="rune">portal_aberto = True</span>
                </div>
            </section>
            <section class="panel main-card">
                <div class="screen-header">
                    <p class="eyebrow">Fases</p>
                    <h2>Escolha o proximo destino</h2>
                    <p>As fases concluidas continuam abertas para revisao. As novas fases liberam em ordem.</p>
                </div>
                <div class="phase-grid">
                    ${PHASES.map((phase, index) => renderPhaseCard(phase, index)).join("")}
                </div>
            </section>
            ${renderRuntimeNotice()}
        `;
    }

    function renderPhaseCard(phase, index) {
        const status = getPhaseStatus(index);
        const completed = progress.completedPhases.includes(phase.id);
        const doneCount = phase.challenges.filter((challenge) => isChallengeCompleted(challenge.id)).length;
        const buttonLabel = completed ? "Revisar fase" : "Abrir fase";
        return `
            <article class="phase-card">
                <span class="phase-status status-${status.toLowerCase()}">${escapeHtml(status)}</span>
                <div>
                    <h3>${escapeHtml(phase.title)}</h3>
                    <p class="muted">${escapeHtml(interpolate(phase.goal))}</p>
                </div>
                <div class="meta-list">
                    <div class="meta-item"><strong>${doneCount}/${phase.challenges.length}</strong> desafios resolvidos</div>
                    <div class="meta-item">${escapeHtml(interpolate(phase.story))}</div>
                </div>
                <button
                    class="button ${status === "Bloqueada" ? "button-secondary" : "button-primary"}"
                    data-action="open-phase"
                    data-phase-index="${index}"
                    ${status === "Bloqueada" ? "disabled" : ""}
                >
                    ${escapeHtml(buttonLabel)}
                </button>
            </article>
        `;
    }

    function renderPhaseScreen() {
        const phase = getCurrentPhase();
        const nextChallengeIndex = findNextIncompleteChallengeIndex(phase);
        return `
            <section class="panel main-card phase-hero">
                <p class="eyebrow">Preparacao da fase</p>
                <h2>${escapeHtml(phase.title)}</h2>
                <p>${escapeHtml(interpolate(phase.story))}</p>
                <div class="tag-row">
                    <span class="tag">Objetivo: ${escapeHtml(interpolate(phase.goal))}</span>
                    <span class="tag">${phase.challenges.length} desafios</span>
                </div>
                <div class="phase-actions">
                    <button class="button button-secondary" data-action="open-map">Voltar ao mapa</button>
                    <button
                        class="button button-primary"
                        data-action="continue-phase"
                        data-phase-index="${ui.phaseIndex}"
                    >
                        ${nextChallengeIndex === -1 ? "Revisar desafios" : "Continuar fase"}
                    </button>
                </div>
            </section>
            <section class="panel main-card">
                <div class="screen-header">
                    <p class="eyebrow">Teoria da fase</p>
                    <h2>Conceitos para dominar antes de entrar no desafio</h2>
                </div>
                <div class="reference-grid">
                    ${phase.reference.map(renderReferenceCard).join("")}
                </div>
            </section>
            <section class="panel main-card">
                <div class="screen-header">
                    <p class="eyebrow">Missoes</p>
                    <h2>Desafios desta fase</h2>
                </div>
                <div class="challenge-grid">
                    ${phase.challenges.map((challenge, challengeIndex) => renderChallengeCard(challenge, challengeIndex)).join("")}
                </div>
            </section>
            ${renderRuntimeNotice()}
        `;
    }

    function renderChallengeCard(challenge, challengeIndex) {
        const completed = isChallengeCompleted(challenge.id);
        const typeLabel = getChallengeTypeLabel(challenge.type);
        return `
            <article class="challenge-card">
                <div class="tag-row">
                    <span class="phase-status ${completed ? "status-concluida" : "status-disponivel"}">${completed ? "Concluido" : "Disponivel"}</span>
                    <span class="inline-badge">${escapeHtml(typeLabel)}</span>
                </div>
                <h3>${escapeHtml(challenge.title)}</h3>
                <p class="muted">${escapeHtml(interpolate(challenge.prompt))}</p>
                <button
                    class="button ${completed ? "button-secondary" : "button-primary"}"
                    data-action="open-challenge"
                    data-phase-index="${ui.phaseIndex}"
                    data-challenge-index="${challengeIndex}"
                >
                    ${completed ? "Refazer desafio" : "Abrir desafio"}
                </button>
            </article>
        `;
    }

    function renderChallengeScreen() {
        const phase = getCurrentPhase();
        const challenge = getCurrentChallenge();
        const draft = ui.drafts[challenge.id] || "";
        return `
            <section class="panel main-card challenge-head">
                <p class="eyebrow">${escapeHtml(phase.title)}</p>
                <h2>${escapeHtml(challenge.title)}</h2>
                <p>${escapeHtml(interpolate(challenge.prompt))}</p>
                <div class="challenge-actions">
                    <button class="button button-secondary" data-action="open-phase" data-phase-index="${ui.phaseIndex}">Voltar para a fase</button>
                    <button class="button button-ghost" data-action="use-hint">Ver dica</button>
                </div>
            </section>
            <section class="challenge-shell">
                <div class="panel main-card">
                    ${challenge.code ? `<p class="eyebrow">Codigo para analisar</p><pre class="code-block">${escapeHtml(challenge.code)}</pre>` : ""}
                    ${challenge.starterCode ? `<p class="eyebrow">Modelo sugerido</p><pre class="starter-block">${escapeHtml(challenge.starterCode)}</pre>` : ""}
                    ${renderChallengeAnswerArea(challenge, draft)}
                    ${ui.hintChallengeId === challenge.id ? renderFeedback("info", "Dica", challenge.hint) : ""}
                    ${ui.challengeResult ? renderFeedback(ui.challengeResult.kind, ui.challengeResult.title, ui.challengeResult.body, ui.challengeResult.nextLabel) : ""}
                </div>
                <div class="panel main-card">
                    <div class="meta-list">
                        <div class="meta-item"><strong>Tipo:</strong> ${escapeHtml(getChallengeTypeLabel(challenge.type))}</div>
                        <div class="meta-item"><strong>Progresso na fase:</strong> ${ui.challengeIndex + 1}/${phase.challenges.length}</div>
                        <div class="meta-item"><strong>Status do laboratorio:</strong> ${escapeHtml(ui.pythonMessage)}</div>
                    </div>
                    <div class="reference-grid">
                        ${phase.reference.map(renderReferenceCard).join("")}
                    </div>
                </div>
            </section>
            ${renderRuntimeNotice()}
        `;
    }

    function renderChallengeAnswerArea(challenge, draft) {
        if (challenge.type === "quiz") {
            return `
                <div class="screen-header">
                    <p class="eyebrow">Resposta</p>
                    <h2>Escolha a alternativa correta</h2>
                </div>
                <div class="quiz-options">
                    ${challenge.choices.map((choice, index) => `
                        <button class="quiz-option" data-action="submit-quiz-choice" data-choice-index="${index}">
                            ${escapeHtml(`${index + 1}. ${choice}`)}
                        </button>
                    `).join("")}
                </div>
            `;
        }

        if (challenge.type === "output") {
            return `
                <form data-form="output-answer">
                    <label>
                        <span class="field-label">Digite a saida exata</span>
                        <input
                            class="text-input mono"
                            type="text"
                            data-challenge-draft="${challenge.id}"
                            value="${escapeAttribute(draft)}"
                            placeholder="Ex.: Bem-vinda, Luna"
                        >
                    </label>
                    <div class="button-row">
                        <button class="button button-primary" type="submit">Validar resposta</button>
                    </div>
                </form>
            `;
        }

        return `
            <form data-form="code-answer">
                <label>
                    <span class="field-label">Escreva sua resposta em Python</span>
                    <textarea class="text-area" data-challenge-draft="${challenge.id}" placeholder="Digite seu codigo aqui...">${escapeHtml(draft)}</textarea>
                </label>
                <p class="microcopy">O codigo roda localmente no navegador do jogador usando Pyodide. Imports, while e comandos perigosos ficam bloqueados para manter o foco no aprendizado.</p>
                <div class="button-row">
                    <button class="button button-primary" type="submit" ${ui.pythonStatus === "error" ? "disabled" : ""}>
                        ${ui.evaluatingCode ? "Validando..." : "Executar e validar"}
                    </button>
                </div>
            </form>
        `;
    }

    function renderReferenceCard(card) {
        return `
            <article class="reference-card">
                <h3>${escapeHtml(card.title)}</h3>
                <p class="muted">${escapeHtml(card.content)}</p>
                ${card.example ? `<pre class="starter-block">${escapeHtml(card.example)}</pre>` : ""}
            </article>
        `;
    }

    function renderRuntimeNotice() {
        if (window.location.protocol === "file:") {
            return `
                <section class="panel main-card">
                    <div class="feedback feedback-info">
                        <h4>Abra pelo servidor local</h4>
                        <p>Voce provavelmente abriu o arquivo direto no navegador. Para a versao web funcionar corretamente, use <code>py serve_web.py</code> ou <code>py -m http.server 8000</code> e depois acesse <code>http://localhost:8000</code>.</p>
                    </div>
                </section>
            `;
        }

        if (ui.pythonStatus === "error") {
            return `
                <section class="panel main-card">
                    <div class="feedback feedback-info">
                        <h4>Laboratorio Python indisponivel</h4>
                        <p>${escapeHtml(ui.pythonMessage)}</p>
                    </div>
                </section>
            `;
        }

        return "";
    }

    function renderEndingScreen() {
        return `
            <section class="panel main-card ending-card">
                <p class="eyebrow">Campanha concluida</p>
                <h2>O Portal da Logica foi reativado</h2>
                <p>${escapeHtml(interpolate(META.ending))}</p>
                <div class="tag-row">
                    <span class="tag">Pontuacao final: ${progress.score}</span>
                    <span class="tag">Todas as fases abertas para revisao</span>
                </div>
                <div class="result-actions">
                    <button class="button button-primary" data-action="open-map">Voltar ao mapa</button>
                    <button class="button button-ghost" data-action="copy-link">Copiar link para compartilhar</button>
                </div>
            </section>
        `;
    }

    function renderOverlay() {
        if (!ui.overlay) {
            return "";
        }

        if (ui.overlay.type === "stats") {
            return `
                <div class="modal-overlay">
                    <section class="panel modal-card">
                        <div class="modal-head">
                            <p class="eyebrow">Estatisticas</p>
                            <h2>Seu progresso nesta campanha</h2>
                            <div class="modal-actions">
                                <button class="button button-secondary" data-action="hide-overlay">Fechar</button>
                            </div>
                        </div>
                        <div class="stats-grid">
                            <article class="stats-card"><h3>Cristais de conhecimento</h3><p class="muted">${progress.score}</p></article>
                            <article class="stats-card"><h3>Desafios concluidos</h3><p class="muted">${progress.completedChallenges.length}/${totalChallengeCount()}</p></article>
                            <article class="stats-card"><h3>Fases concluidas</h3><p class="muted">${progress.completedPhases.length}/${PHASES.length}</p></article>
                            <article class="stats-card"><h3>Dicas usadas</h3><p class="muted">${progress.hintedChallenges.length}</p></article>
                        </div>
                    </section>
                </div>
            `;
        }

        if (ui.overlay.type === "credits") {
            return `
                <div class="modal-overlay">
                    <section class="panel modal-card">
                        <div class="modal-head">
                            <p class="eyebrow">Creditos</p>
                            <h2>Sobre este projeto</h2>
                            <div class="modal-actions">
                                <button class="button button-secondary" data-action="hide-overlay">Fechar</button>
                            </div>
                        </div>
                        <p class="support-copy">${escapeHtml(META.credits)}</p>
                    </section>
                </div>
            `;
        }

        const section = ui.overlay.section || "guide";
        const encyclopediaTitle = section === "guide"
            ? "Guia inicial"
            : PHASES[Number(section.replace("phase-", ""))].title;
        const cards = section === "guide"
            ? FOUNDATION_GUIDE
            : PHASES[Number(section.replace("phase-", ""))].reference;

        return `
            <div class="modal-overlay">
                <section class="panel modal-card">
                    <div class="modal-head">
                        <p class="eyebrow">Enciclopedia</p>
                        <h2>${escapeHtml(encyclopediaTitle)}</h2>
                        <div class="modal-actions">
                            <button class="button button-secondary" data-action="hide-overlay">Fechar</button>
                        </div>
                    </div>
                    <div class="split-grid">
                        <div class="section-list">
                            <button class="section-link" data-action="select-encyclopedia-section" data-section="guide">
                                <span>Guia inicial</span>
                                <span>${section === "guide" ? "Aberto" : "Abrir"}</span>
                            </button>
                            ${PHASES.map((phase, index) => `
                                <button class="section-link" data-action="select-encyclopedia-section" data-section="phase-${index}">
                                    <span>${escapeHtml(phase.title)}</span>
                                    <span>${section === `phase-${index}` ? "Aberto" : "Abrir"}</span>
                                </button>
                            `).join("")}
                        </div>
                        <div class="reference-grid">
                            ${cards.map(renderReferenceCard).join("")}
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    function renderFeedback(kind, title, body, actionLabel) {
        const className = kind === "success"
            ? "feedback-success"
            : kind === "error"
                ? "feedback-error"
                : "feedback-info";
        return `
            <section class="feedback ${className}">
                <h4>${escapeHtml(title)}</h4>
                ${renderParagraphs(body)}
                ${actionLabel ? `
                    <div class="result-actions">
                        <button class="button button-primary" data-action="advance-from-result">${escapeHtml(actionLabel)}</button>
                    </div>
                ` : ""}
            </section>
        `;
    }

    function renderParagraphs(text) {
        return String(text)
            .split(/\n{2,}/)
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join("");
    }

    function renderPythonStatusBadge() {
        if (ui.pythonStatus === "ready") {
            return "Laboratorio Python pronto";
        }
        if (ui.pythonStatus === "error") {
            return "Laboratorio com erro";
        }
        return "Laboratorio carregando";
    }

    // helpers
    function createEmptyProgress() {
        return {
            playerName: "",
            heroName: "",
            score: 0,
            completedChallenges: [],
            completedPhases: [],
            hintedChallenges: [],
            endingSeen: false,
        };
    }

    function loadProgress() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return createEmptyProgress();
            }
            return { ...createEmptyProgress(), ...JSON.parse(raw) };
        } catch (error) {
            return createEmptyProgress();
        }
    }

    function persistProgress() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }

    function hasStarted() {
        return Boolean(progress.playerName && progress.heroName);
    }

    function getPhaseStatus(phaseIndex) {
        const phase = PHASES[phaseIndex];
        if (progress.completedPhases.includes(phase.id)) {
            return "Concluida";
        }
        if (phaseIndex === 0) {
            return "Disponivel";
        }
        const previousPhase = PHASES[phaseIndex - 1];
        if (progress.completedPhases.includes(previousPhase.id)) {
            return "Disponivel";
        }
        return "Bloqueada";
    }

    function getCurrentPhase() {
        return PHASES[ui.phaseIndex];
    }

    function getCurrentChallenge() {
        return getCurrentPhase().challenges[ui.challengeIndex];
    }

    function isChallengeCompleted(challengeId) {
        return progress.completedChallenges.includes(challengeId);
    }

    function findNextIncompleteChallengeIndex(phase) {
        return phase.challenges.findIndex((challenge) => !isChallengeCompleted(challenge.id));
    }

    function hasNextChallengeInPhase() {
        const phase = getCurrentPhase();
        return ui.challengeIndex < phase.challenges.length - 1;
    }

    function totalChallengeCount() {
        return PHASES.reduce((total, phase) => total + phase.challenges.length, 0);
    }

    function interpolate(text) {
        return String(text || "")
            .replaceAll("{hero}", progress.heroName || "Lia")
            .replaceAll("{mentor}", progress.playerName || "Mentor");
    }

    function normalizeText(text) {
        return String(text || "").trim().replace(/\s+/g, " ");
    }

    function getChallengeTypeLabel(type) {
        if (type === "quiz") {
            return "Quiz";
        }
        if (type === "output") {
            return "Leitura de saida";
        }
        return "Codigo Python";
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replaceAll("\n", "&#10;");
    }

    function showToast(message) {
        ui.toast = message;
        render();
        window.clearTimeout(ui.toastTimer);
        ui.toastTimer = window.setTimeout(() => {
            ui.toast = "";
            render();
        }, 2200);
    }

    async function copyShareLink() {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(window.location.href);
            } else {
                throw new Error("Clipboard indisponivel");
            }
            showToast("Link copiado para compartilhar.");
        } catch (error) {
            showToast("Nao foi possivel copiar automaticamente. Copie o endereco do navegador.");
        }
    }

    // python runner
    function PythonRunner(options) {
        this.options = options;
        this.worker = null;
        this.requestId = 0;
        this.pending = new Map();
        this.isReady = false;
    }

    PythonRunner.prototype.setStatus = function setStatus(status, message) {
        if (this.options && typeof this.options.onStatus === "function") {
            this.options.onStatus(status, message);
        }
    };

    PythonRunner.prototype.ensureWorker = function ensureWorker() {
        if (this.worker) {
            return;
        }
        this.worker = new Worker("./py-worker.js");
        this.worker.onmessage = (event) => {
            const { id, success, result, error } = event.data;
            const pending = this.pending.get(id);
            if (!pending) {
                return;
            }
            this.pending.delete(id);
            window.clearTimeout(pending.timer);
            if (!success) {
                pending.reject(new Error(error || "Falha desconhecida"));
                return;
            }
            pending.resolve(result);
        };
        this.worker.onerror = () => {
            this.resetWorker(
                "O laboratorio Python encontrou um erro inesperado e precisou ser reiniciado."
            );
        };
    };

    PythonRunner.prototype.prefetch = function prefetch() {
        this.setStatus("loading", "Preparando o laboratorio Python no navegador...");
        return Promise.resolve()
            .then(() => this.send("warmup", {}, 35000))
            .then(() => {
                this.isReady = true;
                this.setStatus("ready", "Laboratorio Python pronto para validar desafios.");
            })
            .catch(() => {
                const protocolHint = window.location.protocol === "file:"
                    ? " Abra o jogo por http://localhost:8000 em vez de abrir o arquivo diretamente."
                    : "";
                this.setStatus(
                    "error",
                    "Nao foi possivel carregar o laboratorio Python. Verifique a internet e recarregue a pagina." + protocolHint
                );
            });
    };

    PythonRunner.prototype.run = function run(code, checks) {
        return Promise.resolve()
            .then(() => this.send("run", { code, checks }, this.isReady ? 8000 : 35000))
            .then((result) => {
                this.isReady = true;
                this.setStatus("ready", "Laboratorio Python pronto para validar desafios.");
                return result;
            })
            .catch((error) => {
                if (/limite|timeout/i.test(String(error.message || ""))) {
                    this.resetWorker(
                        "O laboratorio Python foi reiniciado porque a resposta demorou demais."
                    );
                }
                throw error;
            });
    };

    PythonRunner.prototype.send = function send(type, payload, timeoutMs) {
        this.ensureWorker();
        return new Promise((resolve, reject) => {
            const id = ++this.requestId;
            const timer = window.setTimeout(() => {
                this.pending.delete(id);
                reject(new Error("Tempo limite atingido ao validar o desafio."));
                this.resetWorker("Tempo limite atingido ao executar o desafio.");
            }, timeoutMs);

            this.pending.set(id, { resolve, reject, timer });
            this.worker.postMessage({ id, type, payload });
        });
    };

    PythonRunner.prototype.resetWorker = function resetWorker(message) {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.pending.forEach((pending) => {
            window.clearTimeout(pending.timer);
            pending.reject(new Error(message));
        });
        this.pending.clear();
        this.isReady = false;
        this.setStatus("error", message);
    };
})();
