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
import Like from "./model/Like";
import * as listView from "./view/listView";
import * as likesView from "./view/likesView";

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
    renderRecipe(state.recipe, state.likes.isLiked(id));
  }
};

// window.addEventListener("hashchange", controlRecipe);

["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

window.addEventListener("load", (e) => {
  // Шинээр like моделийг апп ачаалагдахад үүсгэнэ.
  if (!state.likes) state.likes = new Like();

  // Like цэсийг гаргах эсэхийг шийдэх.
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());

  // Лайкууд байвал тэдгээрийг цэсэнд нэмж харуулна.
  state.likes.likes.forEach((like) => likesView.renderLike(like));
});

// Найрлаганы controller
const controlList = () => {
  // Найрлаганы Model-ийг үүсгэнэ.
  state.list = new List();

  // Өмнөх найрлагуудыг дэлгэцээс цэвэрлэнэ.
  listView.clearItems();
  // Уг Model руу одоо харагдаж байгаа жорны найрлагыг авч хийнэ.
  state.recipe.ingredients.forEach((n) => {
    // Тухайн найрлагыг Model руу хийнэ.
    const item = state.list.addItem(n);
    // Тухайн найрлагыг дэлгэцэнд гаргана.
    listView.renderItem(item);
  });
};

// Like controller
const controlLike = () => {
  // 1) Like-ийн моделийг үүсгэнэ.
  if (!state.likes) state.likes = new Like();
  // 2) Одоо харагдаж байгаа жорын ID-г олж авах.
  const currentRecipeId = state.recipe.id;
  // 3) Энэ жорыг Like-лсан эсэхийг шалгах.
  if (state.likes.isLiked(currentRecipeId)) {
    // Like-лсан бол Лайкийг нь болиулна.
    state.likes.deleteLike(currentRecipeId);
    // Like-ийн цэснээс устгана
    likesView.deleteLike(currentRecipeId);

    // Like товчны like-ласан байдлыг болиулах
    likesView.toggleLikeBtn(false);
  } else {
    // Like-лаагүй бол Лайклана.
    const newLike = state.likes.addLike(
      currentRecipeId,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.image_url
    );
    // Like цэсэнд newLike ийг оруулах
    likesView.renderLike(newLike);
    // Like-ласан болгох
    likesView.toggleLikeBtn(true);
  }

  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
};

elements.recipeDiv.addEventListener("click", (e) => {
  if (e.target.matches(".recipe__btn, .recipe__btn *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLike();
  }
});

elements.shoppingList.addEventListener("click", (el) => {
  // Клик хийсэн li элементийн data-itemid аттрибутыг шүүж гаргаж авах.
  const id = el.target.closest(".shopping__item").dataset.itemid;

  // Олдсон ID- тэй орцыг моделоос устгана.
  state.list.deleteItem(id);

  // Дэлгэцээс ийм ID-тэй орцыг олж устгана.
  listView.deleteItem(id);
});
