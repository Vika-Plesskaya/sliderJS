function loadInfo(stringFile) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', stringFile, false);
    xhr.send();
    if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText);
    }
    return xhr.responseText;
}

/**
 * Creates slider inside container.
 *
 * @param container - Parent container for slider.
 * @param arr - array of images
 * @param quickMenu - optional parameter(if true then swipe is enabled,multiple images visible,dispatches event after li click)
 */
var Slider = function(container,arr,quickMenu){
    var self = this;
    container.classList.add('slider');
    this.ul = document.createElement('ul');

    this.quickMenu = typeof quickMenu !== 'undefined' ? quickMenu : false;
    this.current = 0;
    this.list = arr.slice(0);   //duplicate array to avoid changing it outside function

    var lastNum = 0; //for future id naming
    var ulOffset = 0;
    var itemsOnPage = 1;
    var mainWidth = container.clientWidth;
    var basicWidth = container.clientWidth;
    var basicHeight = container.clientHeight;
    //multiple images visible
    if(quickMenu){
        itemsOnPage = Math.floor(basicWidth/container.clientHeight);
    }

    //adds new item to slider
    this.addItemToSlider = function(num){
        var li;
        var img;
        li = document.createElement('li');
        img = new Image();
        img.width = container.clientWidth;
        img.height = container.clientHeight;
        if(quickMenu){
            img.width = img.height;
            basicWidth = img.width + 1;
            //dispatches event to notify that picture needs to be changed
            li.addEventListener('mouseup',navigateToPict);
        }
        img.src = this.list[num];
        //set id for each li to better navigation
        li.setAttribute('id','id' + lastNum);
        lastNum++;
        li.appendChild(img);
        this.ul.appendChild(li);
    }

    //function dispatches event which tells main slider which slide to go
    function navigateToPict(ev){
        if(self.timer){
            var event = new CustomEvent('pictureToGo', { 'detail': ev.currentTarget.id });
            self.ul.dispatchEvent(event);
        }
    }

    for(var i = 0; i < this.list.length; i++){
        this.addItemToSlider(i);
    }
    container.appendChild(this.ul);
    this.ul.style.left = 0 + 'px';

    //create navigation arrows
    var linkNext = document.createElement('a');
    var linkPrev = document.createElement('a');

    linkNext.className = 'next';
    linkPrev.className = 'prev';

    linkNext.innerHTML = '>';
    linkPrev.innerHTML = '<';

    container.appendChild(linkNext);
    container.appendChild(linkPrev);

    linkPrev.addEventListener('click',function(){self.funcPrev(1)});
    linkNext.addEventListener('click',function(){self.funcNext(1)});
    this.ul.classList.add('animation');

    //if quickMenu then allow swipe (drag images)
    if(this.quickMenu){
        this.ul.addEventListener('mouseup',funcMouseUp);
        this.ul.addEventListener('mousedown',funcMouseDown);
    }
    var dragData = null;

    //remember start drag point
    function funcMouseDown(ev){
        ev.preventDefault();
        self.ul.addEventListener('mousemove',funcMouseMove);
        self.ul.classList.remove('animation');
        //if mouseup event will be right after mouse down navigate to selected picture (see  function navigateToPict())
        //otherwise only image drag action
        self.timer = setTimeout(function() { clearTimeout(self.timer);self.timer = null; }, 250);
        if(!dragData) {
            ev=ev||event;
            dragData={
                x: ev.clientX-self.ul.offsetLeft
            };
        };
    }
    //back to usual mode
    function funcMouseUp(ev){
        self.ul.removeEventListener('mousemove',funcMouseMove);
        self.ul.classList.add('animation');
        if(dragData) {
            ev=ev||event;
            self.ul.style.left=ev.clientX-dragData.x+"px";
            dragData=null;
        }
    }
    //move pictures list, switch their positions if necessary
    function funcMouseMove(ev){
        if(dragData) {
            ev=ev||event;
            var delta = ev.clientX-dragData.x;
            if(delta > 0){
                dragData.x+=basicWidth;
                self.ul.insertBefore(self.ul.childNodes[self.ul.childNodes.length - 1],self.ul.childNodes[0]);
            }
            if(delta < -1*((self.ul.childNodes.length)*basicWidth - mainWidth)){
                dragData.x-=basicWidth;
                self.ul.appendChild(self.ul.childNodes[0]);
            }
            self.ul.style.left=ev.clientX-dragData.x+"px";
        }
    }

    //switch to previous picture
    this.funcPrev = function(deltaShift){
        this.current--;
        var borderNum = -1;
        //quick menu needs more narrow borders because it has half-displayed pictures
        if(this.quickMenu)borderNum = 0;
        if(this.current - itemsOnPage < borderNum && Math.abs(deltaShift) == 1){
            this.current = 0;
            this.ul.insertBefore(this.ul.childNodes[this.ul.childNodes.length - 1],this.ul.childNodes[0]);
            this.ul.classList.remove('animation');

            ulOffset-=basicWidth;
            this.ul.style.left = ulOffset + 'px';
            //to avoid unnecessary animation because of children repositioning
            setTimeout(function(){
                    self.ul.classList.add('animation');
                    ulOffset+=basicWidth;
                    self.ul.style.left = ulOffset + 'px';
                },
                20);
        }
        else
        {
            ulOffset+=deltaShift*basicWidth;
            this.ul.style.left = ulOffset + 'px';
        }
    }
    //switch to next picture
    this.funcNext = function(deltaShift){
        this.current++;
        var borderNum = this.ul.childNodes.length + 1;
        //quick menu needs more narrow borders because it has half-displayed pictures
        if(this.quickMenu)borderNum = this.ul.childNodes.length;
        if(this.current + itemsOnPage >= borderNum && Math.abs(deltaShift) == 1){
            this.current = this.ul.childNodes.length - 1;
            //this.current = this.current + itemsOnPage - 1;
            this.ul.appendChild(this.ul.childNodes[0]);
            this.ul.classList.remove('animation');

            ulOffset+=basicWidth;
            this.ul.style.left = ulOffset + 'px';
            //to avoid unnecessary animation because of children repositioning
            setTimeout(function(){
                    self.ul.classList.add('animation');
                    ulOffset-=basicWidth;
                    self.ul.style.left = ulOffset + 'px';
                },
                20);
        }
        else {
            ulOffset-=deltaShift*basicWidth;
            this.ul.style.left = ulOffset + 'px';
        }
    }

};

/**
 * Function navigates to picture with specified id
 *
 * @param numId - id of picture li element which needs to be shown.
 */
Slider.prototype.navigateTo = function(numId){
    var shift;
    var i;
    var frame = 0;
    for(i = 0; i < this.ul.children.length; i++){
        if(this.ul.children[i].id == numId)break;
        frame++;
    }
    if(frame > this.current && frame < this.list.length)
    {
        shift = frame - this.current;
        this.current = frame-1;
        this.funcNext(shift);
    }
    if(frame < this.current && frame >= 0)
    {
        shift = this.current - frame;
        this.current = frame+1;
        this.funcPrev(shift);
    }
}

/**
 * Function add new picture to slider
 *
 * @param srcName - source path to picture.
 */
Slider.prototype.addImage = function(srcName){
    this.list.push(srcName);
    this.addItemToSlider(this.list.length-1);
}
/**
 * Function deletes picture with specified id
 *
 * @param num - id of picture li element which needs to be deleted.
 */
Slider.prototype.deleteImage = function(num){
    this.list.splice(num,1);
    this.ul.removeChild(this.ul.querySelector('li#id'+num));
}

/**
 * Creates slider with quick menu inside container.
 *
 * @param container - Parent container for slider.
 * @param arr - array of images
 */
var QuickSlider = function(container,arr){
    var mainDiv = document.createElement('div');
    var quickDiv = document.createElement('div');
    var self = this;
    container.appendChild(mainDiv);
    container.appendChild(quickDiv);
    mainDiv.classList.add('slider');
    quickDiv.classList.add('slider');
    quickDiv.classList.add('quick');
    var basicWidth = mainDiv.clientWidth;
    var basicHeight = mainDiv.clientHeight;
    mainDiv.style.height = 0.8*basicHeight + 'px';
    quickDiv.style.height = 0.2*basicHeight + 'px';

    this.sliderMain = new Slider(mainDiv,arr);
    this.sliderQuick = new Slider(quickDiv,arr,true);

    this.sliderQuick.ul.addEventListener('pictureToGo',funcCheck);

    //tell main slider to switch picture
    function funcCheck(ev){
        self.sliderMain.navigateTo(ev.detail);
    }
};

/**
 * Function add new picture to slider
 *
 * @param srcName - source path to picture.
 */
QuickSlider.prototype.addImage = function(srcName){
    this.sliderMain.addImage(srcName);
    this.sliderQuick.addImage(srcName);
}
/**
 * Function deletes picture with specified id
 *
 * @param num - id of picture li element which needs to be deleted.
 */
QuickSlider.prototype.deleteImage = function(num){
    this.sliderMain.deleteImage(num);
    this.sliderQuick.deleteImage(num);
}
/**
 * Function navigates to picture with specified id
 *
 * @param numId - id of picture li element which needs to be shown.
 */
QuickSlider.prototype.navigateTo = function(num){
    num='id'+num;
    this.sliderMain.navigateTo(num);
    //this.sliderQuick.navigateTo(num);
}

