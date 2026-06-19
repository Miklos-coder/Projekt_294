"use strict";

let trelloKey = "";
let trelloToken = "";

function makeUrl(path, data = {}) {
    const params = new URLSearchParams(data);

    params.set("key", trelloKey);
    params.set("token", trelloToken);

    return `https://api.trello.com/1${path}?${params.toString()}`;
}

async function request(path, data = {}, method = "GET") {
    const res = await fetch(makeUrl(path, data), { method: method });

    if (!res.ok) throw new Error("Trello Fehler");

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

window.model = {
    async checkLogin(key, token) {
        trelloKey = key;
        trelloToken = token;
        return await request("/members/me");
    },

    async getBoards() {
        return await request("/members/me/boards");
    },

    async getLists(boardId) {
        return await request(`/boards/${boardId}/lists`);
    },

    async getCards(boardId) {
        return await request(`/boards/${boardId}/cards`);
    },

    async updateCard(cardId, data) {
        return await request(`/cards/${cardId}`, data, "PUT");
    },

    async createCard(data) {
        return await request("/cards", data, "POST");
    },

    async deleteCard(cardId) {
        return await request(`/cards/${cardId}`, {}, "DELETE");
    }
};
