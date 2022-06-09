var vidData;
var ctxVid;

var canvasVid = document.getElementById('canvasVid');
var myVideo = document.getElementById('video');
var w,h
var btnSwitch="normal"

var nomalBtn = document.getElementById('nomal');
var grayscaleBtn = document.getElementById('grayscaleV');
var flipBtn = document.getElementById('flipV');
var highlightBtn = document.getElementById('highlightV');
var mixBtn = document.getElementById('mixV');
var histagrmBtn= document.getElementById('histagrmV');

//60FPS
window.reqAnimation = window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || window.requestAnimationFrame

//影片用canvas
ctxVid = canvasVid.getContext('2d');
console.log(myVideo.Width)
myVideo.addEventListener( "play", function (e) {
  canvasVid.width=myVideo.videoWidth;
  canvasVid.height=myVideo.videoHeight;
  w=myVideo.videoWidth
  h=myVideo.videoHeight
  console.log(myVideo.Width)
  console.log("QQ")
  play() 
}, false );



function play() {
  computeFrame(myVideo, ctxVid)
  reqAnimation(play)
}        



function computeFrame(myVideo, ctxVid) {
  // 將影像畫在ctx上
  ctxVid.drawImage(myVideo,0,0);   
  //取得資料
  vidData = ctxVid.getImageData(0, 0, w, h)
  d = vidData.data
  dl = vidData.data.length
 if(btnSwitch=="negative"){
  negativeV(d,dl)
 }else if(btnSwitch=="grayscale"){
    grayscaleV(d,dl)
 }else if(btnSwitch=="flip"){
    flipV(d,dl)
 }else if(btnSwitch=="highlight"){
    highlightV(d,dl)
 }else if(btnSwitch=="mix"){
    mixV(d,dl)
 }else if(btnSwitch=="histagrm"){
    histagrmV(d,dl)}
  return
}



function normalB(){ btnSwitch="normal"}
function negativeB(){btnSwitch="negative"}
function grayscaleB(){btnSwitch="grayscale"}
function flipB(){btnSwitch="flip"}
function highlightB(){btnSwitch="highlight"}
function mixB(){btnSwitch="mix"}
function histagrmB(){btnSwitch="histagrm"}

//增加對比
function histagrmV(d,dl){

  let his = new Array(255);
  his.fill(0);

  rgb2hsvV (d,dl);
  let dd = [...d]
  let v

  //整理亮度分布
  for (let i = 0; i < dl; i += 4) {
    v = dd [i+2]
    his[v]=his[v]+1
  }

  //尋找欲拉伸之AB端點
  let a,b,ab
  let k=parseInt((w*h)/20);
  let sum=0

  
  for (let i = 0; i < 255; i ++) {
    sum=sum+his[i]

    if(sum>=k){a=i;break}
  }


  sum=0
  for (let i = 0; i < 255; i ++) {
    sum=sum+his[254-i]
    if(sum>=k){b=i;break}
  }

  ab=b-a

  //設置對照值lut
  let lut=new Array(255);
  lut.fill(0)
  //低於a設為0
  for (let i = 0; i < a; i ++) {
    lut[i]=0
  }

  //高於b設為255
  for (let i = 0; i < 255-b; i ++) {
    lut[255-i]=255
  }


  for (let i = a+1; i < (b-1); i ++) {
    lut[i]=parseInt((i-a)*(255/ab)) 
  }

  

  for (let i = 0; i < dl; i += 4) {
    d[i+2]=lut[d[i+2]]
  }



   hsv2rgbV (d,dl)
}


//灰階
function grayscaleV(d,dl){
  
  let dd = [...d]
  for (let i = 0; i < d.length; i += 4) {
    let r = dd [i]
    let g = dd [i + 1]
    let b = dd [i + 2]
    let ave = (r+g+b)/3

    d[i] = ave
    d[i + 1] = ave
    d[i + 2] = ave
  }

  ctxVid.putImageData(vidData, 0, 0)
}

//水平翻轉
function flipV(d,dl){

  let dd = [...d]
  let tmp =w*4
  let tmpp=0
  let c=0

  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w*4; i += 4) {
      let r = dd[tmp-4]
      let g = dd[tmp-3]
      let b = dd[tmp-2]
      tmp=tmp-4
 
      d[i+tmpp] = r
      d[i+tmpp + 1] = g 
      d[i+tmpp + 2] = b
    }
    c++
    tmp =tmp+(w*4*2)
    tmpp =tmp-(w*4)
  }
  
  ctxVid.putImageData(vidData, 0, 0)
}


//負片
function negativeV(d,dl){
  for (let i = 0; i < dl; i += 4) {
    let r = d[i]
    let g = d[i + 1]
    let b = d[i + 2]

    d[i] = 255-r
    d[i + 1] = 255-g
    d[i + 2] = 255-b
  }
  ctxVid.putImageData(vidData, 0, 0)
}

//變亮
function highlightV(d,dl){
  
  for (let i = 0; i < dl; i += 4) {
  let r = d[i]
  let g = d[i + 1]
  let b = d[i + 2]
  d[i] = r+80
  d[i + 1] = g+80
  d[i + 2] = b+80
  }

  ctxVid.putImageData(vidData, 0, 0)
}

//HSV飽和度
function mixV(d,dl){
  rgb2hsvV(d,dl)
  HSVlightV(d,dl)
  hsv2rgbV(d,dl)
}

//HSV飽和度增值
function HSVlightV(d,dl){
  
  for (let i = 0; i < dl; i += 4) {
    let V = d[i+1]
  
    d[i+1] = V+40;
    if (d[i+1]>255){d[i+1]=255} ; if (d[i+1]<0) {d[i+1]=0}
}
ctxVid.putImageData(vidData, 0, 0)
}


function rgb2hsvV(d,dl) {
  
  let rr;
  let gg;
  let bb;
  let h;
  let s;
  

  for (let i = 0; i < dl; i += 4) {
    let r = d[i] / 255;
    let g = d[i + 1] / 255;
    let b = d[i + 2] / 255;
    let v = Math.max(r, g, b);
    let diff = v - Math.min(r, g, b);
    let diffc = function (c) {
      return (v - c) / 6 / diff + 1 / 2;
  };

    if (diff === 0) {
      h = s = 0;
    } else {
      s = diff / v;
      rr = diffc(r);
      gg = diffc(g);
      bb = diffc(b);

    if (r === v) {
      h = bb - gg;
    } else if (g === v) {
        h = (1 / 3) + rr - bb;
    } else if (b === v) {
        h = (2 / 3) + gg - rr;
    }
    if (h < 0) {
        h += 1;
    } else if (h > 1) {
        h -= 1;
    }
    }

    d[i]=Math.round(h * 360)
    d[i + 1]=Math.round(s * 100)
    d[i + 2]=Math.round(v * 100)
  }
  ctxVid.putImageData(vidData, 0, 0)
}

function hsv2rgbV(d,dl) {
  
  let _l ;
  let _m ;
  let _n ;
  let newR;
  let newG;
  let newB;
  for (let i = 0; i < dl; i += 4) {
     _l = d[i];
     _m = d[i + 1];
     _n = d[i + 2];

  if (_m === 0) {
      _l = _m = _n = Math.round(255 * _n / 100);
      newR = _l;
      newG = _m;
      newB = _n;
  } else {
      _m = _m / 100;
      _n = _n / 100;
      let p = Math.floor(_l / 60) % 6;
      let f = _l / 60 - p;
      let a = _n * (1 - _m);
      let b = _n * (1 - _m * f);
      let c = _n * (1 - _m * (1 - f));
      switch (p) {
          case 0:
              newR = _n; newG = c; newB = a;
              break;
          case 1:
              newR = b; newG = _n; newB = a;
              break;
          case 2:
              newR = a; newG = _n; newB = c;
              break;
          case 3:
              newR = a; newG = b; newB = _n;
              break;
          case 4:
              newR = c; newG = a; newB = _n;
              break;
          case 5:
              newR = _n; newG = a; newB = b;
              break;
      }
      newR = Math.round(255 * newR);
      newG = Math.round(255 * newG);
      newB = Math.round(255 * newB);
  }
  d[i]=newR
  d[i + 1]=newG
  d[i + 2]=newB
}
ctxVid.putImageData(vidData, 0, 0)
}
