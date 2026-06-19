"use strict";

const View = {};

View.btnLogin = document.querySelector("#btn-login");
View.loginView = document.querySelector("#login-view");
View.appView = document.querySelector("#app-view");
View.loginMessage = document.querySelector("#login-message");
View.boardSelect = document.querySelector("#board-select");
View.cardList = document.querySelector("#card-list");
View.searchInput = document.querySelector("#search-input");
View.btnSearch = document.querySelector("#btn-search");
View.detailBox = document.querySelector(".detail-box");
View.pageInfo = document.querySelector("#page-info");
View.btnPrev = document.querySelector("#btn-prev");
View.btnNext = document.querySelector("#btn-next");
View.btnNewCard = document.querySelector("#btn-new-card");
View.btnOverview = document.querySelector("#btn-overview");
View.cardForm = document.querySelector("#card-form");
View.cardTitle = document.querySelector("#card-title");
View.cardDesc = document.querySelector("#card-desc");
View.cardListSelect = document.querySelector("#card-list-select");
View.cardDue = document.querySelector("#card-due");
View.btnLogout = document.querySelector("#btn-logout");
View.searchInput = document.querySelector("#search-input");
View.btnSearch = document.querySelector("#btn-search");

View.bindLogin = function (handler) {
    View.btnLogin.addEventListener("click", handler);
};

View.bindBoardChange = function (handler) {
    View.boardSelect.addEventListener("change", handler);
};

View.bindSearch = function (handler) {
    View.searchInput.addEventListener("input", handler);
    View.btnSearch.addEventListener("click", handler);
};

View.bindPagination = function (prevHandler, nextHandler) {
    View.btnPrev.addEventListener("click", prevHandler);
    View.btnNext.addEventListener("click", nextHandler);
};

View.bindNewCard = function (handler) {
    View.btnNewCard.addEventListener("click", handler);
};

View.bindSaveNewCard = function (handler) {
    View.cardForm.addEventListener("submit", handler);
};

View.bindLogout = function (handler) {
    View.btnLogout.addEventListener("click", handler);
};

View.bindOverview = function (handler) {
    View.btnOverview.addEventListener("click", handler);
};

View.getLoginData = function () {
    return {
        key: document.querySelector("#api-key").value.trim(),
        token: document.querySelector("#api-token").value.trim()
    };
};

View.setLoginLoading = function (loading) {
    View.btnLogin.disabled = loading;
    View.btnLogin.textContent = loading ? "Login..." : "Login";
};

View.showLoginMessage = function (message, ok = false) {
    View.loginMessage.textContent = message;
    View.loginMessage.classList.toggle("success", ok);
};

View.showApp = function () {
    View.loginView.classList.add("hidden");
    View.appView.classList.remove("hidden");
};

View.showLogin = function () {
    View.appView.classList.add("hidden");
    View.loginView.classList.remove("hidden");
};

View.renderBoards = function (boards) {
    View.boardSelect.innerHTML = "";

    boards.forEach(function (board) {
        View.boardSelect.innerHTML += `<option value="${board.id}">${board.name}</option>`;
    });
};

View.getSelectedBoardId = function () {
    return View.boardSelect.value;
};

View.getSearchText = function () {
    return View.searchInput.value.trim().toLowerCase();
};

View.renderCards = function (cards, lists, actions) {
    View.cardList.innerHTML = "";

    cards.forEach(function (card) {
        const div = document.createElement("div");
        div.className = "task-card";
        div.innerHTML = `
            <h3>${card.name}</h3>
            <p>Liste: ${getListName(card.idList, lists)}</p>
            <div class="card-buttons">
                <button class="btn-edit" type="button">Edit</button>
                <button class="btn-delete" type="button">Löschen</button>
            </div>
            <div class="edit-box hidden">
                <input class="edit-title" value="${card.name}">
                <textarea class="edit-desc">${card.desc || ""}</textarea>
                <select class="edit-list">${makeListOptions(lists, card.idList)}</select>
                <input class="edit-due" type="date" value="${getDate(card.due)}">
                <button class="btn-save" type="button">Speichern</button>
            </div>
        `;

        div.addEventListener("click", function () {
            actions.details(card);
        });

        div.querySelector(".btn-edit").addEventListener("click", function (event) {
            event.stopPropagation();
            div.querySelector(".edit-box").classList.toggle("hidden");
        });

        div.querySelector(".btn-save").addEventListener("click", function (event) {
            event.stopPropagation();
            actions.save(card, div);
        });

        div.querySelector(".btn-delete").addEventListener("click", function (event) {
            event.stopPropagation();
            return actions.remove(card);
        });

        View.cardList.appendChild(div);
    });

    if (cards.length === 0) {
        View.cardList.innerHTML = "<p>Keine Cards gefunden.</p>";
    }
};

View.showDetails = function (card, lists) {
    View.cardForm.classList.add("hidden");
    View.detailBox.innerHTML = `
        <p><strong>Titel:</strong> ${card.name}</p>
        <p><strong>Liste:</strong> ${getListName(card.idList, lists)}</p>
        <p><strong>Beschreibung:</strong> ${card.desc || "Keine Beschreibung"}</p>
        <p><strong>Fällig:</strong> ${getDate(card.due) || "Kein Datum"}</p>
    `;
};

View.showText = function (text) {
    View.detailBox.innerHTML = `<p>${text}</p>`;
};

View.showNewCardForm = function (lists) {
    View.cardListSelect.innerHTML = makeListOptions(lists, lists[0] ? lists[0].id : "");
    View.cardForm.classList.remove("hidden");
    View.showText("Neue Card erstellen");
};

View.hideNewCardForm = function () {
    View.cardForm.classList.add("hidden");
};

View.getEditData = function (div) {
    return {
        name: div.querySelector(".edit-title").value.trim(),
        desc: div.querySelector(".edit-desc").value,
        idList: div.querySelector(".edit-list").value,
        due: div.querySelector(".edit-due").value || "null"
    };
};

View.getNewCardData = function () {
    return {
        name: View.cardTitle.value.trim(),
        desc: View.cardDesc.value,
        idList: View.cardListSelect.value,
        due: View.cardDue.value || "null"
    };
};

View.clearNewCardForm = function () {
    View.cardForm.reset();
    View.cardForm.classList.add("hidden");
};

View.showFeedback = function (message) {
    View.pageInfo.textContent = message;
};

View.showPageInfo = function (page, pageCount) {
    View.pageInfo.textContent = `Seite ${page} von ${pageCount}`;
    View.btnPrev.disabled = page <= 1;
    View.btnNext.disabled = page >= pageCount;
};

View.askDelete = function () {
    return confirm("Diese Card wirklich löschen?");
};

function makeListOptions(lists, selectedId) {
    let html = "";

    lists.forEach(function (list) {
        const selected = list.id === selectedId ? "selected" : "";
        html += `<option value="${list.id}" ${selected}>${list.name}</option>`;
    });

    return html;
}

function getListName(listId, lists) {
    const list = lists.find(function (item) {
        return item.id === listId;
    });

    return list ? list.name : "";
}

function getDate(date) {
    return date ? date.slice(0, 10) : "";
}

window.view = View;
