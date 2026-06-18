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
        const option = document.createElement("option");

        option.value = board.id;
        option.textContent = board.name;
        View.boardSelect.appendChild(option);
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
        `;

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

View.hideNewCardForm = function () {
    View.cardForm.classList.add("hidden");
};

View.showText = function (text) {
    View.detailBox.innerHTML = `<p>${text}</p>`;
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

function getListName(listId, lists) {
    const list = lists.find(function (item) {
        return item.id === listId;
    });

    return list ? list.name : "";
}

window.view = View;
