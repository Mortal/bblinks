import os
import re
import json
import logging
import argparse
import html5lib
import requests
# import xml.etree.ElementTree


logger = logging.getLogger('bblinks')


def configure_logging(quiet):
    handlers = []
    handlers.append(logging.FileHandler('scrape.log', 'a'))
    if not quiet:
        handlers.append(logging.StreamHandler(None))
    fmt = '[%(asctime)s %(levelname)s] %(message)s'
    datefmt = None
    formatter = logging.Formatter(fmt, datefmt, '%')
    for handler in handlers:
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    logger.setLevel(logging.DEBUG)


def get_filters(args):
    filename = 'filters.json'
    if args.cached:
        with open(filename) as fp:
            return json.load(fp)
    else:
        url = 'http://kursuskatalog.au.dk/'
        logger.debug('Retrieve %r', url)
        r = requests.get(url)
        logger.debug('%d bytes', len(r.content))
        with open('kursuskatalog.html', 'w') as fp:
            fp.write(r.content.decode(r.encoding))
        document = html5lib.parse(r.content, encoding=r.encoding)

    ns = {'h': 'http://www.w3.org/1999/xhtml'}

    path = ".//*[@class='au_coursecatalog_filter']"
    filterElements = document.findall(path, ns)
    filters = []
    for f in filterElements:
        path = ".//*[@class='au_coursecatalog_filterParameter']"
        filterParameter = f.find(path, ns)
        filterParameter = ''.join(filterParameter.itertext())
        path = ".//*[@class='au_coursecatalog_filterSearchAreaElement']"
        optionElements = f.findall(path, ns)
        options = []
        for o in optionElements:
            path = ".//*[@class='au_coursecatalog_filterSearchAreaElementName']"
            n = ''.join(o.find(path, ns).itertext())
            path = ".//*[@class='au_coursecatalog_filterSearchAreaElementValue']"
            v = ''.join(o.find(path, ns).itertext())
            options.append((n, v))
        filters.append((filterParameter, options))
    with open(filename, 'w') as fp:
        json.dump(filters, fp, indent=2)
    return filters


def get_courses(args, parameter, value):
    filename = 'courses-%s-%s.json' % (parameter, value)
    if args.cached and os.path.exists(filename):
        with open(filename) as fp:
            return json.load(fp)

    url = (
        'http://kursuskatalog.au.dk/coursecatalog/Course/ajaxsearch/' +
        '?tx_aucoursecatalog_pi1[%s]=%s') % (parameter, value)
    logger.debug('Retrieve %r', url)
    r = requests.get(url)
    logger.debug('%d bytes', len(r.content))
    document = html5lib.parse(r.content, encoding=r.encoding)
    ns = {'h': 'http://www.w3.org/1999/xhtml'}
    path = ".//h:tbody/h:tr"
    rows = document.findall(path, ns)
    courses = []
    for row in rows:
        path = "./h:td"
        cells = row.findall(path, ns)
        cellTexts = [' '.join(''.join(cell.itertext()).split())
                     for cell in cells]
        courseCell = cells[0]
        path = './h:a'
        courseLink = courseCell.find(path, ns)
        coursePath = courseLink.get('href')
        course = dict(zip(
            'courseName level ects period courseLanguage institut'.split(),
            cellTexts))
        course['link'] = coursePath
        courses.append(course)
    with open(filename, 'w') as fp:
        json.dump(courses, fp, indent=2)
    return courses


def start_bb_session():
    url = 'https://bb.au.dk/webapps/blackboard/execute/viewCatalog?type=Course'
    bb_session = requests.Session()
    logger.debug('GET %r to start session', url)
    r = bb_session.get(url)
    logger.debug('%d bytes, %d redirects', len(r.content), len(r.history))
    return bb_session


def search_bb_courses(bb_session, name):
    url = 'https://bb.au.dk/webapps/blackboard/execute/viewCatalog?type=Course'
    data = {
        'id': '',
        'type': 'Course',
        'command': 'NewSearch',
        'searchField': 'CourseName',
        'searchOperator': 'StartsWith',
        'searchText': name,
        'dateSearchOperator': 'LessThan',
        'dateSearchDate_datetime': '2019-6-25+10:4:00',
        'pickdate': '',
        'pickname': '',
        'dateSearchDate_date': '25/06/2019'
    }
    logger.debug('POST %r to search for %r', url, name)
    r = bb_session.post(url, data=data)
    logger.debug('%d bytes', len(r.content))
    with open('bbsearch.html', 'w') as fp:
        fp.write(r.content.decode(r.encoding))
    document = html5lib.parse(r.content, encoding=r.encoding)
    ns = {'h': 'http://www.w3.org/1999/xhtml'}
    path = ".//*[@id='listContainer_databody']/h:tr"
    rows = document.findall(path, ns)
    courses = []
    for row in rows:
        path = "./h:th"
        ths = row.findall(path, ns)
        if len(ths) != 1:
            print("Wrong number of <TH>: %d" % len(ths))
            continue
        path = "./h:td"
        tds = row.findall(path, ns)
        if len(tds) != 4:
            print("Wrong number of <TD>: %d" % len(tds))
            continue
        path = './h:a'
        linkElement = ths[0].find(path, ns)
        coursePath = linkElement.get('href')
        o = re.search(r'course_id%3D(_\d+_\d+)', coursePath)
        if o is None:
            raise ValueError("Could not find course id in: %r" % (coursePath,))
        course_id = o.group(1)
        texts = [' '.join(''.join(o.itertext()).split())
                 for o in list(ths) + list(tds)]
        course = {
            'course_id': course_id,
            'bbtag': texts[0],
            'name': texts[1],
            'instructors': texts[2],
        }
        courses.append(course)
    return courses


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--quiet', action='store_true')
    parser.add_argument('--cached', action='store_true')
    parser.add_argument('--education')
    parser.add_argument('--term', default='2015S')
    args = parser.parse_args()
    configure_logging(quiet=args.quiet)
    filters = get_filters(args)
    filters = {
        parameter: {
            name: value
            for name, value in options
        }
        for parameter, options in filters
    }
    filterParameter = 'relatedEducations'
    try:
        filterValue = filters[filterParameter][args.education]
    except KeyError:
        print("Pick an education among:\n%s\n\n%r is not a valid education." %
              ('\n'.join(sorted(filters[filterParameter].keys())),
               args.education))
        raise SystemExit(1)
    courses = get_courses(args, filterParameter, filterValue)
    periods = (
        "Kvarter 3 + Kvarter 4 2015",
        "Kvarter 3 2015",
        "Kvarter 4 2015",
    )
    current_courses = [
        course for course in courses
        if course['period'] in periods
    ]
    filename = 'bb_courses_%s.json' % args.term
    if args.cached and os.path.exists(filename):
        with open(filename) as fp:
            bb_courses = json.load(fp)
    else:
        bb_session = start_bb_session()
        bb_courses = []
        for course in current_courses:
            name = course['courseName']
            name = re.sub(r' \(?Q\d(\+Q\d)?\)?$', '', name).strip()
            c = search_bb_courses(bb_session, name)
            bb_courses.append((name, c))
        with open(filename, 'w') as fp:
            json.dump(bb_courses, fp, indent=2)

    bb_courses_dict = {}
    for course_name, bb in bb_courses:
        orig = len(bb)
        bb = [c for c in bb
              if c['bbtag'].startswith('BB-Cou-STADS-UUVA-')]
        if len(bb) != 1:
            print("%s: %s course(s) (originally %s)" %
                  (course_name, len(bb), orig))
        else:
            bb_courses_dict[course_name] = bb[0]

    for course in current_courses:
        name = course['courseName']
        o = re.match(r'(.*) \(?(Q\d(?:\+Q\d)?)\)?$', name)
        if o is not None:
            name = o.group(1).strip()
        if name not in bb_courses_dict:
            print("// No course: %r" % (name,))
            continue
        term = course['period'].replace('Kvarter ', 'Q').replace(' 2015', '')
        bb = bb_courses_dict[name]
        o = re.search(r'\[(\d+U\d+)\]', bb['name'])
        uva = o.group(1)
        bbid = bb['course_id']
        o = re.fullmatch(r'coursecatalog/Course/show/(\d+)/', course['link'])
        ccid = o.group(1)
        print("  {'name': '%s', 'UVA': '%s'," % (name, uva))
        print("   'bb': [{'term': '2015, %s', 'id': '%s'}]," % (term, bbid))
        print("   'cc': [{'term': '2015, %s', 'id': '%s'}]}," % (term, ccid))



if __name__ == "__main__":
    main()
