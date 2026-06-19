"use strict";

const AppModel = window.model;
const AppView = window.view;
const SESSION_TIME = 1000 * 60 * 60;
const CARDS_PER_PAGE = 5;

let boards = [];
let lists = [];
let cards = [];
let currentPage = 1;

AppView.bindLogin(login);
AppView.bindBoardChange(loadBoard);
AppView.bindSearch(searchCards);
AppView.bindPagination(previousPage, nextPage);
AppView.bindNewCard(showNewCardForm);
AppView.bindSaveNewCard(saveNewCard);
AppView.bindLogout(logout);
AppView.bindOverview(showOverview);

autoLogin();

async function login() {
    const loginData = AppView.getLoginData();

    if (!loginData.key || !loginData.token) {
        AppView.showLoginMessage("Bitte API-Key und Token eingeben.");
        return;
    }

    AppView.setLoginLoading(true);
    AppView.showLoginMessage("");

    try {
        const user = await AppModel.checkLogin(loginData.key, loginData.token);
        saveSession(loginData.key, loginData.token);
        AppView.showLoginMessage(`Willkommen ${user.fullName}`, true);
        AppView.showApp();
        AppView.showFeedback("Boards werden geladen...");
    } catch (err) {
        console.error(err);
        AppView.showLoginMessage("API-Key oder Token falsch.");
        AppView.setLoginLoading(false);
        return;
    }

    AppView.setLoginLoading(false);

    try {
        await loadBoards();
    } catch (err) {
        console.error(err);
        AppView.showFeedback("Trello-Daten konnten nicht geladen werden.");
    }
}

async function autoLogin() {
    const key = localStorage.getItem("trelloKey");
    const token = localStorage.getItem("trelloToken");
    const loginUntil = Number(localStorage.getItem("loginUntil"));

    if (!key || !token || Date.now() > loginUntil) {
        clearSession();
        return;
    }

    AppView.showApp();
    AppView.showFeedback("Session wird geladen...");

    try {
        await AppModel.checkLogin(key, token);
        await loadBoards();
    } catch (err) {
        console.error(err);
        clearSession();
        AppView.showLogin();
        AppView.showLoginMessage("Session abgelaufen. Bitte neu anmelden.");
    }
}

function saveSession(key, token) {
    localStorage.setItem("trelloKey", key);
    localStorage.setItem("trelloToken", token);
    localStorage.setItem("loginUntil", Date.now() + SESSION_TIME);
}

function clearSession() {
    localStorage.removeItem("trelloKey");
    localStorage.removeItem("trelloToken");
    localStorage.removeItem("loginUntil");
}

async function loadBoards() {
    boards = await AppModel.getBoards();
    AppView.renderBoards(boards);

    if (boards.length === 0) {
        AppView.renderCards([], [], cardActions());
        AppView.showFeedback("Keine Boards gefunden.");
        return;
    }

    await loadBoard();
}

async function loadBoard() {
    const boardId = AppView.getSelectedBoardId();

    lists = await AppModel.getLists(boardId);
    cards = await AppModel.getCards(boardId);

    AppView.hideNewCardForm();
    AppView.showText("Card auswählen");
    currentPage = 1;
    renderCards();
}

function searchCards() {
    currentPage = 1;
    renderCards();
}

function renderCards() {
    const search = AppView.getSearchText();
    const filteredCards = cards.filter(function (card) {
        return card.name.toLowerCase().startsWith(search);
    });
    const pageCount = Math.max(1, Math.ceil(filteredCards.length / CARDS_PER_PAGE));

    if (currentPage > pageCount) {
        currentPage = pageCount;
    }

    const start = (currentPage - 1) * CARDS_PER_PAGE;
    const shownCards = filteredCards.slice(start, start + CARDS_PER_PAGE);

    AppView.renderCards(shownCards, lists, cardActions());
    AppView.showPageInfo(currentPage, pageCount);
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderCards();
    }
}

function nextPage() {
    currentPage++;
    renderCards();
}

function cardActions() {
    return {
        details(card) {
            AppView.showDetails(card, lists);
        },

        save(card, div) {
            saveEdit(card, div);
        },

        remove(card) {
            removeCard(card);
        }
    };
}

async function saveEdit(card, div) {
    const data = AppView.getEditData(div);

    if (!data.name) {
        AppView.showFeedback("Titel darf nicht leer sein.");
        return;
    }

    try {
        const savedCard = await AppModel.updateCard(card.id, data);

        cards = cards.map(function (oldCard) {
            return oldCard.id === savedCard.id ? savedCard : oldCard;
        });

        renderCards();
        AppView.showFeedback("Edit gespeichert.");
    } catch (err) {
        console.error(err);
        AppView.showFeedback("Edit konnte nicht gespeichert werden.");
    }
}

function showNewCardForm() {
    if (lists.length === 0) {
        AppView.showFeedback("Keine Liste für neue Card gefunden.");
        return;
    }

    AppView.showNewCardForm(lists);
}

async function saveNewCard(event) {
    event.preventDefault();

    const data = AppView.getNewCardData();

    if (!data.name) {
        AppView.showFeedback("Titel darf nicht leer sein.");
        return;
    }

    try {
        const newCard = await AppModel.createCard(data);

        cards.unshift(newCard);
        currentPage = 1;
        AppView.clearNewCardForm();
        renderCards();
        AppView.showDetails(newCard, lists);
        AppView.showFeedback("Neue Card gespeichert.");
    } catch (err) {
        console.error(err);
        AppView.showFeedback("Neue Card konnte nicht gespeichert werden.");
    }
}

async function removeCard(card) {
    if (!AppView.askDelete()) return;

    try {
        await AppModel.deleteCard(card.id);

        cards = cards.filter(function (oldCard) {
            return oldCard.id !== card.id;
        });

        renderCards();
        AppView.showText("Card gelöscht");
        AppView.showFeedback("Card gelöscht.");
    } catch (err) {
        console.error(err);
        AppView.showFeedback("Card konnte nicht gelöscht werden.");
    }
}

function showOverview() {
    AppView.hideNewCardForm();
    AppView.showText("Card auswählen");
    renderCards();
}

function logout() {
    boards = [];
    lists = [];
    cards = [];
    clearSession();
    AppView.showLogin();
    AppView.showLoginMessage("");
}
