'use strict';

(function() {

const state = {
    // elems: {},
    manifest: {}, // will store manifest.json here
    config: {
        "urlPrefix": "books/", //https://www.gutenberg.org/files/id/id-h/id-h.htm
    },
    current: 1, // initially, 1st page is the current one.
};

function main()
{
    tabInit();
    parseManifest();

    document.querySelector("#clearCache").addEventListener("click", function() {
        if (confirm("Do you really want to clear the local cache?")) {
            localStorage.clear();
            alert("Cache cleared.");
            parseManifest();
            tabInit();
        }
    });

}

function tabInit()
{
    // for each container
    let container = document.querySelector(".tabcontainer");
    let nav = container.querySelector(".tabnavigation ul");
    nav.style.display="block";

    // set 1st tab as current
    let navitem = container.querySelector(".tabnavigation ul li"); //#tabnav_1
    let ident = navitem.id.split("_")[1]; //"1"
    state.current = ident;
    navitem.setAttribute("style","background-color: #f00");

    let pages = container.querySelectorAll(".tabpage");
    for (let i = 1; i < pages.length; i++) {
        pages[i].style.display="none";
    }

    let tabs = container.querySelectorAll(".tabnavigation ul li");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].onclick=displayPage;
    }
}

function parseManifest() {
    let xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState===4 && xhr.status===200) {
            state.manifest = JSON.parse(xhr.responseText);
            document.querySelector("#bookList").innerHTML = ""; //initialize
            for(let i=0; i<state.manifest.books.length; i++) {
                document.querySelector("#bookList").innerHTML +=
                    "<button><span id=" + i + ">"
                    + (isCached(i) ? "&#128462;" : "&#128459;") + " "
                    + state.manifest.books[i].title + "</span></button><br />";
            }
            document.querySelector("#bookList").addEventListener("click", function(e) {
                if(e.target && e.target.nodeName == "SPAN") {
                    // console.log("SPAN ITEM ", e.target.id, " was clicked!");
                    displayBook(e.target.id);
                }
            });
        }
    }
    xhr.open("GET", "manifest.json", true);
    xhr.send();
}

function displayPage() {
    parseManifest(); // due to the status Icon, every time before displayPage(), parseManifest() first.
    document.querySelector("#toc").innerHTML = ""; //initialize toc section
    document.getElementById("tabnav_" + state.current).setAttribute("style", "background-color: #fff");
    document.getElementById("tabpage_" + state.current).style.display="none";

    let ident = this.id.split("_")[1];
    this.setAttribute("style","background-color: #f00");
    document.getElementById("tabpage_" + ident).style.display="block";
    state.current = ident;
}

function makeTOC() {
    let toc = document.querySelector('#toc');
    toc.innerHTML = '';
    let book = document.querySelector('#currentBook');
    let headers = book.querySelectorAll('h1,h2,h3,h4,h5,h6');
    // let headers = book.querySelectorAll('h3');
    headers = Array.from(headers);
    headers.forEach(function(element){
        let level = element.nodeName;
        let text = element.innerText;
        toc.innerHTML += text + '<br>';
        // toc.innerHTML += '<' + level + '>' + text + '</' + level + '>';
    });
}

function displayBook(id) {
    console.log(state.manifest);
    document.querySelector("#tabnav_1").setAttribute("style", "background-color: #fff");
    document.querySelector("#tabpage_1").style.display="none";
    document.querySelector("#tabnav_2").setAttribute("style", "background-color: #f00");
    document.querySelector("#tabpage_2").style.display="block";
    state.current = 2; //currentBook View
    if (!isCached(id)) {
        retrieveBookFromFile(id);
    } else {
        displayBookContents(id);
    }

}

function isCached(key)  //if the book is cached in the localStorage, return TRUE.
{
    if (localStorage.getItem(key)) return true;
    else return false;
}

function retrieveBookFromFile(key)
{
    // alert("Now fetching the requested book");
    let url = state.config.urlPrefix + state.manifest.books[key].url;
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            localStorage.setItem(key, xhr.responseText);
            displayBookContents(key);
        }
    }
    xhr.open("GET", url, true);
    xhr.send();
}

function displayBookContents(key) {
    document.querySelector("#currentBook").innerHTML = localStorage.getItem(key);
    makeTOC();
}

// function returnBookContents(id) //obsoleted by isCached, retrieveBookFromFile, displayBookContents
// {
//     let url = state.config.urlPrefix + state.manifest.books[id].url;
//     let xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = function() {
//         if (xhr.readyState === 4 && xhr.status === 200) {
//             localStorage.setItem(id, xhr.responseText);
//             document.querySelector("#currentBook").innerHTML = localStorage.getItem(id);
//         }
//     }
//     xhr.open("GET", url, true);
//     xhr.send();
// }

window.addEventListener('load', main);

}) ();

/*
-Credit: Tab View from Javascript Cookbook by Shelly Powers
 */