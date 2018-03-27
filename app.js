let cheerio = require('cheerio');
let http = require('http');
let iconv = require('iconv-lite');
let fs = require('fs');

// let movieUrl = 'http://www.dytt8.net/html/gndy/dyzz/index.html';
let movieUrl = 'http://www.dytt8.net/html/gndy/dyzz/list_23_';

let index = 1; //抓取当前页码
let titles = [];

let btCount = 0; //获取下载链接循环的索引

let title_href = []
let movieName = [];	//电影名称
let btLink = [];  //电影下载连接

function getTitle(url,i){
	console.log("正在获取第" + i + "页的内容"); 
	http.get(movieUrl+i+'.html',function(res){
		let chunks = [];
		res.on('data',function(chunk){
			chunks.push(chunk);
		});
		// chunks里面存储着网页的 html 内容，将它zhuan ma传给 cheerio.load 之后
		// 就可以得到一个实现了 jQuery 接口的变量，将它命名为 `$`
		// 剩下就都是 jQuery 的内容了
		res.on('end',function(){
			//由于咱们发现此网页的编码格式为gb2312，所以需要对其进行转码，否则乱码
	    	//依据：“<meta http-equiv="Content-Type" content="text/html; charset=gb2312">”
	    	 let html = iconv.decode(Buffer.concat(chunks), 'gb2312');
	    	 let $ = cheerio.load(html,{decodeEntities: false});
	    	 $('.co_content8 .ulink').each(function (idx, element) {
		      let $element = $(element);
		      titles.push({
		        title: $element.text()
		      })
		    })
	    	if(i < 2) { //为了方便只爬了两页
		        getTitle(movieUrl, ++index); //递归执行，页数+1
		    } else {
		        console.log(titles); 
		        console.log("Title获取完毕！");              
		    }
		})
	})
}

/**
 * 获取详情页链接
 *
 * @param {String} url
 * @param {Number} page
 * @param {Number} i
 */
const getTitleHref = (url, page, i) => {
  http.get(movieUrl + i + '.html', sres => {
    let chunks = []
    sres.on('data', chunk => {
      chunks.push(chunk)
    })
    sres.on('end', chunk => {
      let html = iconv.decode(Buffer.concat(chunks), 'gb2312')
      let $ = cheerio.load(html, { decodeEntities: false })
      $('.co_content8 .ulink').each((idx, element) => {
        let $element = $(element)
        title_href.push({
          titleHref: $element.attr('href')
        })
      })
      if(i < page) {
        getTitleHref(movieUrl, page, ++index )
      } else {
      	// console.log(title_href.length);
        getBtLink(title_href, btCount)
      }
    })
  })
}

/**
 * 获取下载链接
 *
 * @param {Arrary} urls
 * @param {Number} n
 */
function getBtLink(urls,n){
	console.log("正在获取第" + n + "个url的内容");
	http.get('http://www.dytt8.net' + urls[n].titleHref,function(res){
		let chunks = [];
		res.on('data',function(chunk){
			chunks.push(chunk);
		})
		res.on('end',function(){
			let html = iconv.decode(Buffer.concat(chunks),'gb2312');
			let $ = cheerio.load(html,{decodeEntities:false});

			// 获取电影标题
			$(".bd3r .co_area2 .title_all h1").children('font').each(function(idx,element){
				let $element = $(element);
				movieName.push($element.text())
			})

			// 获取电影链接
			$('#Zoom td').children('a').each(function(idx, element){
				let $element = $(element);
				// console.log($element.attr('href'));
				btLink.push({
					bt:$element.attr('href')
				})
			})

			if(n < urls.length-1){
				getBtLink(urls, ++btCount);
			}else{
				console.log("下载链接获取完毕！");
		        let content = '';
		        // console.log(movieName.length);
		        // console.log(btLink.length);
		        btLink = btLink.filter( item => {
		        	return item.bt.indexOf('ftp') >=0;
		        })
		       /* console.log(btLink);
		        console.log(btLink.length);*/
		        movieName.forEach((item,n)=>{
		        	// console.log(n);
		        	// content+=item.bt+'\n\n';
		        	content+="<b style='color:#009a8c;'>"+item+"：</b>"+btLink[n].bt+'<br/><br/>';
		        })
		        fs.writeFile("DownLink.html",content,function(err){
		        	if (err) throw err ;
                    console.log("File Saved !"); //文件被保存
		        })
			}
		})
	})
}
function main() {
  console.log("开始爬取");
  // getTitle(movieUrl, index);
  getTitleHref(movieUrl,100,index)
}

main(); //运行主函数
