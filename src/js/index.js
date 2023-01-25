import Search from "./model/Search";

let search = new Search("pizza");

search.doSearch().then((result) => console.log(result));
