'use strict';

/* Options for date */
const options = { 
	year: 'numeric', 
	month: '2-digit', 
	day: 'numeric', 
	hour: '2-digit', 
	minute: '2-digit'
};

/* Locale for date */
const locale = browser.i18n.getUILanguage();

const Tab2list = document.getElementById( 'tabs-2-list' );

/* CSV Delimiter */
const csvD = ',';

/* Vars */
let tmpCSV, tmpHTML, fileData, fileName;

/* Helper function to replace HTML chars in tab titles */
function html_encode(string) {
	return string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

/* Create HTML / CSV Content */
function getList() {	
	Tab2list.textContent = '';
	tmpCSV = "";
	let fragment = document.createDocumentFragment();
	let allTabs = browser.tabs.query( { currentWindow: true } );
	allTabs.then( ( tabs ) => {
		for(let tab of tabs) {
			let tabURL = tab.url;
			let tabTitle = html_encode(tab.title);
			if( tabURL.indexOf('moz-extension://') == -1 ) {
				let re = new RegExp( csvD , 'g' );
				tmpCSV += tabTitle.replace( re , ' ' ) + csvD + tabURL + "\n";		

				let tmpLI = document.createElement('li');
				let tmpA = document.createElement('a');
				tmpA.textContent = tabTitle;
				tmpA.setAttribute( 'href' , tabURL );
				tmpA.setAttribute( 'title' , tabURL );
				tmpA.setAttribute( 'target' , '_blank' );
				fragment.appendChild( tmpLI ).appendChild( tmpA );
			}
		}
	}).then( () => {
		let tmpUL = document.createElement('ul');
		Tab2list.appendChild(tmpUL).appendChild(fragment);
		tmpHTML = Tab2list.innerHTML;

		tmpHTML = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + browser.i18n.getMessage('extension_name') + ' - Export</title><style>body,ul{margin:0}body{font-family:"Segoe UI","San Francisco",Ubuntu,"Fira Sans",Roboto,Arial,Helvetica,sans-serif;background-color:#fff;padding:10px}ul{list-style-type:none;padding:0}a{color:#0c0c0d;text-decoration:none}a:hover{color:#0060df}</style></head><body>' + tmpHTML + '</body></html>';
	});
}

/* Export Function */
document.querySelectorAll( '.export-list' ).forEach(
	function(currentValue, currentIndex) { 
		currentValue.addEventListener( 'click' , (e) => {
			let exportType = e.target.getAttribute( 'data' );
			let exportDate = new Date().toLocaleDateString( locale , options );
			exportDate = exportDate.replace(/\W+/g, "-");
			if( exportType == 'html' ) {
				fileData = tmpHTML;
				fileName = 'TabList-' + exportDate + '.html';
			} else {
				fileData = tmpCSV;
				fileName = 'TabList-' + exportDate + '.csv';
			}
			
			browser.downloads.download({
				saveAs : true,
				url : URL.createObjectURL( new Blob( [ fileData ] ) ),
				filename : fileName
			});
		});
	}
);

window.addEventListener( 'DOMContentLoaded' , getList );
