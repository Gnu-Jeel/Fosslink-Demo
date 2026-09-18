// Run after the dashboard, editor and responsive layout have initialized.
// Font loading is bounded so a slow font service cannot hold the splash open.
Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,1000))])
 .then(()=>{if(document.querySelector('#app .shell'))window.fosslinkStartup.ready()});
