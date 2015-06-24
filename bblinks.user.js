// ==UserScript==
// @name        BlackBoard links in course catalogue
// @namespace   http://users-cs.au.dk/rav/
// @description BlackBoard links in course catalogue
// @include     http://kursuskatalog.au.dk/coursecatalog/Course/show/*/
// @version     0.1pre1
// @grant       GM_xmlhttpRequest
// @grant       GM_log
// @updateURL   https://github.com/Mortal/bblinks/raw/stable/bblinks.user.js
// ==/UserScript==

var courses = [
  {'name': 'Statisk analyse', 'UVA': '220142U027',
   'bb': [{'term': '2015, Q4', 'id': '_33636_1'}],
   'cc': [{'term': '2015, Q4', 'id': '56255'}]},
  {'name': 'Machine Learning in Bioinformatics', 'UVA': '220142U022',
   'bb': [{'term': '2015, Q3', 'id': '_33631_1'}],
   'cc': [{'term': '2015, Q3', 'id': '56248'}]},
  {'name': 'Eksperimentel systemudvikling', 'UVA': '220112U032',
   'bb': [{'term': '2015, Q3 + Q4', 'id': '_33613_1'}],
   'cc': [{'term': '2015, Q3 + Q4', 'id': '54382'}]},
  {'name': 'Optimering', 'UVA': '220112U069',
   'bb': [{'term': '2015, Q3', 'id': '_33616_1'}],
   'cc': [{'term': '2015, Q3', 'id': '54377'}]},
  {'name': 'Konvekse mængder', 'UVA': '250141U012',
   'bb': [{'term': '2015, Q4', 'id': '_33912_1'}],
   'cc': [{'term': '2015, Q4', 'id': '56597'}]},
  {'name': 'Informationsteknologiens og datalogiens videnskabsteori og etik', 'UVA': '220141U009',
   'bb': [{'term': '2015, Q3', 'id': '_33624_1'}],
   'cc': [{'term': '2015, Q3', 'id': '56758'}]},
  {'name': 'Emner inden for diskret geometri', 'UVA': '220142U024',
   'bb': [{'term': '2015, Q3 + Q4', 'id': '_33633_1'}],
   'cc': [{'term': '2015, Q3 + Q4', 'id': '56251'}]},
  {'name': 'IT Produktdesignprojekt', 'UVA': '220111U024',
   'bb': [{'term': '2015, Q4', 'id': '_33607_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54389'}]},
  {'name': 'Kombinatorisk Søgning', 'UVA': '220112U048',
   'bb': [{'term': '2015, Q4', 'id': '_33615_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54385'}]},
  {'name': 'Regularitet og Automater', 'UVA': '220111U038',
   'bb': [{'term': '2015, Q4', 'id': '_33610_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54375'}]},
  {'name': 'Lineær algebra', 'UVA': '250111U014',
   'bb': [{'term': '2015, Q3 + Q4', 'id': '_33881_1'}],
   'cc': [{'term': '2015, Q3 + Q4', 'id': '55309'}]},
  {'name': 'Matematisk analyse 2 (Følger og rækker af funktioner)', 'UVA': '250111U018',
   'bb': [{'term': '2015, Q4', 'id': '_33884_1'}],
   'cc': [{'term': '2015, Q4', 'id': '55311'}]},
  {'name': 'Programmeringssprog', 'UVA': '220111U037',
   'bb': [{'term': '2015, Q4', 'id': '_33609_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54374'}]},
  {'name': 'Sikkerhed', 'UVA': '220111U039',
   'bb': [{'term': '2015, Q4', 'id': '_33611_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54376'}]},
  {'name': 'Matematisk analyse 1 (Infinitesimalregning)', 'UVA': '250111U017',
   'bb': [{'term': '2015, Q3', 'id': '_33883_1'}],
   'cc': [{'term': '2015, Q3', 'id': '55310'}]},
  {'name': 'Internet of Things/Peer-Networking', 'UVA': '220142U018',
   'bb': [{'term': '2015, Q3', 'id': '_33628_1'}],
   'cc': [{'term': '2015, Q3', 'id': '54619'}]},
  {'name': 'Design af interaktive teknologier', 'UVA': '220142U029',
   'bb': [{'term': '2015, Q4', 'id': '_33638_1'}],
   'cc': [{'term': '2015, Q4', 'id': '56263'}]},
  {'name': 'Algorithm Engineering', 'UVA': '220122U038',
   'bb': [{'term': '2015, Q3', 'id': '_33618_1'}],
   'cc': [{'term': '2015, Q3', 'id': '54379'}]},
  {'name': 'Category Theory', 'UVA': '220142U030',
   'bb': [{'term': '2015, Q3 + Q4', 'id': '_33639_1'}],
   'cc': [{'term': '2015, Q3 + Q4', 'id': '57177'}]},
  {'name': 'Internet of Things/Peer-Project', 'UVA': '220142U019',
   'bb': [{'term': '2015, Q4', 'id': '_33629_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54620'}]},
  {'name': 'Designteori og -historie', 'UVA': '220111U011',
   'bb': [{'term': '2015, Q4', 'id': '_33603_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54390'}]},
  {'name': 'Webteknologi', 'UVA': '220141U006',
   'bb': [{'term': '2015, Q3', 'id': '_33622_1'}],
   'cc': [{'term': '2015, Q3', 'id': '54450'}]},
  {'name': 'Matematisk modellering 1', 'UVA': '250111U019',
   'bb': [{'term': '2015, Q3', 'id': '_33885_1'}],
   'cc': [{'term': '2015, Q3', 'id': '55348'}]},
  {'name': 'Indicering af disk-baserede data', 'UVA': '220142U002',
   'bb': [{'term': '2015, Q3', 'id': '_33625_1'}],
   'cc': [{'term': '2015, Q3', 'id': '51801'}]},
  {'name': 'Algoritmer og datastrukturer 1', 'UVA': '220141U008',
   'bb': [{'term': '2015, Q3', 'id': '_33623_1'}],
   'cc': [{'term': '2015, Q3', 'id': '56244'}]},
  {'name': 'Algoritmer og Datastrukturer 2', 'UVA': '220111U003',
   'bb': [{'term': '2015, Q4', 'id': '_33602_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54371'},
          {'term': '2014, Q4', 'id': '44594'}]},
  {'name': 'Social and Aesthetic Interaction', 'UVA': '220131U012',
   'bb': [{'term': '2015, Q3 + Q4', 'id': '_33620_1'}],
   'cc': [{'term': '2015, Q3 + Q4', 'id': '54392'}]},
  {'name': 'Language-based Security', 'UVA': '220142U016',
   'bb': [{'term': '2015, Q4', 'id': '_33626_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54537'}]},
  {'name': 'Dynamiske algoritmer', 'UVA': '220142U028',
   'bb': [{'term': '2015, Q4', 'id': '_33637_1'}],
   'cc': [{'term': '2015, Q4', 'id': '56262'}]},
  {'name': 'Strengalgoritmer', 'UVA': '220142U023',
   'bb': [{'term': '2015, Q4', 'id': '_33632_1'}],
   'cc': [{'term': '2015, Q4', 'id': '56250'}]},
  {'name': 'Teknikker til funktionel programmering', 'UVA': '220142U021',
   'bb': [{'term': '2015, Q3', 'id': '_33630_1'}],
   'cc': [{'term': '2015, Q3', 'id': '56246'}]},
  {'name': 'Digital kontrol i en fysisk verden', 'UVA': '220142U026',
   'bb': [{'term': '2015, Q3 + Q4', 'id': '_33635_1'}],
   'cc': [{'term': '2015, Q3 + Q4', 'id': '56254'}]},
  {'name': 'Augmented Reality', 'UVA': '220112U009',
   'bb': [{'term': '2015, Q3', 'id': '_33612_1'}],
   'cc': [{'term': '2015, Q3', 'id': '54394'}]},
  {'name': 'Fysisk Design', 'UVA': '220111U014',
   'bb': [{'term': '2015, Q3', 'id': '_33605_1'}],
   'cc': [{'term': '2015, Q3', 'id': '54388'}]},
  {'name': 'Distribuerede Systemer', 'UVA': '220111U012',
   'bb': [{'term': '2015, Q4', 'id': '_33604_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54373'}]},
  {'name': 'Interaktionsdesign', 'UVA': '220111U018',
   'bb': [{'term': '2015, Q3', 'id': '_33606_1'}],
   'cc': [{'term': '2015, Q3', 'id': '54372'}]},
  {'name': 'Social and collaborative computing', 'UVA': '220122U001',
   'bb': [{'term': '2015, Q3', 'id': '_33617_1'}],
   'cc': [{'term': '2015, Q3', 'id': '54396'}]},
  null
]; courses.pop();

function get_cc_id() {
  var o = /coursecatalog\/Course\/show\/(\d+)\//.exec(location.href);
  if (o != null) return o[1];
  else return null;
}

function get_course_by_cc(cc) {
  var result = null;
  for (var i = 0; i < courses.length && result === null; ++i) {
    for (var j = 0; j < courses[i]['cc'].length && result === null; ++j) {
     if (courses[i]['cc'][j]['id'] === cc) result = courses[i];
    }
  }
  return result;
}

function get_course() {
  var cc = get_cc_id();
  if (cc === null) return null;
  else return get_course_by_cc(cc);
}

function add_container() {
  var insertionPoint = document.querySelector('.au_coursecatalog_top');
  var container = document.createElement('div');
  container.style.border = '1px solid #c4c4c4';
  container.style.borderWidth = '1px 0px 5px';
  container.style.padding = '10px 5px';
  container.style.marginBottom = '17px';
  container.style.backgroundColor = '#ddffcc';
  insertionPoint.parentNode.insertBefore(container, insertionPoint);
  return container;
}

function add_link(course, container) {
  if (course === null) {
    var bbsearchlink = (
      'https://bb.au.dk/webapps/portal/frameset.jsp?tab_tab_group_id=_2_1&' +
      'url=%2Fwebapps%2Fblackboard%2Fexecute%2FviewCatalog%3Ftype%3DCourse');
    container.innerHTML = (
      'Intet kendt link til BlackBoard. <a target="_blank" href="' + bbsearchlink + '">' +
      'Søg i BlackBoard</a>. <a target="_blank" href="javascript:void(0)">Tilføj link</a>.');
  } else {
    var bbcourselink = (
      'https://bb.au.dk/webapps/portal/frameset.jsp?tab_tab_group_id=_2_1&' +
      'url=%2Fwebapps%2Fblackboard%2Fexecute%2Flauncher%3Ftype%3DCourse' +
      '%26id%3D');
    var links = [];
    for (var i = 0; i < course['bb'].length; ++i) {
      links.push(
        '<a target="_blank" href="' + bbcourselink + course['bb'][i]['id'] +
        '">' + course['bb'][i]['term'] + '</a>');
    }
    container.innerHTML = (
      '<b>Find kurset på BlackBoard:</b> ' + links.join(', ') );
  }
}

function main() {
  var course = get_course();
  var container = add_container();
  add_link(course, container);
}

main();
