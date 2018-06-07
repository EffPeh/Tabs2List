'use strict';

/* HTML Elements */
const about = document.getElementById( 'about' );
const about2 = document.getElementById( 'about-2' );
const license = document.getElementById( 'license' );
const optionMaxHistory = document.getElementById( 'option-maxHistory' );
const optionTheme = document.getElementById( 'option-theme' );
const optionNoWrap = document.getElementById( 'no-wrap' );
const optionAutoInterval = document.getElementById( 'option-auto-interval' );
const optionFontSize = document.getElementById( 'option-font-size' );

/* Get Options */
const options = {
	async load() {
		const option = await browser.storage.local.get({
			maxHistory : 10,
			theme: 'light-theme',
			noWrap: false,
			autoInterval: 5,
			fSize: 8
		});
		optionMaxHistory.value = option.maxHistory;
		optionTheme.value = option.theme;
		optionNoWrap.checked = option.noWrap;
		optionAutoInterval.value = option.autoInterval;
		optionFontSize.value = option.fSize;
	}
};

/* Element Listener */
optionMaxHistory.addEventListener( 'change' , (e) => {
	browser.storage.local.set( { maxHistory : e.target.value } );
});

optionAutoInterval.addEventListener( 'change' , (e) => {
	browser.storage.local.set( { autoInterval : e.target.value } );
});

optionTheme.addEventListener( 'change' , (e) => {
	browser.storage.local.set( { theme : e.target.value } );
});

optionFontSize.addEventListener( 'change' , (e) => {
	browser.storage.local.set( { fSize : e.target.value } );
});

optionNoWrap.addEventListener( 'change' , (e) => {
	browser.storage.local.set( { noWrap : e.target.checked } );
});

/* Tab Switcher */
document.querySelectorAll( '.switch' ).forEach(
	function(currentValue, currentIndex) { 
		currentValue.addEventListener( 'click' , (e) => {
			document.querySelectorAll( '.switch' ).forEach(
				function(cv, ci) {
					cv.classList.remove( 'active' );
				}
			);
			e.target.classList.add( 'active' );
			let showTab = e.target.getAttribute( 'data' );
			document.querySelectorAll( '.section' ).forEach(
				function(cv, ci) {
					cv.classList.add( 'hide' );
				}
			);
			document.getElementById(showTab).classList.remove( 'hide' );
		});
	}
);

/* Set href > locale */
about.setAttribute( 'href' , browser.i18n.getMessage('OP_link_about') );
about2.setAttribute( 'href' , browser.i18n.getMessage('OP_link_about') );
license.setAttribute( 'href' , browser.i18n.getMessage('OP_link_license') );

document.addEventListener( 'DOMContentLoaded' , options.load );

