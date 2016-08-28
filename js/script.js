function slider() {

    var div = document.createElement('div');
    div.className = 'wrapper';
    var array = [];
    var size = 0;
    var currentSlide = 0;
    var nextSlide = 0;
    var previousSlide = 0;

    window.onload = function createSlider() {
        var jsonObj = loadInfo('slider.json');
        var jsonArray = JSON.parse(jsonObj);
        var counter = jsonArray.length;
        var element = document.createElement('div');
        element.className = 'div-slider';
        var body = document.querySelector('body');

        for (var i = 0; i < counter; i++) {
            var img = document.createElement('img');
            img.src = jsonArray[i].url;
            img.addEventListener('mousedown', setMouseDownCoordinates);
            img.addEventListener('mouseup', setMouseUpCoordinates);
            div.appendChild(img);
        }
        element.appendChild(div);

        var buttonNext = document.createElement('button');
        buttonNext.className = 'arrow-next';
        buttonNext.innerHTML = ' > ';
        buttonNext.addEventListener('click', moveNext);
        var buttonPrev = document.createElement('button');
        buttonPrev.className = 'arrow-prev';
        buttonPrev.innerHTML = ' < ';
        buttonPrev.addEventListener('click', movePrev);
        element.appendChild(buttonNext);
        element.appendChild(buttonPrev);

        var navigator = document.createElement('div');
        navigator.className = 'nav';
        var addButton = document.createElement('button');
        addButton.className = 'add';
        addButton.innerHTML = 'Add image';
        addButton.addEventListener('click', addImage);
        var deleteButton = document.createElement('button');
        deleteButton.className = 'delete';
        deleteButton.innerHTML = 'Delete image';
        deleteButton.addEventListener('click', deleteImage);
        navigator.appendChild(addButton);
        navigator.appendChild(deleteButton);
        element.appendChild(navigator);
        body.appendChild(element);
        size = div.childElementCount;

        for (var i = 0; i < size; i++) {
            array[i] = i;
            if (i == 0) {
                div.children[i].className = 'current-slide';
                currentSlide = i;
            }
            if (i == 1) {
                div.children[i].className = 'next-slide';
                nextSlide = i;
            }
            if (i == size - 1) {
                div.children[i].className = 'previous-slide';
                previousSlide = i;
            }
        }
    };

    function loadInfo(stringFile) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', stringFile, false);
        xhr.send();
        if (xhr.status != 200) {
            console.log(xhr.status + ': ' + xhr.statusText);
        }
        return xhr.responseText;
    }

    function addImage() {
        var jsonObj = loadInfo('addpicture.json');
        var jsonImg = JSON.parse(jsonObj);

        var img = document.createElement('img');
        img.addEventListener('mousedown', setMouseDownCoordinates);
        img.addEventListener('mouseup', setMouseUpCoordinates);
        img.src = jsonImg.url;
        div.appendChild(img);
        size = array.length;
        array[size] = size;
        alert("Image added");
    }

    function deleteImage() {
        var slide = div.firstElementChild;
        div.removeChild(slide);
        array.pop();
        alert("Image removed");
        moveNext();
    }

    var mouseDownX = 0;
    var mouseDownY = 0;
    var mouseUpX = 0;
    var mouseUpY = 0;

    function setMouseDownCoordinates(event) {
        event.preventDefault();
        mouseDownX = event.pageX;
        mouseDownY = event.pageY;
    }

    function setMouseUpCoordinates(event) {
        mouseUpX = event.pageX;
        mouseUpY = event.pageY;
        swipe();
    }

    function swipe() {
        var deltaX = mouseDownX - mouseUpX;
        var deltaY = mouseDownY - mouseUpY;
        if (deltaX > 10 || deltaY > 10) {
            moveNext();
        } else {
            if (deltaX < -10 || deltaY < -10) {
                movePrev();
            }
        }
    }

    function className(key) {
        var i;
        size = div.childElementCount;
        for (i = 0; i < size; i++) {
            div.children[i].className = '';
        }
        if (key == 'next') {
            for (i = 0; i < size; i++) {
                if (i == currentSlide) {
                    if (i == size - 1) {
                        currentSlide = 0;
                        nextSlide = 1;
                        previousSlide = size - 1;
                        break;
                    }
                    if (i == size - 2) {
                        currentSlide = i + 1;
                        nextSlide = 0;
                        previousSlide = currentSlide - 1;
                        break;
                    }
                    previousSlide = i;
                    currentSlide = i + 1;
                    nextSlide = currentSlide + 1;
                    break;
                }
            }
        }
        if (key == 'previous') {
            for (i = size; i > -1; i--) {
                if (i == currentSlide) {
                    if (i == 0) {
                        currentSlide = size - 1;
                        nextSlide = 0;
                        previousSlide = size - 2;
                        break;
                    }
                    if (i == 1) {
                        currentSlide = 0;
                        nextSlide = 1;
                        previousSlide = size - 1;
                        break;
                    }
                    nextSlide = i;
                    currentSlide = i - 1;
                    previousSlide = currentSlide - 1;
                    break;
                }
            }
        }
        div.children[currentSlide].className = 'current-slide';
        div.children[previousSlide].className = 'previous-slide';
        div.children[nextSlide].className = 'next-slide';
    }

    function movePrev() {
        className('previous');
    }

    function moveNext() {
        className('next');
    }
}
slider();