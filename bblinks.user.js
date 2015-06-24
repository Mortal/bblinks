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
  {'name': 'Algoritmer og datastrukturer 1', 'UVA': '220141U008',
   'bb': [{'term': '2015, Q3', 'id': '_33623_1'}],
   'cc': [{'term': '2015, Q3', 'id': '56244'}]},
  {'name': 'Algoritmer og Datastrukturer 2', 'UVA': '220111U003',
   'bb': [{'term': '2015, Q4', 'id': '_33602_1'}],
   'cc': [{'term': '2015, Q4', 'id': '54371'},
          {'term': '2014, Q4', 'id': '44594'}]},
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
