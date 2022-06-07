var canvas = document.getElementById('canvas');
var imgInp = document.getElementById('imgUpload');
var TMPimg = document.getElementById('tmpImg');
var img = new Image();
var imgData;
var ctx,ctx2;

//載入圖片
imgInp.onchange = evt => {
    var file = imgInp.files[0];

    if (file) {
       ctx = canvas.getContext('2d');


    // Draw on canvas
        img.addEventListener("load", function() {//先等載好
            canvas.width=img.width;
            canvas.height=img.height;
            ctx.drawImage(img,0,0);
            //取得資料
            imgData = ctx.getImageData(0, 0, img.width, img.height)
          }, false);
            img.src = URL.createObjectURL(file);
            
      }
};

//增加對比
function histagrm(){
  let d = imgData.data
  let his = new Array(255);
  his.fill(0);

  rgb2hsv (d);
  let dd = [...d]
  let v

  //整理亮度分布
  for (let i = 0; i < d.length; i += 4) {
    v = dd [i+2]
    his[v]=his[v]+1
  }

  //尋找欲拉伸之AB端點
  let a,b,ab,nb
  let k=parseInt((img.width*img.height)/10);
  let sum=0

  
  for (let i = 0; i < 255; i ++) {
    sum=sum+his[i]
  console.log('sumA',sum)

    if(sum>=k){a=i;break}
  }
  console.log('sum=',sum)
  console.log('k=',k)

  sum=0
  let ccc=0
  for (let i = 0; i < 255; i ++) {
    sum=sum+his[254-i]
    if(sum>=k){b=i;break}
  }
  console.log('sum=',sum)
  console.log('k=',k)

  ab=b-a
  console.log(a)
  console.log(b)
  console.log(ab)

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

  

  for (let i = 0; i < d.length; i += 4) {
    d[i+2]=lut[d[i+2]]
  }

  console.log(d)

   hsv2rgb (d)
}

//縮放
function scale(){
  //ctx.drawImage(img, 0, 0, img.width*1.2, img.height*1.2)
  let d = imgData.data
  let newAry =new Uint8ClampedArray([])

  for (let i = 0; i < d.length; i += 4) {
      newAry[i]=d[i]
     newAry[i+1]=d[i + 1]
    newAry[i+2]=d[i + 2]
  }
  console.log(newAry)


  for (let i = 0; i < d.length; i += 4) {
    d[i] = newAry[i]
    d[i + 1] = newAry[i+1]
    d[i + 2] = newAry[i+2]
  }
  console.log(d)
}

//灰階
function grayscale(){
  let d = imgData.data
  let dd = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    let r = dd [i]
    let g = dd [i + 1]
    let b = dd [i + 2]
    let ave = (r+g+b)/3

    d[i] = ave
    d[i + 1] = ave
    d[i + 2] = ave
  }

  ctx.putImageData(imgData, 0, 0)
}

//水平翻轉
function flip(){
  let d = imgData.data
  let dd = [...d]
  let tmp =img.width*4
  let tmpp=0
  let c=0

  for (let j = 0; j < img.height; j++) {
    for (let i = 0; i < img.width*4; i += 4) {
      let r = dd[tmp-4]
      let g = dd[tmp-3]
      let b = dd[tmp-2]
      tmp=tmp-4
 
      d[i+tmpp] = r
      d[i+tmpp + 1] = g 
      d[i+tmpp + 2] = b
    }
    c++
    tmp =tmp+(img.width*4*2)
    tmpp =tmp-(img.width*4)
  }
  
  ctx.putImageData(imgData, 0, 0)
}

//負片
function negative(){
  let d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i]
    let g = d[i + 1]
    let b = d[i + 2]

    d[i] = 255-r
    d[i + 1] = 255-g
    d[i + 2] = 255-b
  }
  ctx.putImageData(imgData, 0, 0)
}

//變亮
function highlight(){
  let d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
  let r = d[i]
  let g = d[i + 1]
  let b = d[i + 2]
  d[i] = r+20
  d[i + 1] = g+20
  d[i + 2] = b+20
  }

ctx.putImageData(imgData, 0, 0)
}

//HSV飽和度
function mix(){
  let d = imgData.data
  rgb2hsv()
  HSVlight()
  hsv2rgb()
}

//HSV飽和度增值
function HSVlight(){
  let d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    let V = d[i+1]
  
    d[i+1] = V+20;
    if (d[i+1]>255){d[i+1]=255} ; if (d[i+1]<0) {d[i+1]=0}
}
ctx.putImageData(imgData, 0, 0)
}


function rgb2hsv () {
  let d = imgData.data
  let rr;
  let gg;
  let bb;
  let h;
  let s;
  

  for (let i = 0; i < d.length; i += 4) {
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
ctx.putImageData(imgData, 0, 0)
}

function hsv2rgb () {
  let d = imgData.data
  let _l ;
  let _m ;
  let _n ;
  let newR;
  let newG;
  let newB;
  for (let i = 0; i < d.length; i += 4) {
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
  ctx.putImageData(imgData, 0, 0)
}
