import Search from "./model/Search";
import { elements, renderLoader, clearLoader } from "./view/base";
import * as searchView from "./view/searchView";
import Recipe from "./model/Recipe";
import {
  renderRecipe,
  clearRecipe,
  highlightSelectedRecipe,
} from "./view/recipeView";
import List from "./model/List";
import * as listView from "./view/listView";

// Web app төлөв
// - Хайлтын query, үр дүн
// - Тухайн үзүүлж байгаа жор
// - Лайкласан жорууд
// - Захиалж байгаа жорын найрлагууд

const state = {};

// Хайлтын controller
const controlSearch = async () => {
  // 1) Вебээс хайлтын түлхүүр үгийг гаргаж авна.
  const query = searchView.getInput();

  if (query) {
    // 2) Шинээр хайлтын object-ийг үүсгэж өгнө.
    state.search = new Search(query);
    // 3) Хайлт хийхэд зориулж дэлгэцийн UI бэлтгэнэ.
    searchView.clearSearchQuery();
    searchView.clearSearchResult();
    renderLoader(elements.searchLoader);

    // 4) Хайлтыг гүйцэтгэнэ.
    await state.search.doSearch();
    // 5) Хайлтын үр дүнг дэлгэцэнд үзүүлнэ.
    clearLoader();
    if (state.search.result === undefined) alert("Хайлтаар илэрцгүй");
    else searchView.renderRecipes(state.search.result);
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.pageButtons.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");

  if (btn) {
    const gotoPageNumber = parseInt(btn.dataset.goto, 10);
    searchView.clearSearchResult();
    searchView.renderRecipes(state.search.result, gotoPageNumber);
  }
});

// Жорын controller

const controlRecipe = async () => {
  // 1) URL-аас ID-г салгаж авна.
  const id = window.location.hash.replace("#", "");

  // URL дээр ID байгаа эсэхийг шалгана.
  if (id) {
    // 2) Жорын Model-ийг үүсгэж өгнө.
    state.recipe = new Recipe(id);

    // 3) UI дэлгэцийг бэлтгэнэ.
    clearRecipe();
    renderLoader(elements.recipeDiv);
    highlightSelectedRecipe(id);
    // 4) Жороо татаж авчирна.
    await state.recipe.getRecipe();

    // 5) Жорыг гүйцэтгэх хугацаа болон орцыг тооцоолно.
    clearLoader();
    state.recipe.calcTime();
    state.recipe.calcHumanCount();
    // 6) Жороо дэлгэцэнд гаргана.
    renderRecipe(state.recipe);
  }
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

// Найрлаганы controller
const controlList = () => {
  // Найрлаганы Model-ийг үүсгэнэ.
  state.list = new List();

  // Өмнөх найрлагуудыг дэлгэцээс цэвэрлэнэ.
  listView.clearItems();
  // Уг Model руу одоо харагдаж байгаа жорны найрлагыг авч хийнэ.
  state.recipe.ingredients.forEach((n) => {
    // Тухайн найрлагыг Model руу хийнэ.
    state.list.addItem(n);
    // Тухайн найрлагыг дэлгэцэнд гаргана.
    listView.renderItem(n);
  });
};

elements.recipeDiv.addEventListener("click", (e) => {
  if (e.target.matches(".recipe__btn, .recipe__btn *")) {
    controlList();
  }
});
