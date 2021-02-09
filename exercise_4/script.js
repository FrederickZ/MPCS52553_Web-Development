'use strict';



const AZURE_KEY = 'e2daf41472f749549a4f28a8eab8f9d4'
const BING_API_PATH = 'https://api.bing.microsoft.com/v7.0/images/search?q=';

const request = new XMLHttpRequest();

function bingImageSearch() {
    const keyword = document.body.querySelector('#query').value;
    const url = BING_API_PATH + keyword;
    request.open("GET", url);
    request.setRequestHeader('Ocp-Apim-Subscription-Key', AZURE_KEY);
    request.addEventListener("load", handleBingResponse);
    request.responseType = 'json';
    request.send();
}

function handleBingResponse() {
    const response = this.response;
    console.log(response);

    // build image block
    const images = response['value']
    const imagesContainer = document.body.querySelector('#result-images-container');
    buildElementBlock(images, imagesContainer, buildImageBlock)
    // build related search block
    const relatedSearches = response['relatedSearches']
    const relatedSearchesContainer = document.body.querySelector('#related-searches-container')
    buildElementBlock(relatedSearches, relatedSearchesContainer, buildRelatedSearchBlock)
}

function bingRelatedSearch(id) {
    const keyword = document.body.querySelector('#rq' + id).textContent;
    document.body.querySelector('#query').value = keyword;
    bingImageSearch();
}

function buildElementBlock(elementsArray, container, elementBlockBuilder) {
    if (container.childNodes) {
        container.innerHTML = '';
    }
    elementsArray.forEach(function(item, index) {
        elementBlockBuilder(container, item, index);
    });
}

function buildImageBlock(container, item, index) {
    let imgBlock = document.createElement('div');
    imgBlock.className = 'image-block';

    let img = document.createElement('img');
    img.id = `img${index}`
    img.src = item['contentUrl'];
    imgBlock.appendChild(img);
    
    let imageTab = document.createElement('div');
    imageTab.className = 'image-tab';
    
    let imageTitle = document.createElement('h6');
    let imageTitleText = document.createTextNode(item['name']);
    imageTitle.appendChild(imageTitleText);
    imageTab.appendChild(imageTitle);

    const likeButtonID = `f${index}`;  // "f": favorite
    const likeButtonAction = `addToFavorite(${index})`;
    const likeButtonHtml = '<i class="material-icons">favorite_border</i>'
    const likeButton = buildButton('like-button', likeButtonID, likeButtonAction, likeButtonHtml);
    imageTab.appendChild(likeButton);

    imgBlock.appendChild(imageTab); 
    container.appendChild(imgBlock);
}

function buildRelatedSearchBlock(container, item, index) {
    let queryBlock = document.createElement('li');
    queryBlock.className = 'tag';
    
    const queryButtonID = `rq${index}`  // "rq": related query
    const queryButtonAction = `bingRelatedSearch(${index})`;
    const queryButtonHtml = `${item['text']}`;
    const queryButton = buildButton('query-button', queryButtonID, queryButtonAction, queryButtonHtml);
    
    queryBlock.appendChild(queryButton);
    container.appendChild(queryBlock);
}

function buildButton(className, id, strFunction, innerHTML) {
    let button = document.createElement('button');
    button.className = className;
    button.id = id;
    button.setAttribute('onclick', strFunction);
    button.innerHTML = innerHTML;
    return button;
}

// function checkImageUrl() {}

function addToFavorite(index) {
    const favoritesContainer = document.body.querySelector('#favorites-container');
    
    let imgBlock = document.createElement('div');
    imgBlock.className = 'image-block';
    let img = document.createElement('img');
    const imageUrl = document.body.querySelector(`#img${index}`).src;
    img.src = imageUrl;
    imgBlock.appendChild(img);

    favoritesContainer.appendChild(imgBlock);

}