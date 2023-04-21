//@ts-check

Array.from(document.body.getElementsByClassName("highlight")).forEach((elm) => {
  const code = elm.getElementsByTagName("code")?.[0];
  const data_lang = code?.getAttribute("data-lang");
  const name = data_lang?.split(":")?.[1] || data_lang;
  if (name) {
    const div = document.createElement("div");
    div.textContent = name;
    div.className = "highlight-name";
    elm.insertBefore(div, elm.firstChild);
  }
});
