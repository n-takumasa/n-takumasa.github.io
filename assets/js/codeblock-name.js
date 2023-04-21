//@ts-check

Array.from(document.body.getElementsByClassName("highlight")).forEach((elm) => {
  const code = elm.getElementsByTagName("code")?.[0];
  const name = code?.getAttribute("data-lang")?.split(":")?.[1];
  if (name) {
    const div = document.createElement("div");
    div.textContent = name;
    div.className = "highlight-name";
    elm.insertBefore(div, elm.firstChild);
  }
});
