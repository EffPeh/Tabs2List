'use strict';

/* Options for date */
const options = { 
	localeMatcher: 'best fit',
	weekday: 'short', 
	year: 'numeric', 
	month: '2-digit', 
	day: '2-digit', 
	hour: '2-digit', 
	minute: '2-digit'
};

/* Locale for date */
const locale = browser.i18n.getUILanguage();

/* HTML Elements */
const tabsList = document.getElementById( 'tabs-list' );
const tabsHistory = document.getElementById( 'tabs-history' );
const autoHideBtn = document.getElementById( 'auto-hide' );
const linkCSS = document.getElementsByTagName( 'link' );
const tabsCount = document.getElementById( 'tabs-count' );

const searchTabs = document.getElementById( 'search-tabs' );
const listSearchWrap = document.getElementById( 'list-search-wrap' );
const listSearch = document.getElementById( 'list-search' );

/* Vars for Auto Hide Function */
let autoHideActive = 0;
let setAutoHide;

/* Var for Search Function */
let SearchOn = 0;

/* Var for Popup close */
let clicks = -1;

/* Delay value for setTimeout in updateList() */
let delay = 250;

/*******************************************************************************/

const tabs2list = {
/* Init , Get Options */
/**/init() {
		const getSettings = {
			async load() {
				const option = await browser.storage.local.get({
					maxHistory : 10,
					theme: 'light-theme',
					noWrap: false,
					autoInterval: 5,
					fSize: 8
				});
				tabs2list.maxHistory = +option.maxHistory;
				tabs2list.CSS = option.theme + '.css';
				tabs2list.noWrap = option.noWrap;
				tabs2list.autoInterval = +option.autoInterval;
				tabs2list.fSize = +option.fSize + 'pt';
			}
		};
		let o = getSettings.load();
		o.then( () => {
			tabs2list.go4it();
		} );
	},

/* Set href to themes */	
/**/go4it() {		
		linkCSS[0].setAttribute( 'href' , tabs2list.CSS );
		tabs2list.listTabs();
		tabs2list.sessionList();
	},

/* Helper function to replace HTML chars in tab titles */
/**/html_encode(string) {
		return string.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
	},

/* Helper function to create tab list */
/**/getCurrentWindowTabs() {
		return browser.tabs.query( { currentWindow: true } );
	},

/* Create tab list */
/**/listTabs() {		
		//tabs2list.getStorage();
		tabs2list.getCurrentWindowTabs().then( ( tabs ) => {

			tabs.sort( function( a , b ) { return a.hidden - b.hidden } );
			tabs.sort( function( a , b ) { return a.discarded - b.discarded } );
			tabs.sort( function( a , b ) { return b.pinned - a.pinned } );

			let tabsLength = tabs.length;

			let rule = new Intl.PluralRules( locale ).select( tabsLength );
			let tabsNum = browser.i18n.getMessage('Tab_'+(rule));

			tabsCount.textContent = ' (' + tabsLength + ' ' + tabsNum + ')';

			let currentTabs = document.createDocumentFragment();
			tabsList.textContent = '';
			for(let tab of tabs) {
				let fragment_LI = document.createDocumentFragment();
				let li = document.createElement('li');

				let tabLink = document.createElement( 'div' );
				tabLink.textContent = tabs2list.html_encode(tab.title) || tab.id;
				tabLink.setAttribute( 'data-id' , tab.id );
				tabLink.setAttribute( 'title' , tab.url );
				tabLink.classList.add( 'switch-tabs' );

				tabLink.style.fontSize = tabs2list.fSize;

				if( tabs2list.noWrap == true ) {
					tabLink.classList.add( 'no-wrap' );
				}

				let favIconURL = tab.favIconUrl;
				if( favIconURL && favIconURL != '' && favIconURL.indexOf( 'chrome://' ) == -1 ) {
					tabLink.style.backgroundImage = 'url("' + favIconURL + '")';
				} else {
					tabLink.classList.add( 'default' );
				}

				if( tab.active ) { 
					tabLink.classList.add( 'active' );
				}
				if( tab.discarded ) {
					tabLink.classList.add( 'discarded' );
				}	
				if( tab.hidden ) {
					tabLink.classList.add( 'hidden' );
				}				
				if( tab.pinned ) {
					li.classList.add( 'pinned' );
				}

				let fragment_popup = document.createDocumentFragment();				

				let fragment_popupWrap = document.createDocumentFragment();
				let popupWrap = document.createElement('div');
				popupWrap.classList.add( 'popupWrap' );

				let btnHide = document.createElement( 'span' );
				btnHide.classList.add( 'btn' , 'button-hide' );
				btnHide.setAttribute( 'data-id' , tab.id );
				btnHide.setAttribute( 'title' , browser.i18n.getMessage('hideTab') );

				let btnClose = document.createElement( 'span' );
				btnClose.classList.add( 'btn' , 'button-close' );
				btnClose.setAttribute( 'data-id' , tab.id );
				btnClose.setAttribute( 'title' , browser.i18n.getMessage('closeTab') );

				let btnPin = document.createElement( 'span' );
				btnPin.classList.add( 'btn' , 'button-pin' );
				btnPin.setAttribute( 'data-id' , tab.id );
				btnPin.setAttribute( 'title' , browser.i18n.getMessage('pinTab') );

				let btnReload = document.createElement( 'span' );
				btnReload.classList.add( 'btn' , 'button-reload' );
				btnReload.setAttribute( 'data-id' , tab.id );
				btnReload.setAttribute( 'title' , browser.i18n.getMessage('reloadTab') );

				fragment_popup.appendChild( btnClose );
				fragment_popup.appendChild( btnPin );

				if( !tab.active && !tab.hidden ) {					
					fragment_popup.appendChild( btnHide );
				}
				if( tab.active ) {
					fragment_popup.appendChild( btnReload );
				}

				fragment_popup.appendChild( btnClose );

				popupWrap.appendChild( fragment_popup );
				fragment_popupWrap.appendChild( popupWrap );

				fragment_LI.appendChild( li ).appendChild( tabLink ).appendChild( fragment_popupWrap );

				// Search Function
				if( SearchOn == 1 ) {
					let search = listSearch.value.toLowerCase();
					let tabTitle = tab.title;
					let title = tabTitle.toLowerCase();
					if( title.indexOf( search ) != -1 ) {
						currentTabs.appendChild( fragment_LI );
					}
				} else {
					currentTabs.appendChild( fragment_LI );
				}
			}
			
			tabsList.appendChild( currentTabs );
			
		}).then( () => {
			window.top.scrollTo( 0 , 0 );
			if( !searchTabs.classList.contains( 'search' ) ) {				
				//searchList();
			}
		});
	},

/* Update tab list */
/**/updateList() {		
		// https://bugzilla.mozilla.org/show_bug.cgi?id=1396758 
		setTimeout( tabs2list.listTabs , delay );
	},

/* Helper function to create chronicle list */
/**/sessionList() {
		let gettingSessions = browser.sessions.getRecentlyClosed({
			maxResults: tabs2list.maxHistory
		});
		gettingSessions.then( tabs2list.listMostRecent );
	},

/* Create chronicle list */
/**/listMostRecent( sessionInfos ) {
		tabsHistory.textContent = '';
		if( !sessionInfos.length ) {			
			return;
		}
		let currentHistory = document.createDocumentFragment();
		for( let sessionInfo of sessionInfos ) {
			if( sessionInfo.tab ) {
				let fragment_LI = document.createDocumentFragment();
				let li = document.createElement('li');

				let history = document.createElement( 'span' );			

				history.textContent = sessionInfo.tab.title || browser.i18n.getMessage('Untitled');
				history.setAttribute( 'data-id' , sessionInfo.tab.sessionId );
				history.setAttribute( 'title' , sessionInfo.tab.url );

				let favIconURL = sessionInfo.tab.favIconUrl;
				if( favIconURL && favIconURL != '' && favIconURL.indexOf( 'chrome://' ) == -1 ) {
					history.style.backgroundImage = 'url("' + favIconURL + '")';
				} else {
					history.classList.add( 'default' );
				}

				history.classList.add( 'switch-history' , 'restore-history' ); 
				if( tabs2list.noWrap == true ) {
					history.classList.add( 'no-wrap' );
				}			

				let timestr = new Date( sessionInfo.tab.lastAccessed ).toLocaleDateString( locale , options );
				let timestamp = document.createElement( 'span' );
				timestamp.classList.add( 'timestamp' , 'restore-history' );
				timestamp.textContent = '(' + browser.i18n.getMessage('LastVisit') + ': ' + timestr + ')';

				history.appendChild( timestamp );

				history.style.fontSize = tabs2list.fSize;

				let fragment_popup = document.createDocumentFragment();				

				let fragment_popupWrap = document.createDocumentFragment();
				let popupWrap = document.createElement('div');
				popupWrap.classList.add( 'popupWrap' );

				let btnClose = document.createElement( 'span' );
				btnClose.classList.add( 'btn' , 'button-close-session' );
				btnClose.setAttribute( 'data-id' , sessionInfo.tab.sessionId );
				btnClose.setAttribute( 'title' , browser.i18n.getMessage('closeSession') );

				fragment_popup.appendChild( btnClose );

				popupWrap.appendChild( fragment_popup );
				fragment_popupWrap.appendChild( popupWrap );

				fragment_LI.appendChild( li ).appendChild( history ).appendChild( fragment_popupWrap );

				currentHistory.appendChild( fragment_LI );
			}
		}
		tabsHistory.appendChild( currentHistory );
	},
	
/* Auto-Hide function */
/**/autoHide() {
		tabs2list.getCurrentWindowTabs().then( ( tabs ) => {
			let autoInterval = tabs2list.autoInterval * 60000;
			let currentTime = Date.now();
			for( let tab of tabs ) {
				let dif = currentTime - tab.lastAccessed;
				if ( (dif > autoInterval) && !tab.active && !tab.hidden && !tab.audible ) {
					browser.tabs.discard( tab.id );
					browser.tabs.hide( tab.id );
				}
			}
		});
	}
};

/*******************************************************************************/

/* Tab listener */
browser.tabs.onRemoved.addListener( tabs2list.updateList );
browser.tabs.onCreated.addListener( tabs2list.updateList );
browser.tabs.onActivated.addListener( tabs2list.updateList );
browser.tabs.onMoved.addListener( tabs2list.updateList );
browser.tabs.onUpdated.addListener( tabs2list.updateList );


/* Sessions Listener */
browser.sessions.onChanged.addListener( tabs2list.sessionList );

/* Storage Listener */
browser.storage.onChanged.addListener( tabs2list.init );

/* Close Popup */

function closePopup() {
	clicks++;
	if( clicks < 1 ) {
		window.close();
	}
}

/* Click events ****************************************************************/
document.addEventListener( 'click' , (e) => {
	let dataID = +e.target.getAttribute( 'data-id' );
	// Activate Tab
/**/if( e.target.classList.contains( 'switch-tabs' ) ) {
		browser.tabs.update( dataID , { active: true });
		closePopup();
	}
	// Close Button
/**/if( e.target.classList.contains( 'button-close' ) ) {
		browser.tabs.remove( dataID );
	}
	// Reload Button
/**/if( e.target.classList.contains( 'button-reload' ) ) {
		browser.tabs.reload( dataID , { bypassCache: true } );
		closePopup();
	}
	// Hide Button
/**/if( e.target.classList.contains( 'button-hide' ) ) {
		browser.tabs.discard( dataID );
		browser.tabs.hide( dataID );
	}
	// Pin Button
/**/if( e.target.classList.contains( 'button-pin' ) ) {
		let querying = browser.tabs.query( { currentWindow: true } );
		querying.then( ( tabs ) => {
			let gettingInfo = browser.tabs.get( dataID );
			gettingInfo.then( ( tab ) => {				
				if( tab.pinned ) {
					browser.tabs.update( dataID, { pinned: false } );
				} else {
					browser.tabs.update( dataID, { pinned: true } );
				}
				
			});
		});
	}

	// Hide all tabs (if possible)
/**/if( e.target.id == 'hide-all-tabs' ) {
		tabs2list.getCurrentWindowTabs().then( ( tabs ) => {
			for( let tab of tabs ) {
				if ( !tab.audible ) {
					browser.tabs.discard( tab.id );
					browser.tabs.hide( tab.id );
				}
			}
		});
	}
	// Auto-Hide
/**/if( e.target.id == 'auto-hide' ) {
		if( autoHideActive == 0 ) {
			setAutoHide = setInterval( tabs2list.autoHide , 60000 );
			autoHideActive = 1;
			e.target.classList.add( 'auto-hide-active' );
		} else {
			clearInterval( setAutoHide );
			autoHideActive = 0;
			e.target.classList.remove( 'auto-hide-active' );
		}
	}

	// New Tab
/**/if( e.target.id == 'create-tab' ) {
		browser.tabs.create({});
		closePopup();
	}
	
	// tabs2list > Options
/**/if( e.target.id == 'options' ) {
		browser.tabs.create({
			url: '../options/options.html'
		});
		closePopup();
	}
	// tabs2list > Export HTML/CSV List
/**/if( e.target.id == 'export-list' ) {
		browser.tabs.create({
			url: '../content/content.html'
		});
		closePopup();
	}

/* Chronicle */
	// Delete chronic, complete
/**/if( e.target.id == 'delete-history' ) {
		browser.sessions.getRecentlyClosed( {} )
		.then( (sessionInfos) => {
			for( let sessionTab of sessionInfos ) {
				if( sessionTab.tab ) {
					browser.sessions.forgetClosedTab( sessionTab.tab.windowId, sessionTab.tab.sessionId );
				}
			}
		});
	}

	let historyID = e.target.getAttribute( 'data-id' );
	
	// Restore Button
/**/if( e.target.classList.contains( 'restore-history' ) ) {		
		browser.sessions.restore( historyID );
		closePopup();
	}

	// Close a session ID 
/**/if( e.target.classList.contains( 'button-close-session' ) ) {
		browser.sessions.getRecentlyClosed( {} )
		.then( (sessionInfos) => {
			for( let sessionTab of sessionInfos ) {
				if( sessionTab.tab ) {
					if( sessionTab.tab.sessionId == historyID ) {
						browser.sessions.forgetClosedTab( sessionTab.tab.windowId, sessionTab.tab.sessionId );
					}
				}
			}
		});
	}

	e.preventDefault();
});

/*******************************************************************************/

/* Prevent right click event */
document.addEventListener( 'contextmenu' , (e) => {
	e.preventDefault();
});

/*******************************************************************************/
// Toggle Tabs/Chronic
document.querySelectorAll( '.list-tab' ).forEach(
	function(currentValue, currentIndex) { 
		currentValue.addEventListener( 'click' , (e) => {
			document.querySelectorAll( '.list-tab' ).forEach(
				function(cv, ci) {
					cv.classList.remove( 'list-tab-active' );
				}
			);
			e.target.classList.add( 'list-tab-active' );
			let showTab = e.target.getAttribute( 'data' );
			document.querySelectorAll( '.list' ).forEach(
				function(cv, ci) {
					cv.classList.add( 'list-hide' );
				}
			);
			document.getElementById(showTab).classList.remove( 'list-hide' );
		});
	}
);
/*******************************************************************************/

// Search Function
searchTabs.addEventListener( 'click' , (e) => {
	e.target.classList.toggle( 'search' );
	if( e.target.classList.contains( 'search' ) ) {
		listSearchWrap.style.display = 'none';
		listSearch.value = '';
		SearchOn = 0;
		tabs2list.updateList();
	} else {
		listSearchWrap.style.display = 'block';
		listSearch.focus();
	}
});

listSearch.addEventListener( 'keyup' , (e) => {
	SearchOn = 1;
	tabs2list.updateList();
});

/*******************************************************************************/

window.addEventListener( 'DOMContentLoaded' , tabs2list.init );

/*******************************************************************************/
//console.log(  );
/*

*/

