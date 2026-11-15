import {wideLayout} from './responsive-layout.js?v=repair7';
import {prepareScene,syncScenes} from './scene-media.js?v=repair7';
export function klingAuthorFormat(){return innerHeight>innerWidth?(innerWidth<=600?'phone':'tablet'):'desktop';}
export function klingAuthorPoster(){return wideLayout.matches?'assets/approved/about-wide-clean.jpg':'assets/approved/author.jpg';}
export function prepareKlingAuthor(){prepareScene('author');prepareScene('library');}
export function syncKlingAuthor(state,enabled=true,turning=false){syncScenes(state,enabled,turning);}
