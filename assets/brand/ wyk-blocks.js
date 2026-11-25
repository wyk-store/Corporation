/* WYK — sections de page éditables (Resto Lakay + périodes de fête)
   Affichage public + mode éditeur (administrateur connecté uniquement).
   Utilisation : WYKBlocks.mount({page:'resto', root:'#blocks', defaults:[…], renderers:{products:fn}}) */
(function(){
'use strict';
var ADMIN_UID='dcdb1af5-6305-4138-b991-cf3a931740ed',BUCKET='wyk-images';
var GLYPH={"food": "M22 18a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4v-2h6.79l2.76-4.77 1.56.9L19.87 16H22zM9 22H2c0-3 0-6 .33-9.17C2.6 10.3 3.08 7.66 3.6 5H3V3h5v2h-.6c.52 2.66 1 5.3 1.27 7.83C9 16 9 19 9 22", "chef-hat": "M12.5 1.5c-1.77 0-3.33 1.17-3.83 2.87C8.14 4.13 7.58 4 7 4a4 4 0 0 0-4 4 4.01 4.01 0 0 0 3 3.87V19h13v-7.13c1.76-.46 3-2.05 3-3.87a4 4 0 0 0-4-4c-.58 0-1.14.13-1.67.37-.5-1.7-2.06-2.87-3.83-2.87m-.5 9h1v7h-1zm-3 2h1v5H9zm6 0h1v5h-1zM6 20v1a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-1z", "cocktail": "m7.5 7-2-2h13l-2 2M11 13v6H6v2h12v-2h-5v-6l8-8V3H3v2z", "cupcake": "M12 1.5A2.5 2.5 0 0 1 14.5 4 2.5 2.5 0 0 1 12 6.5 2.5 2.5 0 0 1 9.5 4 2.5 2.5 0 0 1 12 1.5M15.87 5C18 5 20 7 20 9c2.7 0 2.7 4 0 4H4c-2.7 0-2.7-4 0-4 0-2 2-4 4.13-4 .44 1.73 2.01 3 3.87 3s3.43-1.27 3.87-3M5 15h3l1 7H7zm5 0h4l-1 7h-2zm6 0h3l-2 7h-2z", "food-drumstick": "M20.16 12.73A6.27 6.27 0 0 0 19.09 3c-2.01-1.33-4.7-1.34-6.73-.03-1.76 1.13-2.73 2.89-2.9 4.71-.13 1.32-.63 2.55-1.55 3.47l-.03.03c-1.16 1.16-1.16 2.93-.07 4.01l.99.99a2.794 2.794 0 0 0 3.95 0c.97-.97 2.25-1.5 3.64-1.65 1.37-.15 2.71-.75 3.77-1.8m-13.9 7.13c.27.56.18 1.24-.29 1.7a1.49 1.49 0 0 1-2.55-.98 1.49 1.49 0 0 1-.98-2.55c.46-.46 1.15-.56 1.7-.29l2.48-2.43c.14.19.3.41.48.59l.99.99c.21.2.41.37.67.52z", "fish": "m12 20 .76-3c-3.26-.21-6.17-1.6-7.01-3.42-.09.48-.22.92-.42 1.25C4.67 16 3.33 16 2 16c1.1 0 1.5-1.57 1.5-3.5S3.1 9 2 9c1.33 0 2.67 0 3.33 1.17.2.33.33.77.42 1.25.65-1.42 2.57-2.57 4.91-3.1L9 5c2 0 4 0 5.33.67 1.13.56 1.78 1.6 2.36 2.71 2.92.7 5.31 2.28 5.31 4.12 0 1.88-2.5 3.5-5.5 4.16-.83 1.1-1.64 2.12-2.33 2.67-.84.67-1.5.67-2.17.67m5-9a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1", "bowl-mix": "m16.2 11 4.1-6.5 1.7 1-3.4 5.5zm-.6 1H2v3c0 3.9 3.1 7 7 7h6c3.9 0 7-3.1 7-7v-3z", "pot-steam": "M19 19c0 1.11-.89 2-2 2H7a2 2 0 0 1-2-2v-7H3v-2h18v2h-2M8 1.5a3.35 3.35 0 0 0 0 6.7h1.53c.39 0 .76.1 1.08.3h2.02c-.58-1.05-1.77-1.75-3.1-1.75H8c-1 0-1.85-.98-1.85-2S7 3 8 3m4.85-1c0 1-.85 1.85-1.85 1.85v1.5c1.92 0 3.5 1.35 3.89 3.15h1.53a5.54 5.54 0 0 0-3.07-4.12c.62-.61 1-1.45 1-2.38Z", "cookie": "M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9c0-.5-.04-1-.13-1.5C20.6 10 20 10 20 10h-2V9c0-1-1-1-1-1h-2V7c0-1-1-1-1-1h-1V4c0-1-1-1-1-1M9.5 6A1.5 1.5 0 0 1 11 7.5 1.5 1.5 0 0 1 9.5 9 1.5 1.5 0 0 1 8 7.5 1.5 1.5 0 0 1 9.5 6m-3 4A1.5 1.5 0 0 1 8 11.5 1.5 1.5 0 0 1 6.5 13 1.5 1.5 0 0 1 5 11.5 1.5 1.5 0 0 1 6.5 10m5 1a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5 1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5m5 2a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5 1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5M11 16a1.5 1.5 0 0 1 1.5 1.5A1.5 1.5 0 0 1 11 19a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 11 16", "hamburger": "M22 13c0 1.11-.89 2-2 2H4a2 2 0 1 1 0-4h9l2.5 2 2.5-2h2a2 2 0 0 1 2 2M12 3C3 3 3 9 3 9h18s0-6-9-6M3 18c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3v-1H3z", "grill": "M8.06 2c-.18 1.17.11 2.16.89 2.97.5.5.66 1.17.47 2.03h.99c.12-.55.14-1 .04-1.45-.09-.42-.4-.92-.95-1.52-.45-.56-.61-1.23-.45-2.03zm2.49 0c-.19 1.17.11 2.16.89 2.97.5.5.65 1.17.47 2.03h.98c.11-.55.14-1 .05-1.45-.1-.42-.41-.92-.94-1.52-.47-.56-.62-1.23-.47-2.03zm2.53 0c-.19 1.17.11 2.16.89 2.97.5.5.64 1.17.42 2.03h1.03c.13-.55.14-1 .05-1.45-.09-.42-.41-.92-.94-1.52-.47-.56-.62-1.23-.47-2.03zM5 8c0 1.42.39 2.7 1.14 3.84a6.9 6.9 0 0 0 3 2.55l-3.98 6.05c-.1.12-.16.31-.16.56 0 .41.16.69.44.84.12.1.31.16.56.16.41 0 .69-.16.84-.44l.99-1.59h6.37c.21.58.59 1.08 1.08 1.45.5.38 1.08.58 1.72.58.83 0 1.53-.31 2.13-.91.59-.59.87-1.29.87-2.09 0-.83-.28-1.53-.87-2.12-.6-.6-1.3-.88-2.13-.88-.64 0-1.22.17-1.72.55-.5.37-.86.86-1.08 1.45H9.14l1.97-3.05c.16.05.45.05.89.05s.73 0 .89-.05l.99 1.55c.41-.54.96-.96 1.59-1.22l-.56-.89c1.12-.5 2.09-1.39 2.88-2.62C18.59 10.5 19 9.27 19 8zm12 10c.3 0 .53.09.72.28s.28.44.28.72c0 .27-.09.5-.28.71-.18.2-.44.29-.72.29-.26 0-.5-.09-.71-.29A1 1 0 0 1 16 19c0-.3.09-.53.29-.72.21-.19.44-.28.71-.28", "cake-variant": "M12 6a2 2 0 0 0 2-2c0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03a2 2 0 0 0 2 2m4.6 10-1.07-1.08L14.45 16c-1.3 1.29-3.58 1.3-4.89 0L8.5 14.92 7.4 16a3.47 3.47 0 0 1-4.4.39V21a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4.61a3.467 3.467 0 0 1-4.4-.39M18 9h-5V7h-2v2H6a3 3 0 0 0-3 3v1.54c0 1.08.88 1.96 1.96 1.96.54 0 1.04-.2 1.38-.57L8.5 12.8l2.11 2.13c.74.74 2.03.74 2.77 0l2.12-2.13 2.15 2.13c.35.37.85.57 1.38.57 1.08 0 1.97-.88 1.97-1.96V12a3 3 0 0 0-3-3", "gift": "M9.06 1.93C7.17 1.92 5.33 3.74 6.17 6H3a2 2 0 0 0-2 2v2a1 1 0 0 0 1 1h9V8h2v3h9a1 1 0 0 0 1-1V8a2 2 0 0 0-2-2h-3.17C19 2.73 14.6.42 12.57 3.24L12 4l-.57-.78c-.63-.89-1.5-1.28-2.37-1.29M9 4c.89 0 1.34 1.08.71 1.71S8 5.89 8 5a1 1 0 0 1 1-1m6 0c.89 0 1.34 1.08.71 1.71S14 5.89 14 5a1 1 0 0 1 1-1M2 12v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8h-9v8h-2v-8z", "heart": "m12 21.35-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53z", "pizza": "M12 15a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2M7 7c0-1.11.89-2 2-2a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2m5-5C8.43 2 5.23 3.54 3 6l9 16 9-16c-2.22-2.46-5.43-4-9-4", "ice-cream": "M17.5 6.05C17.25 3.22 14.89 1 12 1S6.75 3.22 6.5 6.05C5.09 6.28 4 7.5 4 9c0 1.66 1.34 3 3 3l5 10 5-10c1.66 0 3-1.34 3-3 0-1.5-1.09-2.72-2.5-2.95M12 17.53l-3.11-6.22c.06-.05.11-.1.19-.15a5.5 5.5 0 0 0 5.84 0c.08.05.13.1.19.15z", "coffee": "M2 21h18v-2H2M20 8h-2V5h2m0-2H4v10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2", "wine": "M10 22a1 1 0 0 1-1-1V11c0-2 1-3.75 2-4V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5V7c1 .25 2 2 2 4v10a1 1 0 0 1-1 1z", "citrus": "M9 15.9c-2.1-.2-3.9-1-5-2.3-.8 0-1.6-.5-1.9-1.3s0-1.6.7-2.1c.1-3 2.8-6.1 6.9-7.5S18 2.1 20 4.4c.8 0 1.6.5 1.9 1.3s0 1.6-.7 2.1q0 1.2-.6 2.4C19.4 9.5 18 9 16.5 9c-3.9 0-7.2 3-7.5 6.9m13 .6c0 3-2.5 5.5-5.5 5.5S11 19.5 11 16.5s2.5-5.5 5.5-5.5 5.5 2.5 5.5 5.5M13.3 18l2.3-1.5-2.3-1.5q-.3.75-.3 1.5c0 .75.1 1 .3 1.5m2.7-.6-2.1 1.4c.5.6 1.3 1 2.1 1.2zm0-4.3c-.8.1-1.6.5-2.1 1.2l2.1 1.4zm1 2.5 2.1-1.4c-.5-.6-1.3-1-2.1-1.2zm2.1 3.2L17 17.4v2.5c.8-.1 1.6-.5 2.1-1.1m.9-2.3q0-.75-.3-1.5l-2.3 1.5 2.3 1.5q.3-.75.3-1.5", "chili": "m10.43 7.32-1.57-.9C9.38 5.6 10.11 5 10.94 4.7A.99.99 0 0 0 10 4V2c.77 0 1.47.29 2 .77V4c.45 0 .81.3.94.7-1.11.38-2.01 1.35-2.51 2.62M10 11c0-.77.23-1.5.6-2.09l-1.34-.76C8.5 8.44 8 9.16 8 10v1c0 7.05 4.9 9.8 7.03 10.66C12.41 19.62 10 16.2 10 11M6.43 7.32l-1.57-.9C5.38 5.6 6.11 5 6.94 4.7A.99.99 0 0 0 6 4V2c.77 0 1.47.29 2 .77V4c.45 0 .81.3.94.7-1.11.38-2.01 1.35-2.51 2.62M6 11c0-.77.23-1.5.6-2.09l-1.34-.76C4.5 8.44 4 9.16 4 10v1c0 7.05 4.9 9.8 7.03 10.66C8.41 19.62 6 16.2 6 11m13-2.72L17.75 9 16 8l-1.75 1L13 8.28c-.6.35-1 .99-1 1.72v1c0 9 8 11 8 11V10c0-.73-.4-1.37-1-1.72m-6.27-1.65 1.52.87 1.75-1 1.75 1 1.52-.87c-.55-.97-1.36-1.69-2.3-1.98A2.996 2.996 0 0 0 14 2v2c.44 0 .8.29.94.69-.91.31-1.68 1.01-2.21 1.94", "turkey": "m5.44 7.96.52-.53c.58-.58 1.54-.58 2.14.04l.02.03c.49.5 1.14.74 1.85.81.97.09 1.91.61 2.53 1.55.68 1.08.67 2.52-.04 3.59a3.322 3.322 0 0 1-5.18.55c-.56-.55-.88-1.26-.96-2-.08-.73-.37-1.42-.88-1.93-.58-.57-.58-1.53 0-2.11M9.64 16c-1.17 0-2.26-.45-3.07-1.28-.7-.72-1.14-1.62-1.25-2.6-.03-.3-.12-.69-.36-1.05C4.36 11.9 4 12.9 4 14c0 1.64.8 3.09 2.03 4H19v-1c0-3.6-2.39-6.65-5.66-7.65.89 1.4.87 3.27-.04 4.65-.8 1.25-2.18 2-3.66 2m5.14-8.44h1.27c.87 0 1.63.61 1.63 1.7V10h1.25V9c0-1.5-1.33-2.64-2.88-2.64h-1.27c-.83 0-1.54-.82-1.54-1.66s.71-1.46 1.54-1.46V2C13.24 2 12 3.24 12 4.78s1.24 2.78 2.78 2.78M4.5 7.55c.06-.1.14-.2.23-.3l.52-.52c.09-.09.19-.16.29-.23L4.13 5.07c.14-.27.09-.62-.13-.85a.767.767 0 0 0-1.07 0c-.14.14-.21.31-.22.49-.18.01-.35.08-.49.22-.29.29-.29.77 0 1.07.23.22.57.27.85.13zm13.89-3.16c.51-.51.83-1.2.83-1.97h-1.25c0 .83-.7 1.53-1.53 1.53v1.24c1.86 0 3.32 1.52 3.32 3.38V11H21V8.57a4.61 4.61 0 0 0-2.61-4.18M5 21h14c1.11 0 2-.89 2-2H3a2 2 0 0 0 2 2", "tree": "M10 21v-3H3l5-5H5l5-5H7l5-5 5 5h-3l5 5h-3l5 5h-7v3z", "balloon": "M13.16 12.74 14 14h-1.5c-.15 2.71-.5 5.41-1 8.08l-1-.16c.5-2.62.84-5.26 1-7.92H10l.84-1.26C8.64 11.79 7 8.36 7 6a5 5 0 0 1 5-5 5 5 0 0 1 5 5c0 2.36-1.64 5.79-3.84 6.74", "champagne": "M8 2h8c-.33 3-.67 6-1.25 7.83-.58 1.84-1.42 2.5-1.83 4.25-.42 1.75-.42 4.59.16 5.92.59 1.33 1.75 1.17 2.34 1.25.58.08.58.42.58.75H8c0-.33 0-.67.58-.75.59-.08 1.75.08 2.34-1.25.58-1.33.58-4.17.16-5.92-.41-1.75-1.25-2.41-1.83-4.25C8.67 8 8.33 5 8 2m2 2c.07 1.03.15 2.07.24 3h3.52c.09-.93.17-1.97.24-3z", "candy": "M15.54 8.46c1.96 1.96 1.96 5.12 0 7.08s-5.12 1.96-7.07 0-1.97-5.12 0-7.08 5.11-1.96 7.07 0m3.93-3.91s-.97.12-2.04.81a5.24 5.24 0 0 0-1.5-2.94 4.03 4.03 0 0 0-1.1 3.92c1.39.36 2.47 1.44 2.83 2.83 1.12.3 2.68.15 3.92-1.1a5.25 5.25 0 0 0-2.9-1.49c.39-.58.7-1.25.79-2.03M4.53 19.45s.97-.12 2.04-.81c.15 1.04.65 2.09 1.5 2.94 1.25-1.24 1.4-2.8 1.1-3.92a3.94 3.94 0 0 1-2.83-2.83c-1.12-.3-2.68-.15-3.92 1.1.84.84 1.87 1.34 2.9 1.49-.39.58-.7 1.26-.79 2.03", "rose": "M3 13a9 9 0 0 0 9 9c0-5-4.03-9-9-9m9-7.5A2.5 2.5 0 0 1 14.5 8a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 9.5 8 2.5 2.5 0 0 1 12 5.5m-6.4 4.75a2.5 2.5 0 0 0 2.5 2.5c.53 0 1.02-.17 1.4-.44v.19A2.5 2.5 0 0 0 12 15a2.5 2.5 0 0 0 2.5-2.5v-.19c.38.27.87.44 1.4.44a2.5 2.5 0 0 0 2.5-2.5c0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.26 1.43-2.25a2.5 2.5 0 0 0-2.5-2.5c-.53 0-1.02.16-1.4.44V3.5A2.5 2.5 0 0 0 12 1a2.5 2.5 0 0 0-2.5 2.5v.19c-.38-.28-.87-.44-1.4-.44a2.5 2.5 0 0 0-2.5 2.5c0 .99.59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25M12 22a9 9 0 0 0 9-9c-5 0-9 4-9 9", "egg": "M6.89 6.36C8.23 3.91 10 2 12 2s3.77 1.91 5.11 4.36c-.85.21-1.61.71-2.11 1.41a3.71 3.71 0 0 0-5.2-.8c-.3.22-.58.49-.8.8-.5-.7-1.26-1.2-2.11-1.41M15 18.06l-3-3-3 3-3-3-1.27 1.27a7.504 7.504 0 0 0 9.11 5.43 7.53 7.53 0 0 0 5.43-5.43L18 15.06zm-6-2.12 3-3 3 3 3-3 1.5 1.5c-.13-2.31-.7-4.58-1.69-6.68-1.16.1-2.06 1.07-2.06 2.24h-1.5A2.25 2.25 0 0 0 12 7.75 2.25 2.25 0 0 0 9.75 10h-1.5c0-1.17-.9-2.14-2.06-2.24-.99 2.1-1.56 4.37-1.69 6.68l1.5-1.5z", "star": "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.45 4.73L5.82 21z", "croissant": "m22 19-3-2 3-2zm-7-4 4-6 3 4-4 3zM5 17l-3 2v-4zm4-2-3 1-4-3 3-4zm5-9 4 2-5 7h-2L6 8l4-2z", "pineapple": "M14.4 7.7C16.4 6.4 19 7 19 7c-1.8-2.4-3.9-2.3-5.4-1.8V5c1.1-1.6 3.3-1.5 3.3-1.5-1.6-1.4-3-1-3.9-.5-.5-1.2-1-2-1-2-.4.7-.7 1.4-1 2.1-.9-.6-2.4-1-4 .4 0 0 2.3 0 3.4 1.7C8.9 4.7 6.8 4.6 5 7c0 0 2.6-.6 4.6.7C7.5 8.9 6 11.7 6 15c0 4.4 2.7 8 6 8s6-3.6 6-8c0-3.3-1.5-6.1-3.6-7.3m1.4 9.1c-.1.4-.2.8-.4 1.2L14 16l-1.5 2 1.6 2.1c-.3.2-.5.4-.8.6L12 19l-1.3 1.7c-.3-.1-.6-.3-.8-.6l1.6-2.1-1.5-2-1.5 1.9c-.1-.4-.3-.8-.4-1.2L9.5 15l-1.3-1.8c.1-.4.2-.8.4-1.2l1.4 2 1.5-2-1.6-2.1c.3-.2.5-.4.8-.6L12 11l1.3-1.7c.3.1.6.3.8.6L12.5 12l1.5 2 1.5-1.9c.1.4.3.8.4 1.2L14.5 15zM12 13l1.5 2-1.5 2-1.5-2z", "party": "m14.53 1.45-1.08 1.08 1.6 1.6q.33.375.33.87c0 .495-.11.64-.33.86L11.5 9.47l1 1.08 3.63-3.61c.53-.59.79-1.24.79-1.94s-.26-1.36-.79-1.95zm-3.98 2.02L9.47 4.55l.61.56c.22.22.33.52.33.89s-.11.67-.33.89l-.61.56 1.08 1.08.56-.61c.53-.59.8-1.23.8-1.92 0-.72-.27-1.37-.8-1.97zM21 5.06c-.69 0-1.33.27-1.92.8l-5.63 5.64 1.08 1 5.58-5.56c.25-.25.55-.38.89-.38s.64.13.89.38l.61.61 1.03-1.08-.56-.61c-.59-.53-1.25-.8-1.97-.8M7 8 2 22l14-5zm12 3.06c-.7 0-1.34.27-1.94.8l-1.59 1.59 1.08 1.08 1.59-1.59c.25-.25.53-.38.86-.38s.63.13.88.38l1.62 1.59 1.05-1.03-1.6-1.64c-.59-.53-1.25-.8-1.95-.8", "snow": "m20.79 13.95-2.33.62-2-1.13v-2.88l2-1.13 2.33.62.52-1.93-1.77-.47.46-1.77-1.93-.52-.62 2.33-2 1.13L13 7.38V5.12l1.71-1.71L13.29 2 12 3.29 10.71 2 9.29 3.41 11 5.12v2.26L8.5 8.82l-2-1.13-.58-2.33L4 5.88l.47 1.77-1.77.47.52 1.93 2.33-.62 2 1.13v2.89l-2 1.13-2.33-.62-.52 1.93 1.77.47L4 18.12l1.93.52.62-2.33 2-1.13L11 16.62v2.26l-1.71 1.71L10.71 22 12 20.71 13.29 22l1.41-1.41-1.7-1.71v-2.26l2.5-1.45 2 1.13.62 2.33 1.88-.51-.47-1.77 1.77-.47zM9.5 10.56 12 9.11l2.5 1.45v2.88L12 14.89l-2.5-1.45z", "bell": "M21 19v1H3v-1l2-2v-6c0-3.1 2.03-5.83 5-6.71V4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.29c2.97.88 5 3.61 5 6.71v6zm-7 2a2 2 0 0 1-2 2 2 2 0 0 1-2-2m9.75-17.81-1.42 1.42A8.98 8.98 0 0 1 21 11h2c0-2.93-1.16-5.75-3.25-7.81M1 11h2c0-2.4.96-4.7 2.67-6.39L4.25 3.19A10.96 10.96 0 0 0 1 11", "candycane": "M10 10a2 2 0 0 1-2 2 2 2 0 0 1-2-2V8c0-.63.1-1.23.27-1.8L10 9.93zm2-8c.74 0 1.44.13 2.09.38L11.97 6c-.83 0-1.53.5-1.82 1.25L7.24 4.34A6 6 0 0 1 12 2m5.76 4.31L14 10.07V8c0-.38-.1-.73-.28-1.03l2.11-3.59a6 6 0 0 1 1.93 2.93m.24 6.78-4 4V12.9l4-4zM18 20a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09l4-4z", "ring": "M12 10 8 4.4 9.6 2h4.8L16 4.4zm3.5-3.2-1.2 1.7c2.2.9 3.7 3 3.7 5.5a6 6 0 0 1-6 6 6 6 0 0 1-6-6c0-2.5 1.5-4.6 3.7-5.5L8.5 6.8C5.8 8.1 4 10.8 4 14a8 8 0 0 0 8 8 8 8 0 0 0 8-8c0-3.2-1.8-5.9-4.5-7.2", "crown": "M5 16 3 5l5.5 5L12 4l3.5 6L21 5l-2 11zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14z", "music": "M21 3v12.5a3.5 3.5 0 0 1-3.5 3.5 3.5 3.5 0 0 1-3.5-3.5 3.5 3.5 0 0 1 3.5-3.5c.54 0 1.05.12 1.5.34V6.47L9 8.6v8.9A3.5 3.5 0 0 1 5.5 21 3.5 3.5 0 0 1 2 17.5 3.5 3.5 0 0 1 5.5 14c.54 0 1.05.12 1.5.34V6z", "sale": "m18.65 2.85.61 3.86 3.51 1.79L21 12l1.78 3.5-3.54 1.79-.61 3.86-3.89-.61-2.77 2.76-2.78-2.8-3.86.64-.62-3.89-3.49-1.78L3 11.97 1.23 8.5l3.51-1.81.61-3.83 3.87.64L12 .69l2.77 2.77zM9.5 7A1.5 1.5 0 0 0 8 8.5 1.5 1.5 0 0 0 9.5 10 1.5 1.5 0 0 0 11 8.5 1.5 1.5 0 0 0 9.5 7m5 7a1.5 1.5 0 0 0-1.5 1.5 1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0 1.5-1.5 1.5 1.5 0 0 0-1.5-1.5m-6.09 3L17 8.41 15.59 7 7 15.59z"};
var W=window.WYK||{};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};

/* ── texte : **gras** + retours à la ligne (jamais de HTML libre) ── */
function fmt(t){return esc(t).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}

/* ── visuels de remplacement (tant qu'aucune photo n'est ajoutée) ── */
var PAL=[['#7f1d1d','#ea580c'],['#9a3412','#f59e0b'],['#831843','#f43f5e'],['#14532d','#84cc16'],['#1e3a8a','#38bdf8'],['#581c87','#f472b6'],['#78350f','#fbbf24']];
function art(glyph,i,w,h,pal){
  var p=GLYPH[glyph]||GLYPH.food,c=pal&&pal[0]&&pal[1]?pal:PAL[(i||0)%PAL.length];w=w||800;h=h||600;
  var sv='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[1]+'"/></linearGradient><radialGradient id="b"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="'+w+'" height="'+h+'" fill="url(#a)"/><circle cx="'+w*0.82+'" cy="'+h*0.15+'" r="'+h*0.55+'" fill="url(#b)"/><circle cx="'+w*0.1+'" cy="'+h*0.95+'" r="'+h*0.4+'" fill="url(#b)" opacity=".5"/><g transform="translate('+(w*0.5-h*0.3)+' '+(h*0.2)+') scale('+(h*0.6/24)+')"><path d="'+p+'" fill="#000" opacity=".22" transform="translate(.4 .7)"/><path d="'+p+'" fill="#fff" opacity=".95"/></g></svg>';
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(sv)}
function img(b,glyph,i,w,h){return b.image_url||art(glyph||(b.props&&b.props.glyph)||'food',i,w,h,b.props&&[b.props.c1,b.props.c2])}

/* ── styles ── */
var CSS='\
.rb-sec{max-width:1240px;margin:0 auto;padding:clamp(34px,6vw,72px) 18px 0;position:relative}\
.rb-tag{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--red,#e8192c)}\
.rb-tag::before{content:"";width:22px;height:2px;background:currentColor;border-radius:2px}\
.rb-h{font:800 clamp(26px,4.4vw,44px)/1.06 var(--fd,"Bricolage Grotesque",system-ui,sans-serif);letter-spacing:-.03em;margin:10px 0 14px;color:var(--ink,#101010)}\
.rb-p{font-size:clamp(14.5px,1.6vw,16.5px);line-height:1.7;color:var(--t2,#4a4a44);margin:0}.rb-p strong{color:var(--ink,#101010)}\
.rb-btn{display:inline-flex;align-items:center;gap:10px;margin-top:20px;padding:14px 24px;border-radius:40px;background:var(--red,#e8192c);color:#fff;font-weight:700;font-size:14.5px;text-decoration:none;box-shadow:0 12px 28px rgba(232,25,44,.3);transition:.25s}\
.rb-btn:hover{transform:translateY(-2px);box-shadow:0 18px 36px rgba(232,25,44,.38)}.rb-btn.ghost{background:rgba(255,255,255,.16);backdrop-filter:blur(8px);box-shadow:none;border:1.5px solid rgba(255,255,255,.5)}\
/* diaporama */\
.rb-hero{max-width:1240px;margin:0 auto;padding:18px 18px 0}\
.rb-hs{position:relative;border-radius:clamp(22px,3vw,38px);overflow:hidden;height:clamp(380px,68vw,660px);background:#1a0a0a;box-shadow:0 34px 80px rgba(0,0,0,.28);isolation:isolate;touch-action:pan-y}\
.rb-sl{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity .9s ease,visibility .9s}.rb-sl.on{opacity:1;visibility:visible;z-index:2}\
.rb-sl>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.08);transition:transform 7s ease-out}.rb-sl.on>img{transform:scale(1)}\
.rb-sl::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,4,4,.86) 0,rgba(10,4,4,.55) 42%,rgba(10,4,4,.05) 78%),linear-gradient(0deg,rgba(10,4,4,.55),transparent 40%)}\
.rb-sc{position:absolute;z-index:3;left:clamp(22px,5vw,72px);bottom:clamp(40px,9vw,92px);max-width:min(560px,86%);color:#fff}\
.rb-sc .rb-tag{color:#ff8a94}.rb-sc .rb-h{color:#fff;font-size:clamp(32px,7vw,68px);margin:12px 0 14px}.rb-sc .rb-p{color:rgba(255,255,255,.86);font-size:clamp(14.5px,2vw,18px)}.rb-sc .rb-p strong{color:#fff}\
.rb-sl.on .rb-sc>*{animation:rbUp .8s cubic-bezier(.2,.8,.2,1) both}.rb-sl.on .rb-sc>*:nth-child(2){animation-delay:.1s}.rb-sl.on .rb-sc>*:nth-child(3){animation-delay:.2s}.rb-sl.on .rb-sc>*:nth-child(4){animation-delay:.3s}\
@keyframes rbUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}\
.rb-nav{position:absolute;z-index:5;right:clamp(16px,3vw,36px);bottom:clamp(18px,3vw,34px);display:flex;gap:10px;align-items:center}\
.rb-ar{width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.16);backdrop-filter:blur(10px);border:1.5px solid rgba(255,255,255,.4);color:#fff;display:grid;place-items:center;transition:.2s}.rb-ar:hover{background:#fff;color:#101010}.rb-ar svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}\
.rb-dots{position:absolute;z-index:5;left:clamp(22px,5vw,72px);bottom:clamp(18px,3vw,34px);display:flex;gap:8px}\
.rb-dots button{width:34px;height:5px;border-radius:5px;background:rgba(255,255,255,.35);overflow:hidden;padding:0;position:relative}.rb-dots button.on::after{content:"";position:absolute;inset:0;background:#fff;transform-origin:left;animation:rbBar 6s linear both}\
@keyframes rbBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}\
/* spécialités défilantes */\
.rb-mq{padding-bottom:6px}.rb-mqh{display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap}\
.rb-mqw{overflow:hidden;margin:26px -18px 0;padding:10px 0 26px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}\
.rb-mqt{display:flex;gap:20px;width:max-content;animation:rbMq var(--d,48s) linear infinite}.rb-mqw:hover .rb-mqt,.rb-mqw:focus-within .rb-mqt{animation-play-state:paused}\
@keyframes rbMq{to{transform:translateX(-50%)}}\
.rb-spec{position:relative;flex:none;width:clamp(190px,24vw,270px);aspect-ratio:3/4;border-radius:28px;overflow:hidden;background:#222;box-shadow:0 18px 40px rgba(0,0,0,.2);transition:transform .35s cubic-bezier(.2,.8,.2,1)}\
.rb-spec:hover{transform:translateY(-8px) rotate(-1deg)}.rb-spec img{width:100%;height:100%;object-fit:cover;display:block}\
.rb-spec::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(10,4,4,.88),transparent 58%)}\
.rb-spec div{position:absolute;z-index:2;left:18px;right:18px;bottom:18px;color:#fff}.rb-spec b{display:block;font:800 clamp(17px,2vw,21px)/1.15 var(--fd,system-ui);letter-spacing:-.02em}.rb-spec small{display:block;margin-top:5px;font-size:12.5px;opacity:.82;line-height:1.4}\
.rb-spec i{position:absolute;z-index:2;top:14px;left:14px;padding:5px 11px;border-radius:30px;background:var(--red,#e8192c);color:#fff;font:700 11px var(--fb,system-ui);font-style:normal}\
@media(prefers-reduced-motion:reduce){.rb-mqt{animation:none}.rb-mqw{overflow-x:auto}.rb-sl,.rb-sl>img{transition:none}.rb-sl.on .rb-sc>*{animation:none}}\
/* sections image + texte */\
.rb-split{display:grid;grid-template-columns:repeat(12,1fr);align-items:center}\
.rb-im{position:relative;grid-row:1;border-radius:clamp(22px,3vw,34px);overflow:hidden;aspect-ratio:5/4;box-shadow:0 30px 70px rgba(0,0,0,.24)}.rb-im img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s}.rb-split:hover .rb-im img{transform:scale(1.05)}\
.rb-im-w{position:relative;grid-row:1}.rb-im-w::before{content:"";position:absolute;inset:-18px;border-radius:40px;background:linear-gradient(140deg,rgba(232,25,44,.2),rgba(249,115,22,.16));transform:rotate(-3deg);z-index:0}.rb-im-w .rb-im{z-index:1}\
.rb-tx{grid-row:1;position:relative;background:var(--surface,#fff);border:1px solid var(--line,rgba(16,16,16,.08));border-radius:clamp(22px,3vw,32px);padding:clamp(24px,3.4vw,46px);box-shadow:0 24px 60px rgba(0,0,0,.14)}\
.rb-split.l .rb-im-w{grid-column:1/8}.rb-split.l .rb-tx{grid-column:7/13;z-index:3;margin-left:-40px}\
.rb-split.r .rb-im-w{grid-column:6/13;z-index:3}.rb-split.r .rb-tx{grid-column:1/8;z-index:1;padding-right:clamp(70px,9vw,130px)}\
@media(max-width:820px){.rb-split{display:block}.rb-im-w{margin:0 6px}.rb-tx{margin:-34px 0 0!important;padding:26px 22px!important}.rb-split.r{display:flex;flex-direction:column-reverse}.rb-split.r .rb-tx{margin:0 0 -34px!important;padding-bottom:50px!important}.rb-split.r .rb-im-w{margin:0 6px}}\
/* texte centré + bandeau */\
.rb-ct{text-align:center;max-width:780px;margin:0 auto}.rb-ct .rb-tag::before{display:none}\
.rb-bn{position:relative;border-radius:clamp(22px,3vw,36px);overflow:hidden;min-height:clamp(280px,40vw,420px);display:grid;place-items:center;text-align:center;padding:42px 22px;color:#fff;isolation:isolate}\
.rb-bn>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}.rb-bn::after{content:"";position:absolute;inset:0;background:rgba(10,4,4,.58);z-index:-1}\
.rb-bn .rb-h{color:#fff}.rb-bn .rb-p{color:rgba(255,255,255,.88);max-width:620px;margin:0 auto}.rb-bn .rb-tag{color:#ff8a94}\
/* mode éditeur */\
.rb-fab{position:fixed;z-index:80;left:16px;bottom:calc(88px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:9px;padding:13px 18px;border-radius:40px;background:#101010;color:#fff;font:700 13.5px var(--fb,system-ui);box-shadow:0 14px 34px rgba(0,0,0,.35);border:1.5px solid rgba(255,255,255,.18)}\
.rb-fab svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.rb-fab.on{background:var(--red,#e8192c)}\
.rb-ed{position:fixed;z-index:95;right:0;top:0;bottom:0;width:min(470px,100vw);background:var(--surface,#fff);color:var(--ink,#101010);box-shadow:-20px 0 60px rgba(0,0,0,.3);display:none;flex-direction:column;font-family:var(--fb,system-ui)}.rb-ed.on{display:flex}\
.rb-edh{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--line,rgba(0,0,0,.1))}.rb-edh b{font:800 16px var(--fd,system-ui);flex:1}\
.rb-edb{flex:1;overflow-y:auto;padding:14px 14px 90px;overscroll-behavior:contain}\
.rb-bt{padding:10px 16px;border-radius:12px;font-weight:700;font-size:13px;background:var(--red,#e8192c);color:#fff}.rb-bt.g{background:var(--s2,#efeeea);color:var(--ink,#101010)}.rb-bt.sm{padding:6px 10px;font-size:12px;border-radius:9px}.rb-bt.d{background:#ef4444}.rb-bt:disabled{opacity:.5}\
.rb-bk{border:1.5px solid var(--line,rgba(0,0,0,.1));border-radius:16px;margin-bottom:10px;background:var(--bg,#f6f5f2);overflow:hidden}.rb-bk.off{opacity:.55}\
.rb-bh{display:flex;align-items:center;gap:8px;padding:10px 11px;cursor:pointer}.rb-bh .ty{flex:none;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:4px 8px;border-radius:7px;background:var(--red-s,rgba(232,25,44,.1));color:var(--red,#e8192c)}.rb-bh .tt{flex:1;min-width:0;font-weight:700;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.rb-bf{display:none;padding:4px 12px 14px;border-top:1px solid var(--line,rgba(0,0,0,.08))}.rb-bk.open .rb-bf{display:block}\
.rb-bf label{display:block;font-size:11.5px;font-weight:700;color:var(--t2,#4a4a44);margin:12px 0 5px}\
.rb-bf input[type=text],.rb-bf textarea,.rb-bf select{width:100%;padding:11px 12px;border-radius:11px;border:1.5px solid var(--line,rgba(0,0,0,.12));background:var(--surface,#fff);color:inherit;font:500 14px var(--fb,system-ui);outline:0}.rb-bf textarea{min-height:92px;resize:vertical;line-height:1.5}\
.rb-bf input:focus,.rb-bf textarea:focus,.rb-bf select:focus{border-color:var(--red,#e8192c)}\
.rb-tb{display:flex;gap:6px;margin:0 0 6px}.rb-tb button{padding:4px 11px;border-radius:8px;background:var(--s2,#efeeea);font-weight:800;font-size:13px}\
.rb-ip{display:flex;gap:10px;align-items:center}.rb-ip img{width:84px;height:62px;object-fit:cover;border-radius:11px;background:#ddd;flex:none}\
.rb-add{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}.rb-add button{padding:12px 8px;border-radius:13px;border:1.5px dashed var(--line,rgba(0,0,0,.18));font-weight:700;font-size:12.5px;color:var(--t2,#4a4a44);background:transparent}.rb-add button:hover{border-color:var(--red,#e8192c);color:var(--red,#e8192c)}\
.rb-edf{position:absolute;left:0;right:0;bottom:0;padding:12px 14px calc(12px + env(safe-area-inset-bottom));background:var(--surface,#fff);border-top:1px solid var(--line,rgba(0,0,0,.1));display:flex;gap:8px}.rb-edf .rb-bt{flex:1;padding:13px}\
.rb-msg{padding:11px 13px;border-radius:12px;background:rgba(217,119,6,.12);color:#b45309;font-size:12.5px;margin-bottom:10px;line-height:1.5}\
.rb-editing .rb-sec,.rb-editing .rb-hero{outline:2px dashed rgba(232,25,44,.0)}\
body.rb-editing{padding-right:0}@media(min-width:1100px){body.rb-editing .rb-sec,body.rb-editing .rb-hero{margin-right:calc(max(0px,(100vw - 1240px)/2) > 470px ? auto : 0)}}\
';

var TYPES={slide:'Diapo (haut de page)',spec:'Spécialité défilante',split_left:'Image à gauche + texte',split_right:'Image à droite + texte',text:'Texte centré',banner:'Bandeau image',products:'Liste de produits'};
var ICO={prev:'<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',next:'<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',pen:'<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',arrow:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'};

function injectCss(){if(document.getElementById('rb-css'))return;var s=document.createElement('style');s.id='rb-css';s.textContent=CSS;document.head.appendChild(s)}

/* ═════════ rendu public ═════════ */
function btnHtml(b,cls){return b.button_text?'<a class="rb-btn '+(cls||'')+'" href="'+esc(b.button_url||'#')+'">'+esc(b.button_text)+ICO.arrow+'</a>':''}
function renderSlides(L){
  var h='<div class="rb-hero"><div class="rb-hs" id="rb-hs">';
  L.forEach(function(b,i){h+='<div class="rb-sl'+(i===0?' on':'')+'"><img src="'+esc(img(b,(b.props&&b.props.glyph)||['chef-hat','cocktail','cupcake'][i%3],i,1600,900))+'" alt="'+esc(b.title||'')+'"'+(i?' loading="lazy"':'')+'><div class="rb-sc">'+(b.props&&b.props.tag?'<span class="rb-tag">'+esc(b.props.tag)+'</span>':'<span></span>')+'<h2 class="rb-h">'+esc(b.title||'')+'</h2>'+(b.body?'<p class="rb-p">'+fmt(b.body)+'</p>':'')+btnHtml(b)+'</div></div>'});
  if(L.length>1)h+='<div class="rb-dots">'+L.map(function(_,i){return'<button type="button" aria-label="Diapositive '+(i+1)+'"'+(i===0?' class="on"':'')+'></button>'}).join('')+'</div><div class="rb-nav"><button class="rb-ar" data-d="-1" aria-label="Précédent">'+ICO.prev+'</button><button class="rb-ar" data-d="1" aria-label="Suivant">'+ICO.next+'</button></div>';
  return h+'</div></div>'}
function wireSlider(root){
  var hs=$('#rb-hs',root);if(!hs||hs._w)return;hs._w=1;var S=$$('.rb-sl',hs),D=$$('.rb-dots button',hs),i=0,t=null;if(S.length<2)return;
  function go(n){i=(n+S.length)%S.length;S.forEach(function(s,k){s.classList.toggle('on',k===i)});D.forEach(function(d,k){d.classList.remove('on');if(k===i){void d.offsetWidth;d.classList.add('on')}});restart()}
  function restart(){clearInterval(t);t=setInterval(function(){if(!document.hidden)go(i+1)},6000)}
  hs.addEventListener('click',function(e){var a=e.target.closest('.rb-ar');if(a)go(i+(+a.getAttribute('data-d')));var d=e.target.closest('.rb-dots button');if(d)go(D.indexOf(d))});
  var x0=null;hs.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});hs.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50)go(i+(dx<0?1:-1))},{passive:true});
  restart()}
function renderSpecs(L,head){
  var cards=L.map(function(b,k){return'<article class="rb-spec" tabindex="0"><img src="'+esc(img(b,(b.props&&b.props.glyph)||['food-drumstick','fish','bowl-mix','pot-steam','cookie','hamburger','grill','cupcake'][k%8],k,600,800))+'" alt="'+esc(b.title||'')+'" loading="lazy">'+(b.props&&b.props.tag?'<i>'+esc(b.props.tag)+'</i>':'')+'<div><b>'+esc(b.title||'')+'</b>'+(b.body?'<small>'+esc(String(b.body).replace(/\*\*/g,'').slice(0,90))+'</small>':'')+'</div></article>'}).join('');
  return'<section class="rb-sec rb-mq" id="specialites"><div class="rb-mqh"><div><span class="rb-tag">'+esc(head&&head.tag||'Notre carte')+'</span><h2 class="rb-h" style="margin-bottom:0">'+esc(head&&head.title||'Les spécialités de la maison')+'</h2></div></div><div class="rb-mqw"><div class="rb-mqt" style="--d:'+Math.max(30,L.length*8)+'s">'+cards+cards+'</div></div></section>'}
function renderSplit(b,left){
  var tag=b.props&&b.props.tag?'<span class="rb-tag">'+esc(b.props.tag)+'</span>':'';
  var im='<div class="rb-im-w"><div class="rb-im"><img src="'+esc(img(b,(b.props&&b.props.glyph)||(left?'chef-hat':'cake-variant'),left?1:3,1000,800))+'" alt="'+esc(b.title||'')+'" loading="lazy"></div></div>';
  var tx='<div class="rb-tx">'+tag+'<h2 class="rb-h">'+esc(b.title||'')+'</h2>'+(b.body?'<p class="rb-p">'+fmt(b.body)+'</p>':'')+btnHtml(b)+'</div>';
  return'<section class="rb-sec"><div class="rb-split '+(left?'l':'r')+'">'+(left?im+tx:tx+im)+'</div></section>'}
function renderText(b){return'<section class="rb-sec"><div class="rb-ct">'+(b.props&&b.props.tag?'<span class="rb-tag">'+esc(b.props.tag)+'</span>':'')+'<h2 class="rb-h">'+esc(b.title||'')+'</h2>'+(b.body?'<p class="rb-p">'+fmt(b.body)+'</p>':'')+btnHtml(b)+'</div></section>'}
function renderBanner(b,i){return'<section class="rb-sec"><div class="rb-bn"><img src="'+esc(img(b,(b.props&&b.props.glyph)||'gift',i||2,1600,700))+'" alt="" loading="lazy"><div>'+(b.props&&b.props.tag?'<span class="rb-tag">'+esc(b.props.tag)+'</span>':'')+'<h2 class="rb-h">'+esc(b.title||'')+'</h2>'+(b.body?'<p class="rb-p">'+fmt(b.body)+'</p>':'')+btnHtml(b,'')+'</div></div></section>'}

/* ═════════ montage ═════════ */
var ST={page:null,root:null,blocks:[],defaults:[],renderers:{},db:null,isAdmin:false,virtual:false,dirty:false,deleted:[],open:{},ed:null,fab:null,n:0,onRendered:null,specHead:null};

function sorted(){return ST.blocks.slice().sort(function(a,b){return(a.position||0)-(b.position||0)})}
function render(){
  var root=ST.root,vis=sorted().filter(function(b){return b.is_active!==false||ST.ed&&ST.ed.classList.contains('on')}),out='',doneSlide=false,doneSpec=false,slides=vis.filter(function(b){return b.type==='slide'}),specs=vis.filter(function(b){return b.type==='spec'});
  vis.forEach(function(b,i){
    if(b.type==='slide'){if(!doneSlide){out+=renderSlides(slides);doneSlide=true}return}
    if(b.type==='spec'){if(!doneSpec){out+=renderSpecs(specs,ST.specHead);doneSpec=true}return}
    if(b.type==='split_left')out+=renderSplit(b,true);
    else if(b.type==='split_right')out+=renderSplit(b,false);
    else if(b.type==='text')out+=renderText(b);
    else if(b.type==='banner')out+=renderBanner(b,i);
    else if(b.type==='products')out+='<div class="rb-prod-slot" data-bid="'+esc(b.id)+'"></div>';
  });
  root.innerHTML=out;wireSlider(root);
  $$('.rb-prod-slot',root).forEach(function(el){var b=ST.blocks.filter(function(x){return String(x.id)===el.getAttribute('data-bid')})[0];if(b&&ST.renderers.products)ST.renderers.products(b,el)});
  if(ST.onRendered)ST.onRendered(root);
  if(window.WYK&&WYK.reveal)try{WYK.reveal()}catch(e){}
}

async function load(){
  var rows=null;
  try{var r=await ST.db.from('page_blocks').select('*').eq('page',ST.page).order('position');if(!r.error)rows=r.data}catch(e){}
  if(rows&&rows.length){ST.blocks=rows;ST.virtual=false}
  else{ST.blocks=ST.defaults.map(function(d,i){return Object.assign({id:'new-'+(++ST.n),position:i,is_active:true,props:{}},d,{_new:true})});ST.virtual=true}
}

/* ═════════ éditeur ═════════ */
function newBlock(type){var d={slide:{title:'Nouveau titre',body:'Votre description ici.',props:{tag:'Nouveau'}},spec:{title:'Nouvelle spécialité',body:'Quelques mots sur ce plat.'},split_left:{title:'Titre de la section',body:'Racontez votre histoire, vos ingrédients, vos saveurs…',props:{tag:'Notre histoire'}},split_right:{title:'Titre de la section',body:'Racontez votre histoire, vos ingrédients, vos saveurs…',props:{tag:'Notre savoir-faire'}},text:{title:'Titre de la section',body:'Votre description.',props:{tag:''}},banner:{title:'Titre du bandeau',body:'Texte d\'accroche.',button_text:'Découvrir',button_url:'#',props:{tag:''}},products:{title:'Notre carte',body:'',props:{kind:'all'}}}[type]||{title:''};
  return Object.assign({id:'new-'+(++ST.n),page:ST.page,type:type,position:ST.blocks.length,is_active:true,props:{},_new:true},d)}
function markDirty(){ST.dirty=true;var s=$('#rb-save');if(s)s.textContent='Enregistrer ●'}
function fieldHtml(b){
  var h='<label>Type de section</label><select data-f="type">'+Object.keys(TYPES).filter(function(t){return t!=='products'||ST.renderers.products}).map(function(t){return'<option value="'+t+'"'+(b.type===t?' selected':'')+'>'+TYPES[t]+'</option>'}).join('')+'</select>';
  h+='<label>Petit libellé (au-dessus du titre)</label><input type="text" data-p="tag" value="'+esc(b.props&&b.props.tag||'')+'" placeholder="Ex : Fait maison">';
  h+='<label>Titre <small>(affiché en gras)</small></label><input type="text" data-f="title" value="'+esc(b.title||'')+'">';
  h+='<label>Description</label><div class="rb-tb"><button type="button" data-bold title="Mettre la sélection en gras">B</button></div><textarea data-f="body">'+esc(b.body||'')+'</textarea>';
  if(b.type!=='text'&&b.type!=='products'){h+='<label>Image</label><div class="rb-ip"><img src="'+esc(b.image_url||art('food',0,200,150))+'" alt=""><div style="flex:1"><button type="button" class="rb-bt g sm" data-up>Choisir / téléverser</button> <button type="button" class="rb-bt g sm" data-noimg>Retirer</button><input type="text" data-f="image_url" value="'+esc(b.image_url||'')+'" placeholder="ou coller un lien d\'image https://…" style="margin-top:7px"></div></div>'}
  if(b.type==='slide'||b.type==='split_left'||b.type==='split_right'||b.type==='banner'||b.type==='text'){h+='<label>Bouton (texte + lien)</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><input type="text" data-f="button_text" value="'+esc(b.button_text||'')+'" placeholder="Ex : Commander"><input type="text" data-f="button_url" value="'+esc(b.button_url||'')+'" placeholder="/restolakay#carte"></div>'}
  if(b.type==='products'){h+='<label>Produits affichés</label><select data-p="kind"><option value="all">Tout</option><option value="plat">Plats</option><option value="boisson">Boissons</option><option value="dessert">Desserts</option><option value="sucrerie">Sucreries</option><option value="fete">Spécial fêtes</option></select>'.replace('value="'+(b.props&&b.props.kind||'all')+'"','value="'+(b.props&&b.props.kind||'all')+'" selected')}
  return h}
function edList(){
  var L=sorted(),h='';
  if(ST.virtual)h+='<div class="rb-msg">Cette page affiche le contenu par défaut. Modifiez les sections puis appuyez sur <b>Enregistrer</b> : elles seront alors sauvegardées.</div>';
  L.forEach(function(b,i){
    h+='<div class="rb-bk'+(b.is_active===false?' off':'')+(ST.open[b.id]?' open':'')+'" data-id="'+esc(b.id)+'"><div class="rb-bh" data-tg><span class="ty">'+esc((TYPES[b.type]||b.type).split(' ')[0])+'</span><span class="tt">'+esc(b.title||'(sans titre)')+'</span><button type="button" class="rb-bt g sm" data-mv="-1" '+(i===0?'disabled':'')+'>↑</button><button type="button" class="rb-bt g sm" data-mv="1" '+(i===L.length-1?'disabled':'')+'>↓</button><button type="button" class="rb-bt g sm" data-vis title="Afficher / masquer">'+(b.is_active===false?'Masqué':'Visible')+'</button><button type="button" class="rb-bt d sm" data-del aria-label="Supprimer">✕</button></div><div class="rb-bf">'+(ST.open[b.id]?fieldHtml(b):'')+'</div></div>'});
  h+='<div class="rb-add">'+Object.keys(TYPES).filter(function(t){return t!=='products'||ST.renderers.products}).map(function(t){return'<button type="button" data-add="'+t+'">+ '+TYPES[t]+'</button>'}).join('')+'</div>';
  $('.rb-edb',ST.ed).innerHTML=h}
function find(id){return ST.blocks.filter(function(b){return String(b.id)===String(id)})[0]}
async function upload(file,b){
  if(!file)return;if(file.size>8*1048576){alert('Image trop lourde (8 Mo max).');return}
  var ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,''),path='pages/'+ST.page.replace(/[^a-z0-9]+/gi,'-')+'/'+Date.now()+'.'+ext;
  var up=await ST.db.storage.from(BUCKET).upload(path,file,{upsert:true,contentType:file.type});if(up.error){alert('Téléversement impossible : '+up.error.message);return}
  b.image_url=ST.db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;markDirty();edList();render()}
async function save(){
  var btn=$('#rb-save');btn.disabled=true;btn.textContent='Enregistrement…';
  try{
    var L=sorted();
    for(var i=0;i<ST.deleted.length;i++){var d=await ST.db.from('page_blocks').delete().eq('id',ST.deleted[i]);if(d.error)throw d.error}
    ST.deleted=[];
    for(var k=0;k<L.length;k++){
      var b=L[k],row={page:ST.page,type:b.type,title:b.title||null,body:b.body||null,image_url:b.image_url||null,button_text:b.button_text||null,button_url:b.button_url||null,position:k,is_active:b.is_active!==false,props:b.props||{},updated_at:new Date().toISOString()};
      var r=b._new?await ST.db.from('page_blocks').insert(row).select().single():await ST.db.from('page_blocks').update(row).eq('id',b.id).select().single();
      if(r.error)throw r.error;Object.assign(b,r.data);delete b._new}
    ST.virtual=false;ST.dirty=false;btn.textContent='Enregistré ✓';setTimeout(function(){btn.textContent='Enregistrer'},1600);edList()
  }catch(e){var m=(e&&e.message)||String(e);alert(/page_blocks|relation|does not exist/i.test(m)?'La table des sections n\'existe pas encore : exécutez WYK-SQL-partie6.sql dans Supabase.':'Échec de l\'enregistrement : '+m);btn.textContent='Enregistrer ●'}
  btn.disabled=false}
function buildEditor(){
  var fab=document.createElement('button');fab.className='rb-fab';fab.type='button';fab.innerHTML=ICO.pen+'<span>Mode éditeur</span>';document.body.appendChild(fab);ST.fab=fab;
  var ed=document.createElement('aside');ed.className='rb-ed';ed.setAttribute('aria-label','Éditeur de page');ed.innerHTML='<div class="rb-edh"><b>Mode éditeur</b><button type="button" class="rb-bt g sm" id="rb-close">Fermer</button></div><div class="rb-edb"></div><div class="rb-edf"><button type="button" class="rb-bt" id="rb-save">Enregistrer</button></div><input type="file" id="rb-file" accept="image/*" hidden>';document.body.appendChild(ed);ST.ed=ed;
  var cur=null;
  function openEd(){ed.classList.add('on');fab.classList.add('on');document.body.classList.add('rb-editing');edList();render()}
  function closeEd(){if(ST.dirty&&!confirm('Des modifications ne sont pas enregistrées. Fermer quand même ?'))return;ed.classList.remove('on');fab.classList.remove('on');document.body.classList.remove('rb-editing');if(ST.dirty){load().then(render)}ST.dirty=false;render()}
  fab.onclick=function(){ed.classList.contains('on')?closeEd():openEd()};
  $('#rb-close',ed).onclick=closeEd;$('#rb-save',ed).onclick=save;
  var deb;function live(){clearTimeout(deb);deb=setTimeout(render,250)}
  ed.addEventListener('input',function(e){var bk=e.target.closest('.rb-bk');if(!bk)return;var b=find(bk.getAttribute('data-id'));if(!b)return;
    var f=e.target.getAttribute('data-f'),p=e.target.getAttribute('data-p');
    if(f){b[f]=e.target.value;if(f==='title'){var t=$('.tt',bk);if(t)t.textContent=b.title||'(sans titre)'}}
    if(p){b.props=b.props||{};b.props[p]=e.target.value}
    markDirty();live()});
  ed.addEventListener('change',function(e){var bk=e.target.closest('.rb-bk');if(!bk)return;var b=find(bk.getAttribute('data-id'));if(!b)return;if(e.target.getAttribute('data-f')==='type'){b.type=e.target.value;markDirty();edList();render()}});
  ed.addEventListener('click',function(e){
    var add=e.target.closest('[data-add]');if(add){var nb=newBlock(add.getAttribute('data-add'));ST.blocks.push(nb);ST.open[nb.id]=true;markDirty();edList();render();var el=$('.rb-bk[data-id="'+nb.id+'"]',ed);if(el)el.scrollIntoView({behavior:'smooth',block:'center'});return}
    var bk=e.target.closest('.rb-bk');if(!bk)return;var b=find(bk.getAttribute('data-id'));if(!b)return;
    if(e.target.closest('[data-mv]')){var L=sorted(),i=L.indexOf(b),j=i+(+e.target.closest('[data-mv]').getAttribute('data-mv'));if(j<0||j>=L.length)return;var tmp=L[i];L[i]=L[j];L[j]=tmp;L.forEach(function(x,k){x.position=k});markDirty();edList();render();return}
    if(e.target.closest('[data-vis]')){b.is_active=b.is_active===false;markDirty();edList();render();return}
    if(e.target.closest('[data-del]')){if(!confirm('Supprimer cette section ?'))return;ST.blocks=ST.blocks.filter(function(x){return x!==b});if(!b._new)ST.deleted.push(b.id);markDirty();edList();render();return}
    if(e.target.closest('[data-bold]')){var ta=$('textarea[data-f=body]',bk),s=ta.selectionStart,en=ta.selectionEnd;if(s===en)return;ta.value=ta.value.slice(0,s)+'**'+ta.value.slice(s,en)+'**'+ta.value.slice(en);b.body=ta.value;markDirty();render();return}
    if(e.target.closest('[data-up]')){cur=b;$('#rb-file',ed).value='';$('#rb-file',ed).click();return}
    if(e.target.closest('[data-noimg]')){b.image_url=null;markDirty();edList();render();return}
    if(e.target.closest('[data-tg]')&&!e.target.closest('button')){ST.open[b.id]=!ST.open[b.id];edList()}});
  $('#rb-file',ed).addEventListener('change',function(){var f=this.files[0];if(f&&cur)upload(f,cur)});
  window.addEventListener('beforeunload',function(e){if(ST.dirty){e.preventDefault();e.returnValue=''}});
  if(/[?&]edit=1/.test(location.search))openEd()}

async function mount(o){
  injectCss();
  ST.page=o.page;ST.root=typeof o.root==='string'?$(o.root):o.root;ST.defaults=o.defaults||[];ST.renderers=o.renderers||{};ST.onRendered=o.onRendered;ST.specHead=o.specHead||null;
  if(W.ensureDb)await W.ensureDb();ST.db=W.db||null;
  if(ST.db)await load();else{ST.blocks=ST.defaults.map(function(d,i){return Object.assign({id:'new-'+(++ST.n),position:i,is_active:true,props:{}},d,{_new:true})});ST.virtual=true}
  render();
  try{var s=await ST.db.auth.getSession();ST.isAdmin=!!(s&&s.data&&s.data.session&&s.data.session.user&&s.data.session.user.id===ADMIN_UID)}catch(e){}
  if(ST.isAdmin)buildEditor();
  return{render:render,isAdmin:ST.isAdmin}}
window.WYKBlocks={mount:mount,art:art,fmt:fmt,esc:esc,injectCss:injectCss,glyph:GLYPH};
})();
